import { Platform } from 'react-native';

// Font families
export const fontFamilies = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
} as const;

// Font sizes - Modern readable scale
export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 36,
} as const;

// Line heights - Improved readability (1.5-1.6 ratio)
export const lineHeights = {
  xs: 18,
  sm: 22,
  md: 26,
  lg: 32,
  xl: 36,
  xxl: 40,
  xxxl: 54,
} as const;

// Font weights
export const fontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

// Typography styles
export const typography = {
  // Headers
  h1: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xxxl,
    lineHeight: lineHeights.xxxl,
    fontWeight: fontWeights.bold,
  },
  h2: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xxl,
    lineHeight: lineHeights.xxl,
    fontWeight: fontWeights.bold,
  },
  h3: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
    fontWeight: fontWeights.bold,
  },
  h4: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: fontWeights.medium,
  },
  h5: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: fontWeights.medium,
  },
  h6: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.medium,
  },
  
  // Body text
  body1: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: fontWeights.regular,
  },
  body2: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.regular,
  },
  
  // Caption
  caption: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.regular,
  },
  
  // Button text
  button: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: fontWeights.medium,
  },
  
  // Overline
  overline: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.regular,
    textTransform: 'uppercase' as const,
  },
} as const;