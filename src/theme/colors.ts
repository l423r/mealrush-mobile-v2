// Color palette

// Original "Fresh & Clean" Light Theme
export const lightColors = {
  // Primary colors - Fresh Green
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#81C784',

  // Secondary colors - Warm Orange
  secondary: '#FF7043',
  secondaryDark: '#E64A19',
  secondaryLight: '#FFAB91',

  // Accent colors
  accent: {
    blue: '#64B5F6',
    purple: '#BA68C8',
    teal: '#26A69A',
    amber: '#FFC107',
    orange: '#FF7043',
    pink: '#F06292',
  },

  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Background colors - Fresh & Clean
  background: {
    default: '#F8F9FA', // Light gray-blue background
    paper: '#FFFFFF',
    light: '#F5F7FA',
    dark: '#121212',
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#bdbdbd',
    hint: '#9e9e9e',
    inverse: '#ffffff',
  },

  // Status colors
  success: '#4CAF50',
  successLight: 'rgba(76, 175, 80, 0.15)',
  warning: '#FF9800',
  warningLight: 'rgba(255, 152, 0, 0.15)',
  error: '#F44336',
  errorLight: 'rgba(244, 67, 54, 0.15)',
  info: '#2196F3',
  infoLight: 'rgba(33, 150, 243, 0.15)',

  // Border colors
  border: {
    light: '#E3E8EF',
    medium: '#CFD8DC',
    dark: '#90A4AE',
  },

  // Shadow colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.15)',
    colored: 'rgba(76, 175, 80, 0.15)',
  },
} as const;

// Premium Dark Theme
export const darkColors = {
  // Primary colors - Neon Green / Electric
  primary: '#CCFF00', // Neon Green
  primaryDark: '#99CC00',
  primaryLight: '#E6FF80',

  // Secondary colors - Electric Blue
  secondary: '#2979FF',
  secondaryDark: '#004ECB',
  secondaryLight: '#75A7FF',

  // Accent colors
  accent: {
    blue: '#2979FF',
    purple: '#D500F9',
    teal: '#00E5FF',
    amber: '#FFC400',
    orange: '#FF3D00',
    pink: '#FF4081',
  },

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Background colors - Dark & Premium
  background: {
    default: '#0A0A0A', // Very dark gray, almost black
    paper: '#121212',   // Material Dark
    light: '#1E1E1E',   // Lighter gray for cards
    dark: '#000000',
    elevated: '#2C2C2C', // For modals/popups
    overlay: 'rgba(0, 0, 0, 0.8)',
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    disabled: '#6E6E6E',
    hint: '#4A4A4A',
    inverse: '#000000',
  },

  // Status colors
  success: '#00E676', // Bright Green
  successLight: 'rgba(0, 230, 118, 0.15)',
  warning: '#FFC400', // Amber
  warningLight: 'rgba(255, 196, 0, 0.15)',
  error: '#FF1744',   // Red
  errorLight: 'rgba(255, 23, 68, 0.15)',
  info: '#00B0FF',    // Light Blue
  infoLight: 'rgba(0, 176, 255, 0.15)',

  // Border colors
  border: {
    light: '#333333',
    medium: '#424242',
    dark: '#616161',
  },

  // Shadow colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.2)',
    medium: 'rgba(0, 0, 0, 0.4)',
    dark: 'rgba(0, 0, 0, 0.6)',
    colored: 'rgba(204, 255, 0, 0.2)', // Primary color shadow
  },
} as const;

// Default to dark theme for Premium look
export const colors = darkColors;

// Theme-aware color getter
export const getThemeColors = (isDark: boolean) => {
  return isDark ? darkColors : lightColors;
};
