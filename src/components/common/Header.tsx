import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  StyleProp,
  TextStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { observer } from 'mobx-react-lite';

interface HeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  showBackButton?: boolean;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  titleStyle?: StyleProp<TextStyle>;
}

const Header: React.FC<HeaderProps> = observer(({
  title,
  subtitle,
  showBackButton = false,
  leftComponent,
  rightComponent,
  onBackPress,
  titleStyle,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background.paper}
      />
      <View
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, spacing.sm),
            backgroundColor: colors.background.paper,
            borderBottomColor: colors.border.light,
          },
        ]}
      >
        <View style={styles.left}>
          {leftComponent ? (
            leftComponent
          ) : showBackButton ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.backButtonText, { color: colors.primary }]}>←</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.center}>
          <Text style={[styles.title, { color: colors.text.primary }, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <View style={styles.subtitle}>
              {subtitle}
            </View>
          )}
        </View>

        <View style={styles.right}>{rightComponent}</View>
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1.5,
    alignItems: 'center',
    paddingRight: spacing.sm,
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    ...typography.h3,
  },
  title: {
    ...typography.h4,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: spacing.xs / 2,
  },
});

export default Header;
