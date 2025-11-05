# Firebase Push Notifications - Руководство по настройке

## Обзор

В приложение MealRush интегрирована система push-уведомлений через Firebase Cloud Messaging API (V1).

## Что было реализовано

### 1. Конфигурация Android
- ✅ Google Services plugin добавлен в `android/build.gradle`
- ✅ Firebase Messaging Service настроен в `AndroidManifest.xml`
- ✅ Разрешения для уведомлений добавлены
- ✅ `google-services.json` подключен в `app.json`

### 2. Пакеты
Установлены следующие пакеты:
- `expo-notifications` - работа с push-уведомлениями
- `expo-device` - определение типа устройства
- `expo-constants` - доступ к конфигурации

### 3. API Integration

**Эндпоинт:** `POST /my-food/notifications/register`

**Service:** `src/api/services/notification.service.ts`
```typescript
import { notificationService } from '../api/services/notification.service';

// Регистрация устройства
await notificationService.registerDevice({
  fcm_token: 'your-fcm-token',
  device_type: 'ANDROID' // или 'IOS'
});

// Удаление устройства
await notificationService.unregisterDevice('your-fcm-token');
```

### 4. State Management (MobX)

**Store:** `src/stores/NotificationStore.ts`

```typescript
import { useStores } from './stores';

const { notificationStore } = useStores();

// Регистрация для push-уведомлений
await notificationStore.registerForPushNotifications();

// Переключение уведомлений
await notificationStore.toggleNotifications();

// Проверка статуса разрешений
await notificationStore.checkPermissionStatus();

// Состояние
notificationStore.fcmToken // FCM токен
notificationStore.notificationsEnabled // Включены ли уведомления
notificationStore.permissionStatus // 'granted' | 'denied' | 'undetermined'
notificationStore.loading // Загрузка
notificationStore.error // Ошибка
```

### 5. UI Компоненты

#### NotificationCard
Стильная карточка уведомления с анимацией:
```typescript
import NotificationCard from './components/common/NotificationCard';

<NotificationCard
  type="success" // 'success' | 'info' | 'warning' | 'error'
  title="Успех!"
  message="Уведомление отправлено"
  onDismiss={() => console.log('Dismissed')}
  autoHideDuration={4000}
/>
```

#### NotificationPermissionBanner
Баннер для запроса разрешения на уведомления:
```typescript
import NotificationPermissionBanner from './components/common/NotificationPermissionBanner';

<NotificationPermissionBanner
  onEnable={async () => {
    await notificationStore.registerForPushNotifications();
  }}
  onDismiss={() => {
    // Скрыть баннер
  }}
/>
```

### 6. Экран настроек

**Screen:** `src/screens/main/NotificationSettingsScreen.tsx`

Экран настроек уведомлений с:
- Статусом уведомлений
- Переключателем вкл/выкл
- Статусом разрешений
- Информацией о типах уведомлений
- Debug информацией (только в dev mode)

Добавлен в навигацию: `NotificationSettings: undefined`

### 7. Автоматическая регистрация

Регистрация происходит автоматически после успешного входа в приложение (`AuthStore.login()`).

### 8. Слушатели уведомлений

Настроены в `App.tsx`:
- Обработка уведомлений когда приложение открыто
- Обработка нажатий на уведомления
- Автоматическая проверка статуса разрешений при запуске

## Использование

### Для мобильного разработчика

1. **Убедитесь, что пакеты установлены:**
```bash
npx expo install expo-notifications expo-device expo-constants
```

2. **Пересоберите Android приложение:**
```bash
npm run android
```

3. **Тестирование:**
   - Используйте физическое устройство или эмулятор с Google Play Services
   - После входа в приложение автоматически запросятся разрешения
   - FCM токен будет отправлен на бэкенд

4. **Проверка токена:**
   - Откройте экран настроек уведомлений
   - В dev mode отображается FCM токен

### Для backend разработчика

1. **Получить Service Account Key:**
   - Firebase Console → Project Settings → Service Accounts
   - Generate New Private Key
   - Сохранить JSON файл

2. **Настроить Firebase Admin SDK в Spring Boot:**

