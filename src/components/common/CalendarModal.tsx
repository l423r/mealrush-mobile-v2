import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { nutritionService } from '../../api/services/nutrition.service';
import { formatDateForAPI } from '../../utils/formatting';

interface CalendarModalProps {
  visible: boolean;
  selectedDate: Date;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  maximumDate?: Date;
}

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  isDisabled?: boolean;
  calories?: number;
}

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTH_NAMES = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  selectedDate,
  onClose,
  onDateSelect,
  maximumDate = new Date(),
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );
  const [caloriesData, setCaloriesData] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(false);

  // Sync currentMonth when selectedDate changes
  useEffect(() => {
    if (visible) {
      setCurrentMonth(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      );
    }
  }, [selectedDate, visible]);

  // Load calories data for the month
  useEffect(() => {
    if (visible) {
      loadMonthCalories();
    }
  }, [visible, currentMonth]);

  const loadMonthCalories = async () => {
    setLoading(true);
    try {
      const startDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
      );
      const endDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
      );

      const startDateStr = formatDateForAPI(startDate);
      const endDateStr = formatDateForAPI(endDate);

      // Use trend API to get daily calories for the month
      const response = await nutritionService.getTrend({
        startDate: startDateStr,
        endDate: endDateStr,
        metric: 'CALORIES',
      });

      const caloriesMap: Record<string, number> = {};
      response.dailyValues.forEach((point) => {
        caloriesMap[point.date] = Math.round(point.value);
      });

      setCaloriesData(caloriesMap);
    } catch (error) {
      console.error('Error loading month calories:', error);
      // Don't block calendar if data fails to load
      setCaloriesData({});
    } finally {
      setLoading(false);
    }
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get first day of week (Monday = 0)
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(maximumDate);
    maxDate.setHours(23, 59, 59, 999);

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(year, month, -firstDayOfWeek + i + 1);
      days.push({
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: false,
        isSelected: false,
        isToday: false,
        isDisabled: true,
      });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      
      const dateStr = formatDateForAPI(date);
      const isSelected =
        date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === today.toDateString();
      const isDisabled = date > maxDate;

      days.push({
        date,
        dayOfMonth: day,
        isCurrentMonth: true,
        isSelected,
        isToday,
        calories: caloriesData[dateStr],
        isDisabled,
      });
    }

    // Fill remaining cells to complete 6 weeks
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        dayOfMonth: i,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false,
        isDisabled: true,
      });
    }

    return days;
  }, [currentMonth, selectedDate, maximumDate, caloriesData]);

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );
    const maxMonth = new Date(maximumDate.getFullYear(), maximumDate.getMonth(), 1);
    if (nextMonth <= maxMonth) {
      setCurrentMonth(nextMonth);
    }
  };

  const handleDatePress = (day: CalendarDay) => {
    if (!day.isDisabled && day.date <= maximumDate && day.isCurrentMonth) {
      onDateSelect(day.date);
      onClose();
    }
  };

  const monthName = MONTH_NAMES[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();
  const canGoNext = () => {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );
    const maxMonth = new Date(maximumDate.getFullYear(), maximumDate.getMonth(), 1);
    return nextMonth <= maxMonth;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                  <TouchableOpacity
                    onPress={handlePreviousMonth}
                    style={styles.navButton}
                  >
                    <Text style={styles.navButtonText}>‹</Text>
                  </TouchableOpacity>

                  <View style={styles.headerCenter}>
                    <Text style={styles.monthYear}>
                      {monthName} {year}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleNextMonth}
                    style={[
                      styles.navButton,
                      !canGoNext() && styles.navButtonDisabled,
                    ]}
                    disabled={!canGoNext()}
                  >
                    <Text
                      style={[
                        styles.navButtonText,
                        !canGoNext() && styles.navButtonTextDisabled,
                      ]}
                    >
                      ›
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Week day labels */}
                <View style={styles.weekDaysContainer}>
                  {WEEK_DAYS.map((day, index) => (
                    <View key={index} style={styles.weekDayLabel}>
                      <Text style={styles.weekDayText}>{day}</Text>
                    </View>
                  ))}
                </View>

                {/* Calendar Grid */}
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : (
                  <View style={styles.calendarGrid}>
                    {calendarDays.map((day, index) => {
                      const dateStr = formatDateForAPI(day.date);
                      const hasCalories = day.isCurrentMonth &&
                        !day.isDisabled &&
                        caloriesData[dateStr] !== undefined &&
                        caloriesData[dateStr] > 0;

                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.dayCell,
                            !day.isCurrentMonth && styles.dayCellOtherMonth,
                            day.isSelected && styles.dayCellSelected,
                            day.isToday && !day.isSelected && styles.dayCellToday,
                            day.isDisabled && styles.dayCellDisabled,
                          ]}
                          onPress={() => handleDatePress(day)}
                          disabled={day.isDisabled || !day.isCurrentMonth}
                        >
                          <Text
                            style={[
                              styles.dayNumber,
                              !day.isCurrentMonth && styles.dayNumberOtherMonth,
                              day.isSelected && styles.dayNumberSelected,
                              day.isToday && !day.isSelected && styles.dayNumberToday,
                              day.isDisabled && styles.dayNumberDisabled,
                            ]}
                          >
                            {day.dayOfMonth}
                          </Text>
                          {hasCalories && (
                            <Text
                              style={[
                                styles.caloriesText,
                                day.isSelected && styles.caloriesTextSelected,
                              ]}
                            >
                              {caloriesData[dateStr]} ккал
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Footer buttons */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                  >
                    <Text style={styles.cancelButtonText}>Отмена</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  container: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  navButtonTextDisabled: {
    color: colors.text.disabled,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  monthYear: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekDayLabel: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  weekDayText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    margin: 1,
    minHeight: 50,
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayCellToday: {
    backgroundColor: colors.primaryLight + '20',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayNumber: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  dayNumberOtherMonth: {
    color: colors.text.disabled,
  },
  dayNumberSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  dayNumberToday: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  dayNumberDisabled: {
    color: colors.text.disabled,
  },
  caloriesText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
    lineHeight: 11,
  },
  caloriesTextSelected: {
    color: colors.white,
  },
  loadingContainer: {
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default observer(CalendarModal);

