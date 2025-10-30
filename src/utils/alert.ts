import { Alert as RNAlert } from 'react-native';

/**
 * Показывает красивый snackbar через UIStore
 * Используется для success/error/info сообщений
 */
export const showSnackbar = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info'
) => {
  // Будет использоваться через UIStore в компонентах
  // Эта функция - вспомогательная для удобства
  return { message, type };
};

/**
 * Устаревший Alert.alert - заменен на современные диалоги
 * Используется только для критичных случаев
 */
export const showAlert = (
  title: string,
  message?: string,
  buttons?: Array<{
    text?: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>
) => {
  RNAlert.alert(title, message, buttons);
};

/**
 * Создает promise-based диалог для выбора источника изображения
 */
export const pickImageSource = (): Promise<'camera' | 'gallery' | null> => {
  return new Promise((resolve) => {
    RNAlert.alert(
      'Выберите источник',
      'Откуда взять изображение?',
      [
        {
          text: 'Камера',
          onPress: () => resolve('camera'),
        },
        {
          text: 'Галерея',
          onPress: () => resolve('gallery'),
        },
        {
          text: 'Отмена',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
};
