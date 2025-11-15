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
import { MaterialIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import { useStores } from '../../stores';
import Loading from './Loading';

interface MealTemplateSelectorDialogProps {
  visible: boolean;
  onClose: () => void;
  onTemplateSelect: (templateId: number) => void;
}

const MealTemplateSelectorDialog: React.FC<MealTemplateSelectorDialogProps> = observer(({
  visible,
  onClose,
  onTemplateSelect,
}) => {
  const { mealTemplateStore } = useStores();

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

  const getMealTypeIcon = (mealType: string): string => {
    const icons: Record<string, string> = {
      BREAKFAST: '🌅',
      LUNCH: '🌞',
      DINNER: '🌙',
      SUPPER: '☕',
      LATE_SUPPER: '🌃',
    };
    return icons[mealType] || '🍽️';
  };

  const handleTemplatePress = (templateId: number) => {
    onTemplateSelect(templateId);
    onClose();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📌</Text>
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
                          <Text style={styles.templateIcon}>
                            {getMealTypeIcon(template.mealType)}
                          </Text>
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
                        <MaterialIcons
                          name="chevron-right"
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
  templateIcon: {
    fontSize: 20,
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
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
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

