import { Link } from 'react-router-dom'

const features = [
  { icon: 'apartment', title: 'Property Management', desc: 'Manage multiple buildings, floors, and shops from one centralized dashboard.', color: 'bg-blue-100 text-blue-600' },
  { icon: 'payments', title: 'Rent Collection', desc: 'Record payments digitally, generate receipts automatically, and track balances in real-time.', color: 'bg-green-100 text-green-600' },
  { icon: 'assessment', title: 'Financial Reports', desc: 'Generate daily, monthly, and annual reports. Export to CSV for accounting.', color: 'bg-purple-100 text-purple-600' },
  { icon: 'people', title: 'Tenant Management', desc: 'Complete tenant profiles, lease tracking, and payment history all in one place.', color: 'bg-orange-100 text-orange-600' },
  { icon: 'build', title: 'Maintenance Tracking', desc: 'Tenants submit requests online. Track status and completion from your dashboard.', color: 'bg-red-100 text-red-600' },
  { icon: 'notifications', title: 'SMS & Email Alerts', desc: 'Automated payment confirmations, rent reminders, and lease expiry notifications.', color: 'bg-yellow-100 text-yellow-600' },
]

export default function Home() {
  return (
    <div>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white">corporate_fare</span>
            </div>
            <span className="text-2xl font-extrabold text-gray-900">RentiHub</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition">Dashboard</Link>
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
            <a href="#about" className="text-gray-600 hover:text-gray-900 transition">About</a>
            <Link to="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Login</Link>
          </nav>
        </div>
      </header>

      <section className="text-white" style={{ background: 'linear-gradient(135deg, #0037b0 0%, #1d4ed8 50%, #F97316 100%)' }}>
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Smart Property Management for Uganda</h1>
            <p className="text-xl mb-8 text-white/90">Digitize your rent collection, manage properties efficiently, and grow your real estate business with RentiHub.</p>
            <div className="flex gap-4">
              <Link to="/register" className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition">Get Started Free</Link>
              <a href="#features" className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition">Learn More</a>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">Complete property management in one platform</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition">
                <div className={`w-12 h-12 ${f.color} rounded-lg flex items-center justify-center mb-4`}>
                  <span className="material-symbols-outlined text-3xl">{f.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { val: '100%', label: 'Digital Records' },
              { val: '24/7', label: 'Access Anywhere' },
              { val: 'Real-time', label: 'Updates' },
              { val: 'Secure', label: 'Cloud Storage' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-5xl font-bold mb-2">{s.val}</p>
                <p className="text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Built for Uganda</h2>
          <p className="text-lg text-gray-600 mb-8">RentiHub replaces traditional rent collection books with a modern, secure, digital platform. Built specifically for Ugandan property owners and managers, RentiHub eliminates lost records, reduces disputes, and provides instant access to financial data.</p>
          <p className="text-lg text-gray-600">Whether you manage one building or ten, RentiHub scales with your business and gives you the tools to operate professionally and efficiently.</p>
        </div>
      </section>

      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Go Digital?</h2>
          <p className="text-xl mb-8">Join property owners modernizing their business with RentiHub</p>
          <Link to="/register" className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition">Start Free Today</Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white">corporate_fare</span>
            </div>
            <span className="text-xl font-bold">RentiHub</span>
          </div>
          <p className="text-gray-400 text-sm">&copy; 2026 RentiHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
