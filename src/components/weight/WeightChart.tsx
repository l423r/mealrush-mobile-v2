import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
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
        <Text style={styles.emptyText}>Нет данных для отображения</Text>
      </View>
    );
  }

  // Group by day - one entry per day (latest)
  const dailyData = groupByDay(data);

  // Calculate chart dimensions and scales ONLY from actual data
  const weights = dailyData.map((e) => e.weight);
  const minWeight = Math.min(...weights) - 2;
  const maxWeight = Math.max(...weights) + 2;
  const weightRange = maxWeight - minWeight;

  const chartWidth = Dimensions.get('window').width - spacing.lg * 4;
  const chartHeight = 200;

  // Reverse data for display (oldest to newest, left to right)
  const displayData = [...dailyData].reverse();

  // Generate points for chart
  const points = displayData.map((entry, index) => {
    const x = displayData.length === 1 ? chartWidth / 2 : (index / (displayData.length - 1)) * chartWidth;
    const y =
      chartHeight - ((entry.weight - minWeight) / weightRange) * chartHeight;
    return { x, y, entry };
  });

  // Get unique dates for X-axis labels (displayData is already reversed)
  const getUniqueStartAndEndDates = () => {
    if (displayData.length === 0) return { start: '', end: '' };
    if (displayData.length === 1) {
      const date = formatDate(displayData[0].recordedAt, 'd MMM');
      return { start: date, end: date };
    }

    // displayData is oldest to newest, so first is left, last is right
    const firstDate = formatDate(displayData[0].recordedAt, 'd MMM');
    const lastDate = formatDate(displayData[displayData.length - 1].recordedAt, 'd MMM');

    return { start: firstDate, end: lastDate };
  };

  const { start: startDate, end: endDate } = getUniqueStartAndEndDates();

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

      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{Math.round(maxWeight)}</Text>
          <Text style={styles.axisLabel}>
            {Math.round((maxWeight + minWeight) / 2)}
          </Text>
          <Text style={styles.axisLabel}>{Math.round(minWeight)}</Text>
        </View>

        {/* Chart area */}
        <View style={[styles.chart, { width: chartWidth, height: chartHeight }]}>
          {/* Target line */}
          {targetWeight && targetWeight >= minWeight && targetWeight <= maxWeight && (
            <View
              style={[
                styles.targetLine,
                {
                  bottom:
                    ((targetWeight - minWeight) / weightRange) * chartHeight,
                },
              ]}
            >
              <Text style={styles.targetLabel}>Цель</Text>
            </View>
          )}

          {/* Connect lines between points */}
          {points.map((point, index) => {
            if (index === 0) return null;
            const prev = points[index - 1];
            const angle = Math.atan2(point.y - prev.y, point.x - prev.x);
            const length = Math.sqrt(
              Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2)
            );

            return (
              <View
                key={`line-${index}`}
                style={[
                  styles.line,
                  {
                    left: prev.x,
                    bottom: prev.y,
                    width: length,
                    transform: [{ rotate: `${angle}rad` }],
                  },
                ]}
              />
            );
          })}

          {/* Data points */}
          {points.map((point, index) => (
            <View
              key={`point-${index}`}
              style={[
                styles.dataPoint,
                {
                  left: point.x - 4,
                  bottom: point.y - 4,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxis}>
        <Text style={styles.axisLabel}>{startDate}</Text>
        {startDate !== endDate && (
          <Text style={styles.axisLabel}>{endDate}</Text>
        )}
      </View>
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
  chartContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingRight: spacing.xs,
  },
  chart: {
    position: 'relative',
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.md,
  },
  targetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.secondary,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetLabel: {
    ...typography.caption,
    color: colors.secondary,
    backgroundColor: colors.background.paper,
    paddingHorizontal: spacing.xs,
    marginLeft: spacing.sm,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
  },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: colors.primary,
    transformOrigin: 'left center',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 40,
    paddingTop: spacing.xs,
  },
  axisLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  emptyText: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default WeightChart;

