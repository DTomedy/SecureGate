import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ip = req.ip ?? '127.0.0.1'

  // 1. Rate Limiting Logic (Phase 5)
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

  // 2. Route Protection Logic
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/auth/signin', '/api/forgot-password'],
}
