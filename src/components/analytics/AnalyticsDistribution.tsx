import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  VictoryPie,
  VictoryChart,
  VictoryStack,
  VictoryBar,
  VictoryAxis,
  VictoryTheme,
} from 'victory-native';
import type { DistributionData } from '../../types/analytics.types';
import { colors, spacing, typography } from '../../theme';

interface AnalyticsDistributionProps {
  data: DistributionData | null;
}

export const AnalyticsDistribution: React.FC<AnalyticsDistributionProps> = ({
  data,
}) => {
  const macro = data?.macroShare || { proteinPct: 0, fatPct: 0, carbsPct: 0 };
  const byMeal = data?.byMealType || [];

  const pieData = [
    { x: 'Белки', y: macro.proteinPct || 0 },
    { x: 'Жиры', y: macro.fatPct || 0 },
    { x: 'Углеводы', y: macro.carbsPct || 0 },
  ];

  const categories = byMeal.map((i) => i.mealType);
  const calories = byMeal.map((i) => i.calories);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Распределение Б/Ж/У</Text>
      <VictoryPie
        height={220}
        colorScale={[
          metricColor('protein'),
          metricColor('fat'),
          metricColor('carbs'),
        ]}
        data={pieData}
        labels={({ datum }: any) =>
          `${datum.x}: ${Math.round(((datum.y || 0) as number) * 100)}%`
        }
        style={{ labels: { fontSize: 12 } }}
        padAngle={2}
        innerRadius={60}
      />

      <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>
        Вклад категорий приёмов
      </Text>
      <VictoryChart
        height={220}
        theme={VictoryTheme.material}
        domainPadding={{ x: 20 }}
      >
        <VictoryAxis
          style={{ tickLabels: { fontSize: 10, fill: colors.text.secondary } }}
        />
        <VictoryAxis
          dependentAxis
          style={{ tickLabels: { fontSize: 10, fill: colors.text.secondary } }}
        />
        <VictoryStack colorScale={[colors.primary]}>
          <VictoryBar
            data={categories.map((c, idx) => ({ x: c, y: calories[idx] || 0 }))}
          />
        </VictoryStack>
      </VictoryChart>
    </View>
  );
};

function metricColor(metric: 'protein' | 'fat' | 'carbs') {
  switch (metric) {
    case 'protein':
      return '#6C63FF';
    case 'fat':
      return '#FF7043';
    default:
      return '#29B6F6';
  }
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
});

export default AnalyticsDistribution;
