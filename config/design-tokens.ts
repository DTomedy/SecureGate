/**
 * Gall's Law — A complex system that works is invariably found to have evolved
 * from a simple system that worked. These tokens are the simple foundation
 * every component's colour, spacing, and shadow decisions flow from.
 *
 * Single source of truth for SecureGate brand identity.
 * Import this file into tailwind.config.ts to expose these values as
 * first-class Tailwind utility classes.
 */

export const colors = {
  brand: {
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    deepIndigo: '#1E40AF',
    slate: '#1E3A5F',
    lightTint: '#EFF6FF',
  },
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  success: {
    50: '#F0FDF4',
    500: '#22C55E',
    600: '#16A34A',
  },
  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
  },
  warning: {
    50: '#FFFBEB',
    500: '#EAB308',
    600: '#CA8A04',
  },
} as const

export type ColorKey = keyof typeof colors
