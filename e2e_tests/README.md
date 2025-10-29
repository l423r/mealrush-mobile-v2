# E2E Tests для MealRush Mobile V2

Этот проект содержит автотесты для мобильного приложения MealRush, разработанные с использованием Appium и Python.

## Быстрый старт

```bash
# 1. Установите зависимости
pip install -r requirements.txt
npm install -g appium

# 2. Запустите Appium
appium

# 3. В другом терминале запустите тесты
# Linux/Mac:
./run_tests.sh

# Windows:
run_tests.bat
```

## Требования

- Python 3.8+
- Android SDK (для тестирования на Android)
- Appium Server
- Node.js (для Appium)

## Установка

### 1. Установка зависимостей Python

```bash
cd e2e_tests
pip install -r requirements.txt
```

### 2. Установка Appium Server

```bash
# Установите Node.js, если еще не установлен
# Затем установите Appium
npm install -g appium

# Установите драйвер для Android
appium driver install uiautomator2

# Для iOS (только macOS)
appium driver install xcuitest
```

### 3. Настройка окружения

Создайте файл `.env` в папке `e2e_tests/`:

```env
# Appium Configuration
APPIUM_SERVER_URL=http://localhost:4723/wd/hub
PLATFORM=android

# Android Configuration
ANDROID_PLATFORM_VERSION=13
ANDROID_DEVICE_NAME=Android Emulator
ANDROID_APP_PATH=../android/app/build/outputs/apk/debug/app-debug.apk

# iOS Configuration (если нужно)
IOS_PLATFORM_VERSION=17.0
IOS_DEVICE_NAME=iPhone 15 Pro
IOS_APP_PATH=../build/iphone/FoodApp.app

# Test User
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=Test123456
TEST_USER_NAME=Test User
```

### 4. Подготовка приложения для тестирования

#### Для Android:

```bash
# В корне проекта
npm run android

# Или соберите APK вручную
cd android
./gradlew assembleDebug
```

#### Для iOS (только macOS):

```bash
npm run ios
```

## Запуск тестов

### 1. Запуск Appium Server

```bash
appium
```

Appium должен запуститься на `http://localhost:4723`

### 2. Подготовка эмулятора/устройства

#### Android:

```bash
# Запустите Android Emulator
emulator -avd <your_avd_name>

# Или подключите физическое устройство
adb devices  # Проверьте подключение
```

#### iOS (только macOS):

```bash
# Запустите iOS Simulator
open -a Simulator
```

### 3. Запуск тестов

#### Запуск всех тестов:

```bash
cd e2e_tests
pytest
```

#### Запуск конкретной категории тестов:

```bash
# Smoke тесты
pytest -m smoke

# Regression тесты
pytest -m regression

# Integration тесты
pytest -m integration
```

#### Запуск конкретного файла с тестами:

```bash
pytest tests/test_authentication.py
```

#### Запуск конкретного теста:

```bash
pytest tests/test_authentication.py::TestAuthentication::test_sign_in_page_loaded
```

#### Запуск с подробным выводом:

```bash
pytest -v -s
```

#### Генерация HTML-отчета:

```bash
pytest --html=report.html --self-contained-html
```

#### Запуск с параллельным выполнением:

```bash
pytest -n auto  # Автоматически определяет количество процессов
```

### 4. Просмотр скриншотов

Все скриншоты сохраняются в папке `e2e_tests/screenshots/`. Скриншоты автоматически создаются:
- При начале каждого теста
- При завершении каждого теста
- При падении теста
- При вызове метода `take_screenshot()` в коде

## Структура проекта

```
e2e_tests/
├── config/
│   └── appium_config.py       # Конфигурация Appium
├── pages/
│   ├── base_page.py           # Базовый класс для Page Object
│   ├── sign_in_page.py        # Страница входа
│   ├── registration_page.py   # Страница регистрации
│   ├── main_page.py           # Главная страница
│   ├── search_page.py         # Страница поиска
│   └── profile_page.py        # Страница профиля
├── utilities/
│   └── base_page.py           # Утилиты и базовые методы
├── tests/
│   ├── test_authentication.py # Тесты аутентификации
│   ├── test_main_features.py  # Тесты основных функций
│   └── test_profile.py        # Тесты профиля
├── screenshots/               # Скриншоты (создается автоматически)
├── conftest.py               # Pytest конфигурация и фикстуры
├── requirements.txt          # Python зависимости
├── .env                      # Переменные окружения (создать вручную)
└── README.md                 # Этот файл
```

