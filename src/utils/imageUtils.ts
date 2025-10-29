import * as ImagePicker from 'expo-image-picker';

/**
 * Запрашивает разрешение на доступ к медиа-библиотеке
 * Возвращает false если нет разрешения (сообщение об ошибке показывается через showSnackbar в вызывающем коде)
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

/**
 * Запрашивает разрешение на использование камеры
 * Возвращает false если нет разрешения (сообщение об ошибке показывается через showSnackbar в вызывающем коде)
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

/**
 * Запускает камеру для съемки фотографии
 */
export async function launchCamera(): Promise<string | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
    base64: true,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * Запускает галерею для выбора фотографии
 */
export async function launchImageLibrary(): Promise<string | null> {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
    base64: true,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * Показывает диалог выбора источника изображения (камера/галерея)
 * Теперь используется ImageSourceDialog компонент вместо Alert
 */
export async function pickImageSource(): Promise<'camera' | 'gallery' | null> {
  // Эта функция больше не используется напрямую
  // Используйте ImageSourceDialog компонент в UI
  return null;
}

/**
 * Конвертирует URI изображения в base64 строку
 */
export async function imageUriToBase64(uri: string): Promise<string | null> {
  try {
    // Используем FileReader для чтения файла
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Убираем префикс data:mime;base64, если он есть
        const base64Data = base64String.split(',')[1] || base64String;
        resolve(`data:image/jpeg;base64,${base64Data}`);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
}

/**
 * Получает изображение из выбранного источника и конвертирует в base64
 */
export async function getImageBase64(): Promise<string | null> {
  const source = await pickImageSource();
  if (!source) {
    return null;
  }

  let imageUri: string | null = null;

  if (source === 'camera') {
    imageUri = await launchCamera();
  } else if (source === 'gallery') {
    imageUri = await launchImageLibrary();
  }

  if (!imageUri) {
    return null;
  }

  // Пытаемся получить base64 из ImagePicker
  // Если нужно, конвертируем вручную
  const response = await fetch(imageUri);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Упрощенная функция получения base64 из ImagePicker
 * ImagePicker уже возвращает base64, нужно только проверить результат
 */
export async function pickImageWithBase64(): Promise<{ uri: string; base64: string } | null> {
  const source = await pickImageSource();
  if (!source) {
    return null;
  }

  let result: ImagePicker.ImagePickerResult;

  if (source === 'camera') {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return null;
    }
    result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });
  } else {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      return null;
    }
    result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });
  }

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const base64 = asset.base64 
    ? `data:image/jpeg;base64,${asset.base64}`
    : null;

  if (!base64) {
    // Если base64 нет, пытаемся получить его из URI
    const convertedBase64 = await imageUriToBase64(asset.uri);
    if (!convertedBase64) {
      return null;
    }
    return { uri: asset.uri, base64: convertedBase64 };
  }

  return {
    uri: asset.uri,
    base64,
  };
}

