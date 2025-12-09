import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import Header from '../../components/common/Header';
import Loading from '../../components/common/Loading';
import CalendarModal from '../../components/common/CalendarModal';
import MealTemplateSelectorDialog from '../../components/common/MealTemplateSelectorDialog';
import DailySummary from '../../components/main/DailySummary';
import MealCard from '../../components/main/MealCard';
import DateStrip from '../../components/main/DateStrip';
import FAB from '../../components/common/FAB';
import { useTheme } from '../../hooks/useTheme';
import { aiService, DailyAnalysisStreamController } from '../../api/services/ai.service';
import { buildDailyAnalysisPrompt } from '../../utils/promptBuilders';

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
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisUpdatedAt, setAnalysisUpdatedAt] = useState<string | null>(null);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);
  const streamControllerRef = useRef<DailyAnalysisStreamController | null>(null);

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

  useEffect(() => {
    // Сбрасываем предыдущий результат при смене даты
    setAnalysisText(null);
    setAnalysisError(null);
    setAnalysisUpdatedAt(null);
    setIsAnalysisExpanded(true); // Разворачиваем анализ при смене даты
    streamControllerRef.current?.cancel();
  }, [mealStore.selectedDate]);

  useEffect(() => {
    return () => {
      streamControllerRef.current?.cancel();
    };
  }, []);

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
    if (analysisLoading) {
      return;
    }

    streamControllerRef.current?.cancel();
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisUpdatedAt(null);
    setAnalysisText('');

    const prompt = createDailyPrompt();

    try {
      streamControllerRef.current = await aiService.streamDailyAnalysis(
        { prompt, language: 'ru' },
        {
          onToken: (token) => {
            setAnalysisText((prev) => {
              const prevText = prev ?? '';
              if (!prevText) {
                // Обрезаем только пробелы в начале, сохраняем переносы строк
                return token.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
              }
              
              // Обрезаем только пробелы в начале и конце, сохраняем переносы строк
              const processedToken = token.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
              if (!processedToken) return prevText;
              
              // Проверяем, нужен ли пробел между предыдущим текстом и новым токеном
              const lastChar = prevText[prevText.length - 1];
              const firstChar = processedToken[0];
              
              // Если последний символ предыдущего текста и первый символ токена - буквы/цифры,
              // и между ними нет пробела или знака препинания, добавляем пробел
              const needsSpace = 
                lastChar && 
                firstChar && 
                /[\wа-яёА-ЯЁ0-9]/.test(lastChar) && 
                /[\wа-яёА-ЯЁ0-9]/.test(firstChar) &&
                lastChar !== ' ' &&
                firstChar !== ' ' &&
                lastChar !== '\n' &&
                firstChar !== '\n' &&
                !/[.,!?;:—–\-]/.test(lastChar);
              
              // Если последний символ - пробел, перенос строки или знак препинания, не добавляем пробел
              const hasSpaceBefore = lastChar === ' ' || lastChar === '\n' || /[.,!?;:—–\-]/.test(lastChar);
              
              return prevText + (needsSpace && !hasSpaceBefore ? ' ' : '') + processedToken;
            });
          },
          onDone: () => {
            setAnalysisLoading(false);
            setAnalysisUpdatedAt(new Date().toLocaleTimeString());
            streamControllerRef.current = null;
          },
          onError: (error) => {
            setAnalysisLoading(false);
            setAnalysisError(
              error.message ||
                'Не удалось выполнить анализ. Попробуйте позже.'
            );
            streamControllerRef.current = null;
          },
        }
      );
    } catch (error: any) {
      setAnalysisLoading(false);
      setAnalysisError(
        error?.message || 'Не удалось выполнить анализ. Попробуйте позже.'
      );
      streamControllerRef.current = null;
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
            />
          </TouchableOpacity>

          {/* Meals List */}
          <View style={styles.mealsContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Text style={[styles.mealsTitle, { color: colors.text.primary }]}>Приемы пищи</Text>
                <View style={styles.sectionActions}>
                  <TouchableOpacity
                    onPress={handleAnalyzeDay}
                    style={[styles.iconButton, { borderColor: colors.border.light, backgroundColor: colors.background.light }]}
                    disabled={analysisLoading}
                  >
                    {analysisLoading ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleInfoPress}
                    style={[styles.iconButton, { borderColor: colors.border.light, backgroundColor: colors.background.light }]}
                  >
                    <Ionicons name="information-circle-outline" size={18} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.mealsCount, { color: colors.text.inverse, backgroundColor: colors.primary }]}>
                {mealStore.mealsForSelectedDate.length}
              </Text>
            </View>

            {(analysisText || analysisError || analysisLoading) && (
              <View
                style={[
                  styles.analysisBox,
                  {
                    backgroundColor: colors.background.paper,
                    borderColor: analysisError ? colors.error : colors.border.light,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.analysisHeader}
                  onPress={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                  activeOpacity={0.7}
                >
                  <View style={styles.analysisHeaderLeft}>
                    <Text style={[styles.analysisTitle, { color: colors.text.primary }]}>
                      Анализ дня
                    </Text>
                    {analysisUpdatedAt && !analysisLoading ? (
                      <Text style={[styles.analysisTimestamp, { color: colors.text.secondary }]}>
                        {analysisUpdatedAt}
                      </Text>
                    ) : null}
                  </View>
                  {(analysisText || analysisError) && !analysisLoading && (
                    <Ionicons
                      name={isAnalysisExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.text.secondary}
                    />
                  )}
                </TouchableOpacity>

                {isAnalysisExpanded && (
                  <>
                    {analysisLoading ? (
                      <View style={styles.analysisLoadingContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={[styles.analysisText, { color: colors.text.secondary, marginLeft: spacing.sm }]}>
                          Выполняем анализ...
                        </Text>
                      </View>
                    ) : null}

                    {analysisError ? (
                      <View style={styles.analysisErrorContainer}>
                        <Ionicons name="alert-circle" size={20} color={colors.error} />
                        <Text style={[styles.analysisText, { color: colors.error, marginLeft: spacing.sm, flex: 1 }]}>
                          {analysisError}
                        </Text>
                      </View>
                    ) : null}

                    {analysisText ? (
                      <View style={styles.analysisContent}>
                        {analysisText.split('\n\n').map((paragraph, index) => {
                          // Определяем тип параграфа по началу
                          let trimmed = paragraph.trim();
                          if (!trimmed) return null;
                          
                          // Нормализуем пробелы: заменяем множественные пробелы на одинарные, но сохраняем переносы строк
                          // Заменяем множественные пробелы/табы на одинарный пробел, но не трогаем \n
                          trimmed = trimmed.replace(/[ \t]+/g, ' ').replace(/[ \t]*\n[ \t]*/g, '\n');
                          
                          // Проверяем, является ли параграф заголовком (начинается с цифры и точки или содержит ":" в конце первой строки)
                          const isHeading = /^\d+[\.\)]\s/.test(trimmed) || /^[А-ЯЁ][^:]*:\s*$/.test(trimmed.split('\n')[0]);
                          const isSubheading = /^[•\-\*]\s/.test(trimmed);
                          
                          return (
                            <View key={index} style={styles.analysisParagraph}>
                              {isHeading ? (
                                <Text style={[styles.analysisHeading, { color: colors.text.primary }]}>
                                  {trimmed}
                                </Text>
                              ) : isSubheading ? (
                                <Text style={[styles.analysisSubheading, { color: colors.text.primary }]}>
                                  {trimmed}
                                </Text>
                              ) : (
                                <Text style={[styles.analysisText, { color: colors.text.primary }]}>
                                  {trimmed}
                                </Text>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    ) : null}
                  </>
                )}
              </View>
            )}

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
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.round,
    borderWidth: 1,
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
