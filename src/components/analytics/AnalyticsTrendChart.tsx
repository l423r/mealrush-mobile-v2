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

      <LineChart
        data={series.map((p) => ({
          value: p.y,
          label: formatDate(p.x, 'dd.MM'),
        }))}
        height={220}
        thickness={2}
        color={colors.primary}
        areaChart
        startFillColor={colors.primary}
        endFillColor={colors.primary}
        startOpacity={0.2}
        endOpacity={0}
        yAxisThickness={0}
        xAxisThickness={0}
        yAxisTextStyle={{ color: colors.text.secondary, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: colors.text.secondary, fontSize: 10 }}
        noOfSections={4}
        animateOnDataChange={series.length > 1}
        animationDuration={series.length > 1 ? 600 : 0}
        curved
        spacing={series.length > 7 ? 40 : 60}
        />
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
});

export default AnalyticsTrendChart;
