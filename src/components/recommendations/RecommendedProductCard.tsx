import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import type { ProductResponse } from '../../types/api.types';

interface RecommendedProductCardProps {
  product: ProductResponse;
  onPress: () => void;
  onAddToMeal?: () => void;
  showAddButton?: boolean;
}

const RecommendedProductCard: React.FC<RecommendedProductCardProps> = ({
  product,
  onPress,
  onAddToMeal,
  showAddButton = false,
}) => {
  const getCategoryIcon = (categoryId?: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      dairy: 'water-outline',
      meat: 'restaurant-outline',
      vegetables: 'leaf-outline',
      fruits: 'nutrition-outline',
      grains: 'basket-outline',
      seafood: 'water-outline',
      snacks: 'fast-food-outline',
      beverages: 'cafe-outline',
    };
    return icons[categoryId || ''] || 'restaurant-outline';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={getCategoryIcon(product.productCategoryId)}
          size={24}
          color={colors.text.primary}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.macros}>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Б</Text>
            <Text style={styles.macroValue}>{product.proteins}</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Ж</Text>
            <Text style={styles.macroValue}>{product.fats}</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>У</Text>
            <Text style={styles.macroValue}>{product.carbohydrates}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.calories}>{Math.round(product.calories)} ккал</Text>
        </View>
      </View>

      {showAddButton && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={(e) => {
            e.stopPropagation();
            onAddToMeal?.();
          }}
        >
          <Text style={styles.addButtonIcon}>+</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  macros: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  macroLabel: {
    ...typography.caption,
    color: colors.text.hint,
    marginRight: 2,
  },
  macroValue: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.xs,
  },
  calories: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    ...shadows.md,
  },
  addButtonIcon: {
    fontSize: 24,
    color: colors.background.paper,
    fontWeight: '600',
  },
});

export default RecommendedProductCard;

