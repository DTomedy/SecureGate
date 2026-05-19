import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signUpSchema } from '@/lib/validations/auth'
import { generateVerificationToken } from '@/lib/tokens'
import { sendEmail } from '@/lib/email'
import { VerifyEmail } from '@/components/emails/VerifyEmail'
import { SALT_ROUNDS } from '@/lib/constants'

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
      await bcrypt.hash(password, SALT_ROUNDS)

      let emailSent = false
      let emailErr: string | null = null
      try {
        const verificationToken = await generateVerificationToken(email)
        const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email/${verificationToken}`
        emailSent = await sendEmail({
          to: email,
          subject: 'Verify your email address',
          react: VerifyEmail({ name, verificationUrl }),
        })
        if (!emailSent) {
          emailErr = 'Email delivery failed'
        }
      } catch (e) {
        emailErr = e instanceof Error ? e.message : 'Unknown email error'
        console.error('[REGISTER_EMAIL_ERROR]', e)
      }

      return NextResponse.json(
        {
          success: true,
          message: emailSent
            ? 'Account created. Check your email to verify your address.'
            : 'Account created. We could not send the verification email. Please request a new one.',
          error: emailSent ? null : emailErr,
        },
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

    let emailSent = false
    let emailErr: string | null = null
    try {
      const verificationToken = await generateVerificationToken(email)
      const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email/${verificationToken}`
      emailSent = await sendEmail({
        to: email,
        subject: 'Verify your email address',
        react: VerifyEmail({ name, verificationUrl }),
      })
      if (!emailSent) {
        emailErr = 'Email delivery failed'
      }
    } catch (e) {
      emailErr = e instanceof Error ? e.message : 'Unknown email error'
      console.error('[REGISTER_EMAIL_ERROR]', e)
    }

    return NextResponse.json(
      {
        success: true,
        message: emailSent
          ? 'Account created. Check your email to verify your address.'
          : 'Account created. We could not send the verification email. Please request a new one.',
        error: emailSent ? null : emailErr,
      },
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
