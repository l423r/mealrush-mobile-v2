import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
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

  // Reverse for display (oldest to newest, left to right)
  const displayData = [...recentData].reverse();

  // Prepare data for LineChart
  const chartData = displayData.map((entry) => ({
    value: entry.weight,
    label: '', // No labels for mini chart
  }));

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        height={50}
        thickness={2}
        color={colors.primary}
        areaChart={true}
        startFillColor={colors.primary}
        endFillColor={colors.primary}
        startOpacity={0.3}
        endOpacity={0.05}
        hideDataPoints={false}
        dataPointsColor={colors.primary}
        dataPointsRadius={3}
        hideYAxisText={true}
        hideAxesAndRules={true}
        curved={true}
        spacing={chartData.length > 4 ? 30 : 50}
        initialSpacing={5}
        endSpacing={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
});

export default MiniWeightChart;

