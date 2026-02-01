# API Contract: MealRush Backend

**Версия:** 2.8.0  
**Дата:** 11 ноября 2025  
**Статус:** Утверждено

**Изменения в версии 2.8.0:**
- Добавлен параметр `analysisMode` для всех эндпоинтов AI анализа
- Три режима анализа: SIMPLE (блюдо целиком), DETAILED (детальная разбивка), AUTO (автоматический выбор)
- Обратная совместимость: по умолчанию используется режим AUTO

---

## 1. Общая информация

### 1.1. Base URL

**Development:**
```
http://localhost:8083/my-food
```

**Production (через Gateway):**
```
http://80.87.201.75:8079/gateway/my-food
```

### 1.2. Аутентификация

Все эндпоинты (кроме health check) требуют JWT токен в заголовке:

```
Authorization: Bearer {JWT_TOKEN}
```

JWT токен получается через эндпоинт:
```
POST /my-food/auth/token
```

### 1.3. Общие форматы

**Даты:**
- Date only: `YYYY-MM-DD` (пример: `2024-10-20`)
- DateTime: ISO 8601 `YYYY-MM-DDTHH:mm:ss` (пример: `2024-10-20T15:30:00`)
- Все даты в UTC на сервере, клиент конвертирует в локальное время

**Pagination:**
- Query параметры: `?page=0&size=20&sort=created,desc`
- Page - номер страницы (с 0)
- Size - количество элементов (default: 20, max: 100)
- Sort - поле для сортировки

**Pagination Response:**
```json
{
  "content": [...],
  "page": 0,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5,
  "first": true,
  "last": false
}
```

### 1.4. HTTP Status Codes

| Код | Описание | Когда используется |
|-----|----------|-------------------|
| 200 | OK | Успешное получение/обновление |
| 201 | Created | Успешное создание ресурса |
| 204 | No Content | Успешное удаление |
| 400 | Bad Request | Ошибка валидации входных данных |
| 401 | Unauthorized | Отсутствует или невалидный JWT токен |
| 403 | Forbidden | Нет прав доступа к ресурсу |
| 404 | Not Found | Ресурс не найден |
| 409 | Conflict | Конфликт (дубликат) |
| 500 | Internal Server Error | Ошибка сервера |

### 1.5. Работа с изображениями

**Загрузка изображений:**

Все эндпоинты, поддерживающие изображения (Products, MealElements), принимают два опциональных поля:

- `imageBase64` (string) - base64 строка нового изображения для загрузки
- `imageUrl` (string) - URL существующего изображения для переиспользования

**Правила:**

1. **Новое изображение**: передайте `imageBase64` (с или без data URL префикса `data:image/jpeg;base64,`)
2. **Существующее изображение**: передайте `imageUrl` (например, при создании Product из MealElement)
3. **Приоритет**: если переданы оба поля - используется `imageBase64`
4. **Обработка**: автоматическое изменение размера (max 1200x1200px), сжатие (85% quality), конвертация в JPG
5. **Response**: в ответе будет `imageUrl` с полным публичным URL изображения

**Пример запроса с новым изображением:**
```json
{
  "name": "Куриная грудка",
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgAB...",
  "proteins": 31.0
}
```

**Пример запроса с существующим изображением:**
```json
{
  "name": "Куриная грудка",
  "imageUrl": "http://minio.example.com/mealrush-images/images/550e8400-e29b-41d4-a716-446655440000.jpg",
  "proteins": 31.0
}
```

**Пример ответа:**
```json
{
  "id": 123,
  "name": "Куриная грудка",
  "imageUrl": "http://minio.example.com/mealrush-images/images/550e8400-e29b-41d4-a716-446655440000.jpg",
  "proteins": 31.0
}
```

**Ограничения:**
- Максимальный размер base64 изображения: 10MB
- Поддерживаемые форматы входных изображений: JPEG, PNG, WebP, GIF
- Выходной формат: всегда JPG
- Изображения хранятся в S3 с UUID именами для безопасности
- Неиспользуемые изображения автоматически удаляются раз в неделю

### 1.6. Формат ошибок

```json
{
  "timestamp": "2024-10-20T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/my-food/product",
  "errors": [
    {
      "field": "name",
      "rejectedValue": "",
      "message": "must not be blank"
    }
  ]
}
```

---

## 2. Аутентификация

**Примечание:** Все эндпоинты аутентификации являются публичными и не требуют JWT токена

### 2.1. Получение токена (вход)

**Endpoint:**
```
POST /my-food/auth/token
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 2592000,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Иван Иванов",
    "avatarUrl": null,
    "oauthProvider": null,
    "roles": ["USER"],
    "createdAt": "2024-10-20T12:00:00Z"
  }
}
```

**Response Fields:**
- `jwtToken` (string) - JWT токен для использования в API
- `tokenType` (string) - Тип токена (всегда "Bearer")
- `expiresIn` (number) - Время жизни токена в секундах (по умолчанию: 2592000 = 30 дней)
- `user` (object) - Полная информация о пользователе:
  - `id` (number) - ID пользователя
  - `email` (string) - Email пользователя
  - `name` (string) - Имя пользователя
  - `avatarUrl` (string, nullable) - URL аватара пользователя
  - `oauthProvider` (string, nullable) - OAuth провайдер ("google", "apple", или null)
  - `roles` (array) - Роли пользователя
  - `createdAt` (string) - Дата создания аккаунта

**Errors:**
- 401: Неверный email или пароль
- 400: Невалидные данные
  ```json
  {
    "timestamp": "2024-10-20T12:00:00Z",
    "status": 400,
    "error": "Bad Request",
    "message": "This account is linked to GOOGLE. Please use GOOGLE to sign in",
    "path": "/my-food/auth/token"
  }
  ```
  **Примечание:** Эта ошибка возвращается если пользователь зарегистрирован через OAuth (Google/Apple) и пытается войти через password. OAuth пользователи должны использовать соответствующий провайдер для входа.

### 2.2. Регистрация пользователя

**Endpoint:**
```
POST /my-food/auth/user
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Иван Иванов"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Иван Иванов",
  "avatarUrl": null,
  "oauthProvider": null,
  "roles": ["USER"],
  "createdAt": "2024-10-20T12:00:00Z"
}
```

**Errors:**
- 409: Email уже зарегистрирован
- 400: Невалидные данные (пароль < 8 символов, некорректный email)

### 2.3. Получение данных пользователя

**Endpoint:**
```
GET /my-food/auth/user
Headers: Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Иван Иванов",
  "avatarUrl": null,
  "oauthProvider": null,
  "roles": ["USER"],
  "createdAt": "2024-10-20T12:00:00Z"
}
```

### 2.4. Восстановление пароля

**Endpoint:**
```
POST /my-food/auth/reset-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Новый пароль отправлен на email. Dev mode - новый пароль: abc123xyz456"
}
```

**Примечание:** В текущей версии (dev mode) новый пароль возвращается в ответе. В production версии пароль будет отправляться на email и не будет возвращаться в response.

### 2.5. OAuth2 авторизация (Google/Apple)

**Endpoint:**
```
POST /my-food/auth/oauth
```

**Описание:**  
Аутентификация через Google или Apple Sign In. Мобильное приложение получает ID token от провайдера OAuth, отправляет его на бекенд для верификации. Бекенд проверяет токен, создает или находит пользователя, и возвращает JWT токен для дальнейшего использования API.

**Request Body:**
```json
{
  "provider": "google",
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU5N...",
  "authorizationCode": null
}
```

**Поля:**
- `provider` (string, required) - OAuth провайдер. Возможные значения: `"google"`, `"apple"`
- `idToken` (string, required) - ID token от OAuth провайдера
- `authorizationCode` (string, optional) - Authorization code (используется только для Apple, опционально)

**Response (200 OK):**
```json
{
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 2592000,
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "name": "John Doe",
    "avatarUrl": "https://lh3.googleusercontent.com/a/ACg8ocK...",
    "oauthProvider": "google",
    "roles": ["USER"],
    "createdAt": "2025-01-15T10:30:00"
  }
}
```

**Response Fields:**
- `jwtToken` (string) - JWT токен для использования в API
- `tokenType` (string) - Тип токена (всегда "Bearer")
- `expiresIn` (number) - Время жизни токена в секундах (по умолчанию: 2592000 = 30 дней)
- `user` (object) - Данные пользователя:
  - `id` (number) - ID пользователя
  - `email` (string) - Email пользователя
  - `name` (string) - Имя пользователя
  - `avatarUrl` (string, nullable) - URL аватара (для Google - ссылка на Google фото, для Apple - null)
  - `oauthProvider` (string, nullable) - OAuth провайдер ("google", "apple", или null для обычных пользователей)
  - `roles` (array) - Роли пользователя
  - `createdAt` (string) - Дата создания аккаунта

**Примеры для разных провайдеров:**

1. **Google OAuth:**
```json
{
  "provider": "google",
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU5N2JhOGI4ZTk1OGU1..."
}
```

2. **Apple OAuth:**
```json
{
  "provider": "apple",
  "idToken": "eyJraWQiOiJlWGF1bm1MIiwiYWxnIjoiUlMyNTYifQ...",
  "authorizationCode": "c1234567890abcdef.0.ruy.vZ1234567890"
}
```

**Errors:**
- 400 Bad Request - Неподдерживаемый провайдер или невалидный формат запроса
  ```json
  {
    "timestamp": "2025-01-15T10:30:00Z",
    "status": 400,
    "error": "Bad Request",
    "message": "Unsupported OAuth provider: facebook",
    "path": "/my-food/auth/oauth"
  }
  ```
- 401 Unauthorized - ID token не прошел верификацию (невалидный, expired, или подпись не совпадает)
  ```json
  {
    "timestamp": "2025-01-15T10:30:00Z",
    "status": 401,
    "error": "Unauthorized",
    "message": "Failed to verify Google token: Invalid ID token",
    "path": "/my-food/auth/oauth"
  }
  ```
- 409 Conflict - Email уже зарегистрирован с другим OAuth провайдером
  ```json
  {
    "timestamp": "2025-01-15T10:30:00Z",
    "status": 409,
    "error": "Conflict",
    "message": "Email already registered with APPLE",
    "path": "/my-food/auth/oauth"
  }
  ```

**Логика работы:**

1. **Новый пользователь**: Если пользователя с таким email не существует - создается новый пользователь без пароля (только OAuth)
2. **Существующий OAuth пользователь**: Если пользователь уже входил через этот провайдер - возвращается JWT токен
3. **Связывание аккаунта**: Если пользователь зарегистрирован с паролем, но входит через OAuth в первый раз - OAuth провайдер привязывается к существующему аккаунту
4. **Конфликт провайдеров**: Если пользователь уже использует другой OAuth провайдер (например, зарегистрирован через Google, но пытается войти через Apple) - возвращается ошибка 409

**Примечания:**
- OAuth пользователи не могут изменить пароль (у них нет пароля)
- Можно иметь аккаунт одновременно с паролем и OAuth провайдером (после связывания)
- ID token должен быть получен на клиенте (мобильном приложении) через официальные SDK Google/Apple
- Верификация ID token происходит на сервере для безопасности
- Avatar URL для Google - прямая ссылка на Google фото, для Apple - null (Apple не предоставляет аватары)

**Детальная документация:**  
См. [OAUTH2_IMPLEMENTATION_GUIDE.md](./OAUTH2_IMPLEMENTATION_GUIDE.md) для полной инструкции по интеграции OAuth2.

---

## 3. Профиль пользователя

### 3.1. Создание профиля

**Endpoint:**
```
POST /my-food/user-profile
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "height": 180,
  "weight": 75,
  "gender": "MALE",
  "birthday": "1990-05-15",
  "targetWeightType": "LOSE",
  "targetWeight": 70.0,
  "physicalActivityLevel": "SECOND",
  "dayLimitCal": 1800,
  "timezone": "Europe/Moscow"
}
```

**Примечание:** Все поля обязательные кроме `targetWeightType`, `targetWeight`, `physicalActivityLevel` и `dayLimitCal`. Поле `timezone` обязательно и должно быть в формате IANA (например, "Europe/Moscow", "America/New_York", "Asia/Tokyo").

**Enum значения:**
- `gender`: `MALE`, `FEMALE`
- `target_weight_type`: `LOSE` (0.8), `SAVE` (1.0), `GAIN` (1.2)
- `physical_activity_level`: `FIRST` (1.2), `SECOND` (1.375), `THIRD` (1.55), `FOURTH` (1.725), `FIFTH` (1.9)

**Response (201 Created):**
```json
{
  "id": 1,
  "userId": 1,
  "height": 180,
  "weight": 75,
  "gender": "MALE",
  "birthday": "1990-05-15",
  "targetWeightType": "LOSE",
  "targetWeight": 70.0,
  "physicalActivityLevel": "SECOND",
  "dayLimitCal": 1800,
  "timezone": "UTC",
  "bmi": 23.15,
  "recommendedCalories": 2400.0,
  "createdAt": "2024-10-20T12:00:00Z",
  "updatedAt": "2024-10-20T12:00:00Z"
}
```

**Errors:**
- 409: Профиль уже существует для этого пользователя
- 400: Невалидные данные (вес < 30, рост < 100, и т.д.)

**Автоматическое создание истории взвешивания:**
При создании профиля автоматически создается первая запись в истории взвешивания (Weight History) с текущим весом пользователя и заметкой "Initial weight". Это позволяет сразу отслеживать динамику веса с момента создания профиля. Запись доступна через `GET /my-food/weight-history/latest`.

### 3.2. Получение профиля

**Endpoint:**
```
GET /my-food/user-profile
Headers: Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "userId": 1,
  "height": 180,
  "weight": 75,
  "gender": "MALE",
  "birthday": "1990-05-15",
  "targetWeightType": "LOSE",
  "targetWeight": 70.0,
  "physicalActivityLevel": "SECOND",
  "dayLimitCal": 1800,
  "timezone": "UTC",
  "bmi": 23.15,
  "recommendedCalories": 2400.0,
  "createdAt": "2024-10-20T12:00:00Z",
  "updatedAt": "2024-10-20T12:00:00Z"
}
```

**Errors:**
- 404: Профиль не найден

