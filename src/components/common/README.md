# Компоненты системных сообщений

## Snackbar

Компонент для отображения временных уведомлений (успех, ошибка, информация, предупреждение).

### Использование

```typescript
import { useStores } from '../../stores';

const { uiStore } = useStores();

// Показать snackbar
uiStore.showSnackbar('Продукт создан', 'success');
uiStore.showSnackbar('Ошибка при сохранении', 'error');
uiStore.showSnackbar('Загрузка завершена', 'info');
uiStore.showSnackbar('Проверьте данные', 'warning');

// Скрыть snackbar (автоматически через 4 секунды)
uiStore.hideSnackbar();
```

Snackbar автоматически отображается глобально через AppNavigator.

## AlertDialog

Компонент для отображения модальных диалогов с подтверждением действий.

### Использование

```typescript
import { useAlert } from '../../hooks/useAlert';

const { alertState, showSuccess, showError, showWarning, showConfirm, hideAlert } = useAlert();

// Простой alert
showSuccess('Успех', 'Операция выполнена успешно');

// Alert с кнопками
showConfirm(
  'Подтверждение',
  'Вы уверены, что хотите удалить этот элемент?',
  () => {
    // Обработка подтверждения
    handleDelete();
  },
  () => {
    // Обработка отмены (опционально)
    console.log('Отменено');
  }
);

// Рендер в компоненте
<AlertDialog
  visible={alertState.visible}
  title={alertState.title}
  message={alertState.message}
  type={alertState.type}
  confirmText={alertState.confirmText}
  cancelText={alertState.cancelText}
  showCancel={alertState.showCancel}
  onConfirm={alertState.onConfirm}
  onCancel={alertState.onCancel}
  onDismiss={hideAlert}
/>
```

## ImageSourceDialog

Компонент для выбора источника изображения (камера или галерея).

### Использование

```typescript
import { useImageSource } from '../../hooks/useAlert';
import ImageSourceDialog from '../../components/common/ImageSourceDialog';

const imageSource = useImageSource();

// Показать диалог выбора
imageSource.showImageSourceDialog((source) => {
  if (source === 'camera') {
    handleCamera();
  } else {
    handleImagePicker();
  }
});

// Рендер в компоненте
<ImageSourceDialog
  visible={imageSource.visible}
  onClose={imageSource.handleClose}
  onCameraPress={imageSource.handleSelectCamera}
  onGalleryPress={imageSource.handleSelectGallery}
/>
```

## Миграция с Alert.alert

### До (старый способ)

```typescript
Alert.alert('Успех', 'Продукт создан');
Alert.alert('Ошибка', 'Не удалось сохранить');
```

### После (новый способ)

```typescript
uiStore.showSnackbar('Продукт создан', 'success');
uiStore.showSnackbar('Не удалось сохранить', 'error');
```

Для диалогов с подтверждением:

```typescript
// Старый способ
Alert.alert('Удаление', 'Вы уверены?', [
  { text: 'Отмена', style: 'cancel' },
  { text: 'Удалить', onPress: handleDelete },
]);

// Новый способ
showConfirm('Удаление', 'Вы уверены?', handleDelete);
```
