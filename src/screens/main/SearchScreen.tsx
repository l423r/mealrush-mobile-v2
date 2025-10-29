import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { MainStackParamList } from '../../types/navigation.types';
import { Product } from '../../types/api.types';
import { useStores } from '../../stores';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { formatCalories, formatWeight } from '../../utils/formatting';
import { requestCameraPermission, requestMediaLibraryPermission, imageUriToBase64 } from '../../utils/imageUtils';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { CachedImage } from '../../components/common/CachedImage';
import ImageSourceDialog from '../../components/common/ImageSourceDialog';
import AlertDialog from '../../components/common/AlertDialog';
import { useAlert, useImageSource } from '../../hooks/useAlert';

type SearchScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Search'>;
type SearchScreenRouteProp = RouteProp<MainStackParamList, 'Search'>;

const SearchScreen: React.FC = observer(() => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const route = useRoute<SearchScreenRouteProp>();
  const { productStore, mealStore, uiStore } = useStores();
  const { alertState, showError, hideAlert } = useAlert();
  const imageSource = useImageSource();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const debounceSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (query.trim().length >= 2) {
            setIsSearching(true);
            productStore.searchProducts(query).finally(() => setIsSearching(false));
          } else {
            productStore.clearSearch();
          }
        }, 300);
      };
    })(),
    []
  );

  useEffect(() => {
    // Load favorites on mount
    productStore.getFavorites();
  }, []);

  useEffect(() => {
    debounceSearch(searchQuery);
  }, [searchQuery, debounceSearch]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('MealElement', {
      item: product,
      date: route.params?.date,
      mealId: route.params?.mealId,
      fromSearch: true,
    });
  };

  const handleScannerPress = () => {
    navigation.navigate('Scanner', {
      date: route.params?.date,
      mealId: route.params?.mealId,
    });
  };

  const processImage = async (imageUri: string) => {
    try {
      setIsAnalyzing(true);

      // Конвертируем в base64
      const base64 = await imageUriToBase64(imageUri);
      if (!base64) {
        uiStore.showSnackbar('Не удалось обработать изображение', 'error');
        setIsAnalyzing(false);
        return;
      }

      // Вызываем API анализа
      const analysisResult = await mealStore.analyzePhoto(base64, 'ru');

      setIsAnalyzing(false);

      // Переходим на экран результатов анализа
      navigation.navigate('PhotoAnalysis', {
        analysisResult,
        imageUri: imageUri,
        mealId: route.params?.mealId,
        date: route.params?.date,
      });
    } catch (error: unknown) {
      setIsAnalyzing(false);
      const errorMessage = mealStore.photoAnalysisError || 'Не удалось проанализировать фотографию';
      showError(
        'Ошибка анализа',
        errorMessage
      );
    }
  };

  const handleCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      uiStore.showSnackbar('Нет разрешения на использование камеры', 'error');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  };

  const handleGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      uiStore.showSnackbar('Нет разрешения на доступ к галерее', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  };

  const handlePhotoAnalysisPress = () => {
    imageSource.showImageSourceDialog((source) => {
      if (source === 'camera') {
        handleCamera();
      } else {
        handleGallery();
      }
    });
  };

  const handleCreateProductPress = () => {
    navigation.navigate('Product', {});
  };

  const handleFavoriteToggle = async (product: Product) => {
    try {
      if (productStore.favorites.find(f => f.id === product.id)) {
        await productStore.removeFromFavorites(product.id);
      } else {
        await productStore.addToFavorites(product.id);
      }
    } catch (error) {
      uiStore.showSnackbar('Не удалось обновить избранное', 'error');
    }
  };

  const renderProductItem = ({ item: product }: { item: Product }) => {
    const isFavorite = productStore.favorites.some(f => f.id === product.id);
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(product)}
      >
        {product.imageUrl ? (
          <CachedImage 
            uri={product.imageUrl} 
            style={styles.productImage}
            resizeMode="cover"
            placeholder={
              <View style={styles.productImagePlaceholder}>
                <Text style={styles.productImagePlaceholderIcon}>🍽️</Text>
              </View>
            }
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.productImagePlaceholderIcon}>🍽️</Text>
          </View>
        )}
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productMacros}>
            Б: {product.proteins}г • Ж: {product.fats}г • У: {product.carbohydrates}г
          </Text>
          <Text style={styles.productCalories}>
            {formatCalories(product.calories)} на {formatWeight(parseFloat(product.quantity))}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleFavoriteToggle(product)}
        >
          <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteActive]}>
            {isFavorite ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (activeTab === 'favorites') {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>⭐</Text>
          <Text style={styles.emptyTitle}>Нет избранных продуктов</Text>
          <Text style={styles.emptySubtitle}>
            Добавьте продукты в избранное для быстрого доступа
          </Text>
        </View>
      );
    }

    if (searchQuery.length < 2) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>Поиск продуктов</Text>
          <Text style={styles.emptySubtitle}>
            Введите название продукта для поиска
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>😔</Text>
        <Text style={styles.emptyTitle}>Продукт не найден</Text>
        <Text style={styles.emptySubtitle}>
          Попробуйте другой запрос или создайте новый продукт
        </Text>
        <Button
          title="Создать продукт"
          onPress={handleCreateProductPress}
          variant="outline"
          style={styles.emptyButton}
        />
      </View>
    );
  };

  const getData = () => {
    if (activeTab === 'favorites') {
      return productStore.favorites;
    }
    return productStore.products;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Поиск продуктов"
        showBackButton
        rightComponent={
          <TouchableOpacity onPress={handleScannerPress}>
            <Text style={styles.scannerIcon}>📷</Text>
          </TouchableOpacity>
        }
      />
      
      <View style={styles.content}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск продуктов..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoFocus
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              Все
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
              Избранное
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            title="📷 Сканер"
            onPress={handleScannerPress}
            variant="outline"
            size="small"
            style={styles.quickActionButton}
          />
          <Button
            title="📸 Анализ фото"
            onPress={handlePhotoAnalysisPress}
            variant="outline"
            size="small"
            style={styles.quickActionButton}
          />
          <Button
            title="➕ Создать"
            onPress={handleCreateProductPress}
            variant="outline"
            size="small"
            style={styles.quickActionButton}
          />
        </View>

        {/* Products List */}
        {(() => {
          if (isAnalyzing || mealStore.analyzingPhoto) {
            return <Loading message="Анализ фотографии..." />;
          }
          if (isSearching) {
            return <Loading message="Поиск продуктов..." />;
          }
          return (
            <FlatList
            data={getData()}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            />
          );
        })()}
      </View>

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
        onConfirm={alertState.onConfirm}
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
  scannerIcon: {
    fontSize: 24,
  },
  searchContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    paddingBottom: spacing.md,
  },
  searchInput: {
    ...typography.body1,
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 0,
    ...shadows.sm,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.background.paper,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body1,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  quickActionButton: {
    flex: 1,
  },
  listContainer: {
    padding: spacing.lg,
  },
  productCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    backgroundColor: colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImagePlaceholderIcon: {
    fontSize: 30,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  productMacros: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  productCalories: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: spacing.sm,
  },
  favoriteIcon: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  favoriteActive: {
    color: colors.warning,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
});

export default SearchScreen;