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
import { spacing, componentSpacing, typography } from '../../theme';
import AnalyticsTrendChart from '../../components/analytics/AnalyticsTrendChart';
import AnalyticsDistribution from '../../components/analytics/AnalyticsDistribution';
import Header from '../../components/common/Header';
import { useStores } from '../../stores';
import { useTheme } from '../../hooks/useTheme';
import type { lightColors, darkColors } from '../../theme/colors';

type ColorsType = typeof lightColors | typeof darkColors;

type TabKey = 'trend' | 'distributions';

const AnalyticsScreen: React.FC = observer(() => {
  const { profileStore } = useStores();
  const { colors } = useTheme();
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

  // Helper to get period key for component keys
  const periodKey = useMemo(() => {
    if (typeof store.period === 'string') {
      return store.period;
    }
    return `${store.period.from}-${store.period.to}`;
  }, [store.period]);

  const dynamicStyles = createStyles(colors);

  return (
    <ScrollView
      style={dynamicStyles.container}
      refreshControl={
        <RefreshControl refreshing={store.loading} onRefresh={onRefresh} />
      }
    >
      <Header title="Сводка" />
      <AnalyticsHeader
        period={store.period}
        onChangePeriod={onChangePeriod}
        kpi={store.summaryKpi}
        targetCalories={profileStore.profile?.dayLimitCal}
      />

      <View style={dynamicStyles.tabbar}>
        <TabButton
          label="Тренд"
          active={activeTab === 'trend'}
          onPress={() => setActiveTab('trend')}
          colors={colors}
          styles={dynamicStyles}
        />
        <TabButton
          label="Распределения"
          active={activeTab === 'distributions'}
          onPress={() => setActiveTab('distributions')}
          colors={colors}
          styles={dynamicStyles}
        />
      </View>

      <View style={dynamicStyles.section}>
        {store.loading ? (
          <Text style={dynamicStyles.placeholder}>Загрузка данных...</Text>
        ) : activeTab === 'trend' ? (
          !store.trend || store.trend.length === 0 ? (
            <Text style={dynamicStyles.placeholder}>Недостаточно данных за период</Text>
          ) : (
            <AnalyticsTrendChart
              key={`trend-${periodKey}-${metric}`}
              metric={metric}
              onMetricChange={setMetric}
              series={store.getTrendSeries(metric)}
            />
          )
        ) : store.distribution == null ? (
          <Text style={dynamicStyles.placeholder}>Недостаточно данных за период</Text>
        ) : (
          <AnalyticsDistribution
            key={`distribution-${periodKey}`}
            data={store.distribution}
          />
        )}
      </View>
    </ScrollView>
  );
});

const TabButton: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ColorsType;
  styles: ReturnType<typeof createStyles>;
}> = ({ label, active, onPress, colors, styles }) => (
  <TouchableOpacity
    style={[styles.tabButton, active && { backgroundColor: colors.primary }]}
    onPress={onPress}
  >
    <Text style={[{ ...typography.button }, { color: active ? colors.white : colors.text.secondary }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const createStyles = (colors: ColorsType) => StyleSheet.create({
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
