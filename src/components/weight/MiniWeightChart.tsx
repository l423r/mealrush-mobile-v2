import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import type { WeightEntry } from '../../types/api.types';
import { colors, spacing } from '../../theme';

interface MiniWeightChartProps {
  data: WeightEntry[];
}

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

const MiniWeightChart: React.FC<MiniWeightChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Group by day first, then take last 7 DAYS
  const dailyData = groupByDay(data);
  
  // Need at least 2 different days to show a chart
  if (dailyData.length < 2) {
    return null;
  }
  
  const recentData = dailyData.slice(0, 7);

  const weights = recentData.map((e) => e.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = maxWeight - minWeight || 1; // Avoid division by zero

  const chartWidth = Dimensions.get('window').width - spacing.lg * 4 - spacing.xl * 2;
  const chartHeight = 40;

  // Reverse for display (oldest to newest, left to right)
  const displayData = [...recentData].reverse();

  const points = displayData.map((entry, index) => {
    const x = displayData.length === 1 ? chartWidth / 2 : (index / (displayData.length - 1)) * chartWidth;
    const y =
      chartHeight - ((entry.weight - minWeight) / weightRange) * chartHeight;
    return { x, y };
  });

  return (
    <View style={[styles.container, { width: chartWidth, height: chartHeight }]}>
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
              left: point.x - 3,
              bottom: point.y - 3,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: spacing.sm,
  },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: colors.primary,
    transformOrigin: 'left center',
  },
  dataPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.white,
  },
});

export default MiniWeightChart;

