import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { AnalyticsPeriod, SummaryKpi } from '../../types/analytics.types';
import { colors, spacing, typography, componentSpacing } from '../../theme';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';

interface AnalyticsHeaderProps {
  period: AnalyticsPeriod;
  onChangePeriod: (next: AnalyticsPeriod) => void;
  kpi: SummaryKpi | null;
  targetCalories?: number;
  collapsed?: boolean; // reduces vertical paddings when true
}

function formatRangeLabel(key: AnalyticsPeriod): string {
  const today = new Date();
  if (key === 'day') return format(today, 'd MMMM', { locale: ru });
  if (key === 'week') {
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
    return `${format(start, 'd MMM', { locale: ru })} — ${format(end, 'd MMM', { locale: ru })}`;
  }
  if (key === 'month') {
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    return `${format(start, 'd MMM', { locale: ru })} — ${format(end, 'd MMM', { locale: ru })}`;
  }
  // custom range
  return `${key.from} — ${key.to}`;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  period,
  onChangePeriod,
  kpi,
  targetCalories,
  collapsed = false,
}) => {
  const containerStyle = useMemo(
    () => [styles.container, collapsed && styles.containerCollapsed],
    [collapsed]
  );

  // Calculate macro percentages
  const macroPercentages = useMemo(() => {
    if (!kpi || !kpi.averageDailyCalories || kpi.averageDailyCalories === 0) {
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
  const progressPercentage = useMemo(() => {
    if (!targetCalories || !kpi?.averageDailyCalories || targetCalories === 0) {
      return null;
    }
    return Math.min(Math.round((kpi.averageDailyCalories / targetCalories) * 100), 100);
  }, [kpi?.averageDailyCalories, targetCalories]);

  return (
    <View style={containerStyle}>
      <View style={styles.segment}>
        {(['day', 'week', 'month'] as AnalyticsPeriod[]).map((p) => (
          <TouchableOpacity
            key={typeof p === 'string' ? p : `${(p as any).from}-${(p as any).to}`}
            style={[
              styles.segmentItem,
              isActive(period, p) && styles.segmentItemActive,
            ]}
            onPress={() => onChangePeriod(p)}
          >
            <Text
              style={[
                styles.segmentText,
                isActive(period, p) && styles.segmentTextActive,
              ]}
            >
              {p === 'day' ? 'День' : p === 'week' ? 'Неделя' : 'Месяц'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.rangeCaption}>{formatRangeLabel(period)}</Text>

      {/* Progress to Goal Section */}
      {targetCalories && progressPercentage !== null && (
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Прогресс к цели</Text>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {formatNumber(kpi?.averageDailyCalories)} / {formatNumber(targetCalories)} ккал
            </Text>
            <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFg,
                { width: `${Math.min(progressPercentage, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressStatus}>
            {progressPercentage < 90
              ? 'Ниже цели'
              : progressPercentage <= 110
                ? 'На правильном пути'
                : 'Превышение цели'}
          </Text>
        </View>
      )}

      {/* Macro Nutrients Section */}
      <View style={styles.macroSection}>
        <Text style={styles.sectionTitle}>Макронутриенты (среднесуточные)</Text>
        <View style={styles.macroGrid}>
          <MacroCard
            label="Белки"
            value={kpi?.protein}
            unit="г"
            calories={macroPercentages.proteinKcal}
            percentage={macroPercentages.protein}
          />
          <MacroCard
            label="Жиры"
            value={kpi?.fat}
            unit="г"
            calories={macroPercentages.fatKcal}
            percentage={macroPercentages.fat}
          />
          <MacroCard
            label="Углеводы"
            value={kpi?.carbs}
            unit="г"
            calories={macroPercentages.carbsKcal}
            percentage={macroPercentages.carbs}
          />
        </View>
      </View>

      {/* Activity Section */}
      {(kpi?.mealsCount !== undefined || kpi?.daysCount !== undefined) && (
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Активность за период</Text>
          <View style={styles.activityRow}>
            {kpi?.mealsCount !== undefined && (
              <View style={styles.activityItem}>
                <Text style={styles.activityValue}>{formatNumber(kpi.mealsCount)}</Text>
                <Text style={styles.activityLabel}>Приёмов пищи</Text>
              </View>
            )}
            {kpi?.daysCount !== undefined && (
              <View style={styles.activityItem}>
                <Text style={styles.activityValue}>{formatNumber(kpi.daysCount)}</Text>
                <Text style={styles.activityLabel}>Дней отслеживания</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

function isActive(current: AnalyticsPeriod, key: AnalyticsPeriod) {
  if (typeof current === 'string' && typeof key === 'string')
    return current === key;
  if (typeof current !== 'string' && typeof key !== 'string')
    return current.from === key.from && current.to === key.to;
  return false;
}

const MacroCard: React.FC<{
  label: string;
  value: number | undefined;
  unit: string;
  calories: number;
  percentage: number;
}> = ({ label, value, unit, calories, percentage }) => (
  <View style={styles.macroCard}>
    <Text style={styles.macroLabel}>{label}</Text>
    <Text style={styles.macroValue}>
      {value != null ? formatNumber(value) : '—'} {unit}
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: componentSpacing.screenHorizontal,
    paddingTop: componentSpacing.sectionSpacing,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.default,
  },
  containerCollapsed: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.background.paper,
    borderRadius: 10,
    padding: 2,
    marginBottom: spacing.md,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  segmentItemActive: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  segmentText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  segmentTextActive: {
    color: colors.white,
  },
  rangeCaption: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  progressSection: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressText: {
    ...typography.body1,
    color: colors.text.primary,
  },
  progressPercentage: {
    ...typography.h3,
    color: colors.primary,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: colors.gray[200],
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  progressBarFg: {
    height: 10,
    backgroundColor: colors.primary,
  },
  progressStatus: {
    ...typography.body2,
    color: colors.text.secondary,
    fontSize: 12,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  macroSection: {
    marginBottom: spacing.md,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  macroCard: {
    flex: 1,
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  macroLabel: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  macroValue: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  macroCalories: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  macroPercentage: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
  activitySection: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  activityItem: {
    flex: 1,
    alignItems: 'center',
  },
  activityValue: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  activityLabel: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default AnalyticsHeader;
