import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import type { DistributionData } from '../../types/analytics.types';
import { colors, spacing, typography } from '../../theme';

// Helper to format meal type to Russian
const formatMealTypeLabel = (mealType: string): string => {
  const mealTypes: Record<string, string> = {
    breakfast: 'Завтрак',
    lunch: 'Обед',
    dinner: 'Ужин',
    snack: 'Перекус',
    BREAKFAST: 'Завтрак',
    LUNCH: 'Обед',
    DINNER: 'Ужин',
    SUPPER: 'Полдник',
    LATE_SUPPER: 'Поздний ужин',
  };
  return mealTypes[mealType] || mealType;
};

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

  // Check if there's any data to display
  const hasMacroData =
    pieData.some((p) => (p.y || 0) > 0) && data?.macroShare != null;
  const hasMealData = byMeal.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Распределение Б/Ж/У</Text>
      {hasMacroData ? (
        <View style={styles.pieContainer}>
          <PieChart
            donut
            innerRadius={60}
            radius={90}
            data={pieData.map((p) => ({
              value: Math.round((p.y || 0) * 100),
              color:
                p.x === 'Белки'
                  ? metricColor('protein')
                  : p.x === 'Жиры'
                    ? metricColor('fat')
                    : metricColor('carbs'),
              text: `${p.x}`,
            }))}
            centerLabelComponent={() => (
              <Text
                style={{ ...typography.body2, color: colors.text.secondary }}
              >
                %
              </Text>
            )}
          />
          <View style={styles.legend}>
            {pieData.map((p, idx) => {
              const pct = Math.round((p.y || 0) * 100);
              return (
                <View key={idx} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      {
                        backgroundColor:
                          p.x === 'Белки'
                            ? metricColor('protein')
                            : p.x === 'Жиры'
                              ? metricColor('fat')
                              : metricColor('carbs'),
                      },
                    ]}
                  />
                  <Text style={styles.legendText}>
                    {p.x}: {pct}%
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <Text style={styles.emptyText}>Недостаточно данных</Text>
      )}

      <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>
        Вклад категорий приёмов
      </Text>
      {hasMealData ? (
        <BarChart
          height={220}
          data={categories.map((c, idx) => ({
            label: formatMealTypeLabel(c),
            value: calories[idx] || 0,
            frontColor: colors.primary,
          }))}
          barWidth={28}
          xAxisLabelTextStyle={{ color: colors.text.secondary, fontSize: 10 }}
          yAxisTextStyle={{ color: colors.text.secondary, fontSize: 10 }}
          yAxisThickness={0}
          xAxisThickness={0}
          noOfSections={4}
          spacing={categories.length > 3 ? 20 : 40}
        />
      ) : (
        <Text style={styles.emptyText}>Недостаточно данных</Text>
      )}

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
  pieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  legend: {
    marginLeft: spacing.lg,
    gap: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...typography.body2,
    color: colors.text.primary,
    fontSize: 12,
  },
  emptyText: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});

export default AnalyticsDistribution;
