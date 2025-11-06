import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import type { WeightEntry } from '../../types/api.types';
import { formatDate } from '../../utils/formatting';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';

interface WeightChartProps {
  data: WeightEntry[];
  targetWeight?: number;
  selectedPeriod?: number;
  onPeriodChange?: (days: number) => void;
}

type Period = 7 | 30 | 90 | 0;

// Group weight entries by day, taking the latest entry for each day
const groupByDay = (entries: WeightEntry[]): WeightEntry[] => {
  const grouped = new Map<string, WeightEntry>();
  
  entries.forEach((entry) => {
    const date = entry.recordedAt.split('T')[0]; // YYYY-MM-DD
    const existing = grouped.get(date);
    
    // Keep the latest entry for each day (by time)
    if (!existing || new Date(entry.recordedAt) > new Date(existing.recordedAt)) {
      grouped.set(date, entry);
    }
  });
  
  // Return sorted newest first (same as original data)
  return Array.from(grouped.values()).sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );
};

const WeightChart: React.FC<WeightChartProps> = ({
  data,
  targetWeight,
  selectedPeriod = 30,
  onPeriodChange,
}) => {
  const handlePeriodChange = (period: Period) => {
    onPeriodChange?.(period);
  };

  if (!data.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>График веса</Text>
        <View style={styles.periodSelector}>
          <PeriodButton
            label="7д"
            active={selectedPeriod === 7}
            onPress={() => handlePeriodChange(7)}
          />
          <PeriodButton
            label="30д"
            active={selectedPeriod === 30}
            onPress={() => handlePeriodChange(30)}
          />
          <PeriodButton
            label="90д"
            active={selectedPeriod === 90}
            onPress={() => handlePeriodChange(90)}
          />
          <PeriodButton
            label="Всё"
            active={selectedPeriod === 0}
            onPress={() => handlePeriodChange(0)}
          />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Нет данных для отображения</Text>
        </View>
      </View>
    );
  }

  // Group by day - one entry per day (latest)
  const dailyData = groupByDay(data);

  // Reverse data for display (oldest to newest, left to right)
  const displayData = [...dailyData].reverse();

  // Prepare data for LineChart
  const chartData = displayData.map((entry) => ({
    value: entry.weight,
    label: formatDate(entry.recordedAt, 'd MMM'),
    dataPointText: `${entry.weight}`,
  }));

  const hasValidData = chartData.length > 0;
  const canUseAreaChart = chartData.length > 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>График веса</Text>

      <View style={styles.periodSelector}>
        <PeriodButton
          label="7д"
          active={selectedPeriod === 7}
          onPress={() => handlePeriodChange(7)}
        />
        <PeriodButton
          label="30д"
          active={selectedPeriod === 30}
          onPress={() => handlePeriodChange(30)}
        />
        <PeriodButton
          label="90д"
          active={selectedPeriod === 90}
          onPress={() => handlePeriodChange(90)}
        />
        <PeriodButton
          label="Всё"
          active={selectedPeriod === 0}
          onPress={() => handlePeriodChange(0)}
        />
      </View>

      {hasValidData ? (
        <LineChart
          key={`weight-${selectedPeriod}-${data.length}`}
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
          animateOnDataChange={canUseAreaChart}
          animationDuration={canUseAreaChart ? 600 : 0}
          curved={canUseAreaChart}
          spacing={chartData.length > 7 ? 40 : 60}
          initialSpacing={10}
          endSpacing={10}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Нет данных для отображения</Text>
        </View>
      )}
    </View>
  );
};

const PeriodButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.periodButton, active && styles.periodButtonActive]}
    onPress={onPress}
  >
    <Text style={[styles.periodButtonText, active && styles.periodButtonTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  title: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  periodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[200],
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  periodButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default WeightChart;

