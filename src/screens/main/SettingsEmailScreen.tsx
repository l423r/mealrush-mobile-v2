import React from 'react';
import { View, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { MainStackParamList } from '../../types/navigation.types';
import { useStores } from '../../stores';
import { colors, spacing } from '../../theme';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

type SettingsEmailScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'SettingsEmail'
>;

const emailSchema = yup.object().shape({
  email: yup
    .string()
    .email('Введите корректный email')
    .required('Email обязателен'),
});

const SettingsEmailScreen: React.FC = observer(() => {
  const navigation = useNavigation<SettingsEmailScreenNavigationProp>();
  const { authStore, uiStore } = useStores();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(emailSchema),
    mode: 'onChange',
    defaultValues: {
      email: authStore.user?.email || '',
    },
  });

  const onSubmit = async () => {
    try {
      // TODO: Implement email update API
      uiStore.showSnackbar('Email обновлен', 'success');
      navigation.goBack();
    } catch {
      uiStore.showSnackbar('Не удалось обновить email', 'error');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header title="Изменение email" showBackButton onBackPress={handleBack} />

      <View style={styles.content}>
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
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});

export default SettingsEmailScreen;
