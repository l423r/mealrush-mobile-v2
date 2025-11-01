import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import type { WeightStats as WeightStatsType } from '../../types/api.types';
import {
  formatWeightKg,
  formatWeightChange,
  formatWeeklyRate,
} from '../../utils/formatting';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';

interface WeightStatsProps {
  stats: WeightStatsType | null;
  loading?: boolean;
}

const WeightStats: React.FC<WeightStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!stats || stats.recordCount === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Нет данных</Text>
      </View>
    );
  }

  const isLosingWeight = stats.totalChange < 0;
  const changeColor = isLosingWeight ? colors.success : colors.error;
  
  // Если все записи в один день, показываем специальное сообщение
  const isSameDay = stats.periodDays === 0 && stats.recordCount > 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Статистика за период</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Текущий вес</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {formatWeightKg(stats.currentWeight)}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Начальный вес</Text>
          <Text style={styles.statValue}>
            {formatWeightKg(stats.startWeight)}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Изменение</Text>
          <Text style={[styles.statValue, { color: changeColor }]}>
            {formatWeightChange(stats.totalChange)}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Средний темп</Text>
          <Text style={[styles.statValue, { color: changeColor }]}>
            {isSameDay ? '—' : formatWeeklyRate(stats.averageWeeklyChange)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isSameDay
            ? `В один день • Записей: ${stats.recordCount}`
            : `Период: ${stats.periodDays} ${getDaysWord(stats.periodDays)} • Записей: ${stats.recordCount}`}
        </Text>
      </View>
    </View>
  );
};

const getDaysWord = (days: number): string => {
  if (days % 10 === 1 && days % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100))
    return 'дня';
  return 'дней';
};

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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statItem: {
    width: '48%',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h5,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  emptyText: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default WeightStats;

