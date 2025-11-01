import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Text,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation.types';
import type { WeightEntry } from '../../types/api.types';
import { useStores } from '../../stores';
import { colors, spacing } from '../../theme';
import Header from '../../components/common/Header';
import Loading from '../../components/common/Loading';
import WeightEntryModal from '../../components/weight/WeightEntryModal';
import WeightStats from '../../components/weight/WeightStats';
import WeightProgress from '../../components/weight/WeightProgress';
import WeightChart from '../../components/weight/WeightChart';
import WeightHistoryItem from '../../components/weight/WeightHistoryItem';

type WeightScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Weight'
>;

const WeightScreen: React.FC = observer(() => {
  const navigation = useNavigation<WeightScreenNavigationProp>();
  const { weightStore, profileStore, uiStore } = useStores();
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await weightStore.refreshAll(selectedPeriod);
  };

  const handleRefresh = async () => {
    await loadData();
  };

  const handlePeriodChange = (days: number) => {
    setSelectedPeriod(days);
    weightStore.fetchStats(days);
    // Загружаем больше данных для графика
    if (days > 0) {
      weightStore.fetchHistory(0, 100, true);
    }
  };

  const handleLoadMore = () => {
    weightStore.loadMore();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddWeight = () => {
    setShowEntryModal(true);
  };

  const handleEntrySuccess = () => {
    loadData();
  };

  if (weightStore.loading && weightStore.history.length === 0) {
    return <Loading message="Загрузка данных..." />;
  }

  const profile = profileStore.profile;
  const hasGoal = profile?.targetWeightType !== 'SAVE';

  // Функция для фильтрации данных графика по периоду
  const getFilteredDataForChart = () => {
    if (selectedPeriod === 0 || !weightStore.history.length) {
      return weightStore.history;
    }

    const now = new Date();
    const cutoffDate = new Date(now.getTime() - selectedPeriod * 24 * 60 * 60 * 1000);

    return weightStore.history.filter(
      (entry) => new Date(entry.recordedAt) >= cutoffDate
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Statistics */}
      <WeightStats stats={weightStore.stats} loading={weightStore.loading} />

      {/* Progress to goal */}
      {hasGoal && profile && weightStore.stats && (
        <WeightProgress
          stats={weightStore.stats}
          targetWeight={profile.targetWeight}
          targetWeightType={profile.targetWeightType}
          startWeight={profile.targetWeight}
        />
      )}

      {/* Chart */}
      <WeightChart
        data={getFilteredDataForChart()}
        targetWeight={hasGoal && profile ? profile.targetWeight : undefined}
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
      />

      {/* History Title */}
      <Text style={styles.historyTitle}>История взвешиваний</Text>
    </View>
  );

  const handleDeleteEntry = async (id: number) => {
    try {
      await weightStore.deleteEntry(id);
      uiStore.showSnackbar('Запись удалена', 'success');
    } catch (error) {
      uiStore.showSnackbar(
        weightStore.error || 'Не удалось удалить запись',
        'error'
      );
    }
  };

  const renderItem = ({ item, index }: { item: WeightEntry; index: number }) => {
    const prevWeight =
      index < weightStore.history.length - 1
        ? weightStore.history[index + 1].weight
        : null;
    const change = prevWeight ? item.weight - prevWeight : null;

    return (
      <WeightHistoryItem
        entry={item}
        change={change}
        onDelete={handleDeleteEntry}
      />
    );
  };

  const renderEmpty = () => {
    if (weightStore.loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>История пуста</Text>
        <Text style={styles.emptySubtext}>Начните записывать свой вес</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!weightStore.hasMore || !weightStore.loading) return null;

    return (
      <View style={styles.footer}>
        <Text style={styles.footerText}>Загрузка...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Отслеживание веса"
        showBackButton
        onBackPress={handleBack}
        rightComponent={
          <TouchableOpacity onPress={handleAddWeight}>
            <Text style={styles.addButton}>+</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={weightStore.history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={weightStore.loading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      {/* Entry Modal */}
      <WeightEntryModal
        visible={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onSuccess={handleEntrySuccess}
      />
    </View>
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
  headerContent: {
    marginBottom: spacing.md,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  addButton: {
    fontSize: 32,
    color: colors.primary,
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  footer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

export default WeightScreen;

