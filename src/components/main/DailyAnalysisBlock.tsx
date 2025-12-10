import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../hooks/useTheme';
import { useStores } from '../../stores';
import { typography, spacing, borderRadius, shadows } from '../../theme';
import Button from '../common/Button';

interface DailyAnalysisBlockProps {
  analysisText: string | null;
  analysisError: string | null;
  analysisLoading: boolean;
  analysisUpdatedAt: string | null;
  onRetry: () => void;
}

const DailyAnalysisBlock: React.FC<DailyAnalysisBlockProps> = ({
  analysisText,
  analysisError,
  analysisLoading,
  analysisUpdatedAt,
  onRetry,
}) => {
  const { colors } = useTheme();
  const { uiStore } = useStores();
  const [isExpanded, setIsExpanded] = useState(true);

  // Автоматически разворачиваем блок при начале загрузки или при ошибке
  useEffect(() => {
    if (analysisLoading || analysisError) {
      setIsExpanded(true);
    }
  }, [analysisLoading, analysisError]);

  // Показываем блок только если есть данные (загрузка, ошибка или результат)
  const hasData = analysisLoading || analysisError || analysisText;
  if (!hasData) {
    return null;
  }

  const formatAnalysisText = (text: string) => {
    // Разбиваем текст на параграфы по двойным переносам строк
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Убираем только пробелы в начале и конце параграфа
      let trimmed = paragraph.trim();
      if (!trimmed) return null;

      // Убираем только пробелы в начале и конце каждой строки
      // Это убирает лишние пробелы по краям, но сохраняет структуру текста
      trimmed = trimmed.split('\n').map(line => line.trim()).join('\n');

      // Проверяем, является ли параграф заголовком
      const firstLine = trimmed.split('\n')[0];
      const isHeading = /^\d+[\.\)]\s/.test(firstLine) || /^[А-ЯЁ][^:]*:\s*$/.test(firstLine);
      const isSubheading = /^[•\-\*]\s/.test(firstLine);

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

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background.paper,
          borderColor: colors.border.light,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeftTouchable}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <View style={styles.titleRow}>
              <Ionicons
                name="sparkles-outline"
                size={20}
                color={colors.primary}
                style={styles.icon}
              />
              <Text style={[styles.title, { color: colors.text.primary }]}>
                Анализ дня
              </Text>
            </View>
            {analysisUpdatedAt && !analysisLoading && (
              <Text style={[styles.timestamp, { color: colors.text.secondary }]}>
                {analysisUpdatedAt}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          {analysisText && !analysisLoading && (
            <TouchableOpacity
              onPress={async () => {
                if (analysisText) {
                  await Clipboard.setStringAsync(analysisText);
                  uiStore.showSnackbar('Скопировано', 'success');
                }
              }}
              style={[
                styles.copyButton,
                {
                  backgroundColor: colors.background.light,
                  borderColor: colors.border.light,
                },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="copy-outline"
                size={18}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {isExpanded && (
        <View style={styles.content}>
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
              <View style={styles.errorContent}>
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {analysisError}
                </Text>
                <Button
                  title="Повторить запрос"
                  onPress={onRetry}
                  variant="primary"
                  size="small"
                  style={styles.retryButton}
                />
              </View>
            </View>
          ) : analysisText ? (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              <View style={styles.analysisContent}>
                {formatAnalysisText(analysisText)}
              </View>
            </ScrollView>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    ...shadows.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeftTouchable: {
    flex: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  copyButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.round,
    borderWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  icon: {
    marginRight: spacing.xs,
  },
  title: {
    ...typography.h5,
    fontWeight: '600',
  },
  timestamp: {
    ...typography.caption,
    fontSize: 12,
    marginTop: spacing.xs / 2,
  },
  content: {
    marginTop: spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.body1,
    marginTop: spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  errorContent: {
    flex: 1,
    gap: spacing.sm,
  },
  errorText: {
    ...typography.body1,
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
  scrollView: {
    maxHeight: 400,
  },
  scrollContent: {
    paddingBottom: spacing.xs,
  },
  analysisContent: {
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
});

export default DailyAnalysisBlock;
