import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import type { lightColors, darkColors } from '../../theme/colors';

type ColorsType = typeof lightColors | typeof darkColors;

interface QuickActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  testID?: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = observer(({
  icon,
  label,
  onPress,
  testID,
}) => {
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);
  
  return (
    <TouchableOpacity
      style={dynamicStyles.container}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
      accessibilityLabel={testID}
      accessible={!!testID}
    >
      <View style={dynamicStyles.iconCircle}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={dynamicStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
});

const createStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 70,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background.paper,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default QuickActionCard;

