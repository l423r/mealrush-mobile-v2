import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface SectionHeaderProps {
  title: string;
  icon?: string; // Ionicons name
  actionText?: string;
  onActionPress?: () => void;
  count?: number;
  onInfoPress?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon,
  actionText,
  onActionPress,
  count,
  onInfoPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={24}
            color={colors.text.primary}
            style={styles.icon}
          />
        )}
        <Text style={styles.title}>{title}</Text>
        {onInfoPress && (
          <TouchableOpacity
            onPress={onInfoPress}
            style={styles.infoButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={colors.text.secondary}
              style={styles.infoIcon}
            />
          </TouchableOpacity>
        )}
        {count !== undefined && count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </View>
      {actionText && onActionPress && (
        <TouchableOpacity onPress={onActionPress} style={styles.action}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h5,
    color: colors.text.primary,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginLeft: spacing.sm,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    ...typography.caption,
    color: colors.background.paper,
    fontWeight: '700',
    fontSize: 12,
  },
  action: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary + '15',
    borderRadius: 20,
  },
  actionText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  infoButton: {
    marginLeft: spacing.xs,
  },
  infoIcon: {
    opacity: 0.7,
  },
});

export default SectionHeader;

