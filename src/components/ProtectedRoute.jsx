import { Navigate, Outlet } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import { Skeleton } from './ui/Skeleton'

function AppSkeleton() {
  return (
    <div className="min-h-screen bg-surface-container flex flex-col">
      <div className="flex h-screen overflow-hidden">
        <aside className="w-56 bg-white border-r border-outline hidden md:flex flex-col shrink-0">
          <div className="px-4 h-14 flex items-center gap-3 border-b border-outline">
            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <div className="flex-1 px-2 py-3 space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-3.5 w-24 rounded" />
              </div>
            ))}
          </div>
          <div className="px-2 py-3 border-t border-outline">
            <div className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="w-7 h-7 rounded-full shrink-0" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3.5 w-20 rounded" />
                <Skeleton className="h-2.5 w-14 rounded" />
              </div>
            </div>
          </div>
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 border-b border-outline bg-white/95 flex items-center justify-between px-6">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-2.5 w-48 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-7 h-7 rounded-full" />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-surface rounded-card border border-outline p-5 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <Skeleton className="w-9 h-9 rounded-lg" />
                    <Skeleton className="w-10 h-4 rounded" />
                  </div>
                  <Skeleton className="h-7 w-3/4 mb-1 rounded" />
                  <Skeleton className="h-3.5 w-1/2 rounded" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-surface rounded-card border border-outline p-5 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 border-b border-outline/50 last:border-0">
                    <Skeleton className="h-4 flex-1 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <div className="bg-surface rounded-card border border-outline p-5 shadow-card">
                  <Skeleton className="h-4 w-32 rounded mb-4" />
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 mb-3">
                      <Skeleton className="h-2 flex-1 rounded-full" />
                      <Skeleton className="h-3 w-8 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function ProtectedRoute() {
  const { auth, loading, restoringSession, supabaseReady } = useBuilding()

  if (loading || restoringSession) {
    return <AppSkeleton />
  }

  if (!supabaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="max-w-md text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-on-surface-dim">cloud_off</span>
          <h1 className="text-xl font-bold text-on-surface">Supabase Not Configured</h1>
          <p className="text-sm text-on-surface-muted leading-relaxed">
            Create a Supabase project, run the migration SQL, then add your credentials to <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs font-mono">.env</code>.
          </p>
          <a href="/.env.example" className="inline-block px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors">
            View Setup Guide
          </a>
        </div>
      </div>
    )
  }

  if (!auth) return <Navigate to="/login" replace />
  return <Outlet />
}
