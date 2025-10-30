import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { ProfileSetupStackParamList } from '../../types/navigation.types';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';

type GetTargetWeightScreenNavigationProp = NativeStackNavigationProp<
  ProfileSetupStackParamList,
  'GetTargetWeight'
>;
type GetTargetWeightScreenRouteProp = RouteProp<
  ProfileSetupStackParamList,
  'GetTargetWeight'
>;

const targetWeightSchema = yup.object().shape({
  targetWeight: yup
    .number()
    .min(30, 'Целевой вес должен быть не менее 30 кг')
    .max(300, 'Целевой вес должен быть не более 300 кг')
    .required('Введите целевой вес'),
});

const GetTargetWeightScreen: React.FC = () => {
  const navigation = useNavigation<GetTargetWeightScreenNavigationProp>();
  const route = useRoute<GetTargetWeightScreenRouteProp>();
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

  const currentWeight = route.params?.weight || 0;
  const target = route.params?.target;

  // If target is SAVE, navigate next step after first render
  React.useEffect(() => {
    if (target === 'SAVE') {
      navigation.navigate('GetHeight', {
        gender: route.params?.gender,
        target,
        weight: currentWeight,
        targetWeight: currentWeight,
      });
    }
  }, [target, currentWeight, navigation, route.params?.gender]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    resolver: yupResolver(targetWeightSchema),
    mode: 'onChange',
  });

  const targetWeight = watch('targetWeight');

  const convertWeight = (
    value: number,
    from: 'kg' | 'lbs',
    to: 'kg' | 'lbs'
  ) => {
    if (from === to) return value;
    if (from === 'kg' && to === 'lbs') return value * 2.20462;
    if (from === 'lbs' && to === 'kg') return value / 2.20462;
    return value;
  };

  const handleUnitToggle = () => {
    setUnit(unit === 'kg' ? 'lbs' : 'kg');
  };

  const onSubmit = (data: { targetWeight: number }) => {
    const targetWeightInKg =
      unit === 'lbs'
        ? convertWeight(data.targetWeight, 'lbs', 'kg')
        : data.targetWeight;
    navigation.navigate('GetHeight', {
      gender: route.params?.gender,
      target: route.params?.target,
      weight: currentWeight,
      targetWeight: targetWeightInKg,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getTargetDescription = () => {
    switch (target) {
      case 'LOSE':
        return 'Какой вес вы хотите достичь?';
      case 'GAIN':
        return 'Какой вес вы хотите набрать?';
      default:
        return 'Какой ваш целевой вес?';
    }
  };

  const getTargetEmoji = () => {
    switch (target) {
      case 'LOSE':
        return '📉';
      case 'GAIN':
        return '📈';
      default:
        return '⚖️';
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Целевой вес" showBackButton onBackPress={handleBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{getTargetEmoji()}</Text>
          <Text style={styles.title}>{getTargetDescription()}</Text>
          <Text style={styles.subtitle}>
            Текущий вес: {Math.round(currentWeight * 10) / 10} кг
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="targetWeight"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Целевой вес"
                  placeholder={`Введите вес в ${unit === 'kg' ? 'килограммах' : 'фунтах'}`}
                  value={value?.toString() || ''}
                  onChangeText={(text) => {
                    const numValue = parseFloat(text);
                    onChange(isNaN(numValue) ? 0 : numValue);
                  }}
                  onBlur={onBlur}
                  error={errors.targetWeight?.message}
                  keyboardType="numeric"
                  inputStyle={[styles.weightInput, { flex: 0 }]}
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

          {targetWeight && (
            <View style={styles.conversion}>
              <Text style={styles.conversionText}>
                {unit === 'kg'
                  ? `${Math.round(convertWeight(targetWeight, 'kg', 'lbs') * 10) / 10} фунтов`
                  : `${Math.round(convertWeight(targetWeight, 'lbs', 'kg') * 10) / 10} кг`}
              </Text>
            </View>
          )}

          {targetWeight && currentWeight && (
            <View style={styles.difference}>
              <Text style={styles.differenceText}>
                {targetWeight > currentWeight
                  ? `Нужно набрать: ${Math.round((targetWeight - currentWeight) * 10) / 10} кг`
                  : `Нужно сбросить: ${Math.round((currentWeight - targetWeight) * 10) / 10} кг`}
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
  },
  form: {
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 250,
  },
  weightInput: {
    width: 150,
    minWidth: 150,
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
    marginBottom: spacing.sm,
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
  difference: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.md,
  },
  differenceText: {
    ...typography.body2,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});

export default GetTargetWeightScreen;
