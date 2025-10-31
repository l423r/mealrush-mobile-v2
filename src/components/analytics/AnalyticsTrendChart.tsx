import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { formatDate } from '../../utils/formatting';
import type { TrendMetric } from '../../types/analytics.types';
import { colors, spacing, typography } from '../../theme';

export interface TrendSeriesPoint {
  x: string; // date label
  y: number;
}

interface AnalyticsTrendChartProps {
  metric: TrendMetric;
  onMetricChange: (m: TrendMetric) => void;
  series: TrendSeriesPoint[];
}

const METRIC_LABEL: Record<TrendMetric, string> = {
  calories: 'Калории',
  protein: 'Белки',
  fat: 'Жиры',
  carbs: 'Углеводы',
};

export const AnalyticsTrendChart: React.FC<AnalyticsTrendChartProps> = ({
  metric,
  onMetricChange,
  series,
}) => {
  // Validate and prepare chart data
  const chartData = React.useMemo(() => {
    if (!series || series.length === 0) {
      return [];
    }
    return series
      .filter((p) => p != null && typeof p.y === 'number' && !isNaN(p.y))
      .map((p) => ({
        value: Math.max(0, p.y), // Ensure non-negative values
        label: formatDate(p.x, 'dd.MM'),
      }));
  }, [series]);

  const hasValidData = chartData.length > 0;
  const canUseAreaChart = chartData.length > 1;

  return (
    <View style={styles.container}>
      <View style={styles.chipsRow}>
        {(Object.keys(METRIC_LABEL) as TrendMetric[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.chip, metric === m && styles.chipActive]}
            onPress={() => onMetricChange(m)}
          >
            <Text
              style={[styles.chipText, metric === m && styles.chipTextActive]}
            >
              {METRIC_LABEL[m]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {hasValidData ? (
        <LineChart
          key={`trend-${metric}-${series.length}`}
          data={chartData}
          height={220}
          thickness={2}
          color={colors.primary}
          areaChart={canUseAreaChart}
          startFillColor={canUseAreaChart ? colors.primary : undefined}
          endFillColor={canUseAreaChart ? colors.primary : undefined}
          startOpacity={canUseAreaChart ? 0.2 : 0}
          endOpacity={0}
          yAxisThickness={0}
          xAxisThickness={0}
          yAxisTextStyle={{ color: colors.text.secondary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.text.secondary, fontSize: 10 }}
          noOfSections={4}
          animateOnDataChange={canUseAreaChart}
          animationDuration={canUseAreaChart ? 600 : 0}
          curved={canUseAreaChart}
          spacing={chartData.length > 7 ? 40 : 60}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Недостаточно данных для отображения графика</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background.paper,
    borderRadius: 16,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.white,
  },
  emptyContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default AnalyticsTrendChart;
