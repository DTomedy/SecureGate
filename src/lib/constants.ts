/**
 * Gall's Law — A complex system that works is invariably found to have evolved
 * from a simple system that worked. These named constants are the seed values
 * from which every security decision (token lifetime, rate-limit window, salt
 * cost) grows. Change a number here and the entire system adjusts accordingly.
 */
export const SALT_ROUNDS = 12
export const VERIFICATION_TOKEN_EXPIRY_MINUTES = 15
export const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1
export const RATE_LIMIT_MAX_ATTEMPTS = 5
export const RATE_LIMIT_WINDOW_SECONDS = 600
export const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
export const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10)
export const SMTP_USER = process.env.SMTP_USER || ''
export const SMTP_PASS = process.env.SMTP_PASS || ''
export const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || ''
export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
