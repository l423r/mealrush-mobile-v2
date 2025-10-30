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

type GetActivityScreenNavigationProp = NativeStackNavigationProp<
  ProfileSetupStackParamList,
  'GetActivity'
>;
type GetActivityScreenRouteProp = RouteProp<
  ProfileSetupStackParamList,
  'GetActivity'
>;

const GetActivityScreen: React.FC = () => {
  const navigation = useNavigation<GetActivityScreenNavigationProp>();
  const route = useRoute<GetActivityScreenRouteProp>();
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

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🏃‍♂️</Text>
          <Text style={styles.title}>Какой у вас уровень активности?</Text>
          <Text style={styles.subtitle}>
            Это поможет точно рассчитать вашу дневную норму калорий
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
                    Коэффициент: {activity.multiplier}
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
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Далее"
          onPress={handleNext}
          disabled={!selectedActivity}
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
  options: {
    gap: spacing.md,
  },
  option: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
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
    marginBottom: spacing.sm,
  },
  optionEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  optionMultiplier: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  optionDescription: {
    ...typography.body2,
    color: colors.text.secondary,
    lineHeight: 20,
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
