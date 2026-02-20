/**
 * Design system colors extracted from Figma specifications.
 * Single source of truth for all color values across the app.
 */
export const Colors = {
  // Primary
  primaryBlue: '#3B82F6',
  primaryBlueDark: '#2563EB',

  // Backgrounds
  background: '#F9FAFB',
  cardBackground: '#FFFFFF',
  aiBubbleBg: '#F3F4F6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textHint: '#9CA3AF',

  // Status
  errorRed: '#EF4444',
  correctionGreen: '#22C55E',
  correctionOrange: '#F97316',

  // Borders
  borderLight: '#E5E7EB',
  borderLighter: '#F3F4F6',
} as const;
