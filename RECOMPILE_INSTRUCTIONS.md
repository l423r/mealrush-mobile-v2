# ⚠️ ВАЖНО: Пересоберите приложение!

## Проблема

Тесты не находят элементы, потому что приложение не было пересобрано с новыми `testID`!

## Решение

### 1. Убедитесь, что все изменения сохранены:
- ✅ Button.tsx - добавлен `accessibilityLabel`
- ✅ Input.tsx - добавлен `accessibilityLabel`  
- ✅ SignInScreen.tsx - добавлены testID для всех элементов

### 2. Пересоберите приложение:

```bash
# Остановите Metro bundler если запущен
# (Ctrl+C в терминале где запущен npm start)

# Пересоберите Android приложение
cd android
gradlew clean
gradlew assembleDebug

# Установите новое приложение на устройство
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

### 3. Перезапустите Appium и тесты:

```bash
# Остановите Appium (Ctrl+C)
# Запустите Appium снова
appium

# В другом терминале запустите тесты
cd e2e_tests
run_tests.bat
```

## Проверка

После пересборки проверьте, что testID работают:

```bash
# Проверьте установленное приложение
adb shell pm list packages | findstr FoodApp

# Если приложение установлено, проверьте его версию
adb shell dumpsys package com.l423r.FoodApp | findstr versionName
```

## Важно

Каждый раз, когда вы изменяете:
- Компоненты (Button, Input и т.д.)
- Добавляете testID
- Изменяете UI

Вы **ОБЯЗАТЕЛЬНО** должны:
1. Пересобрать приложение
2. Установить его на устройство
3. Перезапустить тесты

## Быстрая пересборка

```bash
# Скрипт для быстрой пересборки
cd android
gradlew clean assembleDebug
cd ..
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
cd e2e_tests
```

