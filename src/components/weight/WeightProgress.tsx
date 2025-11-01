import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { WeightStats } from '../../types/api.types';
import type { TargetWeightType } from '../../types/api.types';
import {
  calculateWeightProgress,
  calculateWeeksToGoal,
  calculateGoalDate,
  isWeightChangeOnTrack,
} from '../../utils/calculations';
import { formatDate, formatWeightKg } from '../../utils/formatting';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';

interface WeightProgressProps {
  stats: WeightStats | null;
  targetWeight: number;
  targetWeightType: TargetWeightType;
  startWeight: number;
}

const WeightProgress: React.FC<WeightProgressProps> = ({
  stats,
  targetWeight,
  targetWeightType,
  startWeight,
}) => {
  if (!stats || targetWeightType === 'SAVE') {
    return null;
  }

  const currentWeight = stats.currentWeight;
  const progress = calculateWeightProgress(
    currentWeight,
    targetWeight,
    startWeight
  );
  const remaining = Math.abs(currentWeight - targetWeight);

  const weeksToGoal = calculateWeeksToGoal(
    currentWeight,
    targetWeight,
    stats.averageWeeklyChange
  );

  const isOnTrack = isWeightChangeOnTrack(
    stats.averageWeeklyChange,
    targetWeightType
  );

  const getStatusMessage = (): {
    text: string;
    color: string;
    icon: string;
  } => {
    // Если все записи в один день
    if (stats.periodDays === 0) {
      return {
        text: 'Продолжайте записывать вес для расчета прогноза',
        color: colors.info,
        icon: '📊',
      };
    }

    if (Math.abs(stats.averageWeeklyChange) < 0.1) {
      return {
        text: 'Вес стабилен, прогресс медленный',
        color: colors.warning,
        icon: '➡️',
      };
    }

    if (!isOnTrack) {
      if (targetWeightType === 'LOSE') {
        return {
          text: 'Вы набираете вес, пересмотрите план',
          color: colors.error,
          icon: '⚠️',
        };
      } else {
        return {
          text: 'Вы теряете вес, пересмотрите план',
          color: colors.error,
          icon: '⚠️',
        };
      }
    }

    if (weeksToGoal && weeksToGoal > 0) {
      const goalDate = calculateGoalDate(weeksToGoal);
      const weeksRounded = Math.round(weeksToGoal);
      return {
        text: `Цель будет достигнута ~${formatDate(goalDate, 'd MMMM yyyy')} (через ${weeksRounded} ${getWeeksWord(weeksRounded)})`,
        color: colors.success,
        icon: '🎯',
      };
    }

    return {
      text: 'Продолжайте в том же духе!',
      color: colors.success,
      icon: '✨',
    };
  };

  const status = getStatusMessage();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Прогресс к цели {status.icon}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: status.color,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Текущий:</Text>
          <Text style={styles.detailValue}>
            {formatWeightKg(currentWeight)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Целевой:</Text>
          <Text style={styles.detailValue}>{formatWeightKg(targetWeight)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Осталось:</Text>
          <Text style={[styles.detailValue, { color: status.color }]}>
            {formatWeightKg(remaining)}
          </Text>
        </View>
      </View>

      <View style={[styles.statusCard, { backgroundColor: status.color + '15' }]}>
        <Text style={[styles.statusText, { color: status.color }]}>
          {status.text}
        </Text>
      </View>
    </View>
  );
};

const getWeeksWord = (weeks: number): string => {
  if (weeks % 10 === 1 && weeks % 100 !== 11) return 'неделю';
  if ([2, 3, 4].includes(weeks % 10) && ![12, 13, 14].includes(weeks % 100))
    return 'недели';
  return 'недель';
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h5,
    color: colors.text.primary,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 16,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.md,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  details: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
  },
  statusCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  statusText: {
    ...typography.body2,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default WeightProgress;

