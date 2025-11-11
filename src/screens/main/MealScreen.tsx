import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation.types';
import { useStores } from '../../stores';
import { colors, typography, spacing, borderRadius } from '../../theme';
import {
  formatTime,
  formatTimeInTimezone,
  formatMealType,
  formatCalories,
  formatWeight,
} from '../../utils/formatting';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import NutrientRow from '../../components/common/NutrientRow';
import CompactSummary from '../../components/common/CompactSummary';
import MealTypeEditDialog from '../../components/common/MealTypeEditDialog';

type MealScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Meal'
>;
type MealScreenRouteProp = RouteProp<MainStackParamList, 'Meal'>;

const MealScreen: React.FC = observer(() => {
  const navigation = useNavigation<MealScreenNavigationProp>();
  const route = useRoute<MealScreenRouteProp>();
  const { mealStore, uiStore, profileStore } = useStores();

  const meal = route.params.meal;
  const elements = mealStore.mealElements[meal.id] || [];
  const userTimezone = profileStore.profile?.timezone || 'UTC';
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    // Load meal elements if not already loaded
    if (!elements.length) {
      mealStore.loadMealElements(meal.id);
    }
  }, [elements.length, mealStore, meal.id]);

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
    Alert.alert(
      'Удаление блюда',
      'Вы уверены, что хотите удалить это блюдо из приема пищи?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await mealStore.deleteMealElement(elementId);
            } catch {
              uiStore.showSnackbar('Не удалось удалить блюдо', 'error');
            }
          },
        },
      ]
    );
  };

  const handleDeleteMeal = async () => {
    Alert.alert(
      'Удаление приема пищи',
      'Вы уверены, что хотите удалить весь прием пищи?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await mealStore.deleteMeal(meal.id);
              navigation.goBack();
            } catch {
              uiStore.showSnackbar('Не удалось удалить прием пищи', 'error');
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditMealType = () => {
    setShowEditDialog(true);
  };

  const handleMealTypeSelect = async (newType: string) => {
    setShowEditDialog(false);
    
    if (newType === meal.mealType) {
      return; // No change
    }

    try {
      await mealStore.updateMeal(meal.id, {
        mealType: newType,
        dateTime: meal.dateTime,
        name: meal.name,
      } as any);
      uiStore.showSnackbar('Тип приема пищи изменен', 'success');
      // Reload meal data
      await mealStore.loadMealsForDate(mealStore.selectedDate);
    } catch (error) {
      uiStore.showSnackbar('Не удалось изменить тип', 'error');
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

  if (mealStore.loading) {
    return <Loading message="Загрузка приема пищи..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title={`${formatMealType(meal.mealType)} • ${formatTimeInTimezone(meal.dateTime, userTimezone)}`}
        showBackButton
        onBackPress={handleBack}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEditMealType} style={styles.editButton}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteMeal}>
              <Text style={styles.deleteIcon}>🗑️</Text>
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
        onSelect={handleMealTypeSelect}
        onCancel={() => setShowEditDialog(false)}
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
  editButton: {
    padding: spacing.xs,
  },
  editIcon: {
    fontSize: 20,
  },
  deleteIcon: {
    fontSize: 22,
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
