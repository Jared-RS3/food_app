export const theme = {
  colors: {
    primary: '#FF4081', // Vibrant food-app pink - Material Design inspired
    primaryLight: '#FFE1ED',
    primaryDark: '#F50057',
    secondary: '#4ECDC4', // Soft teal
    secondaryLight: '#D4F4F2',
    accent: '#FFA07A', // Coral
    accentLight: '#FFE4D6',
    success: '#6BCF9F',
    successLight: '#D9F5E9',
    warning: '#FFB84D',
    warningLight: '#FFE8C2',
    error: '#FF6B88',
    errorLight: '#FFE0E8',

    // Text colors - Fresha-inspired clean hierarchy
    text: '#111827', // Fresha dark (gray-900) - primary text
    textSecondary: '#6B7280', // Fresha medium (gray-500) - secondary text
    textTertiary: '#9CA3AF', // Fresha light (gray-400) - tertiary text
    textDisabled: '#D1D5DB', // gray-300

    // Background colors - Fresha clean neutrals
    background: '#FFFFFF', // Pure white for Fresha feel
    surface: '#F9FAFB', // Fresha surface (gray-50)
    surfaceLight: '#F3F4F6', // gray-100
    surfaceDark: '#E5E7EB', // gray-200
    card: '#FFFFFF',
    overlay: 'rgba(17, 24, 39, 0.6)', // Using Fresha dark

    // UI colors
    white: '#FFFFFF',
    black: '#111827', // Fresha dark
    shadow: '#111827',
    border: '#E5E7EB', // Fresha border (gray-200)
    borderLight: '#F3F4F6', // gray-100
    divider: '#E5E7EB',
    star: '#FFD93D',

    // Fresha-inspired cool gray scale (not warm)
    gray: {
      50: '#F9FAFB', // Fresha surface
      100: '#F3F4F6', // Fresha hover
      200: '#E5E7EB', // Fresha border
      300: '#D1D5DB', // Disabled states
      400: '#9CA3AF', // Tertiary text
      500: '#6B7280', // Secondary text
      600: '#4B5563', // Dark secondary
      700: '#374151', // Dark text
      800: '#1F2937', // Darker
      900: '#111827', // Fresha primary text
    },
  },

  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    huge: 48,
    massive: 64,
  },

  typography: {
    // Fresha uses Inter font - we'll use system default (SF Pro/Roboto) which is similar
    // For custom Inter font, you'd need: expo-google-fonts/inter
    fontFamily: {
      regular: 'System', // System default (SF Pro on iOS, Roboto on Android)
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
    sizes: {
      xxxs: 10,
      xxs: 11,
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 28,
      huge: 32,
      massive: 40,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      extrabold: '800' as const,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  borderRadius: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  animation: {
    duration: {
      fast: 150,
      normal: 250,
      slow: 350,
    },
    easing: {
      spring: {
        damping: 15,
        stiffness: 150,
      },
    },
    spring: {
      snappy: {
        damping: 20,
        stiffness: 300,
      },
      smooth: {
        damping: 25,
        stiffness: 200,
      },
      gentle: {
        damping: 30,
        stiffness: 150,
      },
    },
  },
};
