import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryTheme,
  VictoryVoronoiContainer,
  VictoryTooltip,
  VictoryArea,
} from 'victory-native';
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

      <VictoryChart
        theme={VictoryTheme.material}
        height={220}
        padding={{ top: 12, bottom: 40, left: 40, right: 12 }}
        containerComponent={
          <VictoryVoronoiContainer
            voronoiDimension="x"
            labels={({ datum }: any) => `${datum.x}: ${Math.round(datum.y)}`}
            labelComponent={
              <VictoryTooltip cornerRadius={8} flyoutStyle={{ fill: '#fff' }} />
            }
          />
        }
      >
        <VictoryAxis
          style={{ tickLabels: { fontSize: 10, fill: colors.text.secondary } }}
        />
        <VictoryAxis
          dependentAxis
          style={{ tickLabels: { fontSize: 10, fill: colors.text.secondary } }}
        />
        <VictoryArea
          interpolation="monotoneX"
          data={series}
          style={{
            data: {
              stroke: colors.primary,
              fill: `${colors.primary}33`,
              strokeWidth: 2,
            },
          }}
        />
        <VictoryLine
          interpolation="monotoneX"
          data={series}
          style={{ data: { stroke: colors.primary, strokeWidth: 2 } }}
        />
      </VictoryChart>
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
