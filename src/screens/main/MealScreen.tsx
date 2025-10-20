import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation.types';
import { useStores } from '../../stores';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { formatTime, formatMealType } from '../../utils/formatting';
import { formatCalories, formatWeight } from '../../utils/formatting';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

type MealScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Meal'>;
type MealScreenRouteProp = RouteProp<MainStackParamList, 'Meal'>;

const MealScreen: React.FC = observer(() => {
  const navigation = useNavigation<MealScreenNavigationProp>();
  const route = useRoute<MealScreenRouteProp>();
  const { mealStore } = useStores();
  
  const meal = route.params.meal;
  const elements = mealStore.mealElements[meal.id] || [];

  useEffect(() => {
    // Load meal elements if not already loaded
    if (!elements.length) {
      mealStore.loadMealElements(meal.id);
    }
  }, [meal.id]);

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
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить блюдо');
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
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить прием пищи');
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderElement = ({ item: element }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.elementCard}
        onPress={() => handleElementPress(element)}
      >
        <View style={styles.elementInfo}>
          <Text style={styles.elementName} numberOfLines={2}>
            {element.name}
          </Text>
          <Text style={styles.elementQuantity}>
            {formatWeight(parseFloat(element.quantity))}
          </Text>
          <Text style={styles.elementMacros}>
            Б: {element.proteins}г • Ж: {element.fats}г • У: {element.carbohydrates}г
          </Text>
        </View>
        
        <View style={styles.elementRight}>
          <Text style={styles.elementCalories}>
            {formatCalories(element.calories)}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteElement(element.id)}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🍽️</Text>
      <Text style={styles.emptyTitle}>Нет блюд</Text>
      <Text style={styles.emptySubtitle}>
        Добавьте блюда в этот прием пищи
      </Text>
      <Button
        title="Добавить блюдо"
        onPress={handleAddElement}
        style={styles.emptyButton}
      />
    </View>
  );

  // Calculate totals
  const totalCalories = elements.reduce((sum, element) => sum + element.calories, 0);
  const totalProteins = elements.reduce((sum, element) => sum + element.proteins, 0);
  const totalFats = elements.reduce((sum, element) => sum + element.fats, 0);
  const totalCarbohydrates = elements.reduce((sum, element) => sum + element.carbohydrates, 0);

  if (mealStore.loading) {
    return <Loading message="Загрузка приема пищи..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title={formatMealType(meal.meal_type)}
        showBackButton
        onBackPress={handleBack}
        rightComponent={
          <TouchableOpacity onPress={handleDeleteMeal}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        }
      />
      
      <View style={styles.content}>
        {/* Meal Info */}
        <View style={styles.mealInfo}>
          <Text style={styles.mealTime}>{formatTime(meal.date_time)}</Text>
          {meal.name && (
            <Text style={styles.mealName}>{meal.name}</Text>
          )}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Итого</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{Math.round(totalCalories)}</Text>
              <Text style={styles.summaryLabel}>ккал</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{Math.round(totalProteins)}</Text>
              <Text style={styles.summaryLabel}>белки</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{Math.round(totalFats)}</Text>
              <Text style={styles.summaryLabel}>жиры</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{Math.round(totalCarbohydrates)}</Text>
              <Text style={styles.summaryLabel}>углеводы</Text>
            </View>
          </View>
        </View>

        {/* Elements List */}
        <View style={styles.elementsContainer}>
          <Text style={styles.elementsTitle}>Блюда</Text>
          
          {elements.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={elements}
              renderItem={renderElement}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </View>

      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <Button
          title="+ Добавить блюдо"
          onPress={handleAddElement}
          style={styles.addButton}
        />
      </View>
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
  deleteIcon: {
    fontSize: 24,
  },
  mealInfo: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    alignItems: 'center',
  },
  mealTime: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  mealName: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  summary: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  summaryTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  elementsContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: 100, // Space for add button
  },
  elementsTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  elementCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
  },
  elementInfo: {
    flex: 1,
  },
  elementName: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  elementQuantity: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  elementMacros: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  elementRight: {
    alignItems: 'flex-end',
  },
  elementCalories: {
    ...typography.h5,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  deleteButton: {
    padding: spacing.sm,
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