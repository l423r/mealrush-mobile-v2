import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import { formatDate, formatTime } from '../../utils/formatting';
import Button from './Button';
import CalendarModal from './CalendarModal';
import TimePickerModal from './TimePickerModal';

interface DateTimePickerDialogProps {
  visible: boolean;
  defaultDate?: Date;
  defaultTime?: Date;
  onConfirm: (dateTime: Date) => void;
  onCancel: () => void;
}

const DateTimePickerDialog: React.FC<DateTimePickerDialogProps> = ({
  visible,
  defaultDate,
  defaultTime,
  onConfirm,
  onCancel,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    defaultDate || new Date()
  );
  const [selectedTime, setSelectedTime] = useState(
    defaultTime || new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedDate(defaultDate || new Date());
      setSelectedTime(defaultTime || new Date());
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
  }, [visible, defaultDate, defaultTime]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date && event.type === 'set') {
      setSelectedTime(date);
      if (Platform.OS === 'ios') {
        setShowTimePicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowTimePicker(false);
    }
  };

  const handleConfirm = () => {
    const dateTime = new Date(selectedDate);
    dateTime.setHours(selectedTime.getHours());
    dateTime.setMinutes(selectedTime.getMinutes());
    dateTime.setSeconds(0);
    dateTime.setMilliseconds(0);
    onConfirm(dateTime);
  };

  const combinedDateTime = new Date(selectedDate);
  combinedDateTime.setHours(selectedTime.getHours());
  combinedDateTime.setMinutes(selectedTime.getMinutes());

  return (
    <>
      <Modal
        visible={visible && !showDatePicker && !showTimePicker}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
      >
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
              >
                <View style={styles.dialogContainer}>
                  <View style={styles.dialog}>
                    <Text style={styles.title}>Выберите дату и время</Text>
                    <Text style={styles.subtitle}>
                      Когда вы хотите использовать этот шаблон?
                    </Text>

                    {/* Date Selector */}
                    <View style={styles.section}>
                      <Text style={styles.label}>Дата</Text>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setShowDatePicker(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.pickerText}>
                          {formatDate(selectedDate, 'dd MMMM yyyy')}
                        </Text>
                        <Text style={styles.pickerIcon}>📅</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Time Selector */}
                    <View style={styles.section}>
                      <Text style={styles.label}>Время</Text>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setShowTimePicker(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.pickerText}>
                          {formatTime(selectedTime)}
                        </Text>
                        <Text style={styles.pickerIcon}>🕐</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonsContainer}>
                      <Button
                        title="Отмена"
                        onPress={onCancel}
                        variant="outline"
                        style={styles.cancelButton}
                      />
                      <Button
                        title="Использовать"
                        onPress={handleConfirm}
                        style={styles.confirmButton}
                      />
                    </View>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Calendar Modal for Date Selection */}
      <CalendarModal
        visible={showDatePicker}
        selectedDate={selectedDate}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={handleDateSelect}
        maximumDate={undefined}
      />

      {/* Custom Time Picker Modal */}
      <TimePickerModal
        visible={showTimePicker}
        initialTime={selectedTime}
        onClose={() => setShowTimePicker(false)}
        onConfirm={(time) => {
          setSelectedTime(time);
          setShowTimePicker(false);
        }}
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
    padding: spacing.lg,
  },
  keyboardView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: '90%',
    maxWidth: 400,
  },
  dialog: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.xl,
    elevation: 10,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
    fontWeight: '600',
  },
  subtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  pickerText: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
  },
  pickerIcon: {
    fontSize: 20,
  },
  iosPickerContainer: {
    marginVertical: spacing.md,
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});

export default DateTimePickerDialog;

