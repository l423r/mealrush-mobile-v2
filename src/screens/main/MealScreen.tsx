import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { observer } from 'mobx-react-lite';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation.types';
import type { Meal } from '../../types/api.types';
import { useStores } from '../../stores';
import { typography, spacing, borderRadius, shadows } from '../../theme';
import {
  formatTimeInTimezone,
  formatMealType,
  formatDate,
} from '../../utils/formatting';
import Header from '../../components/common/Header';
import Loading from '../../components/common/Loading';
import CompactSummary from '../../components/common/CompactSummary';
import MealElementItem from '../../components/main/MealElementItem';
import MealTypeEditDialog from '../../components/common/MealTypeEditDialog';
import MealSelectorDialog from '../../components/common/MealSelectorDialog';
import MealActionsMenu from '../../components/common/MealActionsMenu';
import TemplateNameDialog from '../../components/common/TemplateNameDialog';
import DateTimePickerDialog from '../../components/common/DateTimePickerDialog';
import AlertDialog from '../../components/common/AlertDialog';
import { useAlert } from '../../hooks/useAlert';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { haptics } from '../../utils/haptics';
import { useTheme } from '../../hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';

type MealScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Meal'
>;
type MealScreenRouteProp = RouteProp<MainStackParamList, 'Meal'>;

