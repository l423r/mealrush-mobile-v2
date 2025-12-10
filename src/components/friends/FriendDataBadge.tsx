import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import type { Friend } from '../../types/friends.types';

interface FriendDataBadgeProps {
  friend: Friend;
}

const FriendDataBadge: React.FC<FriendDataBadgeProps> = ({ friend }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.primary + '20',
          borderColor: colors.primary + '40',
        },
      ]}
    >
      <Ionicons
        name="person"
        size={14}
        color={colors.primary}
      />
      <Text style={[styles.text, { color: colors.primary }]}>
        Данные {friend.name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.xs / 2,
    alignSelf: 'flex-start',
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  text: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
});

export default FriendDataBadge;

