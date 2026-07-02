import { useState, useEffect, useRef } from 'react'
import { useBuilding } from '../context/BuildingContext'

const paymentStatuses = ['Good Payer', 'Neutral Payer', 'Bad Payer']

export default function ReassignTenantModal({ floorName, unit, onClose }) {
  const overlayRef = useRef(null)
  const { deleteTenant, addTenant } = useBuilding()

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const [confirmPhase, setConfirmPhase] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    leaseStart: '',
    leaseEnd: '',
    leaseTerm: '',
    monthlyRent: unit?.monthlyRent || 0,
    paymentStatus: 'Good Payer',
  })

  const oldTenant = unit?.tenant

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!confirmPhase) {
      setConfirmPhase(true)
      return
    }
    await deleteTenant(floorName, unit.id)
    await addTenant(floorName, unit.id, form, form.monthlyRent)
    onClose()
  }

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'
  const inputClass = 'w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'

  if (confirmPhase) {
    return (
      <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === overlayRef.current) onClose() }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Confirm Reassignment</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">warning</span>
                <div>
                  <p className="font-semibold mb-1">This will replace the current tenant</p>
                  <p className="text-amber-700 text-xs">The current tenant <strong>{oldTenant?.name}</strong> will be removed from {unit.name}. A new lease will be created for the incoming tenant.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Unit</span>
                <span className="font-medium">{unit.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current tenant</span>
                <span className="font-medium">{oldTenant?.name || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">New tenant</span>
                <span className="font-medium">{form.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Monthly rent</span>
                <span className="font-medium">UGX {(Number(form.monthlyRent) || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setConfirmPhase(false)} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Back</button>
              <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors">Confirm Reassignment</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === overlayRef.current) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Reassign Shop</h2>
            <p className="text-xs text-gray-400 mt-0.5">{floorName} &middot; {unit.name} &middot; Replace {oldTenant?.name || 'current tenant'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div className="bg-gray-50 rounded-lg p-3 text-sm flex items-center gap-3">
            <div className={`w-8 h-8 rounded flex items-center justify-center text-[9px] font-bold ${oldTenant ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-500'}`}>
              {oldTenant ? oldTenant.initials : '?'}
            </div>
            <div>
              <p className="text-xs text-gray-400">Current tenant being replaced</p>
              <p className="font-medium text-gray-700">{oldTenant?.name || 'Vacant'}</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>New Tenant Name</label>
              <input value={form.name} onChange={set('name')} className={inputClass} placeholder="e.g. John Doe" required autoFocus />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={set('email')} className={inputClass} placeholder="email@example.com" />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input value={form.phone} onChange={set('phone')} className={inputClass} placeholder="+256 700 000000" />
            </div>
            <div>
              <label className={labelClass}>Lease Start</label>
              <input value={form.leaseStart} onChange={set('leaseStart')} className={inputClass} placeholder="e.g. Jan 2025" />
            </div>
            <div>
              <label className={labelClass}>Lease End</label>
              <input value={form.leaseEnd} onChange={set('leaseEnd')} className={inputClass} placeholder="e.g. Dec 2027" />
            </div>
            <div>
              <label className={labelClass}>Lease Term</label>
              <input value={form.leaseTerm} onChange={set('leaseTerm')} className={inputClass} placeholder="e.g. 3 years" />
            </div>
            <div>
              <label className={labelClass}>Monthly Rent (UGX)</label>
              <input type="number" value={form.monthlyRent} onChange={set('monthlyRent')} className={inputClass} placeholder="1000000" />
            </div>
            <div>
              <label className={labelClass}>Payment Status</label>
              <select value={form.paymentStatus} onChange={set('paymentStatus')} className={inputClass}>
                {paymentStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors">Continue</button>
          </div>
        </form>
      </div>
    </div>
  )
}