const MealScreen: React.FC = observer(() => {
  const navigation = useNavigation<MealScreenNavigationProp>();
  const route = useRoute<MealScreenRouteProp>();
  const { mealStore, uiStore, profileStore, mealTemplateStore, friendsStore } = useStores();
  const { alertState, showConfirm, hideAlert } = useAlert();
  const { colors, isDark } = useTheme();

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
    if (!elements.length) {
      const targetUserId = friendsStore.selectedFriend?.friendId;
      mealStore.loadMealElements(meal.id, targetUserId);
    }
  }, [elements.length, mealStore, meal.id, friendsStore.selectedFriend]);

  useEffect(() => {
    if (showCopyDialog) {
      loadMealsForSelectedDate();
    }
  }, [showCopyDialog]);

  const loadMealsForSelectedDate = async () => {
    try {
      const originalDate = mealStore.selectedDate;
      await mealStore.loadMealsForDate(originalDate);
      const mealsList = mealStore.mealsForSelectedDate;
      setTodayMeals(mealsList);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const handleAddElement = () => {
    haptics.light();
    const targetUserId = friendsStore.selectedFriend?.friendId;
    navigation.navigate('Search', {
      mealId: meal.id,
      targetUserId: targetUserId,
    });
  };

  const handleElementPress = useCallback(
    (element: any) => {
      haptics.light();
      navigation.navigate('MealElement', {
        item: element,
        mealId: meal.id,
      });
    },
    [navigation, meal.id]
  );

  const handleDeleteElement = useCallback(
    async (elementId: number) => {
      haptics.medium();
      showConfirm(
        'Удаление блюда',
        'Вы уверены, что хотите удалить это блюдо из приема пищи?',
        async () => {
          try {
            await mealStore.deleteMealElement(elementId);
            haptics.success();
          } catch {
            haptics.error();
            uiStore.showSnackbar('Не удалось удалить блюдо', 'error');
          }
        }
      );
    },
    [showConfirm, mealStore, uiStore]
  );

  const handleDeleteMeal = async () => {
    haptics.medium();
    showConfirm(
      'Удаление приема пищи',
      'Вы уверены, что хотите удалить весь прием пищи?',
      async () => {
        try {
          await mealStore.deleteMeal(meal.id);
          haptics.success();
          navigation.goBack();
        } catch {
          haptics.error();
          uiStore.showSnackbar('Не удалось удалить прием пищи', 'error');
        }
      }
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditMealType = () => {
    haptics.light();
    setShowEditDialog(true);
  };

  const handleCopyMeal = () => {
    haptics.light();
    setShowCopyDialog(true);
  };

  const handleSaveAsTemplate = () => {
    haptics.light();
    if (elements.length === 0) {
      haptics.warning();
      uiStore.showSnackbar('Нет блюд для сохранения в шаблон', 'error');
      return;
    }
    setShowTemplateNameDialog(true);
  };

  const handleTemplateNameConfirm = async (templateName: string) => {
    try {
      const template = await mealTemplateStore.createTemplate({
        mealId: meal.id,
      });
      await mealTemplateStore.updateTemplate(template.id, {
        name: templateName,
      });
      haptics.success();
      uiStore.showSnackbar('Прием пищи сохранен как шаблон', 'success');
      setShowTemplateNameDialog(false);
    } catch (error) {
      haptics.error();
      uiStore.showSnackbar(
        mealTemplateStore.error || 'Не удалось сохранить шаблон',
        'error'
      );
    }
  };

  const getDefaultTemplateName = () => {
    return `${formatMealType(meal.mealType)} от ${formatDate(meal.dateTime, 'dd.MM.yyyy')}`;
  };

  const copyMealElements = async (
    targetMealId: number,
    showSuccessMessage: boolean = true
  ) => {
    if (elements.length === 0) {
      haptics.warning();
      uiStore.showSnackbar('Нет блюд для копирования', 'error');
      return;
    }

    try {
      const targetUserId = friendsStore.selectedFriend?.friendId;
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
        }, targetUserId);
      }
      await mealStore.loadMealElements(targetMealId, targetUserId);
      if (showSuccessMessage) {
        haptics.success();
        uiStore.showSnackbar('Прием пищи скопирован', 'success');
      }
      setShowCopyDialog(false);
    } catch (error) {
      haptics.error();
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
    haptics.light();
    setShowCopyDialog(false);
    setShowCopyDateTimeDialog(true);
  };

  const handleCopyDateTimeConfirm = async (dateTime: Date) => {
    setIsCopying(true);
    setShowCopyDateTimeDialog(false);

    try {
      const mealDateTime = new Date(meal.dateTime);
      dateTime.setHours(
        mealDateTime.getHours(),
        mealDateTime.getMinutes(),
        0,
        0
      );

      const newMeal = await mealStore.createMeal({
        mealType: meal.mealType,
        dateTime: dateTime.toISOString(),
        name: meal.name,
      });

      await copyMealElements(newMeal.id, false);

      const mealDate = new Date(dateTime);
      mealDate.setHours(0, 0, 0, 0);
      const originalDate = mealStore.selectedDate;
      await mealStore.loadMealsForDate(mealDate);

      if (mealDate.getTime() !== originalDate.getTime()) {
        mealStore.setSelectedDate(originalDate);
        await mealStore.loadMealsForDate(originalDate);
      }

      haptics.success();
      uiStore.showSnackbar('Прием пищи создан и скопирован', 'success');
      navigation.navigate('Meal', { meal: newMeal });
    } catch (error) {
      haptics.error();
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
      if (!hasTypeChanged) {
        return;
      }

      try {
        await mealStore.updateMeal(meal.id, {
          mealType: newType,
          dateTime: meal.dateTime,
          name: meal.name,
        } as any);
        haptics.success();
        uiStore.showSnackbar('Тип приема пищи изменен', 'success');
        await mealStore.loadMealsForDate(mealStore.selectedDate);
      } catch (error) {
        haptics.error();
        uiStore.showSnackbar('Не удалось изменить прием пищи', 'error');
      }
      return;
    }

    const hasTimeChanged =
      newDateTime.getHours() !== mealDate.getHours() ||
      newDateTime.getMinutes() !== mealDate.getMinutes();

    if (!hasTypeChanged && !hasTimeChanged) {
      return;
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

      haptics.success();
      uiStore.showSnackbar(message, 'success');
      await mealStore.loadMealsForDate(mealStore.selectedDate);
    } catch (error) {
      haptics.error();
      uiStore.showSnackbar('Не удалось изменить прием пищи', 'error');
    }
  };

  const renderElement = useCallback(
    ({ item }: { item: any }) => {
      return (
        <MealElementItem
          element={item}
          onPress={handleElementPress}
          onDelete={handleDeleteElement}
        />
      );
    },
    [handleElementPress, handleDeleteElement]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={64} color={colors.text.secondary} />
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Нет блюд</Text>
      <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
        Добавьте блюда в этот прием пищи
      </Text>
    </View>
  );

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
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <Header
        title={formatMealType(meal.mealType)}
        subtitle={
          <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
            {formatTimeInTimezone(meal.dateTime, userTimezone)}
          </Text>
        }
        showBackButton
        onBackPress={handleBack}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleEditMealType}
              style={styles.editButton}
            >
              <Ionicons name="create-outline" size={20} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowActionsMenu(true)}
              style={styles.menuButton}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={24}
                color={colors.text.primary}
              />
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.content}>
        <FlashList
          data={elements}
          renderItem={renderElement}
          estimatedItemSize={80}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <>
              <View style={[styles.summary, {
                backgroundColor: colors.background.paper,
                borderColor: colors.border.light
              }]}>
                <CompactSummary
                  calories={totalCalories}
                  proteins={totalProteins}
                  fats={totalFats}
                  carbohydrates={totalCarbohydrates}
                  variant="large"
                />
              </View>

              <View style={styles.elementsTitleContainer}>
                <Text style={[styles.elementsTitle, { color: colors.text.primary }]}>Блюда</Text>
              </View>
            </>
          }
          ListEmptyComponent={renderEmptyState()}
          ListFooterComponent={<View style={styles.footerSpacing} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        />
      </View>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, shadows.lg]}
          onPress={handleAddElement}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isDark ? [colors.primary, colors.primaryDark] : [colors.primary, colors.primaryDark]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={32} color={isDark ? colors.black : colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <MealTypeEditDialog
        visible={showEditDialog}
        currentType={meal.mealType}
        currentDateTime={new Date(meal.dateTime)}
        onSelect={handleMealTypeSelect}
        onCancel={() => setShowEditDialog(false)}
      />

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

      <DateTimePickerDialog
        visible={showCopyDateTimeDialog}
        defaultDate={(() => {
          const selectedDate = new Date(mealStore.selectedDate);
          const mealDateTime = new Date(meal.dateTime);
          selectedDate.setHours(
            mealDateTime.getHours(),
            mealDateTime.getMinutes(),
            0,
            0
          );
          return selectedDate;
        })()}
        defaultTime={(() => {
          const mealDateTime = new Date(meal.dateTime);
          return mealDateTime;
        })()}
        onConfirm={handleCopyDateTimeConfirm}
        onCancel={() => setShowCopyDateTimeDialog(false)}
      />

      <MealActionsMenu
        visible={showActionsMenu}
        onClose={() => setShowActionsMenu(false)}
        onSaveAsTemplate={handleSaveAsTemplate}
        onCopy={handleCopyMeal}
        onDelete={handleDeleteMeal}
      />

      <TemplateNameDialog
        visible={showTemplateNameDialog}
        defaultName={getDefaultTemplateName()}
        onConfirm={handleTemplateNameConfirm}
        onCancel={() => setShowTemplateNameDialog(false)}
      />

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
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerSubtitle: {
    ...typography.body2,
    fontSize: 12,
  },
  editButton: {
    padding: spacing.xs,
  },
  menuButton: {
    padding: spacing.xs,
  },
  summary: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  elementsTitleContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  elementsTitle: {
    ...typography.h5,
    marginBottom: spacing.md,
  },
  footerSpacing: {
    height: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    ...typography.h4,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body1,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MealScreen;
