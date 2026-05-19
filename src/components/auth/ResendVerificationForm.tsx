'use client'

import { useState } from 'react'

interface ResendVerificationFormProps {
  initialEmail?: string
}

export function ResendVerificationForm({ initialEmail = '' }: ResendVerificationFormProps) {
  const [email, setEmail] = useState(initialEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleResend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-success-50 border border-success-500 text-success-600 rounded-md p-4 text-sm mt-4">
        If an account with that email exists, a new verification link has been sent.
      </div>
    )
  }

  return (
    <form onSubmit={handleResend} className="flex flex-col gap-4 mt-4 w-full">
      <div className="flex flex-col gap-1 text-left">
        <label htmlFor="resend-email" className="text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="resend-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        className="w-full py-2 px-4 bg-brand-primary text-white text-sm font-medium
                   rounded-md hover:bg-brand-primaryHover focus:outline-none focus:ring-2
                   focus:ring-brand-primary focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-150"
      >
        {isLoading ? 'Sending link...' : 'Resend verification email'}
      </button>
    </form>
  )
}
