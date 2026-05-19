# SecureGate Engineering Reflection

This document contains architectural reflections and answers to 15 questions concerning the security, code quality, and engineering principles used during the development of SecureGate.

---

### Q1: Architecture & Tech Stack
**Question:** Why was Next.js 14 App Router selected, and how does the folder structure support separation of concerns?
**Answer:** Next.js 14 App Router was chosen because it provides a unified, production-ready framework with native support for React Server Components (RSC) and API routing in a single repository. The directory structure divides responsibilities clearly: routes and UI pages live in `src/app/`, shared API utilities and logic (database, tokens, emails, validation schemas) live in `src/lib/`, UI components (like the logout button and forms) live in `src/components/`, and TypeScript types reside in `src/types/`. This separation ensures business logic remains distinct from UI concerns.

### Q2: Database Client Lifecycle
**Question:** How does the Prisma client singleton prevent connection pooling leaks during hot-reloads in development?
**Answer:** In development environments, Next.js hot-reloads files upon modification. If `new PrismaClient()` were instantiated directly in routes, a new database connection would be opened on every reload, rapidly exhausting the database connection pool. The singleton pattern implemented in `src/lib/db.ts` stores the client instance on the Node.js `globalThis` object, ensuring that the same client is reused across reloads, preventing connection leaks.

### Q3: DB Schema Structure
**Question:** What are the purposes of the three database models (`User`, `VerificationToken`, `PasswordResetToken`), and what constraints are applied to them?
**Answer:** 
* **User:** Stores identity and auth credentials. It features a unique index on `email` and nullable `emailVerified` to track verification status.
* **VerificationToken:** Used during the email verification process. It enforces uniqueness at the database level using a compound unique constraint on `[identifier, token]` and a unique index on `token`.
* **PasswordResetToken:** Used during the forgot-password flow. It enforces uniqueness on `token` and is uniquely indexed on `[email, token]` to prevent concurrent token abuse.

### Q4: Secure Password Hashing
**Question:** What cryptographic algorithm and configuration (e.g. salt rounds) did you choose for password hashing, and why?
**Answer:** We used `bcryptjs` for password hashing with the salt rounds configuration set to exactly `12`. Bcrypt is an industry-standard, slow hashing function designed specifically for passwords, making it highly resilient against brute-force and dictionary attacks. Setting the salt rounds to 12 offers a strong balance between cryptographic safety (exponentially higher compute required for hash verification) and low response latency (avoiding CPU bottlenecking).

### Q5: Token Generation Mechanism
**Question:** How are security tokens generated to ensure they are cryptographically secure and unguessable?
**Answer:** Security tokens are generated using Node.js's native `crypto.randomBytes(32).toString('hex')` via helper functions in `src/lib/tokens.ts`. This utilizes the operating system's cryptographically secure pseudo-random number generator (CSPRNG), producing a high-entropy 64-character hexadecimal string that is virtually impossible for an attacker to predict or brute-force.

### Q6: Boy Scout Rule & Code Cleanup
**Question:** How was the Boy Scout Rule applied during development, and what files were refactored or cleaned up?
**Answer:** The Boy Scout Rule was applied to clean and harden existing utility files:
* In `src/lib/email.ts`, the Resend client initialization was refactored to use a lazy-initialization function (`getResendClient`) with a fallback dummy key. This prevents Next.js static analysis/compilation from throwing "Missing API key" errors during production build pipelines when env vars aren't present.
* In `src/app/layout.tsx`, the global stylesheet (`src/app/globals.css`) was imported and configured so that tailwind utility classes could load properly.
* In `src/app/api/verify-email/route.ts`, the POST handler was updated to securely process both token verification and resend requests in a single, robust transaction layer rather than creating redundant endpoints.

