import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { observer } from 'mobx-react-lite';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTheme } from '../../hooks/useTheme';
import { typography, spacing, borderRadius } from '../../theme';
import type { TrendPoint } from '../../types/analytics.types';
import type { lightColors, darkColors } from '../../theme/colors';

type ColorsType = typeof lightColors | typeof darkColors;

interface AnalyticsGoalCalendarProps {
    trendData: TrendPoint[];
    targetCalories: number;
}

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const AnalyticsGoalCalendar: React.FC<AnalyticsGoalCalendarProps> = observer(({
    trendData,
    targetCalories
}) => {
    const { colors } = useTheme();
    const dynamicStyles = createStyles(colors);

    // Generate calendar days for current month
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate offset for the first day (0 = Monday, 6 = Sunday)
    const startDay = getDay(monthStart);
    const offset = startDay === 0 ? 6 : startDay - 1;
    const blanks = Array(offset).fill(null);

    const getDayStatus = (date: Date) => {
        const dataPoint = trendData.find(p => isSameDay(new Date(p.date), date));
        if (!dataPoint || dataPoint.calories === 0) return 'empty';

        const percentage = (dataPoint.calories / targetCalories) * 100;

        if (percentage > 110) return 'exceeded';
        if (percentage < 60) return 'under';
        return 'success';
    };

    return (
        <View style={dynamicStyles.container}>
            <Text style={dynamicStyles.title}>Календарь успеха</Text>
            <Text style={dynamicStyles.subtitle}>{format(today, 'MMMM yyyy', { locale: ru })}</Text>

            {/* Week Header */}
            <View style={dynamicStyles.weekRow}>
                {WEEK_DAYS.map(day => (
                    <Text key={day} style={dynamicStyles.weekDayText}>{day}</Text>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={dynamicStyles.calendarGrid}>
                {blanks.map((_, index) => (
                    <View key={`blank-${index}`} style={dynamicStyles.dayCell} />
                ))}
                {days.map(date => {
                    const status = getDayStatus(date);
                    let bg = 'transparent';
                    let text = colors.text.primary;

                    if (status === 'success') {
                        bg = colors.success;
                        text = colors.white;
                    } else if (status === 'exceeded') {
                        bg = colors.error;
                        text = colors.white;
                    } else if (status === 'under') {
                        bg = colors.warning;
                        text = colors.white;
                    } else {
                        // empty
                        bg = colors.gray[800];
                        text = colors.text.disabled;
                    }

                    return (
                        <View key={date.toISOString()} style={dynamicStyles.dayCell}>
                            <View style={[dynamicStyles.dayCircle, { backgroundColor: bg }]}>
                                <Text style={[dynamicStyles.dayText, { color: text }]}>
                                    {format(date, 'd')}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>

            <View style={dynamicStyles.legend}>
                <View style={dynamicStyles.legendItem}>
                    <View style={[dynamicStyles.legendDot, { backgroundColor: colors.success }]} />
                    <Text style={dynamicStyles.legendText}>Цель</Text>
                </View>
                <View style={dynamicStyles.legendItem}>
                    <View style={[dynamicStyles.legendDot, { backgroundColor: colors.error }]} />
                    <Text style={dynamicStyles.legendText}>Много</Text>
                </View>
                <View style={dynamicStyles.legendItem}>
                    <View style={[dynamicStyles.legendDot, { backgroundColor: colors.warning }]} />
                    <Text style={dynamicStyles.legendText}>Мало</Text>
                </View>
                <View style={dynamicStyles.legendItem}>
                    <View style={[dynamicStyles.legendDot, { backgroundColor: colors.gray[800] }]} />
                    <Text style={dynamicStyles.legendText}>Нет</Text>
                </View>
            </View>
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
    },
    subtitle: {
        ...typography.body2,
        color: colors.text.secondary,
        marginBottom: spacing.md,
        textTransform: 'capitalize',
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.xs,
    },
    weekDayText: {
        ...typography.caption,
        color: colors.text.secondary,
        width: 30,
        textAlign: 'center',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%', // 100% / 7
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    dayCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        ...typography.body2,
        fontSize: 12,
    },
    legend: {
        flexDirection: 'row',
        marginTop: spacing.md,
        justifyContent: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.sm,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.xs,
    },
    legendText: {
        ...typography.caption,
        color: colors.text.secondary,
    },
});

export default AnalyticsGoalCalendar;
