import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import MinutesBeforeSlider from './MinutesBeforeSlider';
import type { MealNotificationSettings } from '../../types/api.types';

interface MealNotificationCardProps {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'lateSnack';
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  settings: MealNotificationSettings;
  disabled?: boolean; // Если globallyEnabled=false
  onToggle: () => void;
  onTimeChange: (time: string) => void;
  onMinutesBeforeChange: (minutes: number) => void;
}

const MealNotificationCard: React.FC<MealNotificationCardProps> = ({
  title,
  icon,
  settings,
  disabled = false,
  onToggle,
  onTimeChange,
  onMinutesBeforeChange,
}) => {
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleTimePickerChange = (event: any, date?: Date) => {
    setShowTimePicker(false);
    if (date && event.type === 'set') {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      onTimeChange(timeString);
    }
  };

  // Парсим время для DateTimePicker
  const getDateFromTime = (timeStr: string | null): Date => {
    if (!timeStr) return new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  return (
    <View style={[styles.card, shadows.small]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name={icon} size={24} color={colors.primary} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Switch
          value={settings.enabled && !disabled}
          onValueChange={onToggle}
          trackColor={{
            false: colors.gray[300],
            true: colors.primaryLight || colors.primary,
          }}
          thumbColor={
            settings.enabled && !disabled ? colors.primary : colors.gray[100]
          }
          disabled={disabled}
        />
      </View>

      {settings.enabled && !disabled && settings.time && (
        <View style={styles.details}>
          {/* Время приема пищи */}
          <TouchableOpacity
            style={styles.timeRow}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.detailLabel}>Время приема</Text>
            <View style={styles.timeValue}>
              <Text style={styles.timeText}>{settings.time}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </View>
          </TouchableOpacity>

          {/* Слайдер minutesBefore */}
          {settings.minutesBefore && (
            <MinutesBeforeSlider
              value={settings.minutesBefore}
              onChange={onMinutesBeforeChange}
              min={10}
              max={120}
            />
          )}

          {/* Вычисленное время напоминания (READ-ONLY от сервера) */}
          {settings.reminderAt && (
            <View style={styles.reminderRow}>
              <Ionicons name="alarm" size={18} color={colors.success} />
              <Text style={styles.reminderText}>
                Напомню в {settings.reminderAt}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Time Picker Modal */}
      {showTimePicker && settings.time && (
        <DateTimePicker
          value={getDateFromTime(settings.time)}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimePickerChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  details: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  timeValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    ...typography.h4,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.successLight || '#E8F5E9',
    borderRadius: borderRadius.md,
  },
  reminderText: {
    ...typography.body2,
    color: colors.success,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
});

export default MealNotificationCard;

