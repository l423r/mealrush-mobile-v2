# Управление остановкой тестов

Этот документ описывает, как управлять остановкой выполнения тестов при падениях.

## Быстрый старт

### Остановка при первом падении

Используйте один из следующих способов:

```bash
# Способ 1: Стандартная опция pytest (-x или --exitfirst)
pytest tests/test_authentication.py -x -v

# Способ 2: Кастомная опция (более понятное название)
pytest tests/test_authentication.py --stop-on-first-failure -v
```

### Выполнение всех тестов до конца (по умолчанию)

```bash
# Просто запустите тесты без опций остановки
pytest tests/test_authentication.py -v
```

## Примеры использования

### Пример 1: Остановка при первом падении

```bash
# Остановится на первом упавшем тесте
pytest tests/test_authentication.py --stop-on-first-failure -v
```

**Результат:**
```
tests/test_authentication.py::TestAuthentication::test_01_sign_in_page_loaded PASSED
tests/test_authentication.py::TestAuthentication::test_02_navigate_to_registration PASSED
tests/test_authentication.py::TestAuthentication::test_03_sign_in_with_invalid_credentials FAILED

# Выполнение остановлено после первого падения
```

### Пример 2: Выполнение всех тестов

```bash
# Выполнятся все тесты, даже если некоторые падают
pytest tests/test_authentication.py -v
```

**Результат:**
```
tests/test_authentication.py::TestAuthentication::test_01_sign_in_page_loaded PASSED
tests/test_authentication.py::TestAuthentication::test_02_navigate_to_registration PASSED
tests/test_authentication.py::TestAuthentication::test_03_sign_in_with_invalid_credentials FAILED
tests/test_authentication.py::TestAuthentication::test_04_successful_registration_and_login PASSED
...

# Все тесты выполнены, показан итоговый отчет
```

### Пример 3: Остановка после N падений

```bash
# Остановится после 3 падений
pytest tests/test_authentication.py --maxfail=3 -v
```

## Когда использовать

### Используйте `--stop-on-first-failure` или `-x` когда:

- ✅ Отлаживаете конкретную проблему
- ✅ Хотите быстро найти первое падение
- ✅ Тесты зависят друг от друга
- ✅ Время выполнения тестов ограничено
- ✅ Нужно быстро получить обратную связь

### Используйте обычный запуск (без опций) когда:

- ✅ Хотите увидеть полную картину всех падений
- ✅ Тесты независимы друг от друга
- ✅ Запускаете в CI/CD для полного отчета
- ✅ Нужен полный список всех проблем за один запуск

## Сравнение опций

| Опция | Описание | Когда использовать |
|-------|----------|-------------------|
| `-x` или `--exitfirst` | Стандартная опция pytest, останавливается при первом падении | Быстрая отладка, стандартный способ pytest |
| `--stop-on-first-failure` | Кастомная опция, делает то же самое | Более понятное название, лучшая читаемость команд |
| `--maxfail=N` | Останавливается после N падений | Когда нужно увидеть несколько ошибок, но не все |
| (без опций) | Выполняет все тесты | Полный отчет, CI/CD, финальная проверка |

## Комбинации с другими опциями

```bash
# Остановка при первом падении + подробный вывод + скриншоты
pytest tests/test_authentication.py --stop-on-first-failure -v -s

# Остановка + HTML отчет
pytest tests/test_authentication.py --stop-on-first-failure --html=report.html

# Остановка + только smoke тесты
pytest tests/test_authentication.py --stop-on-first-failure -m smoke
```

## Примечания

- Скриншоты будут сохранены для всех выполненных тестов, включая упавшие
- При остановке драйвер будет корректно закрыт через фикстуру
- Все выполненные тесты до момента остановки будут отображены в отчете
- Используйте `Ctrl+C` для принудительной остановки в любой момент


