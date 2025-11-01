import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import type { InsightResponse } from '../../types/api.types';

interface InsightCardProps {
  insight: InsightResponse;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const getInsightStyle = () => {
    switch (insight.severity) {
      case 'CRITICAL':
        return {
          backgroundColor: colors.error + '10',
          borderColor: colors.error,
          icon: '🔴',
          textColor: colors.error,
        };
      case 'WARNING':
        return {
          backgroundColor: colors.warning + '10',
          borderColor: colors.warning,
          icon: '⚠️',
          textColor: colors.warning,
        };
      default:
        return {
          backgroundColor: colors.info + '10',
          borderColor: colors.info,
          icon: '💡',
          textColor: colors.info,
        };
    }
  };

  const style = getInsightStyle();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{style.icon}</Text>
        <View style={styles.content}>
          <Text style={[styles.title, { color: style.textColor }]}>
            {insight.title}
          </Text>
          <Text style={styles.description}>{insight.description}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.h6,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body2,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default InsightCard;

