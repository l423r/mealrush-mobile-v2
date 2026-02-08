import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import { LineChart } from 'react-native-gifted-charts';
import { formatDate } from '../../utils/formatting';
import { spacing, typography, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import type { lightColors, darkColors } from '../../theme/colors';

type ColorsType = typeof lightColors | typeof darkColors;

export interface MealTrendDataPoint {
  date: Date;
  dateKey: string; // YYYY-MM-DD
  calories: number;
  mealCount: number;
}

interface MealTrendsChartProps {
  data: MealTrendDataPoint[];
  selectedMetric: 'calories' | 'mealCount';
  onMetricChange: (metric: 'calories' | 'mealCount') => void;
  testID?: string;
}

const METRIC_LABEL: Record<'calories' | 'mealCount', string> = {
  calories: 'Калории',
  mealCount: 'Приемы пищи',
};

const MealTrendsChart: React.FC<MealTrendsChartProps> = ({
  data,
  selectedMetric,
  onMetricChange,
  testID,
}) => {
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    return data
      .filter((point) => point != null)
      .map((point) => {
        const value = selectedMetric === 'calories' ? point.calories : point.mealCount;
        return {
          value: Math.max(0, value),
          label: formatDate(point.date, 'dd.MM'),
          dateKey: point.dateKey,
        };
      });
  }, [data, selectedMetric]);

  const hasValidData = chartData.length > 0;
  const canUseAreaChart = chartData.length > 1;

  // Calculate average
  const average = useMemo(() => {
    if (!hasValidData) return 0;
    const sum = chartData.reduce((acc, point) => acc + point.value, 0);
    return Math.round(sum / chartData.length);
  }, [chartData, hasValidData]);

  // Calculate max value for better chart scaling
  const maxValue = useMemo(() => {
    if (!hasValidData) return 100;
    return Math.max(...chartData.map((point) => point.value), 1);
  }, [chartData, hasValidData]);

  return (
    <View style={[dynamicStyles.container, { backgroundColor: colors.background.paper }]} testID={testID}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={[dynamicStyles.title, { color: colors.text.primary }]}>Тренды</Text>
        {hasValidData && (
          <View style={dynamicStyles.averageContainer}>
            <Text style={[dynamicStyles.averageLabel, { color: colors.text.secondary }]}>
              Среднее:
            </Text>
            <Text style={[dynamicStyles.averageValue, { color: colors.primary }]}>
              {average} {selectedMetric === 'calories' ? 'ккал' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Metric Selector */}
      <View style={dynamicStyles.chipsRow}>
        {(Object.keys(METRIC_LABEL) as Array<'calories' | 'mealCount'>).map((metric) => (
          <TouchableOpacity
            key={metric}
            testID={`trend_metric_${metric}`}
            accessibilityLabel={METRIC_LABEL[metric]}
            style={[
              dynamicStyles.chip,
              { backgroundColor: colors.background.light },
              selectedMetric === metric && { backgroundColor: colors.primary },
            ]}
            onPress={() => onMetricChange(metric)}
          >
            <Text
              style={[
                dynamicStyles.chipText,
                { color: colors.text.secondary },
                selectedMetric === metric && { color: colors.white },
              ]}
            >
              {METRIC_LABEL[metric]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      {hasValidData ? (
        <LineChart
          key={`meal-trend-${selectedMetric}-${chartData.length}`}
          data={chartData}
          height={200}
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
          maxValue={maxValue * 1.1} // Add 10% padding
          animateOnDataChange={canUseAreaChart}
          animationDuration={canUseAreaChart ? 600 : 0}
          curved={canUseAreaChart}
          spacing={chartData.length > 7 ? 40 : 60}
        />
      ) : (
        <View style={dynamicStyles.emptyContainer}>
          <Text style={[dynamicStyles.emptyText, { color: colors.text.secondary }]}>
            Недостаточно данных для отображения графика
          </Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    title: {
      ...typography.h5,
      fontWeight: '600',
    },
    averageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    averageLabel: {
      ...typography.caption,
      fontSize: 12,
    },
    averageValue: {
      ...typography.body2,
      fontWeight: '600',
    },
    chipsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    chip: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
    },
    chipText: {
      ...typography.body2,
      fontSize: 13,
      fontWeight: '500',
    },
    emptyContainer: {
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      ...typography.body2,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

export default observer(MealTrendsChart);
