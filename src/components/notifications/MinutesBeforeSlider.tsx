import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, typography, spacing } from '../../theme';

interface MinutesBeforeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

const MinutesBeforeSlider: React.FC<MinutesBeforeSliderProps> = ({
  value,
  onChange,
  min = 10,
  max = 120,
  disabled = false,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleValueChange = (newValue: number) => {
    // Округляем до ближайшего кратного 10
    const roundedValue = Math.round(newValue / 10) * 10;
    setLocalValue(roundedValue);

    // Debounce: вызываем onChange через 500ms после последнего изменения
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      onChange(roundedValue);
    }, 500);

    setDebounceTimeout(timeout);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Напомнить за {localValue} минут</Text>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={10}
        value={localValue}
        onValueChange={handleValueChange}
        minimumTrackTintColor={disabled ? colors.gray[300] : colors.primary}
        maximumTrackTintColor={colors.gray[300]}
        thumbTintColor={disabled ? colors.gray[400] : colors.primary}
        disabled={disabled}
      />
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{min} мин</Text>
        <Text style={styles.rangeLabel}>{max} мин</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  label: {
    ...typography.body1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  rangeLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});

export default MinutesBeforeSlider;