```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.google.firebase</groupId>
    <artifactId>firebase-admin</artifactId>
    <version>9.2.0</version>
</dependency>
```

```java
// FirebaseConfig.java
@Configuration
public class FirebaseConfig {
    @PostConstruct
    public void initialize() {
        try {
            FileInputStream serviceAccount = 
                new FileInputStream("path/to/serviceAccountKey.json");
            
            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();
            
            FirebaseApp.initializeApp(options);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

3. **Реализовать эндпоинт регистрации:**

```java
@PostMapping("/notifications/register")
public ResponseEntity<DeviceResponse> registerDevice(
    @RequestBody DeviceRegistrationRequest request,
    @AuthenticationPrincipal User user
) {
    // Сохранить fcm_token и device_type для пользователя
    // Если токен уже существует - обновить createdAt
    return ResponseEntity.status(201).body(device);
}
```

4. **Отправка уведомлений:**

```java
import com.google.firebase.messaging.*;

public void sendNotification(String fcmToken, String title, String body) {
    Message message = Message.builder()
        .setToken(fcmToken)
        .setNotification(Notification.builder()
            .setTitle(title)
            .setBody(body)
            .build())
        .setAndroidConfig(AndroidConfig.builder()
            .setPriority(AndroidConfig.Priority.HIGH)
            .setNotification(AndroidNotification.builder()
                .setColor("#4CAF50")
                .build())
            .build())
        .build();
    
    try {
        String response = FirebaseMessaging.getInstance().send(message);
        System.out.println("Successfully sent: " + response);
    } catch (FirebaseMessagingException e) {
        e.printStackTrace();
    }
}
```

## API Contract

Полная документация эндпоинта находится в `docs/API_CONTRACT.md`, секция "21. Notifications Management".

## Типы уведомлений

Можно отправлять следующие типы уведомлений:
- 📅 Напоминания о приёмах пищи
- 🏆 Достижения и цели
- 💡 Рекомендации по питанию
- 📊 Еженедельные отчёты

## Troubleshooting

### Уведомления не приходят

1. **Проверьте Google Play Services:**
   - Эмулятор должен иметь образ с Google Play Store
   - Физическое устройство должно иметь Google Play Services

2. **Проверьте разрешения:**
   - Android 13+ требует разрешение `POST_NOTIFICATIONS`
   - Проверьте в настройках приложения

3. **Проверьте токен:**
   - Откройте NotificationSettingsScreen
   - Убедитесь, что токен получен и отображается

4. **Проверьте логи:**
   - `console.log` показывает все этапы регистрации
   - Проверьте ошибки в логах

### FCM Token не получен

- Убедитесь, что `google-services.json` находится в `android/app/`
- Пересоберите приложение: `npm run android`
- Очистите кэш: `cd android && ./gradlew clean`

## Дополнительная информация

- Firebase Console: https://console.firebase.google.com
- Firebase Cloud Messaging Docs: https://firebase.google.com/docs/cloud-messaging
- Expo Notifications Docs: https://docs.expo.dev/versions/latest/sdk/notifications

## Структура файлов

```
src/
├── api/
│   ├── endpoints.ts (добавлен NOTIFICATIONS_REGISTER)
│   └── services/
│       └── notification.service.ts (новый)
├── components/
│   └── common/
│       ├── NotificationCard.tsx (новый)
│       └── NotificationPermissionBanner.tsx (новый)
├── screens/
│   └── main/
│       └── NotificationSettingsScreen.tsx (новый)
├── stores/
│   ├── NotificationStore.ts (новый)
│   └── RootStore.ts (обновлён)
├── types/
│   ├── api.types.ts (добавлены типы уведомлений)
│   └── navigation.types.ts (добавлен NotificationSettings)
└── App.tsx (обновлён)

android/
├── build.gradle (добавлен Google Services plugin)
└── app/
    ├── build.gradle (применён plugin)
    ├── google-services.json (уже был)
    └── src/main/AndroidManifest.xml (добавлены разрешения и сервис)

docs/
└── API_CONTRACT.md (добавлена секция 21. Notifications Management)
```

