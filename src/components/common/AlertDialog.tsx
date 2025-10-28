import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  onDismiss?: () => void;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'ОК',
  cancelText = 'Отмена',
  showCancel = false,
  onConfirm,
  onCancel,
  onDismiss,
}) => {
  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
      default:
        return colors.info;
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    onDismiss?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onDismiss?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogContainer}>
              <View style={styles.dialog}>
                <View style={styles.iconContainer}>
                  <View style={[styles.iconBackground, { backgroundColor: getIconColor() + '20' }]}>
                    <MaterialIcons name={getIconName()} size={48} color={getIconColor()} />
                  </View>
                </View>

                <Text style={styles.title}>{title}</Text>
                {message && <Text style={styles.message}>{message}</Text>}

                <View style={styles.buttonsContainer}>
                  {showCancel && (
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={handleCancel}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelText}>{cancelText}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.confirmButton,
                      { backgroundColor: getIconColor() },
                      showCancel && styles.confirmButtonWithCancel,
                    ]}
                    onPress={handleConfirm}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmText}>{confirmText}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialogContainer: {
    width: '85%',
    maxWidth: 400,
  },
  dialog: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.xl,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  message: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: colors.gray[100],
  },
  confirmButton: {
    ...shadows.md,
    elevation: 4,
  },
  confirmButtonWithCancel: {
    flex: 1,
  },
  cancelText: {
    ...typography.button,
    color: colors.text.primary,
    fontWeight: '600',
  },
  confirmText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
});

export default AlertDialog;

