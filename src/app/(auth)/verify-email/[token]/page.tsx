import Link from 'next/link'
import { getVerificationToken, deleteVerificationToken } from '@/lib/tokens'
import { prisma } from '@/lib/db'
import { ResendVerificationForm } from '@/components/auth/ResendVerificationForm'

interface VerifyEmailPageProps {
  params: {
    token: string
  }
}

export default async function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const { token } = params

  let success = false
  let errorMsg = ''
  let email = ''

  try {
    // Look up token, including expired ones to support better UX (pre-filled email for resend)
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!record) {
      errorMsg = 'Invalid or already used link.'
    } else {
      email = record.identifier
      const isExpired = new Date() > record.expires

      if (isExpired) {
        errorMsg = 'This link has expired. Request a new verification email.'
      } else {
        const user = await prisma.user.findUnique({
          where: { email: record.identifier },
          select: { id: true },
        })

        if (!user) {
          errorMsg = 'Invalid or already used link.'
        } else {
          // Update user to verified and delete the used token
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          })
          await deleteVerificationToken(token)
          success = true
        }
      }
    }
  } catch (error) {
    console.error('[VERIFY_EMAIL_PAGE_EXCEPTION]', error)
    errorMsg = 'Something went wrong. Please try again.'
  }

  return (
    <main className="min-h-screen bg-brand-lightTint flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center flex flex-col items-center">
        {success ? (
          <>
            <h1 className="text-2xl font-semibold text-brand-slate mb-2">Email Verified</h1>
            <p className="text-sm text-gray-500 mb-6">
              Your email address has been successfully verified. You can now sign in to your account.
            </p>
            <Link
              href="/login"
              className="w-full py-2.5 px-4 bg-brand-primary text-white text-sm font-medium
                         rounded-md hover:bg-brand-primaryHover focus:outline-none focus:ring-2
                         focus:ring-brand-primary focus:ring-offset-2 transition-colors duration-150 text-center"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-brand-slate mb-2">Verification Failed</h1>
            <p className="text-sm text-red-600 mb-4" role="alert">
              {errorMsg}
            </p>
            <ResendVerificationForm initialEmail={email} />
            <p className="text-sm text-center text-gray-500 mt-6">
              Back to{' '}
              <Link href="/login" className="text-brand-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
