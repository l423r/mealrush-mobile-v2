import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { formatDate, formatDateForAPI } from '../../utils/formatting';
import CalendarModal from '../common/CalendarModal';
import Button from '../common/Button';

interface DateRangePickerProps {
  visible: boolean;
  startDate: Date;
  endDate: Date;
  onClose: () => void;
  onConfirm: (startDate: Date, endDate: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
}

type PresetRange = 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM';

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  visible,
  startDate: initialStartDate,
  endDate: initialEndDate,
  onClose,
  onConfirm,
  maximumDate,
  minimumDate,
}) => {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetRange | null>(null);

  // Sync with props when modal opens
  useEffect(() => {
    if (visible) {
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
      setSelectedPreset(null);
    }
  }, [visible, initialStartDate, initialEndDate]);

  const handlePresetSelect = (preset: PresetRange) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let newStartDate: Date;
    let newEndDate: Date = today;

    switch (preset) {
      case 'LAST_7_DAYS':
        newStartDate = new Date(today);
        newStartDate.setDate(today.getDate() - 6);
        newStartDate.setHours(0, 0, 0, 0);
        break;
      case 'LAST_30_DAYS':
        newStartDate = new Date(today);
        newStartDate.setDate(today.getDate() - 29);
        newStartDate.setHours(0, 0, 0, 0);
        break;
      case 'THIS_MONTH':
        newStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        newStartDate.setHours(0, 0, 0, 0);
        break;
      case 'LAST_MONTH':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        newStartDate = lastMonth;
        newStartDate.setHours(0, 0, 0, 0);
        newEndDate = lastMonthEnd;
        newEndDate.setHours(23, 59, 59, 999);
        break;
      case 'CUSTOM':
        setSelectedPreset('CUSTOM');
        return;
      default:
        return;
    }

    // Apply min/max constraints
    if (minimumDate && newStartDate < minimumDate) {
      newStartDate = new Date(minimumDate);
    }
    if (maximumDate && newEndDate > maximumDate) {
      newEndDate = new Date(maximumDate);
    }
    if (maximumDate && newStartDate > maximumDate) {
      newStartDate = new Date(maximumDate);
      newEndDate = new Date(maximumDate);
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setSelectedPreset(preset);
  };

  const handleConfirm = () => {
    // Validate date range
    if (startDate > endDate) {
      // Swap dates if start > end
      onConfirm(endDate, startDate);
    } else {
      onConfirm(startDate, endDate);
    }
    onClose();
  };

  const handleStartDateSelect = (date: Date) => {
    setStartDate(date);
    setShowStartCalendar(false);
    // If start date > end date, update end date
    if (date > endDate) {
      setEndDate(date);
    }
    setSelectedPreset('CUSTOM');
  };

  const handleEndDateSelect = (date: Date) => {
    setEndDate(date);
    setShowEndCalendar(false);
    // If end date < start date, update start date
    if (date < startDate) {
      setStartDate(date);
    }
    setSelectedPreset('CUSTOM');
  };

  const isValidRange = startDate <= endDate;
  const rangeDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const isRangeTooLarge = rangeDays > 90;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlayTouchable}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalContainer}>
                  <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                      <Text style={styles.title}>Выберите диапазон дат</Text>
                    </View>

                    {/* Preset Ranges */}
                    <View style={styles.presetsContainer}>
                      <Text style={styles.presetsLabel}>Быстрый выбор:</Text>
                      <View style={styles.presetsGrid}>
                        <TouchableOpacity
                          testID="preset_last_7_days"
                          accessibilityLabel="Последние 7 дней"
                          style={[
                            styles.presetButton,
                            selectedPreset === 'LAST_7_DAYS' && styles.presetButtonActive,
                          ]}
                          onPress={() => handlePresetSelect('LAST_7_DAYS')}
                        >
                          <Text
                            style={[
                              styles.presetButtonText,
                              selectedPreset === 'LAST_7_DAYS' && styles.presetButtonTextActive,
                            ]}
                          >
                            7 дней
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          testID="preset_last_30_days"
                          accessibilityLabel="Последние 30 дней"
                          style={[
                            styles.presetButton,
                            selectedPreset === 'LAST_30_DAYS' && styles.presetButtonActive,
                          ]}
                          onPress={() => handlePresetSelect('LAST_30_DAYS')}
                        >
                          <Text
                            style={[
                              styles.presetButtonText,
                              selectedPreset === 'LAST_30_DAYS' && styles.presetButtonTextActive,
                            ]}
                          >
                            30 дней
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          testID="preset_this_month"
                          accessibilityLabel="Этот месяц"
                          style={[
                            styles.presetButton,
                            selectedPreset === 'THIS_MONTH' && styles.presetButtonActive,
                          ]}
                          onPress={() => handlePresetSelect('THIS_MONTH')}
                        >
                          <Text
                            style={[
                              styles.presetButtonText,
                              selectedPreset === 'THIS_MONTH' && styles.presetButtonTextActive,
                            ]}
                          >
                            Этот месяц
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          testID="preset_last_month"
                          accessibilityLabel="Прошлый месяц"
                          style={[
                            styles.presetButton,
                            selectedPreset === 'LAST_MONTH' && styles.presetButtonActive,
                          ]}
                          onPress={() => handlePresetSelect('LAST_MONTH')}
                        >
                          <Text
                            style={[
                              styles.presetButtonText,
                              selectedPreset === 'LAST_MONTH' && styles.presetButtonTextActive,
                            ]}
                          >
                            Прошлый месяц
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Date Selection */}
                    <View style={styles.dateSelectionContainer}>
                      <View style={styles.dateField}>
                        <Text style={styles.dateLabel}>От:</Text>
                        <TouchableOpacity
                          testID="start_date_picker_button"
                          accessibilityLabel={`Начальная дата: ${formatDate(startDate, 'dd MMMM yyyy')}`}
                          style={styles.dateButton}
                          onPress={() => setShowStartCalendar(true)}
                        >
                          <Text style={styles.dateButtonText}>
                            {formatDate(startDate, 'dd MMMM yyyy')}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.dateField}>
                        <Text style={styles.dateLabel}>До:</Text>
                        <TouchableOpacity
                          testID="end_date_picker_button"
                          accessibilityLabel={`Конечная дата: ${formatDate(endDate, 'dd MMMM yyyy')}`}
                          style={styles.dateButton}
                          onPress={() => setShowEndCalendar(true)}
                        >
                          <Text style={styles.dateButtonText}>
                            {formatDate(endDate, 'dd MMMM yyyy')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Range Info */}
                    <View style={styles.rangeInfo}>
                      <Text style={styles.rangeInfoText}>
                        Выбрано дней: {rangeDays}
                      </Text>
                      {isRangeTooLarge && (
                        <Text style={styles.rangeErrorText}>
                          Максимальный диапазон: 90 дней
                        </Text>
                      )}
                      {!isValidRange && (
                        <Text style={styles.rangeErrorText}>
                          Начальная дата должна быть раньше конечной
                        </Text>
                      )}
                    </View>

                    {/* Footer Buttons */}
                    <View style={styles.footer}>
                      <TouchableOpacity
                        testID="date_range_cancel_button"
                        accessibilityLabel="Отмена"
                        style={styles.cancelButton}
                        onPress={onClose}
                      >
                        <Text style={styles.cancelButtonText}>Отмена</Text>
                      </TouchableOpacity>

                      <Button
                        testID="date_range_confirm_button"
                        accessibilityLabel="Применить"
                        title="Применить"
                        onPress={handleConfirm}
                        disabled={!isValidRange || isRangeTooLarge}
                        style={styles.confirmButton}
                      />
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>

      {/* Start Date Calendar */}
      <CalendarModal
        visible={showStartCalendar}
        selectedDate={startDate}
        onClose={() => setShowStartCalendar(false)}
        onDateSelect={handleStartDateSelect}
        maximumDate={endDate}
        minimumDate={minimumDate}
        closeOnSelect={true}
      />

      {/* End Date Calendar */}
      <CalendarModal
        visible={showEndCalendar}
        selectedDate={endDate}
        onClose={() => setShowEndCalendar(false)}
        onDateSelect={handleEndDateSelect}
        maximumDate={maximumDate}
        minimumDate={startDate}
        closeOnSelect={true}
      />
    </>
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
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  presetsContainer: {
    marginBottom: spacing.lg,
  },
  presetsLabel: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetButtonText: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '500',
  },
  presetButtonTextActive: {
    color: colors.white,
  },
  dateSelectionContainer: {
    marginBottom: spacing.md,
  },
  dateField: {
    marginBottom: spacing.md,
  },
  dateLabel: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  dateButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  dateButtonText: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
  },
  rangeInfo: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.light,
  },
  rangeInfoText: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  rangeErrorText: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text.primary,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
  },
});

export default observer(DateRangePicker);
