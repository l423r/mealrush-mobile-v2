import { makeAutoObservable, runInAction } from 'mobx';
import { makePersistable } from 'mobx-persist-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileService } from '../api/services/profile.service';
import type RootStore from './RootStore';
import type {
  OnboardingStatusResponse,
  UpdateOnboardingStatusRequest,
  UserProfile,
  UserProfileCreate,
  UserProfileUpdate,
} from '../types/api.types';
import {
  calculateRecommendedCalories,
  calculateAge,
  calculateBMI,
} from '../utils/calculations';

class ProfileStore {
  rootStore: RootStore;

  // State
  profile: UserProfile | null = null;
  loading: boolean = false;
  checkingProfile: boolean = false; // Флаг проверки профиля при инициализации
  error: string | null = null;
  
  // Onboarding state
  onboardingStatus: OnboardingStatusResponse | null = null;
  onboardingLoading: boolean = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    makePersistable(this, {
      name: 'ProfileStore',
      properties: ['profile'],
      storage: AsyncStorage,
    });
  }

  // Computed
  get age(): number | null {
    if (!this.profile?.birthday) return null;
    return calculateAge(this.profile.birthday);
  }

  get bmi(): number | null {
    if (!this.profile?.weight || !this.profile?.height) return null;
    return calculateBMI(this.profile.weight, this.profile.height);
  }

  get recommendedCalories(): number | null {
    // Use recommendedCalories from API response (calculated by backend)
    // Fallback to client-side calculation only if API didn't provide it
    if (!this.profile) return null;
    
    if (this.profile.recommendedCalories != null) {
      return this.profile.recommendedCalories;
    }
    
    // Fallback: calculate locally if API didn't provide it (shouldn't happen in normal flow)
    if (!this.age) return null;
    
    return calculateRecommendedCalories(
      this.profile.weight,
      this.profile.height,
      this.age,
      this.profile.gender,
      this.profile.physicalActivityLevel,
      this.profile.targetWeightType
    );
  }

  get isProfileComplete(): boolean {
    return !!this.profile;
  }

  get needsProfileSetup(): boolean {
    return !this.profile;
  }

  // Actions
  async createProfile(profileData: UserProfileCreate) {
    this.loading = true;
    this.error = null;

    try {
      const response = await profileService.createProfile(profileData);

      runInAction(() => {
        this.profile = response.data;
        this.loading = false;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка создания профиля';
      });
      
      // 403 на POST /user-profile означает, что токен невалиден
      // Interceptor уже удалил токен, но нужно вызвать logout для обновления состояния
      if (error.response?.status === 403) {
        if (__DEV__) {
          console.log('[createProfile] 403 error - token invalid, calling logout');
        }
        // Вызываем logout асинхронно, не блокируя throw error
        this.rootStore.authStore.logout().catch((logoutError) => {
          console.error('[createProfile] Error during logout:', logoutError);
        });
      }
      
      throw error;
    }
  }

  async getProfile() {
    this.loading = true;
    this.error = null;

    try {
      const response = await profileService.getProfile();

      runInAction(() => {
        this.profile = response.data;
        this.loading = false;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error = error.response?.data?.message || 'Ошибка загрузки профиля';
      });
      throw error;
    }
  }

  async checkProfile() {
    this.checkingProfile = true;
    this.error = null;

    try {
      const response = await profileService.getProfile();

      runInAction(() => {
        this.profile = response.data;
        this.checkingProfile = false;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        // Если профиль не найден (404) или нет доступа (403), это нормально - пользователь еще не создал профиль
        if (error.response?.status === 404 || error.response?.status === 403) {
          this.profile = null;
        } else {
          console.error('Error checking profile:', error);
          this.error =
            error.response?.data?.message || 'Ошибка загрузки профиля';
        }
        this.checkingProfile = false;
      });
    }
  }

  async updateProfile(profileData: UserProfileUpdate) {
    this.loading = true;
    this.error = null;

    try {
      const response = await profileService.updateProfile(profileData);

      runInAction(() => {
        this.profile = response.data;
        this.loading = false;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.loading = false;
        this.error =
          error.response?.data?.message || 'Ошибка обновления профиля';
      });
      throw error;
    }
  }

  setProfile(profile: UserProfile | null) {
    this.profile = profile;
  }

  setError(error: string | null) {
    this.error = error;
  }

  clearError() {
    this.error = null;
  }

  reset() {
    this.profile = null;
    this.loading = false;
    this.checkingProfile = false;
    this.error = null;
    this.onboardingStatus = null;
    this.onboardingLoading = false;
  }

  // Onboarding methods

  async getOnboardingStatus() {
    this.onboardingLoading = true;
    this.error = null;

    try {
      const response = await profileService.getOnboardingStatus();

      runInAction(() => {
        this.onboardingStatus = response.data;
        this.onboardingLoading = false;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.onboardingLoading = false;
        this.error =
          error.response?.data?.message || 'Ошибка загрузки статуса онбординга';
      });
      throw error;
    }
  }

  async updateOnboardingProgress(stepId: string, completed: boolean) {
    this.onboardingLoading = true;
    this.error = null;

    try {
      const request: UpdateOnboardingStatusRequest = {
        stepId,
        completed,
      };

      const response = await profileService.updateOnboardingStatus(request);

      runInAction(() => {
        this.onboardingStatus = response.data;
        this.onboardingLoading = false;
        this.error = null;
        
        // Update profile if it exists
        if (this.profile) {
          this.profile.onboardingCompleted = response.data.onboardingCompleted;
          this.profile.onboardingStepsCompleted = response.data.stepsCompleted;
          // Note: onboardingSkipped field exists in API but is no longer used (skip functionality removed)
          this.profile.onboardingStartedAt = response.data.onboardingStartedAt || undefined;
          this.profile.onboardingCompletedAt = response.data.onboardingCompletedAt || undefined;
        }
      });
    } catch (error: any) {
      runInAction(() => {
        this.onboardingLoading = false;
        this.error =
          error.response?.data?.message || 'Ошибка обновления прогресса онбординга';
      });
      throw error;
    }
  }

  async completeOnboarding() {
    // Mark all required steps as completed
    await this.updateOnboardingProgress('physicalParameters', true);
    await this.updateOnboardingProgress('nutritionGoals', true);
  }
}

export default ProfileStore;
