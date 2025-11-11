import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { formatNumber } from '../../utils/formatting';

interface CompactSummaryProps {
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
  variant?: 'default' | 'large';
}

const CompactSummary: React.FC<CompactSummaryProps> = ({
  calories,
  proteins,
  fats,
  carbohydrates,
  variant = 'default',
}) => {
  const isLarge = variant === 'large';

  return (
    <View style={styles.container}>
      <Text style={[styles.calories, isLarge && styles.caloriesLarge]}>
        {formatNumber(calories, 0)} ккал
      </Text>
      <Text style={styles.separator}>|</Text>
      <Text style={[styles.macro, isLarge && styles.macroLarge]}>
        Б: {formatNumber(proteins, 1)}г
      </Text>
      <Text style={styles.separator}>|</Text>
      <Text style={[styles.macro, isLarge && styles.macroLarge]}>
        Ж: {formatNumber(fats, 1)}г
      </Text>
      <Text style={styles.separator}>|</Text>
      <Text style={[styles.macro, isLarge && styles.macroLarge]}>
        У: {formatNumber(carbohydrates, 1)}г
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calories: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  caloriesLarge: {
    ...typography.h4,
  },
  macro: {
    ...typography.body2,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  macroLarge: {
    ...typography.body2,
    fontWeight: '500',
  },
  separator: {
    ...typography.body2,
    color: colors.text.disabled,
    marginRight: spacing.xs,
  },
});

export default CompactSummary;

