import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../stores';
import { colors, spacing, typography } from '../../../theme';
import { formatDateForAPI, formatCalories } from '../../../utils/formatting';

const ProgressBar = ({ percentage }: { percentage: number }) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  return (
    <View style={styles.progressOuter}>
      <View style={[styles.progressInner, { width: `${clamped}%` }]} />
      <Text style={styles.progressLabel}>{clamped}%</Text>
    </View>
  );
};

const SummaryTab: React.FC = observer(() => {
  const { nutritionStore } = useStores();

  const today = React.useMemo(() => new Date(), []);
  const date = formatDateForAPI(today);
  const weekStart = formatDateForAPI(
    new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)
  );
  const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const loadDaily = () => nutritionStore.loadDaily(date);
  const loadWeekly = () => nutritionStore.loadWeekly(weekStart);
  const loadMonthly = () => nutritionStore.loadMonthly(month);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Сводка за период</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>День</Text>
        <TouchableOpacity style={styles.button} onPress={loadDaily}>
          <Text style={styles.buttonText}>Сегодня</Text>
        </TouchableOpacity>
        {nutritionStore.daily && (
          <View style={styles.metricsRow}>
            <Text style={styles.metric}>
              Калории: {formatCalories(nutritionStore.daily.totalCalories)}
            </Text>
            <ProgressBar percentage={nutritionStore.daily.caloriesPercentage} />
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Неделя</Text>
        <TouchableOpacity style={styles.button} onPress={loadWeekly}>
          <Text style={styles.buttonText}>Последние 7 дней</Text>
        </TouchableOpacity>
        {nutritionStore.weekly && (
          <View style={styles.metricsRow}>
            <Text style={styles.metric}>
              Калории: {formatCalories(nutritionStore.weekly.totalCalories)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Месяц</Text>
        <TouchableOpacity style={styles.button} onPress={loadMonthly}>
          <Text style={styles.buttonText}>Текущий месяц</Text>
        </TouchableOpacity>
        {nutritionStore.monthly && (
          <View style={styles.metricsRow}>
            <Text style={styles.metric}>
              Калории: {formatCalories(nutritionStore.monthly.totalCalories)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  card: {
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: 12,
    borderColor: colors.border.light,
    borderWidth: 1,
    gap: spacing.md,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.text.primary,
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
  metricsRow: {
    gap: spacing.sm,
  },
  metric: {
    ...typography.body1,
    color: colors.text.primary,
  },
  progressOuter: {
    height: 14,
    backgroundColor: colors.gray[200],
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressInner: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.white,
    textAlign: 'center',
  },
});

export default SummaryTab;
