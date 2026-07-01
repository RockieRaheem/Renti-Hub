import { Link } from 'react-router-dom'

const testimonials = [
  {
    quote: "I used to have three exercise books — one for rent, one for maintenance, one for tenant contacts. Now it's all here. My wife thinks I've become a tech guy overnight.",
    name: "James Kato",
    role: "Portfolio Manager, Kampala Properties Ltd",
    initials: "JK",
    color: "bg-blue-100 text-blue-700",
  },
  {
    quote: "What sold me was the receipt printing. Tenants want something physical when they pay, and now I generate it from my phone right there at the shop.",
    name: "Sarah Nabatanzi",
    role: "Owns 4 buildings in Wandegeya",
    initials: "SN",
    color: "bg-teal-100 text-teal-700",
  },
]

const problems = [
  { icon: 'menu_book', label: 'Paper ledger books that get lost' },
  { icon: 'sms', label: 'Tenant WhatsApp groups with 200 unread messages' },
  { icon: 'calculate', label: 'End-of-month maths on calculator apps' },
  { icon: 'receipt_long', label: 'Handwritten receipts that fade in the sun' },
]

const features = [
  {
    icon: 'layers', title: 'Floors & Units',
    desc: 'Set up your building floor by floor. Each unit tracks its own tenant, rent, and payment history automatically.',
  },
  {
    icon: 'payments', title: 'Rent Collection',
    desc: 'Log payments the moment you receive them — cash, mobile money, bank transfer. The receipt is ready before the customer leaves.',
  },
  {
    icon: 'contract', title: 'Tenant Profiles',
    desc: 'Every tenant has a file. Lease dates, payment behaviour, maintenance requests — it stays, even when they move out.',
  },
  {
    icon: 'analytics', title: 'Financial Reports',
    desc: 'See exactly what each floor brings in. Export to CSV when your accountant asks for records at the end of the year.',
  },
  {
    icon: 'build', title: 'Maintenance Tracking',
    desc: 'When a pipe bursts or a light goes out, log it once. No more chasing tenants for updates on WhatsApp.',
  },
  {
    icon: 'download', title: 'Export to CSV',
    desc: 'Your data is yours. Download everything anytime — for your accountant, your bank, or your own records.',
  },
]

