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
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { formatTime } from '../../utils/formatting';
import Button from './Button';
import TimePickerModal from './TimePickerModal';

interface MealTypeEditDialogProps {
  visible: boolean;
  currentType: string;
  currentDateTime?: Date; // Optional - if not provided, time editing is disabled
  onSelect: (mealType: string, dateTime?: Date) => void;
  onCancel: () => void;
}

const MealTypeEditDialog: React.FC<MealTypeEditDialogProps> = ({
  visible,
  currentType,
  currentDateTime,
  onSelect,
  onCancel,
}) => {
  const [selectedType, setSelectedType] = useState(currentType);
  const [selectedTime, setSelectedTime] = useState(
    currentDateTime ? new Date(currentDateTime) : new Date()
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const canEditTime = !!currentDateTime;

  useEffect(() => {
    if (visible) {
      setSelectedType(currentType);
      if (currentDateTime) {
        setSelectedTime(new Date(currentDateTime));
      }
      setShowTimePicker(false);
    }
  }, [visible, currentType, currentDateTime]);

  const mealTypes = [
    { value: 'BREAKFAST', label: 'Завтрак', icon: '🌅' },
    { value: 'LUNCH', label: 'Обед', icon: '🌞' },
    { value: 'DINNER', label: 'Ужин', icon: '🌙' },
    { value: 'SUPPER', label: 'Перекус', icon: '☕' },
    { value: 'LATE_SUPPER', label: 'Поздний перекус', icon: '🌃' },
  ];

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
    if (canEditTime && currentDateTime) {
      // Combine selected date from currentDateTime with selected time
      const dateTime = new Date(currentDateTime);
      dateTime.setHours(selectedTime.getHours());
      dateTime.setMinutes(selectedTime.getMinutes());
      dateTime.setSeconds(0);
      dateTime.setMilliseconds(0);
      onSelect(selectedType, dateTime);
    } else {
      // For templates without time
      onSelect(selectedType);
    }
  };

  return (
    <>
      <Modal
        visible={visible && !(Platform.OS === 'android' && showTimePicker) && !showTimePicker}
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
                    <Text style={styles.title}>
                      {canEditTime ? 'Редактировать прием пищи' : 'Изменить тип приема пищи'}
                    </Text>
                    <Text style={styles.subtitle}>
                      {canEditTime
                        ? 'Измените тип и время приема пищи'
                        : 'Выберите новый тип'}
                    </Text>

                    {/* Meal Type Selection */}
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>Тип приема пищи</Text>
                      <View style={styles.optionsContainer}>
                        {mealTypes.map((type) => (
                          <TouchableOpacity
                            key={type.value}
                            testID={`meal_type_option_${type.value.toLowerCase()}`}
                            accessibilityLabel={`Выбрать тип приема пищи: ${type.label}`}
                            style={[
                              styles.mealOption,
                              selectedType === type.value &&
                              styles.mealOptionActive,
                            ]}
                            onPress={() => setSelectedType(type.value)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.mealIconContainer}>
                              <Text style={styles.mealIcon}>{type.icon}</Text>
                            </View>
                            <Text
                              style={[
                                styles.mealLabel,
                                selectedType === type.value &&
                                styles.mealLabelActive,
                              ]}
                            >
                              {type.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Time Selection - only show if currentDateTime is provided */}
                    {canEditTime && (
                      <>
                        <View style={styles.section}>
                          <Text style={styles.sectionLabel}>Время</Text>
                          <TouchableOpacity
                            testID="meal_type_edit_time_picker_button"
                            accessibilityLabel="Выбрать время приема пищи"
                            style={styles.timePickerButton}
                            onPress={() => setShowTimePicker(true)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.timePickerText}>
                              {formatTime(selectedTime)}
                            </Text>
                            <Text style={styles.timePickerIcon}>🕐</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}

                    {/* Buttons */}
                    <View style={styles.buttonsContainer}>
                      <Button
                        testID="meal_type_edit_cancel_button"
                        title="Отмена"
                        onPress={onCancel}
                        variant="outline"
                        style={styles.cancelButton}
                      />
                      <Button
                        testID="meal_type_edit_confirm_button"
                        title="Сохранить"
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
    width: '85%',
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
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  optionsContainer: {
    marginBottom: spacing.xs,
  },
  mealOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  mealOptionActive: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  mealIcon: {
    fontSize: 24,
  },
  mealLabel: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
  },
  mealLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  timePickerText: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '500',
  },
  timePickerIcon: {
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

export default MealTypeEditDialog;

