import { makeAutoObservable, runInAction } from 'mobx';
import { profileService } from '../api/services/profile.service';
import RootStore from './RootStore';
import { UserProfile, UserProfileCreate, UserProfileUpdate } from '../types/api.types';
import { calculateRecommendedCalories, calculateAge, calculateBMI } from '../utils/calculations';

class ProfileStore {
  rootStore: RootStore;
  
  // State
  profile: UserProfile | null = null;
  loading: boolean = false;
  error: string | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
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
    if (!this.profile || !this.age) return null;
    
    return calculateRecommendedCalories(
      this.profile.weight,
      this.profile.height,
      this.age,
      this.profile.gender,
      this.profile.physical_activity_level,
      this.profile.target_weight_type
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
    try {
      const response = await profileService.getProfile();
      
      runInAction(() => {
        this.profile = response.data;
      });
      
    } catch (error: any) {
      // Если профиль не найден (404), это нормально - пользователь еще не создал профиль
      if (error.response?.status === 404) {
        runInAction(() => {
          this.profile = null;
        });
      } else {
        console.error('Error checking profile:', error);
      }
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
        this.error = error.response?.data?.message || 'Ошибка обновления профиля';
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
    this.error = null;
  }
}

export default ProfileStore;