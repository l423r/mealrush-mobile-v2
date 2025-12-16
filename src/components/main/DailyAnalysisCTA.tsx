import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../common/Button';
import { useTheme } from '../../hooks/useTheme';
import { spacing, typography, borderRadius, shadows } from '../../theme';

interface DailyAnalysisCTAProps {
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
  disabledMessage?: string | null;
  result?: string | null;
  updatedAt?: string | null;
  error?: string | null;
  onRetry?: () => void;
}

const DailyAnalysisCTA: React.FC<DailyAnalysisCTAProps> = ({
  onPress,
  loading,
  disabled,
  disabledMessage,
  result,
  updatedAt,
  error,
  onRetry,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.background.paper,
          borderColor: colors.border.light,
        },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Анализ дня
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Краткий разбор КБЖУ и совместимости продуктов
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.primary + '15',
              borderColor: colors.primary + '30',
            },
          ]}
        >
          <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            AI
          </Text>
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <Button
          title={disabled ? 'Доступно позже' : 'Провести анализ'}
          onPress={onPress}
          loading={loading}
          disabled={disabled}
        />
        {disabledMessage ? (
          <Text style={[styles.hint, { color: colors.text.secondary }]}>
            {disabledMessage}
          </Text>
        ) : null}
      </View>

      {error ? (
        <View
          style={[
            styles.statusBox,
            { backgroundColor: colors.error + '12', borderColor: colors.error },
          ]}
        >
          <Text style={[styles.statusTitle, { color: colors.error }]}>
            Ошибка
          </Text>
          <Text style={[styles.statusText, { color: colors.error }]}>
            {error}
          </Text>
          {onRetry ? (
            <Text
              style={[styles.link, { color: colors.primary }]}
              onPress={onRetry}
            >
              Повторить
            </Text>
          ) : null}
        </View>
      ) : null}

      {result ? (
        <View
          style={[
            styles.statusBox,
            {
              backgroundColor: colors.primary + '08',
              borderColor: colors.primary + '30',
            },
          ]}
        >
          <View style={styles.resultHeader}>
            <Text style={[styles.statusTitle, { color: colors.text.primary }]}>
              Результат
            </Text>
            {updatedAt ? (
              <Text
                style={[styles.hint, { color: colors.text.secondary }]}
                numberOfLines={1}
              >
                Обновлено: {updatedAt}
              </Text>
            ) : null}
          </View>
          <Text style={[styles.statusText, { color: colors.text.primary }]}>
            {result}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  title: {
    ...typography.h5,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.body2,
    marginTop: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonWrapper: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  hint: {
    ...typography.caption,
  },
  statusBox: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  statusTitle: {
    ...typography.subtitle2,
    fontWeight: '700',
  },
  statusText: {
    ...typography.body2,
    lineHeight: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  link: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});

export default DailyAnalysisCTA;






