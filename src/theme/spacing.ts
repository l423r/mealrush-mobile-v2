// Spacing scale (based on 8px grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const;

// Component-specific spacing
export const componentSpacing = {
  // Screen padding
  screenHorizontal: spacing.md,
  screenVertical: spacing.lg,
  
  // Card padding
  cardPadding: spacing.md,
  cardMargin: spacing.sm,
  
  // Button padding
  buttonPadding: {
    small: { horizontal: spacing.sm, vertical: spacing.xs },
    medium: { horizontal: spacing.md, vertical: spacing.sm },
    large: { horizontal: spacing.lg, vertical: spacing.md },
  },
  
  // Input padding
  inputPadding: {
    horizontal: spacing.md,
    vertical: spacing.sm,
  },
  
  // List item spacing
  listItemSpacing: spacing.sm,
  
  // Section spacing
  sectionSpacing: spacing.lg,
  
  // Icon spacing
  iconSpacing: spacing.sm,
  
  // Divider spacing
  dividerSpacing: spacing.md,
} as const;

// Border radius
export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 50,
} as const;

// Shadow styles
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
} as const;