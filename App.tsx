import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider } from './src/stores';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <StoreProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </StoreProvider>
  );
}
