import React, { useState } from 'react';
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
import { colors, typography, spacing, borderRadius } from '../../theme';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';

type GetGenderScreenNavigationProp = NativeStackNavigationProp<
  ProfileSetupStackParamList,
  'GetGender'
>;

const GetGenderScreen: React.FC = () => {
  const navigation = useNavigation<GetGenderScreenNavigationProp>();
  const [selectedGender, setSelectedGender] = useState<
    'MALE' | 'FEMALE' | null
  >(null);

  const handleNext = () => {
    if (selectedGender) {
      // Store gender in navigation params or global state
      navigation.navigate('GetTarget', { gender: selectedGender });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header title="Выберите пол" showBackButton onBackPress={handleBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Какой у вас пол?</Text>
          <Text style={styles.subtitle}>
            Это поможет рассчитать вашу дневную норму калорий
          </Text>
        </View>

        <View style={styles.options}>
          <TouchableOpacity
            style={[
              styles.option,
              selectedGender === 'MALE' && styles.selectedOption,
            ]}
            onPress={() => setSelectedGender('MALE')}
          >
            <Text style={styles.optionEmoji}>👨</Text>
            <Text
              style={[
                styles.optionText,
                selectedGender === 'MALE' && styles.selectedOptionText,
              ]}
            >
              Мужской
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              selectedGender === 'FEMALE' && styles.selectedOption,
            ]}
            onPress={() => setSelectedGender('FEMALE')}
          >
            <Text style={styles.optionEmoji}>👩</Text>
            <Text
              style={[
                styles.optionText,
                selectedGender === 'FEMALE' && styles.selectedOptionText,
              ]}
            >
              Женский
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Далее" onPress={handleNext} disabled={!selectedGender} />
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
  optionText: {
    ...typography.h4,
    color: colors.text.primary,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});

export default GetGenderScreen;
