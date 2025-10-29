import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema } from '../../utils/validation';
import { AuthStackParamList } from '../../types/navigation.types';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useStores } from '../../stores';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';

type RegistrationScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Registration'>;
type RegistrationScreenRouteProp = RouteProp<AuthStackParamList, 'Registration'>;

const RegistrationScreen: React.FC = () => {
  const navigation = useNavigation<RegistrationScreenNavigationProp>();
  const route = useRoute<RegistrationScreenRouteProp>();
  const { authStore, profileStore } = useStores();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password');

  const onSubmit = async (data: { email: string; password: string; name: string }) => {
    try {
      // Register user
      await authStore.register(data);
      
      // Create user profile
      const profileData = {
        height: route.params?.height || 170,
        weight: route.params?.weight || 70,
        gender: route.params?.gender || 'MALE',
        birthday: route.params?.birthday || new Date().toISOString().split('T')[0],
        target_weight_type: route.params?.target || 'SAVE',
        target_weight: route.params?.targetWeight || route.params?.weight || 70,
        physical_activity_level: route.params?.activity || 'SECOND',
        day_limit_cal: 2000, // Will be calculated by backend
      };

      await profileStore.createProfile(profileData);
      
      // Login after successful registration
      await authStore.login({
        email: data.email,
        password: data.password,
      });

      // Navigation will be handled by AppNavigator
    } catch (error) {
      Alert.alert('Ошибка', authStore.error || profileStore.error || 'Не удалось зарегистрироваться');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        title="Регистрация"
        showBackButton
        onBackPress={handleBack}
      />
      
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Почти готово!</Text>
          <Text style={styles.subtitle}>Создайте аккаунт для завершения настройки</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Имя"
                placeholder="Введите ваше имя"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="Введите ваш email"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Пароль"
                placeholder="Введите пароль"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry={!showPassword}
                rightIcon={
                  <Text style={styles.eyeIcon}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                }
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Подтвердите пароль"
                placeholder="Повторите пароль"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                secureTextEntry={!showConfirmPassword}
                rightIcon={
                  <Text style={styles.eyeIcon}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                }
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            )}
          />
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Ваши данные:</Text>
          <Text style={styles.summaryText}>
            Пол: {route.params?.gender === 'MALE' ? 'Мужской' : 'Женский'}
          </Text>
          <Text style={styles.summaryText}>
            Цель: {route.params?.target === 'LOSE' ? 'Сбросить вес' : 
                   route.params?.target === 'GAIN' ? 'Набрать вес' : 'Сохранить вес'}
          </Text>
          <Text style={styles.summaryText}>
            Вес: {route.params?.weight} кг
          </Text>
          <Text style={styles.summaryText}>
            Рост: {route.params?.height} см
          </Text>
          <Text style={styles.summaryText}>
            Возраст: {route.params?.birthday ? 
              new Date().getFullYear() - new Date(route.params.birthday).getFullYear() : 'Не указан'} лет
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Создать аккаунт"
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || authStore.loading || profileStore.loading}
          loading={authStore.loading || profileStore.loading}
        />
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: spacing.xl,
  },
  summary: {
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  summaryTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  summaryText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  eyeIcon: {
    fontSize: 20,
  },
});

export default RegistrationScreen;