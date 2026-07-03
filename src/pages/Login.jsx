import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import { isSupabaseConfigured } from '../lib/queries'
import { sanitizeString } from '../utils/sanitize'

const configured = isSupabaseConfigured()

export default function Login() {
  const navigate = useNavigate()
  const { login } = useBuilding()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const err = await login(sanitizeString(email), password)
      if (err) {
        setError(err)
      } else {
        navigate('/dashboard')
      }
    } catch (ex) {
      setError(ex.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-surface-container">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-base">corporate_fare</span>
            </div>
            <span className="text-base font-bold text-on-surface">RentiHub</span>
          </div>

          <div className="bg-surface rounded-xl border border-outline p-7 shadow-card">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-on-surface">Welcome back</h1>
              <p className="text-sm text-on-surface-muted mt-1">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Email address</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3.5 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="manager@rentihub.com" required autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 px-3.5 pr-10 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Enter your password" required
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-dim hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined text-lg">{showPw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {!configured && (
                <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
                  <span className="material-symbols-outlined text-base shrink-0 mt-0.5">construction</span>
                  <p className="leading-relaxed">
                    Supabase not configured. Set <code className="bg-amber-100 px-1 rounded text-xs font-mono">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 rounded text-xs font-mono">VITE_SUPABASE_ANON_KEY</code> in <code className="bg-amber-100 px-1 rounded text-xs font-mono">.env</code>.
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-status-unpaid bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full h-10 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2 shadow-card">
                {loading ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-on-surface-muted mt-6">
              Don&rsquo;t have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary-600">Create one</Link>
            </p>
          </div>

          <p className="text-xs text-on-surface-dim text-center mt-6">
            By signing in, you agree to our{' '}
            <a href="#" className="underline hover:text-on-surface">Terms</a> and{' '}
            <a href="#" className="underline hover:text-on-surface">Privacy Policy</a>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex w-[440px] bg-primary p-10 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">corporate_fare</span>
            </div>
            <span className="text-sm font-bold text-white/90">RentiHub</span>
          </div>
        </div>
        <div className="relative space-y-6">
          <blockquote className="text-white text-lg font-medium leading-relaxed">
            &ldquo;RentiHub transformed how we manage our portfolio. We went from scattered spreadsheets to a single source of truth.&rdquo;
          </blockquote>
          <div>
            <p className="text-white font-semibold text-sm">James Kato</p>
            <p className="text-primary-200 text-xs">Portfolio Manager, Kampala Properties Ltd</p>
          </div>
          <div className="flex gap-8 pt-6 border-t border-white/15">
            {[
              { value: '124+', label: 'Properties' },
              { value: 'UGX 4.2B', label: 'Portfolio Value' },
              { value: '98.2%', label: 'Collection Rate' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-white font-bold text-lg">{s.value}</p>
                <p className="text-primary-200 text-[11px]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
