import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../types/navigation.types';
import HomeTabs from './HomeTabs';
import SearchScreen from '../screens/main/SearchScreen';
import ScannerScreen from '../screens/main/ScannerScreen';
import ProductScreen from '../screens/main/ProductScreen';
import MealScreen from '../screens/main/MealScreen';
import MealElementScreen from '../screens/main/MealElementScreen';
import PhotoAnalysisScreen from '../screens/main/PhotoAnalysisScreen';
import TextAnalysisScreen from '../screens/main/TextAnalysisScreen';
import AudioAnalysisScreen from '../screens/main/AudioAnalysisScreen';
import ProfileEditScreen from '../screens/main/ProfileEditScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import SettingsNameScreen from '../screens/main/SettingsNameScreen';
import SettingsEmailScreen from '../screens/main/SettingsEmailScreen';
import SettingsPasswordScreen from '../screens/main/SettingsPasswordScreen';
import SettingsDeleteAccountScreen from '../screens/main/SettingsDeleteAccountScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Meal" component={MealScreen} />
      <Stack.Screen name="MealElement" component={MealElementScreen} />
      <Stack.Screen name="PhotoAnalysis" component={PhotoAnalysisScreen} />
      <Stack.Screen name="TextAnalysis" component={TextAnalysisScreen} />
      <Stack.Screen name="AudioAnalysis" component={AudioAnalysisScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="SettingsName" component={SettingsNameScreen} />
      <Stack.Screen name="SettingsEmail" component={SettingsEmailScreen} />
      <Stack.Screen
        name="SettingsPassword"
        component={SettingsPasswordScreen}
      />
      <Stack.Screen
        name="SettingsDeleteAccount"
        component={SettingsDeleteAccountScreen}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
