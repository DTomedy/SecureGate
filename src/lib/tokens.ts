/**
 * Gall's Law — A complex system that works is invariably found to have evolved
 * from a simple system that worked. This file's four public functions
 * (generate*, get*, delete*) are the only token operations in the entire app.
 * Every token flow — verification, password reset — reduces to calls to these
 * primitives. Do not add new token schemas or expiry strategies without first
 * verifying they cannot be served by the functions already here.
 */
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import {
  VERIFICATION_TOKEN_EXPIRY_MINUTES,
  PASSWORD_RESET_TOKEN_EXPIRY_HOURS,
} from '@/lib/constants'

/**
 * Murphy's Law — Expiry checks must be structural, not optimistic.
 * Tokens can and will expire between the moment they're read from the DB and
 * the moment the server processes them. Always compare against the clock at
 * evaluation time, never trust a pre-computed "isValid" flag stored in the row.
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function getVerificationTokenExpiry(): Date {
  return new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MINUTES * 60 * 1000)
}

export function getPasswordResetTokenExpiry(): Date {
  return new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
}

export function isTokenExpired(expires: Date): boolean {
  return new Date() > expires
}

/**
 * Postel's Law — Be conservative in what you send, be liberal in what you accept.
 * The caller receives a simple success/failure for existence and expiry checks,
 * never a reason string that could leak state to an attacker.
 */

/**
 * Murphy's Law — Stale tokens are a structural hazard.
 * Always delete all existing tokens for an identifier before inserting a new one.
 * A user should never have two valid verification tokens simultaneously.
 */
export async function generateVerificationToken(email: string): Promise<string> {
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  })

  const token = generateSecureToken()
  const expires = getVerificationTokenExpiry()

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  return token
}

/**
 * Same stale-token guard for password reset tokens.
 */
export async function generatePasswordResetToken(email: string): Promise<string> {
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  })

  const token = generateSecureToken()
  const expires = getPasswordResetTokenExpiry()

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  })

  return token
}

/**
 * Law of Leaky Abstractions — The database query layer must not spill
 * internal error context (e.g., "token not found", "token expired") to callers.
 * These functions return null for any failure — the caller decides the response.
 */
export async function getVerificationToken(
  token: string
): Promise<{ identifier: string; expires: Date } | null> {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
    select: { identifier: true, expires: true },
  })

  if (!record) return null
  if (isTokenExpired(record.expires)) return null

  return record
}

export async function getPasswordResetToken(
  token: string
): Promise<{ email: string; expires: Date } | null> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: { email: true, expires: true },
  })

  if (!record) return null
  if (isTokenExpired(record.expires)) return null

  return record
}

/**
 * YAGNI — These functions handle one thing: delete the consumed token.
 * No audit log, no "already used" tracking. The token is gone, period.
 */
export async function deleteVerificationToken(token: string): Promise<void> {
  await prisma.verificationToken.delete({ where: { token } })
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken.delete({ where: { token } })
}
