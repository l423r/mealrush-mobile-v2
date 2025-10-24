import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ProfileSetupStackParamList } from '../../types/navigation.types';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';

type GetHeightScreenNavigationProp = NativeStackNavigationProp<ProfileSetupStackParamList, 'GetHeight'>;
type GetHeightScreenRouteProp = RouteProp<ProfileSetupStackParamList, 'GetHeight'>;

const heightSchema = yup.object().shape({
  height: yup
    .number()
    .min(100, 'Рост должен быть не менее 100 см')
    .max(250, 'Рост должен быть не более 250 см')
    .required('Введите ваш рост'),
});

const GetHeightScreen: React.FC = () => {
  const navigation = useNavigation<GetHeightScreenNavigationProp>();
  const route = useRoute<GetHeightScreenRouteProp>();
  const [unit, setUnit] = useState<'cm' | 'ft'>('cm');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    resolver: yupResolver(heightSchema),
    mode: 'onChange',
  });

  const height = watch('height');

  const convertHeight = (value: number, from: 'cm' | 'ft', to: 'cm' | 'ft') => {
    if (from === to) return value;
    if (from === 'cm' && to === 'ft') {
      const totalInches = value / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      return feet + inches / 100; // Return as feet.inches
    }
    if (from === 'ft' && to === 'cm') {
      const feet = Math.floor(value);
      const inches = (value - feet) * 100;
      return feet * 30.48 + inches * 2.54;
    }
    return value;
  };

  const handleUnitToggle = () => {
    setUnit(unit === 'cm' ? 'ft' : 'cm');
  };

  const onSubmit = (data: { height: number }) => {
    const heightInCm = unit === 'ft' ? convertHeight(data.height, 'ft', 'cm') : data.height;
    navigation.navigate('GetBirthday', {
      gender: route.params?.gender,
      target: route.params?.target,
      weight: route.params?.weight,
      targetWeight: route.params?.targetWeight,
      height: heightInCm,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formatHeightDisplay = (value: number, unit: 'cm' | 'ft') => {
    if (unit === 'ft') {
      const feet = Math.floor(value);
      const inches = Math.round((value - feet) * 100);
      return `${feet}'${inches}"`;
    }
    return `${value} см`;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Ваш рост"
        showBackButton
        onBackPress={handleBack}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>📏</Text>
          <Text style={styles.title}>Какой у вас рост?</Text>
          <Text style={styles.subtitle}>Рост нужен для расчета ИМТ и базового метаболизма</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="height"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Рост"
                  placeholder={unit === 'cm' ? 'Введите рост в сантиметрах' : 'Введите рост в футах'}
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  onBlur={onBlur}
                  error={errors.height?.message}
                  keyboardType="numeric"
                  inputStyle={styles.heightInput}
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

          {height && (
            <View style={styles.conversion}>
              <Text style={styles.conversionText}>
                {unit === 'cm' 
                  ? formatHeightDisplay(convertHeight(height, 'cm', 'ft'), 'ft')
                  : `${Math.round(convertHeight(height, 'ft', 'cm'))} см`
                }
              </Text>
            </View>
          )}

          {height && route.params?.weight && (
            <View style={styles.bmiPreview}>
              <Text style={styles.bmiLabel}>Предварительный ИМТ:</Text>
              <Text style={styles.bmiValue}>
                {Math.round((route.params.weight / Math.pow(height / 100, 2)) * 10) / 10}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    maxWidth: 200,
  },
  heightInput: {
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
  bmiPreview: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  bmiLabel: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  bmiValue: {
    ...typography.h3,
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

export default GetHeightScreen;