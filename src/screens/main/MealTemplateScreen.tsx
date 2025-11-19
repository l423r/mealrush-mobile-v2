import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { observer } from 'mobx-react-lite';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation.types';
import type { MealTemplateElement } from '../../types/api.types';
import { useStores } from '../../stores';
import { colors, typography, spacing, borderRadius } from '../../theme';
import {
  formatMealType,
  formatCalories,
  formatWeight,
} from '../../utils/formatting';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import CompactSummary from '../../components/common/CompactSummary';
import MealTypeEditDialog from '../../components/common/MealTypeEditDialog';
import DateTimePickerDialog from '../../components/common/DateTimePickerDialog';
import MealActionsMenu from '../../components/common/MealActionsMenu';
import AlertDialog from '../../components/common/AlertDialog';
import { useAlert } from '../../hooks/useAlert';
import { Ionicons } from '@expo/vector-icons';

type MealTemplateScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'MealTemplate'
>;
type MealTemplateScreenRouteProp = RouteProp<MainStackParamList, 'MealTemplate'>;

const MealTemplateScreen: React.FC = observer(() => {
  const navigation = useNavigation<MealTemplateScreenNavigationProp>();
  const route = useRoute<MealTemplateScreenRouteProp>();
  const { mealTemplateStore, uiStore, mealStore } = useStores();
  const { alertState, showConfirm, hideAlert } = useAlert();

  const template = route.params.template;
  const elements = mealTemplateStore.templateElements;

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showDateTimeDialog, setShowDateTimeDialog] = useState(false);

  useEffect(() => {
    // Load template and elements if not already loaded
    if (!mealTemplateStore.selectedTemplate || mealTemplateStore.selectedTemplate.id !== template.id) {
      mealTemplateStore.loadTemplate(template.id);
    } else if (elements.length === 0 && template.elements) {
      // If template is loaded but elements are not, load them
      mealTemplateStore.loadTemplateElements(template.id);
    }
  }, [template.id, mealTemplateStore, elements.length]);

  const handleAddElement = () => {
    navigation.navigate('Search', {
      templateId: template.id,
    });
  };

  const handleElementPress = (element: MealTemplateElement) => {
    navigation.navigate('MealElement', {
      item: element,
      templateId: template.id,
    });
  };

  const handleDeleteElement = async (elementId: number) => {
    showConfirm(
      'Удаление блюда',
      'Вы уверены, что хотите удалить это блюдо из шаблона?',
      async () => {
        try {
          await mealTemplateStore.deleteElement(elementId);
          uiStore.showSnackbar('Блюдо удалено из шаблона', 'success');
        } catch {
          uiStore.showSnackbar('Не удалось удалить блюдо', 'error');
        }
      }
    );
  };

  const handleDeleteTemplate = async () => {
    showConfirm(
      'Удаление шаблона',
      'Вы уверены, что хотите удалить этот шаблон?',
      async () => {
        try {
          await mealTemplateStore.deleteTemplate(template.id);
          uiStore.showSnackbar('Шаблон удален', 'success');
          navigation.goBack();
        } catch {
          uiStore.showSnackbar('Не удалось удалить шаблон', 'error');
        }
      }
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditMealType = () => {
    setShowEditDialog(true);
  };

  const handleMealTypeSelect = async (mealType: string, dateTime?: Date) => {
    try {
      await mealTemplateStore.updateTemplate(template.id, { mealType: mealType as any });
      uiStore.showSnackbar('Тип приема пищи обновлен', 'success');
      setShowEditDialog(false);
    } catch {
      uiStore.showSnackbar('Не удалось обновить тип приема пищи', 'error');
    }
  };

  const handleUseTemplate = () => {
    setShowDateTimeDialog(true);
  };

  const handleDateTimeConfirm = async (dateTime: Date) => {
    try {
      const meal = await mealTemplateStore.useTemplate(
        template.id,
        dateTime.toISOString()
      );
      uiStore.showSnackbar('Прием пищи создан из шаблона', 'success');
      setShowDateTimeDialog(false);
      navigation.navigate('Meal', { meal });
    } catch (error) {
      uiStore.showSnackbar(
        mealTemplateStore.error || 'Не удалось создать прием пищи из шаблона',
        'error'
      );
    }
  };

  const currentTemplate = mealTemplateStore.selectedTemplate || template;
  const totalCalories = elements.reduce((sum, element) => sum + element.calories, 0);
  const totalProteins = elements.reduce((sum, element) => sum + element.proteins, 0);
  const totalFats = elements.reduce((sum, element) => sum + element.fats, 0);
  const totalCarbohydrates = elements.reduce(
    (sum, element) => sum + element.carbohydrates,
    0
  );

  const renderElement = ({ item: element }: { item: MealTemplateElement }) => (
    <TouchableOpacity
      style={styles.elementCard}
      onPress={() => handleElementPress(element)}
      activeOpacity={0.7}
    >
      {element.imageUrl && (
        <Image source={{ uri: element.imageUrl }} style={styles.elementImage} />
      )}
      <View style={styles.elementInfo}>
        <Text style={styles.elementName}>{element.name}</Text>
        <View style={styles.elementDetails}>
          <Text style={styles.elementQuantity}>
            {formatWeight(Number.parseFloat(element.quantity))}
          </Text>
          <Text style={styles.elementCalories}>
            {formatCalories(element.calories)}
          </Text>
        </View>
        <View style={styles.elementNutrients}>
          <Text style={styles.nutrientText}>
            Б: {element.proteins.toFixed(1)}г
          </Text>
          <Text style={styles.nutrientText}>
            Ж: {element.fats.toFixed(1)}г
          </Text>
          <Text style={styles.nutrientText}>
            У: {element.carbohydrates.toFixed(1)}г
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          handleDeleteElement(element.id);
        }}
      >
        <MaterialIcons name="delete-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={64} color={colors.text.secondary} />
      <Text style={styles.emptyTitle}>Нет блюд в шаблоне</Text>
      <Text style={styles.emptySubtitle}>
        Добавьте блюда, чтобы использовать этот шаблон
      </Text>
    </View>
  );

  if (mealTemplateStore.loading) {
    return <Loading message="Загрузка шаблона..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title={currentTemplate.name || formatMealType(currentTemplate.mealType)}
        subtitle={<Text style={styles.headerSubtitle}>{formatMealType(currentTemplate.mealType)}</Text>}
        showBackButton
        onBackPress={handleBack}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEditMealType} style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowActionsMenu(true)}
              style={styles.menuButton}
            >
              <Ionicons name="ellipsis-vertical" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      <FlashList
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        data={elements}
        renderItem={renderElement}
        keyExtractor={(item) => item.id.toString()}
        estimatedItemSize={80}
        ListHeaderComponent={
          <>
            {/* Summary */}
            <View style={styles.summary}>
              <CompactSummary
                calories={totalCalories}
                proteins={totalProteins}
                fats={totalFats}
                carbohydrates={totalCarbohydrates}
                variant="large"
              />
            </View>

            {/* Elements Title */}
            <View style={styles.elementsTitleContainer}>
              <Text style={styles.elementsTitle}>Блюда</Text>
            </View>
          </>
        }
        ListEmptyComponent={renderEmptyState()}
        ListFooterComponent={<View style={styles.footerSpacing} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Action Buttons */}
      <View style={styles.addButtonContainer}>
        <Button
          title="+ Добавить блюдо"
          onPress={handleAddElement}
          style={styles.addButton}
          variant="outline"
        />
        <Button
          title="Использовать шаблон"
          onPress={handleUseTemplate}
          style={styles.useButton}
        />
      </View>

      {/* Meal Type Edit Dialog */}
      <MealTypeEditDialog
        visible={showEditDialog}
        currentType={currentTemplate.mealType}
        onSelect={handleMealTypeSelect}
        onCancel={() => setShowEditDialog(false)}
      />

      {/* DateTime Picker Dialog */}
      <DateTimePickerDialog
        visible={showDateTimeDialog}
        defaultDate={(() => {
          // Use selected date from mealStore, not current date
          const now = new Date();
          const selectedDate = new Date(mealStore.selectedDate);
          // Set time to current time, but keep the selected date
          selectedDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
          return selectedDate;
        })()}
        defaultTime={new Date()}
        onConfirm={handleDateTimeConfirm}
        onCancel={() => setShowDateTimeDialog(false)}
      />

      {/* Actions Menu */}
      <MealActionsMenu
        visible={showActionsMenu}
        onClose={() => setShowActionsMenu(false)}
        onSaveAsTemplate={() => {}} // Not applicable for templates
        onCopy={() => {}} // Not applicable for templates
        onDelete={handleDeleteTemplate}
      />

      {/* Alert Dialog */}
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 200, // Space for buttons (increased to prevent overlap with two buttons)
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    fontSize: 12,
  },
  editButton: {
    padding: spacing.xs,
  },
  menuButton: {
    padding: spacing.xs,
  },
  summary: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  elementsTitleContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  elementsTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  elementCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.paper,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  elementImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  elementInfo: {
    flex: 1,
  },
  elementName: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  elementDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  elementQuantity: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  elementCalories: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  elementNutrients: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  nutrientText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
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
  },
  footerSpacing: {
    height: spacing.md,
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
    gap: spacing.md,
  },
  addButton: {
    width: '100%',
  },
  useButton: {
    width: '100%',
  },
});

export default MealTemplateScreen;

