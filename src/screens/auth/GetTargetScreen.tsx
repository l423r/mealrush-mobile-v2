import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';

type GetTargetScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'GetTarget'>;
type GetTargetScreenRouteProp = RouteProp<AuthStackParamList, 'GetTarget'>;

const GetTargetScreen: React.FC = () => {
  const navigation = useNavigation<GetTargetScreenNavigationProp>();
  const route = useRoute<GetTargetScreenRouteProp>();
  const [selectedTarget, setSelectedTarget] = useState<'LOSE' | 'SAVE' | 'GAIN' | null>(null);

  const handleNext = () => {
    if (selectedTarget) {
      navigation.navigate('GetWeight', { 
        gender: route.params?.gender,
        target: selectedTarget 
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
      <Header
        title="Выберите цель"
        showBackButton
        onBackPress={handleBack}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Какую цель вы преследуете?</Text>
          <Text style={styles.subtitle}>Это поможет рассчитать оптимальную калорийность рациона</Text>
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
              <Text style={[
                styles.optionTitle,
                selectedTarget === target.value && styles.selectedOptionText,
              ]}>
                {target.title}
              </Text>
              <Text style={[
                styles.optionDescription,
                selectedTarget === target.value && styles.selectedOptionDescription,
              ]}>
                {target.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Далее"
          onPress={handleNext}
          disabled={!selectedTarget}
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
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  optionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  optionDescription: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
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

export default GetTargetScreen;