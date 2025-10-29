import { useState, useCallback } from 'react';
import type { AlertType } from '../components/common/AlertDialog';

interface UseAlertOptions {
  title: string;
  message?: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
}

export const useAlert = () => {
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    type: AlertType;
    confirmText: string;
    cancelText: string;
    showCancel: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    visible: false,
    title: '',
    message: undefined,
    type: 'info',
    confirmText: 'ОК',
    cancelText: 'Отмена',
    showCancel: false,
  });

  const showAlert = useCallback(
    (
      options: UseAlertOptions,
      onConfirm?: () => void,
      onCancel?: () => void
    ) => {
      setAlertState({
        visible: true,
        title: options.title,
        message: options.message,
        type: options.type || 'info',
        confirmText: options.confirmText || 'ОК',
        cancelText: options.cancelText || 'Отмена',
        showCancel: !!onCancel,
        onConfirm,
        onCancel,
      });
    },
    []
  );

  const showSuccess = useCallback(
    (title: string, message?: string, onConfirm?: () => void) => {
      showAlert({ title, message, type: 'success' }, onConfirm);
    },
    [showAlert]
  );

  const showError = useCallback(
    (title: string, message?: string, onConfirm?: () => void) => {
      showAlert({ title, message, type: 'error' }, onConfirm);
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (title: string, message?: string, onConfirm?: () => void) => {
      showAlert({ title, message, type: 'info' }, onConfirm);
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (
      title: string,
      message?: string,
      onConfirm?: () => void,
      onCancel?: () => void
    ) => {
      showAlert(
        { title, message, type: 'warning' },
        onConfirm,
        onCancel
      );
    },
    [showAlert]
  );

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void
    ) => {
      showAlert(
        { title, message, type: 'info', confirmText: 'Подтвердить' },
        onConfirm,
        onCancel
      );
    },
    [showAlert]
  );

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    alertState,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    hideAlert,
  };
};

export const useImageSource = () => {
  const [visible, setVisible] = useState(false);
  const [callback, setCallback] = useState<
    ((source: 'camera' | 'gallery') => void) | null
  >(null);

  const showImageSourceDialog = useCallback(
    (onSelect: (source: 'camera' | 'gallery') => void) => {
      setCallback(() => onSelect);
      setVisible(true);
    },
    []
  );

  const handleSelect = useCallback(
    (source: 'camera' | 'gallery') => {
      callback?.(source);
      setVisible(false);
      setCallback(null);
    },
    [callback]
  );

  const handleClose = useCallback(() => {
    setVisible(false);
    setCallback(null);
  }, []);

  return {
    visible,
    showImageSourceDialog,
    handleSelectCamera: () => handleSelect('camera'),
    handleSelectGallery: () => handleSelect('gallery'),
    handleClose,
  };
};

