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
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';

interface MealTypeConfirmDialogProps {
  visible: boolean;
  onConfirm: () => void;
  onCreateNew: () => void;
  onCancel: () => void;
  mealTypeName: string;
  mealTime: string;
}

const MealTypeConfirmDialog: React.FC<MealTypeConfirmDialogProps> = ({
  visible,
  onConfirm,
  onCreateNew,
  onCancel,
  mealTypeName,
  mealTime,
}) => {
  console.log('🎨 [MealTypeConfirmDialog] Render');
  console.log('  - visible:', visible);
  console.log('  - mealTypeName:', mealTypeName);
  console.log('  - mealTime:', mealTime);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogContainer}>
              <View style={styles.dialog}>
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name="restaurant"
                    size={48}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.title}>Добавить к существующему приему?</Text>
                <Text style={styles.message}>
                  У вас уже есть {mealTypeName} в {mealTime}. Добавить продукты к нему?
                </Text>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => {
                    console.log('👆 [MealTypeConfirmDialog] Нажата кнопка "Добавить к существующему"');
                    onConfirm();
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="add-circle-outline"
                    size={24}
                    color={colors.white}
                  />
                  <Text style={styles.confirmButtonText}>
                    Добавить к существующему
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.createNewButton}
                  onPress={() => {
                    console.log('👆 [MealTypeConfirmDialog] Нажата кнопка "Создать новый прием"');
                    onCreateNew();
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="add"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.createNewButtonText}>
                    Создать новый прием
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    console.log('👆 [MealTypeConfirmDialog] Нажата кнопка "Отмена"');
                    onCancel();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Отмена</Text>
                </TouchableOpacity>
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
  },
  dialogContainer: {
    width: '85%',
    maxWidth: 400,
  },
  dialog: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.xl,
    elevation: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  message: {
    ...typography.body1,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 24,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  confirmButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.sm,
  },
  createNewButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
  },
  cancelText: {
    ...typography.button,
    color: colors.text.primary,
    fontWeight: '500',
  },
});

export default MealTypeConfirmDialog;

