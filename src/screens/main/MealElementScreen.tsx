import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { MainStackParamList } from '../../types/navigation.types';
import type { Product, MealElement } from '../../types/api.types';
import { useStores } from '../../stores';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { formatCalories, formatWeight, formatMealType } from '../../utils/formatting';
import { recalculateNutrients } from '../../utils/calculations';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

type MealElementScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'MealElement'
>;
type MealElementScreenRouteProp = RouteProp<MainStackParamList, 'MealElement'>;

const mealElementSchema = yup.object().shape({
  quantity: yup.string().required('Количество обязательно'),
  proteins: yup
    .number()
    .min(0, 'Белки не могут быть отрицательными')
    .required('Белки обязательны'),
  fats: yup
    .number()
    .min(0, 'Жиры не могут быть отрицательными')
    .required('Жиры обязательны'),
  carbohydrates: yup
    .number()
    .min(0, 'Углеводы не могут быть отрицательными')
    .required('Углеводы обязательны'),
  calories: yup
    .number()
    .min(0, 'Калории не могут быть отрицательными')
    .required('Калории обязательны'),
});

const MealElementScreen: React.FC = observer(() => {
  const navigation = useNavigation<MealElementScreenNavigationProp>();
  const route = useRoute<MealElementScreenRouteProp>();
  const { mealStore, uiStore } = useStores();

  const item = route.params?.item;
  const isEditing = !!item && 'mealId' in item; // MealElement has mealId
  const isFromSearch = route.params?.fromSearch;
  const readOnly = route.params?.readOnly || false;

  const [mealType, setMealType] = useState<
    'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SUPPER' | 'LATE_SUPPER'
  >('BREAKFAST');
  const [mealTime] = useState(new Date());
  const [isCalculating, setIsCalculating] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(mealElementSchema),
    mode: 'onChange',
    defaultValues: {
      quantity: isEditing ? (item as MealElement).quantity : '100',
      proteins: isEditing
        ? (item as MealElement).proteins
        : (item as Product)?.proteins || 0,
      fats: isEditing
        ? (item as MealElement).fats
        : (item as Product)?.fats || 0,
      carbohydrates: isEditing
        ? (item as MealElement).carbohydrates
        : (item as Product)?.carbohydrates || 0,
      calories: isEditing
        ? (item as MealElement).calories
        : (item as Product)?.calories || 0,
    },
  });

  const watchedQuantity = watch('quantity');
  const watchedCalories = watch('calories');

  useEffect(() => {
    if (item && 'proteins' in item) {
      // It's a Product, calculate nutrients for default quantity
      const product = item as Product;
      const quantity = Number.parseFloat(watchedQuantity) || 100;
      const baseQuantity = Number.parseFloat(product.quantity) || 100;

      const recalculated = recalculateNutrients(
        product.proteins,
        product.fats,
        product.carbohydrates,
        product.calories,
        baseQuantity,
        quantity
      );

      setValue('proteins', recalculated.proteins);
      setValue('fats', recalculated.fats);
      setValue('carbohydrates', recalculated.carbohydrates);
      setValue('calories', recalculated.calories);
    }
  }, [watchedQuantity, item, setValue]);

  const handleQuantityChange = (quantity: string) => {
    if (item && 'proteins' in item) {
      const product = item as Product;
      const quantityNum = Number.parseFloat(quantity) || 0;
      const baseQuantity = Number.parseFloat(product.quantity) || 100;

      setIsCalculating(true);

      const recalculated = recalculateNutrients(
        product.proteins,
        product.fats,
        product.carbohydrates,
        product.calories,
        baseQuantity,
        quantityNum
      );

      setValue('proteins', recalculated.proteins);
      setValue('fats', recalculated.fats);
      setValue('carbohydrates', recalculated.carbohydrates);
      setValue('calories', recalculated.calories);

      setTimeout(() => setIsCalculating(false), 300);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (isEditing) {
        // Update existing meal element
        const mealElement = item as MealElement;
        await mealStore.updateMealElement(mealElement.id, {
          quantity: data.quantity,
          proteins: data.proteins,
          fats: data.fats,
          carbohydrates: data.carbohydrates,
          calories: data.calories,
        });
        uiStore.showSnackbar('Блюдо обновлено', 'success');
      } else {
        // Create new meal element
        let mealId = route.params?.mealId;

        if (!mealId) {
          // Create new meal
          const meal = await mealStore.createMeal({
            mealType: mealType,
            dateTime: mealTime.toISOString(),
          });
          mealId = meal.id;
        }

        const elementData = {
          mealId: mealId,
          parentProductId: item && 'id' in item ? item.id : undefined,
          name: item?.name || 'Блюдо',
          quantity: data.quantity,
          proteins: data.proteins,
          fats: data.fats,
          carbohydrates: data.carbohydrates,
          calories: data.calories,
          measurementType: 'GRAM' as const,
          defaultProteins: item?.proteins || data.proteins,
          defaultFats: item?.fats || data.fats,
          defaultCarbohydrates: item?.carbohydrates || data.carbohydrates,
          defaultCalories: item?.calories || data.calories,
          defaultQuantity: item?.quantity || '100',
        };

        await mealStore.createMealElement(elementData);
        uiStore.showSnackbar('Блюдо добавлено', 'success');
      }

      navigation.navigate('HomeTabs', { screen: 'Main' });
    } catch {
      uiStore.showSnackbar(
        mealStore.error || 'Не удалось сохранить блюдо',
        'error'
      );
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getTitle = () => {
    if (readOnly) return 'Просмотр продукта';
    if (isEditing) return 'Редактирование блюда';
    if (isFromSearch) return 'Добавление блюда';
    return 'Создание блюда';
  };

  return (
    <View style={styles.container}>
      <Header title={getTitle()} showBackButton onBackPress={handleBack} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        {/* Product Info */}
        {item && (
          <View style={styles.productInfo}>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.productImagePlaceholder}>
                <Text style={styles.productImagePlaceholderIcon}>🍽️</Text>
              </View>
            )}
            <Text style={styles.productName}>{item.name}</Text>
          </View>
        )}

        {/* Quantity and Nutrients */}
        <View style={styles.nutrientsSection}>
          {/* Горизонтальный контейнер для инпутов и типа приема пищи */}
          <View style={styles.nutrientsRow}>
            {/* Левая часть: Инпуты */}
            <View style={styles.nutrientsLeft}>
              {/* Первый ряд: Количество и Калории */}
              <View style={styles.topRow}>
                <Controller
                  control={control}
                  name="quantity"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Количество (г)"
                      placeholder="100"
                      value={value}
                      onChangeText={(text) => {
                        onChange(text);
                        handleQuantityChange(text);
                      }}
                      onBlur={onBlur}
                      error={errors.quantity?.message}
                      keyboardType="numeric"
                      containerStyle={styles.topRowInput}
                      inputStyle={styles.numericInput}
                      editable={!readOnly}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="calories"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Калории (ккал)"
                      placeholder="0"
                      value={value?.toString() || ''}
                      onChangeText={(text) => onChange(Number.parseFloat(text) || 0)}
                      onBlur={onBlur}
                      error={errors.calories?.message}
                      keyboardType="numeric"
                      containerStyle={styles.topRowInput}
                      inputStyle={styles.numericInput}
                      editable={!readOnly}
                    />
                  )}
                />
              </View>

              {/* Второй ряд: Белки, Жиры, Углеводы */}
              <View style={styles.bottomRow}>
                <Controller
                  control={control}
                  name="proteins"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Белки (г)"
                      placeholder="0"
                      value={value?.toString() || ''}
                      onChangeText={(text) => onChange(Number.parseFloat(text) || 0)}
                      onBlur={onBlur}
                      error={errors.proteins?.message}
                      keyboardType="numeric"
                      containerStyle={styles.bottomRowInput}
                      inputStyle={styles.numericInput}
                      editable={!readOnly}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="fats"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Жиры (г)"
                      placeholder="0"
                      value={value?.toString() || ''}
                      onChangeText={(text) => onChange(Number.parseFloat(text) || 0)}
                      onBlur={onBlur}
                      error={errors.fats?.message}
                      keyboardType="numeric"
                      containerStyle={styles.bottomRowInput}
                      inputStyle={styles.numericInput}
                      editable={!readOnly}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="carbohydrates"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Углеводы (г)"
                      placeholder="0"
                      value={value?.toString() || ''}
                      onChangeText={(text) => onChange(Number.parseFloat(text) || 0)}
                      onBlur={onBlur}
                      error={errors.carbohydrates?.message}
                      keyboardType="numeric"
                      containerStyle={styles.bottomRowInput}
                      inputStyle={styles.numericInput}
                      editable={!readOnly}
                    />
                  )}
                />
              </View>
            </View>

            {/* Правая часть: Тип приема пищи (вертикально) */}
            {!isEditing && !route.params?.mealId && !readOnly && (
              <View style={styles.mealTypeVertical}>
                {['BREAKFAST', 'LUNCH', 'DINNER', 'SUPPER', 'LATE_SUPPER'].map(
                  (type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.mealTypeButtonVertical,
                        mealType === type && styles.mealTypeButtonVerticalActive,
                      ]}
                      onPress={() => setMealType(type as any)}
                    >
                      <Text
                        style={[
                          styles.mealTypeButtonTextVertical,
                          mealType === type && styles.mealTypeButtonTextVerticalActive,
                        ]}
                      >
                        {formatMealType(type)}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}
          </View>

          {/* Итого - на всю ширину */}
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              Итого: {formatWeight(Number.parseFloat(watchedQuantity) || 0)} •{' '}
              {formatCalories(watchedCalories || 0)}
              {!isEditing && !route.params?.mealId && ` • ${formatMealType(mealType)}`}
            </Text>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {!readOnly && (
        <View style={styles.footer}>
          <Button
            title={isEditing ? 'Сохранить изменения' : 'Добавить блюдо'}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || mealStore.loading}
            loading={mealStore.loading}
          />
        </View>
      )}
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  productInfo: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    alignItems: 'center',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  productImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  productImagePlaceholderIcon: {
    fontSize: 48,
  },
  productName: {
    ...typography.h4,
    color: colors.text.primary,
    textAlign: 'center',
  },
  mealSettings: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  mealTypeContainer: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mealTypeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.default,
  },
  mealTypeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  mealTypeButtonText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  mealTypeButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  nutrientsSection: {
    padding: spacing.md,
  },
  nutrientsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  nutrientsLeft: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  topRowInput: {
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  bottomRowInput: {
    flex: 1,
  },
  numericInput: {
    textAlign: 'right',
    paddingRight: spacing.md,
  },
  calculatingIcon: {
    fontSize: 16,
  },
  autoIcon: {
    fontSize: 16,
  },
  summary: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  summaryText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  mealTypeVertical: {
    flexDirection: 'column',
    gap: spacing.xs,
    minWidth: 120,
    alignSelf: 'stretch',
  },
  mealTypeButtonVertical: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTypeButtonVerticalActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  mealTypeButtonTextVertical: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  mealTypeButtonTextVerticalActive: {
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

export default MealElementScreen;
