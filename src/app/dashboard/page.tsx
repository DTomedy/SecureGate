import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/auth/LogoutButton'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const { user } = session

  return (
    <main className="min-h-screen bg-brand-lightTint flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-brand-slate">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {user.name || 'User'}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="flex flex-col gap-4 border-t border-gray-200 pt-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email address</span>
            <span className="text-sm text-brand-slate font-medium">{user.email}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account ID</span>
            <span className="text-sm text-brand-slate font-mono bg-gray-50 p-2 rounded border border-gray-100 break-all">
              {user.id}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Verification status</span>
            <span className="text-sm text-brand-slate flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Verified
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