### 3.3. Обновление профиля

**Endpoint:**
```
PUT /my-food/user-profile
Headers: Authorization: Bearer {token}
```

**Request Body:** (все поля опциональны, отправлять только измененные)
```json
{
  "weight": 73,
  "dayLimitCal": 1700,
  "timezone": "Europe/Moscow"
}
```

**Примечание:** `timezone` - часовой пояс пользователя в формате IANA (например, "Europe/Moscow", "America/New_York", "Asia/Tokyo").

**Response (200 OK):**
```json
{
  "id": 1,
  "userId": 1,
  "height": 180,
  "weight": 73,
  ...
  "updatedAt": "2024-10-21T10:00:00Z"
}
```

### 3.4. Удаление профиля

**Endpoint:**
```
DELETE /my-food/user-profile
Headers: Authorization: Bearer {token}
```

**Response (204 No Content)**

**Errors:**
- 404: Профиль не найден

---

## 4. Продукты

### 4.1. Создание продукта

**Endpoint:**
```
POST /my-food/product
Headers: Authorization: Bearer {token}
```

**Request Body (вариант 1 - с новым изображением):**
```json
{
  "name": "Гречка отварная",
  "proteins": 4.2,
  "fats": 1.1,
  "carbohydrates": 21.3,
  "calories": 110.0,
  "quantity": "100",
  "measurementType": "GRAM",
  "productCategoryId": "cereals",
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Request Body (вариант 2 - с существующим изображением, например из MealElement):**
```json
{
  "name": "Гречка отварная",
  "proteins": 4.2,
  "fats": 1.1,
  "carbohydrates": 21.3,
  "calories": 110.0,
  "quantity": "100",
  "measurementType": "GRAM",
  "productCategoryId": "cereals",
  "imageUrl": "http://minio.example.com/mealrush-images/images/550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

**Примечания:**
- Поля `imageBase64` и `imageUrl` опциональны
- Если передан `imageBase64` - будет загружено новое изображение в S3
- Если передан `imageUrl` - будет переиспользовано существующее изображение
- Если переданы оба поля - приоритет у `imageBase64` (будет загружено новое)
- Изображения автоматически обрабатываются: resize до 1200x1200px, сжатие 85%, конвертация в JPG

**Measurement types:**
- `GRAM`, `KILOGRAM`, `LITER`, `MILLILITER`, `PIECE`, `UNIT`

**Response (201 Created):**
```json
{
  "id": 123,
  "userId": 1,
  "name": "Гречка отварная",
  "proteins": 4.2,
  "fats": 1.1,
  "carbohydrates": 21.3,
  "calories": 110.0,
  "quantity": "100",
  "measurementType": "GRAM",
  "productCategoryId": "cereals",
  "imageUrl": "http://minio.example.com/mealrush-images/images/550e8400-e29b-41d4-a716-446655440000.jpg",
  "source": null,
  "createdAt": "2024-10-20T12:00:00Z"
}
```

**Errors:**
- 400: Невалидные данные
- 409: Продукт с таким кодом уже существует (если указан code)

### 4.2. Получение продукта

**Endpoint:**
```
GET /my-food/product/{id}
Headers: Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 123,
  "userId": 1,
  "name": "Гречка отварная",
  ...
}
```

**Errors:**
- 404: Продукт не найден
- 403: Продукт принадлежит другому пользователю (для пользовательских)

### 4.3. Обновление продукта

**Endpoint:**
```
PUT /my-food/product/{id}
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Гречка отварная домашняя",
  "proteins": 4.5,
  "fats": 1.2,
  "carbohydrates": 22.0,
  "calories": 115.0,
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Примечания:**
- Все поля опциональны. ID передается в URL path
- Если передан `imageBase64` - будет загружено НОВОЕ изображение (старое останется в S3 для других записей)
- Если `imageBase64` не передан - текущее изображение останется без изменений
- Нельзя напрямую изменить `imageUrl` через API (только через загрузку нового `imageBase64`)

**Response (200 OK):**
```json
{
  "id": 123,
  "name": "Гречка отварная домашняя",
  "proteins": 4.5,
  "fats": 1.2,
  "carbohydrates": 22.0,
  "calories": 115.0,
  "imageUrl": "http://minio.example.com/mealrush-images/images/a7b8c9d0-1234-5678-90ab-cdef12345678.jpg",
  "updatedAt": "2024-10-21T10:00:00Z"
}
```

**Errors:**
- 403: Можно редактировать только свои продукты
- 404: Продукт не найден

### 4.4. Удаление продукта

**Endpoint:**
```
DELETE /my-food/product/{id}
Headers: Authorization: Bearer {token}
```

**Response (204 No Content)**

**Errors:**
- 403: Можно удалять только свои продукты
- 404: Продукт не найден
- 409: Продукт используется в meal_elements (нельзя удалить)

### 4.5. Список своих продуктов

**Endpoint:**
```
GET /my-food/product?page=0&size=20
Headers: Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (int, default: 0) - номер страницы
- `size` (int, default: 20, max: 100) - размер страницы
- `name` (string, optional) - подстрока для фильтрации по названию (case-insensitive)

**Примеры:**
```
/product?page=0&size=20
/product?page=0&size=20&name=гречка
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 123,
      "userId": 1,
      "name": "Гречка отварная",
      ...
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 5,
  "totalPages": 1
}
```

### 4.6. Поиск продуктов по названию

**Endpoint:**
```
GET /my-food/product/search/name?name={query}&page=0&size=20
Headers: Authorization: Bearer {token}
```

**Примеры:**
```
/product/search/name?name=гречка
/product/search/name?name=молоко&page=0&size=10
```

**Логика поиска:**
- Поиск использует комбинацию методов для максимальной релевантности:
  - Поиск по подстроке (LIKE, case-insensitive)
  - Fulltext search (PostgreSQL to_tsvector с русской морфологией)
  - Trigram similarity (pg_trgm расширение)
- Возвращает все продукты, соответствующие запросу: свои, общие и продукты других пользователей
- **Сортировка по релевантности** (от максимального совпадения к минимальному):
  1. Точное совпадение (case-insensitive) - максимальный приоритет
  2. Начинается с запроса - высокий приоритет
  3. Высокая trigram similarity - средний приоритет
  4. Fulltext search rank - базовый приоритет
  
**Пример:** При запросе "молоко" результаты будут отсортированы:
1. "Молоко" (точное совпадение)
2. "Молоко коровье" (начинается с запроса)
3. "Молоко козье" (начинается с запроса)
4. "Сгущенное молоко" (высокая similarity)
5. "Шоколадное молоко" (средняя similarity)
6. "Молочный коктейль" (низкая similarity)

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 456,
      "userId": null,
      "name": "Гречка ядрица",
      "source": "open_food_facts",
      ...
    },
    {
      "id": 123,
      "userId": 1,
      "name": "Гречка отварная",
      ...
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 2,
  "totalPages": 1
}
```

### 4.7. Поиск по штрихкоду

**Endpoint:**
```
GET /my-food/product/search/barcode/{barcode}?page=0&size=20
Headers: Authorization: Bearer {token}
```

**Примеры:**
```
/product/search/barcode/4607065597924
/product/search/barcode/7290002066454
```

**Логика:**
1. Поиск в собственной БД
2. Если не найден → запрос к Open Food Facts
3. Если не найден → запрос к EAN-DB
4. Если не найден → запрос к Barcode-list.ru
5. Если найден во внешнем источнике → сохранение в БД как общий продукт

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 789,
      "userId": null,
      "name": "Молоко 3.2%",
      "code": "4607065597924",
      "source": "open_food_facts",
      ...
    }
  ],
  ...
}
```

**Errors:**
- 404: Продукт с таким штрихкодом не найден ни в одном источнике

---

## 5. Категории продуктов

### 5.1. Получение списка категорий

**Endpoint:**
```
GET /my-food/product_category?page=0&size=100
Headers: Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": "dairy",
      "name": "Молочные продукты"
    },
    {
      "id": "meat",
      "name": "Мясо и птица"
    },
    {
      "id": "fish",
      "name": "Рыба и морепродукты"
    },
    {
      "id": "vegetables",
      "name": "Овощи"
    },
    {
      "id": "fruits",
      "name": "Фрукты"
    },
    {
      "id": "cereals",
      "name": "Крупы и злаки"
    },
    {
      "id": "bakery",
      "name": "Хлебобулочные изделия"
    },
    {
      "id": "sweets",
      "name": "Сладости"
    },
    {
      "id": "drinks",
      "name": "Напитки"
    },
    {
      "id": "other",
      "name": "Остальное"
    }
  ],
  "page": 0,
  "size": 100,
  "totalElements": 10,
  "totalPages": 1
}
```

### 5.2. Получение категории по ID

**Endpoint:**
```
GET /my-food/product_category/{id}
Headers: Authorization: Bearer {token}
```

**Примеры:**
```
/product_category/dairy
/product_category/cereals
```

**Response (200 OK):**
```json
{
  "id": "dairy",
  "name": "Молочные продукты"
}
```

**Errors:**
- 404: Категория не найдена

---

## 6. Приемы пищи

### 6.1. Создание приема пищи

**Endpoint:**
```
POST /my-food/meal
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "mealType": "BREAKFAST",
  "dateTime": "2024-10-20T08:30:00",
  "name": "Завтрак"
}
```

**Примечание:** Поле `name` опционально.

**Meal types:**
- `BREAKFAST` - завтрак
- `LUNCH` - обед
- `DINNER` - ужин
- `SUPPER` - полдник
- `LATE_SUPPER` - поздний ужин

**Response (201 Created):**
```json
{
  "id": 1,
  "userId": 1,
  "mealType": "BREAKFAST",
  "name": "Завтрак",
  "dateTime": "2024-10-20T08:30:00",
  "createdAt": "2024-10-20T12:00:00Z"
}
```

### 6.2. Получение списка приемов пищи (с пагинацией)

**Endpoint:**
```
GET /my-food/meal?page=0&size=20
Headers: Authorization: Bearer {token}
```

**Примеры:**
```
/meal?page=0&size=20
/meal?page=1&size=50
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "userId": 1,
      "mealType": "BREAKFAST",
      "name": null,
      "dateTime": "2024-10-20T08:30:00"
    },
    {
      "id": 2,
      "userId": 1,
      "mealType": "LUNCH",
      "name": null,
      "dateTime": "2024-10-20T13:00:00"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 15,
  "totalPages": 1
}
```

### 6.3. Получение приемов пищи за дату

**Endpoint:**
```
GET /my-food/meal/findByDate?date={YYYY-MM-DD}
Headers: Authorization: Bearer {token}
```

**Примеры:**
```
/meal/findByDate?date=2024-10-20
/meal/findByDate?date=2024-10-21
```

