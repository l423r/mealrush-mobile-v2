# Руководство по разработке E2E тестов для MealRush Mobile V2

> **⚠️ ВАЖНО:** Это руководство является обязательным к использованию при разработке новых E2E тестов.  
> Все новые тесты должны следовать паттернам и best practices, описанным в этом документе.

## 📋 Содержание

1. [Обзор](#обзор)
2. [Управление аккаунтами](#управление-аккаунтами)
3. [Паттерны создания тестов](#паттерны-создания-тестов)
4. [Структура тестового файла](#структура-тестового-файла)
5. [Фикстуры и их использование](#фикстуры-и-их-использование)
6. [Очистка тестовых данных](#очистка-тестовых-данных)
7. [Best Practices](#best-practices)
8. [Примеры](#примеры)

---

## Обзор

E2E тесты для MealRush Mobile V2 используют:
- **Appium** для автоматизации мобильного приложения
- **pytest** как тестовый фреймворк
- **Page Object Model** для работы с UI элементами
- **MobX** для управления состоянием (в приложении)

### Структура директорий

```
e2e_tests/
├── config/              # Конфигурация (Appium, переменные окружения)
├── pages/               # Page Object классы
├── tests/               # Тестовые файлы
├── utilities/           # Утилиты (user_cleanup, user_management, timing)
└── conftest.py          # Глобальные фикстуры pytest
```

---

## Управление аккаунтами

### Два подхода к работе с аккаунтами

#### 1. **Создание нового пользователя** (рекомендуется для большинства тестов)

Используется когда:
- Тест должен работать с "чистым" аккаунтом
- Тест создает данные, которые могут конфликтовать с другими тестами
- Нужна изоляция между тестами

**Преимущества:**
- Полная изоляция тестов
- Нет конфликтов данных
- Можно тестировать сценарии "нового пользователя"

**Недостатки:**
- Больше времени на регистрацию
- Больше нагрузки на БД

#### 2. **Использование существующего пользователя**

Используется когда:
- Тест проверяет функциональность без создания данных
- Нужно быстрое выполнение теста
- Тест проверяет работу с уже существующими данными

**Преимущества:**
- Быстрое выполнение (нет регистрации)
- Меньше нагрузки на БД
- Можно использовать предварительно настроенные данные

**Недостатки:**
- Возможны конфликты данных между тестами
- Нужно следить за состоянием аккаунта

### Конфигурация существующего пользователя

Существующий тестовый пользователь настраивается через переменные окружения в `config.env`:

```env
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=Test123456
TEST_USER_NAME=Test User
```

**⚠️ ВАЖНО:** Этот пользователь **НЕ удаляется** автоматически после тестов (защита в `UserCleanup`).

---

## Паттерны создания тестов

### Паттерн 1: Новый пользователь для каждого теста

```python
@pytest.mark.integration
class TestMyFeature:
    """Тесты для моей функциональности"""
    
    def test_01_something(self, driver, test_user):
        """
        Тест с новым пользователем для каждого теста
        """
        # test_user автоматически генерируется с уникальным email
        # Формат: test_{timestamp}_{random}@example.com
        
        # Регистрация пользователя
        sign_in_page = SignInPage(driver)
        registration_page = sign_in_page.click_register_button()
        registration_page.register(
            test_user['name'],
            test_user['email'],
            test_user['password']
        )
        
        # Регистрируем для автоматической очистки
        UserCleanup.register_user(test_user['email'], test_user['password'])
        
        # Далее тест...
```

**Когда использовать:**
- Тесты, которые создают много данных
- Тесты, которые проверяют изолированные сценарии
- Тесты, которые могут конфликтовать друг с другом

### Паттерн 2: Один пользователь на класс (Shared User)

```python
@pytest.mark.integration
class TestMyFeature:
    """Тесты для моей функциональности"""
    
    # Сохраняем пользователя между тестами
    _shared_user = None
    
    @pytest.fixture(autouse=True)
    def setup_user(self, driver, test_user, request):
        """Автоматическая настройка пользователя"""
        if TestMyFeature._shared_user is None:
            # Первый тест - регистрируем нового пользователя
            TestMyFeature._shared_user = test_user
            self._register_user(driver, test_user)
            UserCleanup.register_user(test_user['email'], test_user['password'])
        else:
            # Последующие тесты - логинимся существующим
            sign_in_page = SignInPage(driver)
            sign_in_page.login(
                TestMyFeature._shared_user['email'],
                TestMyFeature._shared_user['password']
            )
        yield
        # Cleanup выполняется автоматически через session_cleanup
    
    def _register_user(self, driver, user_data):
        """Вспомогательный метод регистрации"""
        sign_in_page = SignInPage(driver)
        registration_page = sign_in_page.click_register_button()
        registration_page.register(
            user_data['name'],
            user_data['email'],
            user_data['password']
        )
        time.sleep(3)
    
    def test_01_first_test(self, driver):
        """Первый тест - создаст пользователя"""
        # Пользователь уже зарегистрирован через fixture
        main_page = MainPage(driver)
        # Тест...
    
    def test_02_second_test(self, driver):
        """Второй тест - использует того же пользователя"""
        # Пользователь уже залогинен через fixture
        main_page = MainPage(driver)
        # Тест...
```

**Когда использовать:**
- Тесты в одном классе логически связаны
- Тесты проверяют последовательность действий одного пользователя
- Нужно ускорить выполнение тестов (меньше регистраций)

### Паттерн 3: Один пользователь на модуль (Module-scoped)

```python
class TestMyFeatureSetup:
    """Вспомогательный класс для setup/teardown"""
    
    @staticmethod
    def generate_test_user():
        """Генерирует уникальные данные пользователя"""
        timestamp = int(time.time() * 1000)
        random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        return {
            'email': f"my_test_{timestamp}_{random_string}@example.com",
            'password': "Test123456",
            'name': f"MyTest_{random_string}"
        }
    
    @staticmethod
    def register_and_complete_profile(driver, user_data):
        """Регистрирует пользователя и проходит онбординг"""
        # Регистрация
        sign_in_page = SignInPage(driver)
        registration_page = sign_in_page.click_register_button()
        registration_page.register(
            user_data['name'],
            user_data['email'],
            user_data['password']
        )
        time.sleep(3)
        
        # Регистрируем для cleanup
        UserCleanup.register_user(user_data['email'], user_data['password'])
        
        # Прохождение онбординга (если нужно)
        # ...
        
        return MainPage(driver)


# Фикстура уровня модуля
@pytest.fixture(scope='module')
def my_test_user():
    """Генерирует пользователя один раз для всего модуля"""
    return TestMyFeatureSetup.generate_test_user()


@pytest.fixture(scope='module')
def authenticated_session(driver, my_test_user):
    """Регистрирует пользователя один раз для всех тестов модуля"""
    print("\n" + "="*60)
    print("MODULE SETUP: Регистрация тестового пользователя")
    print("="*60)
    
    main_page = TestMyFeatureSetup.register_and_complete_profile(driver, my_test_user)
    
    yield main_page, my_test_user
    
    print("\n" + "="*60)
    print("MODULE TEARDOWN: Очистка пользователя")
    print("="*60)
    # Cleanup выполняется автоматически через session_cleanup


@pytest.mark.integration
class TestMyFeature:
    """Тесты для моей функциональности"""
    
    def test_01_first(self, authenticated_session):
        """Первый тест"""
        main_page, user_data = authenticated_session
        # Тест...
    
    def test_02_second(self, authenticated_session):
        """Второй тест - использует того же пользователя"""
        main_page, user_data = authenticated_session
        # Тест...
```

**Когда использовать:**
- Тесты в одном файле логически связаны
- Нужна максимальная скорость выполнения
- Тесты работают с данными одного пользователя

### Паттерн 4: Использование существующего пользователя

```python
from config.appium_config import TEST_USER_EMAIL, TEST_USER_PASSWORD

@pytest.mark.integration
class TestMyFeature:
    """Тесты с существующим пользователем"""
    
    def test_01_something(self, driver, setup_test_environment):
        """Тест с существующим пользователем"""
        sign_in_page = SignInPage(driver)
        
        # Логинимся существующим пользователем
        sign_in_page.login(TEST_USER_EMAIL, TEST_USER_PASSWORD)
        time.sleep(3)
        
        main_page = MainPage(driver)
        # Тест...
```

**Когда использовать:**
- Быстрые smoke-тесты
- Тесты, которые не создают данные
- Тесты, которые проверяют работу с предварительно настроенными данными

---

## Локаторы элементов: testID и accessibilityLabel

**⚠️ КРИТИЧЕСКИ ВАЖНО:** Перед написанием тестов убедитесь, что все интерактивные элементы в React Native компонентах имеют `testID` или `accessibilityLabel`.

### Почему это важно

1. **Стабильность** - локаторы по `testID` не зависят от изменений UI
2. **Скорость** - `accessibility id` - самый быстрый способ поиска
3. **Читаемость** - понятные testID делают тесты более читаемыми
4. **Поддержка** - при изменении UI не нужно обновлять тесты

### Требования к React Native компонентам

**ВСЕ интерактивные элементы должны иметь testID:**

```tsx
// ✅ Хорошо
<TouchableOpacity 
  testID="add_meal_button"
  onPress={handleAddMeal}
>
  <Text>Добавить прием пищи</Text>
</TouchableOpacity>

// ✅ Альтернатива - accessibilityLabel
<Button
  accessibilityLabel="add_meal_button"
  onPress={handleAddMeal}
>
  Добавить прием пищи
</Button>

// ❌ Плохо - нет testID
<TouchableOpacity onPress={handleAddMeal}>
  <Text>Добавить прием пищи</Text>
</TouchableOpacity>
```

### Правила именования testID

```tsx
// ✅ Хорошо - понятные, уникальные имена
testID="meal_card_breakfast"
testID="product_search_input"
testID="add_product_button"
testID="quantity_input"
testID="meal_element_item"

// ❌ Плохо - неясные или дублирующиеся имена
testID="button1"
testID="input"
testID="card"
```

### Использование в Page Object

**Порядок приоритетов локаторов:**

1. **Первый приоритет:** `AppiumBy.ACCESSIBILITY_ID` (использует `testID` или `accessibilityLabel`)
2. **Второй приоритет:** `By.XPATH` с `@content-desc` (fallback для testID)
3. **Последний приоритет:** `By.XPATH` по тексту/структуре (только как крайний fallback)

**Пример правильного Page Object:**

```python
class MainPage(BasePage):
    """Page Object для главного экрана"""
    
    # FAB кнопка добавления приема пищи
    # Приоритет: testID -> content-desc -> XPath по тексту
    ADD_MEAL_BUTTON = [
        (AppiumBy.ACCESSIBILITY_ID, "add_meal_button"),  # testID из MainScreen.tsx
        (By.XPATH, "//*[@content-desc='add_meal_button']"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Добавить')]"),
    ]
    
    def click_add_meal_button(self):
        """Клик на кнопку добавления приема пищи"""
        self.click_element(self.ADD_MEAL_BUTTON, timeout=5)
```

**Если testID отсутствует:**

1. **Добавьте testID в React Native компонент** (предпочтительно)
2. **Используйте XPath как временное решение** (с пометкой TODO)
3. **Создайте задачу на добавление testID** в backlog

```python
# Временное решение с TODO
ADD_MEAL_BUTTON = [
    # TODO: Добавить testID="add_meal_button" в MainScreen.tsx
    (By.XPATH, "//android.widget.Button[contains(@text, 'Добавить')]"),  # Временный локатор
]
```

**Чеклист для разработчиков React Native:**

- [ ] Все `TouchableOpacity`, `Button`, `Pressable` имеют `testID` или `accessibilityLabel`
- [ ] Все `TextInput`, `Text` (интерактивные) имеют `testID`
- [ ] Все элементы списков имеют уникальные `testID` (с индексом или ID)
- [ ] `testID` имеют понятные, уникальные имена
- [ ] `testID` соответствуют функциональности элемента

---

## Структура тестового файла

### Стандартная структура

```python
"""
Тесты для [название функциональности]
"""
import os
import sys
import pytest
import time
import random
import string

# Добавляем родительскую директорию в PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Импорты страниц
from pages.sign_in_page import SignInPage
from pages.registration_page import RegistrationPage
from pages.main_page import MainPage
# ... другие страницы

# Импорты утилит
from utilities.user_cleanup import UserCleanup
from utilities.user_management import UserManagement
from utilities.timing import timer

# Импорты конфигурации (если используем существующего пользователя)
from config.appium_config import TEST_USER_EMAIL, TEST_USER_PASSWORD


# =============================================================================
# SETUP/TEARDOWN КЛАСС (если нужен)
# =============================================================================

class TestMyFeatureSetup:
    """Вспомогательный класс для setup/teardown"""
    
    @staticmethod
    def generate_test_user():
        """Генерирует уникальные данные пользователя"""
        timestamp = int(time.time() * 1000)
        random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        return {
            'email': f"my_test_{timestamp}_{random_string}@example.com",
            'password': "Test123456",
            'name': f"MyTest_{random_string}"
        }
    
    @staticmethod
    def register_and_complete_profile(driver, user_data):
        """Регистрирует пользователя и проходит онбординг"""
        # Реализация...
        pass


# =============================================================================
# MODULE-SCOPED FIXTURES (если используем паттерн 3)
# =============================================================================

@pytest.fixture(scope='module')
def my_test_user():
    """Генерирует пользователя один раз для всего модуля"""
    return TestMyFeatureSetup.generate_test_user()


@pytest.fixture(scope='module')
def authenticated_session(driver, my_test_user):
    """Регистрирует пользователя один раз для всех тестов модуля"""
    # Реализация...
    pass


# =============================================================================
# ТЕСТОВЫЕ КЛАССЫ
# =============================================================================

@pytest.mark.integration
class TestMyFeature:
    """Тесты для моей функциональности"""
    
    # Shared user (если используем паттерн 2)
    _shared_user = None
    
    @pytest.fixture(autouse=True)
    def setup_user(self, driver, test_user, request):
        """Автоматическая настройка пользователя (если нужна)"""
        # Реализация...
        pass
    
    def test_01_first_test(self, driver, test_user):
        """
        Описание первого теста
        
        Шаги:
        1. Шаг 1
        2. Шаг 2
        3. Шаг 3
        """
        # Регистрация пользователя
        sign_in_page = SignInPage(driver)
        registration_page = sign_in_page.click_register_button()
        registration_page.register(
            test_user['name'],
            test_user['email'],
            test_user['password']
        )
        time.sleep(3)
        
        # Регистрируем для автоматической очистки
        UserCleanup.register_user(test_user['email'], test_user['password'])
        
        # Основная логика теста
        main_page = MainPage(driver)
        # ...
        
        # Assertions
        assert main_page.is_page_loaded(), "Главная страница не загрузилась"
    
    def test_02_second_test(self, driver):
        """Описание второго теста"""
        # Тест...
        pass
```

---

## Фикстуры и их использование

### Глобальные фикстуры (из `conftest.py`)

#### `driver`
Appium WebDriver instance. Доступен во всех тестах.

```python
def test_example(driver):
    driver.find_element(...)
```

#### `test_user`
Генерирует уникальные данные пользователя для каждого теста.

```python
def test_example(driver, test_user):
    email = test_user['email']      # test_1234567890_abc123@example.com
    password = test_user['password'] # Test123456
    name = test_user['name']         # Test User abc123
```

#### `setup_test_environment`
Настраивает окружение для теста (сбрасывает приложение, очищает кэш и т.д.).

```python
def test_example(driver, setup_test_environment):
    # Окружение уже настроено
    pass
```

#### `session_cleanup`
Автоматически удаляет всех зарегистрированных пользователей после всех тестов.

**Не требует явного использования** - работает автоматически.

### Локальные фикстуры

Создавайте локальные фикстуры для специфичных для вашего теста setup/teardown операций.

```python
@pytest.fixture
def my_custom_setup(driver):
    """Кастомная настройка для теста"""
    # Setup
    yield
    # Teardown
```

---

## Очистка тестовых данных

### Автоматическая очистка

Все пользователи, зарегистрированные через `UserCleanup.register_user()`, автоматически удаляются после всех тестов через фикстуру `session_cleanup` в `conftest.py`.

### Ручная очистка

Если нужно удалить пользователя вручную:

```python
from utilities.user_cleanup import UserCleanup

# Удаление одного пользователя
UserCleanup.delete_user_profile(email, password)

# Удаление всех зарегистрированных пользователей
UserCleanup.cleanup_all_users()
```

### Защита постоянного пользователя

Пользователь с email из `TEST_USER_EMAIL` **никогда не удаляется** автоматически. Это защита от случайного удаления тестового аккаунта.

---

## Best Practices

### 1. Именование тестов

```python
# ✅ Хорошо
def test_01_user_can_create_meal(self, driver, test_user):
def test_02_user_can_add_products_to_meal(self, driver, test_user):
def test_03_user_can_delete_meal(self, driver, test_user):

# ❌ Плохо
def test1(self, driver, test_user):
def test_meal(self, driver, test_user):
```

### 2. Документация тестов

```python
def test_01_user_can_create_meal(self, driver, test_user):
    """
    Проверяет, что пользователь может создать прием пищи
    
    Шаги:
    1. Пользователь регистрируется
    2. Пользователь переходит на главный экран
    3. Пользователь создает новый прием пищи
    4. Проверяется, что прием пищи отображается в списке
    
    Ожидаемый результат:
    - Прием пищи успешно создан
    - Прием пищи отображается в списке
    """
```

### 3. Использование таймеров

```python
from utilities.timing import timer

def test_example(driver, test_user):
    with timer("Регистрация пользователя"):
        # Регистрация...
        pass
    
    with timer("Создание приема пищи"):
        # Создание...
        pass
```

### 4. Скриншоты

```python
def test_example(driver, test_user):
    sign_in_page = SignInPage(driver)
    sign_in_page.take_screenshot('01_sign_in_page')
    
    # Действия...
    
    main_page = MainPage(driver)
    main_page.take_screenshot('02_main_page')
```

### 5. Ожидания

```python
# ✅ Хорошо - используем явные ожидания через Page Object
main_page = MainPage(driver)
if main_page.is_page_loaded(timeout=10):
    # Действия...

# ❌ Плохо - жесткие задержки везде
time.sleep(10)
```

### 5.1. Локаторы элементов: testID и accessibilityLabel

**⚠️ КРИТИЧЕСКИ ВАЖНО:** Все интерактивные элементы в React Native компонентах должны иметь `testID` или `accessibilityLabel` для стабильной работы E2E тестов.

#### Почему это важно:

1. **Стабильность тестов** - локаторы по `testID`/`accessibilityLabel` не зависят от изменений UI (цвета, шрифты, позиция)
2. **Скорость поиска** - `accessibility id` (который использует `testID`) - самый быстрый способ поиска элементов
3. **Читаемость** - понятные testID делают тесты более читаемыми
4. **Поддержка** - при изменении UI не нужно обновлять тесты, если testID остался прежним

#### Требования к React Native компонентам:

**ВСЕ интерактивные элементы должны иметь testID:**

```tsx
// ✅ Хорошо - есть testID
<TouchableOpacity 
  testID="add_meal_button"
  onPress={handleAddMeal}
>
  <Text>Добавить прием пищи</Text>
</TouchableOpacity>

// ✅ Хорошо - есть accessibilityLabel (альтернатива)
<Button
  accessibilityLabel="add_meal_button"
  onPress={handleAddMeal}
>
  Добавить прием пищи
</Button>

// ❌ Плохо - нет testID или accessibilityLabel
<TouchableOpacity onPress={handleAddMeal}>
  <Text>Добавить прием пищи</Text>
</TouchableOpacity>
```

**Правила именования testID:**

```tsx
// ✅ Хорошо - понятные, уникальные имена
testID="meal_card_breakfast"
testID="product_search_input"
testID="add_product_button"
testID="quantity_input"
testID="meal_element_item"

// ❌ Плохо - неясные или дублирующиеся имена
testID="button1"
testID="input"
testID="card"
```

**Использование в Page Object:**

```python
# ✅ Хорошо - приоритет testID через ACCESSIBILITY_ID
ADD_MEAL_BUTTON = [
    (AppiumBy.ACCESSIBILITY_ID, "add_meal_button"),  # Первый приоритет - testID
    (By.XPATH, "//*[@content-desc='add_meal_button']"),  # Fallback через content-desc
    (By.XPATH, "//android.widget.Button[contains(@text, 'Добавить')]"),  # Последний fallback
]

# ✅ Хорошо - для списков элементов с уникальными testID
MEAL_ELEMENT_CARD = [
    (AppiumBy.ACCESSIBILITY_ID, "meal_element_item"),  # Базовый testID для всех элементов
    (By.XPATH, "//*[starts-with(@content-desc, 'meal_element_item_')]"),  # С уникальным суффиксом
]

# ❌ Плохо - только XPath без testID
ADD_MEAL_BUTTON = (By.XPATH, "//android.widget.Button[contains(@text, 'Добавить')]")
```

**Порядок приоритетов локаторов:**

1. **Первый приоритет:** `AppiumBy.ACCESSIBILITY_ID` (использует `testID` или `accessibilityLabel`)
2. **Второй приоритет:** `By.XPATH` с `@content-desc` (fallback для testID)
3. **Последний приоритет:** `By.XPATH` по тексту/структуре (только как крайний fallback)

**Пример правильного Page Object:**

```python
class MainPage(BasePage):
    """Page Object для главного экрана"""
    
    # FAB кнопка добавления приема пищи
    # Приоритет: testID -> content-desc -> XPath по тексту
    ADD_MEAL_BUTTON = [
        (AppiumBy.ACCESSIBILITY_ID, "add_meal_button"),  # testID из MainScreen.tsx
        (By.XPATH, "//*[@content-desc='add_meal_button']"),
        (By.XPATH, "//android.widget.Button[contains(@text, 'Добавить')]"),
    ]
    
    # Карточка приема пищи
    MEAL_CARD = [
        (AppiumBy.ACCESSIBILITY_ID, "meal_card"),  # testID из MealCard.tsx
        (By.XPATH, "//*[starts-with(@content-desc, 'meal_card_')]"),  # С типом meal
    ]
    
    def click_add_meal_button(self):
        """Клик на кнопку добавления приема пищи"""
        self.click_element(self.ADD_MEAL_BUTTON, timeout=5)
```

**Чеклист для разработчиков React Native:**

- [ ] Все `TouchableOpacity`, `Button`, `Pressable` имеют `testID` или `accessibilityLabel`
- [ ] Все `TextInput`, `Text` (интерактивные) имеют `testID`
- [ ] Все элементы списков (`FlatList`, `FlashList`) имеют уникальные `testID` (с индексом или ID)
- [ ] `testID` имеют понятные, уникальные имена (не "button1", "input2")
- [ ] `testID` соответствуют функциональности элемента
- [ ] При изменении UI `testID` остаются прежними (если функциональность не изменилась)

**Если testID отсутствует в компоненте:**

1. **Добавьте testID в React Native компонент** (предпочтительно)
2. **Используйте XPath как временное решение** (с пометкой TODO в коде)
3. **Создайте задачу на добавление testID** в backlog

```python
# Временное решение с TODO
ADD_MEAL_BUTTON = [
    # TODO: Добавить testID="add_meal_button" в MainScreen.tsx
    (By.XPATH, "//android.widget.Button[contains(@text, 'Добавить')]"),  # Временный локатор
]
```

### 6. Регистрация для cleanup

**ВСЕГДА** регистрируйте созданных пользователей для автоматической очистки:

```python
# ✅ Хорошо
UserCleanup.register_user(user_data['email'], user_data['password'])

# ❌ Плохо - пользователь не будет удален автоматически
# (может привести к засорению БД)
```

### 7. Обработка ошибок

```python
def test_example(driver, test_user):
    try:
        # Действия...
        pass
    except Exception as e:
        # Логируем ошибку
        print(f"Ошибка в тесте: {e}")
        # Делаем скриншот для диагностики
        driver.save_screenshot('error_screenshot.png')
        # Пробрасываем исключение дальше
        raise
```

### 8. Изоляция тестов

```python
# ✅ Хорошо - каждый тест независим
def test_01_create_meal(self, driver, test_user):
    # Создает пользователя, создает meal
    pass

def test_02_delete_meal(self, driver, test_user):
    # Создает нового пользователя, создает meal, удаляет meal
    pass

# ❌ Плохо - тесты зависят друг от друга
def test_01_create_meal(self, driver, test_user):
    # Создает meal
    pass

def test_02_delete_meal(self, driver, test_user):
    # Ожидает, что meal из test_01 существует
    pass
```

---

## Примеры

### Пример 1: Простой тест с новым пользователем

```python
@pytest.mark.integration
class TestSimpleFeature:
    """Простой пример теста"""
    
    def test_01_user_can_login(self, driver, test_user):
        """Проверяет, что пользователь может залогиниться"""
        # Регистрация
        sign_in_page = SignInPage(driver)
        registration_page = sign_in_page.click_register_button()
        registration_page.register(
            test_user['name'],
            test_user['email'],
            test_user['password']
        )
        time.sleep(3)
        
        # Регистрируем для cleanup
        UserCleanup.register_user(test_user['email'], test_user['password'])
        
        # Выход
        main_page = MainPage(driver)
        main_page.navigate_to_profile()
        profile_page = ProfilePage(driver)
        profile_page.click_logout()
        time.sleep(2)
        
        # Логин
        sign_in_page.login(test_user['email'], test_user['password'])
        time.sleep(3)
        
        # Проверка
        assert main_page.is_page_loaded(), "Главная страница не загрузилась после логина"
```

### Пример 2: Тест с shared user

```python
@pytest.mark.integration
class TestSharedUserFeature:
    """Тест с shared user"""
    
    _shared_user = None
    
    @pytest.fixture(autouse=True)
    def setup_user(self, driver, test_user):
        """Настройка пользователя для всех тестов класса"""
        if TestSharedUserFeature._shared_user is None:
            # Первый тест - регистрируем
            TestSharedUserFeature._shared_user = test_user
            sign_in_page = SignInPage(driver)
            registration_page = sign_in_page.click_register_button()
            registration_page.register(
                test_user['name'],
                test_user['email'],
                test_user['password']
            )
            time.sleep(3)
            UserCleanup.register_user(test_user['email'], test_user['password'])
        else:
            # Последующие тесты - логинимся
            sign_in_page = SignInPage(driver)
            sign_in_page.login(
                TestSharedUserFeature._shared_user['email'],
                TestSharedUserFeature._shared_user['password']
            )
            time.sleep(3)
        yield
    
    def test_01_first_action(self, driver):
        """Первый тест"""
        main_page = MainPage(driver)
        # Тест...
    
    def test_02_second_action(self, driver):
        """Второй тест - использует того же пользователя"""
        main_page = MainPage(driver)
        # Тест...
```

### Пример 3: Тест с module-scoped fixture

```python
class TestModuleScopedSetup:
    """Setup класс для module-scoped тестов"""
    
    @staticmethod
    def generate_test_user():
        timestamp = int(time.time() * 1000)
        random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        return {
            'email': f"module_test_{timestamp}_{random_string}@example.com",
            'password': "Test123456",
            'name': f"ModuleTest_{random_string}"
        }
    
    @staticmethod
    def register_user(driver, user_data):
        sign_in_page = SignInPage(driver)
        registration_page = sign_in_page.click_register_button()
        registration_page.register(
            user_data['name'],
            user_data['email'],
            user_data['password']
        )
        time.sleep(3)
        UserCleanup.register_user(user_data['email'], user_data['password'])
        return MainPage(driver)


@pytest.fixture(scope='module')
def module_test_user():
    return TestModuleScopedSetup.generate_test_user()


@pytest.fixture(scope='module')
def authenticated_session(driver, module_test_user):
    main_page = TestModuleScopedSetup.register_user(driver, module_test_user)
    yield main_page, module_test_user


@pytest.mark.integration
class TestModuleScopedFeature:
    """Тесты с module-scoped пользователем"""
    
    def test_01_first(self, authenticated_session):
        main_page, user_data = authenticated_session
        # Тест...
    
    def test_02_second(self, authenticated_session):
        main_page, user_data = authenticated_session
        # Тест...
```

### Пример 4: Тест с существующим пользователем

```python
from config.appium_config import TEST_USER_EMAIL, TEST_USER_PASSWORD

@pytest.mark.integration
class TestExistingUserFeature:
    """Тест с существующим пользователем"""
    
    def test_01_quick_test(self, driver, setup_test_environment):
        """Быстрый тест без регистрации"""
        sign_in_page = SignInPage(driver)
        sign_in_page.login(TEST_USER_EMAIL, TEST_USER_PASSWORD)
        time.sleep(3)
        
        main_page = MainPage(driver)
        # Тест...
```

---

## Чеклист при создании нового теста

### Обязательные пункты:

- [ ] Выбран правильный паттерн работы с аккаунтом (новый/существующий/shared)
- [ ] Пользователь зарегистрирован через `UserCleanup.register_user()` (если создан новый)
- [ ] Тест имеет понятное имя с префиксом `test_XX_`
- [ ] Тест имеет docstring с описанием и шагами
- [ ] Используются явные ожидания вместо жестких `time.sleep()`
- [ ] Добавлены скриншоты для важных шагов
- [ ] Тест изолирован от других тестов
- [ ] Добавлены проверки (assertions) для всех важных шагов
- [ ] Используется таймер для профилирования медленных операций
- [ ] Обработаны возможные ошибки

### Локаторы и Page Objects:

- [ ] Все используемые элементы имеют `testID` или `accessibilityLabel` в React Native компонентах
- [ ] В Page Object локаторы используют `AppiumBy.ACCESSIBILITY_ID` как первый приоритет
- [ ] Локаторы имеют fallback варианты (XPath) на случай отсутствия testID
- [ ] При отсутствии testID создана задача на его добавление (с TODO в коде)
- [ ] Локаторы протестированы и работают стабильно

---

## Дополнительные ресурсы

- [README.md](./README.md) - Общая информация о тестах
- [INSTRUCTION_RU.md](./INSTRUCTION_RU.md) - Инструкция по запуску тестов
- [API_CONTRACT.md](../../docs/API_CONTRACT.md) - Документация API бекенда
- [pages/](./pages/) - Page Object классы
- [utilities/](./utilities/) - Утилиты для тестов

---

**Последнее обновление:** 2025-02-08
