import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation.types';
import type { Meal } from '../../types/api.types';
import { useStores } from '../../stores';
import { colors, typography, spacing, borderRadius } from '../../theme';
import {
  formatTimeInTimezone,
  formatMealType,
  formatCalories,
  formatWeight,
  formatDate,
} from '../../utils/formatting';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import NutrientRow from '../../components/common/NutrientRow';
import CompactSummary from '../../components/common/CompactSummary';
import MealTypeEditDialog from '../../components/common/MealTypeEditDialog';
import MealSelectorDialog from '../../components/common/MealSelectorDialog';
import MealActionsMenu from '../../components/common/MealActionsMenu';
import TemplateNameDialog from '../../components/common/TemplateNameDialog';
import DateTimePickerDialog from '../../components/common/DateTimePickerDialog';
import AlertDialog from '../../components/common/AlertDialog';
import { useAlert } from '../../hooks/useAlert';
import { MaterialIcons } from '@expo/vector-icons';

type MealScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Meal'
>;
type MealScreenRouteProp = RouteProp<MainStackParamList, 'Meal'>;

const MealScreen: React.FC = observer(() => {
  const navigation = useNavigation<MealScreenNavigationProp>();
  const route = useRoute<MealScreenRouteProp>();
  const { mealStore, uiStore, profileStore, mealTemplateStore } = useStores();
  const { alertState, showConfirm, hideAlert } = useAlert();

  const meal = route.params.meal;
  const elements = mealStore.mealElements[meal.id] || [];
  const userTimezone = profileStore.profile?.timezone || 'UTC';
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [showCopyDateTimeDialog, setShowCopyDateTimeDialog] = useState(false);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [isCopying, setIsCopying] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showTemplateNameDialog, setShowTemplateNameDialog] = useState(false);

  useEffect(() => {
    // Load meal elements if not already loaded
    if (!elements.length) {
      mealStore.loadMealElements(meal.id);
    }
  }, [elements.length, mealStore, meal.id]);

  // Load meals for selected date when copy dialog opens
  useEffect(() => {
    if (showCopyDialog) {
      loadMealsForSelectedDate();
    }
  }, [showCopyDialog]);

  const loadMealsForSelectedDate = async () => {
    try {
      const originalDate = mealStore.selectedDate;
      await mealStore.loadMealsForDate(originalDate);
      // Get meals for selected date
      const mealsList = mealStore.mealsForSelectedDate;
      setTodayMeals(mealsList);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const handleAddElement = () => {
    navigation.navigate('Search', {
      mealId: meal.id,
    });
  };

  const handleElementPress = (element: any) => {
    navigation.navigate('MealElement', {
      item: element,
      mealId: meal.id,
    });
  };

  const handleDeleteElement = async (elementId: number) => {
    showConfirm(
      'Удаление блюда',
      'Вы уверены, что хотите удалить это блюдо из приема пищи?',
      async () => {
        try {
          await mealStore.deleteMealElement(elementId);
        } catch {
          uiStore.showSnackbar('Не удалось удалить блюдо', 'error');
        }
      }
    );
  };

  const handleDeleteMeal = async () => {
    showConfirm(
      'Удаление приема пищи',
      'Вы уверены, что хотите удалить весь прием пищи?',
      async () => {
        try {
          await mealStore.deleteMeal(meal.id);
          navigation.goBack();
        } catch {
          uiStore.showSnackbar('Не удалось удалить прием пищи', 'error');
        }
      }
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditMealType = () => {
    setShowEditDialog(true);
  };

  const handleCopyMeal = () => {
    setShowCopyDialog(true);
  };

  const handleSaveAsTemplate = () => {
    if (elements.length === 0) {
      uiStore.showSnackbar('Нет блюд для сохранения в шаблон', 'error');
      return;
    }
    setShowTemplateNameDialog(true);
  };

  const handleTemplateNameConfirm = async (templateName: string) => {
    try {
      // Создаем шаблон из приема пищи
      const template = await mealTemplateStore.createTemplate({ mealId: meal.id });
      // Обновляем шаблон с именем
      await mealTemplateStore.updateTemplate(template.id, { name: templateName });
      uiStore.showSnackbar('Прием пищи сохранен как шаблон', 'success');
      setShowTemplateNameDialog(false);
    } catch (error) {
      uiStore.showSnackbar(
        mealTemplateStore.error || 'Не удалось сохранить шаблон',
        'error'
      );
    }
  };

  const getDefaultTemplateName = () => {
    return `${formatMealType(meal.mealType)} от ${formatDate(meal.dateTime, 'dd.MM.yyyy')}`;
  };

  const copyMealElements = async (targetMealId: number, showSuccessMessage: boolean = true) => {
    if (elements.length === 0) {
      uiStore.showSnackbar('Нет блюд для копирования', 'error');
      return;
    }

    try {
      for (const element of elements) {
        await mealStore.createMealElement({
          mealId: targetMealId,
          name: element.name,
          quantity: element.quantity,
          proteins: element.proteins,
          fats: element.fats,
          carbohydrates: element.carbohydrates,
          calories: element.calories,
          measurementType: element.measurementType,
          defaultProteins: element.defaultProteins,
          defaultFats: element.defaultFats,
          defaultCarbohydrates: element.defaultCarbohydrates,
          defaultCalories: element.defaultCalories,
          defaultQuantity: element.defaultQuantity,
          parentProductId: element.parentProductId || undefined,
          imageUrl: element.imageUrl || undefined,
        });
      }
      // Reload meal elements for target meal
      await mealStore.loadMealElements(targetMealId);
      if (showSuccessMessage) {
        uiStore.showSnackbar('Прием пищи скопирован', 'success');
      }
      setShowCopyDialog(false);
    } catch (error) {
      uiStore.showSnackbar('Не удалось скопировать прием пищи', 'error');
      throw error;
    }
  };

  const handleMealSelect = async (mealId: number) => {
    setIsCopying(true);
    try {
      await copyMealElements(mealId);
    } catch (error) {
      // Error already handled in copyMealElements
    } finally {
      setIsCopying(false);
    }
  };

  const handleCreateNewMeal = () => {
    // Close meal selector dialog and show date/time picker
    setShowCopyDialog(false);
    setShowCopyDateTimeDialog(true);
  };

  const handleCopyDateTimeConfirm = async (dateTime: Date) => {
    setIsCopying(true);
    setShowCopyDateTimeDialog(false);
    
    try {
      // Create new meal with same type and time, but for selected date/time
      const mealDateTime = new Date(meal.dateTime);
      dateTime.setHours(mealDateTime.getHours(), mealDateTime.getMinutes(), 0, 0);
      
      const newMeal = await mealStore.createMeal({
        mealType: meal.mealType,
        dateTime: dateTime.toISOString(),
        name: meal.name,
      });
      
      // Copy elements to new meal (don't show success message here, we'll show it after)
      await copyMealElements(newMeal.id, false);
      
      // Reload meals for the date where meal was created
      const mealDate = new Date(dateTime);
      mealDate.setHours(0, 0, 0, 0);
      const originalDate = mealStore.selectedDate;
      await mealStore.loadMealsForDate(mealDate);
      
      // Restore original selected date if different
      if (mealDate.getTime() !== originalDate.getTime()) {
        mealStore.setSelectedDate(originalDate);
        await mealStore.loadMealsForDate(originalDate);
      }
      
      uiStore.showSnackbar('Прием пищи создан и скопирован', 'success');
      
      // Navigate to the created meal
      navigation.navigate('Meal', { meal: newMeal });
    } catch (error) {
      uiStore.showSnackbar('Не удалось создать прием пищи', 'error');
    } finally {
      setIsCopying(false);
    }
  };

  const handleMealTypeSelect = async (newType: string, newDateTime?: Date) => {
    setShowEditDialog(false);
    
    const mealDate = new Date(meal.dateTime);
    const hasTypeChanged = newType !== meal.mealType;
    
    if (!newDateTime) {
      // This shouldn't happen for meals, but handle it gracefully
      if (!hasTypeChanged) {
        return; // No change
      }
      
      try {
        await mealStore.updateMeal(meal.id, {
          mealType: newType,
          dateTime: meal.dateTime,
          name: meal.name,
        } as any);
        uiStore.showSnackbar('Тип приема пищи изменен', 'success');
        await mealStore.loadMealsForDate(mealStore.selectedDate);
      } catch (error) {
        uiStore.showSnackbar('Не удалось изменить прием пищи', 'error');
      }
      return;
    }
    
    const hasTimeChanged = 
      newDateTime.getHours() !== mealDate.getHours() ||
      newDateTime.getMinutes() !== mealDate.getMinutes();
    
    if (!hasTypeChanged && !hasTimeChanged) {
      return; // No change
    }

    try {
      await mealStore.updateMeal(meal.id, {
        mealType: newType,
        dateTime: newDateTime.toISOString(),
        name: meal.name,
      } as any);
      
      let message = '';
      if (hasTypeChanged && hasTimeChanged) {
        message = 'Тип и время приема пищи изменены';
      } else if (hasTypeChanged) {
        message = 'Тип приема пищи изменен';
      } else {
        message = 'Время приема пищи изменено';
      }
      
      uiStore.showSnackbar(message, 'success');
      // Reload meal data
      await mealStore.loadMealsForDate(mealStore.selectedDate);
    } catch (error) {
      uiStore.showSnackbar('Не удалось изменить прием пищи', 'error');
    }
  };

  const renderElement = ({ item: element }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.elementCard}
        onPress={() => handleElementPress(element)}
      >
        {element.imageUrl ? (
          <Image
            source={{ uri: element.imageUrl }}
            style={styles.elementImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.elementImagePlaceholder}>
            <Text style={styles.elementImagePlaceholderIcon}>🍽️</Text>
          </View>
        )}

        <View style={styles.elementInfo}>
          <Text style={styles.elementName} numberOfLines={1}>
            {element.name}
          </Text>
          <NutrientRow
            proteins={element.proteins}
            fats={element.fats}
            carbohydrates={element.carbohydrates}
            calories={element.calories}
            showCaloriesFirst={false}
            compact
          />
          <View style={styles.quantityCaloriesRow}>
            <Text style={styles.quantityText}>
              {formatWeight(parseFloat(element.quantity))}
            </Text>
            <Text style={styles.caloriesText}>
              {formatCalories(element.calories)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteElement(element.id)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🍽️</Text>
      <Text style={styles.emptyTitle}>Нет блюд</Text>
      <Text style={styles.emptySubtitle}>Добавьте блюда в этот прием пищи</Text>
      <Button
        title="Добавить блюдо"
        onPress={handleAddElement}
        style={styles.emptyButton}
      />
    </View>
  );

  // Calculate totals
  const totalCalories = elements.reduce(
    (sum, element) => sum + element.calories,
    0
  );
  const totalProteins = elements.reduce(
    (sum, element) => sum + element.proteins,
    0
  );
  const totalFats = elements.reduce((sum, element) => sum + element.fats, 0);
  const totalCarbohydrates = elements.reduce(
    (sum, element) => sum + element.carbohydrates,
    0
  );

  if (mealStore.loading && !isCopying) {
    return <Loading message="Загрузка приема пищи..." />;
  }

  if (isCopying) {
    return <Loading message="Копирование приема пищи..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title={formatMealType(meal.mealType)}
        subtitle={<Text style={styles.headerSubtitle}>{formatTimeInTimezone(meal.dateTime, userTimezone)}</Text>}
        showBackButton
        onBackPress={handleBack}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEditMealType} style={styles.editButton}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowActionsMenu(true)}
              style={styles.menuButton}
            >
              <MaterialIcons name="more-vert" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      <FlatList
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        data={elements}
        renderItem={renderElement}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            {/* Summary */}
            <View style={styles.summary}>
              <CompactSummary
                calories={totalCalories}
                proteins={totalProteins}
                fats={totalFats}
                carbohydrates={totalCarbohydrates}
                variant="large"
              />
            </View>

            {/* Elements Title */}
            <View style={styles.elementsTitleContainer}>
              <Text style={styles.elementsTitle}>Блюда</Text>
            </View>
          </>
        }
        ListEmptyComponent={renderEmptyState()}
        ListFooterComponent={<View style={styles.footerSpacing} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <Button
          title="+ Добавить блюдо"
          onPress={handleAddElement}
          style={styles.addButton}
        />
      </View>

      {/* Meal Type Edit Dialog */}
      <MealTypeEditDialog
        visible={showEditDialog}
        currentType={meal.mealType}
        currentDateTime={new Date(meal.dateTime)}
        onSelect={handleMealTypeSelect}
        onCancel={() => setShowEditDialog(false)}
      />

      {/* Copy Meal Dialog */}
      <MealSelectorDialog
        visible={showCopyDialog}
        meals={todayMeals}
        onClose={() => {
          setShowCopyDialog(false);
          setIsCopying(false);
        }}
        onMealSelect={handleMealSelect}
        onCreateNew={handleCreateNewMeal}
      />

      {/* Copy DateTime Picker Dialog */}
      <DateTimePickerDialog
        visible={showCopyDateTimeDialog}
        defaultDate={(() => {
          // Use selected date from mealStore, not current date
          const selectedDate = new Date(mealStore.selectedDate);
          const mealDateTime = new Date(meal.dateTime);
          // Set time to original meal time, but keep the selected date
          selectedDate.setHours(mealDateTime.getHours(), mealDateTime.getMinutes(), 0, 0);
          return selectedDate;
        })()}
        defaultTime={(() => {
          // Use original meal time
          const mealDateTime = new Date(meal.dateTime);
          return mealDateTime;
        })()}
        onConfirm={handleCopyDateTimeConfirm}
        onCancel={() => setShowCopyDateTimeDialog(false)}
      />

      {/* Actions Menu */}
      <MealActionsMenu
        visible={showActionsMenu}
        onClose={() => setShowActionsMenu(false)}
        onSaveAsTemplate={handleSaveAsTemplate}
        onCopy={handleCopyMeal}
        onDelete={handleDeleteMeal}
      />

      {/* Template Name Dialog */}
      <TemplateNameDialog
        visible={showTemplateNameDialog}
        defaultName={getDefaultTemplateName()}
        onConfirm={handleTemplateNameConfirm}
        onCancel={() => setShowTemplateNameDialog(false)}
      />

      {/* Alert Dialog */}
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
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for add button
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    fontSize: 12,
  },
  editButton: {
    padding: spacing.xs,
  },
  editIcon: {
    fontSize: 20,
  },
  menuButton: {
    padding: spacing.xs,
  },
  summary: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  elementsTitleContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  elementsTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  footerSpacing: {
    height: spacing.md,
  },
  elementCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
  },
  elementImage: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  elementImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  elementImagePlaceholderIcon: {
    fontSize: 20,
  },
  elementInfo: {
    flex: 1,
  },
  elementName: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  quantityCaloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  quantityText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  caloriesText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
  deleteButton: {
    padding: spacing.xs,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  addButton: {
    width: '100%',
  },
});

export default MealScreen;
