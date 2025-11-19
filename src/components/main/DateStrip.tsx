import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { typography, spacing, borderRadius } from '../../theme';
import { formatDate } from '../../utils/formatting';
import { triggerHaptic } from '../../utils/haptics';

interface DateStripProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 7; // Show roughly 7 days
const DAYS_TO_SHOW = 14; // 2 weeks total (1 week back, 1 week forward)

const DateStrip: React.FC<DateStripProps> = ({ selectedDate, onDateSelect }) => {
    const { colors } = useTheme();
    const flatListRef = useRef<FlatList>(null);

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
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={dates}
                renderItem={renderItem}
                keyExtractor={(item) => item.toISOString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
                getItemLayout={(data, index) => ({
                    length: 50, // Approximate width + margin
                    offset: 50 * index,
                    index,
                })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 70,
        marginBottom: spacing.sm,
    },
    contentContainer: {
        paddingHorizontal: spacing.md,
        alignItems: 'center',
    },
    dateItem: {
        width: 44,
        height: 60,
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
        marginBottom: 4,
    },
    dayNumber: {
        ...typography.h5,
        fontWeight: 'bold',
    },
});

export default DateStrip;
