import { makeAutoObservable, runInAction } from 'mobx';
import { friendsService } from '../api/services/friends.service';
import type RootStore from './RootStore';
import type {
  Friend,
  FriendRequest,
  FriendPermissionUpdate,
} from '../types/friends.types';
import { withAsync } from '../utils/storeUtils';

class FriendsStore {
  rootStore: RootStore;

  // State
  friends: Friend[] = [];
  incomingRequests: FriendRequest[] = [];
  outgoingRequests: FriendRequest[] = [];
  selectedFriend: Friend | null = null;
  loading: boolean = false;
  error: string | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // Actions
  async loadFriends() {
    await withAsync(
      this,
      async () => {
        const response = await friendsService.getFriends();
        runInAction(() => {
          this.friends = response.data || [];
        });
      },
      'Ошибка загрузки списка друзей'
    );
  }

  async loadIncomingRequests() {
    await withAsync(
      this,
      async () => {
        const response = await friendsService.getIncomingRequests();
        runInAction(() => {
          this.incomingRequests = response.data || [];
        });
      },
      'Ошибка загрузки входящих запросов'
    );
  }

  async loadOutgoingRequests() {
    await withAsync(
      this,
      async () => {
        const response = await friendsService.getOutgoingRequests();
        runInAction(() => {
          this.outgoingRequests = response.data || [];
        });
      },
      'Ошибка загрузки исходящих запросов'
    );
  }

  async sendFriendRequest(targetUserEmail: string) {
    await withAsync(
      this,
      async () => {
        await friendsService.sendFriendRequest({ targetUserEmail });
        // Reload outgoing requests after sending
        await this.loadOutgoingRequests();
      },
      'Ошибка отправки запроса в друзья'
    );
  }

  async acceptRequest(requestId: number) {
    await withAsync(
      this,
      async () => {
        await friendsService.acceptFriendRequest(requestId);
        // Reload friends and requests after accepting
        await Promise.all([
          this.loadFriends(),
          this.loadIncomingRequests(),
        ]);
      },
      'Ошибка принятия запроса'
    );
  }

  async declineRequest(requestId: number) {
    await withAsync(
      this,
      async () => {
        await friendsService.declineFriendRequest(requestId);
        // Reload incoming requests after declining
        await this.loadIncomingRequests();
      },
      'Ошибка отклонения запроса'
    );
  }

  async cancelRequest(requestId: number) {
    await withAsync(
      this,
      async () => {
        await friendsService.cancelFriendRequest(requestId);
        // Reload outgoing requests after canceling
        await this.loadOutgoingRequests();
      },
      'Ошибка отмены запроса'
    );
  }

  async removeFriend(friendId: number) {
    await withAsync(
      this,
      async () => {
        await friendsService.removeFriend(friendId);
        // Clear selected friend if it was removed
        if (this.selectedFriend?.friendId === friendId) {
          runInAction(() => {
            this.selectedFriend = null;
          });
        }
        // Reload friends after removing
        await this.loadFriends();
      },
      'Ошибка удаления друга'
    );
  }

  selectFriend(friend: Friend | null) {
    this.selectedFriend = friend;
  }

  async updatePermissions(
    friendId: number,
    permissions: FriendPermissionUpdate
  ) {
    await withAsync(
      this,
      async () => {
        await friendsService.updateFriendPermissions(friendId, permissions);
        // Reload friends to get updated permissions
        await this.loadFriends();
        // Update selected friend if it's the one being updated
        if (this.selectedFriend?.friendId === friendId) {
          const updatedFriend = this.friends.find(
            (f) => f.friendId === friendId
          );
          if (updatedFriend) {
            runInAction(() => {
              this.selectedFriend = updatedFriend;
            });
          }
        }
      },
      'Ошибка обновления прав доступа'
    );
  }

  reset() {
    this.friends = [];
    this.incomingRequests = [];
    this.outgoingRequests = [];
    this.selectedFriend = null;
    this.loading = false;
    this.error = null;
  }
}

export default FriendsStore;

