import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as ImagePicker from 'expo-image-picker';
import { MainStackParamList } from '../../types/navigation.types';
import { Product } from '../../types/api.types';
import { useStores } from '../../stores';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { productSchema } from '../../utils/validation';
import { calculateCalories } from '../../utils/calculations';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

type ProductScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Product'>;
type ProductScreenRouteProp = RouteProp<MainStackParamList, 'Product'>;

const ProductScreen: React.FC = observer(() => {
  const navigation = useNavigation<ProductScreenNavigationProp>();
  const route = useRoute<ProductScreenRouteProp>();
  const { productStore } = useStores();
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

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
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (product) {
      setIsEditing(true);
      setImageUri(product.imageUrl || null);
    }
  }, [product]);

  useEffect(() => {
    // Auto-calculate calories when macronutrients change
    const { proteins, fats, carbohydrates } = watchedValues;
    if (proteins > 0 || fats > 0 || carbohydrates > 0) {
      setIsCalculating(true);
      const calculatedCalories = calculateCalories(proteins, fats, carbohydrates);
      setValue('calories', calculatedCalories);
      setTimeout(() => setIsCalculating(false), 500);
    }
  }, [watchedValues.proteins, watchedValues.fats, watchedValues.carbohydrates, setValue]);

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Нет разрешения на доступ к галерее');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Нет разрешения на использование камеры');
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
    Alert.alert(
      'Выберите источник',
      'Откуда взять изображение?',
      [
        { text: 'Камера', onPress: handleCamera },
        { text: 'Галерея', onPress: handleImagePicker },
        { text: 'Отмена', style: 'cancel' },
      ]
    );
  };

  const onSubmit = async (data: any) => {
    try {
      let base64Image = null;
      if (imageUri) {
        // Convert image to base64
        const response = await fetch(imageUri);
        const blob = await response.blob();
        base64Image = `data:image/jpeg;base64,${blob}`;
      }

      const productData = {
        ...data,
        imageBase64: base64Image,
        productCategoryId: 'other', // Default category
      };

      if (isEditing && product) {
        await productStore.updateProduct(product.id, productData);
        Alert.alert('Успех', 'Продукт обновлен');
      } else {
        await productStore.createProduct(productData);
        Alert.alert('Успех', 'Продукт создан');
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Ошибка', productStore.error || 'Не удалось сохранить продукт');
    }
  };

  const handleDelete = () => {
    if (!product) return;

    Alert.alert(
      'Удаление продукта',
      'Вы уверены, что хотите удалить этот продукт?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await productStore.deleteProduct(product.id);
              Alert.alert('Успех', 'Продукт удален');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить продукт');
            }
          },
        },
      ]
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
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
      
      <ScrollView style={styles.content}>
        {/* Image Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Фото продукта</Text>
          <TouchableOpacity style={styles.imageContainer} onPress={handleImageSource}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>📷</Text>
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
            <Text style={styles.sectionTitle}>Пищевая ценность на 100г</Text>
            
            <View style={styles.macrosRow}>
              <Controller
                control={control}
                name="proteins"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Белки (г)"
                    placeholder="0"
                    value={value?.toString() || ''}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    onBlur={onBlur}
                    error={errors.proteins?.message}
                    keyboardType="numeric"
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
                    value={value?.toString() || ''}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    onBlur={onBlur}
                    error={errors.fats?.message}
                    keyboardType="numeric"
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
                    value={value?.toString() || ''}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    onBlur={onBlur}
                    error={errors.carbohydrates?.message}
                    keyboardType="numeric"
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
                    value={value?.toString() || ''}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    onBlur={onBlur}
                    error={errors.calories?.message}
                    keyboardType="numeric"
                    containerStyle={styles.macroInput}
                    rightIcon={
                      isCalculating ? (
                        <Text style={styles.calculatingIcon}>⏳</Text>
                      ) : (
                        <Text style={styles.autoIcon}>⚡</Text>
                      )
                    }
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="quantity"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Количество (г)"
                placeholder="100"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.quantity?.message}
                keyboardType="numeric"
              />
            )}
          />
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
  deleteIcon: {
    fontSize: 24,
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
    fontSize: 32,
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
  macrosRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  macroInput: {
    flex: 1,
  },
  calculatingIcon: {
    fontSize: 16,
  },
  autoIcon: {
    fontSize: 16,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});

export default ProductScreen;