**Примечание:** 
- Возвращает список БЕЗ пагинации (обычно за день мало приемов пищи)
- **Включает элементы приемов пищи** в одном запросе для оптимизации (избегает N+1 запросов)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "mealType": "BREAKFAST",
    "name": null,
    "dateTime": "2024-10-20T08:30:00",
    "createdAt": "2024-10-20T08:00:00Z",
    "updatedAt": "2024-10-20T08:00:00Z",
    "elements": [
      {
        "id": 1,
        "mealId": 1,
        "parentProductId": 123,
        "name": "Гречка отварная",
        "proteins": 6.3,
        "fats": 1.65,
        "carbohydrates": 31.95,
        "calories": 165.0,
        "quantity": "150",
        "measurementType": "GRAM",
        "code": null,
        "imageUrl": "http://minio.example.com/mealrush-images/images/b2c3d4e5.jpg",
        "defaultProteins": 4.2,
        "defaultFats": 1.1,
        "defaultCarbohydrates": 21.3,
        "defaultCalories": 110.0,
        "defaultQuantity": "100",
        "createdAt": "2024-10-20T08:05:00Z",
        "updatedAt": "2024-10-20T08:05:00Z"
      }
    ]
  },
  {
    "id": 2,
    "userId": 1,
    "mealType": "LUNCH",
    "name": null,
    "dateTime": "2024-10-20T13:00:00",
    "createdAt": "2024-10-20T12:30:00Z",
    "updatedAt": "2024-10-20T12:30:00Z",
    "elements": []
  }
]
```

### 6.4. Получение приема пищи

**Endpoint:**
```
GET /my-food/meal/{id}
Headers: Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "userId": 1,
  "mealType": "BREAKFAST",
  "name": null,
  "dateTime": "2024-10-20T08:30:00"
}
```

**Errors:**
- 404: Прием пищи не найден
- 403: Нет доступа к приему пищи

### 6.5. Обновление приема пищи

**Endpoint:**
```
PUT /my-food/meal/{id}
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "mealType": "BREAKFAST",
  "dateTime": "2024-10-20T09:00:00",
  "name": "Поздний завтрак"
}
```

**Примечание:** Все поля опциональны. ID передается в URL path.

**Response (200 OK):** обновленный Meal

### 6.6. Удаление приема пищи

**Endpoint:**
```
DELETE /my-food/meal/{id}
Headers: Authorization: Bearer {token}
```

**Response (204 No Content)**

**Примечание:** При удалении Meal каскадно удаляются все связанные MealElement

---

## 6.7. Шаблоны приемов пищи

### 6.7.1. Создание шаблона из существующего приема пищи

**Endpoint:**
```
POST /my-food/meal-template/from-meal?mealId={mealId}
Headers: Authorization: Bearer {token}
```

**Описание:**
Создает шаблон прием пищи из существующего приема пищи. Все элементы приема пищи копируются в шаблон.

**Query Parameters:**
- `mealId` (Long, required) - ID существующего приема пищи

**Response (201 Created):**
```json
{
  "id": 1,
  "userId": 1,
  "mealType": "BREAKFAST",
  "name": "Завтрак",
  "createdAt": "2024-10-20T12:00:00Z",
  "updatedAt": "2024-10-20T12:00:00Z",
  "elements": [
    {
      "id": 1,
      "templateId": 1,
      "parentProductId": 123,
      "name": "Гречка отварная",
      "proteins": 6.3,
      "fats": 1.65,
      "carbohydrates": 31.95,
      "calories": 165.0,
      "quantity": "150",
      "measurementType": "GRAM",
      "imageUrl": "http://minio.../images/uuid.jpg",
      "defaultProteins": 4.2,
      "defaultFats": 1.1,
      "defaultCarbohydrates": 21.3,
      "defaultCalories": 110.0,
      "defaultQuantity": "100"
    }
  ]
}
```

**Errors:**
- 404: Прием пищи не найден
- 403: Нет доступа к приему пищи
- 400: Прием пищи не содержит элементов

### 6.7.2. Создание шаблона

**Endpoint:**
```
POST /my-food/meal-template
Headers: Authorization: Bearer {token}
```

**Request Body (вариант 1 - из существующего приема пищи):**
```json
{
  "mealId": 1
}
```

**Request Body (вариант 2 - создать с нуля):**
```json
{
  "mealType": "BREAKFAST",
  "name": "Мой завтрак"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "userId": 1,
  "mealType": "BREAKFAST",
  "name": "Мой завтрак",
  "createdAt": "2024-10-20T12:00:00Z",
  "updatedAt": "2024-10-20T12:00:00Z",
  "elements": []
}
```

**Примечание:** Если указан `mealId`, шаблон создается из существующего приема пищи со всеми элементами. Если `mealId` не указан, создается пустой шаблон (элементы можно добавить позже).

### 6.7.3. Получение шаблона

**Endpoint:**
```
GET /my-food/meal-template/{id}
Headers: Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "userId": 1,
  "mealType": "BREAKFAST",
  "name": "Мой завтрак",
  "createdAt": "2024-10-20T12:00:00Z",
  "updatedAt": "2024-10-20T12:00:00Z",
  "elements": [
    {
      "id": 1,
      "templateId": 1,
      "parentProductId": 123,
      "name": "Гречка отварная",
      "proteins": 6.3,
      "fats": 1.65,
      "carbohydrates": 31.95,
      "calories": 165.0,
      "quantity": "150",
      "measurementType": "GRAM",
      "imageUrl": "http://minio.../images/uuid.jpg",
      "defaultProteins": 4.2,
      "defaultFats": 1.1,
      "defaultCarbohydrates": 21.3,
      "defaultCalories": 110.0,
      "defaultQuantity": "100"
    }
  ]
}
```

**Errors:**
- 404: Шаблон не найден
- 403: Нет доступа к шаблону

### 6.7.4. Обновление шаблона

**Endpoint:**
```
PUT /my-food/meal-template/{id}
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "mealType": "LUNCH",
  "name": "Мой обед"
}
```

**Примечание:** Все поля опциональны. ID передается в URL path.

**Response (200 OK):**
Обновленный шаблон с элементами (формат как в GET).

**Errors:**
- 404: Шаблон не найден
- 403: Нет доступа к шаблону

### 6.7.5. Удаление шаблона

**Endpoint:**
```
DELETE /my-food/meal-template/{id}
Headers: Authorization: Bearer {token}
```

**Response (204 No Content)**

**Примечание:** При удалении шаблона каскадно удаляются все связанные элементы шаблона.

**Errors:**
- 404: Шаблон не найден
- 403: Нет доступа к шаблону

### 6.7.6. Список шаблонов пользователя

**Endpoint:**
```
GET /my-food/meal-template?page=0&size=20
Headers: Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "userId": 1,
      "mealType": "BREAKFAST",
      "name": "Мой завтрак",
      "createdAt": "2024-10-20T12:00:00Z",
      "updatedAt": "2024-10-20T12:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 5,
  "totalPages": 1
}
```

**Примечание:** Элементы шаблонов не включаются в список (только при получении конкретного шаблона).

### 6.7.7. Использование шаблона для создания приема пищи

**Endpoint:**
```
POST /my-food/meal-template/{id}/use
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "dateTime": "2024-10-21T08:30:00",
  "mealType": "BREAKFAST",
  "name": "Завтрак"
}
```

**Поля:**
- `dateTime` (LocalDateTime, required) - дата и время приема пищи
- `mealType` (String, optional) - тип приема пищи (если не указан, используется из шаблона)
- `name` (String, optional) - название приема пищи (если не указано, используется из шаблона)

**Response (201 Created):**
```json
{
  "id": 10,
  "userId": 1,
  "mealType": "BREAKFAST",
  "name": "Завтрак",
  "dateTime": "2024-10-21T08:30:00",
  "createdAt": "2024-10-21T08:30:00Z",
  "updatedAt": "2024-10-21T08:30:00Z"
}
```

**Описание:**
Создает новый прием пищи на основе шаблона. Все элементы шаблона копируются в новый прием пищи с сохранением всех данных (КБЖУ, изображения, ссылки на продукты).

**Errors:**
- 404: Шаблон не найден
- 403: Нет доступа к шаблону
- 400: Шаблон не содержит элементов

### 6.7.8. Управление элементами шаблона

#### 6.7.8.1. Создание элемента шаблона

**Endpoint:**
```
POST /my-food/meal-template-element
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "templateId": 1,
  "parentProductId": 123,
  "name": "Гречка отварная",
  "proteins": 6.3,
  "fats": 1.65,
  "carbohydrates": 31.95,
  "calories": 165.0,
  "quantity": "150",
  "measurementType": "GRAM",
  "code": "1234567890123",
  "imageUrl": "http://minio.../images/uuid.jpg",
  "defaultProteins": 4.2,
  "defaultFats": 1.1,
  "defaultCarbohydrates": 21.3,
  "defaultCalories": 110.0,
  "defaultQuantity": "100",
  "imageBase64": "data:image/jpeg;base64,..."
}
```

**Поля:**
- `templateId` (Long, required) - ID шаблона
- `parentProductId` (Long, optional) - ID продукта-источника
- `name` (String, required) - название элемента
- `proteins`, `fats`, `carbohydrates`, `calories` (BigDecimal, optional) - КБЖУ
- `quantity` (String, optional) - количество
- `measurementType` (String, optional) - тип измерения (GRAM, PIECE, etc.)
- `code` (String, optional) - штрих-код продукта
- `imageUrl` (String, optional) - URL изображения
- `defaultProteins`, `defaultFats`, `defaultCarbohydrates`, `defaultCalories` (BigDecimal, optional) - базовые значения КБЖУ
- `defaultQuantity` (String, optional) - базовое количество
- `imageBase64` (String, optional) - изображение в формате base64

**Примечание:** Если указан `parentProductId`, базовые значения КБЖУ заполняются автоматически из продукта, и КБЖУ пересчитываются для указанного `quantity`.

**Response (201 Created):**
```json
{
  "id": 1,
  "templateId": 1,
  "parentProductId": 123,
  "name": "Гречка отварная",
  "proteins": 6.3,
  "fats": 1.65,
  "carbohydrates": 31.95,
  "calories": 165.0,
  "quantity": "150",
  "measurementType": "GRAM",
  "code": "1234567890123",
  "imageUrl": "http://minio.../images/uuid.jpg",
  "defaultProteins": 4.2,
  "defaultFats": 1.1,
  "defaultCarbohydrates": 21.3,
  "defaultCalories": 110.0,
  "defaultQuantity": "100",
  "createdAt": "2024-10-20T12:00:00Z",
  "updatedAt": "2024-10-20T12:00:00Z"
}
```

**Errors:**
- 400: Невалидные данные (валидация полей)
- 404: Шаблон не найден
- 403: Нет доступа к шаблону
- 404: Продукт не найден (если указан parentProductId)

#### 6.7.8.2. Получение элемента шаблона

**Endpoint:**
```
GET /my-food/meal-template-element/{id}
Headers: Authorization: Bearer {token}
```

**Response (200 OK):**
Формат как в создании элемента.

**Errors:**
- 404: Элемент не найден
- 403: Нет доступа к шаблону

#### 6.7.8.3. Обновление элемента шаблона

**Endpoint:**
```
PUT /my-food/meal-template-element/{id}
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Гречка отварная (обновлено)",
  "quantity": "200",
  "proteins": 8.4,
  "fats": 2.2,
  "carbohydrates": 42.6,
  "calories": 220.0,
  "measurementType": "GRAM",
  "imageUrl": "http://minio.../images/new-uuid.jpg",
  "imageBase64": "data:image/jpeg;base64,..."
}
```

**Поля:** Все поля опциональны. При изменении `quantity` автоматически пересчитываются КБЖУ на основе `default` значений (если они заданы).

**Response (200 OK):**
Обновленный элемент (формат как в создании).

**Errors:**
- 400: Невалидные данные
- 404: Элемент не найден
- 403: Нет доступа к шаблону

#### 6.7.8.4. Удаление элемента шаблона

**Endpoint:**
```
DELETE /my-food/meal-template-element/{id}
Headers: Authorization: Bearer {token}
```

**Response (204 No Content)**

**Errors:**
- 404: Элемент не найден
- 403: Нет доступа к шаблону

#### 6.7.8.5. Получение списка элементов шаблона

**Endpoint:**
```
GET /my-food/meal-template-element/template/{templateId}?page=0&size=50
Headers: Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (int, default: 0) - номер страницы
- `size` (int, default: 50, max: 100) - размер страницы

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "templateId": 1,
      "parentProductId": 123,
      "name": "Гречка отварная",
      "proteins": 6.3,
      "fats": 1.65,
      "carbohydrates": 31.95,
      "calories": 165.0,
      "quantity": "150",
      "measurementType": "GRAM",
      "code": "1234567890123",
      "imageUrl": "http://minio.../images/uuid.jpg",
      "defaultProteins": 4.2,
      "defaultFats": 1.1,
      "defaultCarbohydrates": 21.3,
      "defaultCalories": 110.0,
      "defaultQuantity": "100",
      "createdAt": "2024-10-20T12:00:00Z",
      "updatedAt": "2024-10-20T12:00:00Z"
    }
  ],
  "page": 0,
  "size": 50,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

**Errors:**
- 404: Шаблон не найден
- 403: Нет доступа к шаблону

---

## 7. Элементы приема пищи

### 7.1. Создание элемента

**Endpoint:**
```
POST /my-food/meal_element
Headers: Authorization: Bearer {token}
```

