import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useStores } from '../../stores';
import type { AuthStackParamList } from '../../types/navigation.types';
import { loginSchema } from '../../utils/validation';
import { colors, typography, spacing } from '../../theme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import AlertDialog from '../../components/common/AlertDialog';
import { useAlert } from '../../hooks/useAlert';

type SignInScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'SignIn'
>;

const SignInScreen: React.FC = observer(() => {
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const { authStore, uiStore } = useStores();
  const { alertState, showInfo, hideAlert } = useAlert();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      await authStore.login(data);
      // Navigation will be handled by AppNavigator based on auth state
    } catch (error) {
      console.error('Login error:', error);
      uiStore.showSnackbar(
        authStore.error || 'Не удалось войти в систему',
        'error'
      );
    }
  };

  const handleRegister = () => {
    navigation.navigate('SimpleRegistration');
  };

  const handleForgotPassword = () => {
    showInfo(
      'Восстановление пароля',
      'Функция восстановления пароля будет доступна в следующей версии'
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>MealRush</Text>
            <Text style={styles.subtitle}>Отслеживание питания и калорий</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="Введите ваш email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="sign_in_email_input"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Пароль"
                  placeholder="Введите ваш пароль"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry={!showPassword}
                  rightIcon={
                    <TouchableOpacity
                      testID="password_toggle_icon"
                      accessible={true}
                      accessibilityLabel="password_toggle_icon"
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.eyeIcon}>
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </Text>
                    </TouchableOpacity>
                  }
                  testID="sign_in_password_input"
                />
              )}
            />

            <Button
              title="Войти"
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || authStore.loading}
              loading={authStore.loading}
              style={styles.loginButton}
              testID="sign_in_login_button"
            />

            <Button
              title="Забыли пароль?"
              onPress={handleForgotPassword}
              variant="text"
              style={styles.forgotButton}
              testID="sign_in_forgot_password_button"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Нет аккаунта?</Text>
            <Button
              title="Зарегистрироваться"
              onPress={handleRegister}
              variant="outline"
              style={styles.registerButton}
              testID="sign_in_register_button"
            />
          </View>
        </View>
      </ScrollView>

      <AlertDialog
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        onConfirm={alertState.onConfirm}
        onDismiss={hideAlert}
      />
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  loginButton: {
    marginTop: spacing.lg,
  },
  forgotButton: {
    marginTop: spacing.md,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  registerButton: {
    minWidth: 200,
  },
  eyeIcon: {
    fontSize: 20,
  },
});

export default SignInScreen;
