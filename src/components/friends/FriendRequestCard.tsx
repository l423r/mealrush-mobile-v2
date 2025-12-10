import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { typography, spacing, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { CachedImage } from '../common/CachedImage';
import Button from '../common/Button';
import type { FriendRequest } from '../../types/friends.types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface FriendRequestCardProps {
  request: FriendRequest;
  isIncoming: boolean;
  onAccept?: (requestId: number) => void;
  onDecline?: (requestId: number) => void;
  onCancel?: (requestId: number) => void;
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = observer(({
  request,
  isIncoming,
  onAccept,
  onDecline,
  onCancel,
}) => {
  const { colors } = useTheme();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMM yyyy', { locale: ru });
    } catch {
      return dateString;
    }
  };

  const userInfo = isIncoming
    ? {
        name: request.senderName || 'Пользователь',
        email: request.senderEmail || '',
        avatarUrl: request.senderAvatarUrl,
      }
    : {
        name: request.receiverName || 'Пользователь',
        email: request.receiverEmail || '',
        avatarUrl: request.receiverAvatarUrl,
      };

  return (
    <View style={[styles.container, { borderColor: colors.border.light }]}>
      <View style={styles.content}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.background.light }]}>
          {userInfo.avatarUrl ? (
            <CachedImage
              uri={userInfo.avatarUrl}
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
            {userInfo.name}
          </Text>
          {userInfo.email && (
            <Text style={[styles.email, { color: colors.text.secondary }]} numberOfLines={1}>
              {userInfo.email}
            </Text>
          )}
          <Text style={[styles.date, { color: colors.text.hint }]}>
            {formatDate(request.createdAt)}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {isIncoming ? (
          <>
            <Button
              title="Принять"
              onPress={() => onAccept?.(request.id)}
              variant="primary"
              size="small"
              style={styles.actionButton}
            />
            <Button
              title="Отклонить"
              onPress={() => onDecline?.(request.id)}
              variant="outline"
              size="small"
              style={styles.actionButton}
            />
          </>
        ) : (
          <Button
            title="Отозвать"
            onPress={() => onCancel?.(request.id)}
            variant="outline"
            size="small"
            style={styles.actionButton}
          />
        )}
      </View>
    </View>
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
    marginBottom: spacing.md,
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
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});

export default FriendRequestCard;

