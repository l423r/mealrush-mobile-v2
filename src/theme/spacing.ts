// Spacing scale (based on 8px grid) - Modern generous spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
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

// Border radius - Modern rounded corners
export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  round: 50,
} as const;

// Shadow styles - Soft modern shadows
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;