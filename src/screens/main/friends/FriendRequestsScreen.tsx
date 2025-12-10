import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../../types/navigation.types';
import { useStores } from '../../../stores';
import { spacing, typography, borderRadius } from '../../../theme';
import { useTheme } from '../../../hooks/useTheme';
import Header from '../../../components/common/Header';
import Loading from '../../../components/common/Loading';
import FriendRequestCard from '../../../components/friends/FriendRequestCard';
import EmptyFriendsState from '../../../components/friends/EmptyFriendsState';

type FriendRequestsScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'FriendRequests'
>;

const FriendRequestsScreen: React.FC = observer(() => {
  const navigation = useNavigation<FriendRequestsScreenNavigationProp>();
  const route = useRoute();
  const { friendsStore } = useStores();
  const { colors } = useTheme();
  const routeParams = route.params as { initialTab?: 'incoming' | 'outgoing' } | undefined;
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>(
    routeParams?.initialTab || 'incoming'
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      friendsStore.loadIncomingRequests(),
      friendsStore.loadOutgoingRequests(),
    ]);
  };

  const handleAccept = async (requestId: number) => {
    await friendsStore.acceptRequest(requestId);
    await loadData();
  };

  const handleDecline = async (requestId: number) => {
    await friendsStore.declineRequest(requestId);
    await loadData();
  };

  const handleCancel = async (requestId: number) => {
    await friendsStore.cancelRequest(requestId);
    await loadData();
  };

  const requests = activeTab === 'incoming' 
    ? friendsStore.incomingRequests 
    : friendsStore.outgoingRequests;

  const isEmpty = requests.length === 0 && !friendsStore.loading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <Header title="Запросы в друзья" showBackButton />

      <View style={styles.tabs}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('incoming')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'incoming' && styles.activeTab,
                { color: activeTab === 'incoming' ? colors.primary : colors.text.secondary },
              ]}
            >
              Входящие
              {friendsStore.incomingRequests.length > 0 && (
                <Text style={[styles.badge, { color: colors.error }]}>
                  {' '}({friendsStore.incomingRequests.length})
                </Text>
              )}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('outgoing')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'outgoing' && styles.activeTab,
                { color: activeTab === 'outgoing' ? colors.primary : colors.text.secondary },
              ]}
            >
              Исходящие
            </Text>
          </TouchableOpacity>
        </View>
        {activeTab === 'incoming' && (
          <View style={[styles.indicator, { backgroundColor: colors.primary, left: 0 }]} />
        )}
        {activeTab === 'outgoing' && (
          <View style={[styles.indicator, { backgroundColor: colors.primary, right: 0 }]} />
        )}
      </View>

      {friendsStore.loading && requests.length === 0 ? (
        <Loading message="Загрузка запросов..." />
      ) : isEmpty ? (
        <EmptyFriendsState />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <FriendRequestCard
              request={item}
              isIncoming={activeTab === 'incoming'}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onCancel={handleCancel}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={friendsStore.loading}
              onRefresh={loadData}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E8EF',
    position: 'relative',
  },
  tabContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  tabText: {
    ...typography.body1,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeTab: {
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: '50%',
    height: 2,
  },
  badge: {
    fontSize: 12,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
});

export default FriendRequestsScreen;

