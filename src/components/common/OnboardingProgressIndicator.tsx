import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface OnboardingProgressIndicatorProps {
  currentScreen: string;
}

// Порядок экранов онбординга (исключая CompleteProfile, так как это финальный экран)
const ONBOARDING_SCREENS = [
  'GetGender',
  'GetTarget',
  'GetWeight',
  'GetTargetWeight',
  'GetHeight',
  'GetBirthday',
  'GetActivity',
] as const;

const TOTAL_STEPS = ONBOARDING_SCREENS.length + 1; // +1 для CompleteProfile

const OnboardingProgressIndicator: React.FC<OnboardingProgressIndicatorProps> = ({
  currentScreen,
}) => {
  // Находим индекс текущего экрана
  const currentIndex = ONBOARDING_SCREENS.indexOf(currentScreen as any);
  
  // Определяем текущий шаг (1-based)
  let currentStep: number;
  if (currentIndex >= 0) {
    currentStep = currentIndex + 1; // 1-7 для основных экранов
  } else if (currentScreen === 'CompleteProfile') {
    currentStep = TOTAL_STEPS; // 8 для финального экрана
  } else {
    currentStep = 1; // По умолчанию
  }
  
  // Вычисляем прогресс в процентах
  const progress = (currentStep / TOTAL_STEPS) * 100;
  
  // Вычисляем оставшиеся шаги
  const remainingSteps = TOTAL_STEPS - currentStep;

  return (
    <View style={styles.container}>
      <View style={styles.progressInfo}>
        <Text style={styles.progressText}>
          Шаг {currentStep} из {TOTAL_STEPS}
        </Text>
        {remainingSteps > 0 && (
          <Text style={styles.remainingText}>
            Осталось шагов: {remainingSteps}
          </Text>
        )}
      </View>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill,
              { width: `${Math.min(progress, 100)}%` }
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  remainingText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.border.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});

export default OnboardingProgressIndicator;