const steps = [
  { num: '1', title: 'Add your floors', desc: 'Ground Floor, 1st Floor, 2nd Floor — whatever your building looks like. Add the shops or rooms on each one.' },
  { num: '2', title: 'Add your tenants', desc: 'Name, contact, lease dates, monthly rent. That is all you need to get started. The system handles the rest.' },
  { num: '3', title: 'Start collecting', desc: 'When rent comes in, log it. When something breaks, log it. At the end of the month, pull your report.' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">

      {/* ─── Nav ─── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e8e3dc]">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-base">corporate_fare</span>
            </div>
            <span className="text-base font-bold text-[#1a1a1a] tracking-tight">RentiHub</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-medium text-[#5f5f5f] hover:text-[#1a1a1a] transition-colors px-3 py-1.5">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-medium text-white bg-primary px-4 py-1.5 rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>

        {/* ─── Hero ─── */}
        <section className="pt-28 pb-20 md:pb-28 md:pt-36">
          <div className="max-w-6xl mx-auto px-5">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-5">
                Built in Kampala for property managers
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#1a1a1a] leading-[1.08] tracking-tight">
                Finally, a simple way to manage your building.
              </h1>
              <p className="text-base sm:text-lg text-[#5f5f5f] mt-5 max-w-xl leading-relaxed">
                No spreadsheets. No exercise books. No chasing tenants for rent records. 
                Just one place for your units, tenants, payments, and maintenance.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-600 transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
                  Start Free Trial
                </Link>
                <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#e0ddd5] text-[#1a1a1a] text-sm font-bold rounded-xl hover:bg-[#f0ede6] transition-all active:scale-[0.98]">
                  See the Dashboard
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-[#9a9a9a]">
                <span className="font-semibold text-[#1a1a1a] uppercase tracking-wider text-[10px]">Works with</span>
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#d4d4d4]" /> Cash</span>
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#d4d4d4]" /> Mobile Money</span>
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#d4d4d4]" /> Bank Transfer</span>
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#d4d4d4]" /> Printable Receipts</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── The Problem —───── */}
        <section className="py-16 md:py-20 bg-white border-y border-[#e8e3dc]">
          <div className="max-w-6xl mx-auto px-5">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
              <div>
                <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Before RentiHub</p>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#1a1a1a] leading-tight mb-4">
                  Managing a building should not feel like a second job.
                </h2>
                <p className="text-[#5f5f5f] text-sm leading-relaxed mb-6">
                  If you own or manage a building in Kampala, you already know the drill. 
                  Rent is due, tenants call, something breaks, you write it in a notebook, 
                  the notebook disappears. Then the accountant asks for records and you 
                  spend a weekend reconstructing the year from WhatsApp messages.
                </p>
              </div>
              <div className="bg-[#faf8f5] rounded-2xl border border-[#e8e3dc] p-6 md:p-8">
                <p className="text-xs font-bold text-[#9a9a9a] uppercase tracking-wider mb-4">The old way</p>
                <div className="space-y-4">
                  {problems.map((p) => (
                    <div key={p.label} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#c4bdb0] text-xl">{p.icon}</span>
                      <span className="text-sm text-[#5f5f5f]">{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="py-16 md:py-20 bg-[#faf8f5]">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Three steps</p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#1a1a1a]">You can be set up in 10 minutes.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {steps.map((s, i) => (
                <div key={s.num} className="bg-white rounded-2xl border border-[#e8e3dc] p-7 hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary font-bold text-base mb-4">
                    {s.num}
                  </div>
                  <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-2">{s.title}</h3>
                  <p className="text-sm text-[#5f5f5f] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Features ─── */}
        <section className="py-16 md:py-20 bg-white border-y border-[#e8e3dc]">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Everything included</p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#1a1a1a]">What you get.</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-[#e8e3dc] p-6 bg-[#faf8f5] hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <span className="material-symbols-outlined text-primary text-2xl mb-3 block">{f.icon}</span>
                  <h3 className="text-sm font-bold text-[#1a1a1a] mb-1.5">{f.title}</h3>
                  <p className="text-sm text-[#5f5f5f] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section className="py-16 md:py-20 bg-[#faf8f5]">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Real people, real buildings</p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#1a1a1a]">Who is using RentiHub?</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-white rounded-2xl border border-[#e8e3dc] p-7 md:p-8">
                  <svg className="w-7 h-7 text-[#d4cec2] mb-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
                  </svg>
                  <p className="text-[15px] text-[#1a1a1a] leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${t.color}`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1a1a1a]">{t.name}</p>
                      <p className="text-xs text-[#9a9a9a]">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Stats ─── */}
        <section className="py-16 md:py-20 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="max-w-6xl mx-auto px-5 relative">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">Numbers from real buildings using RentiHub.</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '124', suffix: '+', label: 'Buildings Onboarded' },
                { value: 'UGX 4.2', suffix: 'B', label: 'Portfolio Value Tracked' },
                { value: '98.2', suffix: '%', label: 'Average Collection Rate' },
                { value: '3', suffix: 'yr', label: 'Average Lease Term' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-1 tracking-tight tabular-nums">
                    {s.value}<span className="text-primary-200 font-bold">{s.suffix}</span>
                  </p>
                  <p className="text-xs md:text-sm text-primary-200 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Why we built this ─── */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-5">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Why we built this</p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#1a1a1a] mb-4">We got tired of the spreadsheets too.</h2>
              <p className="text-sm text-[#5f5f5f] leading-relaxed mb-3">
                RentiHub started because someone in Kampala was managing six buildings with a 
                Google Sheet and a notebook. Every month, the same panic — did Shop 4 pay? 
                Was that cash deposit from last week rent or arrears? When does the lease expire?
              </p>
              <p className="text-sm text-[#5f5f5f] leading-relaxed">
                We built this for that person. And for everyone else who just wants their 
                building to run without running them.
              </p>
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-16 md:py-20 bg-[#faf8f5] border-t border-[#e8e3dc]">
          <div className="max-w-6xl mx-auto px-5 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#1a1a1a] mb-3">
              Try it for free. No card needed.
            </h2>
            <p className="text-sm text-[#5f5f5f] mb-8 max-w-sm mx-auto leading-relaxed">
              Add your first floor, your first tenant, log your first payment. If it works for you, keep going.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/register" className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-600 transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
                Start Free Trial
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-[#e0ddd5] text-[#1a1a1a] text-sm font-bold rounded-xl hover:bg-[#f0ede6] transition-all active:scale-[0.98]">
                I already have an account
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#e8e3dc] bg-white">
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#9a9a9a]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[10px]">corporate_fare</span>
              </div>
              <span className="font-bold text-[#1a1a1a]">RentiHub</span>
              <span className="text-[#c4bdb0] mx-1">&middot;</span>
              <span>&copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-5">
              <a href="#" className="hover:text-[#1a1a1a] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#1a1a1a] transition-colors">Terms</a>
              <a href="#" className="hover:text-[#1a1a1a] transition-colors">Support</a>
            </div>
            <p className="text-[#c4bdb0]">Made in Kampala, Uganda</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
