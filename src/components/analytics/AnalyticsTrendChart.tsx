import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import { LineChart } from 'react-native-gifted-charts';
import { formatDate } from '../../utils/formatting';
import type { TrendMetric } from '../../types/analytics.types';
import { spacing, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import type { lightColors, darkColors } from '../../theme/colors';

type ColorsType = typeof lightColors | typeof darkColors;

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

export const AnalyticsTrendChart: React.FC<AnalyticsTrendChartProps> = observer(({
  metric,
  onMetricChange,
  series,
}) => {
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);
  
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
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.chipsRow}>
        {(Object.keys(METRIC_LABEL) as TrendMetric[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[dynamicStyles.chip, metric === m && { backgroundColor: colors.primary }]}
            onPress={() => onMetricChange(m)}
          >
            <Text
              style={[dynamicStyles.chipText, metric === m && { color: colors.white }]}
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
        <View style={dynamicStyles.emptyContainer}>
          <Text style={dynamicStyles.emptyText}>Недостаточно данных для отображения графика</Text>
        </View>
      )}
    </View>
  );
});

const createStyles = (colors: ColorsType) => StyleSheet.create({
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
  chipText: {
    ...typography.body2,
    color: colors.text.secondary,
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
