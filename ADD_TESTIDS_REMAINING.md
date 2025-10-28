# Добавьте testID на остальные экраны

## ✅ Уже сделано:
- SignInScreen - все элементы имеют testID

## ⏳ Нужно добавить testID:

### SimpleRegistrationScreen.tsx
Добавьте testID для всех Input и Button:
```tsx
<Input testID="registration_name_input" ... />
<Input testID="registration_email_input" ... />
<Input testID="registration_password_input" ... />
<Input testID="registration_confirm_password_input" ... />
<Button testID="registration_create_account_button" ... />
```

### MainScreen.tsx
```tsx
<Button testID="main_add_meal_button" ... />
// и т.д.
```

### SearchScreen.tsx
```tsx
<TextInput testID="search_input" ... />
// и т.д.
```

## 📝 Обновление тестов после добавления testID

После добавления testID в приложение, обновите локаторы в:
- `pages/registration_page.py`
- `pages/main_page.py`
- `pages/search_page.py`
- `pages/profile_page.py`

Замените XPath на By.ID как в sign_in_page.py

