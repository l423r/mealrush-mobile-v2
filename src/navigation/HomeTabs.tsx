import React from 'react';
import { observer } from 'mobx-react-lite';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { HomeTabParamList } from '../types/navigation.types';
import { typography } from '../theme';
import { useTheme } from '../hooks/useTheme';
import MainScreen from '../screens/main/MainScreen';
import ProductsScreen from '../screens/main/ProductsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
// Use the new compact analytics screen
import AnalyticsScreen from '../screens/main/AnalyticsScreen';
import DietChatListScreen from '../screens/main/DietChatListScreen';

const Tab = createBottomTabNavigator<HomeTabParamList>();

const HomeTabs: React.FC = observer(() => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  
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
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 5,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
        },
        tabBarLabelStyle: {
          ...typography.caption,
          fontSize: 12,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tab.Screen
        name="Main"
        component={MainScreen}
        options={{
          tabBarLabel: 'Приемы пищи',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'fast-food' : 'fast-food-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          tabBarLabel: 'Продукты',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'nutrition' : 'nutrition-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={DietChatListScreen}
        options={{
          tabBarLabel: 'Чаты',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Аналитика',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'stats-chart' : 'stats-chart-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
});

export default HomeTabs;
