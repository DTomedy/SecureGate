---
trigger: always_on
---

# Rule: Architecture

Apply this rule when scaffolding the project, defining folder structure, creating Prisma models, setting up routing, or configuring NextAuth and middleware.

---

## Folder Structure

```
securegate/
├── .agents/
│   └── rules/
│       ├── architecture.md
│       ├── code-style.md
│       ├── design-system.md
│       └── security.md
├── skills/
│   ├── component-builder/SKILL.md
│   ├── api-route-scaffolder/SKILL.md
│   └── db-migration-runner/SKILL.md
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── verify-email/[token]/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/[token]/page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── verify-email/route.ts
│   │   │   ├── forgot-password/route.ts
│   │   │   └── reset-password/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/          ← reusable primitives (Input, Button, etc.)
│   │   └── auth/        ← auth-specific forms and wrappers
│   ├── lib/
│   │   ├── auth.ts      ← NextAuth config (authOptions)
│   │   ├── db.ts        ← Prisma client singleton
│   │   ├── email.ts     ← Resend email sending helpers
│   │   ├── tokens.ts    ← token generation and validation helpers
│   │   └── validations/ ← Zod schemas
│   │       ├── auth.ts
│   │       └── email.ts
│   ├── middleware.ts     ← NextAuth + rate limiting middleware
│   └── types/
│       └── next-auth.d.ts
├── emails/              ← React Email templates
│   ├── verification.tsx
│   └── reset-password.tsx
├── .env.local           ← NEVER commit this
├── .gitignore
├── next.config.js
├── AGENTS.md
└── REFLECTION.md
```

---

## Prisma Schema

The schema must define exactly these three models. Do not add or remove fields without a clear reason documented in a comment.

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model PasswordResetToken {
  email   String
  token   String   @unique
  expires DateTime

  @@unique([email, token])
}
```

**Key notes:**
- `password` stores a bcrypt hash — never plain text
- `emailVerified` is `null` until the user clicks the verification link
- `VerificationToken.expires` must be set to `15 minutes` from creation
- `PasswordResetToken.expires` must be set to `1 hour` from creation
- After a token is used, delete it from the database immediately

---

## Prisma Client Singleton

Always import the Prisma client from `src/lib/db.ts`. Never instantiate `new PrismaClient()` directly in route handlers.

```ts
// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## NextAuth Configuration

- Place all `authOptions` in `src/lib/auth.ts` — import into the route handler, do not define inline
- Use the **Credentials provider** only — no social login (YAGNI)
- Session strategy: **JWT** — no database session table needed for this scope
- Always extend the session type in `src/types/next-auth.d.ts` to include `id` and `emailVerified`

```ts
// src/types/next-auth.d.ts
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      emailVerified: Date | null
    }
  }
}
```

---

## Middleware

`src/middleware.ts` handles two responsibilities:
1. **Route protection** — redirect unauthenticated users from `/dashboard` to `/login`
2. **Rate limiting** — applied to `POST /api/auth/signin` and `POST /api/forgot-password`

These must be in one file. Do not split middleware across multiple files.

```ts
// Matcher — only run middleware on these paths
export const config = {
  matcher: ['/dashboard/:path*', '/api/auth/signin', '/api/forgot-password'],
}
```

---

## next.config.js — Security Headers

These headers are required for Phase 5. Add them before deployment.

```js
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}
```

---

## Environment Variables

Required in `.env.local` and in Vercel dashboard:

```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
RESEND_API_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

**Rules:**
- Add `.env.local` to `.gitignore` before the first `git push`
- Never reference these values inline in source code — always via `process.env.VAR_NAME`
- Verify all variables are present in Vercel before deploying

---

## Gall's Law — Phase Dependency Order

Each phase depends on the previous one being stable. The agent must not proceed to a later phase if an earlier phase is broken. A broken Phase 2 on a shaky Phase 1 is worse than a solid Phase 1 alone.

Phase completion checklist before advancing:
- [ ] Phase 1: Tables exist in DB, initial commit pushed to GitHub
- [ ] Phase 2: Sign up works, password in DB is a bcrypt hash, session is created on login
- [ ] Phase 3: Verification email sends, token link marks user as verified in DB
- [ ] Phase 4: Reset email sends, new password saves as a hash, old token is deleted
- [ ] Phase 5: Rate limit blocks on 6th attempt, no email-existence leakage in any response
- [ ] Phase 6: Live Vercel URL works end-to-end in incognito, no `.env.local` in repo