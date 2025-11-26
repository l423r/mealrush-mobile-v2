import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { typography, spacing, shadows, borderRadius } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

interface FABProps {
    onAddMeal: () => void;
    onAddFromTemplate: () => void;
}

const { width } = Dimensions.get('window');

const FAB: React.FC<FABProps> = ({ onAddMeal }) => {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                    triggerHaptic('selection');
                    onAddMeal();
                }}
                style={[styles.fabContainer, shadows.soft]}
            >
                <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fab}
                >
                    <Text style={[styles.fabIcon, { color: colors.text.inverse }]}>
                        +
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: spacing.xl,
        right: spacing.xl,
        alignItems: 'center',
        zIndex: 999,
    },
    fabContainer: {
        borderRadius: 30,
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabIcon: {
        fontSize: 32,
        fontWeight: '300',
        marginTop: -2,
    },
});

export default FAB;
