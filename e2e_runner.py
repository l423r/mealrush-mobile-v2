#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
E2E Test Runner for MealRush Mobile V2
Автоматизированный запуск среды для e2e тестирования и управление тестами.

Использование:
    python e2e_runner.py           - Запустить преднастройку и меню тестов
    python e2e_runner.py --skip    - Пропустить преднастройку, сразу к тестам
    python e2e_runner.py --stop    - Остановить все фоновые процессы

Базовый путь: C:\\mp\\mealrush-mobile-v2
"""

import os
import sys
import time
import subprocess
import signal
import re
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass
from enum import Enum, auto

# Константы
BASE_PATH = r"C:\mp\mealrush-mobile-v2"
E2E_PATH = os.path.join(BASE_PATH, "e2e_tests")
TESTS_PATH = os.path.join(E2E_PATH, "tests")

# Цвета для консоли (Windows)
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

# Включаем поддержку ANSI цветов в Windows
if sys.platform == 'win32':
    os.system('color')
    # Также включаем через ctypes для новых версий Windows
    try:
        import ctypes
        kernel32 = ctypes.windll.kernel32
        kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
    except:
        pass


def color_print(text: str, color: str = Colors.ENDC):
    """Печать с цветом"""
    print(f"{color}{text}{Colors.ENDC}")


def header_print(text: str):
    """Печать заголовка"""
    width = 70
    print()
    color_print("=" * width, Colors.CYAN)
    color_print(f"  {text}", Colors.BOLD + Colors.CYAN)
    color_print("=" * width, Colors.CYAN)
    print()


@dataclass
class TestCase:
    """Информация о тестовом случае"""
    id: str
    file: str
    class_name: str
    method: str
    description: str
    full_path: str


@dataclass
class TestGroup:
    """Группа тестов (класс)"""
    name: str
    file: str
    tests: List[TestCase]
    description: str


class ProcessManager:
    """Менеджер процессов для терминалов"""
    
    def __init__(self):
        self.processes: Dict[str, subprocess.Popen] = {}
        self.pids_file = os.path.join(BASE_PATH, ".e2e_pids")
    
    def start_cmd_process(self, name: str, command: str, cwd: str = BASE_PATH) -> bool:
        """Запустить команду в новом окне CMD"""
        try:
            # Используем start для открытия нового окна
            full_cmd = f'start "{name}" cmd /k "cd /d {cwd} && {command}"'
            process = subprocess.Popen(
                full_cmd,
                shell=True,
                cwd=cwd
            )
            self.processes[name] = process
            self._save_pid(name, process.pid)
            return True
        except Exception as e:
            color_print(f"✗ Ошибка запуска {name}: {e}", Colors.RED)
            return False
    
    def _save_pid(self, name: str, pid: int):
        """Сохранить PID процесса в файл"""
        pids = self._load_pids()
        pids[name] = pid
        with open(self.pids_file, 'w') as f:
            for n, p in pids.items():
                f.write(f"{n}:{p}\n")
    
    def _load_pids(self) -> Dict[str, int]:
        """Загрузить PIDs из файла"""
        pids = {}
        if os.path.exists(self.pids_file):
            try:
                with open(self.pids_file, 'r') as f:
                    for line in f:
                        if ':' in line:
                            name, pid = line.strip().split(':', 1)
                            pids[name] = int(pid)
            except:
                pass
        return pids
    
    def stop_all(self):
        """Остановить все процессы"""
        color_print("\n🛑 Остановка всех процессов...", Colors.YELLOW)
        
        # Останавливаем через taskkill
        processes_to_kill = [
            'appium',
            'node',  # для expo
        ]
        
        for proc_name in processes_to_kill:
            try:
                subprocess.run(
                    f'taskkill /F /IM {proc_name}.exe /T',
                    shell=True,
                    capture_output=True
                )
                color_print(f"  ✓ Остановлен: {proc_name}", Colors.GREEN)
            except:
                pass
        
        # Удаляем файл PIDs
        if os.path.exists(self.pids_file):
            os.remove(self.pids_file)
        
        color_print("✓ Все процессы остановлены", Colors.GREEN)


class TestDiscovery:
    """Обнаружение и парсинг тестов"""
    
    # Порядок файлов тестов
    TEST_FILES_ORDER = [
        'test_authentication.py',
        'test_profile.py',
        'test_account.py',
        'test_main_features.py',
        'test_meal_creation.py',
        'test_add_products_to_meal.py',
        'test_remove_products_from_meal.py',
        'test_update_product_quantities_in_meal.py',
        'test_onboarding_flow.py',
        'test_simple_login.py',
        'test_element_finding.py',
        'test_view_meal_history.py',
    ]
    
    # Описания групп тестов
    GROUP_DESCRIPTIONS = {
        'TestAuthentication': 'Аутентификация и регистрация',
        'TestProfile': 'Профиль пользователя',
        'TestAccount': 'Управление аккаунтом',
        'TestMainFeatures': 'Основные функции',
        'TestSearchFunctionality': 'Поиск продуктов',
        'TestMealCreation': 'Создание приемов пищи',
        'TestMealCreationViaAI': 'Создание приемов пищи через AI',
        'TestMealCreationValidation': 'Валидация создания приемов пищи',
        'TestAddProductsToMeal': 'Добавление продуктов в прием пищи',
        'TestRemoveProductsFromMeal': 'Удаление продуктов из приема пищи',
        'TestUpdateProductQuantities': 'Обновление количества продуктов в приеме пищи',
        'TestOnboardingFlow': 'Онбординг новых пользователей',
        'TestSimpleLogin': 'Простой вход',
        'TestMealHistorySetup': 'Подготовка тестов истории приемов пищи',
        'TestViewMealHistory': 'Просмотр истории приемов пищи за диапазон дат',
    }
    
    def __init__(self):
        self.groups: List[TestGroup] = []
        self.all_tests: List[TestCase] = []
        self._discover_tests()
    
    def _discover_tests(self):
        """Обнаружить все тесты"""
        test_id_counter = 1
        
        for test_file in self.TEST_FILES_ORDER:
            file_path = os.path.join(TESTS_PATH, test_file)
            if not os.path.exists(file_path):
                continue
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
            
            # Находим все классы и их позиции в файле
            class_positions = []  # [(line_num, class_name), ...]
            for i, line in enumerate(lines):
                class_match = re.match(r'^class\s+(\w+)\s*[:\(]', line)
                if class_match:
                    class_positions.append((i, class_match.group(1)))
            
            # Функция для определения класса по номеру строки
            def get_class_for_line(line_num: int) -> str:
                current_class = ''
                for pos, class_name in class_positions:
                    if pos <= line_num:
                        current_class = class_name
                    else:
                        break
                return current_class
            
            # Собираем тесты по классам
            class_tests: Dict[str, List[TestCase]] = {}
            
            for i, line in enumerate(lines):
                # Ищем методы тестов: поддерживаем как однострочные, так и многострочные определения
                # Паттерн 1: однострочное определение def test_XX_xxx(self, ...)
                match = re.match(r'\s*def\s+(test_\d+_\w+)\s*\(\s*self', line)
                
                # Паттерн 2: многострочное определение def test_XX_xxx(\n    self, ...)
                if not match:
                    match = re.match(r'\s*def\s+(test_\d+_\w+)\s*\(', line)
                    # Если нашли начало метода, проверяем следующие строки на наличие self
                    if match and i + 1 < len(lines):
                        # Проверяем до 3 следующих строк (на случай пустых строк)
                        found_self = False
                        for j in range(i + 1, min(i + 4, len(lines))):
                            next_line = lines[j].strip()
                            if next_line.startswith('self'):
                                found_self = True
                                break
                            if next_line and not next_line.startswith('#'):
                                # Если есть непустая строка, но не self, это не наш случай
                                break
                        if not found_self:
                            match = None
                
                if match:
                    method_name = match.group(1)
                    class_name = get_class_for_line(i)
                    
                    # Пропускаем классы без Test в имени или Setup классы
                    if not class_name or 'Setup' in class_name:
                        continue
                    
                    # Извлекаем docstring (ищем в следующих строках)
                    description = ""
                    for j in range(i + 1, min(i + 10, len(lines))):
                        if '"""' in lines[j]:
                            # Однострочный docstring
                            doc_match = re.search(r'"""(.+?)"""', lines[j])
                            if doc_match:
                                description = doc_match.group(1).strip()
                            else:
                                # Многострочный - ищем до закрывающего """
                                for k in range(j + 1, min(j + 20, len(lines))):
                                    if '"""' in lines[k]:
                                        description = lines[j].replace('"""', '').strip()
                                        break
                            break
                    
                    test_id = f"{test_id_counter:02d}"
                    test_case = TestCase(
                        id=test_id,
                        file=test_file,
                        class_name=class_name,
                        method=method_name,
                        description=description or method_name,
                        full_path=f"tests/{test_file}::{class_name}::{method_name}"
                    )
                    
                    if class_name not in class_tests:
                        class_tests[class_name] = []
                    class_tests[class_name].append(test_case)
                    self.all_tests.append(test_case)
                    test_id_counter += 1
            
            # Создаем группы для каждого класса
            for class_name, tests in class_tests.items():
                if tests:
                    group = TestGroup(
                        name=class_name,
                        file=test_file,
                        tests=tests,
                        description=self.GROUP_DESCRIPTIONS.get(class_name, test_file)
                    )
                    self.groups.append(group)
            
            # Также ищем standalone функции (не в классах)
            for i, line in enumerate(lines):
                match = re.match(r'^def\s+(test_\w+)\s*\(\s*driver', line)
                if match:
                    method_name = match.group(1)
                    
                    # Проверяем что это не внутри класса
                    class_name = get_class_for_line(i)
                    if class_name:
                        continue  # Это метод класса, пропускаем
                    
                    # Извлекаем docstring
                    description = ""
                    for j in range(i + 1, min(i + 5, len(lines))):
                        if '"""' in lines[j]:
                            doc_match = re.search(r'"""(.+?)"""', lines[j])
                            if doc_match:
                                description = doc_match.group(1).strip()
                            break
                    
                    test_id = f"{test_id_counter:02d}"
                    test_case = TestCase(
                        id=test_id,
                        file=test_file,
                        class_name='',
                        method=method_name,
                        description=description or method_name,
                        full_path=f"tests/{test_file}::{method_name}"
                    )
                    self.all_tests.append(test_case)
                    test_id_counter += 1
    
    def print_test_list(self):
        """Вывести список тестов"""
        header_print("📋 СПИСОК E2E ТЕСТОВ")
        
        current_file = None
        for group in self.groups:
            if current_file != group.file:
                current_file = group.file
                print()
                color_print(f"📁 {group.file}", Colors.BOLD + Colors.BLUE)
            
            color_print(f"  📦 {group.name} - {group.description}", Colors.CYAN)
            
            for test in group.tests:
                print(f"      {Colors.GREEN}[{test.id}]{Colors.ENDC} {test.method}")
                color_print(f"           {test.description[:60]}...", Colors.YELLOW) if len(test.description) > 60 else color_print(f"           {test.description}", Colors.YELLOW)
        
        # Standalone тесты
        standalone_tests = [t for t in self.all_tests if not t.class_name]
        if standalone_tests:
            print()
            color_print("📁 Standalone Tests", Colors.BOLD + Colors.BLUE)
            for test in standalone_tests:
                print(f"  {Colors.GREEN}[{test.id}]{Colors.ENDC} {test.file}::{test.method}")
        
        print()
    
    def get_test_by_id(self, test_id: str) -> Optional[TestCase]:
        """Получить тест по ID"""
        for test in self.all_tests:
            if test.id == test_id.zfill(2):
                return test
        return None
    
    def get_tests_from_id(self, start_id: str) -> List[TestCase]:
        """Получить тесты начиная с указанного ID"""
        start_num = int(start_id)
        return [t for t in self.all_tests if int(t.id) >= start_num]
    
    def get_group_tests(self, test: TestCase) -> List[TestCase]:
        """Получить все тесты из группы (класса) указанного теста"""
        if not test.class_name:
            return [test]
        
        for group in self.groups:
            if group.name == test.class_name:
                # Возвращаем тесты начиная с указанного
                start_idx = next((i for i, t in enumerate(group.tests) if t.id == test.id), 0)
                return group.tests[start_idx:]
        return [test]


