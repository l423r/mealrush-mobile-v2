import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { AnalyticsPeriod, SummaryKpi } from '../../types/analytics.types';
import { colors, spacing, typography, componentSpacing } from '../../theme';

interface AnalyticsHeaderProps {
  period: AnalyticsPeriod;
  onChangePeriod: (next: AnalyticsPeriod) => void;
  kpi: SummaryKpi | null;
  collapsed?: boolean; // reduces vertical paddings when true
}

const PERIODS: Array<{ key: AnalyticsPeriod; label: string }> = [
  { key: 'day', label: 'День' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
];

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
      <Text style={styles.title}>Сводка</Text>
      <View style={styles.segment}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={
              typeof p.key === 'string' ? p.key : `${p.key.from}-${p.key.to}`
            }
            style={[
              styles.segmentItem,
              isActive(period, p.key) && styles.segmentItemActive,
            ]}
            onPress={() => onChangePeriod(p.key)}
          >
            <Text
              style={[
                styles.segmentText,
                isActive(period, p.key) && styles.segmentTextActive,
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
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
  },
  segmentItemActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  segmentTextActive: {
    color: colors.white,
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
