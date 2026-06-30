import { Link } from 'react-router-dom'

const features = [
  {
    icon: 'apartment',
    title: 'Properties & Shops',
    desc: 'Manage buildings, floors, and units from a single dashboard. Track occupancy, leases, and revenue across your entire portfolio.',
    color: 'bg-blue-600',
  },
  {
    icon: 'payments',
    title: 'Rent Collection',
    desc: 'Record payments, print receipts, and track balances. Support for cash, mobile money, and bank transfers.',
    color: 'bg-orange-500',
  },
  {
    icon: 'assignment',
    title: 'Tenants & Reports',
    desc: 'Complete tenant profiles with payment history. Generate financial reports and export to CSV.',
    color: 'bg-blue-600',
  },
]

const buildings = [
  { h: 'h-40', w: 'w-14', color: 'bg-blue-600', offset: 'mt-8' },
  { h: 'h-56', w: 'w-20', color: 'bg-blue-500', offset: 'mt-0' },
  { h: 'h-32', w: 'w-12', color: 'bg-orange-500', offset: 'mt-16' },
  { h: 'h-48', w: 'w-16', color: 'bg-blue-700', offset: 'mt-4' },
  { h: 'h-28', w: 'w-10', color: 'bg-blue-400', offset: 'mt-20' },
  { h: 'h-36', w: 'w-14', color: 'bg-blue-500', offset: 'mt-12' },
  { h: 'h-52', w: 'w-16', color: 'bg-blue-600', offset: 'mt-0' },
  { h: 'h-24', w: 'w-10', color: 'bg-orange-500', offset: 'mt-24' },
  { h: 'h-44', w: 'w-12', color: 'bg-blue-700', offset: 'mt-6' },
]

export default function Home() {
  return (
    <div>
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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
        <section className="min-h-[90vh] flex items-center bg-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center py-20">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-[#0037b0] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  Kampala&rsquo;s property platform
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-gray-900 leading-[0.95] tracking-tight mb-6">
                  Property
                  <br />
                  <span className="text-[#0037b0]">management,</span>
                  <br />
                  <span className="bg-[#0037b0] text-white px-3 inline-block mt-1">simplified.</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-400 leading-relaxed mb-8 max-w-lg">
                  Digitize your rent collection, manage properties across Kampala, and keep every record organized — without the spreadsheets.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/register" className="px-7 py-3.5 bg-[#0037b0] text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                    Get Started Free
                  </Link>
                  <Link to="/dashboard" className="px-7 py-3.5 border-2 border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all">
                    View Dashboard
                  </Link>
                </div>
              </div>

              <div className="hidden lg:flex items-end justify-center gap-3 h-[500px] relative">
                <div className="flex items-end gap-3 h-full">
                  {buildings.map((b, i) => (
                    <div
                      key={i}
                      className={`${b.h} ${b.w} ${b.color} ${b.offset} rounded-t-lg transition-all duration-500 hover:scale-105 hover:opacity-90 cursor-default`}
                      style={{
                        boxShadow: i % 3 === 0 ? '4px 0 0 rgba(0,0,0,0.06)' : 'none',
                      }}
                    />
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-full mx-8" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-24 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-[#0037b0] tracking-widest uppercase mb-3">Everything you need</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">Manage your portfolio in one place.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f) => (
                <div key={f.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`h-1.5 ${f.color}`} />
                  <div className="p-7">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-5 border border-gray-100">
                      <span className="material-symbols-outlined text-[#0037b0] text-2xl">{f.icon}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#0f172a] text-white py-20 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="grid md:grid-cols-3 gap-12 md:gap-16">
              {[
                { value: '124+', label: 'Properties Managed' },
                { value: 'UGX 4.2B', label: 'Total Portfolio Value' },
                { value: '98.2%', label: 'Collection Rate' },
              ].map((s) => (
                <div key={s.label} className="text-center md:text-left">
                  <p className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 tracking-tight">{s.value}</p>
                  <p className="text-sm text-gray-400 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-24 md:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-[#0037b0] tracking-widest uppercase mb-3">How it works</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">Three steps to get started.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-10 relative">
              <div className="hidden md:block absolute top-8 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-0.5 bg-gray-100" />
              {[
                { step: '01', title: 'Set up your portfolio', desc: 'Add your buildings, floors, and units in minutes. Organize everything by location and type.' },
                { step: '02', title: 'Collect rent seamlessly', desc: 'Log payments, track arrears, and send receipts. Your tenants stay current, you stay informed.' },
                { step: '03', title: 'Review and report', desc: 'Generate financial reports, monitor occupancy trends, and make data-driven decisions.' },
              ].map((s, i) => (
                <div key={s.step} className="flex flex-col items-center text-center relative">
                  <div className="w-16 h-16 rounded-2xl bg-[#0037b0] text-white flex items-center justify-center text-lg font-bold mb-6 relative z-10 shadow-lg shadow-blue-600/20">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Ready to go digital?
            </h2>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed text-lg">
              Join property managers who&rsquo;ve modernized their business. Start your free trial — no credit card required.
            </p>
            <Link to="/register" className="inline-flex px-8 py-3.5 bg-[#0037b0] text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
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
