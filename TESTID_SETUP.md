# Настройка testID для E2E тестов

## Проблема
Тесты не могут найти элементы из-за особенностей React Native. Решение - добавить `testID` во все компоненты.

## ✅ Что уже сделано:

### 1. Компоненты обновлены:
- ✅ Button.tsx - добавлен testID prop
- ✅ Input.tsx - добавлен testID prop

### 2. SignInScreen обновлен:
- ✅ Email input: `testID="sign_in_email_input"`
- ✅ Password input: `testID="sign_in_password_input"`
- ✅ Login button: `testID="sign_in_login_button"`
- ✅ Forgot password button: `testID="sign_in_forgot_password_button"`
- ✅ Register button: `testID="sign_in_register_button"`
- ✅ Password toggle icon: `testID="password_toggle_icon"`

## 📝 Что нужно сделать вручную:

### 1. Исправить Input.tsx (убрать опечатки):
Заменить строку 18:
```tsx
const Input: React.FC<InputProps> = ({
```
(убедитесь, что там нет лишних символов)

### 2. Тесты обновлены для использования testID
Обновлен `e2e_tests/pages/sign_in_page.py`:
```python
EMAIL_INPUT = (By.ID, "sign_in_email_input")
LOGIN_BUTTON = (By.ID, "sign_in_login_button")
```

### 3. Пересобрать приложение:
```bash
cd android
gradlew assembleDebug
```

### 4. Запустить тесты:
```bash
cd e2e_tests
run_tests.bat
```

## 🎯 Преимущества testID:
- ✅ Надежность - не зависит от изменения UI
- ✅ Производительность - быстрее XPath
- ✅ Читаемость - понятные названия
- ✅ Стабильность - не ломается при рефакторинге

## 📚 Документация:
См. https://reactnative.dev/docs/testing-overview#find-nodes

