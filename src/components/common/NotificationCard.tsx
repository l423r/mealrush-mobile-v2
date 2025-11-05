import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import type { NotificationType } from '../../types/api.types';

interface NotificationCardProps {
  type: NotificationType;
  title: string;
  message: string;
  onDismiss?: () => void;
  autoHideDuration?: number; // в миллисекундах
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NotificationCard: React.FC<NotificationCardProps> = ({
  type,
  title,
  message,
  onDismiss,
  autoHideDuration = 4000,
}) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Анимация появления
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });
    opacity.value = withTiming(1, { duration: 300 });

    // Автоматическое скрытие
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    translateY.value = withTiming(-100, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      if (onDismiss) {
        runOnJS(onDismiss)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: colors.success,
          backgroundColor: colors.successLight || '#E8F5E9',
        };
      case 'error':
        return {
          icon: 'close-circle' as const,
          color: colors.error,
          backgroundColor: colors.errorLight || '#FFEBEE',
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          color: colors.warning || '#FF9800',
          backgroundColor: '#FFF3E0',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          color: colors.primary,
          backgroundColor: colors.primaryLight || '#E8F5E9',
        };
    }
  };

  const { icon, color, backgroundColor } = getIconAndColor();

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.card, { backgroundColor }, shadows.medium]}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    width: '100%',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  message: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  closeButton: {
    padding: spacing.xs,
  },
});

export default NotificationCard;

