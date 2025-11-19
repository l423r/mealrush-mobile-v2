import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography, spacing } from '../../theme';
import { formatNumber } from '../../utils/formatting';
import { useTheme } from '../../hooks/useTheme';
import { observer } from 'mobx-react-lite';

interface CompactSummaryProps {
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
  variant?: 'default' | 'large';
}

const CompactSummary: React.FC<CompactSummaryProps> = observer(({
  calories,
  proteins,
  fats,
  carbohydrates,
  variant = 'default',
}) => {
  const { colors } = useTheme();
  const isLarge = variant === 'large';

  return (
    <View style={styles.container}>
      <Text style={[styles.calories, { color: colors.primary }, isLarge && styles.caloriesLarge]}>
        {formatNumber(calories, 0)} ккал
      </Text>
      <Text style={[styles.separator, { color: colors.text.disabled }]}>|</Text>
      <Text style={[styles.macro, { color: colors.text.secondary }, isLarge && styles.macroLarge]}>
        Б: {formatNumber(proteins, 1)}г
      </Text>
      <Text style={[styles.separator, { color: colors.text.disabled }]}>|</Text>
      <Text style={[styles.macro, { color: colors.text.secondary }, isLarge && styles.macroLarge]}>
        Ж: {formatNumber(fats, 1)}г
      </Text>
      <Text style={[styles.separator, { color: colors.text.disabled }]}>|</Text>
      <Text style={[styles.macro, { color: colors.text.secondary }, isLarge && styles.macroLarge]}>
        У: {formatNumber(carbohydrates, 1)}г
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calories: {
    ...typography.body1,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  caloriesLarge: {
    ...typography.h4,
  },
  macro: {
    ...typography.body2,
    marginRight: spacing.xs,
  },
  macroLarge: {
    ...typography.body2,
    fontWeight: '500',
  },
  separator: {
    ...typography.body2,
    marginRight: spacing.xs,
  },
});

export default CompactSummary;

