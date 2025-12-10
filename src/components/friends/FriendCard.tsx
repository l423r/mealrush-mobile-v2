import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { typography, spacing, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { CachedImage } from '../common/CachedImage';
import type { Friend } from '../../types/friends.types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface FriendCardProps {
  friend: Friend;
  onPress?: (friend: Friend) => void;
  onSettingsPress?: (friend: Friend) => void;
}

const FriendCard: React.FC<FriendCardProps> = observer(({
  friend,
  onPress,
  onSettingsPress,
}) => {
  const { colors } = useTheme();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: ru });
    } catch {
      return dateString;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: colors.border.light }]}
      onPress={() => onPress?.(friend)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.background.light }]}>
          {friend.avatarUrl ? (
            <CachedImage
              uri={friend.avatarUrl}
              style={styles.avatar}
            />
          ) : (
            <Ionicons
              name="person"
              size={24}
              color={colors.text.secondary}
            />
          )}
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>
            {friend.name}
          </Text>
          <Text style={[styles.email, { color: colors.text.secondary }]} numberOfLines={1}>
            {friend.email}
          </Text>
          <Text style={[styles.date, { color: colors.text.hint }]}>
            Друзья с {formatDate(friend.friendsSince)}
          </Text>
        </View>

        {onSettingsPress && (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={(e) => {
              e.stopPropagation();
              onSettingsPress(friend);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    ...shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.round,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  email: {
    ...typography.caption,
    marginBottom: spacing.xs / 2,
  },
  date: {
    ...typography.caption,
    fontSize: 11,
  },
  settingsButton: {
    padding: spacing.xs,
  },
});

export default FriendCard;