class TestRunner:
    """Запуск тестов"""
    
    def __init__(self, discovery: TestDiscovery):
        self.discovery = discovery
    
    def build_single_test_cmd(self, test: TestCase, extra_flags: str = "") -> str:
        """Построить команду для одного теста"""
        # Формат: pytest tests/test_authentication.py::TestAuthentication::test_07_xxx -v -s
        if test.class_name:
            test_path = f"tests/{test.file}::{test.class_name}::{test.method}"
        else:
            test_path = f"tests/{test.file}::{test.method}"
        return f"pytest {test_path} -v -s {extra_flags}".strip()
    
    def build_class_test_cmd(self, class_name: str, file_name: str, extra_flags: str = "") -> str:
        """Построить команду для класса тестов"""
        # Формат: pytest tests/test_authentication.py::TestAuthentication -v -s
        test_path = f"tests/{file_name}::{class_name}"
        return f"pytest {test_path} -v -s {extra_flags}".strip()
    
    def build_file_test_cmd(self, file_name: str, extra_flags: str = "") -> str:
        """Построить команду для файла тестов"""
        # Формат: pytest tests/test_authentication.py -v -s
        test_path = f"tests/{file_name}"
        return f"pytest {test_path} -v -s {extra_flags}".strip()
    
    def build_pytest_command(self, tests: List[TestCase], extra_flags: str = "") -> str:
        """Построить команду pytest"""
        if len(tests) == 1:
            return self.build_single_test_cmd(tests[0], extra_flags)
        else:
            # Группировка тестов по файлу
            files = {t.file for t in tests}
            if len(files) == 1:
                test_path = f"tests/{tests[0].file}"
                # Добавляем -k для фильтрации
                test_names = " or ".join(t.method for t in tests)
                return f'pytest {test_path} -v -s -k "{test_names}" {extra_flags}'.strip()
            else:
                # Разные файлы - запускаем все тесты
                test_path = "tests/"
                return f"pytest {test_path} -v -s {extra_flags}".strip()
    
    def run_test(self, command: str) -> int:
        """Запустить pytest команду"""
        full_command = f'cd /d {E2E_PATH} && {command}'
        color_print(f"\n🚀 Выполнение: {command}", Colors.CYAN)
        color_print(f"   Рабочая директория: {E2E_PATH}", Colors.YELLOW)
        print()
        
        result = subprocess.run(
            full_command,
            shell=True,
            cwd=E2E_PATH
        )
        return result.returncode


