'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

interface ResetPasswordFormProps {
  token: string
}

function getPasswordStrength(pwd: string): 'weak' | 'fair' | 'strong' {
  if (pwd.length < 8) return 'weak'
  const checks = [/[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[^a-zA-Z0-9]/.test(pwd)]
  const passed = checks.filter(Boolean).length
  if (passed === 3) return 'strong'
  if (passed >= 1) return 'fair'
  return 'weak'
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const strength = getPasswordStrength(password)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
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
      <div className="text-center">
        <div className="bg-success-50 border border-success-500 text-success-600 rounded-md p-4 text-sm mb-6">
          Password reset successfully. You can now sign in with your new password.
        </div>
        <Link
          href="/login"
          className="inline-block w-full py-2.5 px-4 bg-brand-primary text-white text-sm font-medium
                     rounded-md hover:bg-brand-primaryHover focus:outline-none focus:ring-2
                     focus:ring-brand-primary focus:ring-offset-2 transition-colors duration-150 text-center"
        >
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          New password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            disabled={isLoading}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {password.length > 0 && (
          <>
            <div className="mt-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  strength === 'strong' ? 'bg-green-500 w-full' :
                  strength === 'fair'   ? 'bg-yellow-500 w-2/3' :
                                          'bg-red-500 w-1/3'
                }`}
              />
            </div>
            <p className={`text-xs mt-0.5 ${
              strength === 'strong' ? 'text-green-600' :
              strength === 'fair'   ? 'text-yellow-600' :
                                      'text-red-600'
            }`}>
              Password strength: {strength}
            </p>
          </>
        )}
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
        {isLoading ? 'Resetting password...' : 'Reset password'}
      </button>
    </form>
  )
}
