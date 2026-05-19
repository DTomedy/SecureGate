---
trigger: always_on
---

# Rule: Code Style

Apply this rule when writing any TypeScript, React components, API route handlers, or utility functions across the SecureGate codebase.

---

## TypeScript

- Strict mode is on — `"strict": true` in `tsconfig.json`. No `any` types.
- Always type function parameters and return values explicitly
- Use `type` for object shapes, `interface` only when extending
- Shared types (e.g. session shape, token shape) go in `src/types/` — do not duplicate
- Never use `// @ts-ignore` or `// @ts-expect-error` without a written explanation

```ts
// ✅ Correct
async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

// ❌ Wrong — implicit any, no return type
async function hashPassword(plain) {
  return bcrypt.hash(plain, 12)
}
```

---

## Zod Validation

All server-side input validation uses Zod. Schemas live in `src/lib/validations/`.

```ts
// src/lib/validations/auth.ts
import { z } from 'zod'

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
})
```

**Rules:**
- Always parse with `schema.safeParse()` in route handlers — never `.parse()` (throws unhandled)
- If validation fails, return `400` with the Zod error messages — never a generic string
- Never rely on client-side validation alone — always validate on the server

---

## API Route Handlers (App Router)

All routes use the Next.js 14 App Router `route.ts` convention.

```ts
// Pattern for every POST route handler
import { NextRequest, NextResponse } from 'next/server'
import { signUpSchema } from '@/lib/validations/auth'
import { prisma } from '@/lib/db'

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

    // ... business logic here

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    // Never expose the actual error to the client
    console.error('[ROUTE_ERROR]', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
```

**Rules:**
- Every route handler must have a `try/catch`
- Log errors server-side with a `[ROUTE_NAME]` prefix — never return them to the client
- Return consistent JSON shapes: `{ error: string }` for failures, `{ success: true, data?: ... }` for success
- Always return the correct HTTP status code (400 for validation, 401 for auth, 404 for not found, 429 for rate limit, 500 for server error)

---

## Imports

- Use the `@/` path alias — never relative paths like `../../lib/db`
- Order: external packages → internal `@/lib` → internal `@/components` → types
- No unused imports — the TypeScript compiler will flag them

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files (components) | PascalCase | `LoginForm.tsx` |
| Files (utils/routes) | kebab-case | `forgot-password/route.ts` |
| Functions | camelCase | `generateVerificationToken` |
| Variables | camelCase | `hashedPassword` |
| Types/Interfaces | PascalCase | `SessionUser` |
| Zod schemas | camelCase + Schema suffix | `signUpSchema` |
| Constants | UPPER_SNAKE_CASE | `SALT_ROUNDS` |

---

## Constants

Magic numbers and repeated strings must be extracted to named constants.

```ts
// src/lib/constants.ts
export const SALT_ROUNDS = 12
export const VERIFICATION_TOKEN_EXPIRY_MINUTES = 15
export const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1
export const RATE_LIMIT_MAX_ATTEMPTS = 5
export const RATE_LIMIT_WINDOW_SECONDS = 600 // 10 minutes
```

---

## No Code Duplication

- If the same logic appears in two places, extract it to `src/lib/`
- Token generation lives in `src/lib/tokens.ts` — import it everywhere, never re-implement it
- Email sending logic lives in `src/lib/email.ts` — one function per email type

```ts
// src/lib/tokens.ts
import crypto from 'crypto'

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function getVerificationTokenExpiry(): Date {
  return new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
}

export function getPasswordResetTokenExpiry(): Date {
  return new Date(Date.now() + 60 * 60 * 1000) // 1 hour
}
```

---

## Boy Scout Rule

Leave every file you touch cleaner than you found it. If you open a file to add a feature and notice:
- An unused import → remove it
- A duplicated function → extract it
- A magic number → name it
- A vague variable name → rename it

Fix it before moving on. Document it in `REFLECTION.md` Q6.