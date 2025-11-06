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
import type { Product, MealElement, Meal } from '../../types/api.types';
import { useStores } from '../../stores';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { formatCalories, formatWeight, formatMealType } from '../../utils/formatting';
import { recalculateNutrients } from '../../utils/calculations';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import MealTypeConfirmDialog from '../../components/common/MealTypeConfirmDialog';

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
  const { mealStore, uiStore, productStore } = useStores();

  const item = route.params?.item;
  const isEditing = !!item && 'mealId' in item; // MealElement has mealId
  const isFromSearch = route.params?.fromSearch;
  const readOnly = route.params?.readOnly || false;

  const [mealType, setMealType] = useState<
    'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SUPPER' | 'LATE_SUPPER'
  >('BREAKFAST');
  const [mealTime] = useState(new Date());
  const [isCalculating, setIsCalculating] = useState(false);
  const [showMealTypeConfirmDialog, setShowMealTypeConfirmDialog] = useState(false);
  const [existingMealForConfirm, setExistingMealForConfirm] = useState<Meal | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    getValues,
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
  const watchedProteins = watch('proteins');
  const watchedFats = watch('fats');
  const watchedCarbohydrates = watch('carbohydrates');

  // Debug: log when dialog visibility changes
  useEffect(() => {
    console.log('🔔 [MealElementScreen] Dialog visibility changed:', showMealTypeConfirmDialog);
    console.log('  - existingMealForConfirm:', existingMealForConfirm);
  }, [showMealTypeConfirmDialog, existingMealForConfirm]);

  // Auto-calculate calories when BJU changes (only when manually editing, not for product quantity changes)
  useEffect(() => {
    // Only auto-calculate if editing a meal element (not a product with base calculations)
    if (isEditing && watchedProteins !== undefined && watchedFats !== undefined && watchedCarbohydrates !== undefined) {
      const calculatedCalories = (watchedProteins * 4) + (watchedFats * 9) + (watchedCarbohydrates * 4);
      const roundedCalories = Math.round(calculatedCalories * 10) / 10;
      
      // Only update if the calculated value is different from current to avoid infinite loops
      if (Math.abs(roundedCalories - (watchedCalories || 0)) > 0.1) {
        console.log('🔢 [MealElementScreen] Auto-calculating calories from BJU:', {
          proteins: watchedProteins,
          fats: watchedFats,
          carbohydrates: watchedCarbohydrates,
          calculatedCalories: roundedCalories
        });
        setValue('calories', roundedCalories);
      }
    }
  }, [watchedProteins, watchedFats, watchedCarbohydrates, isEditing, setValue, watchedCalories]);

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
      console.log('🔄 [MealElementScreen] onSubmit - начало', { isEditing, data });
      
      if (isEditing) {
        // Update existing meal element
        console.log('✏️ [MealElementScreen] Обновление существующего элемента');
        const mealElement = item as MealElement;
        await mealStore.updateMealElement(mealElement.id, {
          quantity: data.quantity,
          proteins: data.proteins,
          fats: data.fats,
          carbohydrates: data.carbohydrates,
          calories: data.calories,
        });
        uiStore.showSnackbar('Блюдо обновлено', 'success');
        console.log('🚀 [MealElementScreen] Навигация на HomeTabs > Main');
        navigation.navigate('HomeTabs', { screen: 'Main' });
        console.log('✅ [MealElementScreen] Команда навигации выполнена');
      } else {
        // Create new meal element
        console.log('➕ [MealElementScreen] Создание нового элемента');
        console.log('  - isEditing:', isEditing);
        console.log('  - route.params?.mealId:', route.params?.mealId);
        console.log('  - mealType:', mealType);
        console.log('  - selectedDate:', mealStore.selectedDate.toISOString());
        
        let mealId = route.params?.mealId;

        if (!mealId) {
          console.log('🔎 [MealElementScreen] mealId не передан, проверяем существующие приемы пищи');
          
          // Check if there's an existing meal of the same type
          const existingMeals = mealStore.getMealsByTypeForDate(mealType);
          console.log('  - Результат getMealsByTypeForDate:', existingMeals);
          console.log('  - Количество найденных приемов:', existingMeals.length);
          
          if (existingMeals.length > 0) {
            // Show confirmation dialog
            const latestMeal = existingMeals[0];
            console.log('✅ [MealElementScreen] Найдены существующие приемы пищи того же типа');
            console.log('  - Последний прием:', latestMeal);
            console.log('  - ID последнего приема:', latestMeal.id);
            console.log('  - Время последнего приема:', latestMeal.dateTime);
            console.log('  - Показываем диалог подтверждения');
            
            setExistingMealForConfirm(latestMeal);
            setShowMealTypeConfirmDialog(true);
            console.log('  - Диалог установлен, выходим из onSubmit');
            return; // Wait for user decision
          }

          console.log('ℹ️ [MealElementScreen] Существующих приемов пищи не найдено, создаем новый');
          // Create new meal
          console.log('🍽️ [MealElementScreen] Создание нового приема пищи');
          const meal = await mealStore.createMeal({
            mealType: mealType,
            dateTime: mealTime.toISOString(),
          });
          mealId = meal.id;
          console.log('✅ [MealElementScreen] Прием пищи создан, id:', mealId);
        } else {
          console.log('ℹ️ [MealElementScreen] mealId передан:', mealId, '- добавляем к существующему');
        }

        await createMealElementWithId(mealId, data);
      }
    } catch (error) {
      console.error('❌ [MealElementScreen] Ошибка в onSubmit:', error);
      uiStore.showSnackbar(
        mealStore.error || 'Не удалось сохранить блюдо',
        'error'
      );
    }
  };

  const createMealElementWithId = async (mealId: number, data: any) => {
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

    console.log('📝 [MealElementScreen] Создание элемента приема пищи:', elementData);
    await mealStore.createMealElement(elementData);
    console.log('✅ [MealElementScreen] Элемент создан успешно');
    uiStore.showSnackbar('Блюдо добавлено', 'success');

    console.log('🚀 [MealElementScreen] Навигация на HomeTabs > Main');
    navigation.navigate('HomeTabs', { screen: 'Main' });
    console.log('✅ [MealElementScreen] Команда навигации выполнена');
  };

  const handleConfirmAddToExisting = async () => {
    console.log('✅ [MealElementScreen.handleConfirmAddToExisting] Пользователь выбрал добавить к существующему');
    console.log('  - existingMealForConfirm:', existingMealForConfirm);
    
    setShowMealTypeConfirmDialog(false);
    
    if (existingMealForConfirm) {
      try {
        console.log('  - Получаем данные формы');
        const data = getValues();
        console.log('  - Данные формы:', data);
        console.log('  - Добавляем к приему пищи ID:', existingMealForConfirm.id);
        
        await createMealElementWithId(existingMealForConfirm.id, data);
      } catch (error) {
        console.error('❌ [MealElementScreen] Ошибка при добавлении к существующему:', error);
        uiStore.showSnackbar(
          mealStore.error || 'Не удалось добавить блюдо',
          'error'
        );
      }
    } else {
      console.warn('⚠️ [MealElementScreen] existingMealForConfirm is null!');
    }
  };

  const handleCreateNewMeal = async () => {
    console.log('🆕 [MealElementScreen.handleCreateNewMeal] Пользователь выбрал создать новый прием');
    console.log('  - mealType:', mealType);
    console.log('  - mealTime:', mealTime.toISOString());
    
    setShowMealTypeConfirmDialog(false);
    
    try {
      // Create new meal
      console.log('🍽️ [MealElementScreen] Создание нового приема пищи (пользователь выбрал создать новый)');
      const meal = await mealStore.createMeal({
        mealType: mealType,
        dateTime: mealTime.toISOString(),
      });
      console.log('✅ [MealElementScreen] Прием пищи создан, id:', meal.id);

      const data = getValues();
      console.log('  - Данные формы:', data);
      await createMealElementWithId(meal.id, data);
    } catch (error) {
      console.error('❌ [MealElementScreen] Ошибка при создании нового:', error);
      uiStore.showSnackbar(
        mealStore.error || 'Не удалось создать прием пищи',
        'error'
      );
    }
  };

  const handleCancelDialog = () => {
    console.log('❌ [MealElementScreen.handleCancelDialog] Пользователь отменил диалог');
    setShowMealTypeConfirmDialog(false);
    setExistingMealForConfirm(null);
  };

  const handleSaveAsProduct = async () => {
    try {
      console.log('💾 [MealElementScreen.handleSaveAsProduct] Сохранение блюда как продукта');
      
      const formData = getValues();
      const productName = item?.name || 'Блюдо';
      const currentQuantity = Number.parseFloat(formData.quantity) || 100;
      
      // Пересчитываем КБЖУ на 100г
      const targetQuantity = 100;
      const ratio = targetQuantity / currentQuantity;
      
      const proteinsFor100g = Math.round(formData.proteins * ratio * 10) / 10;
      const fatsFor100g = Math.round(formData.fats * ratio * 10) / 10;
      const carbohydratesFor100g = Math.round(formData.carbohydrates * ratio * 10) / 10;
      const caloriesFor100g = Math.round(formData.calories * ratio * 10) / 10;
      
      const productData = {
        name: productName,
        proteins: proteinsFor100g,
        fats: fatsFor100g,
        carbohydrates: carbohydratesFor100g,
        calories: caloriesFor100g,
        quantity: '100',
        measurementType: 'GRAM' as const,
      };

      console.log('  - Текущее количество:', currentQuantity + 'г');
      console.log('  - Текущие КБЖУ:', {
        proteins: formData.proteins,
        fats: formData.fats,
        carbohydrates: formData.carbohydrates,
        calories: formData.calories
      });
      console.log('  - КБЖУ на 100г:', {
        proteins: proteinsFor100g,
        fats: fatsFor100g,
        carbohydrates: carbohydratesFor100g,
        calories: caloriesFor100g
      });
      console.log('  - Данные продукта:', productData);
      
      await productStore.createProduct(productData);
      
      console.log('✅ [MealElementScreen] Продукт создан успешно');
      uiStore.showSnackbar(`Продукт "${productName}" сохранен (100г)`, 'success');
    } catch (error) {
      console.error('❌ [MealElementScreen] Ошибка при сохранении продукта:', error);
      uiStore.showSnackbar(
        productStore.error || 'Не удалось сохранить продукт',
        'error'
      );
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getTitle = () => {
    if (readOnly) return 'Просмотр';
    if (isEditing) return 'Редактирование';
    if (isFromSearch) return 'Добавление';
    return 'Создание';
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
          {isEditing && (
            <Button
              title="Сохранить как продукт"
              onPress={handleSaveAsProduct}
              disabled={!isValid || productStore.loading}
              loading={productStore.loading}
              style={styles.secondaryButton}
              variant="outline"
            />
          )}
        </View>
      )}

      {/* Диалог подтверждения добавления к существующему приему */}
      <MealTypeConfirmDialog
        visible={showMealTypeConfirmDialog}
        onConfirm={handleConfirmAddToExisting}
        onCreateNew={handleCreateNewMeal}
        onCancel={handleCancelDialog}
        mealTypeName={formatMealType(mealType)}
        mealTime={existingMealForConfirm ? new Date(existingMealForConfirm.dateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}
      />
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
  secondaryButton: {
    marginTop: spacing.sm,
  },
});

export default MealElementScreen;
