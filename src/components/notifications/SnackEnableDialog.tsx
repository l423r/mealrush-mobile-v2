import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Button from '../common/Button';

interface SnackEnableDialogProps {
  visible: boolean;
  mealName: string; // 'Полдник' или 'Поздний перекус'
  onConfirm: (time: string, minutesBefore: number) => void;
  onCancel: () => void;
}

const SnackEnableDialog: React.FC<SnackEnableDialogProps> = ({
  visible,
  mealName,
  onConfirm,
  onCancel,
}) => {
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [minutesBefore, setMinutesBefore] = useState(20);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedTime(date);
    }
  };

  const handleConfirm = () => {
    const hours = selectedTime.getHours().toString().padStart(2, '0');
    const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    onConfirm(timeString, minutesBefore);
  };

  const minutesOptions = [5, 10, 15, 20, 30, 45, 60];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Включить {mealName}</Text>
          <Text style={styles.subtitle}>
            Выберите время и интервал напоминания
          </Text>

          {/* Time Selector */}
          <View style={styles.section}>
            <Text style={styles.label}>Время приема пищи</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeText}>
                {selectedTime.toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}

          {/* Minutes Before Selector */}
          <View style={styles.section}>
            <Text style={styles.label}>Напомнить за (минут)</Text>
            <View style={styles.minutesContainer}>
              {minutesOptions.map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.minuteOption,
                    minutesBefore === minutes && styles.minuteOptionSelected,
                  ]}
                  onPress={() => setMinutesBefore(minutes)}
                >
                  <Text
                    style={[
                      styles.minuteText,
                      minutesBefore === minutes && styles.minuteTextSelected,
                    ]}
                  >
                    {minutes}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Включить</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    padding: spacing.lg,
  },
  dialog: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  timeButton: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  timeText: {
    ...typography.h3,
    color: colors.primary,
  },
  minutesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  minuteOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.background.default,
  },
  minuteOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  minuteText: {
    ...typography.body1,
    color: colors.text.primary,
  },
  minuteTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray[200],
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  confirmButtonText: {
    ...typography.button,
    color: 'white',
  },
});

export default SnackEnableDialog;

