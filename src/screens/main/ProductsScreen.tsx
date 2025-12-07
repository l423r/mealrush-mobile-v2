import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
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
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import InsightCard from '../../components/recommendations/InsightCard';
import RecommendedProductCard from '../../components/recommendations/RecommendedProductCard';
import SectionHeader from '../../components/recommendations/SectionHeader';
import RecommendationInfoSheet from '../../components/recommendations/RecommendationInfoSheet';
import MealSelectorDialog from '../../components/common/MealSelectorDialog';

type ColorsType = typeof lightColors | typeof darkColors;

// Product Item Component
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
          <Ionicons name="restaurant-outline" size={24} color={colors.text.secondary} />
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
          <Ionicons
            name={isFavorite ? 'star' : 'star-outline'}
            size={24}
            color={isFavorite ? colors.warning : colors.text.secondary}
          />
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

type ProductsScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'HomeTabs'
>;

const ProductsScreen: React.FC = observer(() => {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const { productStore, recommendationsStore, mealStore, uiStore } = useStores();
  const { colors, isDark } = useTheme();
  const dynamicStyles = createStyles(colors, isDark);

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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);

  const textInputRef = useRef<TextInput>(null);

  // Track initial mount and loaded tabs
  const isInitialMount = useRef(true);
  const loadedTabs = useRef<Set<'my' | 'favorites' | 'search' | 'reco'>>(new Set());
  const previousTab = useRef<'my' | 'favorites' | 'search' | 'reco'>(activeTab);

  useEffect(() => {
    productStore.getFavorites();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousTab.current = activeTab;
      if (activeTab === 'my' || activeTab === 'favorites') {
        loadData(activeTab);
      } else if (activeTab === 'reco') {
        loadRecommendations();
      }
      return;
    }

    if (previousTab.current === activeTab) {
      return;
    }

    previousTab.current = activeTab;

    if (activeTab === 'my' || activeTab === 'favorites') {
      loadData(activeTab);
    } else if (activeTab === 'reco') {
      loadRecommendations();
    }
  }, [activeTab]);

  const loadData = async (tab?: 'my' | 'favorites' | 'search' | 'reco', force: boolean = false) => {
    const targetTab = tab || activeTab;
    if (!force && loadedTabs.current.has(targetTab)) return;

    try {
      if (targetTab === 'my') {
        await productStore.getAll();
        loadedTabs.current.add('my');
      } else if (targetTab === 'favorites') {
        await productStore.getFavorites();
        loadedTabs.current.add('favorites');
      } else if (targetTab === 'search') {
        loadedTabs.current.add('search');
      } else if (targetTab === 'reco') {
        await loadRecommendations();
        loadedTabs.current.add('reco');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      loadedTabs.current.delete(targetTab);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    loadedTabs.current.delete(activeTab);
    await loadData(activeTab, true);
    setRefreshing(false);
  };

  const handleTabChange = (tab: 'my' | 'favorites' | 'search' | 'reco') => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (activeTab === 'search') {
      if (trimmedQuery.length >= 2) {
        const searchTimeout = setTimeout(() => {
          productStore.searchProducts(trimmedQuery);
        }, 300);
        return () => clearTimeout(searchTimeout);
      } else {
        productStore.clearSearch();
      }
    } else if (activeTab === 'my') {
      const searchTimeout = setTimeout(() => {
        productStore.getAll(0, trimmedQuery);
      }, 300);
      return () => clearTimeout(searchTimeout);
    } else if (activeTab === 'favorites') {
      const searchTimeout = setTimeout(() => {
        productStore.getFavorites(0, trimmedQuery);
      }, 300);
      return () => clearTimeout(searchTimeout);
    }
  }, [searchQuery, activeTab, productStore]);

  const loadRecommendations = async () => {
    try {
      await recommendationsStore.loadAll(10, 5);
    } catch { }
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
    if (activeTab === 'my') {
      navigation.navigate('Product', {
        product: product,
        isEditing: true,
      });
      return;
    }
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
      productStore.pagination.hasMore &&
      !productStore.loading &&
      !productStore.loadingMore
    ) {
      const nextPage = productStore.pagination.page + 1;
      const query = searchQuery.trim();

      if (activeTab === 'search' && query.length >= 2) {
        productStore.searchProducts(query, nextPage);
      } else if (activeTab === 'my') {
        productStore.getAll(nextPage, query);
      } else if (activeTab === 'favorites') {
        productStore.getFavorites(nextPage, query);
      }
    }
  };

  const renderLoadingFooter = () => {
    if (!productStore.loadingMore || (activeTab !== 'search' && activeTab !== 'my' && activeTab !== 'favorites')) {
      return null;
    }
    return (
      <View style={dynamicStyles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={dynamicStyles.loadingFooterText}>Загрузка...</Text>
      </View>
    );
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
          <Ionicons name="star-outline" size={64} color={colors.text.secondary} />
          <Text style={dynamicStyles.emptyTitle}>Нет избранных продуктов</Text>
          <Text style={dynamicStyles.emptySubtitle}>
            Добавьте продукты в избранное для быстрого доступа
          </Text>
        </View>
      );
    }

    if (activeTab === 'search') {
      if (productStore.loading) {
        return (
          <View style={dynamicStyles.emptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={dynamicStyles.emptySubtitle}>Поиск...</Text>
          </View>
        );
      }
      return (
        <View style={dynamicStyles.emptyState}>
          <Ionicons name="search-outline" size={64} color={colors.text.secondary} />
          <Text style={dynamicStyles.emptyTitle}>Поиск продуктов</Text>
          <Text style={dynamicStyles.emptySubtitle}>
            Введите название продукта для поиска
          </Text>
        </View>
      );
    }

    return (
      <View style={dynamicStyles.emptyState}>
        <Ionicons name="leaf-outline" size={64} color={colors.text.secondary} />
        <Text style={dynamicStyles.emptyTitle}>Нет продуктов</Text>
        <Text style={dynamicStyles.emptySubtitle}>Создайте свой первый продукт</Text>
      </View>
    );
  };

  const getData = () => {
    if (activeTab === 'favorites') {
      return productStore.favorites;
    } else if (activeTab === 'search') {
      return productStore.products;
    } else if (activeTab === 'my') {
      return productStore.myProducts;
    }
    return productStore.myProducts;
  };

  const renderTabIcon = (tab: 'search' | 'favorites' | 'my' | 'reco') => {
    const iconMap = {
      search: 'search-outline',
      favorites: 'star-outline',
      my: 'create-outline',
      reco: 'sparkles-outline',
    } as const;
    const iconName = iconMap[tab];
    return (
      <Ionicons
        name={iconName}
        size={20}
        color={activeTab === tab ? colors.primary : colors.text.secondary}
      />
    );
  };

  const data = getData();
  if (productStore.loading && !refreshing && data.length === 0 && activeTab !== 'search') {
    return <Loading message="Загрузка продуктов..." />;
  }

  const showHistory =
    isSearchFocused &&
    isHistoryVisible &&
    activeTab !== 'reco' &&
    searchQuery.length === 0 &&
    productStore.searchHistory.length > 0;

  return (
    <View style={dynamicStyles.container}>
      <Header title="База продуктов" />

      <View style={dynamicStyles.content}>
        <View style={dynamicStyles.tabs}>
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'search' && { borderBottomColor: colors.primary }]}
            onPress={() => handleTabChange('search')}
          >
            {renderTabIcon('search')}
            <Text style={[dynamicStyles.tabText, activeTab === 'search' && { color: colors.primary, fontWeight: '700' }]}>
              Поиск
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'favorites' && { borderBottomColor: colors.primary }]}
            onPress={() => handleTabChange('favorites')}
          >
            {renderTabIcon('favorites')}
            <Text style={[dynamicStyles.tabText, activeTab === 'favorites' && { color: colors.primary, fontWeight: '700' }]}>
              Избранное
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'my' && { borderBottomColor: colors.primary }]}
            onPress={() => handleTabChange('my')}
          >
            {renderTabIcon('my')}
            <Text style={[dynamicStyles.tabText, activeTab === 'my' && { color: colors.primary, fontWeight: '700' }]}>
              Мои
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'reco' && { borderBottomColor: colors.primary }]}
            onPress={() => handleTabChange('reco')}
          >
            {renderTabIcon('reco')}
            <Text style={[dynamicStyles.tabText, activeTab === 'reco' && { color: colors.primary, fontWeight: '700' }]}>
              Советы
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab !== 'reco' && (
          <View style={dynamicStyles.searchContainer}>
            <View style={dynamicStyles.searchWrapper}>
              <TextInput
                ref={textInputRef}
                style={[dynamicStyles.searchInput, { color: colors.text.primary }]}
                placeholder={activeTab === 'search' ? 'Поиск продуктов...' : 'Поиск в списке...'}
                placeholderTextColor={colors.text.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={activeTab === 'search'}
                onFocus={() => {
                  setIsSearchFocused(true);
                  setIsHistoryVisible(true);
                }}
                onTouchStart={() => setIsHistoryVisible(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              {productStore.loading && activeTab === 'search' ? (
                <View style={dynamicStyles.searchLoader}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : searchQuery.length > 0 ? (
                <TouchableOpacity
                  style={dynamicStyles.searchClearButton}
                  onPress={() => {
                    setSearchQuery('');
                    setIsSearchFocused(true);
                    textInputRef.current?.focus();
                  }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}

        <View style={{ flex: 1 }}>
        {activeTab !== 'reco' ? (
          <FlashList
            data={getData()}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            estimatedItemSize={110}
            extraData={`${productStore.favorites.length}-${productStore.loadingMore}-${productStore.products.length}`}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderLoadingFooter}
            contentContainerStyle={dynamicStyles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
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
            {(recommendationsStore.criticalInsights.length > 0 || recommendationsStore.warningInsights.length > 0) && (
              <>
                <SectionHeader
                  title="Важные уведомления"
                  icon="flash-outline"
                  count={recommendationsStore.criticalInsights.length + recommendationsStore.warningInsights.length}
                />
                {recommendationsStore.criticalInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
                {recommendationsStore.warningInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </>
            )}

            <SectionHeader
              title="Подборки для приёма"
              icon="target-outline"
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

            <SectionHeader
              title="Рекомендованные продукты"
              icon="sparkles-outline"
              onInfoPress={() => showInfo('products')}
              count={recommendationsStore.allProducts.length}
            />
            {recommendationsStore.loading.products ? (
              <Loading message="Загрузка рекомендаций..." />
            ) : recommendationsStore.allProducts.length === 0 ? (
              <View style={dynamicStyles.emptySection}>
                <Text style={dynamicStyles.emptySectionText}>
                  Нет рекомендаций. Добавьте больше приемов пищи для персонализации.
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

            {recommendationsStore.infoInsights.length > 0 && (
              <>
                <SectionHeader
                  title="Полезные советы"
                  icon="bulb-outline"
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

        {showHistory && (
          <View style={dynamicStyles.historyContainer}>
            <View style={dynamicStyles.historyHeader}>
              <Text style={dynamicStyles.historyTitle}>Недавние запросы</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => productStore.clearHistory()}>
                  <Text style={dynamicStyles.clearHistoryText}>Очистить</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsHistoryVisible(false)}
                  style={{ marginLeft: spacing.md, padding: 4 }}
                >
                  <Ionicons name="chevron-up" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {productStore.searchHistory.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={dynamicStyles.historyItem}
                  onPress={() => {
                    setSearchQuery(item);
                    setIsSearchFocused(false);
                  }}
                >
                  <View style={dynamicStyles.historyItemLeft}>
                    <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
                    <Text style={dynamicStyles.historyItemText}>{item}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      productStore.removeFromHistory(item);
                    }}
                  >
                    <Ionicons name="close-circle-outline" size={20} color={colors.text.hint} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        </View>
      </View >

      {activeTab === 'my' && (
        <View style={dynamicStyles.addButtonContainer}>
          <Button
            title="+ Создать продукт"
            onPress={handleAddProduct}
            style={dynamicStyles.addButton}
          />
        </View>
      )}

      <RecommendationInfoSheet
        visible={infoSheetVisible}
        type={infoSheetType}
        onClose={() => setInfoSheetVisible(false)}
        userGoal="SAVE"
        preferredCategories={[]}
      />

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

const createStyles = (colors: ColorsType, isDark: boolean) => StyleSheet.create({
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
  searchWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchInput: {
    ...typography.body1,
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.lg,
    paddingLeft: spacing.md,
    paddingRight: 48,
    paddingVertical: spacing.md,
    borderWidth: 0,
    ...shadows.sm,
  },
  searchClearButton: {
    position: 'absolute',
    right: spacing.xs,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  searchLoader: {
    position: 'absolute',
    right: spacing.sm,
    height: '100%',
    justifyContent: 'center',
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
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  productName: {
    ...typography.body1,
    color: colors.text.primary,
    marginBottom: 4,
  },
  productMacros: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  productCalories: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  productSource: {
    ...typography.caption,
    color: colors.text.hint,
    fontSize: 10,
    marginTop: 2,
  },
  productActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  favoriteButton: {
    padding: 4,
  },
  addButtonSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonSmallIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: -2,
  },
  productArrow: {
    fontSize: 24,
    color: colors.text.secondary,
    marginTop: 8,
  },
  historyContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: isDark ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    zIndex: 10,
    padding: spacing.lg,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  historyTitle: {
    ...typography.h6,
    color: colors.text.secondary,
  },
  clearHistoryText: {
    ...typography.caption,
    color: colors.primary,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyItemText: {
    ...typography.body1,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
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
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loadingFooterText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
});

export default ProductsScreen;
