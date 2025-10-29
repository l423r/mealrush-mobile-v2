import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileSetupStackParamList } from '../types/navigation.types';
import GetGenderScreen from '../screens/auth/GetGenderScreen';
import GetTargetScreen from '../screens/auth/GetTargetScreen';
import GetWeightScreen from '../screens/auth/GetWeightScreen';
import GetTargetWeightScreen from '../screens/auth/GetTargetWeightScreen';
import GetHeightScreen from '../screens/auth/GetHeightScreen';
import GetBirthdayScreen from '../screens/auth/GetBirthdayScreen';
import GetActivityScreen from '../screens/auth/GetActivityScreen';
import CompleteProfileScreen from '../screens/auth/CompleteProfileScreen';

const Stack = createNativeStackNavigator<ProfileSetupStackParamList>();

const ProfileSetupNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="GetGender" component={GetGenderScreen} />
      <Stack.Screen name="GetTarget" component={GetTargetScreen} />
      <Stack.Screen name="GetWeight" component={GetWeightScreen} />
      <Stack.Screen name="GetTargetWeight" component={GetTargetWeightScreen} />
      <Stack.Screen name="GetHeight" component={GetHeightScreen} />
      <Stack.Screen name="GetBirthday" component={GetBirthdayScreen} />
      <Stack.Screen name="GetActivity" component={GetActivityScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
    </Stack.Navigator>
  );
};

export default ProfileSetupNavigator;