**Request Body (вариант 1 - с новым изображением):**
```json
{
  "mealId": 1,
  "parentProductId": 123,
  "name": "Гречка отварная",
  "proteins": 6.3,
  "fats": 1.65,
  "carbohydrates": 31.95,
  "calories": 165.0,
  "quantity": "150",
  "measurementType": "GRAM",
  "defaultProteins": 4.2,
  "defaultFats": 1.1,
  "defaultCarbohydrates": 21.3,
  "defaultCalories": 110.0,
  "defaultQuantity": "100",
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Request Body (вариант 2 - с существующим изображением, например из Product):**
```json
{
  "mealId": 1,
  "parentProductId": 123,
  "name": "Гречка отварная",
  "proteins": 6.3,
  "fats": 1.65,
  "carbohydrates": 31.95,
  "calories": 165.0,
  "quantity": "150",
  "measurementType": "GRAM",
  "defaultProteins": 4.2,
  "defaultFats": 1.1,
  "defaultCarbohydrates": 21.3,
  "defaultCalories": 110.0,
  "defaultQuantity": "100",
  "imageUrl": "http://minio.example.com/mealrush-images/images/550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

**Примечания:** 
- `parentProductId` опционально, если элемент создается из продукта
- Поля `imageBase64` и `imageUrl` опциональны
- Если передан `imageBase64` - будет загружено новое изображение в S3
- Если передан `imageUrl` - будет переиспользовано существующее изображение (удобно при создании из Product)
- Если переданы оба поля - приоритет у `imageBase64`
- Изображения автоматически обрабатываются: resize до 1200x1200px, сжатие 85%, конвертация в JPG

**Расчет actual vs default:**
```javascript
// Клиент должен рассчитать:
const actual_proteins = (default_proteins / 100) * quantity;
// actual_proteins = (4.2 / 100) * 150 = 6.3
```

**Response (201 Created):**
```json
{
  "id": 1,
  "mealId": 1,
  "parentProductId": 123,
  "name": "Гречка отварная",
  "proteins": 6.3,
  "fats": 1.65,
  "carbohydrates": 31.95,
  "calories": 165.0,
  "quantity": "150",
  "measurementType": "GRAM",
  "defaultProteins": 4.2,
  "defaultFats": 1.1,
  "defaultCarbohydrates": 21.3,
  "defaultCalories": 110.0,
  "defaultQuantity": "100",
  "imageUrl": "http://minio.example.com/mealrush-images/images/b2c3d4e5-5678-9012-34ab-56789abcdef0.jpg",
  "createdAt": "2024-10-20T12:00:00Z"
}
```

### 7.2. Получение элемента приема пищи по ID

**Endpoint:**
```
GET /my-food/meal_element/{id}
Headers: Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "mealId": 1,
  "parentProductId": 123,
  "name": "Гречка отварная",
  "proteins": 6.3,
  "fats": 1.65,
  "carbohydrates": 31.95,
  "calories": 165.0,
  "quantity": "150",
  "measurementType": "GRAM",
  ...
}
```

**Errors:**
- 404: Элемент не найден
- 403: Нет доступа к элементу

### 7.3. Получение элементов приема пищи

**Endpoint:**
```
GET /my-food/meal_element/meal/{mealId}?page=0&size=50
Headers: Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Гречка отварная",
      "proteins": 6.3,
      "fats": 1.65,
      "carbohydrates": 31.95,
      "calories": 165.0,
      "quantity": "150",
      ...
    }
  ],
  "page": 0,
  "size": 50,
  "totalElements": 3,
  "totalPages": 1
}
```

### 7.4. Обновление элемента

**Endpoint:**
```
PUT /my-food/meal_element/{id}
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "quantity": "200",
  "proteins": 8.4,
  "fats": 2.2,
  "carbohydrates": 42.6,
  "calories": 220.0,
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Примечания:**
- Все поля опциональны. ID передается в URL path
- Если передан `imageBase64` - будет загружено НОВОЕ изображение (старое останется в S3 для других записей)
- Если `imageBase64` не передан - текущее изображение останется без изменений
- Нельзя напрямую изменить `imageUrl` через API (только через загрузку нового `imageBase64`)

**Response (200 OK):** обновленный MealElement с новым `imageUrl` если изображение было заменено

### 7.5. Удаление элемента

**Endpoint:**
```
DELETE /my-food/meal_element/{id}
Headers: Authorization: Bearer {token}
```

**Response (204 No Content)**

---

## 8. Избранное

### 8.1. Добавление в избранное

**Endpoint:**
```
POST /my-food/favorite/{productId}
Headers: Authorization: Bearer {token}
```

**Response (201 Created)**

**Errors:**
- 404: Продукт не найден
- 409: Продукт уже в избранном

### 8.2. Удаление из избранного

**Endpoint:**
```
DELETE /my-food/favorite/{productId}
Headers: Authorization: Bearer {token}
```

**Response (204 No Content)**

**Errors:**
- 404: Продукт не найден в избранном

### 8.3. Получение избранных продуктов

**Endpoint:**
```
GET /my-food/favorite?page=0&size=20
Headers: Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (int, default: 0) - номер страницы
- `size` (int, default: 20, max: 100) - размер страницы
- `name` (string, optional) - подстрока для фильтрации по названию (case-insensitive)

**Примеры:**
```
/favorite?page=0&size=20
/favorite?page=0&size=20&name=курица
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 123,
      "name": "Гречка отварная",
      "proteins": 4.2,
      ...
    },
    {
      "id": 456,
      "name": "Куриная грудка",
      ...
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 2,
  "totalPages": 1
}
```

**Примечание:** Возвращает полные данные о продуктах, а не объекты Favorite

---

## 9. Изображения

### 9.1. Получение изображения

**Архитектура хранения:**
- Изображения хранятся в MinIO S3 (публичный bucket)
- Структура: `images/{uuid}.jpg` (UUID для безопасности)
- Прямой доступ по публичному URL (без проксирования через backend)

**URL Format:**
```
http://minio.example.com/mealrush-images/images/550e8400-e29b-41d4-a716-446655440000.jpg
```

**Примеры URL в разных окружениях:**

**Development:**
```
http://localhost:9000/mealrush-images/images/550e8400-e29b-41d4-a716-446655440000.jpg
```

**Production:**
```
http://s3.mealrush.com/mealrush-images/images/550e8400-e29b-41d4-a716-446655440000.jpg
```

**Загрузка изображения:**
- Мобильное приложение загружает изображение напрямую из S3 по URL
- Кэширование изображений рекомендуется на стороне клиента
- HTTP Cache-Control headers настроены для долгого кэширования

**Как получить URL:**
- URL возвращается автоматически в поле `imageUrl` при создании/получении Product или MealElement
- Клиент просто использует этот URL для загрузки изображения

**Безопасность:**
- UUID в имени файла предотвращает перебор изображений
- Публичный доступ только для чтения
- Без знания точного UUID невозможно получить доступ к изображению

**Примечание:** 
- Изображения загружаются через `imageBase64` в эндпоинтах создания (POST /product, POST /meal_element)
- Можно переиспользовать существующее изображение через поле `imageUrl`
- Неиспользуемые изображения автоматически удаляются раз в неделю (Orphan Detection)

---

## 11. Анализ блюд с помощью AI

### 11.1. Анализ блюда по фотографии

**Endpoint:**
```
POST /my-food/meal_element/analyze-photo
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "language": "ru",
  "comment": "Это домашний обед с макаронами и котлетой",
  "analysisMode": "AUTO"
}
```

**Поля:**
- `imageBase64` (обязательное) - base64 строка изображения
- `language` (опциональное) - язык для распознавания (`ru`/`en`, по умолчанию `ru`)
- `comment` (опциональное) - комментарий пользователя для более точного анализа блюда (макс. 500 символов)
- `analysisMode` (опциональное) - режим анализа блюда (по умолчанию `AUTO`):
  - `SIMPLE` - анализировать блюдо как одно целое (одно наименование с общими КБЖУ)
  - `DETAILED` - разбить блюдо на отдельные ингредиенты с индивидуальными КБЖУ
  - `AUTO` - AI сам решает (простые блюда как одно целое, сложные - разбивает на ингредиенты)

**Response (200 OK):**
```json
{
  "ingredients": [
    {
      "name": "Рис отварной",
      "quantity": 150,
      "measurement_type": "GRAM",
      "proteins": 3.8,
      "fats": 0.7,
      "carbohydrates": 37.5,
      "calories": 172.5
    },
    {
      "name": "Куриная грудка",
      "quantity": 120,
      "measurement_type": "GRAM",
      "proteins": 37.2,
      "fats": 2.4,
      "carbohydrates": 0.6,
      "calories": 174.0
    },
    {
      "name": "Овощной салат",
      "quantity": 100,
      "measurement_type": "GRAM",
      "proteins": 1.5,
      "fats": 0.3,
      "carbohydrates": 5.2,
      "calories": 28.0
    }
  ],
  "total_nutrients": {
    "proteins": 42.5,
    "fats": 3.4,
    "carbohydrates": 43.3,
    "calories": 374.5
  },
  "confidence": 0.85,
  "notes": "AI оценка, рекомендуется проверить количество"
}
```

**Errors:**
- 400: Изображение не предоставлено или невалидный формат
- 408: Timeout (> 40 сек)
- 503: OpenAI API недоступен

**Примечания:**
- Клиент должен позволить пользователю откорректировать данные перед сохранением
- Комментарий пользователя помогает AI более точно определить ингредиенты и их количество

### 11.2. Анализ блюда по текстовому описанию

**Endpoint:**
```
POST /my-food/meal_element/analyze-text
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "description": "Овсяная каша на молоке 200 грамм, банан 1 штука, мед чайная ложка",
  "language": "ru",
  "analysisMode": "AUTO"
}
```

**Поля:**
- `description` (обязательное) - текстовое описание блюда с ингредиентами (1-1000 символов)
- `language` (опциональное) - язык для анализа (`ru`/`en`, по умолчанию `ru`)
- `analysisMode` (опциональное) - режим анализа блюда (по умолчанию `AUTO`):
  - `SIMPLE` - анализировать блюдо как одно целое (одно наименование с общими КБЖУ)
  - `DETAILED` - разбить блюдо на отдельные ингредиенты с индивидуальными КБЖУ
  - `AUTO` - AI сам решает (простые блюда как одно целое, сложные - разбивает на ингредиенты)

**Response (200 OK):**
```json
{
  "ingredients": [
    {
      "name": "Овсяная каша на молоке",
      "quantity": 200,
      "measurement_type": "GRAM",
      "proteins": 6.8,
      "fats": 5.2,
      "carbohydrates": 28.4,
      "calories": 176.0
    },
    {
      "name": "Банан",
      "quantity": 120,
      "measurement_type": "GRAM",
      "proteins": 1.3,
      "fats": 0.4,
      "carbohydrates": 26.4,
      "calories": 108.0
    },
    {
      "name": "Мед",
      "quantity": 10,
      "measurement_type": "GRAM",
      "proteins": 0.1,
      "fats": 0.0,
      "carbohydrates": 8.2,
      "calories": 32.0
    }
  ],
  "total_nutrients": {
    "proteins": 8.2,
    "fats": 5.6,
    "carbohydrates": 63.0,
    "calories": 316.0
  },
  "confidence": 0.78,
  "notes": "Количество оценено на основе стандартных порций"
}
```

**Errors:**
- 400: Описание не предоставлено или невалидный формат
- 408: Timeout (> 40 сек)
- 503: OpenAI API недоступен

**Примечания:**
- Чем детальнее описание, тем точнее результат
- Рекомендуется указывать количество ингредиентов в описании
- Клиент должен позволить пользователю откорректировать данные перед сохранением

### 11.3. Анализ блюда по аудио описанию

**Endpoint:**
```
POST /my-food/meal_element/analyze-audio
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "audioBase64": "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAASW5mb...",
  "language": "ru",
  "comment": "Примерно стандартная порция",
  "analysisMode": "AUTO"
}
```

**Поля:**
- `audioBase64` (обязательное) - base64 строка аудио файла
- `language` (опциональное) - язык для транскрипции (`ru`/`en`, по умолчанию `ru`)
- `comment` (опциональное) - дополнительный контекст для анализа (макс. 500 символов)
- `analysisMode` (опциональное) - режим анализа блюда (по умолчанию `AUTO`):
  - `SIMPLE` - анализировать блюдо как одно целое (одно наименование с общими КБЖУ)
  - `DETAILED` - разбить блюдо на отдельные ингредиенты с индивидуальными КБЖУ
  - `AUTO` - AI сам решает (простые блюда как одно целое, сложные - разбивает на ингредиенты)

**Поддерживаемые форматы аудио:**
- mp3
- wav
- m4a
- webm

**Максимальный размер:** 25MB

**Процесс обработки (2 этапа):**
1. **Whisper API** транскрибирует аудио в текст
2. **GPT API** анализирует текст и определяет КБЖУ

**Response (200 OK):**
```json
{
  "ingredients": [
    {
      "name": "Гречка отварная",
      "quantity": 150,
      "measurement_type": "GRAM",
      "proteins": 6.3,
      "fats": 1.65,
      "carbohydrates": 31.95,
      "calories": 165.0
    },
    {
      "name": "Куриная котлета",
      "quantity": 100,
      "measurement_type": "GRAM",
      "proteins": 18.5,
      "fats": 8.2,
      "carbohydrates": 2.1,
      "calories": 152.0
    }
  ],
  "total_nutrients": {
    "proteins": 24.8,
    "fats": 9.85,
    "carbohydrates": 34.05,
    "calories": 317.0
  },
  "confidence": 0.72,
  "notes": "Транскрипция: 'Сегодня на обед гречка с куриной котлетой, примерно 150 грамм каши и 100 грамм котлеты'"
}
```

**Errors:**
- 400: Аудио не предоставлено или невалидный формат
- 408: Timeout (> 40 сек, учитывая транскрипцию и анализ)
- 503: OpenAI API недоступен

**Примечания:**
- Для лучшего результата говорите четко и указывайте количество
- Процесс занимает больше времени чем фото/текст анализ (транскрипция + анализ)
- В поле `notes` может быть включена транскрипция для проверки
- Клиент должен позволить пользователю откорректировать данные перед сохранением

### 11.4. Примеры использования режимов анализа

#### Режим SIMPLE (блюдо целиком)

**Когда использовать:**
- Простые напитки (кофе, чай, сок)
- Простые блюда без сложных компонентов
- Когда не нужна детальная разбивка

**Пример запроса:**
```json
POST /my-food/meal_element/analyze-photo
{
  "imageBase64": "data:image/jpeg;base64,...",
  "language": "ru",
  "comment": "Латте 350 мл",
  "analysisMode": "SIMPLE"
}
```

**Пример ответа:**
```json
{
  "ingredients": [
    {
      "name": "Латте",
      "quantity": 350,
      "measurement_type": "GRAM",
      "proteins": 7.0,
      "fats": 6.3,
      "carbohydrates": 12.6,
      "calories": 135
    }
  ],
  "total_nutrients": {
    "proteins": 7.0,
    "fats": 6.3,
    "carbohydrates": 12.6,
    "calories": 135
  },
  "confidence": 0.9,
  "notes": "Блюдо проанализировано как одно целое"
}
```

#### Режим DETAILED (детальная разбивка)

**Когда использовать:**
- Сложные блюда (салаты, супы, боулы)
- Когда нужна детальная информация по каждому компоненту
- Для точного учета макронутриентов

**Пример запроса:**
```json
POST /my-food/meal_element/analyze-photo
{
  "imageBase64": "data:image/jpeg;base64,...",
  "language": "ru",
  "comment": "Салат Цезарь с курицей",
  "analysisMode": "DETAILED"
}
```

**Пример ответа:**
```json
{
  "ingredients": [
    {
      "name": "Куриная грудка",
      "quantity": 120,
      "measurement_type": "GRAM",
      "proteins": 27.6,
      "fats": 3.6,
      "carbohydrates": 0.0,
      "calories": 150
    },
    {
      "name": "Салат Романо",
      "quantity": 80,
      "measurement_type": "GRAM",
      "proteins": 1.2,
      "fats": 0.2,
      "carbohydrates": 2.4,
      "calories": 16
    },
    {
      "name": "Сухарики",
      "quantity": 30,
      "measurement_type": "GRAM",
      "proteins": 2.4,
      "fats": 3.0,
      "carbohydrates": 15.0,
      "calories": 105
    },
    {
      "name": "Соус Цезарь",
      "quantity": 40,
      "measurement_type": "GRAM",
      "proteins": 1.2,
      "fats": 18.0,
      "carbohydrates": 2.0,
      "calories": 180
    },
    {
      "name": "Пармезан",
      "quantity": 20,
      "measurement_type": "GRAM",
      "proteins": 7.0,
      "fats": 6.0,
      "carbohydrates": 0.8,
      "calories": 86
    }
  ],
  "total_nutrients": {
    "proteins": 39.4,
    "fats": 30.8,
    "carbohydrates": 20.2,
    "calories": 537
  },
  "confidence": 0.85,
  "notes": "Все компоненты определены отдельно"
}
```

#### Режим AUTO (автоматический выбор)

**Когда использовать:**
- Когда не уверены, какой режим лучше подходит
- По умолчанию для всех запросов
- AI сам определит оптимальный подход

**Поведение AI:**
- **Простые блюда** → возвращает как одно целое (как SIMPLE)
  - Примеры: кофе, чай, сок, простой бутерброд
- **Сложные блюда** → разбивает на компоненты (как DETAILED)
  - Примеры: салаты, супы, гарниры с несколькими элементами

**Пример запроса:**
```json
POST /my-food/meal_element/analyze-text
{
  "description": "Капучино большой",
  "language": "ru",
  "analysisMode": "AUTO"
}
```

**Пример ответа (AI выбрал SIMPLE):**
```json
{
  "ingredients": [
    {
      "name": "Капучино",
      "quantity": 300,
      "measurement_type": "GRAM",
      "proteins": 6.0,
      "fats": 5.4,
      "carbohydrates": 10.8,
      "calories": 115
    }
  ],
  "total_nutrients": {
    "proteins": 6.0,
    "fats": 5.4,
    "carbohydrates": 10.8,
    "calories": 115
  },
  "confidence": 0.88,
  "notes": "Режим AUTO выбрал простой анализ: напиток не требует детальной разбивки"
}
```

**Рекомендации по использованию:**
- Используйте `AUTO` по умолчанию - AI хорошо определяет сложность блюда
- Используйте `SIMPLE` когда точно знаете, что блюдо простое (напитки, цельные блюда)
- Используйте `DETAILED` когда важна детальная информация по каждому компоненту
- Всегда проверяйте и корректируйте результаты перед сохранением

---

## 12. Примеры типичных flow

### 12.1. Регистрация и создание профиля

```javascript
// 1. Регистрация
POST /my-food/auth/user
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Иван"
}
→ Response: { id, email, name, roles, createdAt }

// 2. Получение токена
POST /my-food/auth/token
{
  "email": "user@example.com",
  "password": "password123"
}
→ Response: { jwtToken, tokenType, expiresIn, user }

// 3. Создание профиля
POST /my-food/user-profile
Headers: Authorization: Bearer {jwtToken}
{
  "height": 180,
  "weight": 75,
  "gender": "MALE",
  "birthday": "1990-05-15",
  ...
}
→ Response: UserProfile

// 4. Получение категорий
GET /my-food/product_category?page=0&size=100
→ Response: Page<ProductCategory>

// 5. Получение избранного
GET /my-food/favorite?page=0&size=100
→ Response: Page<Product>

// Пользователь вошел в приложение
```

### 12.2. Добавление приема пищи (вручную)

```javascript
// 1. Поиск продукта
GET /my-food/product/search/name?name=гречка
→ Response: Page<Product> (найден продукт id: 123)

// 2. Пользователь выбрал продукт, указал количество 150г, тип BREAKFAST, время 08:30

// 3. Создание приема пищи
POST /my-food/meal
{
  "mealType": "BREAKFAST",
  "dateTime": "2024-10-20T08:30:00"
}
→ Response: { id: 1, ... }

// 4. Создание элемента приема пищи
POST /my-food/meal_element
{
  "mealId": 1,
  "parentProductId": 123,
  "name": "Гречка отварная",
  "quantity": "150",
  "proteins": 6.3,    // (4.2 / 100) * 150
  "fats": 1.65,       // (1.1 / 100) * 150
  "carbohydrates": 31.95,
  "calories": 165.0,
  "measurementType": "GRAM",
  "defaultProteins": 4.2,  // из Product
  "defaultFats": 1.1,
  "defaultCarbohydrates": 21.3,
  "defaultCalories": 110.0,
  "defaultQuantity": "100",
  "imageUrl": "http://minio.../images/uuid.jpg"  // переиспользуем изображение из Product
}
→ Response: MealElement created (с тем же imageUrl)

// 5. Обновление списка на главном экране
GET /my-food/meal/findByDate?date=2024-10-20
→ Response: Page<Meal>

GET /my-food/meal_element/meal/1
→ Response: Page<MealElement>

// Статистика пересчитывается на клиенте
```

### 12.3. Сканирование штрихкода

```javascript
// 1. Пользователь отсканировал штрихкод: 4607065597924

// 2. Поиск продукта
GET /my-food/product/search/barcode/4607065597924
→ Response: Page<Product> (найден продукт)

// 3. Дальше как в сценарии 11.2 (создание meal и meal_element)
```

### 12.4. Анализ блюда по фото

```javascript
// 1. Пользователь сделал фото, конвертировал в base64

// 2. Отправка на анализ
POST /my-food/meal_element/analyze-photo
{
  "imageBase64": "data:image/jpeg;base64,...",
  "language": "ru",
  "comment": "Домашняя гречка с курицей, порция примерно 300г"
}
→ Response: { ingredients: [...], total_nutrients: {...} }

// 3. Пользователь корректирует данные (опционально)

// 4. Создание meal и meal_element с результатами анализа
POST /my-food/meal
→ mealId

POST /my-food/meal_element (для каждого ингредиента или суммарно)
→ MealElement created

// Блюдо добавлено
```

### 12.5. Анализ блюда по текстовому описанию

```javascript
// 1. Пользователь вводит текстовое описание блюда

// 2. Отправка на анализ
POST /my-food/meal_element/analyze-text
{
  "description": "Овсяная каша на молоке 200 грамм с бананом и ложкой меда",
  "language": "ru"
}
→ Response: { 
  ingredients: [
    { name: "Овсяная каша на молоке", quantity: 200, ... },
    { name: "Банан", quantity: 120, ... },
    { name: "Мед", quantity: 10, ... }
  ],
  total_nutrients: { proteins: 8.2, fats: 5.6, carbohydrates: 63.0, calories: 316.0 }
}

// 3. Пользователь корректирует данные (опционально)

// 4. Создание meal и meal_element
POST /my-food/meal
{
  "mealType": "BREAKFAST",
  "dateTime": "2024-10-20T08:30:00"
}
→ Response: { id: 1, ... }

// Создание элементов из каждого ингредиента или суммарно
POST /my-food/meal_element
{
  "mealId": 1,
  "name": "Овсяная каша с бананом и медом",
  "quantity": "330",
  "proteins": 8.2,
  "fats": 5.6,
  "carbohydrates": 63.0,
  "calories": 316.0,
  "measurementType": "GRAM",
  ...
}
→ MealElement created

// Блюдо добавлено
```

### 12.6. Анализ блюда по аудио описанию

```javascript
// 1. Пользователь записал аудио описание блюда, конвертировал в base64

// 2. Отправка на анализ (двухэтапный процесс: Whisper → GPT)
POST /my-food/meal_element/analyze-audio
{
  "audioBase64": "data:audio/mp3;base64,...",
  "language": "ru",
  "comment": "Обычная порция"
}
→ Response: {
  ingredients: [
    { name: "Гречка отварная", quantity: 150, ... },
    { name: "Куриная котлета", quantity: 100, ... }
  ],
  total_nutrients: { proteins: 24.8, fats: 9.85, carbohydrates: 34.05, calories: 317.0 },
  confidence: 0.72,
  notes: "Транскрипция: 'На обед гречка с куриной котлетой, грамм 150 каши и сто грамм котлеты'"
}

// 3. Пользователь проверяет транскрипцию и корректирует данные (опционально)

// 4. Создание meal и meal_element
POST /my-food/meal
{
  "mealType": "LUNCH",
  "dateTime": "2024-10-20T13:00:00"
}
→ Response: { id: 2, ... }

// Создание элементов
POST /my-food/meal_element
{
  "mealId": 2,
  "name": "Гречка с куриной котлетой",
  "quantity": "250",
  "proteins": 24.8,
  "fats": 9.85,
  "carbohydrates": 34.05,
  "calories": 317.0,
  "measurementType": "GRAM",
  ...
}
→ MealElement created

// Блюдо добавлено
```

### 12.7. Переиспользование изображений между Product и MealElement

```javascript
// Сценарий: Пользователь съел блюдо из MealElement и хочет сохранить его как Product

// 1. Получить MealElement
GET /my-food/meal_element/123
→ Response: {
  id: 123,
  name: "Куриная грудка гриль",
  proteins: 31.0,
  imageUrl: "http://minio.../images/a1b2c3d4-uuid.jpg",
  ...
}

// 2. Создать Product с переиспользованием изображения
POST /my-food/product
{
  "name": "Куриная грудка гриль",
  "proteins": 31.0,
  "fats": 3.6,
  "carbohydrates": 0.0,
  "calories": 165.0,
  "measurementType": "GRAM",
  "quantity": "100",
  "productCategoryId": "meat",
  "imageUrl": "http://minio.../images/a1b2c3d4-uuid.jpg"  // переиспользуем изображение
}
→ Response: Product created (с тем же imageUrl, изображение не дублируется в S3)

// Обратный сценарий: Product → MealElement - аналогично
```

**Преимущества:**
- Изображение не загружается повторно в S3
- Экономия трафика и места в хранилище
- Быстрое создание записи
- Одно изображение используется в нескольких местах

---

## 13. Обработка ошибок (Best Practices для клиента)

### 13.1. Типы ошибок и реакция

**401 Unauthorized:**
```javascript
if (error.response?.status === 401) {
  // Удалить токен из Secure Store
  // Перенаправить на SignInScreen
  dispatch(logout());
  navigation.navigate('Auth', { screen: 'SignIn' });
}
```

**403 Forbidden:**
```javascript
// Показать сообщение "Нет прав доступа"
showSnackbar('У вас нет прав для выполнения этой операции', 'error');
```

**404 Not Found:**
```javascript
// Показать сообщение "Не найдено"
showSnackbar('Ресурс не найден', 'error');
```

**400 Bad Request (валидация):**
```javascript
// Показать ошибки под полями формы
if (error.response?.data?.errors) {
  error.response.data.errors.forEach(err => {
    setFieldError(err.field, err.message);
  });
}
```

**500 Internal Server Error:**
```javascript
// Показать общее сообщение
showSnackbar('Произошла ошибка на сервере. Попробуйте позже', 'error');
// Отправить error log в систему мониторинга (фаза 2)
```

**Network Error:**
```javascript
// Нет соединения с сервером
showSnackbar('Проверьте подключение к интернету', 'error');
```

### 13.2. Retry механизм

**Для критичных операций:**
```javascript
const apiCall = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await api.get('/meal/findByDate', { params: { date } });
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

**Не использовать retry для:**
- POST/PUT/DELETE операций (чтобы избежать дубликатов)
- Операций с долгим выполнением (анализ фото)

---

## 14. Дополнительные эндпоинты (для справки)

### 14.1. Health Check

**Endpoint:**
```
GET /my-food/actuator/health
```

**Response (200 OK):**
```json
{
  "status": "UP"
}
```

**Использование:** Проверка доступности сервера

### 14.2. API Documentation

**Endpoint:**
```
GET /my-food/swagger-ui/index.html
```

**Использование:** Интерактивная документация API

---

## 15. Changelog API

### Версия 2.7.0 (9 ноября 2025)

**BREAKING CHANGE - Унификация Naming Convention:**
- ✅ **ВСЕ API теперь используют camelCase** для всех полей (request и response)
- ✅ Удалены все `@JsonProperty` аннотации из DTO
- ✅ `avatar_url` → `avatarUrl`
- ✅ `oauth_provider` → `oauthProvider`
- ✅ `created_at` → `createdAt`

**Затронутые Response DTO:**
- UserResponse: `avatarUrl`, `oauthProvider`, `createdAt` (было snake_case, стало camelCase)
- DeviceResponse: убраны избыточные `@JsonProperty` (уже были camelCase)

**Затронутые Request DTO:**
- RegisterDeviceRequest: убраны избыточные `@JsonProperty`

**Миграция для Frontend:**
```typescript
// БЫЛО (v2.6.1):
interface UserResponse {
  avatar_url: string | null;      // snake_case
  oauth_provider: string | null;  // snake_case
  created_at: string;              // snake_case
}

// СТАЛО (v2.7.0):
interface UserResponse {
  avatarUrl: string | null;      // camelCase ✅
  oauthProvider: string | null;  // camelCase ✅
  createdAt: string;              // camelCase ✅
}
```

**Все эндпоинты обновлены:**
- POST /auth/token
- POST /auth/user
- GET /auth/user
- POST /auth/oauth
- POST /notifications/register

**Преимущества:**
- ✅ Консистентность во всем API
- ✅ Упрощение Frontend парсинга
- ✅ Стандартный Jackson naming без кастомизации

### Версия 2.6.1 (9 ноября 2025)

**Исправления документации:**
- ✅ Исправлено название поля `token` → `jwtToken` в TokenResponse (разделы 2.1, 2.5, 12.1)
- ✅ Добавлено поле `tokenType: "Bearer"` во все auth responses
- ✅ Добавлено поле `user` в TokenResponse для всех auth endpoints
- ✅ Обновлено значение `expiresIn` на реальное (2592000 = 30 дней)
- ✅ Добавлена документация ошибки 400 для OAuth users пытающихся войти через password
- ✅ Обновлены примеры в разделе Flow (12.1)

### Версия 2.6.0 (8 ноября 2025)

**OAuth2 Integration:**
- ✅ Добавлен раздел 2.5 - OAuth2 авторизация (Google/Apple)
- ✅ Новый endpoint: `POST /auth/oauth`
- ✅ Поддержка Google и Apple Sign In
- ✅ Обновлен UserResponse: добавлены поля `avatarUrl`, `oauthProvider`
- ✅ Обновлен TokenResponse: добавлено поле `user`
- ✅ Документация полного OAuth2 flow
- ✅ Security: OAuth users не могут войти через password endpoint

См. [OAUTH2_IMPLEMENTATION_GUIDE.md](./OAUTH2_IMPLEMENTATION_GUIDE.md) для детальной документации.

### Версия 2.5.0 (7 ноября 2024)

Интеграция S3/MinIO хранилища для изображений продуктов и элементов приема пищи.

**Новые возможности:**

- ✅ **S3/MinIO Storage** - хранилище изображений с автоматической обработкой:
  - Resize до 1200x1200px с сохранением пропорций
  - Сжатие 85% качества
  - Конвертация в JPG (единый формат)
  - Публичный bucket с UUID именами файлов для безопасности
  - Структура: `images/{uuid}.jpg`

- ✅ **Переиспользование изображений** - поддержка `imageUrl` в request:
  - Можно передать существующий `imageUrl` при создании Product из MealElement или наоборот
  - Изображение не дублируется в S3
  - Экономия трафика и места

- ✅ **Feature toggle** - возможность включать/отключать S3 через `S3_ENABLED`
- ✅ **Orphan Detection** - автоматическая очистка неиспользуемых изображений раз в неделю
- ✅ **Graceful fallback** - если S3 недоступен, продолжаем без изображения (imageUrl=null)

**Изменения в API:**

- ✅ `POST /product` и `POST /meal_element` теперь поддерживают:
  - `imageBase64` (string, optional) - для загрузки нового изображения
  - `imageUrl` (string, optional) - для переиспользования существующего
  - Приоритет у `imageBase64` если переданы оба поля

- ✅ `PUT /product` и `PUT /meal_element` теперь поддерживают:
  - `imageBase64` (string, optional) - для замены изображения

- ✅ Response всех эндпоинтов теперь содержат:
  - `imageUrl` - полный публичный URL изображения в S3 (если есть)

**Примеры:**

```json
// Создание с новым изображением
POST /product
{
  "name": "Курица",
  "imageBase64": "data:image/jpeg;base64,...",
  ...
}
→ imageUrl: "http://minio.../images/550e8400-uuid.jpg"

// Создание с существующим изображением (Product → MealElement)
POST /meal_element
{
  "name": "Курица",
  "imageUrl": "http://minio.../images/550e8400-uuid.jpg",
  ...
}
→ imageUrl: "http://minio.../images/550e8400-uuid.jpg" (то же изображение)
```

**Переменные окружения:**
```bash
S3_ENABLED=true                           # включить/выключить S3
S3_ENDPOINT=http://localhost:9000         # MinIO endpoint
S3_ACCESS_KEY=minioadmin                  # credentials
S3_SECRET_KEY=minioadmin
S3_BUCKET_NAME=mealrush-images           # bucket name
IMAGE_MAX_WIDTH=1200                      # max width
IMAGE_MAX_HEIGHT=1200                     # max height
IMAGE_QUALITY=0.85                        # compression quality
```

---

### Версия 2.4.0

Улучшения API настроек уведомлений: глобальный переключатель, endpoint сброса, отображение timezone и вычисленных полей.

**Новые возможности:**

- ✅ `globallyEnabled` - master switch для отключения всех уведомлений одной кнопкой
- ✅ `POST /notifications/preferences/reset` - сброс к defaults в одном запросе (вместо DELETE + GET)
- ✅ `timezone` в GET response - отображение часового пояса пользователя
- ✅ `reminderAt` - вычисленное поле (time - minutesBefore) для всех meal reminders
- ✅ Изменен HTTP метод с `PUT` на `PATCH` для частичного обновления (семантически правильно)
- ✅ Удалены legacy планировщики (MealReminderScheduler, WeeklyReportScheduler, NutritionRecommendationScheduler, AchievementNotifier)

**BREAKING CHANGES - Notification Preferences:**

- ❌ **ИЗМЕНЁН:** `PUT /notifications/preferences` → `PATCH /notifications/preferences`
- ❌ **ИЗМЕНЁН:** Defaults для `snack` и `lateSnack`:
  - **Было:** `time: "16:00"/"21:00"`, `minutesBefore: 15`
  - **Стало:** `time: null`, `minutesBefore: null`
  - **Причина:** Время перекусов индивидуально, пользователь выбирает сам
- ⚠️ **ВАЛИДАЦИЯ:** При включении `snack`/`lateSnack` (`enabled: true`) обязательно указывать `time` и `minutesBefore`
- ✅ **НОВЫЕ ПОЛЯ в response:**
  - `globallyEnabled` (Boolean) - глобальный переключатель
  - `timezone` (String) - часовой пояс из UserProfile
  - `reminderAt` (LocalTime) - вычисленное время напоминания для каждого meal reminder

**Миграция для клиентов:**

```javascript
// Было
response.breakfast.time - response.breakfast.minutesBefore // вычисляли сами

// Стало
response.breakfast.reminderAt // готовое значение

// Было
PUT /notifications/preferences

// Стало
PATCH /notifications/preferences

// Было (2 запроса для сброса)
await DELETE /notifications/preferences
await GET /notifications/preferences

// Стало (1 запрос)
await POST /notifications/preferences/reset
```

---

### Версия 2.3.0

Персонализированные настройки уведомлений с поддержкой часовых поясов.

**Новые эндпоинты:**
- `GET /my-food/notifications/preferences` - получение/создание настроек уведомлений
- `PUT /my-food/notifications/preferences` - обновление настроек (partial update)
- `DELETE /my-food/notifications/preferences` - удаление настроек (сброс к defaults)

**Новые возможности:**
- Персонализированные настройки уведомлений для каждого пользователя
- Настройка времени для каждого типа приема пищи отдельно
- Настройка за сколько минут напоминать (5-120 минут)
- Возможность включить/выключить каждый тип уведомления
- Настройка еженедельных отчетов (день недели + время)
- Настройка ежедневных инсайтов
- Умный scheduler с поддержкой часовых поясов (timezone из UserProfile)
- Напоминания отправляются только если прием пищи еще не записан

**Изменения:**
- Новая таблица `notification_preferences` для хранения настроек
- SmartNotificationScheduler заменяет старые фиксированные schedulers
- Все времена указываются в локальной timezone пользователя
- Автоматическая конвертация timezone для отправки уведомлений

**Значения по умолчанию:**
- Завтрак: 08:00 (за 30 мин), включен
- Обед: 12:30 (за 30 мин), включен
- Ужин: 18:30 (за 30 мин), включен
- Полдник: 16:00 (за 15 мин), выключен
- Поздний перекус: 21:00 (за 15 мин), выключен
- Еженедельный отчет: Понедельник 09:00, включен
- Ежедневные инсайты: 20:00, включен
- Достижения: включены

---

### Версия 2.2.0

Расширенные AI возможности для анализа блюд и консолидация управления уведомлениями.

**Новые эндпоинты:**
- `POST /my-food/meal_element/analyze-text` - анализ блюда по текстовому описанию
- `POST /my-food/meal_element/analyze-audio` - анализ блюда по аудио описанию (Whisper + GPT)
- `DELETE /my-food/notifications/device/{deviceToken}` - удаление устройства из уведомлений

**Изменения AI Analysis:**
- Добавлен анализ блюд по текстовому описанию с помощью GPT
- Добавлен анализ блюд по аудио описанию (двухэтапный процесс: Whisper API для транскрипции, затем GPT для анализа КБЖУ)
- Поддержка аудио форматов: mp3, wav, m4a, webm (макс. 25MB)
- Все три типа анализа (фото, текст, аудио) возвращают единый формат `AnalysisResponse`
- Переименован `PhotoAnalysisResponse` → `AnalysisResponse` для отражения универсального использования
- Обновлен Swagger tag с "Photo Analysis" на "AI Analysis" для контроллера

**BREAKING CHANGES - Device Management:**
- ❌ **УДАЛЁН:** `POST /my-food/device` - используйте `POST /my-food/notifications/register` вместо него
- ❌ **УДАЛЁН:** `DELETE /my-food/device/{deviceToken}` - используйте `DELETE /my-food/notifications/device/{deviceToken}`
- ✅ Все эндпоинты управления устройствами теперь находятся под `/notifications`
- ✅ Удалена секция "9. Устройства" из документации - см. секцию "21. Notifications Management"
- ⚠️ **Миграция для клиентов:** обновите пути эндпоинтов с `/device` на `/notifications/*`

**Примечания:**
- Формат request/response для регистрации/удаления устройств не изменился
- Изменились только пути (URL) эндпоинтов
- Service layer (DeviceService) остался без изменений

---

### Версия 2.1.0

Новые возможности метрик и рекомендаций.

**Новые эндпоинты:**
- `GET /my-food/nutrition/daily?date=YYYY-MM-DD`
- `GET /my-food/nutrition/weekly?startDate=YYYY-MM-DD`
- `GET /my-food/nutrition/monthly?month=YYYY-MM`
- `GET /my-food/nutrition/trend?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&metric=CALORIES|PROTEINS|FATS|CARBOHYDRATES`
- `GET /my-food/nutrition/statistics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /my-food/nutrition/progress?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /my-food/recommendations/products?page=0&size=10`
- `GET /my-food/recommendations/insights`
- `POST /my-food/recommendations/refresh`

**Изменения:**
- Добавлена агрегация метрик по неделе и месяцу
- Добавлены тренды и прогресс к цели
- Добавлены инсайты и улучшенные рекомендации продуктов

---

### Версия 2.0.0 (23 октября 2024)

**Новые эндпоинты:**
- `POST /my-food/auth/user` - регистрация пользователя
- `POST /my-food/auth/token` - получение JWT токена
- `GET /my-food/auth/user` - получение данных текущего пользователя
- `POST /my-food/auth/reset-password` - восстановление пароля
- `POST /meal_element/analyze-photo` - анализ блюда по фото с помощью AI
- `GET /images/{filename}` - получение изображений продуктов и блюд
- `GET /meal` - список приемов пищи с пагинацией
- `GET /meal_element/{id}` - получение элемента по ID
- `DELETE /user-profile` - удаление профиля пользователя
- `DELETE /device/{deviceToken}` - удаление устройства
- `GET /product_category/{id}` - получение категории по ID

**Изменения:**
- **Аутентификация теперь встроена в сервис** - отдельный auth service не требуется
- Все auth эндпоинты находятся в `/my-food/auth/*`
- Миграция на новый стек (Java 21, Spring Boot 3.4, JOOQ)
- Реализована полная система JWT аутентификации с BCrypt
- Улучшенная обработка штрихкодов
- Новые источники данных (Open Food Facts, EAN-DB, Barcode-list.ru)
- `GET /meal/findByDate` теперь возвращает простой список (без пагинации)
- Использование простого JOOQ DSL без кодогенерации
- Полная поддержка пагинации для всех списочных эндпоинтов

**Breaking changes:**
- Полная переписка API с нуля
- Auth эндпоинты перенесены с `/gateway/auth/*` на `/my-food/auth/*`
- Формат дат: ISO 8601
- Поля в camelCase

---

## 18. Nutrition API

### 18.1. Дневная сводка
Endpoint:
```
GET /my-food/nutrition/daily?date=YYYY-MM-DD
Headers: Authorization: Bearer {token}
```
Response (200 OK):
```json
{
  "periodType": "DAY",
  "startDate": "2025-10-30",
  "endDate": "2025-10-30",
  "totalProteins": 120.0,
  "totalFats": 70.0,
  "totalCarbohydrates": 250.0,
  "totalCalories": 2200.0,
  "targetCalories": 2000,
  "caloriesPercentage": 110.0
}
```

### 18.2. Недельная сводка
```
GET /my-food/nutrition/weekly?startDate=YYYY-MM-DD
```
Агрегирует 7 дней начиная с `startDate`.

### 18.3. Месячная сводка
```
GET /my-food/nutrition/monthly?month=YYYY-MM
```
Агрегирует месяц.

### 18.4. Тренд
```
GET /my-food/nutrition/trend?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&metric=CALORIES|PROTEINS|FATS|CARBOHYDRATES
```
Response (200 OK):
```json
{
  "metricType": "CALORIES",
  "startDate": "2025-10-01",
  "endDate": "2025-10-07",
  "dailyValues": [ { "date": "2025-10-01", "value": 1800.0 } ],
  "direction": "INCREASING",
  "averageValue": 1950.0,
  "predictedValue": 2000.0
}
```

### 18.5. Статистика
```
GET /my-food/nutrition/statistics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```
Response (200 OK):
```json
{
  "startDate": "2025-10-01",
  "endDate": "2025-10-07",
  "averageCalories": 1950.0,
  "averageProteins": 110.0,
  "averageFats": 60.0,
  "averageCarbohydrates": 210.0,
  "byMealType": [
    { "mealType": "BREAKFAST", "calories": 1450.0 },
    { "mealType": "DINNER", "calories": 1800.0 },
    { "mealType": "LATE_SUPPER", "calories": 200.0 },
    { "mealType": "LUNCH", "calories": 2100.0 },
    { "mealType": "SUPPER", "calories": 350.0 }
  ],
  "categoryUsageStats": { "meat": 5, "vegetables": 7 },
  "topProducts": [ { "productId": 123, "productName": "Куриная грудка", "usageCount": 3 } ],
  "totalMeals": 18,
  "totalDays": 6
}
```

Примечания:
- `byMealType` - массив объектов с суммарными калориями по каждому типу приёма пищи за период
- Типы приёмов пищи: `BREAKFAST`, `LUNCH`, `DINNER`, `SUPPER`, `LATE_SUPPER`
- Если для типа приёма пищи нет данных, калории будут равны 0

### 18.6. Прогресс к цели
```
GET /my-food/nutrition/progress?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```
Response (200 OK):
```json
{
  "startDate": "2025-10-01",
  "endDate": "2025-10-07",
  "averageDailyCalories": 1950.0,
  "targetCalories": 2000,
  "caloriesAchievementPercentage": 97.5,
  "weightChange": null,
  "targetWeightChange": null,
  "goalStatus": "ON_TRACK",
  "dailyProgress": [ { "date": "2025-10-01", "calories": 1900.0, "percentage": 95.0 } ]
}
```

Примечания:
- Даты в ISO 8601, UTC
- Пустые дни могут отсутствовать в массиве `dailyValues`

---

## 19. Recommendations API

### 19.1. Рекомендованные продукты
```
GET /my-food/recommendations/products?page=0&size=10
Headers: Authorization: Bearer {token}
```
Возвращает страницу `ProductResponse`.

### 19.2. Инсайты
```
GET /my-food/recommendations/insights
```
Response (200 OK):
```json
[
  { "id": 1, "insightType": "EXCESS_CALORIES", "severity": "WARNING", "title": "Превышение нормы", "description": "...", "createdAt": "2025-10-30T10:00:00" }
]
```

### 19.3. Обновить рекомендации
```
POST /my-food/recommendations/refresh
```
Очищает кеш рекомендаций текущего пользователя.

### 19.4. Meal-рекомендации (подбор продуктов)
```
GET /my-food/recommendations/meals?size=5
Headers: Authorization: Bearer {token}
```
Response (200 OK):
```json
[
  {
    "id": 123,
    "name": "Творог 5%",
    "proteins": 17.0,
    "fats": 5.0,
    "carbohydrates": 3.0,
    "calories": 121.0,
    "measurementType": "GRAM",
    "quantity": "100",
    "productCategoryId": "dairy"
  }
]
```

Notes:
- Алгоритм: GAIN — приоритет белку; LOSE — низкокалорийные; SAVE — смешанный скоринг.
- Кеш: recommendationsCache инвалидируется `POST /recommendations/refresh`.

---

## 20. Weight History Management

Управление историей изменения веса пользователя. При записи нового веса автоматически обновляется профиль пользователя и пересчитываются рекомендуемые калории.

**Base Path:** `/my-food/weight-history`

### 20.1. Записать вес

**Endpoint:**
```
POST /my-food/weight-history
```

**Описание:**
Записывает новое значение веса пользователя. При этом автоматически:
1. Сохраняется запись в истории веса
2. Обновляется текущий вес в профиле пользователя (dayLimitCal НЕ изменяется)

**Request Body:**
```json
{
  "weight": 85,
  "recordedAt": "2024-11-01T08:30:00",
  "notes": "Утреннее взвешивание натощак"
}
```

**Request Fields:**
| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| weight | Integer | Да | Вес в килограммах (от 30 до 300) |
| recordedAt | DateTime | Да | Дата и время взвешивания |
| notes | String | Нет | Заметки (до 500 символов) |

**Response (201 Created):**
```json
{
  "id": 123,
  "weight": 85,
  "recordedAt": "2024-11-01T08:30:00",
  "notes": "Утреннее взвешивание натощак",
  "createdAt": "2024-11-01T08:35:00"
}
```

**Errors:**
- 400: Невалидные данные (вес вне диапазона 30-300 кг)
- 401: Не авторизован

**Примечания:**
- После записи веса автоматически обновляется `UserProfile.weight`
- `UserProfile.dayLimitCal` НЕ пересчитывается - пользователь управляет им самостоятельно через `PUT /user-profile`
- Записи сохраняются с временем взвешивания (recordedAt), а не временем создания записи
- Для изменения дневного лимита калорий используйте отдельный эндпоинт `PUT /user-profile`

---

### 20.2. Получить историю веса

**Endpoint:**
```
GET /my-food/weight-history?page=0&size=20
```

**Описание:**
Возвращает историю изменения веса пользователя с пагинацией, отсортированную по дате взвешивания (новые первыми).

**Query Parameters:**
| Параметр | Тип | Default | Описание |
|----------|-----|---------|----------|
| page | Integer | 0 | Номер страницы (с 0) |
| size | Integer | 20 | Размер страницы (max 100) |

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 125,
      "weight": 84,
      "recordedAt": "2024-11-05T08:30:00",
      "notes": null,
      "createdAt": "2024-11-05T08:35:00"
    },
    {
      "id": 123,
      "weight": 85,
      "recordedAt": "2024-11-01T08:30:00",
      "notes": "Утреннее взвешивание натощак",
      "createdAt": "2024-11-01T08:35:00"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 15,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

**Errors:**
- 401: Не авторизован

---

### 20.3. Получить последнее значение веса

**Endpoint:**
```
GET /my-food/weight-history/latest
```

**Описание:**
Возвращает самую последнюю запись веса пользователя (по дате взвешивания).

**Response (200 OK):**
```json
{
  "id": 125,
  "weight": 84,
  "recordedAt": "2024-11-05T08:30:00",
  "notes": null,
  "createdAt": "2024-11-05T08:35:00"
}
```

**Errors:**
- 404: История веса отсутствует
- 401: Не авторизован

---

### 20.4. Получить статистику веса

**Endpoint:**
```
GET /my-food/weight-history/stats?days=30
```

**Описание:**
Возвращает статистику изменения веса за указанный период.

**Query Parameters:**
| Параметр | Тип | Default | Описание |
|----------|-----|---------|----------|
| days | Integer | 30 | Количество дней для анализа (0 = вся история) |

**Response (200 OK):**
```json
{
  "currentWeight": 84,
  "startWeight": 90,
  "totalChange": -6,
  "averageWeeklyChange": -2.0,
  "periodDays": 30,
  "recordCount": 15
}
```

**Response Fields:**
| Поле | Тип | Описание |
|------|-----|----------|
| currentWeight | Integer | Текущий вес (кг) - последняя запись |
| startWeight | Integer | Начальный вес (кг) - первая запись в периоде |
| totalChange | Integer | Общее изменение веса (кг). Положительное = набор, отрицательное = потеря |
| averageWeeklyChange | Double | Средняя скорость изменения веса в неделю (кг/неделю) |
| periodDays | Integer | Фактический период в днях между первой и последней записью |
| recordCount | Integer | Количество записей веса в периоде |

**Errors:**
- 401: Не авторизован

**Примеры использования:**

1. **Статистика за месяц:**
```
GET /my-food/weight-history/stats?days=30
```

2. **Статистика за всё время:**
```
GET /my-food/weight-history/stats?days=0
```

**Примечания:**
- Если записей нет, возвращаются null значения для весов и 0 для изменений
- `averageWeeklyChange` рассчитывается как: `totalChange / (periodDays / 7)`
- Отрицательное значение `averageWeeklyChange` означает снижение веса, положительное - набор

---

### 20.5. Удалить запись веса

**Endpoint:**
```
DELETE /my-food/weight-history/{id}
```

**Описание:**
Удаляет запись веса по ID. Выполняется проверка безопасности - пользователь может удалить только свою запись.

**Автоматические действия при удалении последней записи:**
1. Находится предыдущая запись веса (если есть)
2. Обновляется `UserProfile.weight` на вес из предыдущей записи (dayLimitCal НЕ изменяется)

**Path Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| id | Long | ID записи веса для удаления |

**Response (204 No Content)**

**Errors:**
- 404: Запись не найдена
- 403: Доступ запрещен (попытка удалить запись другого пользователя)
- 401: Не авторизован

**Примеры использования:**

```http
DELETE /my-food/weight-history/123
Authorization: Bearer {JWT_TOKEN}
```

**Примечания:**
- При удалении НЕ последней записи профиль пользователя остается без изменений
- При удалении последней записи:
  - Если есть предыдущая запись → вес обновляется на предыдущий
  - Если это была единственная запись → вес в профиле остается без изменений
- `dayLimitCal` НЕ пересчитывается при удалении - пользователь управляет калориями через профиль

**Сценарий использования:**
```
1. Пользователь ввел некорректный вес (например, опечатка: 850 вместо 85)
2. Записал в историю через POST /weight-history
3. Заметил ошибку
4. Удаляет некорректную запись через DELETE /weight-history/{id}
```

---

## 21. Notifications Management

Управление регистрацией устройств для получения push-уведомлений через Firebase Cloud Messaging.

**Base Path:** `/my-food/notifications`

### 21.1. Регистрация устройства для уведомлений

**Endpoint:**
```
POST /my-food/notifications/register
Headers: Authorization: Bearer {token}
```

**Описание:**
Регистрирует устройство пользователя для получения push-уведомлений через Firebase Cloud Messaging (FCM). При повторной регистрации с тем же токеном обновляется существующая запись.

**Request Body:**
```json
{
  "fcmToken": "eXaMpLe_FcM_ToKeN_123...",
  "deviceType": "ANDROID"
}
```

**Request Fields:**
| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| fcmToken | String | Да | FCM токен устройства, полученный от Firebase SDK |
| deviceType | Enum | Да | Тип устройства: "ANDROID" или "IOS" |

**Response (201 Created):**
```json
{
  "id": 1,
  "userId": 1,
  "fcmToken": "eXaMpLe_FcM_ToKeN_123...",
  "deviceType": "ANDROID",
  "createdAt": "2024-11-01T12:00:00Z"
}
```

**Response Fields:**
| Поле | Тип | Описание |
|------|-----|----------|
| id | Long | ID записи устройства |
| userId | Long | ID пользователя-владельца |
| fcmToken | String | FCM токен устройства |
| deviceType | String | Тип устройства (ANDROID/IOS) |
| createdAt | DateTime | Дата и время регистрации |

**Errors:**
- 400: Невалидные данные (пустой токен или неверный тип устройства)
- 401: Не авторизован (отсутствует или невалидный JWT токен)
- 409: Устройство уже зарегистрировано (можно игнорировать, токен будет обновлён)

**Примеры использования:**

1. **Регистрация Android устройства:**
```http
POST /my-food/notifications/register
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "fcmToken": "f7X9kL2mN4pQ6rS8tU0vW1xY3zA5bC7dE9fG1hI3jK5lM7nO9pQ",
  "deviceType": "ANDROID"
}
```

2. **Регистрация iOS устройства:**
```http
POST /my-food/notifications/register
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "fcmToken": "aP1bQ2cR3dS4eT5fU6gV7hW8iX9jY0kZ1lA2mB3nC4oD5pE6qF",
  "deviceType": "IOS"
}
```

**Примечания:**
- Регистрация устройства должна происходить после успешного входа в приложение
- FCM токен может измениться при переустановке приложения или очистке данных
- Рекомендуется повторно регистрировать устройство при каждом запуске приложения
- Один пользователь может иметь несколько зарегистрированных устройств
- При повторной регистрации с тем же токеном обновляется `createdAt`

**Интеграция с Firebase:**
- Используется Firebase Cloud Messaging API (V1)
- Токены получаются через Firebase SDK на клиенте
- Для отправки уведомлений бэкенд использует Firebase Admin SDK
- Поддерживается отправка индивидуальных и групповых уведомлений

### 21.2. Удаление устройства из уведомлений

**Endpoint:**
```
DELETE /my-food/notifications/device/{deviceToken}
Headers: Authorization: Bearer {token}
```

**Описание:**
Удаляет устройство из списка для получения push-уведомлений. После удаления устройство перестанет получать уведомления от приложения.

**Path Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| deviceToken | String | FCM токен устройства, который нужно удалить |

**Response (204 No Content)**

Успешное удаление - пустое тело ответа.

**Errors:**
- 404: Устройство не найдено (токен не зарегистрирован)
- 403: Устройство принадлежит другому пользователю (нет прав на удаление)
- 401: Не авторизован (отсутствует или невалидный JWT токен)

**Примеры использования:**

**Удаление устройства:**
```http
DELETE /my-food/notifications/device/f7X9kL2mN4pQ6rS8tU0vW1xY3zA5bC7dE9fG1hI3jK5lM7nO9pQ
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```
204 No Content
```

**Примечания:**
- Используется при выходе пользователя из приложения
- Можно вызывать при удалении приложения (если возможно)
- Токен должен быть URL-encoded если содержит специальные символы
- После удаления можно повторно зарегистрировать то же устройство

---

## 22. Notification Preferences

### 22.1. Получение настроек уведомлений

**Endpoint:**
```
GET /my-food/notifications/preferences
Headers: Authorization: Bearer {token}
```

**Описание:**
Возвращает настройки уведомлений пользователя. Если настройки не существуют, автоматически создает их с значениями по умолчанию. Timezone берется из `user_profiles.timezone`.

**Response (200 OK):**
```json
{
  "id": 1,
  "userId": 1,
  "globallyEnabled": true,
  "timezone": "Europe/Moscow",
  "breakfast": {
    "enabled": true,
    "time": "08:00",
    "minutesBefore": 30,
    "reminderAt": "07:30"
  },
  "lunch": {
    "enabled": true,
    "time": "12:30",
    "minutesBefore": 30,
    "reminderAt": "12:00"
  },
  "dinner": {
    "enabled": true,
    "time": "18:30",
    "minutesBefore": 30,
    "reminderAt": "18:00"
  },
  "snack": {
    "enabled": false,
    "time": null,
    "minutesBefore": null,
    "reminderAt": null
  },
  "lateSnack": {
    "enabled": false,
    "time": null,
    "minutesBefore": null,
    "reminderAt": null
  },
  "weeklyReport": {
    "enabled": true,
    "day": "MONDAY",
    "time": "09:00"
  },
  "dailyInsights": {
    "enabled": true,
    "time": "20:00"
  },
  "achievementsEnabled": true,
  "createdAt": "2024-11-05T12:00:00",
  "updatedAt": "2024-11-05T12:00:00"
}
```

**Поля ответа:**
- `globallyEnabled` - **master switch**: при `false` все уведомления отключаются независимо от индивидуальных настроек
- `timezone` - часовой пояс пользователя из UserProfile (только для отображения, read-only)
- `time` - время приема пищи в локальной timezone пользователя
- `minutesBefore` - за сколько минут до `time` отправить напоминание
- `reminderAt` - **вычисленное поле** (time - minutesBefore), время фактической отправки уведомления (read-only)
- `day` - день недели для weekly report: `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY`

**Примечания:**
- При первом GET создаются настройки по умолчанию
- Все времена указываются в локальной timezone пользователя
- Scheduler автоматически конвертирует timezone → UTC для отправки
- `snack` и `lateSnack` имеют `time=null` и `minutesBefore=null` по умолчанию - пользователь выбирает время при включении
- `reminderAt` вычисляется на сервере, клиенту не нужно считать

### 22.2. Обновление настроек уведомлений

**Endpoint:**
```
PATCH /my-food/notifications/preferences
Headers: Authorization: Bearer {token}
```

**Описание:**
Обновляет настройки уведомлений. Поддерживает частичное обновление (PATCH) - отправляются только изменившиеся поля. Null поля не обновляются.

**Request Body (все поля опциональны):**
```json
{
  "globallyEnabled": false,
  "breakfast": {
    "enabled": false
  },
  "lunch": {
    "time": "13:00",
    "minutesBefore": 15
  },
  "weeklyReport": {
    "enabled": true,
    "day": "SUNDAY",
    "time": "18:00"
  }
}
```

**Response (200 OK):**
Возвращает полные обновленные настройки (формат как в GET), включая вычисленные поля `timezone` и `reminderAt`.

**Errors:**
- 400: Невалидные данные (minutesBefore < 5 или > 120, некорректное время, **snack/lateSnack enabled без time**)
- 401: Не авторизован

**Примеры:**

1. **Глобально выключить все уведомления:**
```json
{
  "globallyEnabled": false
}
```

2. **Выключить напоминание о завтраке:**
```json
{
  "breakfast": {
    "enabled": false
  }
}
```

3. **Изменить время обеда:**
```json
{
  "lunch": {
    "time": "13:30"
  }
}
```

4. **Включить полдник с указанием времени:**
```json
{
  "snack": {
    "enabled": true,
    "time": "15:30",
    "minutesBefore": 20
  }
}
```
**Важно:** При включении `snack` или `lateSnack` (`enabled: true`) обязательно указать `time` и `minutesBefore`, иначе вернется **400 Bad Request**.

5. **Настроить все приемы пищи:**
```json
{
  "breakfast": {"enabled": true, "time": "07:00", "minutesBefore": 30},
  "lunch": {"enabled": true, "time": "12:00", "minutesBefore": 15},
  "dinner": {"enabled": true, "time": "19:00", "minutesBefore": 30},
  "snack": {"enabled": false},
  "lateSnack": {"enabled": false}
}
```

### 22.3. Удаление настроек (сброс к defaults)

**Endpoint:**
```
DELETE /my-food/notifications/preferences
Headers: Authorization: Bearer {token}
```

**Описание:**
Удаляет настройки уведомлений пользователя. При следующем GET запросе будут созданы настройки по умолчанию.

**Response (204 No Content)**

**Errors:**
- 401: Не авторизован

**Примечание:** Для сброса настроек рекомендуется использовать `POST /reset` (см. 22.4) - возвращает defaults в одном запросе.

### 22.4. Сброс настроек к defaults (NEW)

**Endpoint:**
```
POST /my-food/notifications/preferences/reset
Headers: Authorization: Bearer {token}
```

**Описание:**
Удаляет текущие настройки и создает новые со значениями по умолчанию. Возвращает созданные настройки. **Этот эндпоинт позволяет сбросить настройки одним запросом** вместо `DELETE + GET`.

**Request Body:** Пусто (не требуется)

**Response (200 OK):**
Возвращает полные настройки по умолчанию (формат как в GET), включая:
- `globallyEnabled`: true
- `timezone`: часовой пояс пользователя
- `breakfast`, `lunch`, `dinner`: enabled с стандартными временами
- `snack`, `lateSnack`: disabled с `time=null`
- `reminderAt`: вычисленные времена напоминаний

**Errors:**
- 401: Не авторизован

**Пример использования:**
```http
POST /my-food/notifications/preferences/reset
Authorization: Bearer {JWT_TOKEN}
```

**Response:**
```json
{
  "id": 2,
  "userId": 1,
  "globallyEnabled": true,
  "timezone": "Europe/Moscow",
  "breakfast": {
    "enabled": true,
    "time": "08:00",
    "minutesBefore": 30,
    "reminderAt": "07:30"
  },
  "snack": {
    "enabled": false,
    "time": null,
    "minutesBefore": null,
    "reminderAt": null
  },
  ...
}
```

**Преимущества перед DELETE:**
- ✅ Один HTTP запрос вместо двух (DELETE + GET)
- ✅ Атомарная операция
- ✅ Сразу получаете результат для отображения в UI

---

## 23. Design Notes (Metrics & Recommendations)

### 23.1. NutritionTrendAnalyzer
- Источник данных: агрегации по дням за период
- Направление тренда: сравнение средних половин периода (порог 5%)
- Простая модель прогноза: скользящее среднее последних 3 дней

### 23.2. ProductStatisticsAnalyzer
- Средние значения считаются как total/кол-во дней с данными
- Категории и топ-продукты — по использованию в meal_elements

### 23.3. InsightGenerator
- Пороговые правила: 80%/95-105%/120% от дневной цели калорий
- Для GAIN: рекомендация по белку ≈ 1.8 г/кг веса

### 23.4. ProductRecommendationEngine
- Факторы ранжирования: предпочтительные категории, цели, полнота КБЖУ
- Исключения: уже использованные и избранные продукты

## 16. Соглашения о взаимодействии Frontend-Backend

### 16.1. Формат полей

**Согласованные форматы:**
- Даты: ISO 8601 (YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss)
- Числа: Double для КБЖУ (до 2 знаков после запятой)
- ID: Long (числовые)
- Enum: String в UPPER_CASE

**Nullable поля:**
- Опциональные поля могут быть null в ответе
- Клиент должен проверять на null перед использованием

### 16.2. Validation rules

**Backend валидирует (серверная валидация - обязательно):**
- Все входные данные
- Права доступа
- Бизнес-правила

**Frontend валидирует (клиентская валидация - для UX):**
- Формат полей перед отправкой
- Обязательные поля
- Показывает ошибки пользователю

### 16.3. Синхронизация изменений

**Процесс:**
1. Backend реализует эндпоинт
2. Backend обновляет Swagger
3. Backend обновляет API_CONTRACT.md
4. Frontend получает уведомление об изменении
5. Frontend адаптирует код под новый контракт

**Communication:**
- Изменения в API обсуждаются заранее
- Breaking changes требуют согласования
- Версионирование API (в будущем)

---

## 17. Приоритеты реализации эндпоинтов

### Неделя 1 (P0):
- POST /my-food/auth/user (регистрация)
- POST /my-food/auth/token (вход)
- GET /my-food/auth/user
- POST /my-food/user-profile
- GET /my-food/user-profile
- PUT /my-food/user-profile

### Неделя 2 (P1):
- GET /product_category
- POST /product
- GET /product/search/name
- GET /favorite
- POST /favorite/{id}
- DELETE /favorite/{id}

### Неделя 2-3 (P1):
- POST /meal
- GET /meal/findByDate
- DELETE /meal/{id}
- POST /meal_element
- GET /meal_element/meal/{mealId}
- PUT /meal_element
- DELETE /meal_element/{id}

### Неделя 3 (P2):
- GET /product/search/barcode/{barcode}
- PUT /product
- DELETE /product/{id}

### Неделя 3-4 (P3):
- POST /meal_element/analyze-photo
- POST /device

---

## Заключение

Данный API контракт является обязательным документом для синхронизации Frontend и Backend разработки. Все изменения должны отражаться в этом документе.

**При реализации:**
- Backend реализует согласно контракту
- Frontend использует согласно контракту
- Любые отклонения обсуждаются и документируются

**Вопросы:**
- Backend: L423r
- Frontend: Knois

**Версия:** 1.0  
**Дата:** 20 октября 2024

---

## 24. Diet Chat (AI Nutritionist, SSE)

**Назначение:** диалог с AI-диетологом в нескольких чатах, потоковая выдача ответа через SSE (OpenAI gpt-4o, существующий клиент).

### 24.1 Создать чат

**Endpoint**
```
POST /my-food/diet-chat/sessions
Headers: Authorization: Bearer {token}
```

**Request**
```json
{
  "title": "Консультация по сушке" // optional, max 255
}
```

**Response (201)**
```json
{
  "id": 12,
  "title": "Консультация по сушке",
  "model": "gpt-4o",
  "lastMessageAt": null,
  "createdAt": "2025-12-08T12:00:00",
  "updatedAt": "2025-12-08T12:00:00"
}
```

**Errors**
- 401 Unauthorized

### 24.2 Список чатов пользователя

**Endpoint**
```
GET /my-food/diet-chat/sessions
Headers: Authorization: Bearer {token}
```

**Response (200)**
```json
[
  {
    "id": 12,
    "title": "Консультация по сушке",
    "model": "gpt-4o",
    "lastMessageAt": "2025-12-08T12:05:00",
    "createdAt": "2025-12-08T12:00:00",
    "updatedAt": "2025-12-08T12:05:00"
  }
]
```

**Errors**
- 401 Unauthorized

### 24.3 История сообщений

**Endpoint**
```
GET /my-food/diet-chat/sessions/{sessionId}/messages?limit=20
Headers: Authorization: Bearer {token}
```

`limit` — optional, default 20, max 50. Сообщения возвращаются по возрастанию времени.

**Response (200)**
```json
[
  {
    "id": 101,
    "role": "USER",
    "content": "Помоги сбросить вес на 5 кг за 2 месяца",
    "createdAt": "2025-12-08T12:01:00"
  },
  {
    "id": 102,
    "role": "ASSISTANT",
    "content": "Для безопасного снижения веса рекомендую...",
    "createdAt": "2025-12-08T12:01:05"
  }
]
```

**Errors**
- 401 Unauthorized
- 404 Chat not found / not owned by user

### 24.4 Отправить сообщение и получать поток ответа (SSE)

**Endpoint**
```
GET /my-food/diet-chat/sessions/{sessionId}/stream
Headers:
  Authorization: Bearer {token}
  Accept: text/event-stream
Query params:
  message   (required, max 4000)
  language  (optional: ru|en, default ru)
```

**Response (200, text/event-stream)**
События:
- `event: token` — части ответа (string)
- `event: done`  — `"completed"` когда ответ закончен

Пример потока:
```
event: token
data: Для поддержания веса придерживайтесь...

event: token
data:  Завтрак: овсянка...

event: done
data: completed
```

**Поведение**
- Сообщение пользователя сохраняется в истории
- Ответ ассистента собирается из токенов и сохраняется в истории по завершении
- Валидация: message — required, max 4000 chars
- AI получает контекст профиля и последних показателей (рост/вес/возраст/цель/активность, 7-дневные ккал/БЖУ и тренд веса); язык ответа определяется полем `language`

**Errors**
- 401 Unauthorized
- 404 Chat not found / not owned by user
- 500 При ошибке внешнего AI

### 24.5 Stateless анализ дня (SSE, без сессий)

**Назначение:** одноразовый анализ текущего дня питания (КБЖУ, совместимость продуктов), без истории и без создания сессии.

**Endpoint**
```
GET /my-food/diet-chat/stream
Headers:
  Authorization: Bearer {token}
  Accept: text/event-stream
Query params:
  prompt    (required, max 4000)
  language  (optional: ru|en, default ru)
```

**Response (200, text/event-stream)**
- `event: token` — части ответа (string)
- `event: done`  — `"completed"` когда ответ закончен

**Поведение**
- Используется тот же системный промпт, что и для сессионного чата, плюс контекст пользователя (профиль: рост/вес/возраст/цель/активность; последние 7 дней КБЖУ и тренд веса).
- История не сохраняется, сессии не создаются.
- Язык ответа выбирается по полю `language` (ru|en).

**Errors**
- 400 — неверный запрос (пустой prompt)
- 401 — Unauthorized
- 429 — слишком много запросов
- 503 — сервис недоступен

### 24.6 Stateless запрос к диетологу (синхронный ответ)

**Назначение:** одноразовый запрос к AI диетологу без создания сессии, возвращает полный ответ синхронно в виде JSON (без SSE streaming).

**Endpoint**
```
GET /my-food/diet-chat/reply
Headers:
  Authorization: Bearer {token}
Query params:
  prompt    (required, max 4000)
  language  (optional: ru|en, default ru)
```

**Response (200 OK)**
```json
{
  "content": "Полный отформатированный ответ AI диетолога..."
}
```

**Поведение**
- Используется тот же системный промпт и контекст пользователя, что и для `/diet-chat/stream`
- История не сохраняется, сессии не создаются
- Возвращает полный ответ сразу (не токенами)
- Обычный JSON ответ (не SSE)
- Может быть медленнее для длинных ответов (ждет полного ответа от OpenAI)
- Проще в использовании для клиентов, которым не нужен streaming

**Примеры:**
```
GET /diet-chat/reply?prompt=Как похудеть на 5 кг?
GET /diet-chat/reply?prompt=Analyze my nutrition&language=en
```

**Errors**
- 400 — неверный запрос (пустой prompt)
- 401 — Unauthorized
- 429 — слишком много запросов
- 500 — ошибка при получении ответа от AI
- 503 — сервис недоступен

---

## 25. Друзья и совместный доступ

### 25.1 Модель прав
- `canViewMeals` — смотреть приемы пищи друга.
- `canAddMeals` — добавлять приемы пищи другу.
- `canViewAnalytics` — смотреть аналитику/статистику друга.
- При принятии запроса все три флага по умолчанию включены. Владелец может менять их по каждому другу.

### 25.2 Эндпоинты

**Отправить запрос в друзья**  
`POST /my-food/friends/requests`  
Body:
```json
{ "targetUserEmail": "friend@example.com" }
```
Response `201`:
```json
{
  "id": 10,
  "senderId": 7,
  "receiverId": 42,
  "status": "PENDING",
  "createdAt": "2025-12-08T12:00:00"
}
```
Errors:
- `400` — невалидный email формат
- `404` — пользователь с указанным email не найден

**Принять/отклонить запрос**  
`POST /my-food/friends/requests/{id}/accept`  
`POST /my-food/friends/requests/{id}/decline`  
Response `200` — `FriendRequestResponse`.

**Отозвать исходящий запрос**  
`DELETE /my-food/friends/requests/{id}` → `204 No Content`

**Удалить друга**  
`DELETE /my-food/friends/{friendId}` → `204 No Content`

**Список друзей**  
`GET /my-food/friends`  
Response:
```json
[
  {
    "friendId": 42,
    "name": "Bob",
    "email": "bob@example.com",
    "avatarUrl": "https://cdn/avatars/bob.png",
    "friendsSince": "2025-12-08T12:05:00",
    "permissions": {
      "ownerId": 7,
      "friendId": 42,
      "canViewMeals": true,
      "canAddMeals": true,
      "canViewAnalytics": true,
      "updatedAt": "2025-12-08T12:05:00"
    }
  }
]
```

**Получить/обновить разрешения**  
`GET /my-food/friends/{friendId}/permissions`  
`PUT /my-food/friends/{friendId}/permissions`  
Body:
```json
{
  "canViewMeals": true,
  "canAddMeals": false,
  "canViewAnalytics": true
}
```
Response `200` — `FriendPermissionResponse`.

**Списки запросов**  
`GET /my-food/friends/requests/incoming` — входящие PENDING  
`GET /my-food/friends/requests/outgoing` — исходящие PENDING

### 25.3 Доступ к данным друзей

Для чтения/создания данных друзей используется query-параметр `targetUserId`.  
Если параметр не передан — используется текущий пользователь.

Эндпоинты с поддержкой `targetUserId`:
- Meals: `POST /my-food/meal`, `GET /my-food/meal`, `GET /my-food/meal/{id}`, `GET /my-food/meal/findByDate`
- Nutrition: `/my-food/nutrition/daily`, `/my-food/nutrition/weekly`, `/my-food/nutrition/monthly`, `/my-food/nutrition/trend`, `/my-food/nutrition/statistics`, `/my-food/nutrition/progress`
- Weight history (только чтение): `GET /my-food/weight-history`, `/my-food/weight-history/latest`, `/my-food/weight-history/stats`

Правила:
- При отсутствии нужного права возвращается `403 Forbidden`.
- Изменение/удаление чужих приемов пищи и веса запрещено.

