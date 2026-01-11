import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { passwordResetSchema } from '../../utils/validation';
import type { AuthStackParamList } from '../../types/navigation.types';
import { colors, typography, spacing } from '../../theme';
import { useStores } from '../../stores';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import { translateErrorMessage, getDefaultErrorMessage } from '../../utils/errorMessages';

type PasswordResetScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'PasswordReset'
>;
type PasswordResetScreenRouteProp = RouteProp<AuthStackParamList, 'PasswordReset'>;

const PasswordResetScreen: React.FC = observer(() => {
  const navigation = useNavigation<PasswordResetScreenNavigationProp>();
  const route = useRoute<PasswordResetScreenRouteProp>();
  const { authStore, uiStore } = useStores();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const token = route.params?.token || '';

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(passwordResetSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    // Validate token when screen loads
    const validateToken = async () => {
      if (!token) {
        setValidatingToken(false);
        setTokenValid(false);
        uiStore.showSnackbar('Токен сброса пароля не найден', 'error');
        return;
      }

      // Basic token format validation (Base64 URL-safe, minimum length)
      // Reset tokens are 64 bytes = 86-88 Base64 characters
      if (token.length < 64 || token.length > 128) {
        setValidatingToken(false);
        setTokenValid(false);
        uiStore.showSnackbar('Неверный формат токена', 'error');
        return;
      }

      // Check for valid Base64 URL-safe characters (alphanumeric, -, _)
      const base64UrlPattern = /^[A-Za-z0-9_-]+$/;
      if (!base64UrlPattern.test(token)) {
        setValidatingToken(false);
        setTokenValid(false);
        uiStore.showSnackbar('Неверный формат токена', 'error');
        return;
      }

      try {
        const isValid = await authStore.validateResetToken(token);
        setTokenValid(isValid);
        if (!isValid) {
          uiStore.showSnackbar(
            authStore.error || 'Токен недействителен или истек',
            'error'
          );
        }
      } catch (error: any) {
        setTokenValid(false);
        uiStore.showSnackbar(
          translateErrorMessage(error?.response?.data?.message) ||
            'Ошибка при проверке токена',
          'error'
        );
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data: { password: string; confirmPassword: string }) => {
    if (!token) {
      uiStore.showSnackbar('Токен сброса пароля не найден', 'error');
      return;
    }

    try {
      await authStore.completePasswordReset(token, data.password);
      uiStore.showSnackbar('Пароль успешно изменен', 'success');
      // Navigate to sign in screen
      navigation.navigate('SignIn');
    } catch (error: any) {
      const errorMessage =
        authStore.error ||
        translateErrorMessage(error?.response?.data?.message) ||
        getDefaultErrorMessage('completePasswordReset');
      uiStore.showSnackbar(errorMessage, 'error');
    }
  };

  const handleBack = () => {
    navigation.navigate('SignIn');
  };

  if (validatingToken) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Header title="Восстановление пароля" showBackButton onBackPress={handleBack} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Проверка токена...</Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (!tokenValid) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Header title="Восстановление пароля" showBackButton onBackPress={handleBack} />
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>✗</Text>
            <Text style={styles.errorTitle}>Токен недействителен</Text>
            <Text style={styles.errorMessage}>
              Токен сброса пароля недействителен или истек. Пожалуйста, запросите новую ссылку для
              сброса пароля.
            </Text>
            <Button
              title="Запросить новую ссылку"
              onPress={() => navigation.navigate('PasswordResetRequest')}
              style={styles.backButton}
            />
            <Button
              title="Вернуться к входу"
              onPress={handleBack}
              style={[styles.backButton, { marginTop: spacing.md }]}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="Новый пароль" showBackButton onBackPress={handleBack} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>🔑</Text>
          <Text style={styles.title}>Создайте новый пароль</Text>
          <Text style={styles.subtitle}>
            Введите новый пароль. Минимум 8 символов.
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Новый пароль"
                placeholder="Введите новый пароль"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry={!showPassword}
                rightIcon={<Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>}
                onRightIconPress={() => setShowPassword(!showPassword)}
                testID="password_reset_password_input"
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Подтвердите пароль"
                placeholder="Повторите новый пароль"
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
                testID="password_reset_confirm_password_input"
              />
            )}
          />

          <Button
            title="Изменить пароль"
            onPress={handleSubmit(onSubmit)}
            loading={authStore.loading}
            disabled={!isValid || authStore.loading}
            style={styles.submitButton}
            testID="password_reset_submit_button"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    ...typography.h1,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  form: {
    marginBottom: spacing.xl,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  errorIcon: {
    fontSize: 80,
    color: colors.error,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    ...typography.h1,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  backButton: {
    marginTop: spacing.lg,
    minWidth: 200,
  },
  eyeIcon: {
    fontSize: 20,
  },
});

export default PasswordResetScreen;