class E2EManager:
    """Главный менеджер E2E тестирования"""
    
    def __init__(self):
        self.process_manager = ProcessManager()
        self.discovery = TestDiscovery()
        self.runner = TestRunner(self.discovery)
    
    def check_emulator_running(self) -> Tuple[bool, str]:
        """
        Проверить, запущен ли эмулятор и готов ли он.
        Returns: (is_ready, status) где status: 'online', 'offline', 'not_found'
        """
        try:
            result = subprocess.run(
                "adb devices",
                shell=True,
                capture_output=True,
                text=True
            )
            lines = result.stdout.strip().split('\n')
            # Первая строка - заголовок "List of devices attached"
            # Формат строк: "emulator-5554	device" или "emulator-5554	offline"
            for line in lines[1:]:
                line = line.strip()
                if not line:
                    continue
                
                parts = line.split('\t')
                if len(parts) >= 2:
                    device_name = parts[0]
                    device_status = parts[1].lower()
                    
                    if 'emulator' in device_name.lower() or device_name:
                        if device_status == 'device':
                            return (True, 'online')
                        elif device_status == 'offline':
                            return (False, 'offline')
                        elif device_status == 'unauthorized':
                            return (False, 'unauthorized')
            
            return (False, 'not_found')
        except Exception:
            return (False, 'error')
    
    def wait_for_emulator(self, timeout: int = 180) -> bool:
        """Ожидать запуска эмулятора с проверкой каждые 5 секунд"""
        color_print(f"\n⏳ Ожидание запуска эмулятора (макс. {timeout} сек)...", Colors.YELLOW)
        
        start_time = time.time()
        check_interval = 5
        last_status = None
        
        while time.time() - start_time < timeout:
            elapsed = int(time.time() - start_time)
            remaining = timeout - elapsed
            
            is_ready, status = self.check_emulator_running()
            
            # Показываем смену статуса
            if status != last_status:
                if status == 'offline':
                    color_print("\n   ⏳ Эмулятор обнаружен, но offline. Ожидание загрузки...", Colors.YELLOW)
                elif status == 'unauthorized':
                    color_print("\n   ⚠ Устройство требует авторизации. Подтвердите на устройстве.", Colors.YELLOW)
                last_status = status
            
            if is_ready:
                color_print(f"\n   ✓ Эмулятор готов! (online через {elapsed} сек)", Colors.GREEN)
                # Даем еще немного времени для полной загрузки системы
                color_print("   ⏳ Ожидание полной загрузки системы (15 сек)...", Colors.YELLOW)
                time.sleep(15)
                return True
            
            status_text = f"[{status}]" if status != 'not_found' else ""
            print(f"   Проверка... {status_text} осталось {remaining} сек    ", end='\r')
            time.sleep(check_interval)
        
        color_print(f"\n   ⚠ Эмулятор не готов за {timeout} сек (статус: {last_status})", Colors.YELLOW)
        return False
    
    def setup_environment(self):
        """Преднастройка окружения"""
        header_print("🔧 ПРЕДНАСТРОЙКА ОКРУЖЕНИЯ")
        
        # 1. Запуск Appium
        color_print("1️⃣  Запуск Appium сервера...", Colors.YELLOW)
        if self.process_manager.start_cmd_process("Appium", "appium", BASE_PATH):
            color_print("   ✓ Appium запущен в отдельном терминале", Colors.GREEN)
        time.sleep(3)
        
        # 2. Запуск Expo (с автоматическим запуском эмулятора через --android)
        color_print("2️⃣  Запуск Expo dev server (+ Android эмулятор)...", Colors.YELLOW)
        # Используем --android для автоматического запуска на Android эмуляторе
        if self.process_manager.start_cmd_process("Expo", "npx expo start --dev-client --android", BASE_PATH):
            color_print("   ✓ Expo запущен в отдельном терминале", Colors.GREEN)
            color_print("   ℹ Expo автоматически запустит эмулятор и приложение", Colors.CYAN)
        
        # 3. Умное ожидание эмулятора
        emulator_ready = self.wait_for_emulator(timeout=180)
        
        if not emulator_ready:
            color_print("\n⚠ Эмулятор не запустился автоматически.", Colors.YELLOW)
            color_print("  Попробуйте запустить эмулятор вручную и нажмите Enter...", Colors.YELLOW)
            input()
            # Проверяем еще раз
            is_ready, status = self.check_emulator_running()
            if is_ready:
                color_print("   ✓ Эмулятор обнаружен и готов!", Colors.GREEN)
            else:
                color_print(f"   ⚠ Продолжаем без подтверждения эмулятора (статус: {status})", Colors.YELLOW)
        
        # 4. Настройка ADB reverse в отдельном терминале
        color_print("\n3️⃣  Настройка ADB reverse...", Colors.YELLOW)
        # Запускаем в отдельном терминале с сохранением окна
        adb_cmd = "adb reverse tcp:8083 tcp:8083 && echo. && echo ADB reverse настроен успешно! && echo Порт 8083 перенаправлен. && echo. && pause"
        if self.process_manager.start_cmd_process("ADB-Reverse", adb_cmd, BASE_PATH):
            color_print("   ✓ ADB reverse запущен в отдельном терминале", Colors.GREEN)
        time.sleep(2)
        
        # Проверяем результат
        try:
            result = subprocess.run(
                "adb reverse --list",
                shell=True,
                capture_output=True,
                text=True
            )
            if "tcp:8083" in result.stdout:
                color_print("   ✓ ADB reverse tcp:8083 активен", Colors.GREEN)
            else:
                color_print("   ⚠ ADB reverse может быть не настроен, проверьте терминал", Colors.YELLOW)
        except:
            pass
        
        # Итоговый статус
        header_print("✅ ПРЕДНАСТРОЙКА ЗАВЕРШЕНА")
        color_print("Запущенные сервисы:", Colors.GREEN)
        color_print("  • Appium сервер (отдельный терминал)", Colors.CYAN)
        color_print("  • Expo dev server + Android (отдельный терминал)", Colors.CYAN)
        color_print("  • ADB reverse tcp:8083 (отдельный терминал)", Colors.CYAN)
        
        is_ready, status = self.check_emulator_running()
        if is_ready:
            color_print("\n📱 Статус эмулятора: ЗАПУЩЕН (online)", Colors.GREEN)
        elif status == 'offline':
            color_print("\n📱 Статус эмулятора: OFFLINE (загружается)", Colors.YELLOW)
        else:
            color_print(f"\n📱 Статус эмулятора: {status.upper()}", Colors.YELLOW)
        
        print()
    
    def show_help(self):
        """Показать справку по командам"""
        header_print("📖 СПРАВКА ПО КОМАНДАМ")
        
        commands = [
            ("l, list", "Показать список всех тестов"),
            ("<ID>", "Запустить с теста ID до конца всех тестов"),
            ("<ID> -o, --one", "Запустить только один тест с ID"),
            ("<ID> -g, --group", "Запустить тесты от ID до конца группы (класса)"),
            ("<ID> -x", "Запустить с теста ID, остановиться при первой ошибке"),
            ("f <file>", "Запустить все тесты из файла (например: f auth)"),
            ("c <class>", "Запустить все тесты класса (например: c auth)"),
            ("p <pytest_cmd>", "Выполнить произвольную pytest команду"),
            ("", ""),
            ("status", "Проверить статус эмулятора"),
            ("wait", "Ожидать запуска эмулятора (3 мин)"),
            ("adb", "Перенастроить ADB reverse"),
            ("setup", "Запустить преднастройку окружения заново"),
            ("kill", "Остановить все фоновые процессы (Appium, Expo)"),
            ("", ""),
            ("h, help", "Показать эту справку"),
            ("q, quit, exit", "Выход"),
        ]
        
        for cmd, desc in commands:
            color_print(f"  {Colors.GREEN}{cmd:20}{Colors.ENDC} {desc}")
        
        print()
        color_print("Примеры:", Colors.BOLD)
        color_print("  07 -o     - Запустить только тест 07", Colors.CYAN)
        color_print("  05 -g     - Запустить тесты 05-XX текущей группы", Colors.CYAN)
        color_print("  01 -x     - Запустить все тесты, остановка при ошибке", Colors.CYAN)
        color_print("  f auth    - Запустить все тесты test_authentication.py", Colors.CYAN)
        color_print("  c profile - Запустить все тесты класса TestProfile", Colors.CYAN)
        
        print()
        color_print("Управление окружением:", Colors.BOLD)
        color_print("  status    - Проверить, запущен ли эмулятор", Colors.CYAN)
        color_print("  wait      - Подождать запуска эмулятора (3 мин)", Colors.CYAN)
        color_print("  adb       - Перенастроить ADB reverse порт", Colors.CYAN)
        color_print("  setup     - Полная преднастройка заново", Colors.CYAN)
        print()
    
    def parse_command(self, user_input: str) -> Tuple[str, List[str]]:
        """Разобрать команду пользователя"""
        parts = user_input.strip().split()
        if not parts:
            return "", []
        
        command = parts[0].lower()
        args = parts[1:] if len(parts) > 1 else []
        return command, args
    
    def run_interactive(self):
        """Интерактивный режим работы"""
        self.discovery.print_test_list()
        self.show_help()
        
        while True:
            try:
                color_print("\n" + "=" * 50, Colors.BLUE)
                user_input = input(f"{Colors.CYAN}🧪 Введите команду: {Colors.ENDC}").strip()
                
                if not user_input:
                    continue
                
                command, args = self.parse_command(user_input)
                
                # Команды выхода
                if command in ['q', 'quit', 'exit']:
                    color_print("\n👋 До свидания!", Colors.GREEN)
                    break
                
                # Показать список тестов
                if command in ['l', 'list']:
                    self.discovery.print_test_list()
                    continue
                
                # Справка
                if command in ['h', 'help', '?']:
                    self.show_help()
                    continue
                
                # Остановить все процессы
                if command == 'kill':
                    self.process_manager.stop_all()
                    continue
                
                # Проверка статуса эмулятора
                if command == 'status':
                    color_print("\n📱 Проверка эмулятора...", Colors.CYAN)
                    is_ready, status = self.check_emulator_running()
                    
                    # Показываем список устройств
                    result = subprocess.run("adb devices", shell=True, capture_output=True, text=True)
                    color_print(f"   {result.stdout.strip()}", Colors.CYAN)
                    
                    if is_ready:
                        color_print("   ✓ Эмулятор ГОТОВ (online)", Colors.GREEN)
                    elif status == 'offline':
                        color_print("   ⏳ Эмулятор OFFLINE - загружается, подождите...", Colors.YELLOW)
                    elif status == 'unauthorized':
                        color_print("   ⚠ Требуется авторизация на устройстве", Colors.YELLOW)
                    else:
                        color_print("   ✗ Эмулятор НЕ ОБНАРУЖЕН", Colors.RED)
                    continue
                
                # Ожидание эмулятора
                if command == 'wait':
                    self.wait_for_emulator(timeout=180)
                    continue
                
                # Перенастройка ADB
                if command == 'adb':
                    color_print("\n🔄 Перенастройка ADB reverse...", Colors.YELLOW)
                    try:
                        # Сначала сбрасываем
                        subprocess.run("adb reverse --remove-all", shell=True, capture_output=True)
                        # Затем устанавливаем заново
                        result = subprocess.run(
                            "adb reverse tcp:8083 tcp:8083",
                            shell=True,
                            capture_output=True,
                            text=True
                        )
                        if result.returncode == 0:
                            color_print("   ✓ ADB reverse tcp:8083 настроен", Colors.GREEN)
                        else:
                            color_print(f"   ⚠ Ошибка: {result.stderr.strip()}", Colors.YELLOW)
                    except Exception as e:
                        color_print(f"   ✗ Ошибка ADB: {e}", Colors.RED)
                    continue
                
                # Повторный запуск преднастройки
                if command == 'setup':
                    self.setup_environment()
                    continue
                
                # Произвольная pytest команда
                if command == 'p' and args:
                    pytest_cmd = f"pytest {' '.join(args)}"
                    if '-v' not in pytest_cmd:
                        pytest_cmd += " -v"
                    if '-s' not in pytest_cmd:
                        pytest_cmd += " -s"
                    self.runner.run_test(pytest_cmd)
                    continue
                
                # Запуск тестов по файлу
                if command == 'f' and args:
                    file_pattern = args[0].lower()
                    matching_files = [f for f in self.discovery.TEST_FILES_ORDER 
                                     if file_pattern in f.lower()]
                    if matching_files:
                        extra_flags = "-x" if '-x' in args else ""
                        pytest_cmd = self.runner.build_file_test_cmd(matching_files[0], extra_flags)
                        self.runner.run_test(pytest_cmd)
                    else:
                        color_print(f"✗ Файл не найден: {file_pattern}", Colors.RED)
                        color_print("  Доступные файлы:", Colors.YELLOW)
                        for f in self.discovery.TEST_FILES_ORDER:
                            color_print(f"    - {f}", Colors.CYAN)
                    continue
                
                # Запуск тестов по классу
                if command == 'c' and args:
                    class_pattern = args[0].lower()
                    matching_group = None
                    for group in self.discovery.groups:
                        if class_pattern in group.name.lower():
                            matching_group = group
                            break
                    
                    if matching_group:
                        extra_flags = "-x" if '-x' in args else ""
                        pytest_cmd = self.runner.build_class_test_cmd(
                            matching_group.name, 
                            matching_group.file, 
                            extra_flags
                        )
                        self.runner.run_test(pytest_cmd)
                    else:
                        color_print(f"✗ Класс не найден: {class_pattern}", Colors.RED)
                        color_print("  Доступные классы:", Colors.YELLOW)
                        for g in self.discovery.groups:
                            color_print(f"    - {g.name} ({g.description})", Colors.CYAN)
                    continue
                
                # Запуск по ID теста
                if command.isdigit():
                    test_id = command.zfill(2)
                    test = self.discovery.get_test_by_id(test_id)
                    
                    if not test:
                        color_print(f"✗ Тест с ID {test_id} не найден", Colors.RED)
                        color_print(f"  Доступные ID: 01 - {self.discovery.all_tests[-1].id}", Colors.YELLOW)
                        continue
                    
                    # Определяем режим запуска
                    extra_flags = "-x" if '-x' in args else ""
                    
                    if '-o' in args or '--one' in args:
                        # === Только один тест ===
                        color_print("\n▶ Запуск одного теста:", Colors.GREEN)
                        color_print(f"  [{test.id}] {test.class_name}::{test.method}", Colors.CYAN)
                        color_print(f"  {test.description}", Colors.YELLOW)
                        pytest_cmd = self.runner.build_single_test_cmd(test, extra_flags)
                        
                    elif '-g' in args or '--group' in args:
                        # === До конца группы ===
                        group_tests = self.discovery.get_group_tests(test)
                        color_print(f"\n▶ Запуск группы: {test.class_name}", Colors.GREEN)
                        color_print(f"  Тестов: {len(group_tests)} (с [{test.id}] до [{group_tests[-1].id}])", Colors.CYAN)
                        
                        # Всегда фильтруем по методам, чтобы запускать начиная с указанного теста
                        test_methods = " or ".join(t.method for t in group_tests)
                        pytest_cmd = f'pytest tests/{test.file}::{test.class_name} -v -s -k "{test_methods}" {extra_flags}'.strip()
                        
                    else:
                        # === До конца всех тестов ===
                        remaining_tests = self.discovery.get_tests_from_id(test_id)
                        color_print(f"\n▶ Запуск тестов с [{test.id}] до конца:", Colors.GREEN)
                        color_print(f"  Всего тестов: {len(remaining_tests)}", Colors.CYAN)
                        
                        # Группируем по файлам для отображения
                        files_involved = {t.file for t in remaining_tests}
                        color_print(f"  Файлы: {', '.join(files_involved)}", Colors.YELLOW)
                        
                        # Всегда используем фильтрацию по методам, чтобы запускать начиная с указанного теста
                        if len(remaining_tests) == len(self.discovery.all_tests):
                            # Все тесты - запускаем без фильтрации
                            pytest_cmd = f"pytest tests/ -v -s {extra_flags}".strip()
                        else:
                            # Фильтруем по методам всех оставшихся тестов
                            test_methods = " or ".join(t.method for t in remaining_tests)
                            if len(files_involved) == 1:
                                # Один файл
                                if test.class_name:
                                    pytest_cmd = f'pytest tests/{test.file}::{test.class_name} -v -s -k "{test_methods}" {extra_flags}'.strip()
                                else:
                                    pytest_cmd = f'pytest tests/{test.file} -v -s -k "{test_methods}" {extra_flags}'.strip()
                            else:
                                # Несколько файлов - используем общую фильтрацию по методам
                                pytest_cmd = f'pytest tests/ -v -s -k "{test_methods}" {extra_flags}'.strip()
                    
                    self.runner.run_test(pytest_cmd)
                    continue
                
                # Неизвестная команда
                color_print(f"✗ Неизвестная команда: {command}", Colors.RED)
                color_print("  Введите 'h' для справки", Colors.YELLOW)
                
            except KeyboardInterrupt:
                color_print("\n\n⚠ Прервано пользователем", Colors.YELLOW)
                continue
            except Exception as e:
                color_print(f"\n✗ Ошибка: {e}", Colors.RED)
                continue
    
    def run(self, skip_setup: bool = False, stop_only: bool = False):
        """Основной запуск"""
        header_print("🍽️  MealRush E2E Test Runner")
        
        if stop_only:
            self.process_manager.stop_all()
            return
        
        if not skip_setup:
            print("Запустить преднастройку окружения? (Appium, Expo, ADB)")
            choice = input(f"{Colors.CYAN}[Y/n]: {Colors.ENDC}").strip().lower()
            
            if choice != 'n':
                self.setup_environment()
        
        self.run_interactive()


def main():
    """Точка входа"""
    manager = E2EManager()
    
    # Парсинг аргументов командной строки
    skip_setup = '--skip' in sys.argv or '-s' in sys.argv
    stop_only = '--stop' in sys.argv or '--kill' in sys.argv
    
    try:
        manager.run(skip_setup=skip_setup, stop_only=stop_only)
    except KeyboardInterrupt:
        color_print("\n\n👋 Выход из программы", Colors.YELLOW)
    except Exception as e:
        color_print(f"\n✗ Критическая ошибка: {e}", Colors.RED)
        sys.exit(1)


if __name__ == "__main__":
    main()
