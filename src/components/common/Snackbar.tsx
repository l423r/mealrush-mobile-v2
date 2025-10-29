import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';

const Snackbar: React.FC = observer(() => {
  const { uiStore } = useStores();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (uiStore.snackbar.visible) {
      // Показываем snackbar
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Автоматически скрываем через 4 секунды
      const timer = setTimeout(() => {
        hideSnackbar();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      // Скрываем snackbar
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [uiStore.snackbar.visible]);

  const hideSnackbar = () => {
    uiStore.hideSnackbar();
  };

  if (!uiStore.snackbar.visible) {
    return null;
  }

  const getIconName = () => {
    switch (uiStore.snackbar.type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  const getBackgroundColor = () => {
    switch (uiStore.snackbar.type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
      default:
        return colors.info;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.snackbar, { backgroundColor: getBackgroundColor() }]}>
        <MaterialIcons
          name={getIconName()}
          size={24}
          color={colors.white}
          style={styles.icon}
        />
        <Text style={styles.message} numberOfLines={2}>
          {uiStore.snackbar.message}
        </Text>
        <TouchableOpacity onPress={hideSnackbar} style={styles.closeButton}>
          <MaterialIcons name="close" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    right: spacing.md,
    zIndex: 10000,
  },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.md,
    elevation: 8,
  },
  icon: {
    marginRight: spacing.sm,
  },
  message: {
    ...typography.body1,
    color: colors.white,
    flex: 1,
    fontWeight: '500',
  },
  closeButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
});

export default Snackbar;

