import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import type { lightColors, darkColors } from '../../theme/colors';

type ColorsType = typeof lightColors | typeof darkColors;

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

const Loading: React.FC<LoadingProps> = observer(({
  message = 'Загрузка...',
  size = 'large',
  color,
}) => {
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);
  const indicatorColor = color || colors.primary;

  return (
    <View style={dynamicStyles.container}>
      <ActivityIndicator size={size} color={indicatorColor} />
      {message && <Text style={dynamicStyles.message}>{message}</Text>}
    </View>
  );
});

const createStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.default,
  },
  message: {
    ...typography.body1,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default Loading;
