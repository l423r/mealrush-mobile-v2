# Инструкция по запуску автотестов для MealRush Mobile V2

## Краткое описание

Этот проект содержит набор E2E (End-to-End) тестов для мобильного приложения MealRush, написанных на Python с использованием Appium.

## Предварительные требования

### 1. Установка Python

- Скачайте и установите Python 3.8 или выше с [python.org](https://www.python.org/downloads/)
- Проверьте установку: `python --version` или `python3 --version`

### 2. Установка Node.js и npm

- Скачайте и установите Node.js с [nodejs.org](https://nodejs.org/)
- Проверьте установку: `node --version` и `npm --version`

### 3. Установка Android SDK (для тестирования Android)

- Установите Android Studio
- Настройте переменные окружения:
  - `ANDROID_HOME` - путь к Android SDK
  - Добавьте в `PATH`: `%ANDROID_HOME%\platform-tools` и `%ANDROID_HOME%\tools`

### 4. Установка Appium

```bash
npm install -g appium
npm install -g appium-doctor
appium-doctor --android  # Проверка конфигурации
```

### 5. Установка драйверов Appium

```bash
appium driver install uiautomator2  # Для Android
```

## Установка проекта

### 1. Перейдите в папку с тестами

```bash
cd e2e_tests
```

### 2. Установите Python зависимости

```bash
pip install -r requirements.txt
```

### 3. Создайте файл .env

Скопируйте `.env.example` в `.env` и отредактируйте под вашу конфигурацию:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Отредактируйте файл `.env` и укажите:

- Путь к APK файлу вашего приложения
- Название вашего эмулятора Android
- Версию платформы Android

### 4. Подготовьте приложение

Соберите debug APK:

```bash
cd android
gradlew assembleDebug
```

APK будет создан в папке `android/app/build/outputs/apk/debug/app-debug.apk`

## Запуск эмулятора/устройства

### Android эмулятор

1. Откройте Android Studio
2. Запустите AVD Manager
3. Создайте или запустите существующий эмулятор

### Физическое устройство (Android)

1. Включите режим разработчика на устройстве
2. Включите USB отладку
3. Подключите устройство к компьютеру
4. Проверьте подключение: `adb devices`

## Запуск тестов

### Шаг 1: Запуск Appium Server

```bash
appium
```

Appium должен запуститься на порту 4723. Оставьте этот терминал открытым.

### Шаг 2: Запуск тестов

Откройте новый терминал и перейдите в папку `e2e_tests`:

#### Windows:

```batch
run_tests.bat
```

#### Linux/Mac:

```bash
chmod +x run_tests.sh
./run_tests.sh
```

#### Запуск с опциями:

```bash
# Запуск только smoke тестов
./run_tests.sh --markers smoke

# Запуск с подробным выводом
./run_tests.sh --verbose

# Параллельный запуск (2 процесса)
./run_tests.sh --workers 2

# Запуск через pytest напрямую
pytest tests/test_authentication.py -v
```

## Просмотр результатов

После завершения тестов:

1. **HTML отчет** - откроется автоматически в браузере (`report.html`)
2. **Скриншоты** - находятся в папке `screenshots/`
3. **Логи** - выводятся в консоль

## Структура тестов

### Тесты аутентификации (`test_authentication.py`)

- Вход в систему
- Регистрация нового пользователя
- Валидация форм
- Переключение видимости пароля

### Тесты основных функций (`test_main_features.py`)

- Навигация между экранами
- Изменение даты
- Отображение статистики
- Добавление приемов пищи

### Тесты поиска (`test_main_features.py`)

- Поиск продуктов
- Фильтрация результатов
- Работа с избранным

### Тесты профиля (`test_profile.py`)

- Просмотр информации о пользователе
- Отображение BMI
- Цели по калориям
- Переход в настройки

## Решение проблем

### 1. Appium не запускается

```bash
# Проверьте установку
appium --version

# Проверьте порт (должен быть свободен 4723)
netstat -ano | findstr :4723  # Windows
lsof -i :4723  # ﶴ✧✧
```

### 2. Устройство не определяется

```bash
# Android
adb devices
adb kill-server
adb start-server

# iOS (только macOS)
xcrun simctl list devices
```

### 3. Элементы не находятся

- Проверьте правильность locators
- Используйте Appium Inspector:
  ```bash
  appium inspector
  ```
- Откройте браузер на `http://localhost:4723`
- Создайте новую сессию и найдите элементы

### 4. Тесты падают с таймаутом

- Увеличьте таймауты в `config/appium_config.py`
- Добавьте дополнительные задержки в тесты
- Проверьте производительность эмулятора

### 5. APK не устанавливается

- Проверьте путь к APK в `.env`
- Убедитесь, что APK собран в debug режиме
- Проверьте разрешения на установку приложений

## Расширение тестов

### Добавление нового теста

1. Создайте Page Object в `pages/` (если нужен новый экран)
2. Добавьте тест в соответствующий файл в `tests/`
3. Используйте маркеры:
   ```python
   @pytest.mark.smoke  # Быстрые тесты
   @pytest.mark.regression  # Регрессионные тесты
   @pytest.mark.integration  # Интеграционные тесты
   ```

### Создание Page Object

```python
from utilities.base_page import BasePage
from selenium.webdriver.common.by import By

class MyPage(BasePage):
    # Определите locators
    BUTTON = (By.XPATH, "//button")

    def __init__(self, driver):
        super().__init__(driver)

    def is_page_loaded(self):
        return self.is_displayed(self.BUTTON)

    def click_button(self):
        self.click(self.BUTTON)
        return self
```

### Написание тестов

```python
def test_my_feature(self, driver, setup_test_environment):
    """Тест: описание теста"""
    # Arrange
    my_page = MyPage(driver)

    # Act
    my_page.click_button()

    # Assert
    assert my_page.is_page_loaded(), "Описание ошибки"
    my_page.take_screenshot('test_result')
```

## CI/CD интеграция

Пример для GitHub Actions см. в файле `README.md` в разделе "CI/CD Integration".

## Дополнительная информация

Подробную документацию см. в файле `README.md`.

## Контакты

При возникновении проблем:

1. Проверьте логи Appium
2. Просмотрите скриншоты в `screenshots/`
3. Проверьте конфигурацию в `.env`
