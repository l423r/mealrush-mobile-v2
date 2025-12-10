import { apiClient } from '../axios.config';
import { ApiRoutes } from '../apiRoutes';
import type {
  Friend,
  FriendRequest,
  FriendRequestCreate,
  FriendPermission,
  FriendPermissionUpdate,
} from '../../types/friends.types';

export const friendsService = {
  // Get list of friends
  getFriends: () => apiClient.get<Friend[]>(ApiRoutes.Friends.Base),

  // Send friend request
  sendFriendRequest: (data: FriendRequestCreate) =>
    apiClient.post<FriendRequest>(ApiRoutes.Friends.Requests, data),

  // Get incoming friend requests
  getIncomingRequests: () =>
    apiClient.get<FriendRequest[]>(ApiRoutes.Friends.RequestsIncoming),

  // Get outgoing friend requests
  getOutgoingRequests: () =>
    apiClient.get<FriendRequest[]>(ApiRoutes.Friends.RequestsOutgoing),

  // Accept friend request
  acceptFriendRequest: (requestId: number) =>
    apiClient.post<FriendRequest>(
      ApiRoutes.Friends.RequestAccept(requestId)
    ),

  // Decline friend request
  declineFriendRequest: (requestId: number) =>
    apiClient.post<FriendRequest>(
      ApiRoutes.Friends.RequestDecline(requestId)
    ),

  // Cancel outgoing friend request
  cancelFriendRequest: (requestId: number) =>
    apiClient.delete(ApiRoutes.Friends.Requests + `/${requestId}`),

  // Remove friend
  removeFriend: (friendId: number) =>
    apiClient.delete(`${ApiRoutes.Friends.Base}/${friendId}`),

  // Get friend permissions
  getFriendPermissions: (friendId: number) =>
    apiClient.get<FriendPermission>(
      ApiRoutes.Friends.Permissions(friendId)
    ),

  // Update friend permissions
  updateFriendPermissions: (
    friendId: number,
    permissions: FriendPermissionUpdate
  ) =>
    apiClient.put<FriendPermission>(
      ApiRoutes.Friends.Permissions(friendId),
      permissions
    ),
};

