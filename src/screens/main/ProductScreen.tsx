import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as ImagePicker from 'expo-image-picker';
import type { MainStackParamList } from '../../types/navigation.types';
import { useStores } from '../../stores';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { productSchema } from '../../utils/validation';
import { calculateCalories } from '../../utils/calculations';
import {
  requestCameraPermission,
  requestMediaLibraryPermission,
  imageUriToBase64,
} from '../../utils/imageUtils';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ImageSourceDialog from '../../components/common/ImageSourceDialog';
import AlertDialog from '../../components/common/AlertDialog';
import { useAlert, useImageSource } from '../../hooks/useAlert';

type ProductScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'Product'
>;
type ProductScreenRouteProp = RouteProp<MainStackParamList, 'Product'>;

const ProductScreen: React.FC = observer(() => {
  const navigation = useNavigation<ProductScreenNavigationProp>();
  const route = useRoute<ProductScreenRouteProp>();
  const { productStore, uiStore } = useStores();
  const { alertState, showConfirm, hideAlert } = useAlert();
  const imageSource = useImageSource();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [inputMode, setInputMode] = useState<'per100g' | 'perPortion'>('per100g');

  // String states for decimal input
  const [proteinsStr, setProteinsStr] = useState<string>('');
  const [fatsStr, setFatsStr] = useState<string>('');
  const [carbohydratesStr, setCarbohydratesStr] = useState<string>('');
  const [caloriesStr, setCaloriesStr] = useState<string>('');

  const product = route.params?.product;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(productSchema),
    mode: 'onChange',
    defaultValues: {
      name: product?.name || '',
      proteins: product?.proteins || 0,
      fats: product?.fats || 0,
      carbohydrates: product?.carbohydrates || 0,
      calories: product?.calories || 0,
      quantity: product?.quantity || '100',
      portionQuantity: 100,
    },
  });

  const watchedProteins = watch('proteins');
  const watchedFats = watch('fats');
  const watchedCarbohydrates = watch('carbohydrates');
  const watchedCalories = watch('calories');

  useEffect(() => {
    if (product) {
      setIsEditing(true);
      setImageUri(product.imageUrl || null);
      // Initialize string states with product values
      setProteinsStr(product.proteins?.toString() || '0');
      setFatsStr(product.fats?.toString() || '0');
      setCarbohydratesStr(product.carbohydrates?.toString() || '0');
      setCaloriesStr(product.calories?.toString() || '0');
    } else {
      // Initialize with default values
      setProteinsStr('0');
      setFatsStr('0');
      setCarbohydratesStr('0');
      setCaloriesStr('0');
    }
  }, [product]);

  useEffect(() => {
    // Auto-calculate calories when macronutrients change
    if (watchedProteins > 0 || watchedFats > 0 || watchedCarbohydrates > 0) {
      const calculatedCalories = calculateCalories(
        watchedProteins,
        watchedFats,
        watchedCarbohydrates
      );

      // Only update if the calculated value is different from current to avoid infinite loops
      if (Math.abs(calculatedCalories - (watchedCalories || 0)) > 0.1) {
        setIsCalculating(true);
        setValue('calories', calculatedCalories);
        setCaloriesStr(calculatedCalories.toString());
        setTimeout(() => setIsCalculating(false), 500);
      }
    }
  }, [watchedProteins, watchedFats, watchedCarbohydrates, watchedCalories, setValue]);

  // Update string states when form values change externally (e.g., from auto-calculation)
  useEffect(() => {
    if (watchedProteins !== undefined && watchedProteins !== null) {
      const currentStr = Number.parseFloat(proteinsStr);
      if (Number.isNaN(currentStr) || Math.abs(currentStr - watchedProteins) > 0.01) {
        setProteinsStr(watchedProteins.toString());
      }
    }
  }, [watchedProteins, proteinsStr]);

  useEffect(() => {
    if (watchedFats !== undefined && watchedFats !== null) {
      const currentStr = Number.parseFloat(fatsStr);
      if (Number.isNaN(currentStr) || Math.abs(currentStr - watchedFats) > 0.01) {
        setFatsStr(watchedFats.toString());
      }
    }
  }, [watchedFats, fatsStr]);

  useEffect(() => {
    if (watchedCarbohydrates !== undefined && watchedCarbohydrates !== null) {
      const currentStr = Number.parseFloat(carbohydratesStr);
      if (Number.isNaN(currentStr) || Math.abs(currentStr - watchedCarbohydrates) > 0.01) {
        setCarbohydratesStr(watchedCarbohydrates.toString());
      }
    }
  }, [watchedCarbohydrates, carbohydratesStr]);

  useEffect(() => {
    if (watchedCalories !== undefined && watchedCalories !== null) {
      const currentStr = Number.parseFloat(caloriesStr);
      if (Number.isNaN(currentStr) || Math.abs(currentStr - watchedCalories) > 0.01) {
        setCaloriesStr(watchedCalories.toString());
      }
    }
  }, [watchedCalories, caloriesStr]);

  const handleImagePicker = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      uiStore.showSnackbar('Нет разрешения на доступ к галерее', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      uiStore.showSnackbar('Нет разрешения на использование камеры', 'error');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleImageSource = () => {
    imageSource.showImageSourceDialog((source) => {
      if (source === 'camera') {
        handleCamera();
      } else {
        handleImagePicker();
      }
    });
  };

  const onSubmit = async (data: any) => {
    try {
      let base64Image = null;
      if (imageUri) {
        // Convert image URI to base64 for upload
        base64Image = await imageUriToBase64(imageUri);
      }

      let finalData = { ...data };

      // If input mode is "perPortion", recalculate values for 100g
      if (inputMode === 'perPortion') {
        const portionQuantity = Number.parseFloat(data.portionQuantity || '100');
        if (portionQuantity > 0) {
          const ratio = 100 / portionQuantity;
          finalData.proteins = Math.round((data.proteins * ratio) * 10) / 10;
          finalData.fats = Math.round((data.fats * ratio) * 10) / 10;
          finalData.carbohydrates = Math.round((data.carbohydrates * ratio) * 10) / 10;
          finalData.calories = Math.round((data.calories * ratio) * 10) / 10;
        }
      }

      const productData = {
        ...finalData,
        quantity: '100', // Продукты всегда хранятся на 100г
        imageBase64: base64Image,
        productCategoryId: 'other', // Default category
      };

      if (isEditing && product) {
        await productStore.updateProduct(product.id, productData);
        uiStore.showSnackbar('Продукт обновлен', 'success');
      } else {
        await productStore.createProduct(productData);
        uiStore.showSnackbar('Продукт создан', 'success');
      }

      navigation.goBack();
    } catch {
      uiStore.showSnackbar(
        productStore.error || 'Не удалось сохранить продукт',
        'error'
      );
    }
  };

  const handleDelete = () => {
    if (!product) return;

    showConfirm(
      'Удаление продукта',
      'Вы уверены, что хотите удалить этот продукт?',
      async () => {
        try {
          await productStore.deleteProduct(product.id);
          uiStore.showSnackbar('Продукт удален', 'success');
          navigation.goBack();
        } catch {
          uiStore.showSnackbar('Не удалось удалить продукт', 'error');
        }
      }
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header
        title={isEditing ? 'Редактирование продукта' : 'Создание продукта'}
        showBackButton
        onBackPress={handleBack}
        rightComponent={
          isEditing && product ? (
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color={colors.error} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView style={styles.content}>
          {/* Image Section */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Фото продукта</Text>
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={handleImageSource}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={32} color={colors.text.secondary} />
                  <Text style={styles.imagePlaceholderLabel}>Добавить фото</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Название продукта"
                  placeholder="Введите название"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

            <View style={styles.macrosContainer}>
              <View style={styles.modeSelectorContainer}>
                <Text style={styles.sectionTitle}>
                  {inputMode === 'per100g' ? 'Пищевая ценность на 100г' : 'Пищевая ценность на порцию'}
                </Text>

                {/* Mode Toggle */}
                <View style={styles.modeToggle}>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      inputMode === 'per100g' && styles.modeButtonActive,
                    ]}
                    onPress={() => setInputMode('per100g')}
                  >
                    <Text
                      style={[
                        styles.modeButtonText,
                        inputMode === 'per100g' && styles.modeButtonTextActive,
                      ]}
                    >
                      На 100г
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      inputMode === 'perPortion' && styles.modeButtonActive,
                    ]}
                    onPress={() => setInputMode('perPortion')}
                  >
                    <Text
                      style={[
                        styles.modeButtonText,
                        inputMode === 'perPortion' && styles.modeButtonTextActive,
                      ]}
                    >
                      На порцию
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Portion Quantity Input (only for perPortion mode) */}
              {inputMode === 'perPortion' && (
                <Controller
                  control={control}
                  name="portionQuantity"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Количество порции (г)"
                      placeholder="100"
                      value={value?.toString() || '100'}
                      onChangeText={(text) => {
                        const num = Number.parseFloat(text);
                        onChange(Number.isNaN(num) ? 100 : num);
                      }}
                      onBlur={onBlur}
                      error={errors.portionQuantity?.message}
                      keyboardType="decimal-pad"
                      containerStyle={styles.portionInput}
                    />
                  )}
                />
              )}

              {inputMode === 'perPortion' && (
                <Text style={styles.hintText}>
                  Введите КБЖУ для указанной порции. При сохранении значения будут пересчитаны на 100г.
                </Text>
              )}

              <View style={styles.macrosRow}>
                <Controller
                  control={control}
                  name="proteins"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Белки (г)"
                      placeholder="0"
                      value={proteinsStr}
                      onChangeText={(text) => {
                        if (/^\d*\.?\d*$/.test(text)) {
                          let newText = text;
                          // If text starts with 0 and has more digits and no decimal point immediately after 0
                          // e.g. "05" -> "5", but "0." -> "0."
                          if (newText.length > 1 && newText.startsWith('0') && newText[1] !== '.') {
                            newText = newText.substring(1);
                          }
                          setProteinsStr(newText);
                          const num = Number.parseFloat(newText);
                          onChange(Number.isNaN(num) ? 0 : num);
                        }
                      }}
                      onBlur={() => {
                        const num = Number.parseFloat(proteinsStr);
                        if (Number.isNaN(num) || proteinsStr === '') {
                          setProteinsStr('0');
                          onChange(0);
                        } else {
                          setProteinsStr(num.toString());
                          onChange(num);
                        }
                        onBlur();
                      }}
                      error={errors.proteins?.message}
                      keyboardType="decimal-pad"
                      containerStyle={styles.macroInput}
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
                      value={fatsStr}
                      onChangeText={(text) => {
                        if (/^\d*\.?\d*$/.test(text)) {
                          let newText = text;
                          if (newText.length > 1 && newText.startsWith('0') && newText[1] !== '.') {
                            newText = newText.substring(1);
                          }
                          setFatsStr(newText);
                          const num = Number.parseFloat(newText);
                          onChange(Number.isNaN(num) ? 0 : num);
                        }
                      }}
                      onBlur={() => {
                        const num = Number.parseFloat(fatsStr);
                        if (Number.isNaN(num) || fatsStr === '') {
                          setFatsStr('0');
                          onChange(0);
                        } else {
                          setFatsStr(num.toString());
                          onChange(num);
                        }
                        onBlur();
                      }}
                      error={errors.fats?.message}
                      keyboardType="decimal-pad"
                      containerStyle={styles.macroInput}
                    />
                  )}
                />
              </View>

              <View style={styles.macrosRow}>
                <Controller
                  control={control}
                  name="carbohydrates"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Углеводы (г)"
                      placeholder="0"
                      value={carbohydratesStr}
                      onChangeText={(text) => {
                        if (/^\d*\.?\d*$/.test(text)) {
                          let newText = text;
                          if (newText.length > 1 && newText.startsWith('0') && newText[1] !== '.') {
                            newText = newText.substring(1);
                          }
                          setCarbohydratesStr(newText);
                          const num = Number.parseFloat(newText);
                          onChange(Number.isNaN(num) ? 0 : num);
                        }
                      }}
                      onBlur={() => {
                        const num = Number.parseFloat(carbohydratesStr);
                        if (Number.isNaN(num) || carbohydratesStr === '') {
                          setCarbohydratesStr('0');
                          onChange(0);
                        } else {
                          setCarbohydratesStr(num.toString());
                          onChange(num);
                        }
                        onBlur();
                      }}
                      error={errors.carbohydrates?.message}
                      keyboardType="decimal-pad"
                      containerStyle={styles.macroInput}
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
                      value={caloriesStr}
                      onChangeText={(text) => {
                        if (/^\d*\.?\d*$/.test(text)) {
                          let newText = text;
                          if (newText.length > 1 && newText.startsWith('0') && newText[1] !== '.') {
                            newText = newText.substring(1);
                          }
                          setCaloriesStr(newText);
                          const num = Number.parseFloat(newText);
                          onChange(Number.isNaN(num) ? 0 : num);
                        }
                      }}
                      onBlur={() => {
                        const num = Number.parseFloat(caloriesStr);
                        if (Number.isNaN(num) || caloriesStr === '') {
                          setCaloriesStr('0');
                          onChange(0);
                        } else {
                          setCaloriesStr(num.toString());
                          onChange(num);
                        }
                        onBlur();
                      }}
                      error={errors.calories?.message}
                      keyboardType="decimal-pad"
                      containerStyle={styles.macroInput}
                      rightIcon={
                        isCalculating ? (
                          <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
                        ) : (
                          <Ionicons name="flash-outline" size={16} color={colors.primary} />
                        )
                      }
                    />
                  )}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={isEditing ? 'Сохранить изменения' : 'Создать продукт'}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || productStore.loading}
            loading={productStore.loading}
          />
        </View>
      </KeyboardAvoidingView>

      <ImageSourceDialog
        visible={imageSource.visible}
        onClose={imageSource.handleClose}
        onCameraPress={imageSource.handleSelectCamera}
        onGalleryPress={imageSource.handleSelectGallery}
      />

      <AlertDialog
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        showCancel={alertState.showCancel}
        onConfirm={alertState.onConfirm}
        onCancel={alertState.onCancel}
        onDismiss={hideAlert}
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
  imageSection: {
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
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.default,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    marginBottom: spacing.sm,
  },
  imagePlaceholderLabel: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  form: {
    padding: spacing.lg,
  },
  macrosContainer: {
    marginBottom: spacing.lg,
  },
  modeSelectorContainer: {
    marginBottom: spacing.md,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginTop: spacing.sm,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    ...typography.body2,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  portionInput: {
    marginBottom: spacing.md,
  },
  hintText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  macrosRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  macroInput: {
    flex: 1,
    minWidth: 140,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});

export default ProductScreen;
