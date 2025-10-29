import { apiClient } from '../axios.config';
import { MY_FOOD_ENDPOINTS } from '../endpoints';
import { UserProfile, UserProfileCreate, UserProfileUpdate } from '../../types/api.types';

export const profileService = {
  createProfile: (profileData: UserProfileCreate) =>
    apiClient.post<UserProfile>(MY_FOOD_ENDPOINTS.USER_PROFILE, profileData),
  
  getProfile: () =>
    apiClient.get<UserProfile>(MY_FOOD_ENDPOINTS.USER_PROFILE),
  
  updateProfile: (profileData: UserProfileUpdate) =>
    apiClient.put<UserProfile>(MY_FOOD_ENDPOINTS.USER_PROFILE, profileData),
};