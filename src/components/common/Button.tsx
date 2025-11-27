import type { ViewStyle, TextStyle, StyleProp } from 'react-native';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import {
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import type { lightColors, darkColors } from '../../theme/colors';

type ColorsType = typeof lightColors | typeof darkColors;

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

const Button: React.FC<ButtonProps> = observer(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
}) => {
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);

  const buttonStyle = [
    dynamicStyles.button,
    dynamicStyles[`${variant}Button`],
    dynamicStyles[`${size}Button`],
    disabled && dynamicStyles.disabledButton,
    style,
  ];

  const textStyleCombined = [
    dynamicStyles.text,
    dynamicStyles[`${variant}Text`],
    dynamicStyles[`${size}Text`],
    disabled && dynamicStyles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
      accessibilityLabel={testID}
      accessible={!!testID}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.text.inverse : colors.primary}
          size="small"
        />
      ) : (
        <Text style={textStyleCombined} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
});

const createStyles = (colors: ColorsType) => StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.sm,
  },

  // Variants - Modern elevated buttons
  primaryButton: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    ...shadows.md,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
  },

  // Sizes - Generous padding
  smallButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 36,
  },
  mediumButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  largeButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 56,
  },

  // Disabled
  disabledButton: {
    opacity: 0.6,
  },

  // Text styles
  text: {
    ...typography.button,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.text.inverse,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  textText: {
    color: colors.primary,
  },

  // Text sizes
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },

  // Disabled text
  disabledText: {
    opacity: 0.6,
  },
});

export default Button;
