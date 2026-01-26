import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileSetupStackParamList } from '../../types/navigation.types';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import { useStores } from '../../stores';
import type { UserProfileCreate } from '../../types/api.types';
import {
  calculateRecommendedCalories,
  calculateAge,
} from '../../utils/calculations';
import { getDeviceTimezone } from '../../utils/timezone';

type CompleteProfileScreenNavigationProp = NativeStackNavigationProp<
  ProfileSetupStackParamList,
  'CompleteProfile'
>;
type CompleteProfileScreenRouteProp = RouteProp<
  ProfileSetupStackParamList,
  'CompleteProfile'
>;

const CompleteProfileScreen: React.FC = () => {
  const navigation = useNavigation<CompleteProfileScreenNavigationProp>();
  const route = useRoute<CompleteProfileScreenRouteProp>();
  const { profileStore, uiStore } = useStores();
  const [loading, setLoading] = useState(false);

  const { gender, target, weight, targetWeight, height, birthday, activity } =
    route.params;

  const age = birthday ? calculateAge(birthday) : null;

  const getRecommendedCalories = () => {
    if (!age || !weight || !height || !gender || !activity || !target) {
      return 2000; // Default value
    }
    return calculateRecommendedCalories(
      weight,
      height,
      age,
      gender as 'MALE' | 'FEMALE',
      activity as 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH' | 'FIFTH',
      target as 'LOSE' | 'SAVE' | 'GAIN'
    );
  };

  const getGenderText = () => {
    return gender === 'MALE' ? 'Мужской' : 'Женский';
  };

  const getTargetText = () => {
    if (target === 'LOSE') return 'Похудеть';
    if (target === 'GAIN') return 'Набрать вес';
    return 'Поддержать вес';
  };

  const getActivityText = () => {
    if (activity === 'FIRST') return 'Минимальная';
    if (activity === 'SECOND') return 'Легкая';
    if (activity === 'THIRD') return 'Умеренная';
    if (activity === 'FOURTH') return 'Высокая';
    return 'Очень высокая';
  };

  const recommendedCalories = getRecommendedCalories();

  const handleComplete = async () => {
    if (
      !gender ||
      !target ||
      !weight ||
      !targetWeight ||
      !height ||
      !birthday ||
      !activity
    ) {
      uiStore.showSnackbar('Не все данные заполнены', 'error');
      return;
    }

    setLoading(true);

    try {
      const profileData: UserProfileCreate = {
        height,
        weight,
        gender: gender as 'MALE' | 'FEMALE',
        birthday,
        targetWeightType: target as 'LOSE' | 'SAVE' | 'GAIN',
        targetWeight: targetWeight,
        physicalActivityLevel: activity as
          | 'FIRST'
          | 'SECOND'
          | 'THIRD'
          | 'FOURTH'
          | 'FIFTH',
        dayLimitCal: recommendedCalories,
        timezone: getDeviceTimezone(),
      };

      await profileStore.createProfile(profileData);

      // Mark onboarding steps as completed
      try {
        await profileStore.updateOnboardingProgress('physicalParameters', true);
        await profileStore.updateOnboardingProgress('nutritionGoals', true);
        await profileStore.completeOnboarding();
      } catch (error) {
        console.error('Error completing onboarding:', error);
        // Don't fail profile creation if onboarding completion fails
      }

      // Profile created successfully, navigation will be handled by AppNavigator
      // The user will be redirected to Main screen automatically
    } catch (error: any) {
      uiStore.showSnackbar(
        error.response?.data?.message || 'Не удалось создать профиль',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Завершение настройки"
        showBackButton
        onBackPress={handleBack}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Почти готово!</Text>
          <Text style={styles.subtitle}>
            Проверьте ваши данные и завершите настройку профиля
          </Text>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Ваши данные:</Text>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Пол:</Text>
            <Text style={styles.summaryValue}>{getGenderText()}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Цель:</Text>
            <Text style={styles.summaryValue}>{getTargetText()}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Текущий вес:</Text>
            <Text style={styles.summaryValue}>{weight} кг</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Целевой вес:</Text>
            <Text style={styles.summaryValue}>{targetWeight} кг</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Рост:</Text>
            <Text style={styles.summaryValue}>{height} см</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Возраст:</Text>
            <Text style={styles.summaryValue}>{age} лет</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Активность:</Text>
            <Text style={styles.summaryValue}>{getActivityText()}</Text>
          </View>

          <View style={[styles.summaryItem, styles.caloriesItem]}>
            <Text style={styles.summaryLabel}>Рекомендуемые калории:</Text>
            <Text style={styles.caloriesValue}>
              {Math.round(recommendedCalories)} ккал/день
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Завершить настройку"
          onPress={handleComplete}
          loading={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  summary: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  summaryTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  summaryLabel: {
    ...typography.body1,
    color: colors.text.secondary,
    flex: 1,
  },
  summaryValue: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '600',
  },
  caloriesItem: {
    borderBottomWidth: 0,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  caloriesValue: {
    ...typography.h5,
    color: colors.primary,
    fontWeight: '700',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});

export default CompleteProfileScreen;
