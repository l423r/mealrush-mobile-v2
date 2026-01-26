import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { ProfileSetupStackParamList } from '../../types/navigation.types';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import { calculateAge } from '../../utils/calculations';
import OnboardingProgressIndicator from '../../components/common/OnboardingProgressIndicator';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';

type GetBirthdayScreenNavigationProp = NativeStackNavigationProp<
  ProfileSetupStackParamList,
  'GetBirthday'
>;
type GetBirthdayScreenRouteProp = RouteProp<
  ProfileSetupStackParamList,
  'GetBirthday'
>;

const GetBirthdayScreen: React.FC = observer(() => {
  const navigation = useNavigation<GetBirthdayScreenNavigationProp>();
  const route = useRoute<GetBirthdayScreenRouteProp>();
  const { profileStore } = useStores();


  const [birthday, setBirthday] = useState<Date>(() => {
    // Default to 25 years ago
    const date = new Date();
    date.setFullYear(date.getFullYear() - 25);
    return date;
  });
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthday(selectedDate);
    }
  };

  const handleNext = () => {
    const age = calculateAge(birthday.toISOString().split('T')[0]);
    if (age < 13) {
      alert('Минимальный возраст для использования приложения - 13 лет');
      return;
    }
    if (age > 100) {
      alert('Пожалуйста, проверьте правильность даты рождения');
      return;
    }

    navigation.navigate('GetActivity', {
      gender: route.params?.gender,
      target: route.params?.target,
      weight: route.params?.weight,
      targetWeight: route.params?.targetWeight,
      height: route.params?.height,
      birthday: birthday.toISOString().split('T')[0],
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const age = calculateAge(birthday.toISOString().split('T')[0]);

  return (
    <View style={styles.container}>
      <Header title="Дата рождения" showBackButton onBackPress={handleBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <OnboardingProgressIndicator currentScreen="GetBirthday" />
        <View style={styles.header}>
          <Text style={styles.emoji}>🎂</Text>
          <Text style={styles.title}>Когда вы родились?</Text>
          <Text style={styles.subtitle}>
            Возраст нужен для точного расчета метаболизма
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Выбранная дата:</Text>
            <Text style={styles.dateValue}>{formatDate(birthday)}</Text>
            {age > 0 && <Text style={styles.ageValue}>Возраст: {age} лет</Text>}
          </View>

          <Button
            title="Выбрать дату"
            onPress={() => setShowPicker(true)}
            variant="outline"
            style={styles.dateButton}
          />

          {showPicker && (
            <DateTimePicker
              value={birthday}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />
          )}

          {age > 0 && (
            <View style={styles.ageInfo}>
              <Text style={styles.ageInfoText}>
                {age < 18
                  ? 'Для несовершеннолетних расчеты могут быть менее точными'
                  : 'Отлично! Возраст подходит для точных расчетов'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Далее"
          onPress={handleNext}
          disabled={age < 13 || age > 100}
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
  form: {
    alignItems: 'center',
  },
  dateContainer: {
    backgroundColor: colors.background.paper,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  dateLabel: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  dateValue: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  ageValue: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
  dateButton: {
    marginBottom: spacing.lg,
  },
  ageInfo: {
    backgroundColor: colors.primary + '20',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    maxWidth: 300,
  },
  ageInfoText: {
    ...typography.body2,
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});

export default GetBirthdayScreen;
