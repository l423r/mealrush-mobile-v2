import { apiClient } from '../axios.config';
import { ApiRoutes } from '../apiRoutes';
import type {
  UserProfile,
  UserProfileCreate,
  UserProfileUpdate,
} from '../../types/api.types';

export const profileService = {
  createProfile: (profileData: UserProfileCreate) =>
    apiClient.post<UserProfile>(ApiRoutes.UserProfile, profileData),

  getProfile: () => apiClient.get<UserProfile>(ApiRoutes.UserProfile),

  updateProfile: (profileData: UserProfileUpdate) =>
    apiClient.put<UserProfile>(ApiRoutes.UserProfile, profileData),

  deleteProfile: () => apiClient.delete(ApiRoutes.UserProfile),
};
