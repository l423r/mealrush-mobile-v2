import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused ? styles.focusedInputContainer : undefined,
    error ? styles.errorInputContainer : undefined,
    containerStyle,
  ];

  const inputStyleCombined = [
    styles.input,
    leftIcon ? styles.inputWithLeftIcon : undefined,
    rightIcon ? styles.inputWithRightIcon : undefined,
    inputStyle,
  ];

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      
      <View style={inputContainerStyle}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={inputStyleCombined}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.text.hint}
          {...props}
        />
        
        {rightIcon && (
          <View style={styles.rightIcon} onTouchEnd={onRightIconPress}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.paper,
    minHeight: 44,
  },
  focusedInputContainer: {
    borderColor: colors.primary,
  },
  errorInputContainer: {
    borderColor: colors.error,
  },
  input: {
    ...typography.body1,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flex: 1,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: spacing.sm,
  },
  leftIcon: {
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  rightIcon: {
    paddingRight: spacing.md,
    paddingLeft: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default Input;