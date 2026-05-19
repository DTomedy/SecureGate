import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { loginSchema } from '@/lib/validations/auth'

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required.')
        }

        const result = loginSchema.safeParse(credentials)
        if (!result.success) {
          throw new Error('Invalid email or password.')
        }

        const { email, password } = result.data

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          // Postel's Law / Security by Design — do not specify which is incorrect
          throw new Error('Invalid email or password.')
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
          throw new Error('Invalid email or password.')
        }

        // Murphy's Law / Design System — check if verified
        if (!user.emailVerified) {
          throw new Error('Please verify your email before signing in.')
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.emailVerified = user.emailVerified
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.emailVerified = token.emailVerified as Date | null
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
