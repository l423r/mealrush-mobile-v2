import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileSetupStackParamList } from '../../types/navigation.types';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import OnboardingProgressIndicator from '../../components/common/OnboardingProgressIndicator';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';

type GetActivityScreenNavigationProp = NativeStackNavigationProp<
  ProfileSetupStackParamList,
  'GetActivity'
>;
type GetActivityScreenRouteProp = RouteProp<
  ProfileSetupStackParamList,
  'GetActivity'
>;

const GetActivityScreen: React.FC = observer(() => {
  const navigation = useNavigation<GetActivityScreenNavigationProp>();
  const route = useRoute<GetActivityScreenRouteProp>();
  const { profileStore } = useStores();
  const [selectedActivity, setSelectedActivity] = useState<
    'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH' | 'FIFTH' | null
  >(null);


  const activities = [
    {
      value: 'FIRST' as const,
      title: 'Минимальная активность',
      emoji: '🛋️',
      description: 'Сидячий образ жизни, нет физических упражнений',
      multiplier: '1.2',
    },
    {
      value: 'SECOND' as const,
      title: 'Легкая активность',
      emoji: '🚶',
      description: 'Легкие упражнения 1-3 дня в неделю',
      multiplier: '1.375',
    },
    {
      value: 'THIRD' as const,
      title: 'Умеренная активность',
      emoji: '🏃',
      description: 'Умеренные упражнения 3-5 дней в неделю',
      multiplier: '1.55',
    },
    {
      value: 'FOURTH' as const,
      title: 'Высокая активность',
      emoji: '💪',
      description: 'Интенсивные упражнения 6-7 дней в неделю',
      multiplier: '1.725',
    },
    {
      value: 'FIFTH' as const,
      title: 'Очень высокая активность',
      emoji: '🏋️',
      description: 'Очень интенсивные упражнения, физическая работа',
      multiplier: '1.9',
    },
  ];

  const handleNext = () => {
    if (selectedActivity) {
      // Note: Onboarding progress will be updated after profile creation in CompleteProfileScreen
      navigation.navigate('CompleteProfile', {
        gender: route.params?.gender,
        target: route.params?.target,
        weight: route.params?.weight,
        targetWeight: route.params?.targetWeight,
        height: route.params?.height,
        birthday: route.params?.birthday,
        activity: selectedActivity,
      });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Уровень активности"
        showBackButton
        onBackPress={handleBack}
      />

      <View style={styles.content}>
        <OnboardingProgressIndicator currentScreen="GetActivity" />
        <View style={styles.header}>
          <Text style={styles.emoji}>🏃‍♂️</Text>
          <Text style={styles.title}>Уровень активности</Text>
          <Text style={styles.subtitle}>
            Для точного расчета калорий
          </Text>
        </View>

        <View style={styles.options}>
          {activities.map((activity) => (
            <TouchableOpacity
              key={activity.value}
              style={[
                styles.option,
                selectedActivity === activity.value && styles.selectedOption,
              ]}
              onPress={() => setSelectedActivity(activity.value)}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionEmoji}>{activity.emoji}</Text>
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionTitle,
                      selectedActivity === activity.value &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {activity.title}
                  </Text>
                  <Text style={styles.optionMultiplier}>
                    ×{activity.multiplier}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.optionDescription,
                  selectedActivity === activity.value &&
                    styles.selectedOptionDescription,
                ]}
              >
                {activity.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Далее"
          onPress={handleNext}
          disabled={!selectedActivity}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  optionEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: 2,
    fontWeight: '500',
  },
  optionMultiplier: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 12,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 16,
    fontSize: 12,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  selectedOptionDescription: {
    color: colors.primary,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});

export default GetActivityScreen;
