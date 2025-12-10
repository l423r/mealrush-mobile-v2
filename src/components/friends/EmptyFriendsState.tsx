import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import Button from '../common/Button';

interface EmptyFriendsStateProps {
  onAddFriend?: () => void;
}

const EmptyFriendsState: React.FC<EmptyFriendsStateProps> = ({
  onAddFriend,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.background.light }]}>
        <Ionicons
          name="people-outline"
          size={64}
          color={colors.text.hint}
        />
      </View>
      <Text style={[styles.title, { color: colors.text.primary }]}>
        Нет друзей
      </Text>
      <Text style={[styles.description, { color: colors.text.secondary }]}>
        Добавьте друзей, чтобы следить за их прогрессом и делиться своими достижениями
      </Text>
      {onAddFriend && (
        <Button
          title="Добавить друга"
          onPress={onAddFriend}
          variant="primary"
          size="medium"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h4,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...typography.body1,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  button: {
    minWidth: 200,
  },
});

export default EmptyFriendsState;

