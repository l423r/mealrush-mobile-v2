import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import type { DistributionData } from '../../types/analytics.types';
import { spacing, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import type { lightColors, darkColors } from '../../theme/colors';

type ColorsType = typeof lightColors | typeof darkColors;

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

export const AnalyticsDistribution: React.FC<AnalyticsDistributionProps> = observer(({
  data,
}) => {
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);
  
  const macro = data?.macroShare || { proteinPct: 0, fatPct: 0, carbsPct: 0 };
  const byMeal = data?.byMealType || [];

  const pieData = [
    { x: 'Белки', y: macro.proteinPct || 0 },
    { x: 'Жиры', y: macro.fatPct || 0 },
    { x: 'Углеводы', y: macro.carbsPct || 0 },
  ];

  // Filter out meal types with zero calories for better visualization
  // Sort by calories descending for better chart readability
  const mealDataWithValues = byMeal
    .filter((i) => (i.calories || 0) > 0)
    .sort((a, b) => (b.calories || 0) - (a.calories || 0));

  // Check if there's any data to display
  const hasMacroData =
    pieData.some((p) => (p.y || 0) > 0) && data?.macroShare != null;
  const hasMealData = mealDataWithValues.length > 0;

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.card}>
        <Text style={dynamicStyles.sectionTitle}>Распределение Б/Ж/У</Text>
        {hasMacroData ? (
          <View style={dynamicStyles.pieContainer}>
            <PieChart
              key={`pie-${getPieKey(pieData)}`}
              donut
              innerRadius={50}
              radius={75}
              innerCircleColor={colors.background.paper}
              data={pieData
                .filter((p) => (p.y || 0) > 0)
                .map((p) => ({
                  value: Math.max(0, Math.round((p.y || 0) * 100)),
                  color: getMacroColor(p.x),
                  text: p.x,
                }))}
              centerLabelComponent={() => (
                <Text
                  style={{ ...typography.caption, fontSize: 10, color: colors.text.secondary }}
                >
                  %
                </Text>
              )}
            />
            <View style={dynamicStyles.legend}>
              {pieData.map((p) => {
                const pct = Math.round((p.y || 0) * 100);
                const macroColor = getMacroColor(p.x);
                return (
                  <View key={p.x} style={dynamicStyles.legendItem}>
                    <View
                      style={[
                        dynamicStyles.legendColor,
                        { backgroundColor: macroColor },
                      ]}
                    />
                    <Text style={dynamicStyles.legendText}>
                      {p.x}: {pct}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <Text style={dynamicStyles.emptyText}>Недостаточно данных</Text>
        )}
      </View>

      <View style={dynamicStyles.card}>
        <Text style={dynamicStyles.sectionTitle}>Вклад категорий приёмов</Text>
        {hasMealData ? (
          <BarChart
            key={`bar-${getBarKey(mealDataWithValues)}`}
            height={180}
            data={mealDataWithValues.map((item) => ({
              label: formatMealTypeLabel(item.mealType),
              value: Math.max(0, Math.round(item.calories || 0)),
              frontColor: colors.primary,
            }))}
            barWidth={24}
            xAxisLabelTextStyle={{ color: colors.text.secondary, fontSize: 9 }}
            yAxisTextStyle={{ color: colors.text.secondary, fontSize: 9 }}
            yAxisThickness={0}
            xAxisThickness={0}
            noOfSections={4}
            spacing={mealDataWithValues.length > 3 ? 16 : 32}
          />
        ) : (
          <Text style={dynamicStyles.emptyText}>Недостаточно данных</Text>
        )}
      </View>
    </View>
  );
});

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

function getMacroColor(macroName: string): string {
  if (macroName === 'Белки') return metricColor('protein');
  if (macroName === 'Жиры') return metricColor('fat');
  return metricColor('carbs');
}

function getPieKey(pieData: Array<{ x: string; y: number }>): string {
  return pieData.map((p) => `${p.x}-${p.y}`).join('-');
}

function getBarKey(mealData: Array<{ mealType: string }>): string {
  return `${mealData.length}-${mealData.map((i) => i.mealType).join('-')}`;
}

const createStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.body2,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  pieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs,
  },
  legend: {
    marginLeft: spacing.md,
    gap: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.text.primary,
  },
  emptyText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});

export default AnalyticsDistribution;
