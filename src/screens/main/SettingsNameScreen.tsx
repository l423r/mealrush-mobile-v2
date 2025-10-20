import React from 'react';
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

type SettingsNameScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'SettingsName'>;

const nameSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .required('Имя обязательно'),
});

const SettingsNameScreen: React.FC = observer(() => {
  const navigation = useNavigation<SettingsNameScreenNavigationProp>();
  const { authStore } = useStores();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(nameSchema),
    mode: 'onChange',
    defaultValues: {
      name: authStore.user?.name || '',
    },
  });

  const onSubmit = async (data: { name: string }) => {
    try {
      // TODO: Implement name update API
      Alert.alert('Успех', 'Имя обновлено');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить имя');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Изменение имени"
        showBackButton
        onBackPress={handleBack}
      />
      
      <View style={styles.content}>
        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Имя"
                placeholder="Введите ваше имя"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                autoCapitalize="words"
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

export default SettingsNameScreen;