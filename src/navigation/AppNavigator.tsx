import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
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

const AppNavigator: React.FC = observer(() => {
  const { authStore, profileStore } = useStores();

  useEffect(() => {
    // Check if user is already authenticated
    authStore.checkAuth();
  }, [authStore]);

  // Показываем загрузку, пока проверяется авторизация или профиль
  if (authStore.loading || profileStore.checkingProfile) {
    return <Loading message="Проверка авторизации..." />;
  }

  const renderScreen = () => {
    if (!authStore.isAuthenticated) {
      return <Stack.Screen name="Auth" component={AuthNavigator} />;
    }

    // Экран настройки профиля показываем только если профиль действительно отсутствует
    if (profileStore.needsProfileSetup) {
      return (
        <Stack.Screen name="ProfileSetup" component={ProfileSetupNavigator} />
      );
    }

    // Показываем главный экран, если профиль настроен
    return <Stack.Screen name="Main" component={MainNavigator} />;
  };

  return (
    <>
      <NavigationContainer>
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
