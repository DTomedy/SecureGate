/**
 * Gall's Law — A complex system that works is invariably found to have evolved
 * from a simple system that worked. This single POST handler is the entire
 * registration surface. It validates input, writes the user, generates a
 * verification token, and dispatches an email. Every future auth flow (OAuth,
 * invite codes, etc.) should be a separate route following this same
 * pattern — not bolted onto this handler.
 */
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signUpSchema } from '@/lib/validations/auth'
import { generateVerificationToken } from '@/lib/tokens'
import { sendEmail } from '@/lib/email'
import { VerifyEmail } from '@/components/emails/VerifyEmail'
import { SALT_ROUNDS } from '@/lib/constants'

/**
 * Murphy's Law — Every database write can fail. Every string can be malformed.
 * The try/catch is not optional; it is the last line of defence between a
 * cryptic Prisma error and a sanitised JSON response.
 *
 * Postel's Law — Always return a generic success message on registration
 * regardless of outcome. Never confirm or deny whether the email already
 * exists in the database.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = signUpSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, password } = result.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      // Perform a dummy hash to prevent timing attacks
      await bcrypt.hash(password, SALT_ROUNDS)
      return NextResponse.json(
        { success: true, message: 'Account created. Check your email to verify your address.' },
        { status: 201 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    try {
      const verificationToken = await generateVerificationToken(email)
      const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email/${verificationToken}`

      await sendEmail({
        to: email,
        subject: 'Verify your email address',
        react: VerifyEmail({ name, verificationUrl }),
      })
    } catch (emailError) {
      console.error('[REGISTER_EMAIL_ERROR]', emailError)
    }

    return NextResponse.json(
      { success: true, message: 'Account created. Check your email to verify your address.' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[REGISTER_ERROR]', error)
    const message =
      error instanceof Error ? error.message : 'Something went wrong. Please try again.'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
