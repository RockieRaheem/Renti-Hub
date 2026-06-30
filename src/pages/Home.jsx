import { Link } from 'react-router-dom'

const features = [
  {
    icon: 'apartment',
    title: 'Properties & Shops',
    desc: 'Manage buildings, floors, and units from a single dashboard. Track occupancy, leases, and revenue across your entire portfolio.',
  },
  {
    icon: 'payments',
    title: 'Rent Collection',
    desc: 'Record payments, print receipts, and track balances. Support for cash, mobile money, and bank transfers.',
  },
  {
    icon: 'assignment',
    title: 'Tenants & Reports',
    desc: 'Complete tenant profiles with payment history. Generate financial reports and export to CSV.',
  },
]

const steps = [
  { step: '01', title: 'Set up your portfolio', desc: 'Add your buildings, floors, and units in minutes. Organize everything by location and type.' },
  { step: '02', title: 'Collect rent seamlessly', desc: 'Log payments, track arrears, and send receipts. Your tenants stay current, you stay informed.' },
  { step: '03', title: 'Review and report', desc: 'Generate financial reports, monitor occupancy trends, and make data-driven decisions.' },
]

export default function Home() {
  return (
    <div>
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0037b0] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-base">corporate_fare</span>
            </div>
            <span className="text-lg font-bold text-gray-900">RentiHub</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-medium text-white bg-[#0037b0] px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-white pt-32 pb-28 md:pt-40 md:pb-36">
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'radial-gradient(circle, #0037b0 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />
          <div className="max-w-6xl mx-auto px-6 relative">
            <div className="flex gap-8">
              <div className="w-1 hidden md:block shrink-0 rounded-full bg-gradient-to-b from-[#0037b0] via-[#0037b0] to-orange-500 opacity-30" />
              <div className="max-w-3xl">
                <p className="text-sm font-semibold text-[#0037b0] mb-5 tracking-widest uppercase">
                  Kampala&rsquo;s property platform
                </p>
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.05] tracking-tight mb-6">
                  Property management,<br />
                  <span className="text-[#0037b0]">built for clarity.</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-10 max-w-xl">
                  Digitize your rent collection, manage properties across Kampala, and keep every record organized without the spreadsheets.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/register" className="px-7 py-3.5 bg-[#0037b0] text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm">
                    Get Started Free
                  </Link>
                  <Link to="/dashboard" className="px-7 py-3.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all">
                    View Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-24 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-[#0037b0] tracking-widest uppercase mb-3">Everything you need</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">One platform, no clutter.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f) => (
                <div key={f.title} className="bg-white rounded-lg border border-gray-200 p-7 hover:border-gray-300 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-[#0037b0]/5 flex items-center justify-center mb-5">
                    <span className="material-symbols-outlined text-[#0037b0] text-xl">{f.icon}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0f172a] text-white py-20 md:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12 md:gap-16">
              {[
                { value: '124+', label: 'Properties Managed' },
                { value: 'UGX 4.2B', label: 'Total Portfolio Value' },
                { value: '98.2%', label: 'Collection Rate' },
              ].map((s) => (
                <div key={s.label} className="text-center md:text-left">
                  <p className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">{s.value}</p>
                  <p className="text-sm text-gray-400 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-24 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-[#0037b0] tracking-widest uppercase mb-3">How it works</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Three steps to get started.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {steps.map((s, i) => (
                <div key={s.step} className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-24 right-0 h-px bg-gray-200 -z-0" />
                  )}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[#0037b0] text-white flex items-center justify-center text-sm font-bold mb-6 relative z-10">
                      {s.step}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-20 md:py-24">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Ready to go digital?
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Join property managers who&rsquo;ve modernized their business. Start your free trial — no credit card required.
            </p>
            <Link to="/register" className="inline-flex px-7 py-3.5 bg-[#0037b0] text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm">
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0037b0] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xs">corporate_fare</span>
            </div>
            <span className="text-sm font-bold text-gray-900">RentiHub</span>
          </div>
          <p className="text-xs text-gray-400">&copy; 2026 RentiHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
