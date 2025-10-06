// OSDM Brand Colors
// Based on the logo gradient colors

export const BRAND_COLORS = {
  // Primary brand colors from logo
  purple: {
    DEFAULT: '#846F9C',
    light: '#9B88B0',
    dark: '#6D5C83',
  },
  blue: {
    DEFAULT: '#4691A9',
    light: '#5FA5BA',
    dark: '#3A7A8E',
  },
  green: {
    DEFAULT: '#89A58F',
    light: '#9DB6A2',
    dark: '#738D78',
  },

  // Gradient combinations
  gradient: {
    primary: 'linear-gradient(to right, #846F9C 0%, #846F9C 20%, #4691A9 50%, #89A58F 80%, #89A58F 100%)',
    secondary: 'linear-gradient(135deg, #846F9C 0%, #4691A9 50%, #89A58F 100%)',
    radial: 'radial-gradient(circle at center, #4691A9 0%, #846F9C 50%, #89A58F 100%)',
  },

  // UI colors
  background: {
    DEFAULT: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },

  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    muted: '#9CA3AF',
  },

  border: {
    DEFAULT: '#E5E7EB',
    light: '#F3F4F6',
    dark: '#D1D5DB',
  },

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
}

// Tailwind CSS custom colors
export const tailwindColors = {
  'osdm-purple': BRAND_COLORS.purple.DEFAULT,
  'osdm-blue': BRAND_COLORS.blue.DEFAULT,
  'osdm-green': BRAND_COLORS.green.DEFAULT,
}
