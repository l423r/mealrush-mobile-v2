import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '../../hooks/useTheme';
import { typography, spacing, borderRadius } from '../../theme';
import { formatDate, formatDateForAPI } from '../../utils/formatting';
import { triggerHaptic } from '../../utils/haptics';

interface DateStripProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    caloriesData?: Record<string, number>;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 7; // Show roughly 7 days
const DAYS_TO_SHOW = 14; // 2 weeks total (1 week back, 1 week forward)

const DateStrip: React.FC<DateStripProps> = ({ selectedDate, onDateSelect, caloriesData = {} }) => {
    const { colors } = useTheme();
    const flatListRef = useRef<FlashList<Date>>(null);

    // Generate dates
    const dates = React.useMemo(() => {
        const result = [];
        const today = new Date();
        // Start from 7 days ago
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);

        for (let i = 0; i < DAYS_TO_SHOW; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            result.push(date);
        }
        return result;
    }, []);

    useEffect(() => {
        // Scroll to selected date
        const index = dates.findIndex(
            (d) => d.toDateString() === selectedDate.toDateString()
        );
        if (index !== -1 && flatListRef.current) {
            flatListRef.current.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0.5,
            });
        }
    }, [selectedDate, dates]);

    const renderItem = ({ item }: { item: Date }) => {
        const isSelected = item.toDateString() === selectedDate.toDateString();
        const isToday = item.toDateString() === new Date().toDateString();
        const dateStr = formatDateForAPI(item);
        const calories = caloriesData[dateStr];
        const hasCalories = calories !== undefined && calories > 0;

        return (
            <TouchableOpacity
                style={[
                    styles.dateItem,
                    isSelected && { backgroundColor: colors.primary },
                    !isSelected && isToday && { borderColor: colors.primary, borderWidth: 1 },
                ]}
                onPress={() => {
                    triggerHaptic('selection');
                    onDateSelect(item);
                }}
            >
                <Text
                    style={[
                        styles.dayName,
                        { color: isSelected ? colors.text.inverse : colors.text.secondary },
                    ]}
                >
                    {formatDate(item, 'EE')}
                </Text>
                <Text
                    style={[
                        styles.dayNumber,
                        { color: isSelected ? colors.text.inverse : colors.text.primary },
                    ]}
                >
                    {item.getDate()}
                </Text>
                {hasCalories && (
                    <Text
                        style={[
                            styles.caloriesText,
                            { color: isSelected ? colors.text.inverse : colors.text.secondary },
                        ]}
                    >
                        {calories}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlashList
                ref={flatListRef}
                data={dates}
                renderItem={renderItem}
                keyExtractor={(item) => item.toISOString()}
                estimatedItemSize={50}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 80, // Increased height to accommodate calories
        marginBottom: spacing.sm,
    },
    contentContainer: {
        paddingHorizontal: spacing.md,
        alignItems: 'center',
    },
    dateItem: {
        width: 48, // Slightly wider
        height: 70, // Taller
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 3,
        backgroundColor: 'transparent',
    },
    dayName: {
        ...typography.caption,
        fontSize: 10,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    dayNumber: {
        ...typography.h5,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    caloriesText: {
        ...typography.caption,
        fontSize: 9,
        fontWeight: '500',
    },
});

export default DateStrip;
