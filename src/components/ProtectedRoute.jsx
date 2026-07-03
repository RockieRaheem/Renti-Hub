import { Navigate, Outlet } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'

export default function ProtectedRoute() {
  const { auth, loading, restoringSession, supabaseReady } = useBuilding()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-on-surface-muted">Loading your data...</p>
        </div>
      </div>
    )
  }

  if (restoringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-on-surface-muted">Restoring your session...</p>
          <p className="text-xs text-on-surface-dim">Please wait while we reconnect</p>
        </div>
      </div>
    )
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
