import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../stores';
import { colors, spacing, typography } from '../../../theme';

const ProgressTab: React.FC = observer(() => {
  const { nutritionStore } = useStores();
  const today = React.useMemo(() => new Date(), []);
  const start = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

  const load = () => {
    const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    const endDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    nutritionStore.loadProgress(startDate, endDate);
  };

  const p = nutritionStore.progress;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Прогресс</Text>
      <TouchableOpacity style={styles.button} onPress={load}>
        <Text style={styles.buttonText}>Загрузить</Text>
      </TouchableOpacity>
      {p && (
        <View style={styles.card}>
          <Text style={styles.row}>
            Среднесуточные ккал: {p.averageDailyCalories.toFixed(0)}
          </Text>
          <Text style={styles.row}>Цель: {p.targetCalories}</Text>
          <Text style={styles.row}>
            Достижение: {Math.round(p.caloriesAchievementPercentage)}%
          </Text>
          <Text style={styles.row}>Статус: {p.goalStatus}</Text>
          <Text style={styles.header}>Дни</Text>
          {p.dailyProgress.map((d) => (
            <Text key={d.date} style={styles.row}>
              {d.date}: {d.calories.toFixed(0)} ({Math.round(d.percentage)}%)
            </Text>
          ))}
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
    gap: spacing.xs,
  },
  row: {
    ...typography.body2,
    color: colors.text.primary,
  },
  header: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
});

export default ProgressTab;
