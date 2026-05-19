'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

function getPasswordStrength(pwd: string): 'weak' | 'fair' | 'strong' {
  if (pwd.length < 8) return 'weak'
  const checks = [/[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[^a-zA-Z0-9]/.test(pwd)]
  const passed = checks.filter(Boolean).length
  if (passed === 3) return 'strong'
  if (passed >= 1) return 'fair'
  return 'weak'
}

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const strength = getPasswordStrength(password)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          password: formData.get('password') as string,
        }),
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
            We sent a verification link to your email address. Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-block w-full py-2.5 px-4 bg-brand-primary text-white text-sm font-medium
                       rounded-md hover:bg-brand-primaryHover focus:outline-none focus:ring-2
                       focus:ring-brand-primary focus:ring-offset-2 transition-colors duration-150 text-center"
          >
            Go to sign in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-lightTint flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-brand-slate mb-2">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your details to get started</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              disabled={isLoading}
              placeholder="Jane Smith"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

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

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
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
                      strength === 'strong' ? 'w-full bg-green-500' :
                      strength === 'fair'   ? 'w-2/3 bg-yellow-500' :
                                              'w-1/3 bg-red-500'
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
            <p className="text-xs text-red-600" role="alert">{error}</p>
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
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
