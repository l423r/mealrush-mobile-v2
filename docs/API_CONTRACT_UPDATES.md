# Обновления моделей данных для соответствия API контракту

**Дата:** 23 января 2025  
**Статус:** Завершено

## Обзор

Внесены исправления в модели данных и сервисы для полного соответствия API контракту из `docs/API_CONTRACT.md`.

## Основные изменения

### 1. Типы данных (`src/types/api.types.ts`)

#### Product
- **Удалено:** `productCategory`, `store`, `price`
- **Добавлено:** `productCategoryId?: string` (flat field вместо объекта)
- **ProductCreate:** Исправлено использование `productCategoryId` вместо вложенного объекта
- **ProductUpdate:** Удален `id` из интерфейса (ID передается в URL)

#### MealElement
- **Изменено:** `parentProduct: { id, name }` → `parentProductId: number | null`
- **Удалено:** `code` из MealElement и MealElementCreate
- **MealElementCreate:**
  - Изменено: `meal: { id }` → `mealId: number`
  - Изменено: `parentProduct: { id }` → `parentProductId?: number`

#### MealElementUpdate
- **Удалено:** `id` из интерфейса (ID передается в URL)

#### MealUpdate
- **Удалено:** `id` из интерфейса (ID передается в URL)

### 2. API Services

#### product.service.ts
- **Добавлено:** `getById(id: number)` метод
- **Изменено:** `update(id, productData)` - теперь принимает id отдельно
- **Исправлено:** Алиасы `updateProduct` и `deleteProduct` теперь соответствуют сигнатурам

#### meal.service.ts
- **Изменено:** `updateMeal(id, mealData)` - теперь принимает id отдельно
- **Изменено:** `updateMealElement(id, elementData)` - теперь принимает id отдельно

#### profile.service.ts
- **Добавлено:** `deleteProfile()` метод

### 3. Stores

#### ProductStore.ts
- **Изменено:** `updateProduct(id, productData)` - теперь принимает id отдельно

#### MealStore.ts
- **Изменено:** `updateMealElement(id, elementData)` - теперь принимает id отдельно
- **Изменено:** Использование `elementData.mealId` вместо `elementData.meal.id`

### 4. UI Components

#### MealElementScreen.tsx
- **Исправлено:** Создание `MealElement` теперь использует `mealId` и `parentProductId` вместо вложенных объектов
- **Исправлено:** Обновление теперь передает id отдельно: `updateMealElement(elementId, data)`

#### ProductScreen.tsx
- **Исправлено:** Создание продукта использует `productCategoryId` вместо `productCategory: { id }`
- **Исправлено:** Обновление теперь передает id отдельно: `updateProduct(product.id, productData)`

## Соответствие API контракту

### Product endpoints
- ✅ `POST /product` - использует flat `productCategoryId`
- ✅ `PUT /product/{id}` - id в URL
- ✅ `GET /product/{id}` - добавлен метод getById
- ✅ `DELETE /product/{id}` - id в URL

### MealElement endpoints
- ✅ `POST /meal_element` - использует `mealId` и `parentProductId`
- ✅ `PUT /meal_element/{id}` - id в URL
- ✅ `DELETE /meal_element/{id}` - id в URL

### Meal endpoints
- ✅ `PUT /meal/{id}` - id в URL

### UserProfile endpoints
- ✅ `DELETE /user-profile` - добавлен метод deleteProfile

## Преимущества

1. **Строгая типизация:** Все модели данных соответствуют API контракту
2. **RESTful подход:** ID передаются в URL, а не в теле запроса
3. **Упрощенная структура:** Flat поля вместо вложенных объектов
4. **Консистентность:** Единый подход к передаче ID во всех сервисах

## Обратная совместимость

Все изменения обратно несовместимы. Если в коде используются старые модели данных, требуется обновление.

## Тестирование

После внесения изменений рекомендуется проверить:
- ✅ Создание продукта
- ✅ Обновление продукта
- ✅ Создание элемента приема пищи
- ✅ Обновление элемента приема пищи
- ✅ Все операции с meal

## Примечания

- Все методы теперь следуют RESTful принципам
- ID всегда передается в URL для PUT и DELETE операций
- Flat структура данных соответствует backend API

