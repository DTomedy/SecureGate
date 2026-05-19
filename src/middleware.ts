import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Upstash Rate Limiting if credentials exist
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, '600 s'), // 5 attempts per 10 minutes (600s)
        analytics: true,
      })
    : null

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl
    const ip = req.ip ?? '127.0.0.1'

    // Rate Limiting Logic (Phase 5)
    if (
      (pathname === '/api/auth/signin' || pathname === '/api/forgot-password') &&
      req.method === 'POST'
    ) {
      if (ratelimit) {
        try {
          const { success } = await ratelimit.limit(`rate_limit:${pathname}:${ip}`)
          if (!success) {
            return new NextResponse(
              JSON.stringify({ error: 'Too many attempts. Please try again in 10 minutes.' }),
              { status: 429, headers: { 'content-type': 'application/json' } }
            )
          }
        } catch (error) {
          console.error('[RATE_LIMIT_ERROR]', error)
          // Fail open to avoid blocking legitimate users if Upstash goes down
        }
      }
    }

    // NextAuth handles route protection for dashboard path
    if (pathname.startsWith('/dashboard')) {
      const token = req.nextauth.token
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // Protect /dashboard path
        if (pathname.startsWith('/dashboard')) {
          return !!token
        }
        // Allow public access to API signin/forgot-password so rate limiting can run
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/api/auth/signin', '/api/forgot-password'],
}
