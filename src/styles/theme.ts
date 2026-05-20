export const theme = {
  colors: {
    background: '#08050e',
    backgroundGradient: ['#08050e', '#130c25'],
    cardBg: 'rgba(18, 14, 30, 0.7)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    cardBorderActive: 'rgba(139, 92, 246, 0.35)',
    
    text: '#ffffff',
    textSecondary: '#a5a1b8',
    textMuted: '#6f6b85',
    
    primary: '#8b5cf6', // Violet
    primaryLight: '#a78bfa',
    primaryGlow: 'rgba(139, 92, 246, 0.15)',
    
    income: '#10b981', // Emerald
    incomeLight: '#34d399',
    incomeBg: 'rgba(16, 185, 129, 0.1)',
    
    expense: '#ef4444', // Red
    expenseLight: '#f87171',
    expenseBg: 'rgba(239, 68, 68, 0.1)',
    
    warning: '#f59e0b', // Amber
    warningBg: 'rgba(245, 158, 11, 0.1)',

    glassBg: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.05)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  typography: {
    fontFamily: 'System',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 22,
      xxl: 28,
      huge: 36,
    },
    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    } as const,
  },
};
