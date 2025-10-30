import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation.types';
import { useStores } from '../../stores';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import { formatCalories, formatWeight } from '../../utils/formatting';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

type ProductsScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'HomeTabs'
>;

const ProductsScreen: React.FC = observer(() => {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const { productStore, recommendationsStore } = useStores();

  const [activeTab, setActiveTab] = useState<
    'my' | 'favorites' | 'search' | 'reco'
  >('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Initial load on mount
  useEffect(() => {
    console.log(
      `🚀 [ProductsScreen] Mount/Initial load - activeTab: ${activeTab}`
    );
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
      await Promise.all([
        recommendationsStore.loadProducts(0, 10),
        recommendationsStore.loadInsights(),
        recommendationsStore.loadMealPicks(5),
      ]);
    } catch {
      // handled in store
    }
  };

  const handleProductPress = (product: any) => {
    navigation.navigate('Product', { product });
  };

  const handleAddProduct = () => {
    navigation.navigate('Product', {});
  };

  const renderProductItem = ({ item: product }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(product)}
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

        <Text style={styles.productArrow}>›</Text>
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

    if (activeTab === 'search') {
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
        <Text style={styles.emptyEmoji}>🥗</Text>
        <Text style={styles.emptyTitle}>Нет продуктов</Text>
        <Text style={styles.emptySubtitle}>Создайте свой первый продукт</Text>
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

  if (productStore.loading && !refreshing) {
    return <Loading message="Загрузка продуктов..." />;
  }

  return (
    <View style={styles.container}>
      <Header title="База продуктов" />

      <View style={styles.content}>
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => handleTabChange('search')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'search' && styles.activeTabText,
              ]}
            >
              Поиск
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => handleTabChange('favorites')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'favorites' && styles.activeTabText,
              ]}
            >
              Избранное
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my' && styles.activeTab]}
            onPress={() => handleTabChange('my')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'my' && styles.activeTabText,
              ]}
            >
              Мои продукты
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reco' && styles.activeTab]}
            onPress={() => handleTabChange('reco')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'reco' && styles.activeTabText,
              ]}
            >
              Рекомендации
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Input (only for search tab) */}
        {activeTab === 'search' && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Поиск продуктов..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        )}

        {/* Products List or Recommendations */}
        {activeTab !== 'reco' ? (
          <FlatList
            data={getData()}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          />
        ) : (
          <View style={styles.recoContainer}>
            <View style={styles.recoHeaderRow}>
              <Text style={styles.recoHeader}>Подборки для приёма</Text>
              <TouchableOpacity
                style={styles.recoRefresh}
                onPress={() => recommendationsStore.refreshAll(5, 0, 10)}
              >
                <Text style={styles.recoRefreshText}>Обновить</Text>
              </TouchableOpacity>
            </View>
            {recommendationsStore.mealPicks.map((p) => (
              <View key={p.id} style={styles.recoCard}>
                <Text style={styles.recoName}>{p.name}</Text>
                <Text style={styles.recoMeta}>
                  Б:{p.proteins} Ж:{p.fats} У:{p.carbohydrates} • {p.calories}{' '}
                  ккал
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Search', {})}
                >
                  <Text style={styles.recoAction}>+ Добавить в приём</Text>
                </TouchableOpacity>
              </View>
            ))}

            <Text style={styles.recoHeader}>Рекомендованные продукты</Text>
            {recommendationsStore.productsPage?.content.map((p) => (
              <View key={p.id} style={styles.recoCard}>
                <Text style={styles.recoName}>{p.name}</Text>
                <Text style={styles.recoMeta}>
                  Б:{p.proteins} Ж:{p.fats} У:{p.carbohydrates} • {p.calories}{' '}
                  ккал
                </Text>
              </View>
            ))}

            <Text style={styles.recoHeader}>Инсайты</Text>
            {recommendationsStore.insights.length === 0 ? (
              <Text style={styles.recoEmpty}>Нет инсайтов</Text>
            ) : (
              recommendationsStore.insights.map((i) => (
                <View key={i.id} style={styles.recoCard}>
                  <Text style={styles.recoName}>{i.title}</Text>
                  <Text style={styles.recoMeta}>{i.description}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {/* Add Button - показываем только на вкладке "Мои продукты" */}
      {activeTab === 'my' && (
        <View style={styles.addButtonContainer}>
          <Button
            title="+ Создать продукт"
            onPress={handleAddProduct}
            style={styles.addButton}
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
  productArrow: {
    ...typography.h3,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
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
  recoContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  recoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recoHeader: {
    ...typography.h4,
    color: colors.text.primary,
  },
  recoRefresh: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.light,
    borderRadius: 8,
  },
  recoRefreshText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  recoCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  recoName: {
    ...typography.body1,
    color: colors.text.primary,
  },
  recoMeta: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  recoAction: {
    ...typography.button,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  recoEmpty: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});

export default ProductsScreen;
