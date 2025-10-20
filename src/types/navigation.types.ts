import { NavigatorScreenParams } from '@react-navigation/native';
import { Product, MealElement, Meal } from './api.types';

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

// Auth Stack
export type AuthStackParamList = {
  SignIn: undefined;
  GetGender: undefined;
  GetTarget: undefined;
  GetWeight: undefined;
  GetTargetWeight: undefined;
  GetHeight: undefined;
  GetBirthday: undefined;
  GetActivity: undefined;
  Registration: undefined;
};

// Main Stack
export type MainStackParamList = {
  HomeTabs: NavigatorScreenParams<HomeTabParamList>;
  Search: {
    date?: string;
    mealId?: number;
  };
  Scanner: {
    date?: string;
    mealId?: number;
  };
  Product: {
    product?: Product;
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
  Profile: undefined;
};

// Product Tabs
export type ProductTabParamList = {
  AllProducts: undefined;
  MyProducts: undefined;
};