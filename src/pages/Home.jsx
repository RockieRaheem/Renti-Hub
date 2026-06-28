import { Link } from 'react-router-dom'

const features = [
  {
    number: '01',
    title: 'Properties & Shops',
    desc: 'Manage buildings, floors, and units from a single dashboard. Track occupancy, leases, and revenue across your entire portfolio.',
  },
  {
    number: '02',
    title: 'Rent Collection',
    desc: 'Record payments, print receipts, and track balances. Support for cash, mobile money, and bank transfers.',
  },
  {
    number: '03',
    title: 'Tenants & Reports',
    desc: 'Complete tenant profiles with payment history. Generate financial reports and export to CSV.',
  },
]

export default function Home() {
  return (
    <div>
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-base">corporate_fare</span>
            </div>
            <span className="text-lg font-bold text-gray-900">RentiHub</span>
          </Link>
          <Link
            to="/login"
            className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="pt-16">
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary mb-5 tracking-wide">
              Built for Ugandan property managers
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Property management,<br />
              <span className="text-primary">simplified</span>
            </h1>
            <p className="text-base md:text-lg text-gray-500 leading-relaxed mb-10 max-w-lg">
              Digitize your rent collection, manage properties across Kampala, and keep every record organized — without the spreadsheets.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-container transition-all"
              >
                Get Started Free
              </Link>
              <Link
                to="/dashboard"
                className="px-6 py-3 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-24 md:pb-32">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {features.map((f) => (
              <div key={f.number} className="group">
                <span className="text-4xl font-extrabold text-gray-200 group-hover:text-primary/20 transition-colors duration-500">
                  {f.number}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-3 mb-3">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <div className="grid md:grid-cols-3 gap-10 md:gap-16">
              {[
                { value: '124+', label: 'Properties' },
                { value: 'UGX 4.2B', label: 'Portfolio Value' },
                { value: '98.2%', label: 'Collection Rate' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-3xl md:text-4xl font-extrabold mb-1">{s.value}</p>
                  <p className="text-sm text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Ready to go digital?
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Join property managers who've modernized their business. Start your free trial — no credit card required.
            </p>
            <Link
              to="/register"
              className="inline-flex px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-container transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xs">corporate_fare</span>
            </div>
            <span className="text-sm font-bold text-gray-900">RentiHub</span>
          </div>
          <p className="text-xs text-gray-400">
            &copy; 2026 RentiHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
