import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useTheme } from '../../hooks/useTheme';
import { typography, spacing, borderRadius } from '../../theme';
import type { AnalyticsInsight } from '../../types/analytics.types';
import type { lightColors, darkColors } from '../../theme/colors';

type ColorsType = typeof lightColors | typeof darkColors;

interface AnalyticsInsightsProps {
    insights: AnalyticsInsight[];
}

export const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = observer(({ insights }) => {
    const { colors } = useTheme();
    const dynamicStyles = createStyles(colors);

    if (!insights || insights.length === 0) return null;

    return (
        <View style={dynamicStyles.container}>
            <Text style={dynamicStyles.headerTitle}>Рекомендации AI</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={dynamicStyles.scrollContent}
            >
                {insights.map(insight => (
                    <View
                        key={insight.id}
                        style={[
                            dynamicStyles.card,
                            insight.type === 'success' && dynamicStyles.cardSuccess,
                            insight.type === 'warning' && dynamicStyles.cardWarning,
                            insight.type === 'info' && dynamicStyles.cardInfo,
                        ]}
                    >
                        <Text style={[
                            dynamicStyles.title,
                            insight.type === 'success' && dynamicStyles.textSuccess,
                            insight.type === 'warning' && dynamicStyles.textWarning,
                            insight.type === 'info' && dynamicStyles.textInfo,
                        ]}>
                            {insight.title}
                        </Text>
                        <Text style={dynamicStyles.message}>{insight.message}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
});

const createStyles = (colors: ColorsType) => StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    headerTitle: {
        ...typography.h6,
        color: colors.text.primary,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        gap: spacing.md,
    },
    card: {
        width: 280,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.background.paper,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary, // default
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardSuccess: {
        borderLeftColor: colors.success,
        backgroundColor: colors.background.paper, // Could add subtle tint if needed
    },
    cardWarning: {
        borderLeftColor: colors.warning,
    },
    cardInfo: {
        borderLeftColor: colors.info,
    },
    title: {
        ...typography.subtitle1,
        fontWeight: 'bold',
        marginBottom: spacing.xs,
        color: colors.text.primary,
    },
    textSuccess: {
        color: colors.success,
    },
    textWarning: {
        color: colors.warning,
    },
    textInfo: {
        color: colors.info,
    },
    message: {
        ...typography.body2,
        color: colors.text.secondary,
    },
});

export default AnalyticsInsights;
