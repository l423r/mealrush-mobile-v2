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
import { Ionicons } from '@expo/vector-icons';
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

  const getMealTypeIcon = (mealType: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      BREAKFAST: 'sunny-outline',
      LUNCH: 'partly-sunny-outline',
      DINNER: 'moon-outline',
      SUPPER: 'cafe-outline',
      LATE_SUPPER: 'moon',
    };
    return icons[mealType] || 'restaurant-outline';
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
                          <Ionicons
                            name={getMealTypeIcon(meal.mealType)}
                            size={20}
                            color={colors.text.primary}
                          />
                        </View>
                        <View style={styles.mealInfo}>
                          <Text style={styles.mealName}>
                            {getMealTypeLabel(meal.mealType)}
                          </Text>
                          <Text style={styles.mealTime}>
                            {formatTime(meal.dateTime)}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
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
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
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
    width: '95%',
    maxWidth: 500,
  },
  dialog: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.xl,
    elevation: 10,
    maxHeight: '90%',
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
    marginBottom: spacing.md,
    textAlign: 'center',
    lineHeight: 18,
  },
  mealsScrollView: {
    maxHeight: 450,
    marginBottom: spacing.sm,
  },
  mealOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  mealIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  mealIcon: {
    fontSize: 20,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 1,
  },
  mealTime: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.xs,
  },
  createButtonText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelText: {
    ...typography.button,
    color: colors.text.primary,
    fontWeight: '600',
  },
});

export default MealSelectorDialog;

