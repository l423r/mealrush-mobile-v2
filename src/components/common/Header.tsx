import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../theme';

interface HeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  rightComponent,
  onBackPress,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

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
        barStyle="dark-content"
        backgroundColor={colors.background.paper}
      />
      <View
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, spacing.sm) },
        ]}
      >
        <View style={styles.left}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>
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
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    minHeight: 56,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  center: {
    flex: 2,
    alignItems: 'center',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    ...typography.h3,
    color: colors.primary,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: spacing.xs / 2,
  },
});

export default Header;
