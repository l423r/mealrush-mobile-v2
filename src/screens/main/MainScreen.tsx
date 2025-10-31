import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation.types';
import { useStores } from '../../stores';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import { formatDate, formatTime, formatMealType } from '../../utils/formatting';
import { calculateProgressPercentage } from '../../utils/calculations';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import CalendarModal from '../../components/common/CalendarModal';

type MainScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'HomeTabs'
>;

const MainScreen: React.FC = observer(() => {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const { mealStore, profileStore } = useStores();
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadData = React.useCallback(async () => {
    try {
      await mealStore.loadMealsForDate(mealStore.selectedDate);
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

  const handleMealPress = (meal: any) => {
    navigation.navigate('Meal', { meal });
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(mealStore.selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    mealStore.setSelectedDate(newDate);
    loadData();
  };

  const handleCalendarPress = () => {
    setShowDatePicker(true);
  };

  const renderMealCard = ({ item: meal }: { item: any }) => {
    const elements = mealStore.mealElements[meal.id] || [];
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

    return (
      <TouchableOpacity
        style={styles.mealCard}
        onPress={() => handleMealPress(meal)}
      >
        <View style={styles.mealHeader}>
          <Text style={styles.mealType}>{formatMealType(meal.mealType)}</Text>
          <Text style={styles.mealTime}>{formatTime(meal.dateTime)}</Text>
        </View>

        <View style={styles.mealContent}>
          <Text style={styles.mealCalories}>
            {Math.round(totalCalories)} ккал
          </Text>
          <Text style={styles.mealMacros}>
            Б: {Math.round(totalProteins)}г • Ж: {Math.round(totalFats)}г • У:{' '}
            {Math.round(totalCarbohydrates)}г
          </Text>
        </View>

        <Text style={styles.mealArrow}>›</Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🍽️</Text>
      <Text style={styles.emptyTitle}>Нет приемов пищи</Text>
      <Text style={styles.emptySubtitle}>
        Добавьте свой первый прием пищи, чтобы начать отслеживание
      </Text>
    </View>
  );

  if (mealStore.loading && !refreshing) {
    return <Loading message="Загрузка приемов пищи..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Расписание питания"
        rightComponent={
          <TouchableOpacity onPress={handleCalendarPress}>
            <Text style={styles.calendarIcon}>📅</Text>
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

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Date Selector */}
        <View style={styles.dateSelector}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => handleDateChange('prev')}
          >
            <Text style={styles.dateButtonText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.dateInfo}>
            <Text style={styles.dateText}>
              {formatDate(mealStore.selectedDate, 'dd MMMM yyyy')}
            </Text>
            <Text style={styles.dayText}>
              {formatDate(mealStore.selectedDate, 'EEEE')}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => handleDateChange('next')}
          >
            <Text style={styles.dateButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Дневная статистика</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(mealStore.dailyCalories)}
              </Text>
              <Text style={styles.statLabel}>ккал</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${calculateProgressPercentage(
                        mealStore.dailyCalories,
                        profileStore.profile?.dayLimitCal || 2000
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(mealStore.dailyProteins)}
              </Text>
              <Text style={styles.statLabel}>белки</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(mealStore.dailyFats)}
              </Text>
              <Text style={styles.statLabel}>жиры</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(mealStore.dailyCarbohydrates)}
              </Text>
              <Text style={styles.statLabel}>углеводы</Text>
            </View>
          </View>
        </View>

        {/* Meals List */}
        <View style={styles.mealsContainer}>
          <Text style={styles.mealsTitle}>Приемы пищи</Text>

          {mealStore.mealsForSelectedDate.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={mealStore.mealsForSelectedDate}
              renderItem={renderMealCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <Button
          title="+ Добавить прием пищи"
          onPress={handleAddMeal}
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
  calendarIcon: {
    fontSize: 24,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 0,
  },
  dateButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  dateButtonText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: 'bold',
  },
  dateInfo: {
    alignItems: 'center',
  },
  dateText: {
    ...typography.h5,
    color: colors.text.primary,
    fontWeight: '600',
  },
  dayText: {
    ...typography.body2,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  statsContainer: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    borderWidth: 0,
    ...shadows.lg,
  },
  statsTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  progressBar: {
    width: 60,
    height: 6,
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  mealsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100, // Space for add button
  },
  mealsTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  mealCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md,
  },
  mealHeader: {
    flex: 1,
  },
  mealType: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  mealTime: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  mealContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  mealCalories: {
    ...typography.h5,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  mealMacros: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  mealArrow: {
    ...typography.h3,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
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
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 0,
    ...shadows.xl,
  },
  addButton: {
    width: '100%',
  },
});

export default MainScreen;
