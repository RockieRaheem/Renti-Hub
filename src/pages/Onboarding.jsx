import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import { sanitizeString } from '../utils/sanitize'

export default function Onboarding() {
  const navigate = useNavigate()
  const { createBuilding, loading } = useBuilding()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('Mixed-Use')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cleanName = sanitizeString(name)
    const cleanLocation = sanitizeString(location)
    const cleanType = sanitizeString(type) || 'Mixed-Use'
    if (!cleanName) return
    setSubmitting(true)
    const ok = await createBuilding(cleanName, cleanLocation, cleanType)
    setSubmitting(false)
    if (ok) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">add_business</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Welcome to RentiHub</h1>
          <p className="text-sm text-on-surface-muted mt-1">Let's set up your first property</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-outline p-7 shadow-card space-y-5">
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Property Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3.5 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. City Plaza" required autoFocus />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)}
              className="w-full h-10 px-3.5 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. Nakasero, Kampala" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Property Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full h-10 px-3.5 border border-outline rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
              <option value="Mixed-Use">Mixed-Use</option>
              <option value="Commercial">Commercial</option>
              <option value="Residential">Residential</option>
              <option value="Industrial">Industrial</option>
              <option value="Retail">Retail</option>
            </select>
          </div>
          <button type="submit" disabled={submitting || !name.trim() || loading}
            className="w-full h-10 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2 shadow-card">
            {submitting ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : 'Create Property'}
          </button>
        </form>

        <p className="text-xs text-on-surface-dim text-center mt-6">
          You can add floors, units, and tenants after creating your property.
        </p>
      </div>
    </div>
  )
}
