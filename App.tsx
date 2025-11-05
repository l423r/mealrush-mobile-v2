import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStores } from './src/stores';
import AppNavigator from './src/navigation/AppNavigator';

function AppContent() {
  const { notificationStore } = useStores();

  useEffect(() => {
    try {
      // Настройка слушателей уведомлений при запуске приложения
      const cleanup = notificationStore.setupNotificationListeners();

      // Проверка статуса разрешений
      notificationStore.checkPermissionStatus();

      // Очистка при размонтировании
      return cleanup;
    } catch (error) {
      console.warn('Failed to setup notification listeners:', error);
      return undefined;
    }
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
