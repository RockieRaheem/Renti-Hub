import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useBuilding()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPw) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setTimeout(() => {
      if (register(name, email, password)) {
        navigate('/dashboard')
      } else {
        setError('An account with this email already exists')
        setLoading(false)
      }
    }, 400)
  }

  const pwStrength = password.length >= 8 ? 'Strong' : password.length >= 6 ? 'Good' : ''
  const pwColor = password.length >= 8 ? 'bg-status-paid' : password.length >= 6 ? 'bg-status-partial' : ''

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
              <h1 className="text-xl font-bold text-on-surface">Create your account</h1>
              <p className="text-sm text-on-surface-muted mt-1">Start managing properties in minutes</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Full name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3.5 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="James Kato" required autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3.5 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="manager@rentihub.com" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 px-3.5 pr-10 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Create a strong password" required />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-dim hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined text-lg">{showPw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {password && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className={`h-full ${pwColor} rounded-full transition-all`} style={{ width: `${(password.length / 12) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-medium text-on-surface-muted">{pwStrength}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Confirm password</label>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                  className="w-full h-10 px-3.5 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Re-enter your password" required />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-status-unpaid bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full h-10 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2 shadow-card">
                {loading ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-on-surface-muted mt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-primary-600">Sign in</Link>
            </p>
          </div>

          <p className="text-xs text-on-surface-dim text-center mt-6">
            By creating an account, you agree to our{' '}
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
          <p className="text-white text-lg font-medium leading-relaxed">
            Join <span className="font-bold">124+ property managers</span> who&rsquo;ve already digitized their rent collection and portfolio management.
          </p>
          <div className="space-y-3">
            {[
              'Add buildings, floors, and shop units',
              'Track rent payments and arrears',
              'Generate financial reports instantly',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-sm">check</span>
                </div>
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
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
