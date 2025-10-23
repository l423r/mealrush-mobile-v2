import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AuthStackParamList } from '../../types/navigation.types';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';

type GetWeightScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'GetWeight'>;
type GetWeightScreenRouteProp = RouteProp<AuthStackParamList, 'GetWeight'>;

const weightSchema = yup.object().shape({
  weight: yup
    .number()
    .min(30, 'Вес должен быть не менее 30 кг')
    .max(300, 'Вес должен быть не более 300 кг')
    .required('Введите ваш вес'),
});

const GetWeightScreen: React.FC = () => {
  const navigation = useNavigation<GetWeightScreenNavigationProp>();
  const route = useRoute<GetWeightScreenRouteProp>();
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    resolver: yupResolver(weightSchema),
    mode: 'onChange',
  });

  const weight = watch('weight');

  const convertWeight = (value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs') => {
    if (from === to) return value;
    if (from === 'kg' && to === 'lbs') return value * 2.20462;
    if (from === 'lbs' && to === 'kg') return value / 2.20462;
    return value;
  };

  const handleUnitToggle = () => {
    const currentWeight = weight || 0;
    const newUnit = unit === 'kg' ? 'lbs' : 'kg';
    const convertedWeight = convertWeight(currentWeight, unit, newUnit);
    
    setUnit(newUnit);
    // Update form value with converted weight
    // This would require a setValue call from react-hook-form
  };

  const onSubmit = (data: { weight: number }) => {
    const weightInKg = unit === 'lbs' ? convertWeight(data.weight, 'lbs', 'kg') : data.weight;
    navigation.navigate('GetTargetWeight', {
      gender: route.params?.gender,
      target: route.params?.target,
      weight: weightInKg,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Ваш вес"
        showBackButton
        onBackPress={handleBack}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Какой у вас текущий вес?</Text>
          <Text style={styles.subtitle}>Точный вес поможет рассчитать вашу дневную норму калорий</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="weight"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Вес"
                  placeholder={`Введите вес в ${unit === 'kg' ? 'килограммах' : 'фунтах'}`}
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  onBlur={onBlur}
                  error={errors.weight?.message}
                  keyboardType="numeric"
                  inputStyle={styles.weightInput}
                />
              )}
            />
            
            <TouchableOpacity
              style={styles.unitButton}
              onPress={handleUnitToggle}
            >
              <Text style={styles.unitText}>{unit.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

          {weight && (
            <View style={styles.conversion}>
              <Text style={styles.conversionText}>
                {unit === 'kg' 
                  ? `${Math.round(convertWeight(weight, 'kg', 'lbs') * 10) / 10} фунтов`
                  : `${Math.round(convertWeight(weight, 'lbs', 'kg') * 10) / 10} кг`
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Далее"
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid}
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
  form: {
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    maxWidth: 200,
  },
  weightInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  unitButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  unitText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
  conversion: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
  },
  conversionText: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});

export default GetWeightScreen;