### Q7: Email Verification Security
**Question:** What is the lifecycle and expiry control for email verification tokens, and how are expired/used tokens handled?
**Answer:** Verification tokens have an expiry window set to exactly 15 minutes. To enforce this structurally (per Murphy's Law), the check compares the database record's `expires` field with `new Date()` at evaluation time rather than trusting the client's clock. Once a token is successfully verified, or when a new verification request is initiated, any old or used tokens for that user identifier are deleted immediately to avoid database pollution and replay attacks.

### Q8: Password Recovery Security
**Question:** What is the lifecycle and expiry control for password reset tokens, and how do we prevent stale tokens?
**Answer:** Password reset tokens expire exactly 1 hour from creation. To prevent stale tokens, any existing reset tokens associated with the user's email are explicitly deleted from the database using a `deleteMany` transaction before generating and saving a new reset token. Once the reset action succeeds, the token is deleted immediately to prevent reuse.

### Q9: Preventing Email Enumeration
**Question:** How does the application avoid disclosing whether an email address exists in the database during signup, login, and forgot password flows?
**Answer:** To prevent email enumeration:
* In the login credentials authorize flow, if a user is not found or a password is incorrect, the server returns the generic message `"Invalid email or password."` without specifying which input failed.
* In the forgot password flow (`/api/forgot-password`), the endpoint always returns `200 OK` with a success message indicating that a reset link has been sent if the account exists, regardless of whether the email was found in the database.
* In the resend verification flow, a successful response is always returned regardless of whether the user exists or is already verified.

### Q10: Error Telemetry & Leakage Prevention
**Question:** How are server errors, database traces, and detailed exceptions prevented from leaking to the client?
**Answer:** Every API route handler is wrapped in a `try/catch` block. When an error is caught, the full stack trace and internal error message are logged server-side with a prefix (e.g. `[REGISTER_ERROR]`) for developer auditing. The response returned to the client is sanitized to a generic, friendly string (e.g. `"Something went wrong. Please try again."`) and a generic HTTP 500 status code, hiding database configuration details and system traces.

### Q11: Inbound Validation
**Question:** How does the server validate inputs, and why is client-side validation alone insufficient?
**Answer:** All inbound request payloads are parsed server-side using strict Zod schemas (`signUpSchema`, `loginSchema`, etc.) via `safeParse()`. Client-side validation is a user experience convenience, not a security boundary; it can be bypassed completely by attackers using simple terminal commands or tools like Postman. Server-side validation guarantees that only clean, properly formatted, and safe payloads enter the application logic and database layer.

### Q12: API Rate Limiting
**Question:** How is rate limiting implemented, and what paths and methods does it protect to prevent brute-force attacks?
**Answer:** Rate limiting is implemented at the middleware level (`src/middleware.ts`) using `@upstash/ratelimit` and Upstash Redis. It monitors incoming requests based on the user's IP address. It is strictly configured to restrict POST requests to `5 attempts per 10 minutes` (600s sliding window) on endpoints prone to brute-force attacks: `/api/auth/signin` (NextAuth credentials sign-in) and `/api/forgot-password`. If exceeded, it returns a 429 status code with the message `"Too many attempts. Please try again in 10 minutes."`

### Q13: HTTP Security Headers
**Question:** What HTTP headers were added to `next.config.mjs` to harden the application, and what attacks do they prevent?
**Answer:** The following security headers are set globally:
* `X-Frame-Options: DENY`: Prevents clickjacking attacks by ensuring the application cannot be embedded in an iframe.
* `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing vulnerabilities, forcing browsers to respect the declared Content-Type.
* `Referrer-Policy: strict-origin-when-cross-origin`: Restricts referrer information sent along with cross-origin requests to preserve user privacy.

### Q14: UI/UX Principles & Accessibility
**Question:** How were the design tokens and principles applied to ensure the UI is clean, responsive, and accessible?
**Answer:** All forms implement explicit `<label>` tags with matching `htmlFor`/`id` bindings for screen-reader accessibility. Design decisions rely strictly on standard Tailwind classes (like `bg-white`, `border-gray-300`, and `rounded-md`) combined with brand design tokens (e.g. `bg-brand-primary` for action buttons, `bg-brand-lightTint` for layouts). Form submissions disable buttons and provide loading states (e.g. `"Signing in..."`) to prevent double-submit actions. Error displays use `role="alert"` for automated reader announcements.

### Q15: Gall's Law & Murphy's Law Application
**Question:** How did Gall's Law and Murphy's Law guide the design and incremental stabilization of this authentication system?
**Answer:**
* **Gall's Law:** We started with simple, working core structures (database schemas, auth configuration, token generation) and incrementally layered security controls (verification, recovery, rate limiting) on top, ensuring each layer was functional and tested before continuing.
* **Murphy's Law:** We assumed every network action and database transaction could fail. We built explicit check-time validations (like checking verification token expiration during processing) and fallback mechanisms (like fail-open middleware behavior when Redis is unavailable) to handle edge cases gracefully.
