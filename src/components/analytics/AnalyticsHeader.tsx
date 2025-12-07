import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import type { AnalyticsPeriod, SummaryKpi } from '../../types/analytics.types';
import { spacing, typography, componentSpacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import type { lightColors, darkColors } from '../../theme/colors';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import CalendarModal from '../common/CalendarModal';
import { formatDateForAPI } from '../../utils/formatting';

type ColorsType = typeof lightColors | typeof darkColors;

interface AnalyticsHeaderProps {
  period: AnalyticsPeriod;
  onChangePeriod: (next: AnalyticsPeriod) => void;
  kpi: SummaryKpi | null;
  targetCalories?: number;
  collapsed?: boolean; // reduces vertical paddings when true
}

function getRangeDates(key: AnalyticsPeriod): { start: string, end: string } {
  const today = new Date();
  if (key === 'day') {
    const dateStr = format(today, 'd MMM', { locale: ru });
    return { start: dateStr, end: dateStr };
  }
  if (key === 'week') {
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
    return { start: format(start, 'd MMM', { locale: ru }), end: format(end, 'd MMM', { locale: ru }) };
  }
  if (key === 'month') {
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    return { start: format(start, 'd MMM', { locale: ru }), end: format(end, 'd MMM', { locale: ru }) };
  }
  // custom range
  try {
    const startDate = parseISO(key.from);
    const endDate = parseISO(key.to);
    return { start: format(startDate, 'd MMM', { locale: ru }), end: format(endDate, 'd MMM', { locale: ru }) };
  } catch {
    return { start: key.from, end: key.to };
  }
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = observer(({
  period,
  onChangePeriod,
  kpi,
  targetCalories,
  collapsed = false,
}) => {
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

  const containerStyle = useMemo(
    () => [dynamicStyles.container, collapsed && dynamicStyles.containerCollapsed],
    [collapsed, dynamicStyles]
  );

  // Calculate macro percentages
  const macroPercentages = useMemo(() => {
    if (!kpi?.averageDailyCalories || kpi.averageDailyCalories === 0) {
      return { protein: 0, fat: 0, carbs: 0, proteinKcal: 0, fatKcal: 0, carbsKcal: 0 };
    }
    const proteinKcal = (kpi.protein || 0) * 4;
    const fatKcal = (kpi.fat || 0) * 9;
    const carbsKcal = (kpi.carbs || 0) * 4;

    return {
      protein: Math.round((proteinKcal / kpi.averageDailyCalories) * 100),
      fat: Math.round((fatKcal / kpi.averageDailyCalories) * 100),
      carbs: Math.round((carbsKcal / kpi.averageDailyCalories) * 100),
      proteinKcal: Math.round(proteinKcal),
      fatKcal: Math.round(fatKcal),
      carbsKcal: Math.round(carbsKcal),
    };
  }, [kpi]);

  // Calculate progress percentage
  const { progressPercentage, isOverLimit } = useMemo(() => {
    if (!targetCalories || !kpi?.averageDailyCalories || targetCalories === 0) {
      return { progressPercentage: null, isOverLimit: false };
    }
    const raw = Math.round((kpi.averageDailyCalories / targetCalories) * 100);
    return {
      progressPercentage: raw,
      isOverLimit: raw > 100,
    };
  }, [kpi?.averageDailyCalories, targetCalories]);

  const handleCustomPeriodPress = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    setSelectingStart(true);
    setShowCalendar(true);
  };

  const handleDateSelect = (date: Date) => {
    console.log('[AnalyticsHeader] handleDateSelect:', date, 'selectingStart:', selectingStart);
    if (selectingStart) {
      setTempStartDate(date);
      setSelectingStart(false);
      // Keep calendar open for end date selection
    } else {
      if (tempStartDate && date < tempStartDate) {
        Alert.alert('Ошибка', 'Дата окончания должна быть позже даты начала');
        return;
      }
      setTempEndDate(date);
      const startStr = formatDateForAPI(tempStartDate!);
      const endStr = formatDateForAPI(date);
      console.log('[AnalyticsHeader] Setting range:', startStr, endStr);
      onChangePeriod({ from: startStr, to: endStr });
      setShowCalendar(false);
      setTempStartDate(null);
      setTempEndDate(null);
      setSelectingStart(true);
    }
  };

  const getCurrentDateForCalendar = (): Date => {
    if (selectingStart && tempStartDate) return tempStartDate;
    if (!selectingStart && tempEndDate) return tempEndDate;
    if (typeof period === 'string') {
      return new Date();
    }
    try {
      return parseISO(selectingStart ? period.from : period.to);
    } catch {
      return new Date();
    }
  };

  return (
    <View style={containerStyle}>
      <View style={dynamicStyles.segmentContainer}>
        <View style={dynamicStyles.segment}>
          {(['day', 'week', 'month'] as AnalyticsPeriod[]).map((p) => (
            <TouchableOpacity
              key={typeof p === 'string' ? p : `${(p as any).from}-${(p as any).to}`}
              style={[
                dynamicStyles.segmentItem,
                isActive(period, p) && { backgroundColor: colors.primary, borderWidth: 0 },
              ]}
              onPress={() => onChangePeriod(p)}
            >
              <Text
                style={[
                  dynamicStyles.segmentText,
                  isActive(period, p) && { color: colors.text.inverse },
                ]}
              >
                {getPeriodLabel(p)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={dynamicStyles.rangeContainer}>
        <View style={dynamicStyles.dateBlock}>
          <Text style={dynamicStyles.rangeCaption}>
            {tempStartDate
              ? format(tempStartDate, 'd MMM', { locale: ru })
              : getRangeDates(period).start}
          </Text>
          <TouchableOpacity
            style={dynamicStyles.calendarButton}
            onPress={handleCustomPeriodPress}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <Text style={dynamicStyles.rangeSeparator}>—</Text>

        <View style={dynamicStyles.dateBlock}>
          <Text style={dynamicStyles.rangeCaption}>
            {tempStartDate && !tempEndDate
              ? '...'
              : getRangeDates(period).end}
          </Text>
          <TouchableOpacity
            style={dynamicStyles.calendarButton}
            onPress={handleCustomPeriodPress}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {selectingStart && tempStartDate && (
        <Text style={dynamicStyles.rangeHint}>Выберите дату окончания</Text>
      )}

      {/* Progress to Goal Section */}
      {targetCalories && progressPercentage !== null && (
        <View style={dynamicStyles.progressSection}>
          <Text style={dynamicStyles.progressTitle}>Прогресс к цели</Text>
          <View style={dynamicStyles.progressInfo}>
            <Text style={dynamicStyles.progressText}>
              {formatNumber(kpi?.averageDailyCalories)} / {formatNumber(targetCalories)} ккал
            </Text>
            <Text style={[dynamicStyles.progressPercentage, isOverLimit && { color: colors.error }]}>
              {progressPercentage}%
            </Text>
          </View>
          <View style={dynamicStyles.progressBarBg}>
            <View
              style={[
                dynamicStyles.progressBarFg,
                {
                  width: `${Math.min(progressPercentage, 100)}%`,
                  backgroundColor: isOverLimit ? colors.error : colors.primary
                },
              ]}
            />
          </View>
          <Text style={[dynamicStyles.progressStatus, isOverLimit && { color: colors.error }]}>
            {getProgressStatus(isOverLimit, progressPercentage)}
          </Text>
        </View>
      )}

      {/* Macro Nutrients Section */}
      <View style={dynamicStyles.macroSection}>
        <Text style={dynamicStyles.sectionTitle}>Макронутриенты (среднесуточные)</Text>
        <View style={dynamicStyles.macroGrid}>
          <MacroCard
            label="Белки"
            value={kpi?.protein}
            unit="г"
            calories={macroPercentages.proteinKcal}
            percentage={macroPercentages.protein}
            colors={colors}
            styles={dynamicStyles}
          />
          <MacroCard
            label="Жиры"
            value={kpi?.fat}
            unit="г"
            calories={macroPercentages.fatKcal}
            percentage={macroPercentages.fat}
            colors={colors}
            styles={dynamicStyles}
          />
          <MacroCard
            label="Углеводы"
            value={kpi?.carbs}
            unit="г"
            calories={macroPercentages.carbsKcal}
            percentage={macroPercentages.carbs}
            colors={colors}
            styles={dynamicStyles}
          />
        </View>
      </View>

      {/* Activity Section */}
      {(kpi?.mealsCount !== undefined || kpi?.daysCount !== undefined) && (
        <View style={dynamicStyles.activitySection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
            <Text style={[dynamicStyles.sectionTitle, { marginBottom: 0 }]}>Активность за период</Text>
            {kpi?.daysCount !== undefined && (
              <Text style={{
                ...typography.caption,
                fontSize: 10,
                fontWeight: '600',
                color: getConsistencyMessage((kpi.daysCount / getTotalDaysInPeriod(period)) * 100).color
              }}>
                {getConsistencyMessage((kpi.daysCount / getTotalDaysInPeriod(period)) * 100).text}
              </Text>
            )}
          </View>
          <View style={dynamicStyles.activityRow}>
            {kpi?.mealsCount !== undefined && (
              <View style={dynamicStyles.activityItem}>
                <Text style={dynamicStyles.activityValue}>{formatNumber(kpi.mealsCount)}</Text>
                <Text style={dynamicStyles.activityLabel}>Приёмов пищи</Text>
              </View>
            )}
            {kpi?.daysCount !== undefined && (
              <View style={dynamicStyles.activityItem}>
                <Text style={dynamicStyles.activityValue}>{formatNumber(kpi.daysCount)}</Text>
                <Text style={dynamicStyles.activityLabel}>Дней отслеживания</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <CalendarModal
        visible={showCalendar}
        selectedDate={getCurrentDateForCalendar()}
        onClose={() => {
          setShowCalendar(false);
          setTempStartDate(null);
          setTempEndDate(null);
          setSelectingStart(true);
        }}
        onDateSelect={handleDateSelect}
        maximumDate={new Date()}
        closeOnSelect={false}
      />
    </View>
  );
});

function isActive(current: AnalyticsPeriod, key: AnalyticsPeriod) {
  if (typeof current === 'string' && typeof key === 'string')
    return current === key;
  if (typeof current !== 'string' && typeof key !== 'string')
    return current.from === key.from && current.to === key.to;
  return false;
}

function getPeriodLabel(period: AnalyticsPeriod): string {
  if (period === 'day') return 'День';
  if (period === 'week') return 'Неделя';
  return 'Месяц';
}

function getTotalDaysInPeriod(period: AnalyticsPeriod): number {
  if (period === 'day') return 1;
  if (period === 'week') return 7;
  const today = new Date();
  if (period === 'month') {
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  }
  // custom range
  try {
    const start = parseISO(period.from);
    const end = parseISO(period.to);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  } catch {
    return 1;
  }
}

function getConsistencyMessage(percentage: number): { text: string; color: string } {
  if (percentage > 95) return { text: 'Безупречная дисциплина! 🏆', color: '#4CAF50' }; // Green
  if (percentage > 85) return { text: 'Отличный результат! 🔥', color: '#8BC34A' }; // Light Green
  if (percentage > 75) return { text: 'Хороший темп! 💪', color: '#FFC107' }; // Amber
  if (percentage > 50) return { text: 'Неплохое начало! 🚀', color: '#FF9800' }; // Orange
  return { text: 'Нужно больше активности 📉', color: '#F44336' }; // Red
}

function getProgressStatus(isOverLimit: boolean, progressPercentage: number): string {
  if (isOverLimit) return 'Превышение лимита';
  if (progressPercentage < 90) return 'Ниже цели';
  return 'На правильном пути';
}

const MacroCard: React.FC<{
  label: string;
  value: number | undefined;
  unit: string;
  calories: number;
  percentage: number;
  colors: ColorsType;
  styles: ReturnType<typeof createStyles>;
}> = ({ label, value, unit, calories, percentage, colors, styles }) => (
  <View style={styles.macroCard}>
    <Text style={styles.macroLabel}>{label}</Text>
    <Text style={styles.macroValue}>
      {value !== null && value !== undefined ? formatNumber(value) : '—'} {unit}
    </Text>
    {calories > 0 && (
      <Text style={styles.macroCalories}>{formatNumber(calories)} ккал</Text>
    )}
    <Text style={styles.macroPercentage}>{percentage}%</Text>
  </View>
);

function formatNumber(n?: number): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('ru-RU').format(Math.round(n));
}

const createStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    paddingHorizontal: componentSpacing.screenHorizontal,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background.default,
  },
  containerCollapsed: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  segmentContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background.paper,
    borderRadius: 8,
    padding: 2,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  segmentText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.secondary,
  },
  calendarButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.light,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  dateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rangeSeparator: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  rangeCaption: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '500',
  },
  rangeHint: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primary,
    marginTop: 2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  progressSection: {
    backgroundColor: colors.background.paper,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressTitle: {
    ...typography.body2,
    fontSize: 13,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressText: {
    ...typography.body2,
    fontSize: 12,
    color: colors.text.primary,
  },
  progressPercentage: {
    ...typography.body1,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: spacing.xs,
  },
  progressBarFg: {
    height: 8,
    backgroundColor: colors.primary,
  },
  progressStatus: {
    ...typography.caption,
    fontSize: 10,
    color: colors.text.secondary,
  },
  sectionTitle: {
    ...typography.body2,
    fontSize: 13,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  macroSection: {
    marginBottom: spacing.sm,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  macroCard: {
    flex: 1,
    backgroundColor: colors.background.paper,
    borderRadius: 8,
    padding: spacing.xs,
    alignItems: 'center',
  },
  macroLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  macroValue: {
    ...typography.body1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  macroCalories: {
    ...typography.caption,
    fontSize: 9,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  macroPercentage: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  activitySection: {
    backgroundColor: colors.background.paper,
    borderRadius: 10,
    padding: spacing.sm,
  },
  activityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  activityItem: {
    flex: 1,
    alignItems: 'center',
  },
  activityValue: {
    ...typography.body1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  activityLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default AnalyticsHeader;
