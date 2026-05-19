---
trigger: always_on
---

# SecureGate Security Policies

## Input Sanitation & Validation
- [cite_start]Validate all network boundaries (API inbound objects, form submissions) using strict **Zod** schemas[cite: 49, 86].
- [cite_start]Client inputs must be treated as inherently hostile; always sanitize data structures[cite: 42].

## Cryptography & Token Generation
- [cite_start]**Passwords:** Hash credentials during registration via `bcryptjs` using a salt round configuration set exactly to **12**[cite: 38, 86]. [cite_start]Never log or view plain text strings[cite: 90].
- [cite_start]**Tokens:** Generate secure, unguessable strings via `crypto.randomBytes(32).toString('hex')`[cite: 99].
- [cite_start]**Expiration Controls:** Enforce expiration lifecycles at the database/query layer: 15 minutes max for email verifications [cite: 100][cite_start], 1 hour max for password reset requests[cite: 109]. [cite_start]Expired or consumed tokens must be deleted immediately[cite: 102, 112].

## Infrastructure Protection
- [cite_start]**API Rate Limiting:** Enforce strict rate-limiting layers on `POST /api/auth/signin` and the password reset endpoint via Upstash Redis or custom middleware (strictly cap at 5 attempts per IP per 10 minutes)[cite: 49, 118, 119].
- [cite_start]**HTTP Hardening:** Configure `next.config.js` to deliver strong HTTP security headers: `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`[cite: 122].
- **Leakage Prevention:** Suppress explicit system details from error exceptions. [cite_start]Never return descriptive validation flags, system traces, or explicit email existence verifications to the frontend client[cite: 30, 113, 120].