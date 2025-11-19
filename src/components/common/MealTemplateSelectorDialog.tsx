import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation.types';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import { useStores } from '../../stores';
import Loading from './Loading';

type MealTemplateSelectorDialogNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'MealTemplate'
>;

interface MealTemplateSelectorDialogProps {
  visible: boolean;
  onClose: () => void;
  onTemplateSelect?: (templateId: number) => void; // Optional for backward compatibility
}

const MealTemplateSelectorDialog: React.FC<MealTemplateSelectorDialogProps> = observer(({
  visible,
  onClose,
  onTemplateSelect,
}) => {
  const { mealTemplateStore } = useStores();
  const navigation = useNavigation<MealTemplateSelectorDialogNavigationProp>();

  useEffect(() => {
    if (visible) {
      mealTemplateStore.loadTemplates(0, 50);
    }
  }, [visible, mealTemplateStore]);

  const getMealTypeLabel = (mealType: string): string => {
    const labels: Record<string, string> = {
      BREAKFAST: 'Завтрак',
      LUNCH: 'Обед',
      DINNER: 'Ужин',
      SUPPER: 'Перекус',
      LATE_SUPPER: 'Поздний перекус',
    };
    return labels[mealType] || mealType;
  };

  const getMealTypeIcon = (mealType: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      BREAKFAST: 'sunny-outline',
      LUNCH: 'partly-sunny-outline',
      DINNER: 'moon-outline',
      SUPPER: 'cafe-outline',
      LATE_SUPPER: 'moon',
    };
    return icons[mealType] || 'restaurant-outline';
  };

  const handleTemplatePress = async (templateId: number) => {
    try {
      // Load template and navigate to template screen
      const template = await mealTemplateStore.loadTemplate(templateId);
      onClose();
      navigation.navigate('MealTemplate', { template });
    } catch (error) {
      // If loading fails, fall back to onTemplateSelect if provided
      if (onTemplateSelect) {
        onTemplateSelect(templateId);
        onClose();
      }
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="bookmark-outline" size={64} color={colors.text.secondary} />
      <Text style={styles.emptyTitle}>Нет шаблонов</Text>
      <Text style={styles.emptySubtitle}>
        Сохраните прием пищи как шаблон для быстрого использования
      </Text>
    </View>
  );

  if (mealTemplateStore.loading) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Loading message="Загрузка шаблонов..." />
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogContainer}>
              <View style={styles.dialog}>
                <Text style={styles.title}>Выберите шаблон</Text>
                <Text style={styles.subtitle}>
                  {mealTemplateStore.templates.length > 0
                    ? 'Выберите шаблон для создания приема пищи'
                    : 'У вас пока нет сохраненных шаблонов'}
                </Text>

                {mealTemplateStore.templates.length > 0 ? (
                  <ScrollView
                    style={styles.templatesScrollView}
                    showsVerticalScrollIndicator={false}
                  >
                    {mealTemplateStore.templates.map((template) => (
                      <TouchableOpacity
                        key={template.id}
                        style={styles.templateOption}
                        onPress={() => handleTemplatePress(template.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.templateIconContainer}>
                          <Ionicons
                            name={getMealTypeIcon(template.mealType)}
                            size={20}
                            color={colors.text.primary}
                          />
                        </View>
                        <View style={styles.templateInfo}>
                          <Text style={styles.templateName}>
                            {template.name || getMealTypeLabel(template.mealType)}
                          </Text>
                          <Text style={styles.templateType}>
                            {getMealTypeLabel(template.mealType)}
                            {template.elements && template.elements.length > 0 && (
                              <> • {template.elements.length} блюд</>
                            )}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={colors.text.hint}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  renderEmptyState()
                )}

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Отмена</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: '95%',
    maxWidth: 500,
  },
  dialog: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.xl,
    elevation: 10,
    // maxHeight: '95%',
    // minHeight: 400,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textAlign: 'center',
    lineHeight: 18,
  },
  templatesScrollView: {
    maxHeight: 450,
    marginBottom: spacing.sm,
  },
  templateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  templateIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 1,
  },
  templateType: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
  },
  cancelText: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MealTemplateSelectorDialog;

