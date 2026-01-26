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

type GetTargetScreenNavigationProp = NativeStackNavigationProp<
  ProfileSetupStackParamList,
  'GetTarget'
>;
type GetTargetScreenRouteProp = RouteProp<
  ProfileSetupStackParamList,
  'GetTarget'
>;

const GetTargetScreen: React.FC = observer(() => {
  const navigation = useNavigation<GetTargetScreenNavigationProp>();
  const route = useRoute<GetTargetScreenRouteProp>();
  const { profileStore } = useStores();
  const [selectedTarget, setSelectedTarget] = useState<
    'LOSE' | 'SAVE' | 'GAIN' | null
  >(null);


  const handleNext = () => {
    if (selectedTarget) {
      navigation.navigate('GetWeight', {
        gender: route.params?.gender,
        target: selectedTarget,
      });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const targets = [
    {
      value: 'LOSE' as const,
      title: 'Сбросить вес',
      emoji: '📉',
      description: 'Создать дефицит калорий для похудения',
    },
    {
      value: 'SAVE' as const,
      title: 'Сохранить вес',
      emoji: '⚖️',
      description: 'Поддерживать текущий вес',
    },
    {
      value: 'GAIN' as const,
      title: 'Набрать вес',
      emoji: '📈',
      description: 'Создать профицит калорий для набора массы',
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="Выберите цель" showBackButton onBackPress={handleBack} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Onboarding Progress Indicator */}
        <OnboardingProgressIndicator currentScreen="GetTarget" />
        <View style={styles.header}>
          <Text style={styles.title}>Какую цель вы преследуете?</Text>
          <Text style={styles.subtitle}>
            Это поможет рассчитать оптимальную калорийность рациона
          </Text>
        </View>

        <View style={styles.options}>
          {targets.map((target) => (
            <TouchableOpacity
              key={target.value}
              style={[
                styles.option,
                selectedTarget === target.value && styles.selectedOption,
              ]}
              onPress={() => setSelectedTarget(target.value)}
            >
              <Text style={styles.optionEmoji}>{target.emoji}</Text>
              <Text
                style={[
                  styles.optionTitle,
                  selectedTarget === target.value && styles.selectedOptionText,
                ]}
              >
                {target.title}
              </Text>
              <Text
                style={[
                  styles.optionDescription,
                  selectedTarget === target.value &&
                    styles.selectedOptionDescription,
                ]}
              >
                {target.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Далее" onPress={handleNext} disabled={!selectedTarget} />
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
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
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
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  optionTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
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

export default GetTargetScreen;
