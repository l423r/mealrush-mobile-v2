import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useTheme } from '../../hooks/useTheme';
import { typography, spacing, borderRadius, shadows } from '../../theme';
import Button from '../common/Button';

interface AIAnalysisModalProps {
  visible: boolean;
  analysisText: string | null;
  analysisError: string | null;
  analysisLoading: boolean;
  analysisUpdatedAt: string | null;
  onClose: () => void;
  onRetry: () => void;
}

const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  visible,
  analysisText,
  analysisError,
  analysisLoading,
  analysisUpdatedAt,
  onClose,
  onRetry,
}) => {
  const { colors } = useTheme();

  // Debug logging
  React.useEffect(() => {
    console.log('[AIAnalysisModal] Render:', {
      visible,
      analysisLoading,
      hasText: !!analysisText,
      hasError: !!analysisError,
      updatedAt: analysisUpdatedAt,
    });
  }, [visible, analysisLoading, analysisText, analysisError, analysisUpdatedAt]);

  const handleRetry = () => {
    onClose();
    onRetry();
  };

  const formatAnalysisText = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => {
      let trimmed = paragraph.trim();
      if (!trimmed) return null;

      // Нормализуем пробелы: заменяем множественные пробелы на одинарные, но сохраняем переносы строк
      trimmed = trimmed.replace(/[ \t]+/g, ' ').replace(/[ \t]*\n[ \t]*/g, '\n');

      // Проверяем, является ли параграф заголовком
      const isHeading = /^\d+[\.\)]\s/.test(trimmed) || /^[А-ЯЁ][^:]*:\s*$/.test(trimmed.split('\n')[0]);
      const isSubheading = /^[•\-\*]\s/.test(trimmed);

      return (
        <View key={index} style={styles.paragraph}>
          {isHeading ? (
            <Text style={[styles.heading, { color: colors.text.primary }]}>
              {trimmed}
            </Text>
          ) : isSubheading ? (
            <Text style={[styles.subheading, { color: colors.text.primary }]}>
              {trimmed}
            </Text>
          ) : (
            <Text style={[styles.text, { color: colors.text.primary }]}>
              {trimmed}
            </Text>
          )}
        </View>
      );
    });
  };

  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      // Закрываем модальное окно при свайпе вниз
      if (event.translationY > 100 && event.velocityY > 500) {
        onClose();
      }
    });

  console.log('[AIAnalysisModal] Component render, visible:', visible);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <GestureDetector gesture={panGesture}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background.paper },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {/* Drag indicator */}
            <View style={[styles.dragIndicator, { backgroundColor: colors.border.light }]} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border.light }]}>
              <View style={styles.headerLeft}>
                <Text style={[styles.title, { color: colors.text.primary }]}>
                  Анализ дня
                </Text>
                {analysisUpdatedAt && !analysisLoading && (
                  <Text style={[styles.timestamp, { color: colors.text.secondary }]}>
                    {analysisUpdatedAt}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {analysisLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                    Выполняем анализ...
                  </Text>
                </View>
              ) : analysisError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={24} color={colors.error} />
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {analysisError}
                  </Text>
                </View>
              ) : analysisText ? (
                <View style={styles.content}>{formatAnalysisText(analysisText)}</View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="sparkles-outline" size={48} color={colors.text.secondary} />
                  <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                    Нажмите кнопку анализа для получения рекомендаций
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: colors.border.light }]}>
              <Button
                title="Повторить запрос"
                onPress={handleRetry}
                variant="primary"
                size="medium"
                disabled={analysisLoading}
                loading={analysisLoading}
              />
            </View>
          </View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    minHeight: 300,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.xl,
    elevation: 10,
    overflow: 'hidden',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: borderRadius.round,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  timestamp: {
    ...typography.caption,
    fontSize: 12,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    ...typography.body1,
    marginTop: spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  errorText: {
    ...typography.body1,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.body1,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  content: {
    gap: spacing.md,
  },
  paragraph: {
    marginBottom: spacing.md,
  },
  heading: {
    ...typography.h5,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  subheading: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  text: {
    ...typography.body1,
    lineHeight: 22,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
});

export default AIAnalysisModal;
