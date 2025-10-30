import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../stores';
import { colors, spacing, typography } from '../../../theme';

const StatisticsTab: React.FC = observer(() => {
  const { nutritionStore } = useStores();
  const today = React.useMemo(() => new Date(), []);
  const start = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

  const load = () => {
    const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    const endDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    nutritionStore.loadStatistics(startDate, endDate);
  };

  const s = nutritionStore.statistics;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Статистика</Text>
      <TouchableOpacity style={styles.button} onPress={load}>
        <Text style={styles.buttonText}>Загрузить</Text>
      </TouchableOpacity>
      {s && (
        <View style={styles.card}>
          <Text style={styles.row}>Средние ккал: {s.averageCalories.toFixed(0)}</Text>
          <Text style={styles.row}>Белки: {s.averageProteins.toFixed(1)}</Text>
          <Text style={styles.row}>Жиры: {s.averageFats.toFixed(1)}</Text>
          <Text style={styles.row}>Углеводы: {s.averageCarbohydrates.toFixed(1)}</Text>
          <Text style={styles.header}>Категории</Text>
          {Object.entries(s.categoryUsageStats).map(([k, v]) => (
            <View key={k} style={styles.barRow}>
              <Text style={styles.barLabel}>{k}</Text>
              <View style={styles.barOuter}><View style={[styles.barInner, { width: `${Math.min(100, v * 10)}%` } as any]} /></View>
              <Text style={styles.barValue}>{v}</Text>
            </View>
          ))}
          <Text style={styles.header}>Топ продукты</Text>
          {s.topProducts.map((t) => (
            <Text style={styles.row} key={t.productId}>{t.productName} — {t.usageCount}</Text>
          ))}
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
            <Text style={styles.badge}>Всего приёмов: {s.totalMeals}</Text>
            <Text style={styles.badge}>Дней: {s.totalDays}</Text>
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  card: {
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: 12,
    borderColor: colors.border.light,
    borderWidth: 1,
    gap: spacing.xs,
  },
  row: {
    ...typography.body2,
    color: colors.text.primary,
  },
  header: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barLabel: {
    width: 120,
    ...typography.caption,
    color: colors.text.secondary,
  },
  barOuter: {
    flex: 1,
    height: 10,
    backgroundColor: colors.gray[200],
    borderRadius: 5,
  },
  barInner: {
    height: 10,
    backgroundColor: colors.secondary,
    borderRadius: 5,
  },
  barValue: {
    width: 30,
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'right',
  },
  badge: {
    ...typography.caption,
    color: colors.text.primary,
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
});

export default StatisticsTab;

