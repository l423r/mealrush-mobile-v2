import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

interface NotificationPermissionBannerProps {
  onEnable: () => void;
  onDismiss: () => void;
}

const NotificationPermissionBanner: React.FC<
  NotificationPermissionBannerProps
> = ({ onEnable, onDismiss }) => {
  return (
    <View style={[styles.container, shadows.medium]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={40} color="white" />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Включите уведомления</Text>
          <Text style={styles.description}>
            Получайте напоминания о приёмах пищи и отслеживайте свой прогресс
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={onEnable}>
          <Text style={styles.buttonText}>Включить</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
    padding: spacing.xs,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  content: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.button,
    color: colors.primary,
  },
});

export default NotificationPermissionBanner;

