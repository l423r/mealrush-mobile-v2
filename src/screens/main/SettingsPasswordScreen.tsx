import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MainStackParamList } from '../../types/navigation.types';
import { useStores } from '../../stores';
import { colors, typography, spacing } from '../../theme';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

type SettingsPasswordScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'SettingsPassword'>;

const passwordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Текущий пароль обязателен'),
  newPassword: yup
    .string()
    .min(8, 'Новый пароль должен содержать минимум 8 символов')
    .required('Новый пароль обязателен'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Пароли не совпадают')
    .required('Подтверждение пароля обязательно'),
});

const SettingsPasswordScreen: React.FC = observer(() => {
  const navigation = useNavigation<SettingsPasswordScreenNavigationProp>();
  const { authStore } = useStores();
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(passwordSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    try {
      // TODO: Implement password update API
      Alert.alert('Успех', 'Пароль обновлен');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить пароль');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Изменение пароля"
        showBackButton
        onBackPress={handleBack}
      />
      
      <View style={styles.content}>
        <View style={styles.form}>
          <Controller
            control={control}
            name="currentPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Текущий пароль"
                placeholder="Введите текущий пароль"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.currentPassword?.message}
                secureTextEntry={!showCurrentPassword}
                rightIcon={
                  <Text style={styles.eyeIcon}>
                    {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                }
                onRightIconPress={() => setShowCurrentPassword(!showCurrentPassword)}
              />
            )}
          />

          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Новый пароль"
                placeholder="Введите новый пароль"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.newPassword?.message}
                secureTextEntry={!showNewPassword}
                rightIcon={
                  <Text style={styles.eyeIcon}>
                    {showNewPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                }
                onRightIconPress={() => setShowNewPassword(!showNewPassword)}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Подтвердите новый пароль"
                placeholder="Повторите новый пароль"
                value={value}
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
      </View>

      <View style={styles.footer}>
        <Button
          title="Сохранить"
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid}
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
    flex: 1,
    padding: spacing.lg,
  },
  form: {
    flex: 1,
  },
  eyeIcon: {
    fontSize: 20,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});

export default SettingsPasswordScreen;