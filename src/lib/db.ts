/**
 * Gall's Law — A complex system that works is invariably found to have evolved
 * from a simple system that worked. This singleton is the simplest possible
 * database abstraction: one client, reused across hot reloads, no decorators,
 * no factory pattern. Every query in the app flows through this single export.
 */
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
