import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeTabParamList } from '../types/navigation.types';
import { colors, typography } from '../theme';
import MainScreen from '../screens/main/MainScreen';
import ProductsScreen from '../screens/main/ProductsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import AnalyticsScreen from '../screens/main/analytics/AnalyticsScreen';

const Tab = createBottomTabNavigator<HomeTabParamList>();

const HomeTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.background.paper,
          borderTopColor: colors.border.light,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          ...typography.caption,
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="Main"
        component={MainScreen}
        options={{
          tabBarLabel: 'Приемы пищи',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🍽️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          tabBarLabel: 'Продукты',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🥗</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Аналитика',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default HomeTabs;