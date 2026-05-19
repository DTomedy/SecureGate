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
export const RESEND_FROM_EMAIL = 'noreply@securegate.app'
