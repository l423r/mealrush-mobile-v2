import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileSetupStackParamList } from '../../types/navigation.types';
import { Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Button from '../../components/common/Button';
import { useStores } from '../../stores';

type OnboardingCompleteScreenNavigationProp = NativeStackNavigationProp<
  ProfileSetupStackParamList,
  'CompleteProfile'
>;

const OnboardingCompleteScreen: React.FC = observer(() => {
  const navigation = useNavigation<OnboardingCompleteScreenNavigationProp>();
  const { profileStore } = useStores();

  useEffect(() => {
    // Mark onboarding as completed when screen loads
    const markCompleted = async () => {
      try {
        await profileStore.completeOnboarding();
      } catch (error) {
        console.error('Error completing onboarding:', error);
      }
    };
    markCompleted();
  }, []);

  const handleStartUsing = () => {
    // Navigate to main app
    // The AppNavigator will automatically show MainNavigator when onboarding is completed
    navigation.getParent()?.getParent()?.navigate('Main' as never);
  };

  const handleLogFirstMeal = () => {
    // Navigate to meal logging
    handleStartUsing();
    // TODO: Navigate to meal logging screen after main app loads
  };

  const handleAnalyzePhoto = () => {
    // Navigate to photo analysis
    handleStartUsing();
    // TODO: Navigate to photo analysis screen after main app loads
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.content}>
        {/* Celebration Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={80} color={colors.primary} />
          </View>
        </View>

        {/* "Aha!" Moment */}
        <Text style={styles.title}>Отлично! 🎉</Text>
        <Text style={styles.subtitle}>
          Вы успешно завершили настройку профиля
        </Text>

        {/* Guidance to first action */}
        <View style={styles.guidanceContainer}>
          <Text style={styles.guidanceTitle}>Что дальше?</Text>
          <Text style={styles.guidanceText}>
            Начните отслеживать свое питание уже сегодня!
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLogFirstMeal}
            >
              <Ionicons name="restaurant" size={24} color={colors.primary} />
              <Text style={styles.actionButtonText}>Записать прием пищи</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAnalyzePhoto}
            >
              <Ionicons name="camera" size={24} color={colors.primary} />
              <Text style={styles.actionButtonText}>Анализ фото</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue Button */}
        <Button
          title="Начать использовать приложение"
          onPress={handleStartUsing}
          style={styles.continueButton}
        />
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  guidanceContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  guidanceTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  guidanceText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    ...typography.bodySmall,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  continueButton: {
    width: '100%',
    marginTop: spacing.lg,
  },
});

export default OnboardingCompleteScreen;
