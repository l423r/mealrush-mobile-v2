import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import type { MainStackParamList } from '../../types/navigation.types';
import type { PhotoAnalysisIngredient, Meal } from '../../types/api.types';
import { useStores } from '../../stores';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import { formatNumber, formatMeasurementType, formatMealType } from '../../utils/formatting';
import { recalculateNutrients } from '../../utils/calculations';
import { imageUriToBase64 } from '../../utils/imageUtils';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import NutrientRow from '../../components/common/NutrientRow';
import CompactSummary from '../../components/common/CompactSummary';
import MealTypeConfirmDialog from '../../components/common/MealTypeConfirmDialog';

type PhotoAnalysisScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'PhotoAnalysis'
>;
type PhotoAnalysisScreenRouteProp = RouteProp<
  MainStackParamList,
  'PhotoAnalysis'
>;

interface EditableIngredient extends PhotoAnalysisIngredient {
  editedQuantity: number;
  originalProteins: number;
  originalFats: number;
  originalCarbohydrates: number;
  originalCalories: number;
}

const PhotoAnalysisScreen: React.FC = observer(() => {
  const navigation = useNavigation<PhotoAnalysisScreenNavigationProp>();
  const route = useRoute<PhotoAnalysisScreenRouteProp>();
  const { mealStore, uiStore } = useStores();

  const { analysisResult, imageUri, mealId } = route.params;

  const [mealType, setMealType] = useState<
    'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SUPPER' | 'LATE_SUPPER'
  >('BREAKFAST');
  const [mealTime] = useState(() => {
    const now = new Date();
    const selectedDate = new Date(mealStore.selectedDate);
    // Set time to current time, but keep the selected date
    selectedDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
    return selectedDate;
  });
  const [ingredients, setIngredients] = useState<EditableIngredient[]>(
    analysisResult.ingredients.map((ing) => ({
      ...ing,
      editedQuantity: ing.quantity,
      originalProteins: ing.proteins,
      originalFats: ing.fats,
      originalCarbohydrates: ing.carbohydrates,
      originalCalories: ing.calories,
    }))
  );
  const [expandedIngredients, setExpandedIngredients] = useState<Set<number>>(
    new Set()
  );
  const [showMealTypeConfirmDialog, setShowMealTypeConfirmDialog] = useState(false);
  const [existingMealForConfirm, setExistingMealForConfirm] = useState<Meal | null>(null);

  const toggleIngredientExpansion = (index: number) => {
    const newExpanded = new Set(expandedIngredients);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedIngredients(newExpanded);
  };

  const handleQuantityChange = (index: number, newQuantity: string) => {
    const quantity = Number.parseFloat(newQuantity) || 0;
    if (quantity < 0) return;

    const updatedIngredients = [...ingredients];
    const ingredient = updatedIngredients[index];

    // Пересчитываем КБЖУ на основе нового количества
    // Используем исходные значения и исходное количество для правильного пересчета
    const originalQuantity = ingredients[index].quantity;
    const recalculated = recalculateNutrients(
      ingredient.originalProteins,
      ingredient.originalFats,
      ingredient.originalCarbohydrates,
      ingredient.originalCalories,
      originalQuantity,
      quantity
    );

    updatedIngredients[index] = {
      ...ingredient,
      editedQuantity: quantity,
      proteins: recalculated.proteins,
      fats: recalculated.fats,
      carbohydrates: recalculated.carbohydrates,
      calories: recalculated.calories,
    };

    setIngredients(updatedIngredients);
  };

  const calculateTotals = () => {
    return ingredients.reduce(
      (acc, ing) => ({
        proteins: acc.proteins + ing.proteins,
        fats: acc.fats + ing.fats,
        carbohydrates: acc.carbohydrates + ing.carbohydrates,
        calories: acc.calories + ing.calories,
      }),
      { proteins: 0, fats: 0, carbohydrates: 0, calories: 0 }
    );
  };

  const totals = calculateTotals();
  const confidencePercent = Math.round(analysisResult.confidence * 100);

  const handleSave = async () => {
    try {
      console.log('💾 [PhotoAnalysisScreen] handleSave начало');
      let currentMealId = mealId;

      if (!currentMealId) {
        console.log('🔎 [PhotoAnalysisScreen] mealId не передан, проверяем существующие приемы пищи');
        console.log('  - mealType:', mealType);
        console.log('  - selectedDate:', mealStore.selectedDate.toISOString());
        
        const existingMeals = mealStore.getMealsByTypeForDate(mealType);
        console.log('  - Результат getMealsByTypeForDate:', existingMeals);
        console.log('  - Количество найденных приемов:', existingMeals.length);
        
        if (existingMeals.length > 0) {
          const latestMeal = existingMeals[0];
          console.log('✅ [PhotoAnalysisScreen] Найдены существующие приемы пищи того же типа');
          console.log('  - Последний прием:', latestMeal);
          console.log('  - Показываем диалог подтверждения');
          
          setExistingMealForConfirm(latestMeal);
          setShowMealTypeConfirmDialog(true);
          return;
        }

        console.log('ℹ️ [PhotoAnalysisScreen] Существующих приемов пищи не найдено, создаем новый');
        const meal = await mealStore.createMeal({
          mealType,
          dateTime: mealTime.toISOString(),
        });
        currentMealId = meal.id;
        console.log('✅ [PhotoAnalysisScreen] Прием пищи создан, id:', currentMealId);
      } else {
        console.log('ℹ️ [PhotoAnalysisScreen] mealId передан:', currentMealId, '- добавляем к существующему');
      }

      await saveIngredientsToMeal(currentMealId);
    } catch {
      const errorMessage = mealStore.error || 'Не удалось сохранить блюда';
      uiStore.showSnackbar(errorMessage, 'error');
    }
  };

  const saveIngredientsToMeal = async (currentMealId: number) => {
    console.log('📝 [PhotoAnalysisScreen] Сохранение ингредиентов в прием пищи:', currentMealId);
    
    // Check if we have only one ingredient - then save with photo
    const shouldSaveImage = ingredients.length === 1;
    let imageBase64: string | undefined;

    if (shouldSaveImage && imageUri) {
      console.log('📷 [PhotoAnalysisScreen] Один ингредиент - конвертируем фото для сохранения');
      const convertedImage = await imageUriToBase64(imageUri);
      if (convertedImage) {
        imageBase64 = convertedImage;
        console.log('✅ [PhotoAnalysisScreen] Фото конвертировано в base64');
      } else {
        console.warn('⚠️ [PhotoAnalysisScreen] Не удалось конвертировать фото');
      }
    }
    
      for (const ingredient of ingredients) {
        await mealStore.createMealElement({
          mealId: currentMealId,
          name: ingredient.name,
          quantity: ingredient.editedQuantity.toString(),
          proteins: ingredient.proteins,
          fats: ingredient.fats,
          carbohydrates: ingredient.carbohydrates,
          calories: ingredient.calories,
          measurementType: ingredient.measurementType,
          defaultProteins: ingredient.proteins,
          defaultFats: ingredient.fats,
          defaultCarbohydrates: ingredient.carbohydrates,
          defaultCalories: ingredient.calories,
          defaultQuantity: ingredient.editedQuantity.toString(),
        imageBase64: shouldSaveImage ? imageBase64 : undefined,
        });
      }

    uiStore.showSnackbar(
      shouldSaveImage && imageBase64
        ? 'Блюдо добавлено с фотографией'
        : 'Блюда добавлены в прием пищи',
      'success'
    );
      console.log('🚀 [PhotoAnalysisScreen] Навигация на HomeTabs > Main');
      navigation.navigate('HomeTabs', { screen: 'Main' });
  };

  const handleConfirmAddToExisting = async () => {
    console.log('✅ [PhotoAnalysisScreen.handleConfirmAddToExisting] Пользователь выбрал добавить к существующему');
    setShowMealTypeConfirmDialog(false);
    
    if (existingMealForConfirm) {
      try {
        await saveIngredientsToMeal(existingMealForConfirm.id);
      } catch (error) {
        console.error('❌ [PhotoAnalysisScreen] Ошибка при добавлении к существующему:', error);
        uiStore.showSnackbar(mealStore.error || 'Не удалось добавить блюда', 'error');
      }
    }
  };

  const handleCreateNewMeal = async () => {
    console.log('🆕 [PhotoAnalysisScreen.handleCreateNewMeal] Пользователь выбрал создать новый прием');
    setShowMealTypeConfirmDialog(false);
    
    try {
      const meal = await mealStore.createMeal({
        mealType,
        dateTime: mealTime.toISOString(),
      });
      console.log('✅ [PhotoAnalysisScreen] Прием пищи создан, id:', meal.id);
      await saveIngredientsToMeal(meal.id);
    } catch (error) {
      console.error('❌ [PhotoAnalysisScreen] Ошибка при создании нового:', error);
      uiStore.showSnackbar(mealStore.error || 'Не удалось создать прием пищи', 'error');
    }
  };

  const handleCancelDialog = () => {
    console.log('❌ [PhotoAnalysisScreen.handleCancelDialog] Пользователь отменил диалог');
    setShowMealTypeConfirmDialog(false);
    setExistingMealForConfirm(null);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const mealTypeOptions: Array<{ value: typeof mealType; label: string }> = [
    { value: 'BREAKFAST', label: 'Завтрак' },
    { value: 'LUNCH', label: 'Обед' },
    { value: 'DINNER', label: 'Ужин' },
    { value: 'SUPPER', label: 'Перекус' },
    { value: 'LATE_SUPPER', label: 'Поздний перекус' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Анализ фото" showBackButton onBackPress={handleBack} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.photo}
            resizeMode="cover"
          />
          {analysisResult.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Примечание:</Text>
              <Text style={styles.notesText}>{analysisResult.notes}</Text>
            </View>
          )}
        </View>

        {/* Confidence */}
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Уверенность анализа</Text>
          <View style={styles.confidenceBar}>
            {(() => {
              let confidenceColor: string = colors.error;
              if (confidencePercent >= 70) {
                confidenceColor = colors.success;
              } else if (confidencePercent >= 50) {
                confidenceColor = colors.warning;
              }
              return (
                <View
                  style={[
                    styles.confidenceBarFill,
                    {
                      width: `${confidencePercent}%`,
                      backgroundColor: confidenceColor,
                    },
                  ]}
                />
              );
            })()}
          </View>
          <Text style={styles.confidenceValue}>{confidencePercent}%</Text>
        </View>

        {/* Meal Settings (если не передан mealId) */}
        {!mealId && (
          <View style={styles.mealSettings}>
            <Text style={styles.sectionTitle}>Настройки приема пищи</Text>

            {/* Meal Type */}
            <View style={styles.mealTypeContainer}>
              <Text style={styles.label}>Тип приема пищи</Text>
              <View style={styles.mealTypeButtons}>
                {mealTypeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.mealTypeButton,
                      mealType === option.value && styles.mealTypeButtonActive,
                    ]}
                    onPress={() => setMealType(option.value)}
                  >
                    <Text
                      style={[
                        styles.mealTypeButtonText,
                        mealType === option.value &&
                          styles.mealTypeButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Total Nutrients */}
        <View style={styles.summary}>
          <CompactSummary
            calories={totals.calories}
            proteins={totals.proteins}
            fats={totals.fats}
            carbohydrates={totals.carbohydrates}
            variant="large"
          />
        </View>

        {/* Photo Save Banner */}
        {ingredients.length === 1 && imageUri && (
          <View style={styles.photoSaveBanner}>
            <MaterialIcons name="photo-camera" size={20} color={colors.primary} />
            <Text style={styles.photoSaveBannerText}>
              Фотография будет сохранена с блюдом
            </Text>
          </View>
        )}

        {/* Ingredients List */}
        <View style={styles.ingredientsContainer}>
          <Text style={styles.sectionTitle}>
            Ингредиенты ({ingredients.length})
          </Text>
          {ingredients.map((ingredient, index) => {
            const isExpanded = expandedIngredients.has(index);
            const ingredientKey = `${ingredient.name}-${index}`;
            return (
              <View key={ingredientKey} style={styles.ingredientCard}>
                <TouchableOpacity
                  style={styles.ingredientHeader}
                  onPress={() => toggleIngredientExpansion(index)}
                >
                  <View style={styles.ingredientInfo}>
                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                    <Text style={styles.ingredientQuantity}>
                      {formatNumber(ingredient.editedQuantity, 0)}{' '}
                      {formatMeasurementType(ingredient.measurementType)}
                    </Text>
                  </View>
                  <Text style={styles.ingredientCalories}>
                    {formatNumber(ingredient.calories, 0)} ккал
                  </Text>
                  <Text style={styles.expandIcon}>
                    {isExpanded ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.ingredientDetails}>
                    <View style={styles.quantityRow}>
                      <Text style={styles.quantityLabel}>Количество:</Text>
                      <Input
                        value={ingredient.editedQuantity.toString()}
                        onChangeText={(text) => handleQuantityChange(index, text)}
                        keyboardType="numeric"
                        style={styles.quantityInputCompact}
                      />
                      <Text style={styles.unitLabel}>
                        {formatMeasurementType(ingredient.measurementType)}
                      </Text>
                    </View>

                    <NutrientRow
                      proteins={ingredient.proteins}
                      fats={ingredient.fats}
                      carbohydrates={ingredient.carbohydrates}
                      calories={ingredient.calories}
                      showCaloriesFirst
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <Button
          title="Сохранить блюда"
          onPress={handleSave}
          disabled={mealStore.loading || ingredients.length === 0}
          loading={mealStore.loading}
        />
      </View>

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
  photoContainer: {
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  photo: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  notesContainer: {
    backgroundColor: colors.background.light,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  notesLabel: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  notesText: {
    ...typography.body2,
    color: colors.text.primary,
  },
  confidenceContainer: {
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  confidenceLabel: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: borderRadius.md,
  },
  confidenceValue: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'right',
  },
  mealSettings: {
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  mealTypeContainer: {
    marginBottom: spacing.md,
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
    color: colors.text.primary,
  },
  mealTypeButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  summary: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  photoSaveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  photoSaveBannerText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '500',
  },
  ingredientsContainer: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  ingredientCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  ingredientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  ingredientQuantity: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  ingredientCalories: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  expandIcon: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  ingredientDetails: {
    padding: spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quantityLabel: {
    ...typography.body2,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  quantityInputCompact: {
    width: 80,
    marginRight: spacing.sm,
  },
  unitLabel: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    ...shadows.md,
  },
});

export default PhotoAnalysisScreen;
