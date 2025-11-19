import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utility
 * Provides a consistent interface for haptic feedback across the app.
 * Safely handles platforms where haptics might not be available.
 */

export const haptics = {
    /**
     * Light impact, suitable for button presses or selection changes
     */
    light: async () => {
        if (Platform.OS === 'web') return;
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            // Ignore errors on unsupported devices
        }
    },

    /**
     * Medium impact, suitable for more significant actions
     */
    medium: async () => {
        if (Platform.OS === 'web') return;
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            // Ignore errors on unsupported devices
        }
    },

    /**
     * Heavy impact, suitable for destructive actions or major state changes
     */
    heavy: async () => {
        if (Platform.OS === 'web') return;
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (error) {
            // Ignore errors on unsupported devices
        }
    },

    /**
     * Success notification feedback
     */
    success: async () => {
        if (Platform.OS === 'web') return;
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            // Ignore errors on unsupported devices
        }
    },

    /**
     * Warning notification feedback
     */
    warning: async () => {
        if (Platform.OS === 'web') return;
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch (error) {
            // Ignore errors on unsupported devices
        }
    },

    /**
     * Error notification feedback
     */
    error: async () => {
        if (Platform.OS === 'web') return;
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (error) {
            // Ignore errors on unsupported devices
        }
    },

    /**
     * Selection feedback, suitable for scrollers or pickers
     */
    selection: async () => {
        if (Platform.OS === 'web') return;
        try {
            await Haptics.selectionAsync();
        } catch (error) {
            // Ignore errors on unsupported devices
        }
    },
};

export const triggerHaptic = (type: keyof typeof haptics) => {
    const hapticFunction = haptics[type];
    if (hapticFunction) {
        hapticFunction();
    }
};
