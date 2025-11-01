import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  Product,
  MealElement,
  Meal,
  PhotoAnalysisResponse,
  ProductResponse,
} from './api.types';

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  ProfileSetup: NavigatorScreenParams<ProfileSetupStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

// Auth Stack
export type AuthStackParamList = {
  SignIn: undefined;
  SimpleRegistration: undefined;
  GetGender: undefined;
  GetTarget: {
    gender?: string;
  };
  GetWeight: {
    gender?: string;
    target?: string;
  };
  GetTargetWeight: {
    gender?: string;
    target?: string;
    weight?: number;
  };
  GetHeight: {
    gender?: string;
    target?: string;
    weight?: number;
    targetWeight?: number;
  };
  GetBirthday: {
    gender?: string;
    target?: string;
    weight?: number;
    targetWeight?: number;
    height?: number;
  };
  GetActivity: {
    gender?: string;
    target?: string;
    weight?: number;
    targetWeight?: number;
    height?: number;
    birthday?: string;
  };
  Registration: {
    gender?: string;
    target?: string;
    weight?: number;
    targetWeight?: number;
    height?: number;
    birthday?: string;
    activity?: string;
  };
};

// Profile Setup Stack
export type ProfileSetupStackParamList = {
  GetGender: undefined;
  GetTarget: {
    gender?: string;
  };
  GetWeight: {
    gender?: string;
    target?: string;
  };
  GetTargetWeight: {
    gender?: string;
    target?: string;
    weight?: number;
  };
  GetHeight: {
    gender?: string;
    target?: string;
    weight?: number;
    targetWeight?: number;
  };
  GetBirthday: {
    gender?: string;
    target?: string;
    weight?: number;
    targetWeight?: number;
    height?: number;
  };
  GetActivity: {
    gender?: string;
    target?: string;
    weight?: number;
    targetWeight?: number;
    height?: number;
    birthday?: string;
  };
  CompleteProfile: {
    gender?: string;
    target?: string;
    weight?: number;
    targetWeight?: number;
    height?: number;
    birthday?: string;
    activity?: string;
  };
};

// Main Stack
export type MainStackParamList = {
  HomeTabs: NavigatorScreenParams<HomeTabParamList>;
  Search: {
    date?: string;
    mealId?: number;
    preselectedProduct?: ProductResponse;
    quantity?: number;
  };
  Scanner: {
    date?: string;
    mealId?: number;
  };
  Product: {
    product?: Product;
    barcode?: string;
  };
  Meal: {
    meal: Meal;
  };
  MealElement: {
    item?: Product | MealElement;
    date?: string;
    mealId?: number;
    fromSearch?: boolean;
  };
  PhotoAnalysis: {
    analysisResult: PhotoAnalysisResponse;
    imageUri: string;
    mealId?: number;
    date?: string;
  };
  ProfileEdit: undefined;
  Settings: undefined;
  SettingsName: undefined;
  SettingsEmail: undefined;
  SettingsPassword: undefined;
  SettingsDeleteAccount: undefined;
};

// Home Tabs
export type HomeTabParamList = {
  Main: undefined;
  Products: undefined;
  Analytics: undefined;
  Profile: undefined;
};

// Product Tabs
export type ProductTabParamList = {
  AllProducts: undefined;
  MyProducts: undefined;
};
