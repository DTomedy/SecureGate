---
trigger: always_on
---

# Rule: Design System

Apply this rule when building any UI page, form, or component in SecureGate. Every screen must be clean, accessible, consistent, and production-usable.

---

## Design Principles (from the task)

1. **Accessible** — every input has a visible label, not just a placeholder
2. **Real error messages** — never "Something went wrong." Tell the user what is wrong and what to do
3. **Loading states** — every form submission must have a loading state that disables the button and shows feedback
4. **Consistent** — spacing, colour, font size, and border radius must be uniform across all pages
5. **Clean** — no decorative clutter, no unnecessary elements

---

## Tailwind CSS — Core Tokens

Use only these values. Do not introduce custom colours or arbitrary values unless required.

```
Background:   bg-white / bg-gray-50 / bg-gray-100
Text:         text-gray-900 (body) / text-gray-500 (muted) / text-white (on dark)
Primary:      bg-black text-white (buttons, links)
Error:        text-red-600 / border-red-500 / bg-red-50
Success:      text-green-600 / bg-green-50
Border:       border-gray-300 (default) / border-gray-900 (focus)
Radius:       rounded-md (inputs, buttons) / rounded-lg (cards)
Shadow:       shadow-sm (cards)
```

---

## Page Layout

All auth pages share the same centred layout:

```tsx
// Pattern for every auth page
export default function AuthPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Page Title</h1>
        <p className="text-sm text-gray-500 mb-6">Supporting description</p>
        {/* Form here */}
      </div>
    </main>
  )
}
```

---

## Form Fields

Every input field must follow this pattern exactly:

```tsx
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
    placeholder="you@example.com"
    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
               focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
               disabled:opacity-50 disabled:cursor-not-allowed"
  />
  {error && (
    <p className="text-xs text-red-600" role="alert">{error}</p>
  )}
</div>
```

**Rules:**
- `htmlFor` on every `<label>` must match the `id` on the input
- `autoComplete` must be set correctly (`email`, `current-password`, `new-password`, `name`)
- Error messages go below the input, not above it
- Use `role="alert"` on error messages so screen readers announce them

---

## Submit Button

```tsx
<button
  type="submit"
  disabled={isLoading}
  className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-medium
             rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2
             focus:ring-gray-900 focus:ring-offset-2
             disabled:opacity-50 disabled:cursor-not-allowed
             transition-colors duration-150"
>
  {isLoading ? 'Loading...' : 'Button Label'}
</button>
```

**Rules:**
- Always `disabled` when `isLoading` is true
- Label must describe the action: "Create account", "Sign in", "Send reset link" — never just "Submit"
- Show a text loading indicator minimum — a spinner is optional but not required

---

## Password Strength Indicator

Required on the Sign Up page and the Reset Password page. Evaluate based on:

| Score | Label | Colour | Criteria |
|---|---|---|---|
| Weak | `text-red-600` | `bg-red-500` | Length < 8 OR no variety |
| Fair | `text-yellow-600` | `bg-yellow-500` | Length ≥ 8, 1–2 of: uppercase, number, special |
| Strong | `text-green-600` | `bg-green-500` | Length ≥ 8 AND uppercase AND number AND special char |

```tsx
function getPasswordStrength(password: string): 'weak' | 'fair' | 'strong' {
  if (password.length < 8) return 'weak'
  const checks = [
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ]
  const passed = checks.filter(Boolean).length
  if (passed === 3) return 'strong'
  if (passed >= 1) return 'fair'
  return 'weak'
}
```

Render as a bar below the password field:

```tsx
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
```

---

## Pages Required

| Route | Page Purpose |
|---|---|
| `/signup` | Sign up form (name, email, password + strength indicator) |
| `/login` | Login form (email, password, error message) |
| `/verify-email/[token]` | Token validation result (success or error + resend option) |
| `/forgot-password` | Email input form |
| `/reset-password/[token]` | New password form (password + strength indicator) |
| `/dashboard` | Protected page — shows user info, logout button |

---

## Error Message Wording

| Situation | Message to Show |
|---|---|
| Wrong email or password | "Invalid email or password." (never specify which) |
| Email not verified | "Please verify your email before signing in." |
| Verification token expired | "This link has expired. Request a new verification email." |
| Reset token expired | "This link has expired. Request a new password reset." |
| Token not found | "Invalid or already used link." |
| Rate limited | "Too many attempts. Please try again in 10 minutes." |
| Empty required field | "[Field name] is required." |
| Invalid email format | "Please enter a valid email address." |
| Password too weak | "Password must be at least 8 characters and include an uppercase letter, number, and special character." |

---

## Navigation Links

Each auth page must link to the related page:
- Login page → "Don't have an account? Sign up"
- Sign up page → "Already have an account? Sign in"
- Login page → "Forgot your password?"
- Forgot password page → "Back to sign in"

```tsx
<p className="text-sm text-center text-gray-500 mt-4">
  Already have an account?{' '}
  <a href="/login" className="text-gray-900 font-medium hover:underline">
    Sign in
  </a>
</p>
```