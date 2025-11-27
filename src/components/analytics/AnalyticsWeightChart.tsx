import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { observer } from 'mobx-react-lite';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTheme } from '../../hooks/useTheme';
import { typography, spacing, borderRadius } from '../../theme';
import type { WeightEntry } from '../../types/api.types';
import type { lightColors, darkColors } from '../../theme/colors';

type ColorsType = typeof lightColors | typeof darkColors;

interface AnalyticsWeightChartProps {
    history: WeightEntry[];
}

export const AnalyticsWeightChart: React.FC<AnalyticsWeightChartProps> = observer(({ history }) => {
    const { colors } = useTheme();
    const dynamicStyles = createStyles(colors);

    const chartData = React.useMemo(() => {
        if (!history || history.length === 0) return [];

        // Sort by date ascending
        const sorted = [...history].sort((a, b) =>
            new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
        );

        return sorted.map(entry => ({
            value: entry.weight,
            label: format(new Date(entry.recordedAt), 'd MMM', { locale: ru }),
            dataPointText: entry.weight.toString(),
        }));
    }, [history]);

    if (chartData.length === 0) {
        return (
            <View style={dynamicStyles.container}>
                <Text style={dynamicStyles.title}>Динамика веса</Text>
                <View style={dynamicStyles.emptyContainer}>
                    <Text style={dynamicStyles.emptyText}>Нет данных о весе</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={dynamicStyles.container}>
            <Text style={dynamicStyles.title}>Динамика веса</Text>
            <LineChart
                data={chartData}
                height={220}
                thickness={2}
                color={colors.secondary}
                dataPointsColor={colors.secondary}
                textColor={colors.text.secondary}
                textFontSize={10}
                yAxisTextStyle={{ color: colors.text.secondary, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: colors.text.secondary, fontSize: 10 }}
                yAxisThickness={0}
                xAxisThickness={0}
                noOfSections={4}
                spacing={60}
                initialSpacing={20}
                hideDataPoints={false}
                dataPointRadius={4}
                curved
                isAnimated
            />
        </View>
    );
});

const createStyles = (colors: ColorsType) => StyleSheet.create({
    container: {
        padding: spacing.md,
        backgroundColor: colors.background.paper,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
    },
    title: {
        ...typography.h6,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    emptyContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        ...typography.body2,
        color: colors.text.secondary,
    },
});

export default AnalyticsWeightChart;
