import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { runOnJS } from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  Directions,
} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation.types';
import { useStores } from '../../stores';
import {
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import Header from '../../components/common/Header';
import Loading from '../../components/common/Loading';
import CalendarModal from '../../components/common/CalendarModal';
import MealTemplateSelectorDialog from '../../components/common/MealTemplateSelectorDialog';
import DailySummary from '../../components/main/DailySummary';
import MealCard from '../../components/main/MealCard';
import DateStrip from '../../components/main/DateStrip';
import FAB from '../../components/common/FAB';
import FriendSelector from '../../components/friends/FriendSelector';
import AlertDialog from '../../components/common/AlertDialog';
import DailyAnalysisBlock from '../../components/main/DailyAnalysisBlock';
import { useTheme } from '../../hooks/useTheme';
import { aiService } from '../../api/services/ai.service';
import { buildDailyAnalysisPrompt } from '../../utils/promptBuilders';

type MainScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'HomeTabs'
>;

const MainScreen: React.FC = observer(() => {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const { mealStore, profileStore, mealTemplateStore, uiStore, friendsStore } = useStores();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisUpdatedAt, setAnalysisUpdatedAt] = useState<string | null>(null);
  const [showPermissionError, setShowPermissionError] = useState(false);

  const userTimezone = profileStore.profile?.timezone || 'UTC';
  const targetUserId = friendsStore.selectedFriend?.friendId;
  
  // Track last load time and parameters for deduplication
  const lastLoadTimeRef = useRef<number>(0);
  const lastLoadParamsRef = useRef<{ date: string; targetUserId?: number } | null>(null);
  const MIN_LOAD_INTERVAL_MS = 1000; // Minimum 1 second between loads

  // Load friends on mount
  React.useEffect(() => {
    friendsStore.loadFriends();
  }, []);

  const loadData = React.useCallback(async () => {
    try {
      await mealStore.loadMealsForDate(mealStore.selectedDate, targetUserId);

      // Load calories for the date strip range (7 days back, 7 days forward)
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 7);

      await mealStore.loadCaloriesForRange(startDate, endDate, targetUserId);
      
      // Update last load tracking
      lastLoadTimeRef.current = Date.now();
      lastLoadParamsRef.current = {
        date: mealStore.selectedDate.toISOString(),
        targetUserId,
      };
    } catch (error: any) {
      console.error('Error loading meals:', error);
      // Handle 403 Forbidden error
      if (error.response?.status === 403) {
        setShowPermissionError(true);
        friendsStore.selectFriend(null);
      }
    }
  }, [targetUserId, mealStore.selectedDate]);

  // Combined effect for initial load and when date/friend changes
  useEffect(() => {
    const currentParams = {
      date: mealStore.selectedDate.toISOString(),
      targetUserId,
    };
    
    // Check if we need to reload
    const needsReload = 
      !lastLoadParamsRef.current ||
      lastLoadParamsRef.current.date !== currentParams.date ||
      lastLoadParamsRef.current.targetUserId !== currentParams.targetUserId;
    
    if (needsReload) {
      loadData();
    }
  }, [mealStore.selectedDate, targetUserId, loadData]);

  useEffect(() => {
    // Сбрасываем предыдущий результат при смене даты
    setAnalysisText(null);
    setAnalysisError(null);
    setAnalysisUpdatedAt(null);
  }, [mealStore.selectedDate]);

  // Перезагружаем данные при возврате на экран (например, после удаления meal)
  useFocusEffect(
    React.useCallback(() => {
      const now = Date.now();
      const timeSinceLastLoad = now - lastLoadTimeRef.current;
      const currentParams = {
        date: mealStore.selectedDate.toISOString(),
        targetUserId,
      };
      
      // Only reload if enough time has passed or parameters changed
      const shouldReload = 
        timeSinceLastLoad > MIN_LOAD_INTERVAL_MS ||
        !lastLoadParamsRef.current ||
        lastLoadParamsRef.current.date !== currentParams.date ||
        lastLoadParamsRef.current.targetUserId !== currentParams.targetUserId;
      
      if (shouldReload) {
        loadData();
      }
    }, [loadData, mealStore.selectedDate, targetUserId])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddMeal = () => {
    navigation.navigate('Search', {
      date: mealStore.selectedDate.toISOString().split('T')[0],
      targetUserId: targetUserId,
    });
  };

  const handleOpenAnalytics = () => {
    navigation.navigate('HomeTabs', {
      screen: 'Analytics',
      params: { period: 'day' },
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

  const dateLabel = useMemo(
    () =>
      mealStore.selectedDate.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    [mealStore.selectedDate]
  );

  const mealsForPrompt = useMemo(() => {
    return mealStore.mealsForSelectedDate
      .map((meal) => {
        const elements = mealStore.mealElements[meal.id] || [];
        const time = new Date(meal.dateTime);
        return {
          mealType: meal.name || meal.mealType,
          time: time.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          order: time.getTime(),
          items: elements.map((element) => ({
            name: element.name,
            quantity: element.quantity,
            calories: Math.round(element.calories * 100) / 100,
            proteins: Math.round(element.proteins * 100) / 100,
            fats: Math.round(element.fats * 100) / 100,
            carbohydrates: Math.round(element.carbohydrates * 100) / 100,
          })),
        };
      })
      .sort((a, b) => a.order - b.order)
      .map(({ order, ...rest }) => rest);
  }, [mealStore.mealsForSelectedDate, mealStore.mealElements]);

  const createDailyPrompt = () =>
    buildDailyAnalysisPrompt({
      dateLabel,
      timezone: userTimezone,
      caloriesLimit: profileStore.profile?.dayLimitCal,
      recommendedCalories: profileStore.recommendedCalories,
      totals: mealStore.dailyNutrients,
      meals: mealsForPrompt,
    });

  const handleAnalyzeDay = async () => {
    // Если идет загрузка, ничего не делаем
    if (analysisLoading) {
      return;
    }

    // Запускаем новый анализ
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisUpdatedAt(null);
    setAnalysisText('');

    const prompt = createDailyPrompt();

    try {
      const content = await aiService.getDailyAnalysis({
        prompt,
        language: 'ru',
      });

      setAnalysisText(content);
      setAnalysisUpdatedAt(
        new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setAnalysisLoading(false);
    } catch (error: any) {
      setAnalysisLoading(false);
      setAnalysisError(
        error?.message || 'Не удалось выполнить анализ. Попробуйте позже.'
      );
    }
  };

  const handleInfoPress = () => {
    uiStore.showSnackbar(
      'Краткий анализ КБЖУ и совместимости продуктов за день',
      'info'
    );
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
          {/* Friend Selector */}
          <View style={styles.friendSelectorContainer}>
            <FriendSelector
              friends={friendsStore.friends}
              selectedFriend={friendsStore.selectedFriend}
              onSelectFriend={(friend) => friendsStore.selectFriend(friend)}
            />
          </View>

          {/* Date Strip */}
          <DateStrip
            selectedDate={mealStore.selectedDate}
            onDateSelect={handleDateSelect}
            caloriesData={mealStore.caloriesByDate}
          />

          {/* Daily Summary */}
          <TouchableOpacity activeOpacity={0.85} onPress={handleOpenAnalytics}>
            <DailySummary
              calories={mealStore.dailyCalories}
              proteins={mealStore.dailyProteins}
              fats={mealStore.dailyFats}
              carbohydrates={mealStore.dailyCarbohydrates}
              caloriesLimit={profileStore.profile?.dayLimitCal || 2000}
              onAnalyzePress={handleAnalyzeDay}
              onInfoPress={handleInfoPress}
              analysisLoading={analysisLoading}
            />
          </TouchableOpacity>

          <AlertDialog
            visible={showPermissionError}
            title="Нет доступа"
            message="У вас нет прав для просмотра данных этого друга. Вернитесь к просмотру своих данных или запросите права доступа."
            type="error"
            confirmText="ОК"
            onConfirm={() => setShowPermissionError(false)}
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

          {/* Daily Analysis Block */}
          <DailyAnalysisBlock
            analysisText={analysisText}
            analysisError={analysisError}
            analysisLoading={analysisLoading}
            analysisUpdatedAt={analysisUpdatedAt}
            onRetry={handleAnalyzeDay}
          />
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  aiButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  calendarButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  friendSelectorContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    alignItems: 'flex-start',
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
  analysisBox: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  analysisHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  analysisTitle: {
    ...typography.h5,
    fontWeight: '700',
  },
  analysisTimestamp: {
    ...typography.caption,
    fontSize: 11,
  },
  analysisLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  analysisErrorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  analysisContent: {
    marginTop: spacing.xs,
  },
  analysisParagraph: {
    marginBottom: spacing.sm,
  },
  analysisHeading: {
    ...typography.h5,
    fontWeight: '600',
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  analysisSubheading: {
    ...typography.body2,
    fontWeight: '500',
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
    lineHeight: 20,
  },
  analysisText: {
    ...typography.body2,
    lineHeight: 22,
  },
});

export default MainScreen;
