import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation.types';
import { useStores } from '../../stores';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { formatCalories, formatWeight } from '../../utils/formatting';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

type ProductsScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'HomeTabs'>;

const ProductsScreen: React.FC = observer(() => {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const { productStore } = useStores();
  
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (activeTab === 'all') {
        await productStore.getAll();
      } else {
        await productStore.getFavorites();
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTabChange = (tab: 'all' | 'my') => {
    setActiveTab(tab);
    loadData();
  };

  const handleProductPress = (product: any) => {
    navigation.navigate('Product', { product });
  };

  const handleAddProduct = () => {
    navigation.navigate('Product', {});
  };

  const handleSearch = () => {
    navigation.navigate('Search', {});
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
            Б: {product.proteins}г • Ж: {product.fats}г • У: {product.carbohydrates}г
          </Text>
          <Text style={styles.productCalories}>
            {formatCalories(product.calories)} на {formatWeight(parseFloat(product.quantity))}
          </Text>
          {product.source && (
            <Text style={styles.productSource}>
              Источник: {product.source}
            </Text>
          )}
        </View>
        
        <Text style={styles.productArrow}>›</Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (activeTab === 'my') {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>⭐</Text>
          <Text style={styles.emptyTitle}>Нет избранных продуктов</Text>
          <Text style={styles.emptySubtitle}>
            Добавьте продукты в избранное для быстрого доступа
          </Text>
          <Button
            title="Найти продукты"
            onPress={handleSearch}
            variant="outline"
            style={styles.emptyButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🥗</Text>
        <Text style={styles.emptyTitle}>Нет продуктов</Text>
        <Text style={styles.emptySubtitle}>
          Создайте свой первый продукт или найдите в базе данных
        </Text>
        <Button
          title="Создать продукт"
          onPress={handleAddProduct}
          style={styles.emptyButton}
        />
      </View>
    );
  };

  const getData = () => {
    if (activeTab === 'my') {
      return productStore.favorites;
    }
    return productStore.products;
  };

  if (productStore.loading && !refreshing) {
    return <Loading message="Загрузка продуктов..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="База продуктов"
        rightComponent={
          <TouchableOpacity onPress={handleSearch}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        }
      />
      
      <View style={styles.content}>
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => handleTabChange('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              Все продукты
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my' && styles.activeTab]}
            onPress={() => handleTabChange('my')}
          >
            <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
              Избранное
            </Text>
          </TouchableOpacity>
        </View>

        {/* Products List */}
        <FlatList
          data={getData()}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      </View>

      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <Button
          title="+ Создать продукт"
          onPress={handleAddProduct}
          style={styles.addButton}
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
  searchIcon: {
    fontSize: 24,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
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
    borderWidth: 1,
    borderColor: colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
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
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  addButton: {
    width: '100%',
  },
});

export default ProductsScreen;