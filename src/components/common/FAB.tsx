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
import { useTheme } from '../../hooks/useTheme';
import { typography, spacing, shadows, borderRadius } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

interface FABProps {
    onAddMeal: () => void;
    onAddFromTemplate: () => void;
}

const { width } = Dimensions.get('window');

const FAB: React.FC<FABProps> = ({ onAddMeal, onAddFromTemplate }) => {
    const { colors } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    const toggleMenu = () => {
        const toValue = isOpen ? 0 : 1;
        triggerHaptic('selection');

        Animated.spring(animation, {
            toValue,
            friction: 5,
            useNativeDriver: true,
        }).start();

        setIsOpen(!isOpen);
    };

    const rotation = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    const opacity = animation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });

    const translateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
    });

    return (
        <View style={styles.container}>
            {isOpen && (
                <TouchableWithoutFeedback onPress={toggleMenu}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>
            )}

            <View style={styles.actionsContainer}>
                <Animated.View
                    style={[
                        styles.actionButtonContainer,
                        {
                            opacity,
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    <View style={styles.labelContainer}>
                        <Text style={[styles.label, { color: colors.text.primary, backgroundColor: colors.background.paper }]}>
                            Из шаблона
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.background.paper }]}
                        onPress={() => {
                            toggleMenu();
                            onAddFromTemplate();
                        }}
                    >
                        <Text style={styles.actionIcon}>📌</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.actionButtonContainer,
                        {
                            opacity,
                            transform: [{ translateY: Animated.multiply(translateY, 0.8) }], // Stagger effect
                            marginBottom: spacing.md,
                        },
                    ]}
                >
                    <View style={styles.labelContainer}>
                        <Text style={[styles.label, { color: colors.text.primary, backgroundColor: colors.background.paper }]}>
                            Новый прием
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.background.paper }]}
                        onPress={() => {
                            toggleMenu();
                            onAddMeal();
                        }}
                    >
                        <Text style={styles.actionIcon}>🍽️</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <TouchableOpacity
                activeOpacity={0.9}
                onPress={toggleMenu}
                style={[styles.fabContainer, shadows.soft]}
            >
                <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fab}
                >
                    <Animated.Text
                        style={[
                            styles.fabIcon,
                            {
                                color: colors.text.inverse,
                                transform: [{ rotate: rotation }],
                            },
                        ]}
                    >
                        +
                    </Animated.Text>
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
    overlay: {
        position: 'absolute',
        bottom: -spacing.xl,
        right: -spacing.xl,
        width: width * 2, // Ensure full coverage
        height: 1000, // Arbitrary large height
        backgroundColor: 'rgba(0,0,0,0.3)',
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
    actionsContainer: {
        position: 'absolute',
        bottom: 70,
        right: 0,
        alignItems: 'flex-end',
    },
    actionButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    labelContainer: {
        marginRight: spacing.sm,
    },
    label: {
        ...typography.caption,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
        fontWeight: '600',
        elevation: 2,
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    actionIcon: {
        fontSize: 20,
    },
});

export default FAB;
