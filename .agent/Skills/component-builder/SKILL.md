---
name: component-builder
description: >
  Use this skill when building any UI page or form component for SecureGate.
  Triggers on: "build the login page", "create the sign up form", "add a password strength indicator",
  "build the dashboard", "create the forgot password page", "add a loading state to the form",
  or any request to create or modify a visual component or page in the auth flow.
  Always load this skill before writing any .tsx file that the user will see.
---

# Skill: Component Builder

Builds accessible, consistent UI pages and form components for SecureGate using Next.js 14 App Router and Tailwind CSS.

## Before You Build

1. Load `.agents/rules/design-system.md` — it defines layout, tokens, error wording, and form patterns
2. Load `.agents/rules/code-style.md` — it defines TypeScript rules, naming, and import conventions
3. Confirm which page you are building against the required page list in `design-system.md`

---

## Step 1 — Identify the Component

Determine from the request which of these you are building:

| Component | File Path | Key Requirements |
|---|---|---|
| Sign Up page | `src/app/(auth)/signup/page.tsx` | Name, email, password fields; strength indicator; link to login |
| Login page | `src/app/(auth)/login/page.tsx` | Email, password fields; error message; link to signup + forgot password |
| Verify Email page | `src/app/(auth)/verify-email/[token]/page.tsx` | Server component; shows success or error; resend option on error |
| Forgot Password page | `src/app/(auth)/forgot-password/page.tsx` | Email field only; success state after submit |
| Reset Password page | `src/app/(auth)/reset-password/[token]/page.tsx` | New password field; strength indicator; redirect to login on success |
| Dashboard page | `src/app/dashboard/page.tsx` | Server component; session check; user info display; logout button |

---

## Step 2 — Apply the Page Shell

Every auth page uses the centred card layout from `design-system.md`. Copy and adapt:

```tsx
'use client' // only on pages with form state

import { useState } from 'react'

export default function PageName() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Title</h1>
        <p className="text-sm text-gray-500 mb-6">Description</p>
        {/* content */}
      </div>
    </main>
  )
}
```

Pages with form state → `'use client'` + `useState`
Pages that only display server-fetched data (verify-email, dashboard) → Server Components, no `'use client'`

---

## Step 3 — Build the Form

Use `useState` to track: `isLoading`, `error` (string | null), field values, and `success` (boolean) where needed.

```tsx
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  setIsLoading(true)
  setError(null)

  const formData = new FormData(e.currentTarget)

  try {
    const res = await fetch('/api/route-name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        field: formData.get('field') as string,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
      return
    }

    // handle success
  } catch {
    setError('Something went wrong. Please try again.')
  } finally {
    setIsLoading(false)
  }
}
```

---

## Step 4 — Add Each Field

Follow the field pattern from `design-system.md` exactly. Each field needs:
- A `<label>` with `htmlFor` matching the input `id`
- Correct `type`, `name`, `id`, `autoComplete`
- An error message below if field-level validation applies

---

## Step 5 — Add Password Strength Indicator

Required on: Sign Up page, Reset Password page.

```tsx
const [password, setPassword] = useState('')

function getPasswordStrength(pwd: string): 'weak' | 'fair' | 'strong' {
  if (pwd.length < 8) return 'weak'
  const checks = [/[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[^a-zA-Z0-9]/.test(pwd)]
  const passed = checks.filter(Boolean).length
  if (passed === 3) return 'strong'
  if (passed >= 1) return 'fair'
  return 'weak'
}

const strength = getPasswordStrength(password)
```

Render the bar and label below the password input. See `design-system.md` for the full render pattern.

---

## Step 6 — Add Navigation Links

Every auth page must link to the related page. See `design-system.md` → Navigation Links section for exact wording and markup.

---

## Step 7 — Verify the Component Checklist

Before completing the component:

- [ ] Every `<label>` has a `htmlFor` that matches its input's `id`
- [ ] Every form has a visible loading state when `isLoading` is true
- [ ] The submit button is disabled when `isLoading` is true
- [ ] Error messages use `role="alert"` for accessibility
- [ ] Error wording matches the table in `design-system.md` exactly
- [ ] Password fields on sign-up and reset-password have the strength indicator
- [ ] The page links to the correct related pages
- [ ] No hardcoded colours outside the approved Tailwind tokens
- [ ] `autoComplete` attributes are set correctly on all inputs

---

## Logout Button (Dashboard only)

The dashboard needs a logout button that calls `signOut` from `next-auth/react`:

```tsx
'use client'
import { signOut } from 'next-auth/react'

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300
                 rounded-md hover:bg-gray-50 transition-colors duration-150"
    >
      Sign out
    </button>
  )
}
```

Place this in `src/components/auth/LogoutButton.tsx` and import into the dashboard page.