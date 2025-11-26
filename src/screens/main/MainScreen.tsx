import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { runOnJS } from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  Directions,
} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation.types';
import { useStores } from '../../stores';
import {
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import { formatDate } from '../../utils/formatting';
import Header from '../../components/common/Header';
import Loading from '../../components/common/Loading';
import CalendarModal from '../../components/common/CalendarModal';
import MealTemplateSelectorDialog from '../../components/common/MealTemplateSelectorDialog';
import DailySummary from '../../components/main/DailySummary';
import MealCard from '../../components/main/MealCard';
import DateStrip from '../../components/main/DateStrip';
import FAB from '../../components/common/FAB';
import { useTheme } from '../../hooks/useTheme';

type MainScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'HomeTabs'
>;

const MainScreen: React.FC = observer(() => {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const { mealStore, profileStore, mealTemplateStore, uiStore } = useStores();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  const userTimezone = profileStore.profile?.timezone || 'UTC';

  const loadData = React.useCallback(async () => {
    try {
      await mealStore.loadMealsForDate(mealStore.selectedDate);

      // Load calories for the date strip range (7 days back, 7 days forward)
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 7);

      await mealStore.loadCaloriesForRange(startDate, endDate);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  }, [mealStore]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddMeal = () => {
    navigation.navigate('Search', {
      date: mealStore.selectedDate.toISOString().split('T')[0],
    });
  };

  const handleAddFromTemplate = () => {
    setShowTemplateDialog(true);
  };

  const handleTemplateSelect = async (templateId: number) => {
    try {
      const now = new Date();
      const selectedDate = new Date(mealStore.selectedDate);
      // Set time to current time, but keep the selected date
      selectedDate.setHours(now.getHours(), now.getMinutes(), 0, 0);

      const meal = await mealTemplateStore.useTemplate(
        templateId,
        selectedDate.toISOString()
      );

      // Reload meals for the selected date
      await mealStore.loadMealsForDate(mealStore.selectedDate);

      uiStore.showSnackbar('Прием пищи создан из шаблона', 'success');

      // Navigate to the created meal
      navigation.navigate('Meal', { meal });
    } catch (error) {
      uiStore.showSnackbar(
        mealTemplateStore.error || 'Не удалось создать прием пищи из шаблона',
        'error'
      );
    }
  };

  const handleMealPress = (meal: any) => {
    navigation.navigate('Meal', { meal });
  };

  const handleDateSelect = (date: Date) => {
    mealStore.setSelectedDate(date);
    loadData();
  };

  const handleCalendarPress = () => {
    setShowDatePicker(true);
  };

  const onSwipeLeft = () => {
    const nextDate = new Date(mealStore.selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    handleDateSelect(nextDate);
  };

  const onSwipeRight = () => {
    const prevDate = new Date(mealStore.selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    handleDateSelect(prevDate);
  };

  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      runOnJS(onSwipeLeft)();
    });

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      runOnJS(onSwipeRight)();
    });

  const composedGestures = Gesture.Simultaneous(flingLeft, flingRight);

  const renderEmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: colors.background.paper, borderColor: colors.border.light }]}>
      <Ionicons name="restaurant-outline" size={64} color={colors.text.secondary} />
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Нет приемов пищи</Text>
      <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
        Добавьте свой первый прием пищи, чтобы начать отслеживание
      </Text>
    </View>
  );

  if (mealStore.loading && !refreshing) {
    return <Loading message="Загрузка приемов пищи..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background.default} />

      <Header
        title="Расписание"
        titleStyle={[styles.headerTitle, { color: colors.text.primary }]}
        rightComponent={
          <TouchableOpacity
            onPress={handleCalendarPress}
            style={[styles.calendarButton, { backgroundColor: colors.background.light, borderColor: colors.border.light }]}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        }
      />

      <CalendarModal
        visible={showDatePicker}
        selectedDate={mealStore.selectedDate}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={(date) => {
          mealStore.setSelectedDate(date);
          loadData();
        }}
        maximumDate={new Date()}
      />

      <GestureDetector gesture={composedGestures}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Date Strip */}
          <DateStrip
            selectedDate={mealStore.selectedDate}
            onDateSelect={handleDateSelect}
            caloriesData={mealStore.caloriesByDate}
          />

          {/* Daily Summary */}
          <DailySummary
            calories={mealStore.dailyCalories}
            proteins={mealStore.dailyProteins}
            fats={mealStore.dailyFats}
            carbohydrates={mealStore.dailyCarbohydrates}
            caloriesLimit={profileStore.profile?.dayLimitCal || 2000}
          />

          {/* Meals List */}
          <View style={styles.mealsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.mealsTitle, { color: colors.text.primary }]}>Приемы пищи</Text>
              <Text style={[styles.mealsCount, { color: colors.text.inverse, backgroundColor: colors.primary }]}>
                {mealStore.mealsForSelectedDate.length}
              </Text>
            </View>

            {mealStore.mealsForSelectedDate.length === 0 ? (
              renderEmptyState()
            ) : (
              mealStore.mealsForSelectedDate.map((meal) => {
                const elements = mealStore.mealElements[meal.id] || [];
                const totalCalories = elements.reduce((sum, el) => sum + el.calories, 0);
                const totalProteins = elements.reduce((sum, el) => sum + el.proteins, 0);
                const totalFats = elements.reduce((sum, el) => sum + el.fats, 0);
                const totalCarbohydrates = elements.reduce((sum, el) => sum + el.carbohydrates, 0);

                return (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onPress={handleMealPress}
                    userTimezone={userTimezone}
                    totalCalories={totalCalories}
                    totalProteins={totalProteins}
                    totalFats={totalFats}
                    totalCarbohydrates={totalCarbohydrates}
                  />
                );
              })
            )}
          </View>
        </ScrollView>
      </GestureDetector>

      {/* FAB */}
      <FAB
        onAddMeal={handleAddMeal}
        onAddFromTemplate={handleAddFromTemplate}
      />

      {/* Template Selector Dialog */}
      <MealTemplateSelectorDialog
        visible={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        onTemplateSelect={handleTemplateSelect}
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
    paddingBottom: 120, // Space for FAB
  },
  headerTitle: {
    ...typography.h4,
    fontWeight: 'bold',
  },
  calendarButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  calendarIcon: {
    fontSize: 20,
  },
  mealsContainer: {
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  mealsTitle: {
    ...typography.h5,
    fontWeight: '600',
  },
  mealsCount: {
    ...typography.caption,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    ...typography.h5,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body2,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 20,
  },
});

export default MainScreen;
