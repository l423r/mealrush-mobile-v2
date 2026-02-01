"""
Утилита для профилирования времени выполнения операций в E2E тестах.

Позволяет замерять время отдельных операций и выводить статистику
для оптимизации ожиданий в тестах.
"""
import time
from functools import wraps
from contextlib import contextmanager
from collections import defaultdict
import threading


class Timer:
    """Глобальный таймер для профилирования E2E тестов"""
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._init()
        return cls._instance
    
    def _init(self):
        """Инициализация"""
        self.timings = defaultdict(list)  # operation_name -> list of durations
        self.current_test = None
        self.test_timings = defaultdict(lambda: defaultdict(list))  # test_name -> operation -> durations
        self.enabled = True
    
    def reset(self):
        """Сброс всех замеров"""
        self.timings.clear()
        self.test_timings.clear()
        self.current_test = None
    
    def set_current_test(self, test_name):
        """Устанавливает текущий тест для группировки замеров"""
        self.current_test = test_name
    
    @contextmanager
    def measure(self, operation_name, category=None):
        """
        Контекстный менеджер для измерения времени операции.
        
        Usage:
            with timer.measure("click_button"):
                element.click()
        """
        if not self.enabled:
            yield
            return
            
        start = time.perf_counter()
        try:
            yield
        finally:
            duration = (time.perf_counter() - start) * 1000  # в миллисекундах
            
            full_name = f"{category}::{operation_name}" if category else operation_name
            self.timings[full_name].append(duration)
            
            if self.current_test:
                self.test_timings[self.current_test][full_name].append(duration)
            
            # Выводим если операция заняла больше 500мс
            if duration > 500:
                print(f"[TIMING] ⏱ {full_name}: {duration:.0f}ms")
    
    def record(self, operation_name, duration_ms, category=None):
        """Записывает время вручную (для замеров снаружи)"""
        if not self.enabled:
            return
            
        full_name = f"{category}::{operation_name}" if category else operation_name
        self.timings[full_name].append(duration_ms)
        
        if self.current_test:
            self.test_timings[self.current_test][full_name].append(duration_ms)
    
    def get_stats(self, operation_name=None):
        """Получает статистику по операции или по всем"""
        if operation_name:
            durations = self.timings.get(operation_name, [])
            if not durations:
                return None
            return {
                'count': len(durations),
                'total': sum(durations),
                'avg': sum(durations) / len(durations),
                'min': min(durations),
                'max': max(durations)
            }
        
        # Статистика по всем операциям
        stats = {}
        for name, durations in self.timings.items():
            if durations:
                stats[name] = {
                    'count': len(durations),
                    'total': sum(durations),
                    'avg': sum(durations) / len(durations),
                    'min': min(durations),
                    'max': max(durations)
                }
        return stats
    
    def print_summary(self, min_total_ms=100):
        """
        Выводит сводку по времени выполнения операций.
        
        Args:
            min_total_ms: Минимальное общее время для включения в отчет
        """
        stats = self.get_stats()
        if not stats:
            print("\n[TIMING] Нет замеров времени")
            return
        
        print("\n" + "="*80)
        print("📊 ПРОФИЛИРОВАНИЕ ВРЕМЕНИ ВЫПОЛНЕНИЯ")
        print("="*80)
        
        # Сортируем по общему времени (убывание)
        sorted_stats = sorted(stats.items(), key=lambda x: x[1]['total'], reverse=True)
        
        # Группируем по категориям
        categories = defaultdict(list)
        for name, data in sorted_stats:
            if data['total'] >= min_total_ms:
                if '::' in name:
                    cat, op = name.split('::', 1)
                    categories[cat].append((op, data))
                else:
                    categories['general'].append((name, data))
        
        total_time = sum(s['total'] for s in stats.values())
        
        for category, operations in categories.items():
            cat_total = sum(d['total'] for _, d in operations)
            print(f"\n📁 {category.upper()} (суммарно: {cat_total:.0f}ms, {cat_total/total_time*100:.1f}%)")
            print("-"*70)
            print(f"{'Операция':<40} {'Кол-во':>6} {'Сумма':>10} {'Средн':>8} {'Мин':>8} {'Макс':>8}")
            print("-"*70)
            
            for op_name, data in operations:
                print(f"{op_name:<40} {data['count']:>6} {data['total']:>9.0f}ms {data['avg']:>7.0f}ms {data['min']:>7.0f}ms {data['max']:>7.0f}ms")
        
        print("\n" + "="*80)
        print(f"⏱ ОБЩЕЕ ВРЕМЯ ЗАМЕРЕННЫХ ОПЕРАЦИЙ: {total_time:.0f}ms ({total_time/1000:.1f}s)")
        print("="*80)
        
        # Рекомендации
        self._print_recommendations(sorted_stats)
    
    def _print_recommendations(self, sorted_stats):
        """Выводит рекомендации по оптимизации"""
        recommendations = []
        
        for name, data in sorted_stats:
            # Долгие ожидания
            if 'wait' in name.lower() or 'timeout' in name.lower():
                if data['avg'] > 2000:
                    recommendations.append(f"⚠️ {name}: среднее ожидание {data['avg']:.0f}ms - возможно, таймаут слишком большой")
            
            # Частые операции с высоким временем
            if data['count'] > 5 and data['avg'] > 500:
                recommendations.append(f"⚠️ {name}: выполняется {data['count']} раз, в среднем {data['avg']:.0f}ms - потенциал оптимизации")
            
            # Sleep'ы
            if 'sleep' in name.lower() and data['total'] > 5000:
                recommendations.append(f"💡 {name}: суммарно {data['total']:.0f}ms на sleep - можно уменьшить")
        
        if recommendations:
            print("\n📋 РЕКОМЕНДАЦИИ ПО ОПТИМИЗАЦИИ:")
            print("-"*70)
            for rec in recommendations[:10]:  # Топ 10 рекомендаций
                print(f"  {rec}")
    
    def print_test_summary(self, test_name):
        """Выводит сводку для конкретного теста"""
        if test_name not in self.test_timings:
            return
        
        test_stats = self.test_timings[test_name]
        total = sum(sum(d) for d in test_stats.values())
        
        print(f"\n[TIMING] 📊 Тест '{test_name}': {total:.0f}ms ({total/1000:.1f}s)")
        
        # Топ-5 самых долгих операций
        sorted_ops = sorted(
            [(name, sum(durations)) for name, durations in test_stats.items()],
            key=lambda x: x[1],
            reverse=True
        )[:5]
        
        if sorted_ops:
            print(f"         Топ-5 операций: " + ", ".join(f"{n}={t:.0f}ms" for n, t in sorted_ops))


# Глобальный экземпляр таймера
timer = Timer()


def timed(operation_name=None, category=None):
    """
    Декоратор для измерения времени выполнения функции.
    
    Usage:
        @timed("login")
        def do_login(self):
            ...
        
        @timed(category="navigation")
        def navigate_to_profile(self):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            name = operation_name or func.__name__
            with timer.measure(name, category):
                return func(*args, **kwargs)
        return wrapper
    return decorator


def timed_wait(original_timeout):
    """
    Возвращает фактическое время ожидания (для анализа).
    
    Usage:
        start = time.time()
        element = wait.until(...)
        timer.record("wait_element", (time.time() - start) * 1000)
    """
    pass  # Используется через timer.record()


def timed_sleep(seconds, label=None):
    """
    Замена time.sleep() с профилированием.
    
    Usage:
        from utilities.timing import timed_sleep
        timed_sleep(0.5, "after_click")  # вместо time.sleep(0.5)
    
    Args:
        seconds: Время ожидания в секундах
        label: Опциональная метка для идентификации sleep
    """
    time.sleep(seconds)
    name = f"sleep({seconds}s)" if label is None else f"sleep({label}:{seconds}s)"
    timer.record(name, seconds * 1000, category="sleep")
