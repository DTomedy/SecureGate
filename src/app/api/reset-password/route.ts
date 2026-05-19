/**
 * Gall's Law — A complex system that works is invariably found to have evolved
 * from a simple system that worked. This handler looks up a reset token,
 * validates it, hashes the new password, and deletes the token. The same
 * read-validate-act-cleanup pattern used by verify-email. No password-history
 * table, no "must differ from last N passwords" logic — those can be added as
 * independent layers without modifying this handler.
 */
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { resetPasswordSchema } from '@/lib/validations/auth'
import { getPasswordResetToken, deletePasswordResetToken } from '@/lib/tokens'
import { SALT_ROUNDS } from '@/lib/constants'

/**
 * Murphy's Law — The token may have been valid when fetched but the user's
 * DB record could be deleted between the read and the write. Validate the
 * user still exists before committing the new hash.
 *
 * Law of Leaky Abstractions — "Token not found", "token expired", and "user
 * not found" all produce the same response. The caller never learns which
 * layer rejected the request.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = resetPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { token, password } = result.data

    const record = await getPasswordResetToken(token)

    if (!record) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: record.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link.' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    await deletePasswordResetToken(token)

    return NextResponse.json(
      { success: true, message: 'Password reset successfully. You can now sign in with your new password.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[RESET_PASSWORD_ERROR]', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
