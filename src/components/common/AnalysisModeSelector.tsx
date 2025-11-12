import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import type { AnalysisMode } from '../../types/api.types';

interface AnalysisModeSelectorProps {
  value: AnalysisMode;
  onChange: (mode: AnalysisMode) => void;
}

const modes: Array<{ value: AnalysisMode; label: string; description: string }> = [
  { value: 'AUTO', label: 'Авто', description: 'AI решает сам' },
  { value: 'SIMPLE', label: 'Простой', description: 'Одно блюдо' },
  { value: 'DETAILED', label: 'Детальный', description: 'По ингредиентам' },
];

const AnalysisModeSelector: React.FC<AnalysisModeSelectorProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Режим анализа:</Text>
      <View style={styles.modeButtons}>
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode.value}
            style={[
              styles.modeButton,
              value === mode.value && styles.modeButtonActive,
            ]}
            onPress={() => onChange(mode.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.modeLabel,
                value === mode.value && styles.modeLabelActive,
              ]}
            >
              {mode.label}
            </Text>
            <Text
              style={[
                styles.modeDescription,
                value === mode.value && styles.modeDescriptionActive,
              ]}
            >
              {mode.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  modeButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  modeLabel: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 1,
    fontSize: 13,
  },
  modeLabelActive: {
    color: colors.primary,
  },
  modeDescription: {
    ...typography.caption,
    color: colors.text.hint,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 12,
  },
  modeDescriptionActive: {
    color: colors.primary,
  },
});

export default AnalysisModeSelector;


