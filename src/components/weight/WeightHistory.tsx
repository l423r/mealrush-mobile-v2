import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import type { WeightEntry } from '../../types/api.types';
import { formatDateTime, formatWeightKg, formatWeightChange } from '../../utils/formatting';
import { formatWeightTrend } from '../../utils/calculations';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';

interface WeightHistoryProps {
  entries: WeightEntry[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const WeightHistory: React.FC<WeightHistoryProps> = ({
  entries,
  loading,
  refreshing,
  onRefresh,
  onLoadMore,
  hasMore,
}) => {
  const renderEntry = ({ item, index }: { item: WeightEntry; index: number }) => {
    const prevWeight = index < entries.length - 1 ? entries[index + 1].weight : null;
    const change = prevWeight ? item.weight - prevWeight : null;

    return (
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryDate}>{formatDateTime(item.recordedAt)}</Text>
          {change !== null && (
            <View style={styles.changeContainer}>
              <Text
                style={[
                  styles.changeText,
                  { color: change < 0 ? colors.success : colors.error },
                ]}
              >
                {formatWeightTrend(change)} {formatWeightChange(change)}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.entryWeight}>{formatWeightKg(item.weight)}</Text>

        {item.notes && <Text style={styles.entryNotes}>{item.notes}</Text>}
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore || !loading) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>История пуста</Text>
        <Text style={styles.emptySubtext}>Начните записывать свой вес</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>История взвешиваний</Text>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEntry}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing || false}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={entries.length === 0 ? styles.emptyList : undefined}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 300,
    ...shadows.md,
  },
  title: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  entryCard: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  entryDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  entryWeight: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  entryNotes: {
    ...typography.body2,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  footer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyText: {
    ...typography.h5,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body2,
    color: colors.text.secondary,
  },
});

export default WeightHistory;

