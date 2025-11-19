import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { typography, spacing, borderRadius, shadows } from '../../theme';
import { calculateProgressPercentage } from '../../utils/calculations';
import { useTheme } from '../../hooks/useTheme';
import { observer } from 'mobx-react-lite';

interface DailySummaryProps {
    calories: number;
    proteins: number;
    fats: number;
    carbohydrates: number;
    caloriesLimit: number;
}

const { width } = Dimensions.get('window');
const RING_SIZE = width * 0.35;
const STROKE_WIDTH = 12;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const DailySummary: React.FC<DailySummaryProps> = observer(({
    calories,
    proteins,
    fats,
    carbohydrates,
    caloriesLimit,
}) => {
    const { colors } = useTheme();
    const progress = calculateProgressPercentage(calories, caloriesLimit);
    const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * Math.min(progress, 100)) / 100;

    return (
        <View style={[styles.container, { backgroundColor: colors.background.paper, borderColor: colors.border.light }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text.primary }]}>Сегодня</Text>
                <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Сводка питания</Text>
            </View>

            <View style={styles.content}>
                {/* Main Calorie Ring */}
                <View style={styles.ringContainer}>
                    <Svg width={RING_SIZE} height={RING_SIZE}>
                        <G rotation="-90" origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}>
                            {/* Background Ring */}
                            <Circle
                                cx={RING_SIZE / 2}
                                cy={RING_SIZE / 2}
                                r={RADIUS}
                                stroke={colors.background.light}
                                strokeWidth={STROKE_WIDTH}
                                fill="transparent"
                            />
                            {/* Progress Ring */}
                            <Circle
                                cx={RING_SIZE / 2}
                                cy={RING_SIZE / 2}
                                r={RADIUS}
                                stroke={colors.primary}
                                strokeWidth={STROKE_WIDTH}
                                fill="transparent"
                                strokeDasharray={CIRCUMFERENCE}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                            />
                        </G>
                    </Svg>
                    <View style={styles.ringTextContainer}>
                        <Text style={[styles.caloriesValue, { color: colors.text.primary }]}>{Math.round(calories)}</Text>
                        <Text style={[styles.caloriesLabel, { color: colors.text.secondary }]}>ккал</Text>
                    </View>
                </View>

                {/* Macros */}
                <View style={styles.macrosContainer}>
                    <MacroItem
                        label="Белки"
                        value={proteins}
                        color={colors.secondary}
                        unit="г"
                        textColor={colors.text.primary}
                        labelColor={colors.text.secondary}
                    />
                    <MacroItem
                        label="Жиры"
                        value={fats}
                        color={colors.accent.orange}
                        unit="г"
                        textColor={colors.text.primary}
                        labelColor={colors.text.secondary}
                    />
                    <MacroItem
                        label="Углеводы"
                        value={carbohydrates}
                        color={colors.accent.teal}
                        unit="г"
                        textColor={colors.text.primary}
                        labelColor={colors.text.secondary}
                    />
                </View>
            </View>
        </View>
    );
});

const MacroItem = ({
    label,
    value,
    color,
    unit,
    textColor,
    labelColor,
}: {
    label: string;
    value: number;
    color: string;
    unit: string;
    textColor: string;
    labelColor: string;
}) => (
    <View style={styles.macroItem}>
        <View style={[styles.macroDot, { backgroundColor: color }]} />
        <View>
            <Text style={[styles.macroValue, { color: textColor }]}>
                {Math.round(value)}
                <Text style={[styles.macroUnit, { color: labelColor }]}>{unit}</Text>
            </Text>
            <Text style={[styles.macroLabel, { color: labelColor }]}>{label}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
        marginBottom: spacing.lg,
        borderWidth: 1,
        ...shadows.medium,
    },
    header: {
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h4,
        fontWeight: 'bold',
    },
    subtitle: {
        ...typography.body2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    ringContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    caloriesValue: {
        ...typography.h4,
        fontWeight: 'bold',
        fontSize: 24,
    },
    caloriesLabel: {
        ...typography.caption,
        fontSize: 12,
    },
    macrosContainer: {
        flex: 1,
        marginLeft: spacing.xl,
        gap: spacing.md,
    },
    macroItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    macroDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.sm,
        marginTop: 2,
    },
    macroValue: {
        ...typography.h5,
        fontWeight: '600',
        lineHeight: 20,
    },
    macroUnit: {
        fontSize: 12,
        fontWeight: 'normal',
    },
    macroLabel: {
        ...typography.caption,
        fontSize: 12,
    },
});

export default DailySummary;
