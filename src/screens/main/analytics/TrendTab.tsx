import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../stores';
import { colors, spacing, typography } from '../../../theme';
import { NutritionMetricType } from '../../../types/api.types';
import { LineChart } from 'react-native-gifted-charts';
import { format } from 'date-fns';

const METRICS: NutritionMetricType[] = ['CALORIES', 'PROTEINS', 'FATS', 'CARBOHYDRATES'];

const TrendTab: React.FC = observer(() => {
  const { nutritionStore } = useStores();
  const today = React.useMemo(() => new Date(), []);
  const start = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

  const [metric, setMetric] = React.useState<NutritionMetricType>('CALORIES');

  const load = () => {
    const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    const endDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    nutritionStore.loadTrend(startDate, endDate, metric);
  };

  const chartData = React.useMemo(() => {
    if (!nutritionStore.trend) return [];
    return nutritionStore.trend.dailyValues.map((item) => ({
      value: Math.round(item.value),
      label: format(new Date(item.date + 'T00:00:00'), 'dd.MM'),
      date: item.date,
    }));
  }, [nutritionStore.trend]);

  const screenWidth = Dimensions.get('window').width;


  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Тренд</Text>
      <View style={styles.metricsRow}>
        {METRICS.map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => setMetric(m)}
            style={[styles.chip, metric === m && styles.chipActive]}
          >
            <Text style={[styles.chipText, metric === m && styles.chipTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={load}>
        <Text style={styles.buttonText}>Загрузить</Text>
      </TouchableOpacity>

      {nutritionStore.trend && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Среднее: {nutritionStore.trend.averageValue?.toFixed(0) ?? '—'}</Text>
          <Text style={styles.cardTitle}>Прогноз: {nutritionStore.trend.predictedValue?.toFixed(0) ?? '—'}</Text>
          <Text style={styles.cardSubtitle}>Направление: {nutritionStore.trend.direction}</Text>

          {chartData.length > 0 && (
            <View style={{ marginTop: spacing.md }}>
              <LineChart
                data={chartData}
                width={screenWidth - spacing.lg * 4}
                height={220}
                spacing={40}
                thickness={3}
                color={colors.primary}
                noOfSections={4}
                animateOnDataChange
                animationDuration={800}
                dataPointsRadius={4}
                dataPointsColor={colors.secondary}
                textShiftY={-5}
                textShiftX={-5}
                textColor={colors.text.secondary}
                textFontSize={11}
                areaChart
                startFillColor={colors.primary}
                endFillColor={colors.primary}
                startOpacity={0.2}
                endOpacity={0}
                backgroundColor="transparent"
                rulesColor={colors.gray[200]}
                yAxisColor={colors.border.light}
                xAxisColor={colors.border.light}
                yAxisTextStyle={{ color: colors.text.secondary, fontSize: 11 }}
                xAxisLabelTextStyle={{ color: colors.text.secondary, fontSize: 11 }}
                curve
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  chipTextActive: {
    color: colors.white,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  card: {
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: 12,
    borderColor: colors.border.light,
    borderWidth: 1,
  },
  cardTitle: {
    ...typography.body1,
    color: colors.text.primary,
  },
  cardSubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
  },
});

export default TrendTab;