## Настройка локальных элементов (Locators)

Если локаторы элементов не работают, проверьте:

1. **Проверьте правильность package name** в `appium_config.py`:
   ```python
   'appPackage': 'com.l423r.foodapp'  # Замените на ваш
   ```

2. **Используйте Appium Inspector** для поиска элементов:
   ```bash
   # Запустите Appium
   appium
   
   # В другом терминале запустите Inspector
   appium inspector
   ```
   
   Откройте браузер на `http://localhost:4723` и используйте Inspector для нахождения элементов.

3. **Альтернативные стратегии поиска элементов**:
   - `accessibility id` - предпочтительно для React Native
   - `xpath` - более гибкий, но медленнее
   - `id` - самый быстрый, но требует настройки в приложении

## Отладка

### Проблемы с запуском тестов

1. **Appium не запускается:**
   ```bash
   # Проверьте, установлен ли Appium
   appium --version
   
   # Проверьте драйверы
   appium driver list
   ```

2. **Устройство не определяется:**
   ```bash
   # Для Android
   adb devices
   
   # Перезапустите ADB
   adb kill-server
   adb start-server
   ```

3. **Элемент не находится:**
   - Увеличьте таймауты в `appium_config.py`
   - Проверьте, что приложение запущено
   - Используйте Appium Inspector для проверки элементов
   - Добавьте задержки (`time.sleep()`)

### Логирование

Для включения подробных логов Appium:

```bash
appium --log-level debug
```

Для включения подробных логов тестов:

```bash
pytest -v -s --log-cli-level=DEBUG
```

## CI/CD Integration

### GitHub Actions

Пример файла `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 2 * * *'  # Каждый день в 2:00

jobs:
  android-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          cd e2e_tests
          pip install -r requirements.txt
      
      - name: Start Appium
        run: |
          npm install -g appium uiautomator2-driver
          appium &
      
      - name: Setup Android SDK
        uses: android-actions/setup-android@v2
      
      - name: Start Emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 29
          target: default
          arch: x86_64
      
      - name: Build APK
        run: |
          cd android
          ./gradlew assembleDebug
      
      - name: Run Tests
        run: |
          cd e2e_tests
          pytest --html=report.html
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: |
            e2e_tests/report.html
            e2e_tests/screenshots/
```

## Советы по написанию тестов

1. **Используйте Page Object Pattern** - все элементы и методы для страницы должны быть в одном классе

2. **Добавляйте осмысленные скриншоты** - особенно перед и после важных действий

3. **Обрабатывайте исключения** - используйте try-except для элементов, которые могут отсутствовать

4. **Используйте явные ожидания** - WebDriverWait вместо time.sleep где возможно

5. **Делите большие тесты** - один тест = одна проверка

6. **Используйте маркеры pytest** - @pytest.mark.smoke, @pytest.mark.regression и т.д.

7. **Очищайте после тестов** - используйте фикстуры для cleanup

## Полезные команды

```bash
# Запуск только упавших тестов
pytest --lf

# Запуск в режиме отладки
pytest --pdb

# Запуск с остановкой при первой ошибке
pytest -x

# Запуск с кешем pytest
pytest --cache-clear

# Показать доступные устройства
adb devices -l  # Android
xcrun simctl list devices  # iOS
```

## Дополнительные ресурсы

- [Appium Documentation](http://appium.io/docs/en/latest/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [Page Object Model](https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/)

## Поддержка

При возникновении проблем:
1. Проверьте логи Appium
2. Проверьте скриншоты в `screenshots/`
3. Убедитесь, что все зависимости установлены
4. Проверьте, что приложение собрано и установлено на устройство

## Лицензия

Этот проект является частью MealRush Mobile V2.

