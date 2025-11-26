import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius, shadows } from '../../theme';
import { formatTimeInTimezone, formatMealType } from '../../utils/formatting';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { observer } from 'mobx-react-lite';

interface MealCardProps {
    meal: any;
    onPress: (meal: any) => void;
    userTimezone: string;
    totalCalories: number;
    totalProteins: number;
    totalFats: number;
    totalCarbohydrates: number;
}

const MealCard: React.FC<MealCardProps> = observer(({
    meal,
    onPress,
    userTimezone,
    totalCalories,
    totalProteins,
    totalFats,
    totalCarbohydrates,
}) => {
    const { colors } = useTheme();

    const getMealIcon = (type: string): keyof typeof Ionicons.glyphMap => {
        switch (type) {
            case 'BREAKFAST': return 'sunny-outline';
            case 'LUNCH': return 'partly-sunny-outline';
            case 'DINNER': return 'moon-outline';
            case 'SUPPER': return 'cafe-outline';
            default: return 'restaurant-outline';
        }
    };

    const getGradientColors = (type: string): [string, string] => {
        // Subtle gradients for card background
        return [colors.background.light, colors.background.paper];
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onPress(meal)}
            style={[styles.container, { borderColor: colors.border.light }]}
        >
            <LinearGradient
                colors={getGradientColors(meal.mealType)}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.background.elevated, borderColor: colors.border.light }]}>
                        <Ionicons
                            name={getMealIcon(meal.mealType)}
                            size={20}
                            color={colors.text.primary}
                        />
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>{formatMealType(meal.mealType)}</Text>
                        <Text style={[styles.time, { color: colors.text.secondary }]}>
                            {formatTimeInTimezone(meal.dateTime, userTimezone)}
                        </Text>
                    </View>

                    <View style={styles.macrosContainer}>
                        <View style={styles.compactMacroItem}>
                            <Text style={[styles.compactMacroValue, { color: colors.secondary }]}>{Math.round(totalProteins)}</Text>
                            <Text style={[styles.compactMacroLabel, { color: colors.text.secondary }]}>Б</Text>
                        </View>
                        <View style={styles.dotSeparator} />
                        <View style={styles.compactMacroItem}>
                            <Text style={[styles.compactMacroValue, { color: colors.accent.orange }]}>{Math.round(totalFats)}</Text>
                            <Text style={[styles.compactMacroLabel, { color: colors.text.secondary }]}>Ж</Text>
                        </View>
                        <View style={styles.dotSeparator} />
                        <View style={styles.compactMacroItem}>
                            <Text style={[styles.compactMacroValue, { color: colors.accent.teal }]}>{Math.round(totalCarbohydrates)}</Text>
                            <Text style={[styles.compactMacroLabel, { color: colors.text.secondary }]}>У</Text>
                        </View>
                    </View>

                    <View style={styles.caloriesContainer}>
                        <Text style={[styles.caloriesValue, { color: colors.primary }]}>{Math.round(totalCalories)}</Text>
                        <Text style={[styles.caloriesLabel, { color: colors.text.secondary }]}>ккал</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.sm,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
        overflow: 'hidden',
        borderWidth: 1,
    },
    gradient: {
        padding: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
        borderWidth: 1,
    },
    titleContainer: {
        width: 80, // Fixed width for title to ensure space for macros
        marginRight: spacing.sm,
    },
    title: {
        ...typography.body1,
        fontWeight: '600',
        marginBottom: 0,
    },
    time: {
        ...typography.caption,
        fontSize: 10,
    },
    macrosContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center macros in the available space
    },
    compactMacroItem: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    compactMacroValue: {
        ...typography.caption,
        fontWeight: 'bold',
        fontSize: 12,
    },
    compactMacroLabel: {
        ...typography.caption,
        fontSize: 10,
        marginLeft: 1,
    },
    dotSeparator: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#888', // Neutral color for separator
        marginHorizontal: 4,
        opacity: 0.5,
    },
    caloriesContainer: {
        alignItems: 'flex-end',
        minWidth: 40,
    },
    caloriesValue: {
        ...typography.h5,
        fontWeight: 'bold',
    },
    caloriesLabel: {
        ...typography.caption,
        fontSize: 9,
    },
});

export default MealCard;
