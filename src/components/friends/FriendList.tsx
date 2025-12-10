import React from 'react';
import { FlatList, StyleSheet, RefreshControl, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import FriendCard from './FriendCard';
import EmptyFriendsState from './EmptyFriendsState';
import Button from '../common/Button';
import type { Friend } from '../../types/friends.types';

interface FriendListProps {
  friends: Friend[];
  loading?: boolean;
  onRefresh?: () => void;
  onFriendPress?: (friend: Friend) => void;
  onFriendSettingsPress?: (friend: Friend) => void;
  onAddFriend?: () => void;
}

const FriendList: React.FC<FriendListProps> = observer(({
  friends,
  loading = false,
  onRefresh,
  onFriendPress,
  onFriendSettingsPress,
  onAddFriend,
}) => {
  const { colors } = useTheme();

  if (friends.length === 0 && !loading) {
    return <EmptyFriendsState onAddFriend={onAddFriend} />;
  }

  const renderHeader = () => {
    if (!onAddFriend) return null;
    return (
      <View style={styles.headerContainer}>
        <Button
          title="Добавить друга"
          onPress={onAddFriend}
          variant="primary"
          size="medium"
          style={styles.addButton}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={friends}
      keyExtractor={(item) => item.friendId.toString()}
      ListHeaderComponent={renderHeader}
      renderItem={({ item }) => (
        <FriendCard
          friend={item}
          onPress={onFriendPress}
          onSettingsPress={onFriendSettingsPress}
        />
      )}
      contentContainerStyle={[
        styles.contentContainer,
        friends.length === 0 && styles.emptyContainer,
      ]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      ListEmptyComponent={
        loading ? null : <EmptyFriendsState onAddFriend={onAddFriend} />
      }
    />
  );
});

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  addButton: {
    width: '100%',
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
  },
});

export default FriendList;

