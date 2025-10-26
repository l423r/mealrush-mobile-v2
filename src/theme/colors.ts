// Color palette - Fresh & Clean Modern Design
export const colors = {
  // Primary colors - Fresh Green
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#81C784',
  
  // Secondary colors - Warm Orange
  secondary: '#FF7043',
  secondaryDark: '#E64A19',
  secondaryLight: '#FFAB91',
  
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
  
  // Additional accent colors for modern design
  accent: {
    blue: '#64B5F6',
    purple: '#BA68C8',
    teal: '#26A69A',
    amber: '#FFC107',
  },
  
  // Gradient colors
  gradient: {
    primary: ['#4CAF50', '#81C784'],
    secondary: ['#FF7043', '#FFAB91'],
    warm: ['#FF6B35', '#FF8A65'],
    cool: ['#64B5F6', '#90CAF9'],
  },
  
  // Text colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#bdbdbd',
    hint: '#9e9e9e',
  },
  
  // Background colors - Fresh & Clean
  background: {
    default: '#F8F9FA',  // Light gray-blue background
    paper: '#FFFFFF',
    light: '#F5F7FA',
    dark: '#121212',
    elevated: '#FFFFFF',
  },
  
  // Status colors - Modern
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Border colors - Subtle modern borders
  border: {
    light: '#E3E8EF',
    medium: '#CFD8DC',
    dark: '#90A4AE',
  },
  
  // Shadow colors - Soft modern shadows
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.15)',
    colored: 'rgba(76, 175, 80, 0.15)',
  },
} as const;

// Dark theme colors
export const darkColors = {
  ...colors,
  
  // Override for dark theme
  text: {
    primary: '#ffffff',
    secondary: '#b3b3b3',
    disabled: '#666666',
    hint: '#808080',
  },
  
  background: {
    default: '#121212',
    paper: '#1e1e1e',
    dark: '#000000',
  },
  
  border: {
    light: '#333333',
    medium: '#555555',
    dark: '#777777',
  },
} as const;

// Theme-aware color getter
export const getThemeColors = (isDark: boolean) => {
  return isDark ? darkColors : colors;
};