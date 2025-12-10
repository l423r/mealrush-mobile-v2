import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  Product,
  MealElement,
  Meal,
  AnalysisResponse,
  ProductResponse,
  MealTemplate,
  MealTemplateElement,
} from './api.types';
import type { AnalyticsPeriod } from './analytics.types';

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
    templateId?: number;
    preselectedProduct?: ProductResponse;
    quantity?: number;
    targetUserId?: number;
  };
  Scanner: {
    date?: string;
    mealId?: number;
  };
  Product: {
    product?: Product;
    barcode?: string;
    isEditing?: boolean;
  };
  Meal: {
    meal: Meal;
  };
  MealTemplate: {
    template: MealTemplate;
  };
  MealElement: {
    item?: Product | MealElement | ProductResponse | MealTemplateElement;
    date?: string;
    mealId?: number;
    templateId?: number;
    fromSearch?: boolean;
    readOnly?: boolean;
    targetUserId?: number;
  };
  PhotoAnalysis: {
    analysisResult: AnalysisResponse;
    imageUri: string;
    mealId?: number;
    date?: string;
    targetUserId?: number;
  };
  TextAnalysis: {
    analysisResult: AnalysisResponse;
    description: string;
    mealId?: number;
    date?: string;
    targetUserId?: number;
  };
  AudioAnalysis: {
    analysisResult: AnalysisResponse;
    transcription: string;
    mealId?: number;
    date?: string;
    targetUserId?: number;
  };
  ProfileEdit: undefined;
  Weight: undefined;
  Settings: undefined;
  SettingsName: undefined;
  SettingsEmail: undefined;
  SettingsPassword: undefined;
  SettingsDeleteAccount: undefined;
  NotificationSettings: undefined;
  DietChatList: undefined;
  DietChat: {
    sessionId: number;
    title?: string | null;
  };
  Friends: undefined;
  FriendRequests: {
    initialTab?: 'incoming' | 'outgoing';
  };
  FriendSettings: {
    friendId: number;
  };
};

// Home Tabs
export type HomeTabParamList = {
  Main: undefined;
  Products: undefined;
  Analytics: {
    period?: AnalyticsPeriod;
  } | undefined;
  Chat: undefined;
  Profile: undefined;
};

// Product Tabs
export type ProductTabParamList = {
  AllProducts: undefined;
  MyProducts: undefined;
};
