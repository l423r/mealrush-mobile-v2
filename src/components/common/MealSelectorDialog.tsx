import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import type { Meal } from '../../types/api.types';
import { formatTime } from '../../utils/formatting';

interface MealSelectorDialogProps {
  visible: boolean;
  onClose: () => void;
  meals: Meal[];
  onMealSelect: (mealId: number) => void;
  onCreateNew: () => void;
}

const MealSelectorDialog: React.FC<MealSelectorDialogProps> = observer(({
  visible,
  onClose,
  meals,
  onMealSelect,
  onCreateNew,
}) => {
  const getMealTypeLabel = (mealType: string): string => {
    const labels: Record<string, string> = {
      BREAKFAST: 'Завтрак',
      LUNCH: 'Обед',
      DINNER: 'Ужин',
      SUPPER: 'Перекус',
      LATE_SUPPER: 'Поздний перекус',
    };
    return labels[mealType] || mealType;
  };

  const getMealTypeIcon = (mealType: string): string => {
    const icons: Record<string, string> = {
      BREAKFAST: '🌅',
      LUNCH: '🌞',
      DINNER: '🌙',
      SUPPER: '☕',
      LATE_SUPPER: '🌃',
    };
    return icons[mealType] || '🍽️';
  };

  const handleMealPress = (mealId: number) => {
    onMealSelect(mealId);
    onClose();
  };

  const handleCreatePress = () => {
    onCreateNew();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogContainer}>
              <View style={styles.dialog}>
                <Text style={styles.title}>Добавить к приему пищи</Text>
                <Text style={styles.subtitle}>
                  {meals.length > 0
                    ? 'Выберите прием пищи или создайте новый'
                    : 'Создайте новый прием пищи'}
                </Text>

                {meals.length > 0 && (
                  <ScrollView
                    style={styles.mealsScrollView}
                    showsVerticalScrollIndicator={false}
                  >
                    {meals.map((meal) => (
                      <TouchableOpacity
                        key={meal.id}
                        style={styles.mealOption}
                        onPress={() => handleMealPress(meal.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.mealIconContainer}>
                          <Text style={styles.mealIcon}>
                            {getMealTypeIcon(meal.mealType)}
                          </Text>
                        </View>
                        <View style={styles.mealInfo}>
                          <Text style={styles.mealName}>
                            {getMealTypeLabel(meal.mealType)}
                          </Text>
                          <Text style={styles.mealTime}>
                            {formatTime(meal.dateTime)}
                          </Text>
                        </View>
                        <MaterialIcons
                          name="chevron-right"
                          size={24}
                          color={colors.text.hint}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreatePress}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="add-circle-outline"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.createButtonText}>Создать новый прием</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
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
});

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
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.xl,
    elevation: 10,
    maxHeight: '80%',
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  mealsScrollView: {
    maxHeight: 300,
    marginBottom: spacing.md,
  },
  mealOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  mealIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  mealIcon: {
    fontSize: 24,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  mealTime: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight + '20',
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.sm,
  },
  createButtonText: {
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
    fontWeight: '600',
  },
});

export default MealSelectorDialog;

