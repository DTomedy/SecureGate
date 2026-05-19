import Link from 'next/link'
import { getPasswordResetToken } from '@/lib/tokens'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

interface ResetPasswordPageProps {
  params: {
    token: string
  }
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = params
  const record = await getPasswordResetToken(token)

  if (!record) {
    return (
      <main className="min-h-screen bg-brand-lightTint flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center flex flex-col items-center">
          <h1 className="text-2xl font-semibold text-brand-slate mb-2">Reset Password Failed</h1>
          <p className="text-sm text-red-600 mb-6" role="alert">
            This link has expired. Request a new password reset.
          </p>
          <Link
            href="/forgot-password"
            className="w-full py-2.5 px-4 bg-brand-primary text-white text-sm font-medium
                       rounded-md hover:bg-brand-primaryHover focus:outline-none focus:ring-2
                       focus:ring-brand-primary focus:ring-offset-2 transition-colors duration-150 text-center"
          >
            Request new reset link
          </Link>
          <p className="text-sm text-center text-gray-500 mt-6">
            Back to{' '}
            <Link href="/login" className="text-brand-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-lightTint flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-brand-slate mb-2">Reset password</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your new password below</p>
        <ResetPasswordForm token={token} />
      </div>
    </main>
  )
}
