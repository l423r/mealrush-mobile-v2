import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { passwordResetRequestSchema } from '../../utils/validation';
import type { AuthStackParamList } from '../../types/navigation.types';
import { colors, typography, spacing } from '../../theme';
import { useStores } from '../../stores';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import { translateErrorMessage, getDefaultErrorMessage } from '../../utils/errorMessages';

type PasswordResetRequestScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'PasswordResetRequest'
>;

const PasswordResetRequestScreen: React.FC = observer(() => {
  const navigation = useNavigation<PasswordResetRequestScreenNavigationProp>();
  const { authStore, uiStore } = useStores();
  const [requestSent, setRequestSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(passwordResetRequestSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      await authStore.requestPasswordReset(data.email);
      // Always show success message (security: prevents email enumeration)
      setRequestSent(true);
      uiStore.showSnackbar(
        'Если email существует, ссылка для сброса пароля отправлена на вашу почту',
        'success'
      );
    } catch (error: any) {
      const errorMessage =
        authStore.error ||
        translateErrorMessage(error?.response?.data?.message) ||
        getDefaultErrorMessage('resetPassword');
      uiStore.showSnackbar(errorMessage, 'error');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (requestSent) {
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
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Запрос отправлен</Text>
            <Text style={styles.successMessage}>
              Если email существует, ссылка для сброса пароля отправлена на вашу почту.
              Пожалуйста, проверьте вашу почту и следуйте инструкциям.
            </Text>
            <Button
              title="Вернуться к входу"
              onPress={handleBack}
              style={styles.backButton}
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
      <Header title="Восстановление пароля" showBackButton onBackPress={handleBack} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>🔐</Text>
          <Text style={styles.title}>Восстановление пароля</Text>
          <Text style={styles.subtitle}>
            Введите ваш email адрес, и мы отправим вам ссылку для сброса пароля
          </Text>
        </View>

        <View style={styles.form}>
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
                testID="password_reset_request_email_input"
              />
            )}
          />

          <Button
            title="Отправить"
            onPress={handleSubmit(onSubmit)}
            loading={authStore.loading}
            disabled={!isValid || authStore.loading}
            style={styles.submitButton}
            testID="password_reset_request_submit_button"
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  successIcon: {
    fontSize: 80,
    color: colors.success,
    marginBottom: spacing.lg,
  },
  successTitle: {
    ...typography.h1,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successMessage: {
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
});

export default PasswordResetRequestScreen;
