import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Text,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import AnalyticsStore from '../../stores/AnalyticsStore';
import { AnalyticsHeader } from '../../components/analytics/AnalyticsHeader';
import type { AnalyticsPeriod, TrendMetric } from '../../types/analytics.types';
import { colors, spacing, componentSpacing, typography } from '../../theme';
import AnalyticsTrendChart from '../../components/analytics/AnalyticsTrendChart';
import AnalyticsDistribution from '../../components/analytics/AnalyticsDistribution';

type TabKey = 'trend' | 'distributions';

const AnalyticsScreen: React.FC = observer(() => {
  const store = useMemo(() => new AnalyticsStore(), []);
  const [activeTab, setActiveTab] = useState<TabKey>('trend');
  const [metric, setMetric] = useState<TrendMetric>('calories');

  useEffect(() => {
    store.fetchAllForPeriod();
  }, [store, store.period]);

  const onRefresh = async () => {
    await store.fetchAllForPeriod(true);
  };

  const onChangePeriod = (next: AnalyticsPeriod) => {
    store.setPeriod(next);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={store.loading} onRefresh={onRefresh} />
      }
    >
      <AnalyticsHeader
        period={store.period}
        onChangePeriod={onChangePeriod}
        kpi={store.summaryKpi}
      />

      <View style={styles.tabbar}>
        <TabButton
          label="Тренд"
          active={activeTab === 'trend'}
          onPress={() => setActiveTab('trend')}
        />
        <TabButton
          label="Распределения"
          active={activeTab === 'distributions'}
          onPress={() => setActiveTab('distributions')}
        />
      </View>

      <View style={styles.section}>
        {activeTab === 'trend' ? (
          store.trend.length === 0 ? (
            <Text style={styles.placeholder}>Недостаточно данных за период</Text>
          ) : (
            <AnalyticsTrendChart
              metric={metric}
              onMetricChange={setMetric}
              series={store.getTrendSeries(metric)}
            />
          )
        ) : store.distribution == null ? (
          <Text style={styles.placeholder}>Недостаточно данных за период</Text>
        ) : (
          <AnalyticsDistribution data={store.distribution} />
        )}
      </View>
    </ScrollView>
  );
});

const TabButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, active && styles.tabButtonActive]}
    onPress={onPress}
  >
    <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  tabbar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: componentSpacing.screenHorizontal,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  tabButton: {
    flex: 1,
    backgroundColor: colors.background.paper,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  tabButtonTextActive: {
    color: colors.white,
  },
  section: {
    backgroundColor: colors.background.paper,
    marginHorizontal: componentSpacing.screenHorizontal,
    marginBottom: componentSpacing.sectionSpacing,
    borderRadius: 12,
    padding: spacing.lg,
  },
  placeholder: {
    ...typography.body1,
    color: colors.text.secondary,
  },
});

export default AnalyticsScreen;
