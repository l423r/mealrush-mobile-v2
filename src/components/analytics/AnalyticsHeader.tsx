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
  collapsed = false,
}) => {
  const containerStyle = useMemo(
    () => [styles.container, collapsed && styles.containerCollapsed],
    [collapsed]
  );

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

      <View style={styles.kpiGrid}>
        <KpiTile
          title="Калории за период"
          value={formatNumber(kpi?.totalCalories)}
        />
        <KpiTile
          title="Среднесуточные ккал"
          value={formatNumber(kpi?.averageDailyCalories)}
        />
        <KpiTile title="Белки (г)" value={formatNumber(kpi?.protein)} />
        <KpiTile title="Жиры (г)" value={formatNumber(kpi?.fat)} />
      </View>
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

const KpiTile: React.FC<{ title: string; value: string }> = ({
  title,
  value,
}) => (
  <View style={styles.kpiTile}>
    <Text style={styles.kpiValue}>{value}</Text>
    <Text style={styles.kpiTitle}>{title}</Text>
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
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  kpiTile: {
    width: '47%',
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: spacing.md,
  },
  kpiValue: {
    ...typography.h2,
    color: colors.text.primary,
  },
  kpiTitle: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});

export default AnalyticsHeader;
