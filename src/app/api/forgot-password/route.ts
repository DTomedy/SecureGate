/**
 * Gall's Law — A complex system that works is invariably found to have evolved
 * from a simple system that worked. This handler does one thing: accept an
 * email, look up the user, generate a reset token, and send a message. The
 * response never reveals whether the account exists. This simple foundation
 * prevents email-enumeration attacks without needing a separate rate-limiter
 * or allow-list.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { generatePasswordResetToken } from '@/lib/tokens'
import { sendEmail } from '@/lib/email'
import { ResetPasswordEmail } from '@/components/emails/ResetPasswordEmail'

/**
 * Postel's Law — Always return the exact same response whether the email
 * exists or not. An attacker should never be able to probe which accounts
 * are registered. The user-facing message is intentionally ambiguous.
 *
 * Murphy's Law — The email field could be empty, malformed, or malicious.
 * Zod validates the shape before we touch the database.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = forgotPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email } = result.data

    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: true, message: 'If an account with that email exists, a reset link has been sent.' },
        { status: 200 }
      )
    }

    const resetToken = await generatePasswordResetToken(email)
    const origin = req.nextUrl.origin
    const resetUrl = `${origin}/reset-password/${resetToken}`

    await sendEmail({
      to: email,
      subject: 'Reset your password',
      react: ResetPasswordEmail({ name: user.name ?? 'there', resetUrl }),
    })

    return NextResponse.json(
      { success: true, message: 'If an account with that email exists, a reset link has been sent.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[FORGOT_PASSWORD_ERROR]', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
