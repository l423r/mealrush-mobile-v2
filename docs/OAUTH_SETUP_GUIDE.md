# OAuth2 Setup Guide for FoodApp

## ✅ Конфигурация завершена

Все необходимые OAuth2 данные уже добавлены в проект:

### Google OAuth2 Client IDs
- **Android**: `808861089757-4c66aikcgo5f2k8cbnhvrq7cntepgrf7.apps.googleusercontent.com`
- **iOS**: `808861089757-1pgu9k50hpf9gg3kqsp36v3q7serv1jh.apps.googleusercontent.com`
- **Web**: `808861089757-m436gdg6tr4n04nla83oo7le565mt7m0.apps.googleusercontent.com`

### Apple Sign In
- **Bundle ID**: `com.l423r.FoodApp`
- **Apple Sign In**: Включен в `app.json`

---

## 🚀 Следующие шаги

### 1. Установите OAuth зависимости

```bash
npx expo install expo-auth-session expo-crypto expo-apple-authentication
```

### 2. Обновите нативные модули (Prebuild)

```bash
npx expo prebuild --clean
```

Эта команда:
- Обновит `android/` и `ios/` папки
- Добавит нативные модули OAuth
- Настроит Bundle ID для iOS

### 3. Пересоберите приложение

**Для Android:**
```bash
npx expo run:android
```

**Для iOS:**
```bash
npx expo run:ios
```

---

## 📝 Что уже сделано

### ✅ Файлы обновлены:

1. **`src/utils/oauthUtils.ts`**
   - Добавлены все Client IDs
   - Готов к использованию после установки зависимостей

2. **`app.json`**
   - iOS Bundle ID: `com.l423r.FoodApp`
   - Apple Sign In включен
   - Добавлен плагин `expo-apple-authentication`
   - Добавлен scheme: `foodapp`

3. **`src/config/oauth.config.ts`** (NEW)
   - Централизованная конфигурация OAuth
   - Содержит все Client IDs для справки

4. **`src/stores/AuthStore.ts`**
   - Метод `loginWithOAuth()` готов к использованию

5. **`src/api/services/auth.service.ts`**
   - Endpoint `oauth()` готов

---

## 🔧 После установки зависимостей

### Раскомментируйте код в `src/utils/oauthUtils.ts`

После установки зависимостей нужно раскомментировать импорты и реализацию:

```typescript
// Раскомментируйте эти строки:
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
```

И реализуйте функции `signInWithGoogle()` и `signInWithApple()` согласно комментариям в файле.

---

## 🎯 Использование в приложении

### Пример входа через Google:

```typescript
import { signInWithGoogle } from '../../utils/oauthUtils';
import { useStores } from '../../stores';

const { authStore } = useStores();

const handleGoogleSignIn = async () => {
  try {
    const result = await signInWithGoogle();
    await authStore.loginWithOAuth('google', result.idToken);
    // Навигация обрабатывается автоматически
  } catch (error: any) {
    console.error('Google Sign In error:', error);
  }
};
```

### Пример входа через Apple (только iOS):

```typescript
import { signInWithApple } from '../../utils/oauthUtils';
import { Platform } from 'react-native';

if (Platform.OS === 'ios') {
  const handleAppleSignIn = async () => {
    try {
      const result = await signInWithApple();
      await authStore.loginWithOAuth('apple', result.idToken, result.authorizationCode);
    } catch (error: any) {
      console.error('Apple Sign In error:', error);
    }
  };
}
```

---

## ⚠️ Важные заметки

### Google OAuth на Android
1. В Google Cloud Console должен быть настроен правильный SHA-1 fingerprint
2. Для debug builds используйте debug keystore fingerprint
3. Для release builds используйте release keystore fingerprint

**Получить SHA-1 fingerprint:**
```bash
cd android
./gradlew signingReport
```

### Apple Sign In
- Работает только на физических iOS устройствах (НЕ на симуляторе)
- Требует включения в Apple Developer Console
- Требует правильный Bundle ID: `com.l423r.FoodApp`

### Web Client Secret
⚠️ **НИКОГДА не используйте Web Client Secret в мобильном приложении!**
- Он хранится только для справки в `src/config/oauth.config.ts`
- Используется только на backend сервере для верификации токенов

---

## 🐛 Troubleshooting

### Ошибка: "OAuth dependencies not installed"
**Решение:** Установите зависимости: `npx expo install expo-auth-session expo-crypto expo-apple-authentication`

### Ошибка: "Invalid client ID"
**Решение:** Проверьте, что Client ID правильно скопированы в `oauthUtils.ts`

### Google Sign In не работает на Android
**Решение:** 
1. Проверьте SHA-1 fingerprint в Google Cloud Console
2. Убедитесь, что package name совпадает: `com.l423r.FoodApp`
3. Пересоберите приложение после добавления fingerprint

### Apple Sign In не работает
**Решение:**
1. Проверьте Bundle ID в Apple Developer Console
2. Включите "Sign In with Apple" capability
3. Тестируйте только на физическом iOS устройстве

---

## 📚 Дополнительная документация

- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [Google Sign In Guide](https://docs.expo.dev/guides/authentication/#google)
- [API Contract v2.6.0](./API_CONTRACT.md#part-2-oauth2-integration-v260)


