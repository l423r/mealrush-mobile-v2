// Color palette
export const colors = {
  // Primary colors
  primary: '#43a047',
  primaryDark: '#2e7d32',
  primaryLight: '#66bb6a',
  
  // Secondary colors
  secondary: '#ff7043',
  secondaryDark: '#d84315',
  secondaryLight: '#ffab91',
  
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
  
  // Text colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#bdbdbd',
    hint: '#9e9e9e',
  },
  
  // Background colors
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    dark: '#121212',
  },
  
  // Status colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  
  // Border colors
  border: {
    light: '#e0e0e0',
    medium: '#bdbdbd',
    dark: '#757575',
  },
  
  // Shadow colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
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