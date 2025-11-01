import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { WeightEntry } from '../../types/api.types';
import {
  formatDateTime,
  formatWeightKg,
  formatWeightChange,
} from '../../utils/formatting';
import { formatWeightTrend } from '../../utils/calculations';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface WeightHistoryItemProps {
  entry: WeightEntry;
  change: number | null;
  onDelete?: (id: number) => void;
}

const WeightHistoryItem: React.FC<WeightHistoryItemProps> = ({
  entry,
  change,
  onDelete,
}) => {
  const handleDelete = () => {
    Alert.alert(
      'Удалить запись',
      'Вы уверены, что хотите удалить эту запись веса?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => onDelete?.(entry.id),
        },
      ]
    );
  };

  return (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{formatDateTime(entry.recordedAt)}</Text>
        <View style={styles.headerRight}>
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
          {onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="delete-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.entryWeight}>{formatWeightKg(entry.weight)}</Text>

      {entry.notes && <Text style={styles.entryNotes}>{entry.notes}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  entryCard: {
    backgroundColor: colors.background.paper,
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
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  deleteButton: {
    padding: spacing.xs,
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
});

export default WeightHistoryItem;

