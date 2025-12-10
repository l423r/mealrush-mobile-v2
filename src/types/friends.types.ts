// Friends types

export type FriendRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface FriendPermission {
  ownerId: number;
  friendId: number;
  canViewMeals: boolean;
  canAddMeals: boolean;
  canViewAnalytics: boolean;
  updatedAt: string;
}

export interface Friend {
  friendId: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  friendsSince: string;
  permissions: FriendPermission;
}

export interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: FriendRequestStatus;
  createdAt: string;
  senderName?: string;
  senderEmail?: string;
  senderAvatarUrl?: string | null;
  receiverName?: string;
  receiverEmail?: string;
  receiverAvatarUrl?: string | null;
}

export interface FriendRequestCreate {
  targetUserEmail: string;
}

export interface FriendPermissionUpdate {
  canViewMeals: boolean;
  canAddMeals: boolean;
  canViewAnalytics: boolean;
}

