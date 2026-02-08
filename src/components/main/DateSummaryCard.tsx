import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius, shadows } from '../../theme';
import { formatDate } from '../../utils/formatting';
import { useTheme } from '../../hooks/useTheme';
import { observer } from 'mobx-react-lite';
import type { Meal } from '../../types/api.types';

interface DateSummaryCardProps {
  date: Date;
  meals: Meal[];
  totalCalories: number;
  totalProteins: number;
  totalFats: number;
  totalCarbohydrates: number;
  onPress?: () => void;
  testID?: string;
}

const DateSummaryCard: React.FC<DateSummaryCardProps> = ({
  date,
  meals,
  totalCalories,
  totalProteins,
  totalFats,
  totalCarbohydrates,
  onPress,
  testID,
}) => {
  const { colors } = useTheme();
  const mealCount = meals.length;
  const isToday = date.toDateString() === new Date().toDateString();

  const CardContent = (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background.paper, borderColor: colors.border.light },
        isToday && { borderColor: colors.primary, borderWidth: 2 },
      ]}
      testID={testID}
      accessibilityLabel={`Сводка за ${formatDate(date, 'dd MMMM yyyy')}, ${mealCount} приемов пищи, ${Math.round(totalCalories)} калорий`}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Text style={[styles.dateText, { color: colors.text.primary }]}>
            {formatDate(date, 'dd MMMM yyyy')}
          </Text>
          {isToday && (
            <View style={[styles.todayBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.todayBadgeText, { color: colors.white }]}>Сегодня</Text>
            </View>
          )}
        </View>
        <View style={[styles.mealCountBadge, { backgroundColor: colors.background.light }]}>
          <Ionicons name="restaurant-outline" size={16} color={colors.text.secondary} />
          <Text style={[styles.mealCountText, { color: colors.text.secondary }]}>
            {mealCount}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Calories */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {Math.round(totalCalories)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>ккал</Text>
        </View>

        {/* Proteins */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.secondary }]}>
            {Math.round(totalProteins)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Б</Text>
        </View>

        {/* Fats */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.accent.orange }]}>
            {Math.round(totalFats)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Ж</Text>
        </View>

        {/* Carbohydrates */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.accent.teal }]}>
            {Math.round(totalCarbohydrates)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>У</Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        testID={testID ? `${testID}_button` : undefined}
        accessibilityLabel={`Сводка за ${formatDate(date, 'dd MMMM yyyy')}`}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    ...typography.h5,
    fontWeight: '600',
  },
  todayBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  todayBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  mealCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  mealCountText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h6,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    fontSize: 11,
  },
});

export default observer(DateSummaryCard);
