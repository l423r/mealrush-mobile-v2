import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../stores';
import { colors, spacing, typography } from '../../../theme';
import SummaryTab from './SummaryTab';
import TrendTab from './TrendTab';
import StatisticsTab from './StatisticsTab';
import ProgressTab from './ProgressTab';

const AnalyticsScreen: React.FC = observer(() => {
  const { nutritionStore } = useStores();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Аналитика</Text>
      {/* В следующих задачах будут добавлены вкладки: Сводка / Тренд / Статистика / Прогресс */}
      <SummaryTab />
      <TrendTab />
      <StatisticsTab />
      <ProgressTab />
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: 12,
    borderColor: colors.border.light,
    borderWidth: 1,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  cardText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
});

export default AnalyticsScreen;

