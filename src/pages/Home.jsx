import { Link } from 'react-router-dom'

const features = [
  {
    icon: 'apartment', title: 'Your Building, Organized',
    desc: 'Manage floors, units, and occupancy from a single dashboard. Know exactly who is in which space at all times.',
  },
  {
    icon: 'payments', title: 'Rent Collection',
    desc: 'Record payments, print receipts, and track balances. Support for cash, mobile money, and bank transfers.',
  },
  {
    icon: 'assignment', title: 'Tenants & Reports',
    desc: 'Complete tenant profiles with payment history. Generate financial reports and export to CSV.',
  },
]

const stats = [
  { value: '24', suffix: '+', label: 'Units Managed' },
  { value: 'UGX 4.9', suffix: 'M', label: 'Monthly Revenue' },
  { value: '98.2', suffix: '%', label: 'Collection Rate' },
  { value: '3', suffix: 'yr', label: 'Average Lease' },
]

const steps = [
  { step: '01', title: 'Set up your portfolio', desc: 'Add your buildings, floors, and units in minutes. Organize everything by location and type.' },
  { step: '02', title: 'Collect rent seamlessly', desc: 'Log payments, track arrears, and send receipts. Your tenants stay current, you stay informed.' },
  { step: '03', title: 'Review and report', desc: 'Generate financial reports, monitor occupancy trends, and make data-driven decisions.' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-lg border-b border-outline">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-base">corporate_fare</span>
            </div>
            <span className="text-base font-bold text-on-surface">RentiHub</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-on-surface-muted hover:text-on-surface transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-medium text-white bg-primary px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-card">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="min-h-[85vh] flex items-center overflow-hidden relative bg-[#0f172a]">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
            <div className="max-w-3xl py-24">
              <div className="inline-flex items-center gap-2 bg-primary-50/10 text-primary-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-300 animate-pulse" />
                Kampala&rsquo;s property management platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
                Property management,{' '}
                <span className="text-primary-300">simplified</span>
                <span className="block text-white/60 text-lg sm:text-xl font-normal mt-4 max-w-2xl">
                  Everything you need to run your building — units, tenants, rent, and maintenance — in one place, without the spreadsheets.
                </span>
              </h1>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/register" className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary/30 inline-flex items-center gap-2">
                  Get Started Free
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
                <Link to="/dashboard" className="px-6 py-3 border border-white/20 text-white/80 text-sm font-bold rounded-xl hover:bg-white/5 hover:text-white transition-all inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">play_arrow</span>
                  View Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-surface-container">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Everything you need</p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-on-surface">Manage your portfolio in one place.</h2>
              <p className="text-on-surface-muted mt-3 max-w-lg mx-auto text-sm">From occupancy tracking to financial reports, RentiHub gives you complete control over your properties.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f) => (
                <div key={f.title} className="bg-surface rounded-xl border border-outline p-7 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-primary text-2xl">{f.icon}</span>
                  </div>
                  <h3 className="text-base font-bold text-on-surface mb-2">{f.title}</h3>
                  <p className="text-sm text-on-surface-muted leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-1 tracking-tight">
                    {s.value}<span className="text-primary-200">{s.suffix}</span>
                  </p>
                  <p className="text-xs text-primary-200 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">How it works</p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-on-surface">Three steps to get started.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-8 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px bg-outline" />
              {steps.map((s, i) => (
                <div key={s.step} className="flex flex-col items-center text-center relative">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-base font-bold mb-5 relative z-10 shadow-lg shadow-primary/20">
                    {s.step}
                  </div>
                  <h3 className="text-base font-bold text-on-surface mb-2">{s.title}</h3>
                  <p className="text-sm text-on-surface-muted leading-relaxed max-w-xs">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface-container py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-on-surface mb-3">
              Ready to go digital?
            </h2>
            <p className="text-on-surface-muted mb-8 max-w-md mx-auto leading-relaxed text-sm">
              Join property managers who&rsquo;ve modernized their business. Start your free trial — no credit card required.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary/30">
                Get Started Free
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 border border-outline text-on-surface text-sm font-bold rounded-xl hover:bg-surface-container transition-all">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xs">corporate_fare</span>
            </div>
            <span className="text-sm font-bold text-on-surface">RentiHub</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-on-surface-muted">
            <a href="#" className="hover:text-on-surface transition-colors">Privacy</a>
            <a href="#" className="hover:text-on-surface transition-colors">Terms</a>
            <a href="#" className="hover:text-on-surface transition-colors">Contact</a>
          </div>
          <p className="text-xs text-on-surface-dim">&copy; 2026 RentiHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
