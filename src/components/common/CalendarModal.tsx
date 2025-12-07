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
  closeOnSelect?: boolean;
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
  closeOnSelect = true,
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

    // Helper function to convert JavaScript day (0=Sunday) to Monday-based week (0=Monday, 6=Sunday)
    const getMondayBasedDay = (date: Date): number => {
      const jsDay = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      return jsDay === 0 ? 6 : jsDay - 1; // Sunday (0) -> 6, Monday (1) -> 0, etc.
    };

    // Get first day of week (Monday = 0, Sunday = 6)
    const firstDayOfWeek = getMondayBasedDay(firstDay);

    // Create a grid of 42 cells (6 weeks * 7 days)
    const grid: (CalendarDay | null)[] = new Array(42).fill(null);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(maximumDate);
    maxDate.setHours(23, 59, 59, 999);

    // Add days from previous month to fill cells before the first day
    if (firstDayOfWeek > 0) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

      // Start from the last day of previous month and go backwards
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const dayOfPrevMonth = daysInPrevMonth - i;
        const date = new Date(prevYear, prevMonth, dayOfPrevMonth);
        date.setHours(0, 0, 0, 0);
        grid[i] = {
          date,
          dayOfMonth: dayOfPrevMonth,
          isCurrentMonth: false,
          isSelected: false,
          isToday: false,
          isDisabled: true,
        };
      }
    }

    // Add ALL days of current month - place each day in the correct column based on its actual day of week
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);

      // Calculate the correct column for this day (0=Monday, 6=Sunday)
      const dayColumn = getMondayBasedDay(date);

      // Find the correct grid index: start from firstDayOfWeek, then find the week and position
      // Day 1 should be at index firstDayOfWeek
      // Day 2 should be at index firstDayOfWeek + 1
      // But we verify by checking the actual day of week
      const dayIndex = firstDayOfWeek + (day - 1);

      // Double-check: the column at this index should match the day's actual column
      if (dayIndex % 7 !== dayColumn) {
        // Misalignment detected - recalculate based on actual day of week
        // Find which week this day belongs to and place it in the correct column
        const weekNumber = Math.floor(dayIndex / 7);
        const correctIndex = weekNumber * 7 + dayColumn;

        if (correctIndex < 42 && grid[correctIndex] === null) {
          const dateStr = formatDateForAPI(date);
          grid[correctIndex] = {
            date,
            dayOfMonth: day,
            isCurrentMonth: true,
            isSelected: date.toDateString() === selectedDate.toDateString(),
            isToday: date.toDateString() === today.toDateString(),
            calories: caloriesData[dateStr],
            isDisabled: date > maxDate,
          };
          continue;
        }
      }

      // Normal case: day is correctly aligned
      if (dayIndex < 42 && grid[dayIndex] === null) {
        const dateStr = formatDateForAPI(date);
        grid[dayIndex] = {
          date,
          dayOfMonth: day,
          isCurrentMonth: true,
          isSelected: date.toDateString() === selectedDate.toDateString(),
          isToday: date.toDateString() === today.toDateString(),
          calories: caloriesData[dateStr],
          isDisabled: date > maxDate,
        };
      }
    }

    // Fill remaining empty cells with next month's days
    let nextMonthDay = 1;
    for (let i = 0; i < 42; i++) {
      if (grid[i] === null) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const date = new Date(nextYear, nextMonth, nextMonthDay);
        date.setHours(0, 0, 0, 0);
        grid[i] = {
          date,
          dayOfMonth: nextMonthDay,
          isCurrentMonth: false,
          isSelected: false,
          isToday: false,
          isDisabled: true,
        };
        nextMonthDay++;
      }
    }

    // Convert grid to array and filter out nulls (shouldn't be any, but safety check)
    const days = grid.filter((d): d is CalendarDay => d !== null);

    // Debug: verify alignment for December 2025
    if (__DEV__ && year === 2025 && month === 11) {
      const day1 = days.find(d => d.isCurrentMonth && d.dayOfMonth === 1);
      if (day1) {
        const day1Index = days.indexOf(day1);
        const day1Column = day1Index % 7;
        const day1ActualDay = getMondayBasedDay(day1.date);
        console.log(`[Calendar] Day 1 at index ${day1Index}, column ${day1Column}, actual day of week: ${day1ActualDay}, firstDayOfWeek calculated: ${firstDayOfWeek}`);
      }
    }

    return days.slice(0, 42); // Ensure exactly 42 days
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
      if (closeOnSelect) {
        onClose();
      }
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
                  {WEEK_DAYS.map((day) => (
                    <View key={day} style={styles.weekDayLabel}>
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
                      const dayKey = `${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}-${index}`;
                      const isSunday = day.date.getDay() === 0;
                      const hasCalories = day.isCurrentMonth &&
                        !day.isDisabled &&
                        caloriesData[dateStr] !== undefined &&
                        caloriesData[dateStr] > 0;

                      // Calculate Sunday text color
                      let sundayTextStyle = null;
                      if (isSunday && day.isCurrentMonth) {
                        if (day.isSelected) {
                          sundayTextStyle = { opacity: 1, color: colors.white };
                        } else if (day.isToday) {
                          sundayTextStyle = { opacity: 1, color: colors.primary };
                        } else {
                          sundayTextStyle = { opacity: 1, color: colors.text.primary };
                        }
                      }

                      // Debug: log if Sunday is not visible
                      if (__DEV__ && isSunday && day.isCurrentMonth) {
                        console.log(`[Calendar] Rendering Sunday: day ${day.dayOfMonth}, index ${index}, isCurrentMonth: ${day.isCurrentMonth}, isDisabled: ${day.isDisabled}`);
                      }

                      return (
                        <TouchableOpacity
                          key={dayKey}
                          style={[
                            styles.dayCell,
                            !day.isCurrentMonth && styles.dayCellOtherMonth,
                            day.isSelected && styles.dayCellSelected,
                            day.isToday && !day.isSelected && styles.dayCellToday,
                            // Only apply disabled opacity to days from other months
                            day.isDisabled && !day.isCurrentMonth && styles.dayCellDisabled,
                            // Ensure Sundays are always visible
                            isSunday && day.isCurrentMonth && { opacity: 1 },
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
                              day.isDisabled && !day.isCurrentMonth && styles.dayNumberDisabled,
                              // Ensure Sunday text is always visible
                              sundayTextStyle,
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
  dayCellDisabledCurrentMonth: {
    // Disabled days from current month should still be visible
    opacity: 1,
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

