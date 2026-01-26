import React, { useEffect } from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import type { RootStackParamList } from '../types/navigation.types';
import AuthNavigator from './AuthNavigator';
import ProfileSetupNavigator from './ProfileSetupNavigator';
import MainNavigator from './MainNavigator';
import Loading from '../components/common/Loading';
import Snackbar from '../components/common/Snackbar';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['foodapp://', 'https://'],
  config: {
    screens: {
      Auth: {
        screens: {
          PasswordReset: {
            // React Navigation automatically parses query parameters
            // Format: foodapp://reset-password?token=xxx or https://.../reset-password?token=xxx
            path: 'reset-password',
          },
        },
      },
    },
  },
};

const AppNavigator: React.FC = observer(() => {
  const { authStore, profileStore } = useStores();

  useEffect(() => {
    // Check if user is already authenticated
    authStore.checkAuth();
  }, [authStore]);

  useEffect(() => {
    // Load onboarding status if profile exists
    if (authStore.isAuthenticated && profileStore.profile && !profileStore.onboardingStatus) {
      profileStore.getOnboardingStatus().catch((error) => {
        console.error('Error loading onboarding status:', error);
      });
    }
  }, [authStore.isAuthenticated, profileStore.profile]);

  // Показываем загрузку, пока проверяется авторизация или профиль
  if (authStore.initializing || authStore.loading || profileStore.checkingProfile) {
    return <Loading message="Загрузка..." />;
  }

  const renderScreen = () => {
    if (!authStore.isAuthenticated) {
      return <Stack.Screen name="Auth" component={AuthNavigator} />;
    }

    // Экран настройки профиля показываем если:
    // 1. Профиль отсутствует (needsProfileSetup)
    // 2. ИЛИ onboarding не завершен
    const needsOnboarding = 
      profileStore.needsProfileSetup ||
      (profileStore.profile && !profileStore.profile.onboardingCompleted);

    if (needsOnboarding) {
      return (
        <Stack.Screen name="ProfileSetup" component={ProfileSetupNavigator} />
      );
    }

    // Показываем главный экран, если профиль настроен и onboarding завершен
    return <Stack.Screen name="Main" component={MainNavigator} />;
  };

  return (
    <>
      <NavigationContainer linking={linking}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {renderScreen()}
        </Stack.Navigator>
      </NavigationContainer>
      <Snackbar />
    </>
  );
});

export default AppNavigator;
