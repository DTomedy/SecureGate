'use client'

import { signOut } from 'next-auth/react'

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300
                 rounded-md hover:bg-gray-50 transition-colors duration-150"
    >
      Sign out
    </button>
  )
}
