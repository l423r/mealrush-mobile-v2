# API Contract: MealRush Backend

**Версия:** 2.0.0  
**Дата:** 20 октября 2024  
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

### 1.5. Формат ошибок

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
  "dayLimitCal": 1800
}
```

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
  "dayLimitCal": 1700
}
```

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

**Request Body:**
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

**Примечание:** Поле `imageBase64` опционально.

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
  "imageUrl": "http://80.87.201.75:8079/gateway/my-food/images/123.jpg",
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
  ...
}
```

**Примечание:** Все поля опциональны. ID передается в URL path.

**Response (200 OK):**
```json
{
  "id": 123,
  "name": "Гречка отварная домашняя",
  ...
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

**Request Body:**
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
  "imageBase64": "..."
}
```

**Примечание:** 
- `parentProductId` опционально, если элемент создается из продукта
- `imageBase64` опционально для загрузки изображения

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
  "imageUrl": "http://.../images/456.jpg",
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
  "calories": 220.0
}
```

**Примечание:** Все поля опциональны. ID передается в URL path.

**Response (200 OK):** обновленный MealElement

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

## 9. Устройства (для уведомлений)

### 9.1. Регистрация устройства

**Endpoint:**
```
POST /my-food/device
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "device_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "device_type": "ANDROID"
}
```

**Device types:**
- `ANDROID`
- `IOS`

**Response (201 Created):**
```json
{
  "id": 1,
  "userId": 1,
  "deviceToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "deviceType": "ANDROID",
  "createdAt": "2024-10-20T12:00:00Z"
}
```

**Errors:**
- 409: Устройство уже зарегистрировано (можно игнорировать)

### 9.2. Удаление устройства

**Endpoint:**
```
DELETE /my-food/device/{deviceToken}
Headers: Authorization: Bearer {token}
```

**Примеры:**
```
/device/ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

**Response (204 No Content)**

**Errors:**
- 404: Устройство не найдено
- 403: Устройство принадлежит другому пользователю

---

## 10. Изображения

### 10.1. Получение изображения

**Endpoint:**
```
GET /my-food/images/{filename}
```

**Примеры:**
```
/images/123.jpg
/images/product_456.png
```

**Response (200 OK):**
- Content-Type: image/jpeg, image/png, и т.д.
- Body: бинарные данные изображения

**Errors:**
- 404: Изображение не найдено

**Примечание:** 
- Эндпоинт используется для получения изображений продуктов и блюд
- Изображения загружаются через `image_base64` в других эндпоинтах (POST /product, POST /meal_element)
- URL изображений возвращается в поле `image_url` (например: `http://80.87.201.75:8079/gateway/my-food/images/123.jpg`)

---

## 11. Анализ фото (AI)

### 11.1. Анализ блюда по фотографии

**Endpoint:**
```
POST /my-food/meal_element/analyze-photo
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "language": "ru"
}
```

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

**Примечание:** Клиент должен позволить пользователю откорректировать данные перед сохранением

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
  "defaultQuantity": "100"
}
→ Response: MealElement created

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
  "image_base64": "data:image/jpeg;base64,...",
  "language": "ru"
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

### Версия 2.0.0 (текущая - 23 октября 2024)

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

