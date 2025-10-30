import { colors, getThemeColors } from './colors';
import { typography } from './typography';
import { spacing, componentSpacing, borderRadius, shadows } from './spacing';

// Base theme
export const baseTheme = {
  colors,
  typography,
  spacing,
  componentSpacing,
  borderRadius,
  shadows,
} as const;

// Dark theme
export const darkTheme = {
  ...baseTheme,
  colors: getThemeColors(true),
} as const;

// Light theme
export const lightTheme = {
  ...baseTheme,
  colors: getThemeColors(false),
} as const;

// Theme type
export type Theme = typeof baseTheme;

// Theme context type
export interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

// Default theme (light)
export const defaultTheme = lightTheme;
