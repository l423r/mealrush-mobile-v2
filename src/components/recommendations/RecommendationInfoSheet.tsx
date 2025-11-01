import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

type InfoType = 'products' | 'mealPicks' | 'insights';

interface RecommendationInfoSheetProps {
  visible: boolean;
  type: InfoType;
  onClose: () => void;
  userGoal?: 'GAIN' | 'LOSE' | 'SAVE';
  preferredCategories?: string[];
}

interface ContentSection {
  title: string;
  description?: string;
  items?: string[];
}

interface SheetContent {
  title: string;
  icon: string;
  sections: ContentSection[];
}

const RecommendationInfoSheet: React.FC<RecommendationInfoSheetProps> = ({
  visible,
  type,
  onClose,
  userGoal = 'SAVE',
  preferredCategories = [],
}) => {
  const getGoalLabel = () => {
    const goals = {
      GAIN: 'Набор массы',
      LOSE: 'Похудение',
      SAVE: 'Поддержание веса',
    };
    return goals[userGoal];
  };

  const getContent = (): SheetContent => {
    switch (type) {
      case 'products':
        return {
          title: 'Как работают рекомендации?',
          icon: '✨',
          sections: [
            {
              title: `🎯 Ваша цель: ${getGoalLabel()}`,
              description:
                userGoal === 'GAIN'
                  ? 'Мы рекомендуем продукты с высоким содержанием белка (>15г на 100г), которые помогут вам набрать мышечную массу.'
                  : userGoal === 'LOSE'
                  ? 'Мы рекомендуем низкокалорийные продукты (<50 ккал на 100г), которые помогут вам снизить вес.'
                  : 'Мы рекомендуем сбалансированные продукты, подходящие для поддержания текущего веса.',
            },
            {
              title: '📊 Что мы учитываем:',
              items: [
                'Вашу историю питания за последние 30 дней',
                preferredCategories.length > 0
                  ? `Ваши любимые категории: ${preferredCategories.slice(0, 3).join(', ')}`
                  : 'Ваши предпочтения в продуктах',
                'Продукты, которые вы ещё не пробовали',
                'Полноту данных о составе продукта',
              ],
            },
            {
              title: '🔄 Как обновить:',
              description:
                'Потяните экран вниз, чтобы получить новые рекомендации с учетом последних данных.',
            },
          ],
        };

      case 'mealPicks':
        return {
          title: 'Подборки для приёма пищи',
          icon: '🎯',
          sections: [
            {
              title: `🎯 Подобрано под цель: ${getGoalLabel()}`,
              description:
                userGoal === 'GAIN'
                  ? 'Продукты с максимальным содержанием белка для эффективного набора массы.'
                  : userGoal === 'LOSE'
                  ? 'Низкокалорийные продукты для снижения веса без чувства голода.'
                  : 'Сбалансированные продукты для поддержания веса и здоровья.',
            },
            {
              title: '⚡ Быстрое добавление:',
              description:
                'Нажмите на зеленую кнопку "+", чтобы быстро добавить продукт в текущий приём пищи.',
            },
            {
              title: '🔄 Обновление:',
              description:
                'Нажмите кнопку "Обновить", чтобы получить новые подборки на основе актуальных данных.',
            },
          ],
        };

      case 'insights':
        return {
          title: 'Инсайты о питании',
          icon: '⚡',
          sections: [
            {
              title: '📈 Анализ в реальном времени',
              description:
                'Мы анализируем ваше питание за сегодня и сравниваем с дневной нормой.',
            },
            {
              title: '🎨 Цветовые индикаторы:',
              items: [
                '🔴 Красный - критическая ситуация (>120% или <80% нормы)',
                '⚠️ Оранжевый - предупреждение (требует внимания)',
                '💡 Синий - информация и достижения',
              ],
            },
            {
              title: '📊 Что отслеживаем:',
              items: [
                'Баланс калорий относительно дневной нормы',
                'Достаточность белка для вашей цели',
                'Соотношение макронутриентов (Б/Ж/У)',
              ],
            },
          ],
        };

      default:
        return { title: '', icon: '', sections: [] };
    }
  };

  const content = getContent();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.sheet}>
          <TouchableOpacity activeOpacity={1}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerIcon}>{content.icon}</Text>
              <Text style={styles.headerTitle}>{content.title}</Text>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {content.sections.map((section, index) => (
                <View key={index} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.description && (
                    <Text style={styles.sectionDescription}>
                      {section.description}
                    </Text>
                  )}
                  {section.items && (
                    <View style={styles.itemsList}>
                      {section.items.map((item, itemIndex) => (
                        <View key={itemIndex} style={styles.item}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.itemText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Понятно</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background.paper,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '80%',
    ...shadows.xl,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  headerTitle: {
    ...typography.h5,
    color: colors.text.primary,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    maxHeight: 400,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    ...typography.body2,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  itemsList: {
    marginTop: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  bullet: {
    ...typography.body2,
    color: colors.primary,
    marginRight: spacing.sm,
    fontWeight: '700',
  },
  itemText: {
    ...typography.body2,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  closeButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '700',
  },
});

export default RecommendationInfoSheet;

