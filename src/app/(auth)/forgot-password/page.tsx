'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (typeof data.error === 'string') {
          setError(data.error)
        } else if (data.error && typeof data.error === 'object') {
          const messages = Object.values(data.error).flat().join('. ')
          setError(messages || 'Something went wrong. Please try again.')
        } else {
          setError('Unexpected server response. Please try again.')
        }
        return
      }

      setSuccess(true)
    } catch {
      setError('Unable to reach the server. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-brand-lightTint flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-semibold text-brand-slate mb-2">Check your email</h1>
          <p className="text-sm text-gray-500 mb-6">
            If an account with that email exists, a reset link has been sent.
          </p>
          <Link
            href="/login"
            className="inline-block w-full py-2.5 px-4 bg-brand-primary text-white text-sm font-medium
                       rounded-md hover:bg-brand-primaryHover focus:outline-none focus:ring-2
                       focus:ring-brand-primary focus:ring-offset-2 transition-colors duration-150 text-center"
          >
            Back to sign in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-lightTint flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-brand-slate mb-2">Forgot password</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your email address and we will send you a reset link</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-brand-primary text-white text-sm font-medium
                       rounded-md hover:bg-brand-primaryHover focus:outline-none focus:ring-2
                       focus:ring-brand-primary focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-150"
          >
            {isLoading ? 'Sending link...' : 'Send reset link'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          <Link href="/login" className="text-brand-primary font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
