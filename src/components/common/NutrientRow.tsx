import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { formatNumber } from '../../utils/formatting';

interface NutrientRowProps {
  proteins: number;
  fats: number;
  carbohydrates: number;
  calories: number;
  showCaloriesFirst?: boolean;
  compact?: boolean;
}

const NutrientRow: React.FC<NutrientRowProps> = ({
  proteins,
  fats,
  carbohydrates,
  calories,
  showCaloriesFirst = true,
  compact = false,
}) => {
  // Only show calories if showCaloriesFirst is explicitly true
  const showCalories = showCaloriesFirst === true;
  
  return (
    <View style={styles.container}>
      {showCalories && (
        <>
          <Text style={[styles.calories, compact && styles.caloriesCompact]}>
            {formatNumber(calories, 0)} ккал
          </Text>
          <Text style={styles.separator}>•</Text>
        </>
      )}
      <Text style={[styles.macro, compact && styles.macroCompact]}>
        Б: {formatNumber(proteins, 1)}г
      </Text>
      <Text style={styles.separator}>•</Text>
      <Text style={[styles.macro, compact && styles.macroCompact]}>
        Ж: {formatNumber(fats, 1)}г
      </Text>
      <Text style={styles.separator}>•</Text>
      <Text style={[styles.macro, compact && styles.macroCompact]}>
        У: {formatNumber(carbohydrates, 1)}г
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  calories: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  caloriesCompact: {
    ...typography.body2,
  },
  macro: {
    ...typography.body2,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  macroCompact: {
    ...typography.caption,
  },
  separator: {
    ...typography.body2,
    color: colors.text.disabled,
    marginRight: spacing.xs,
  },
});

export default NutrientRow;

