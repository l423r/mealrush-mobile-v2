import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

const AnalyticsDetailsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Детали аналитики</Text>
      <Text style={styles.text}>Здесь появятся полные списки и фильтры.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  text: {
    ...typography.body1,
    color: colors.text.secondary,
  },
});

export default AnalyticsDetailsScreen;
