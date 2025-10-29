import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { RootStackParamList } from '../types/navigation.types';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import Loading from '../components/common/Loading';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = observer(() => {
  const { authStore } = useStores();

  useEffect(() => {
    // Check if user is already authenticated
    authStore.checkAuth();
  }, []);

  if (authStore.loading) {
    return <Loading message="Проверка авторизации..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {authStore.isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
});

export default AppNavigator;