import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface ProgressCardProps {
  averageDailyCalories?: number;
  goalCalories?: number;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  averageDailyCalories,
  goalCalories,
}) => {
  const current = Math.round(averageDailyCalories || 0);
  const goal = Math.round(goalCalories || 0);
  const pct = goal > 0 ? Math.round((current / goal) * 100) : 0;
  const status = pct < 90 ? 'BEHIND' : pct <= 110 ? 'ON TRACK' : 'AHEAD';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Прогресс к цели</Text>
      <Text style={styles.text}>
        Среднесуточные ккал: {formatNumber(current)}
      </Text>
      {!!goal && <Text style={styles.text}>Цель: {formatNumber(goal)}</Text>}
      <View style={styles.progressBarBg}>
        <View
          style={[styles.progressBarFg, { width: `${Math.min(pct, 150)}%` }]}
        />
      </View>
      <Text style={styles.status}>
        Достижение: {pct}% · Статус: {status}
      </Text>
    </View>
  );
};

function formatNumber(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  text: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  progressBarFg: {
    height: 10,
    backgroundColor: colors.primary,
  },
  status: {
    ...typography.body2,
    color: colors.text.primary,
  },
});

export default ProgressCard;
