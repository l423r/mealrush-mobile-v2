import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation.types';
import type { Meal } from '../../types/api.types';
import { useStores } from '../../stores';
import { typography, spacing, borderRadius } from '../../theme';
import { formatDate, formatDateForAPI } from '../../utils/formatting';
import Header from '../../components/common/Header';
import Loading from '../../components/common/Loading';
import DateRangePicker from '../../components/main/DateRangePicker';
import CalendarModal from '../../components/common/CalendarModal';
import DateSummaryCard from '../../components/main/DateSummaryCard';
import MealCard from '../../components/main/MealCard';
import MealTrendsChart, { type MealTrendDataPoint } from '../../components/main/MealTrendsChart';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { haptics } from '../../utils/haptics';

type MealHistoryScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'MealHistory'
>;

interface DateGroup {
  date: Date;
  dateKey: string;
  meals: Meal[];
  totalCalories: number;
  totalProteins: number;
  totalFats: number;
  totalCarbohydrates: number;
}

const MealHistoryScreen: React.FC = observer(() => {
  const navigation = useNavigation<MealHistoryScreenNavigationProp>();
  const { mealStore, profileStore, friendsStore } = useStores();
  const { colors } = useTheme();
  const userTimezone = profileStore.profile?.timezone || 'UTC';

  // State
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6); // Last 7 days by default
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTrendMetric, setSelectedTrendMetric] = useState<'calories' | 'mealCount'>('calories');

  // Load meals and dates with meals for date range
  const loadMeals = useCallback(async () => {
    const targetUserId = friendsStore.selectedFriend?.friendId;
    // Load meals and dates with meals in parallel
    await Promise.all([
      mealStore.loadMealsForDateRange(startDate, endDate, targetUserId),
      mealStore.loadDatesWithMeals(startDate, endDate, targetUserId),
    ]);
  }, [startDate, endDate, mealStore, friendsStore.selectedFriend]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  // Group meals by date and calculate totals
  const dateGroups = useMemo<DateGroup[]>(() => {
    const mealsByDate = mealStore.getMealsGroupedByDate();
    const groups: DateGroup[] = [];

    // Generate all dates in range
    const currentDate = new Date(startDate);
    const datesInRange: string[] = [];
    while (currentDate <= endDate) {
      datesInRange.push(formatDateForAPI(new Date(currentDate)));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create groups for each date
    datesInRange.forEach((dateKey) => {
      const meals = mealsByDate[dateKey] || [];
      const date = new Date(dateKey + 'T00:00:00');

      // Calculate totals
      let totalCalories = 0;
      let totalProteins = 0;
      let totalFats = 0;
      let totalCarbohydrates = 0;

      meals.forEach((meal) => {
        const elements = mealStore.mealElements[meal.id] || [];
        elements.forEach((element) => {
          totalCalories += element.calories;
          totalProteins += element.proteins;
          totalFats += element.fats;
          totalCarbohydrates += element.carbohydrates;
        });
      });

      groups.push({
        date,
        dateKey,
        meals,
        totalCalories,
        totalProteins,
        totalFats,
        totalCarbohydrates,
      });
    });

    // Sort by date descending (newest first)
    return groups.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [mealStore.getMealsGroupedByDate(), mealStore.mealElements, startDate, endDate]);

  // Get dates with meals for calendar highlighting (from store cache)
  const datesWithMeals = useMemo(() => {
    return mealStore.getDatesWithMealsSet();
  }, [mealStore.datesWithMeals]);

  // Prepare trend data for chart
  const trendData = useMemo<MealTrendDataPoint[]>(() => {
    return dateGroups.map((group) => ({
      date: group.date,
      dateKey: group.dateKey,
      calories: group.totalCalories,
      mealCount: group.meals.length,
    }));
  }, [dateGroups]);

  const handleDateRangeConfirm = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setShowDateRangePicker(false);
  };

  const handleCalendarDateSelect = (date: Date) => {
    setSelectedCalendarDate(date);
    // Navigate to that date in the list
    const dateKey = formatDateForAPI(date);
    const groupIndex = dateGroups.findIndex((g) => g.dateKey === dateKey);
    if (groupIndex !== -1) {
      // Scroll to group (handled by FlashList keyExtractor)
      setShowCalendar(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMeals();
    setRefreshing(false);
  }, [loadMeals]);

  const handleMealPress = (meal: Meal) => {
    navigation.navigate('Meal', { meal });
  };

  const handleDateSummaryPress = (date: Date) => {
    setSelectedCalendarDate(date);
    setShowCalendar(true);
  };

  const renderDateGroup = ({ item: group }: { item: DateGroup }) => {
    return (
      <View style={styles.dateGroupContainer}>
        <DateSummaryCard
          date={group.date}
          meals={group.meals}
          totalCalories={group.totalCalories}
          totalProteins={group.totalProteins}
          totalFats={group.totalFats}
          totalCarbohydrates={group.totalCarbohydrates}
          onPress={() => handleDateSummaryPress(group.date)}
          testID={`date_summary_${group.dateKey}`}
        />

        {group.meals.length > 0 ? (
          <View style={styles.mealsContainer}>
            {group.meals.map((meal) => {
              const elements = mealStore.mealElements[meal.id] || [];
              const totalCalories = elements.reduce((sum, el) => sum + el.calories, 0);
              const totalProteins = elements.reduce((sum, el) => sum + el.proteins, 0);
              const totalFats = elements.reduce((sum, el) => sum + el.fats, 0);
              const totalCarbohydrates = elements.reduce(
                (sum, el) => sum + el.carbohydrates,
                0
              );

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
            })}
          </View>
        ) : (
          <View style={styles.emptyDateContainer}>
            <Text style={[styles.emptyDateText, { color: colors.text.secondary }]}>
              Нет приемов пищи за этот день
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={colors.text.disabled} />
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
        Нет приемов пищи
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
        Выберите другой диапазон дат или добавьте приемы пищи
      </Text>
    </View>
  );

  if (mealStore.loading && dateGroups.length === 0) {
    return <Loading message="Загрузка истории приемов пищи..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <Header
        title="История приемов пищи"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity
              testID="meal_history_calendar_button"
              accessibilityLabel="Открыть календарь"
              onPress={() => setShowCalendar(true)}
              style={styles.headerButton}
            >
              <Ionicons name="calendar-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              testID="meal_history_date_range_button"
              accessibilityLabel="Выбрать диапазон дат"
              onPress={() => setShowDateRangePicker(true)}
              style={styles.headerButton}
            >
              <Ionicons name="time-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      <FlashList
        data={dateGroups}
        renderItem={renderDateGroup}
        keyExtractor={(item) => item.dateKey}
        estimatedItemSize={200}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={
          trendData.length > 0 ? (
            <MealTrendsChart
              data={trendData}
              selectedMetric={selectedTrendMetric}
              onMetricChange={setSelectedTrendMetric}
              testID="meal_history_trends_chart"
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        // Lazy loading: load more when scrolling near the end
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          // Extend date range if needed (load older dates)
          if (dateGroups.length > 0) {
            const oldestDate = dateGroups[dateGroups.length - 1].date;
            const newStartDate = new Date(oldestDate);
            newStartDate.setDate(newStartDate.getDate() - 7); // Load 7 more days
            if (newStartDate >= startDate) {
              // Only extend if within reasonable range
              setStartDate(newStartDate);
            }
          }
        }}
        testID="meal_history_list"
      />

      {/* Date Range Picker */}
      <DateRangePicker
        visible={showDateRangePicker}
        startDate={startDate}
        endDate={endDate}
        onClose={() => setShowDateRangePicker(false)}
        onConfirm={handleDateRangeConfirm}
        maximumDate={new Date()}
      />

      {/* Calendar Modal */}
      <CalendarModal
        visible={showCalendar}
        selectedDate={selectedCalendarDate}
        onClose={() => setShowCalendar(false)}
        onDateSelect={handleCalendarDateSelect}
        maximumDate={new Date()}
        datesWithMeals={datesWithMeals}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  dateGroupContainer: {
    marginBottom: spacing.lg,
  },
  mealsContainer: {
    paddingHorizontal: spacing.sm,
  },
  emptyDateContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyDateText: {
    ...typography.body2,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body1,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default MealHistoryScreen;
