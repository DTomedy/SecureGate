/**
 * Gall's Law — A complex system that works is invariably found to have evolved
 * from a simple system that worked. This handler validates a single token,
 * marks the user's email as verified, and deletes the token.
 * We also support resending a verification token by providing the email.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getVerificationToken, deleteVerificationToken, generateVerificationToken } from '@/lib/tokens'
import { sendEmail } from '@/lib/email'
import { VerifyEmail } from '@/components/emails/VerifyEmail'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, email } = body as { token?: string; email?: string }

    // Case 1: Resend verification email
    if (email) {
      if (typeof email !== 'string' || !email.includes('@')) {
        return NextResponse.json(
          { error: 'Please enter a valid email address.' },
          { status: 400 }
        )
      }

      const user = await prisma.user.findUnique({
        where: { email },
        select: { name: true, emailVerified: true },
      })

      // Postel's Law — Always return success even if user not found or already verified
      if (!user || user.emailVerified) {
        return NextResponse.json(
          { success: true, message: 'If the email is unregistered or unverified, a new verification link has been sent.' },
          { status: 200 }
        )
      }

      const verificationToken = await generateVerificationToken(email)
      const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email/${verificationToken}`

      await sendEmail({
        to: email,
        subject: 'Verify your email address',
        react: VerifyEmail({ name: user.name ?? 'there', verificationUrl }),
      })

      return NextResponse.json(
        { success: true, message: 'If the email is unregistered or unverified, a new verification link has been sent.' },
        { status: 200 }
      )
    }

    // Case 2: Verify token
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or expired verification link.' },
        { status: 400 }
      )
    }

    const record = await getVerificationToken(token)

    if (!record) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: record.identifier },
      select: { id: true, emailVerified: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link.' },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    })

    await deleteVerificationToken(token)

    return NextResponse.json(
      { success: true, message: 'Email verified successfully. You can now sign in.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[VERIFY_EMAIL_ERROR]', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
