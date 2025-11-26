import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { observer } from 'mobx-react-lite';
import type { TopProductItem } from '../../types/analytics.types';
import { spacing, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import type { lightColors, darkColors } from '../../theme/colors';

type ColorsType = typeof lightColors | typeof darkColors;

interface AnalyticsTopProductsProps {
    data: TopProductItem[];
}

export const AnalyticsTopProducts: React.FC<AnalyticsTopProductsProps> = observer(({
    data,
}) => {
    const { colors } = useTheme();
    const dynamicStyles = createStyles(colors);

    const renderItem = ({ item, index }: { item: TopProductItem; index: number }) => (
        <View style={dynamicStyles.row}>
            <View style={dynamicStyles.rankContainer}>
                <Text style={dynamicStyles.rank}>{index + 1}</Text>
            </View>
            <View style={dynamicStyles.infoContainer}>
                <Text style={dynamicStyles.name} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={dynamicStyles.details}>
                    {item.usageCount} раз(а) {item.calories > 0 && `• ${Math.round(item.calories)} ккал`}
                </Text>
            </View>
            {item.calories > 0 && (
                <View style={dynamicStyles.caloriesContainer}>
                    <Text style={dynamicStyles.totalCalories}>
                        {Math.round(item.calories * item.usageCount)}
                    </Text>
                    <Text style={dynamicStyles.caloriesLabel}>ккал всего</Text>
                </View>
            )}
        </View>
    );

    if (!data || data.length === 0) {
        return (
            <View style={dynamicStyles.emptyContainer}>
                <Text style={dynamicStyles.emptyText}>Нет данных о популярных продуктах</Text>
            </View>
        );
    }

    return (
        <View style={dynamicStyles.container}>
            <Text style={dynamicStyles.title}>Топ продуктов</Text>
            <FlatList
                data={data}
                keyExtractor={(item) => `${item.id}-${item.name}`}
                renderItem={renderItem}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={dynamicStyles.separator} />}
            />
        </View>
    );
});

const createStyles = (colors: ColorsType) => StyleSheet.create({
    container: {
        padding: spacing.md,
    },
    title: {
        ...typography.h3,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    rankContainer: {
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    rank: {
        ...typography.h4,
        color: colors.primary,
        fontWeight: 'bold',
    },
    infoContainer: {
        flex: 1,
        marginRight: spacing.sm,
    },
    name: {
        ...typography.body1,
        color: colors.text.primary,
        marginBottom: 2,
    },
    details: {
        ...typography.caption,
        color: colors.text.secondary,
    },
    caloriesContainer: {
        alignItems: 'flex-end',
    },
    totalCalories: {
        ...typography.body2,
        color: colors.text.primary,
        fontWeight: '600',
    },
    caloriesLabel: {
        ...typography.caption,
        color: colors.text.secondary,
        fontSize: 10,
    },
    separator: {
        height: 1,
        backgroundColor: colors.border.light,
        marginVertical: spacing.xs,
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        ...typography.body1,
        color: colors.text.secondary,
    },
});

export default AnalyticsTopProducts;
