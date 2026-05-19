# SecureGate — Agent Context

## Project Overview
SecureGate is a standalone, production-ready authentication system built as a Next.js 14 app. It is not a full product — it has one job: identity and access management done correctly. Every decision must reflect the engineering principles in this document.

## Stack
| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js (Credentials provider) |
| Password | bcryptjs (salt rounds: 12) |
| Email | Resend + React Email |
| Validation | Zod (server-side only) |
| Rate Limiting | Upstash Redis (`@upstash/ratelimit`) |
| Styling | Tailwind CSS |
| Deployment | Vercel |
| Repo | GitHub |

## Build Phases — Execute in Order
The agent must follow these phases strictly. Do not begin a phase until the previous one is complete and verified.

1. **Phase 1** — Scaffold & Database Schema
2. **Phase 2** — Authentication Core with NextAuth
3. **Phase 3** — Email Verification Flow
4. **Phase 4** — Forgot Password Flow
5. **Phase 5** — Rate Limiting & Security Hardening
6. **Phase 6** — UI Polish & Deployment

## Rules Directory
All engineering rules live in `.agents/rules/`. The agent must load the relevant rule file before working in that domain:

| Rule File | Load When |
|---|---|
| `.agents/rules/architecture.md` | Scaffolding, routing, folder structure, Prisma schema |
| `.agents/rules/code-style.md` | Writing any TypeScript, components, or API routes |
| `.agents/rules/design-system.md` | Building any UI component, form, or page |
| `.agents/rules/security.md` | Touching auth, tokens, passwords, middleware, env vars, or error messages |

## Skills Directory
Reusable agent workflows live in `skills/`. Use these before building from scratch:

| Skill | Use When |
|---|---|
| `skills/component-builder/SKILL.md` | Building any UI page or form component |
| `skills/api-route-scaffolder/SKILL.md` | Creating any API route handler |
| `skills/db-migration-runner/SKILL.md` | Modifying the Prisma schema or running migrations |

## Non-Negotiable Constraints
- Never commit `.env.local` — it must be in `.gitignore` before the first push
- Never hardcode secrets, API keys, or database URLs in source code
- Never store plain-text passwords — always use `bcrypt.hash()` with salt rounds of 12
- Never confirm whether an email exists in any API response
- Never expose stack traces or internal error details in API responses
- All token expiry must be enforced server-side — never trust the client
- All form input must be validated with Zod on the server, regardless of client-side validation

## Submission Requirements
- App live on Vercel
- GitHub repo with `REFLECTION.md` in root (15 questions answered)
- No `.env.local` or secrets in the repo
- All env vars set in Vercel dashboard