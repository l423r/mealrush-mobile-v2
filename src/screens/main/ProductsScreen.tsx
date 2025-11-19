import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation.types';
import type { ProductResponse } from '../../types/api.types';
import { useStores } from '../../stores';
import {
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import type { lightColors, darkColors } from '../../theme/colors';
import { formatCalories, formatWeight } from '../../utils/formatting';

type ColorsType = typeof lightColors | typeof darkColors;

// Product Item Component - отдельный компонент для реактивности
interface ProductItemProps {
  product: any;
  activeTab: 'my' | 'favorites' | 'search' | 'reco';
  onPress: (product: any) => void;
  onFavoriteToggle: (product: any) => void;
  onAddToMeal: (product: any) => void;
  colors: ColorsType;
  styles: ReturnType<typeof createStyles>;
}

const ProductItem: React.FC<ProductItemProps> = observer(({
  product,
  activeTab,
  onPress,
  onFavoriteToggle,
  onAddToMeal,
  colors,
  styles,
}) => {
  const { productStore } = useStores();
  const showAddButton = activeTab === 'favorites' || activeTab === 'my';
  const isFavorite = productStore.favorites.some((f) => f.id === product.id);
  
  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      {product.imageUrl ? (
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
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
          Б: {product.proteins}г • Ж: {product.fats}г • У:{' '}
          {product.carbohydrates}г
        </Text>
        <Text style={styles.productCalories}>
          {formatCalories(product.calories)} на{' '}
          {formatWeight(Number.parseFloat(product.quantity))}
        </Text>
        {product.source && (
          <Text style={styles.productSource}>Источник: {product.source}</Text>
        )}
      </View>

      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            onFavoriteToggle(product);
          }}
        >
          <Text
            style={[styles.favoriteIcon, isFavorite && { color: colors.warning }]}
          >
            {isFavorite ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>

        {showAddButton ? (
          <TouchableOpacity
            style={[styles.addButtonSmall, { backgroundColor: colors.primary }]}
            onPress={(e) => {
              e.stopPropagation();
              onAddToMeal(product);
            }}
          >
            <Text style={[styles.addButtonSmallIcon, { color: colors.background.paper }]}>+</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.productArrow}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import InsightCard from '../../components/recommendations/InsightCard';
import RecommendedProductCard from '../../components/recommendations/RecommendedProductCard';
import SectionHeader from '../../components/recommendations/SectionHeader';
import RecommendationInfoSheet from '../../components/recommendations/RecommendationInfoSheet';
import MealSelectorDialog from '../../components/common/MealSelectorDialog';

type ProductsScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'HomeTabs'
>;

const ProductsScreen: React.FC = observer(() => {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const { productStore, recommendationsStore, mealStore, uiStore } = useStores();
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);

  const [activeTab, setActiveTab] = useState<
    'my' | 'favorites' | 'search' | 'reco'
  >('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [infoSheetVisible, setInfoSheetVisible] = useState(false);
  const [infoSheetType, setInfoSheetType] = useState<
    'products' | 'mealPicks' | 'insights'
  >('products');
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [selectedProductForAdd, setSelectedProductForAdd] = useState<ProductResponse | null>(null);

  // Initial load on mount
  useEffect(() => {
    console.log(
      `🚀 [ProductsScreen] Mount/Initial load - activeTab: ${activeTab}`
    );
    // Load favorites on mount to enable favorite toggle functionality
    productStore.getFavorites();
    // Don't load data on mount for search tab, only for my and favorites
    if (activeTab === 'my' || activeTab === 'favorites') {
      loadData(activeTab);
    } else if (activeTab === 'reco') {
      loadRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, productStore, recommendationsStore]); // include stores

  const loadData = async (tab?: 'my' | 'favorites' | 'search' | 'reco') => {
    const targetTab = tab || activeTab;
    console.log(`📦 [ProductsScreen] loadData() called for tab: ${targetTab}`);
    try {
      if (targetTab === 'my') {
        console.log('📦 [ProductsScreen] Loading my products (GET /product)');
        await productStore.getAll();
      } else if (targetTab === 'favorites') {
        console.log('⭐ [ProductsScreen] Loading favorites (GET /favorite)');
        await productStore.getFavorites();
      } else if (targetTab === 'search') {
        console.log(
          '🔍 [ProductsScreen] Search tab - will be handled by searchQuery effect'
        );
        // Search will be handled by searchQuery effect
      } else if (targetTab === 'reco') {
        await loadRecommendations();
      }
    } catch (error) {
      console.error('❌ [ProductsScreen] Error loading products:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTabChange = (tab: 'my' | 'favorites' | 'search' | 'reco') => {
    console.log(`🔄 [ProductsScreen] Tab changed from ${activeTab} to ${tab}`);
    setActiveTab(tab);
    if (tab === 'search') {
      setSearchQuery('');
    } else if (tab === 'my' || tab === 'favorites') {
      loadData(tab); // Load data only for my and favorites tabs
    } else if (tab === 'reco') {
      loadRecommendations();
    }
  };

  // Handle search when searchQuery changes
  useEffect(() => {
    if (activeTab === 'search' && searchQuery.trim().length >= 2) {
      const searchTimeout = setTimeout(() => {
        productStore.searchProducts(searchQuery);
      }, 300);
      return () => clearTimeout(searchTimeout);
    } else if (activeTab === 'search') {
      productStore.clearSearch();
    }
  }, [searchQuery, activeTab, productStore]);

  const loadRecommendations = async () => {
    try {
      await recommendationsStore.loadAll(10, 5);
    } catch {
      // handled in store
    }
  };

  const handleAddProductToMeal = (product: ProductResponse) => {
    setSelectedProductForAdd(product);
    setShowMealSelector(true);
  };

  const handleMealSelect = (mealId: number) => {
    if (selectedProductForAdd) {
      navigation.navigate('MealElement', {
        item: selectedProductForAdd,
        mealId: mealId,
        date: mealStore.selectedDate.toISOString(),
        fromSearch: true,
      });
    }
  };

  const handleCreateNewMeal = () => {
    if (selectedProductForAdd) {
      navigation.navigate('MealElement', {
        item: selectedProductForAdd,
        date: mealStore.selectedDate.toISOString(),
        fromSearch: true,
      });
    }
  };

  const showInfo = (type: 'products' | 'mealPicks' | 'insights') => {
    setInfoSheetType(type);
    setInfoSheetVisible(true);
  };

  const handleProductPress = (product: any) => {
    // Для "Мои продукты" - открыть редактирование продукта
    if (activeTab === 'my') {
      navigation.navigate('Product', { 
        product: product,
        isEditing: true,
      });
      return;
    }
    
    // Для избранного и рекомендаций - только просмотр в MealElement
    const readOnly = activeTab === 'favorites' || activeTab === 'reco';
    navigation.navigate('MealElement', { 
      item: product,
      readOnly: readOnly,
    });
  };

  const handleAddProduct = () => {
    navigation.navigate('Product', {});
  };

  const handleFavoriteToggle = async (product: ProductResponse) => {
    try {
      if (productStore.favorites.find((f) => f.id === product.id)) {
        await productStore.removeFromFavorites(product.id);
      } else {
        await productStore.addToFavorites(product.id);
      }
    } catch {
      uiStore.showSnackbar('Не удалось обновить избранное', 'error');
    }
  };

  const handleLoadMore = () => {
    if (
      activeTab === 'search' &&
      productStore.pagination.hasMore &&
      !productStore.loading &&
      searchQuery.trim().length >= 2
    ) {
      productStore.searchProducts(searchQuery, productStore.pagination.page + 1);
    }
  };

  const renderProductItem = ({ item: product }: { item: any }) => {
    return (
      <ProductItem
        product={product}
        activeTab={activeTab}
        onPress={handleProductPress}
        onFavoriteToggle={handleFavoriteToggle}
        onAddToMeal={handleAddProductToMeal}
        colors={colors}
        styles={dynamicStyles}
      />
    );
  };

  const renderEmptyState = () => {
    if (activeTab === 'favorites') {
      return (
        <View style={dynamicStyles.emptyState}>
          <Text style={dynamicStyles.emptyEmoji}>⭐</Text>
          <Text style={dynamicStyles.emptyTitle}>Нет избранных продуктов</Text>
          <Text style={dynamicStyles.emptySubtitle}>
            Добавьте продукты в избранное для быстрого доступа
          </Text>
        </View>
      );
    }

    if (activeTab === 'search') {
      return (
        <View style={dynamicStyles.emptyState}>
          <Text style={dynamicStyles.emptyEmoji}>🔍</Text>
          <Text style={dynamicStyles.emptyTitle}>Поиск продуктов</Text>
          <Text style={dynamicStyles.emptySubtitle}>
            Введите название продукта для поиска
          </Text>
        </View>
      );
    }

    return (
      <View style={dynamicStyles.emptyState}>
        <Text style={dynamicStyles.emptyEmoji}>🥗</Text>
        <Text style={dynamicStyles.emptyTitle}>Нет продуктов</Text>
        <Text style={dynamicStyles.emptySubtitle}>Создайте свой первый продукт</Text>
      </View>
    );
  };

  const getData = () => {
    if (activeTab === 'favorites') {
      return productStore.favorites;
    } else if (activeTab === 'search') {
      // Search results from GET /product/search/name (API contract 4.6)
      return productStore.products;
    } else if (activeTab === 'my') {
      // User's products from GET /product (API contract 4.5)
      return productStore.myProducts;
    }
    return productStore.myProducts;
  };

  const renderTabIcon = (tab: 'search' | 'favorites' | 'my' | 'reco') => {
    const icons = {
      search: '🔍',
      favorites: '⭐',
      my: '📝',
      reco: '✨',
    };
    return <Text style={dynamicStyles.tabIcon}>{icons[tab]}</Text>;
  };

  if (productStore.loading && !refreshing) {
    return <Loading message="Загрузка продуктов..." />;
  }

  return (
    <View style={dynamicStyles.container}>
      <Header title="База продуктов" />

      <View style={dynamicStyles.content}>
        {/* Tabs */}
        <View style={dynamicStyles.tabs}>
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'search' && { borderBottomColor: colors.primary }]}
            onPress={() => handleTabChange('search')}
          >
            {renderTabIcon('search')}
            <Text
              style={[
                dynamicStyles.tabText,
                activeTab === 'search' && { color: colors.primary, fontWeight: '700' },
              ]}
            >
              Поиск
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'favorites' && { borderBottomColor: colors.primary }]}
            onPress={() => handleTabChange('favorites')}
          >
            {renderTabIcon('favorites')}
            <Text
              style={[
                dynamicStyles.tabText,
                activeTab === 'favorites' && { color: colors.primary, fontWeight: '700' },
              ]}
            >
              Избранное
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'my' && { borderBottomColor: colors.primary }]}
            onPress={() => handleTabChange('my')}
          >
            {renderTabIcon('my')}
            <Text
              style={[
                dynamicStyles.tabText,
                activeTab === 'my' && { color: colors.primary, fontWeight: '700' },
              ]}
            >
              Мои
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'reco' && { borderBottomColor: colors.primary }]}
            onPress={() => handleTabChange('reco')}
          >
            {renderTabIcon('reco')}
            <Text
              style={[
                dynamicStyles.tabText,
                activeTab === 'reco' && { color: colors.primary, fontWeight: '700' },
              ]}
            >
              Советы
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Input (only for search tab) */}
        {activeTab === 'search' && (
          <View style={dynamicStyles.searchContainer}>
            <TextInput
              style={[dynamicStyles.searchInput, { color: colors.text.primary }]}
              placeholder="Поиск продуктов..."
              placeholderTextColor={colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        )}

        {/* Products List or Recommendations */}
        {activeTab !== 'reco' ? (
          <FlashList
            data={getData()}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            estimatedItemSize={110}
            extraData={productStore.favorites.length}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={dynamicStyles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
          />
        ) : (
          <ScrollView
            style={dynamicStyles.recoScrollView}
            contentContainerStyle={dynamicStyles.recoContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={recommendationsStore.loading.refreshing}
                onRefresh={() => recommendationsStore.refreshRecommendations()}
              />
            }
          >
            {/* Критичные и важные инсайты сверху */}
            {(recommendationsStore.criticalInsights.length > 0 ||
              recommendationsStore.warningInsights.length > 0) && (
              <>
                <SectionHeader
                  title="Важные уведомления"
                  icon="⚡"
                  count={
                    recommendationsStore.criticalInsights.length +
                    recommendationsStore.warningInsights.length
                  }
                />
                {recommendationsStore.criticalInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
                {recommendationsStore.warningInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </>
            )}

            {/* Подборки для приёма */}
            <SectionHeader
              title="Подборки для приёма"
              icon="🎯"
              actionText="Обновить"
              onActionPress={() => recommendationsStore.loadMealPicks(5, true)}
              onInfoPress={() => showInfo('mealPicks')}
              count={recommendationsStore.mealPicks.length}
            />
            {recommendationsStore.loading.mealPicks ? (
              <Loading message="Загрузка подборок..." />
            ) : recommendationsStore.mealPicks.length === 0 ? (
              <View style={dynamicStyles.emptySection}>
                <Text style={dynamicStyles.emptySectionText}>Нет подборок</Text>
              </View>
            ) : (
              recommendationsStore.mealPicks.map((product) => (
                <RecommendedProductCard
                  key={product.id}
                  product={product}
                  onPress={() => handleProductPress(product)}
                  onAddToMeal={() => handleAddProductToMeal(product)}
                  showAddButton
                />
              ))
            )}

            {/* Рекомендованные продукты */}
            <SectionHeader
              title="Рекомендованные продукты"
              icon="✨"
              onInfoPress={() => showInfo('products')}
              count={recommendationsStore.allProducts.length}
            />
            {recommendationsStore.loading.products ? (
              <Loading message="Загрузка рекомендаций..." />
            ) : recommendationsStore.allProducts.length === 0 ? (
              <View style={dynamicStyles.emptySection}>
                <Text style={dynamicStyles.emptySectionText}>
                  Нет рекомендаций. Добавьте больше приемов пищи для
                  персонализации.
                </Text>
              </View>
            ) : (
              <>
                {recommendationsStore.allProducts.map((product) => (
                  <RecommendedProductCard
                    key={product.id}
                    product={product}
                    onPress={() => handleProductPress(product)}
                    onAddToMeal={() => handleAddProductToMeal(product)}
                    showAddButton
                  />
                ))}
                {recommendationsStore.hasMoreProducts && (
                  <Button
                    title="Загрузить ещё"
                    onPress={() => recommendationsStore.loadNextProductsPage(10)}
                    variant="outline"
                    loading={recommendationsStore.loading.products}
                  />
                )}
              </>
            )}

            {/* Информационные инсайты */}
            {recommendationsStore.infoInsights.length > 0 && (
              <>
                <SectionHeader
                  title="Полезные советы"
                  icon="💡"
                  onInfoPress={() => showInfo('insights')}
                  count={recommendationsStore.infoInsights.length}
                />
                {recommendationsStore.infoInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </>
            )}

            <View style={dynamicStyles.bottomSpacer} />
          </ScrollView>
        )}
      </View>

      {/* Add Button - показываем только на вкладке "Мои продукты" */}
      {activeTab === 'my' && (
        <View style={dynamicStyles.addButtonContainer}>
          <Button
            title="+ Создать продукт"
            onPress={handleAddProduct}
            style={dynamicStyles.addButton}
          />
        </View>
      )}

      {/* Recommendation Info Sheet */}
      <RecommendationInfoSheet
        visible={infoSheetVisible}
        type={infoSheetType}
        onClose={() => setInfoSheetVisible(false)}
        userGoal="SAVE"
        preferredCategories={[]}
      />

      {/* Meal Selector Dialog */}
      <MealSelectorDialog
        visible={showMealSelector}
        meals={mealStore.mealsForSelectedDate}
        onClose={() => {
          setShowMealSelector(false);
          setSelectedProductForAdd(null);
        }}
        onMealSelect={handleMealSelect}
        onCreateNew={handleCreateNewMeal}
      />
    </View>
  );
});

const createStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    flex: 1,
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
    paddingTop: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: 100, // Space for add button
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
    backgroundColor: colors.background.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  productImagePlaceholderIcon: {
    fontSize: 24,
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
    marginBottom: spacing.xs,
  },
  productSource: {
    ...typography.caption,
    color: colors.text.hint,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  favoriteButton: {
    padding: spacing.sm,
  },
  favoriteIcon: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  productArrow: {
    ...typography.h3,
    color: colors.text.secondary,
  },
  addButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  addButtonSmallIcon: {
    fontSize: 24,
    fontWeight: '600',
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
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 0,
    ...shadows.xl,
  },
  addButton: {
    width: '100%',
  },
  recoScrollView: {
    flex: 1,
  },
  recoContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  emptySection: {
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptySectionText: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: spacing.xxxl,
  },
});

export default ProductsScreen;
