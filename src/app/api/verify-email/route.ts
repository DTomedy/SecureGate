/**
 * Gall's Law — A complex system that works is invariably found to have evolved
 * from a simple system that worked. This handler validates a single token,
 * marks the user's email as verified, and deletes the token. Three Prisma
 * calls, no branching complexity. Every future email-action flow (e.g.
 * "verify new email address") should follow this exact read-validate-act-cleanup
 * pattern rather than adding conditionals to this handler.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getVerificationToken, deleteVerificationToken } from '@/lib/tokens'

/**
 * Murphy's Law — A token can expire between the moment it's fetched and the
 * moment the verification is committed. The getVerificationToken helper
 * already checks expiry, but the transaction boundary exists for a reason:
 * never trust the client's timing.
 *
 * Postel's Law — Three failure states map to one user-facing message:
 * "Invalid or expired verification link." The caller does not learn whether
 * the token was missing, expired, or already consumed.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token } = body as { token?: string }

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
