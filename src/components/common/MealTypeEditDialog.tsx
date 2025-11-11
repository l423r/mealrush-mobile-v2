import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

interface MealTypeEditDialogProps {
  visible: boolean;
  currentType: string;
  onSelect: (mealType: string) => void;
  onCancel: () => void;
}

const MealTypeEditDialog: React.FC<MealTypeEditDialogProps> = ({
  visible,
  currentType,
  onSelect,
  onCancel,
}) => {
  const mealTypes = [
    { value: 'BREAKFAST', label: 'Завтрак', icon: '🌅' },
    { value: 'LUNCH', label: 'Обед', icon: '🌞' },
    { value: 'DINNER', label: 'Ужин', icon: '🌙' },
    { value: 'SUPPER', label: 'Перекус', icon: '☕' },
    { value: 'LATE_SUPPER', label: 'Поздний перекус', icon: '🌃' },
  ];

  const handleSelect = (value: string) => {
    onSelect(value);
  };

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
                <Text style={styles.title}>Изменить тип приема пищи</Text>
                <Text style={styles.subtitle}>Выберите новый тип</Text>

                <View style={styles.optionsContainer}>
                  {mealTypes.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.mealOption,
                        currentType === type.value && styles.mealOptionActive,
                      ]}
                      onPress={() => handleSelect(type.value)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.mealIconContainer}>
                        <Text style={styles.mealIcon}>{type.icon}</Text>
                      </View>
                      <Text
                        style={[
                          styles.mealLabel,
                          currentType === type.value && styles.mealLabelActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
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
    padding: spacing.lg,
  },
  dialogContainer: {
    width: '90%',
    maxWidth: 400,
  },
  dialog: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.xl,
    elevation: 10,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
    fontWeight: '600',
  },
  subtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  optionsContainer: {
    marginBottom: spacing.md,
  },
  mealOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  mealOptionActive: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  mealIcon: {
    fontSize: 24,
  },
  mealLabel: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
  },
  mealLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
  },
  cancelText: {
    ...typography.button,
    color: colors.text.primary,
    fontWeight: '600',
  },
});

export default MealTypeEditDialog;

