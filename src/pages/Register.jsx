import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const handleSubmit = (e) => { e.preventDefault(); navigate('/dashboard') }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-lg bg-[#0037b0] flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-base">corporate_fare</span>
              </div>
              <span className="text-lg font-bold text-gray-900">RentiHub</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
            <p className="text-sm text-gray-400">Start managing properties in minutes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none transition-all" placeholder="James Kato" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none transition-all" placeholder="manager@rentihub.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none transition-all" placeholder="Create a strong password" required />
            </div>
            <button type="submit" className="w-full bg-[#0037b0] text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#0037b0] hover:text-blue-700">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex w-[480px] bg-[#0f172a] p-12 flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-base">corporate_fare</span>
          </div>
          <span className="text-lg font-bold text-white">RentiHub</span>
        </div>
        <div>
          <p className="text-white text-lg font-medium leading-relaxed mb-6">
            Join <span className="font-bold">124+ property managers</span> who&rsquo;ve already digitized their rent collection and portfolio management.
          </p>
          <div className="space-y-4">
            {[
              'Add buildings, floors, and shop units',
              'Track rent payments and arrears',
              'Generate financial reports instantly',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-green-400 text-sm">check</span>
                </div>
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-8">
          {[
            { value: '124+', label: 'Properties' },
            { value: 'UGX 4.2B', label: 'Portfolio' },
            { value: '98.2%', label: 'Collection' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-white font-bold text-lg">{s.value}</p>
              <p className="text-gray-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
