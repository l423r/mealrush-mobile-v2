import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import type { TopProductItem } from '../../types/analytics.types';

interface TopProductsCardProps {
  items: TopProductItem[];
  onShowAll?: () => void;
}

export const TopProductsCard: React.FC<TopProductsCardProps> = ({
  items,
  onShowAll,
}) => {
  const top3 = items.slice(0, 3);
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Топ продукты</Text>
        {onShowAll && (
          <TouchableOpacity onPress={onShowAll}>
            <Text style={styles.link}>Все</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={top3}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.cal}>{formatNumber(item.calories)} ккал</Text>
          </View>
        )}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  link: {
    ...typography.button,
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  name: {
    ...typography.body1,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  cal: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  sep: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: spacing.xs,
  },
});

export default TopProductsCard;
