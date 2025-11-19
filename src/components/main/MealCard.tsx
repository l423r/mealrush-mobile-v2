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
                            size={24}
                            color={colors.text.primary}
                        />
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: colors.text.primary }]}>{formatMealType(meal.mealType)}</Text>
                        <Text style={[styles.time, { color: colors.text.secondary }]}>
                            {formatTimeInTimezone(meal.dateTime, userTimezone)}
                        </Text>
                    </View>
                    <View style={styles.caloriesContainer}>
                        <Text style={[styles.caloriesValue, { color: colors.primary }]}>{Math.round(totalCalories)}</Text>
                        <Text style={[styles.caloriesLabel, { color: colors.text.secondary }]}>ккал</Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border.light }]} />

                <View style={styles.macrosRow}>
                    <View style={styles.macroItem}>
                        <Text style={[styles.macroLabel, { color: colors.secondary }]}>Белки</Text>
                        <Text style={[styles.macroValue, { color: colors.text.primary }]}>{Math.round(totalProteins)}г</Text>
                    </View>
                    <View style={[styles.macroDivider, { backgroundColor: colors.border.light }]} />
                    <View style={styles.macroItem}>
                        <Text style={[styles.macroLabel, { color: colors.accent.orange }]}>Жиры</Text>
                        <Text style={[styles.macroValue, { color: colors.text.primary }]}>{Math.round(totalFats)}г</Text>
                    </View>
                    <View style={[styles.macroDivider, { backgroundColor: colors.border.light }]} />
                    <View style={styles.macroItem}>
                        <Text style={[styles.macroLabel, { color: colors.accent.teal }]}>Углеводы</Text>
                        <Text style={[styles.macroValue, { color: colors.text.primary }]}>{Math.round(totalCarbohydrates)}г</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.medium,
        overflow: 'hidden',
        borderWidth: 1,
    },
    gradient: {
        padding: spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
        borderWidth: 1,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        ...typography.h5,
        fontWeight: '600',
        marginBottom: 2,
    },
    time: {
        ...typography.caption,
    },
    caloriesContainer: {
        alignItems: 'flex-end',
    },
    caloriesValue: {
        ...typography.h4,
        fontWeight: 'bold',
    },
    caloriesLabel: {
        ...typography.caption,
        fontSize: 10,
    },
    divider: {
        height: 1,
        marginBottom: spacing.md,
        opacity: 0.5,
    },
    macrosRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    macroItem: {
        flex: 1,
        alignItems: 'center',
    },
    macroDivider: {
        width: 1,
        height: 20,
        opacity: 0.5,
    },
    macroLabel: {
        ...typography.caption,
        fontSize: 10,
        marginBottom: 2,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    macroValue: {
        ...typography.body2,
        fontWeight: '500',
    },
});

export default MealCard;
