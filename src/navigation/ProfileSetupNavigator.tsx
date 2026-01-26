import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';
import type { ProfileSetupStackParamList } from '../types/navigation.types';
import GetGenderScreen from '../screens/auth/GetGenderScreen';
import GetTargetScreen from '../screens/auth/GetTargetScreen';
import GetWeightScreen from '../screens/auth/GetWeightScreen';
import GetTargetWeightScreen from '../screens/auth/GetTargetWeightScreen';
import GetHeightScreen from '../screens/auth/GetHeightScreen';
import GetBirthdayScreen from '../screens/auth/GetBirthdayScreen';
import GetActivityScreen from '../screens/auth/GetActivityScreen';
import CompleteProfileScreen from '../screens/auth/CompleteProfileScreen';
import { useStores } from '../stores';

const Stack = createNativeStackNavigator<ProfileSetupStackParamList>();

const ProfileSetupNavigator: React.FC = observer(() => {
  const { profileStore } = useStores();

  // Determine initial screen based on onboarding progress
  const getInitialScreen = (): keyof ProfileSetupStackParamList => {
    if (!profileStore.profile) {
      return 'GetGender';
    }

    const completedSteps = profileStore.onboardingStatus?.stepsCompleted || [];
    
    // If physical parameters not completed, start from GetGender
    if (!completedSteps.includes('physicalParameters')) {
      return 'GetGender';
    }
    
    // If nutrition goals not completed, start from GetTarget
    if (!completedSteps.includes('nutritionGoals')) {
      return 'GetTarget';
    }
    
    // Both completed, go to CompleteProfile
    return 'CompleteProfile';
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialScreen()}
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
});

export default ProfileSetupNavigator;
