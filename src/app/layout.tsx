/**
 * Gall's Law — A complex system that works is invariably found to have evolved
 * from a simple system that worked. This bare root layout is the simplest
 * possible starting point. Every page, component, and style layer will build
 * on top of this without changing it.
 */
import type { Metadata } from 'next'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'SecureGate',
  description: 'Secure identity and access management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
