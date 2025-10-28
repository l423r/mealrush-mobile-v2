# Инструкция по нахождению элементов в Appium

## Проблема
Тесты не могут найти элементы на экране входа из-за особенностей React Native.

## Решение

### Вариант 1: Использовать Appium Inspector

1. Установите Appium Inspector (если еще не установлен):
```bash
npm install -g appium-inspector
```

2. Запустите Appium:
```bash
appium
```

3. Запустите Appium Inspector и подключитесь к вашему устройству

4. Найдите элементы на экране входа и получите их локаторы

### Вариант 2: Улучшить locators

Для React Native приложений:
- Кнопки это `TouchableOpacity` (в Appium - это `ViewGroup` или любой элемент с `clickable="true"`)
- Текст внутри кнопок это `TextView`
- Input поля это `EditText`

Пример правильных локаторов:
```python
# Кнопка с текстом
LOGIN_BUTTON = (By.XPATH, "//*[@clickable='true' and .//*[@text='Войти']]")

# Текст
TITLE_TEXT = (By.XPATH, "//android.widget.TextView[@text='MealRush']")

# Input поле
EMAIL_INPUT = (By.XPATH, "//android.widget.EditText[contains(@hint, 'email')]")
```

### Вариант 3: Использовать accessibility IDs

Лучший способ - добавить `testID` в React Native компоненты:

```tsx
<Button
  title="Войти"
  testID="login_button"  // Добавьте это!
  onPress={handleSubmit(onSubmit)}
/>
```

Затем использовать:
```python
LOGIN_BUTTON = (By.ID, "login_button")
```

Это самый надежный способ!

