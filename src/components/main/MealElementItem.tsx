import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { colors as defaultColors, typography, spacing, borderRadius, shadows } from '../../theme';
import { formatWeight, formatCalories } from '../../utils/formatting';
import NutrientRow from '../common/NutrientRow';
import { useTheme } from '../../hooks/useTheme';

interface MealElementItemProps {
    element: any;
    onPress: (element: any) => void;
    onDelete: (id: number) => void;
}

const MealElementItem: React.FC<MealElementItemProps> = observer(({
    element,
    onPress,
    onDelete,
}) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            testID={`meal_element_item_${element.id}`}
            accessibilityLabel={`Продукт ${element.name}, ${formatCalories(element.calories)}`}
            style={[styles.container, {
                backgroundColor: colors.background.paper,
                borderColor: colors.border.light,
            }]}
            onPress={() => onPress(element)}
            activeOpacity={0.7}
        >
            {element.imageUrl ? (
                <Image
                    source={{ uri: element.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: colors.background.default }]}>
                    <Ionicons name="restaurant-outline" size={24} color={colors.text.secondary} />
                </View>
            )}

            <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>
                    {element.name}
                </Text>

                <NutrientRow
                    proteins={element.proteins}
                    fats={element.fats}
                    carbohydrates={element.carbohydrates}
                    calories={element.calories}
                    showCaloriesFirst={false}
                    compact
                />

                <View style={styles.detailsRow}>
                    <Text style={[styles.quantity, { color: colors.text.secondary }]}>
                        {formatWeight(parseFloat(element.quantity))}
                    </Text>
                    <Text style={[styles.calories, { color: colors.primary }]}>
                        {formatCalories(element.calories)}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                testID={`meal_element_delete_${element.id}`}
                accessibilityLabel={`Удалить ${element.name}`}
                style={styles.deleteButton}
                onPress={() => onDelete(element.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.sm,
    },
    image: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.md,
        marginRight: spacing.md,
    },
    imagePlaceholder: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        ...typography.body1,
        fontWeight: '600',
        marginBottom: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        paddingRight: spacing.sm,
    },
    quantity: {
        ...typography.caption,
    },
    calories: {
        ...typography.body2,
        fontWeight: '600',
    },
    deleteButton: {
        padding: spacing.sm,
        opacity: 0.7,
    },
});

export default MealElementItem;
