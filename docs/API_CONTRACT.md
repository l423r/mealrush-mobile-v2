# API Contract: MealRush Backend

**Версия:** 2.5.0  
**Дата:** 7 ноября 2024  
**Статус:** Утверждено

---

## 1. Общая информация

### 1.1. Base URL

**Development:**
```
http://localhost:8081/my-food
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
  "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 2592000
}
```

**Errors:**
- 401: Неверный email или пароль
- 400: Невалидные данные

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
  "roles": ["USER"]
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
- Поиск по подстроке (case-insensitive)
- Сначала пользовательские продукты, потом общие
- Сортировка по релевантности

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

**Примечание:** Возвращает список БЕЗ пагинации (обычно за день мало приемов пищи)

**Response (200 OK):**
```json
[
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
  "comment": "Это домашний обед с макаронами и котлетой"
}
```

**Поля:**
- `imageBase64` (обязательное) - base64 строка изображения
- `language` (опциональное) - язык для распознавания (`ru`/`en`, по умолчанию `ru`)
- `comment` (опциональное) - комментарий пользователя для более точного анализа блюда (макс. 500 символов)

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
  "language": "ru"
}
```

**Поля:**
- `description` (обязательное) - текстовое описание блюда с ингредиентами (1-1000 символов)
- `language` (опциональное) - язык для анализа (`ru`/`en`, по умолчанию `ru`)

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
  "comment": "Примерно стандартная порция"
}
```

**Поля:**
- `audioBase64` (обязательное) - base64 строка аудио файла
- `language` (опциональное) - язык для транскрипции (`ru`/`en`, по умолчанию `ru`)
- `comment` (опциональное) - дополнительный контекст для анализа (макс. 500 символов)

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
→ Response: { jwt_token, token_type, expires_in }

// 3. Создание профиля
POST /my-food/user-profile
Headers: Authorization: Bearer {jwt_token}
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

### Версия 2.5.0 (текущая - 7 ноября 2024)

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

