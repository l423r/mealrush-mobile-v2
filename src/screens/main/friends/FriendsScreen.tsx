import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../../types/navigation.types';
import { useStores } from '../../../stores';
import { spacing } from '../../../theme';
import { useTheme } from '../../../hooks/useTheme';
import Header from '../../../components/common/Header';
import Loading from '../../../components/common/Loading';
import FriendList from '../../../components/friends/FriendList';
import AddFriendDialog from '../../../components/friends/AddFriendDialog';
import { useAlert } from '../../../hooks/useAlert';
import AlertDialog from '../../../components/common/AlertDialog';
import { Ionicons } from '@expo/vector-icons';

type FriendsScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Friends'
>;

const FriendsScreen: React.FC = observer(() => {
  const navigation = useNavigation<FriendsScreenNavigationProp>();
  const { friendsStore } = useStores();
  const { colors } = useTheme();
  const { alertState, showAlert, hideAlert } = useAlert();
  const [showAddFriendDialog, setShowAddFriendDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      friendsStore.loadFriends(),
      friendsStore.loadIncomingRequests(),
      friendsStore.loadOutgoingRequests(),
    ]);
  };

  const handleAddFriend = () => {
    setShowAddFriendDialog(true);
  };

  const handleSendFriendRequest = async (email: string) => {
    try {
      await friendsStore.sendFriendRequest(email);
      // Reload outgoing requests to show the new one
      await friendsStore.loadOutgoingRequests();
      // Navigate to requests screen and show outgoing tab to display the sent request
      navigation.navigate('FriendRequests', { initialTab: 'outgoing' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Не удалось отправить запрос в друзья';
      showAlert('Ошибка', errorMessage, 'error');
      throw error; // Re-throw to let dialog handle it
    }
  };

  const handleFriendPress = (friend: any) => {
    navigation.navigate('FriendSettings', { friendId: friend.friendId });
  };

  const handleFriendSettingsPress = (friend: any) => {
    navigation.navigate('FriendSettings', { friendId: friend.friendId });
  };

  const rightComponent = (
    <TouchableOpacity
      onPress={() => navigation.navigate('FriendRequests')}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons
        name="person-add-outline"
        size={24}
        color={colors.primary}
      />
      {friendsStore.incomingRequests.length > 0 && (
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.error },
          ]}
        >
          {/* Badge will be styled */}
        </View>
      )}
    </TouchableOpacity>
  );

  if (friendsStore.loading && friendsStore.friends.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.default }]}>
        <Header
          title="Друзья"
          showBackButton
          rightComponent={rightComponent}
        />
        <Loading message="Загрузка друзей..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <Header
        title="Друзья"
        showBackButton
        rightComponent={rightComponent}
      />
      <FriendList
        friends={friendsStore.friends}
        loading={friendsStore.loading}
        onRefresh={loadData}
        onFriendPress={handleFriendPress}
        onFriendSettingsPress={handleFriendSettingsPress}
        onAddFriend={handleAddFriend}
      />

      <AddFriendDialog
        visible={showAddFriendDialog}
        onClose={() => setShowAddFriendDialog(false)}
        onSendRequest={handleSendFriendRequest}
        loading={friendsStore.loading}
      />

      <AlertDialog
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        showCancel={alertState.showCancel}
        onConfirm={alertState.onConfirm}
        onCancel={alertState.onCancel}
        onDismiss={hideAlert}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default FriendsScreen;

