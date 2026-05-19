/**
 * Gall's Law — A complex system that works is invariably found to have evolved
 * from a simple system that worked. Every UI colour, border-radius, and shadow
 * in this project flows from the tokens defined in config/design-tokens.ts.
 * Adding arbitrary values in className strings is forbidden — extend this
 * config instead.
 */
import type { Config } from 'tailwindcss'
import { colors } from './config/design-tokens'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: colors.brand,
        gray: colors.neutral,
        success: colors.success,
        error: colors.error,
        warning: colors.warning,
      },
      borderRadius: {
        md: '0.375rem',
        lg: '0.5rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
}

export default config
