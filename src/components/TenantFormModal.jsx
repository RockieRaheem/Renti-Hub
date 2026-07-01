import { useState, useEffect, useRef } from 'react'
import { useBuilding } from '../context/BuildingContext'

const paymentStatuses = ['Good Payer', 'Neutral Payer', 'Bad Payer']

export default function TenantFormModal({ mode, initialData, floorName, unitId, onClose }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])
  const { floors, addTenant, updateTenant, deleteTenant } = useBuilding()
  const isAdd = mode === 'add'

  const [selectedFloor, setSelectedFloor] = useState(floorName || '')
  const [selectedUnit, setSelectedUnit] = useState(unitId || '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    leaseStart: initialData?.leaseStart || '',
    leaseEnd: initialData?.leaseEnd || '',
    leaseTerm: initialData?.leaseTerm || '',
    monthlyRent: initialData ? '' : '',
    paymentStatus: initialData?.paymentStatus || 'Good Payer',
  })

  const currentFloor = floors.find((f) => f.name === selectedFloor)
  const availableUnits = isAdd
    ? (currentFloor?.units || []).filter((u) => u.status === 'vacant')
    : []

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isAdd) {
      addTenant(selectedFloor, selectedUnit, form, form.monthlyRent)
    } else {
      updateTenant(floorName, unitId, form)
    }
    onClose()
  }

  const handleDelete = () => {
    deleteTenant(floorName, unitId)
    onClose()
  }

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'
  const inputClass =
    'w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === overlayRef.current) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isAdd ? 'Add New Tenant' : 'Edit Tenant'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isAdd ? 'Assign a tenant to a vacant unit' : `Update ${initialData?.name || 'tenant'} details`}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isAdd && (
            <>
              <div>
                <label className={labelClass}>Floor</label>
                <select autoFocus value={selectedFloor} onChange={(e) => { setSelectedFloor(e.target.value); setSelectedUnit('') }} className={inputClass} required>
                  <option value="">Select floor</option>
                  {floors.map((f) => (
                    <option key={f.name} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Unit</label>
                <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} className={inputClass} required disabled={!selectedFloor}>
                  <option value="">{selectedFloor ? 'No vacant units' : 'Select a floor first'}</option>
                  {availableUnits.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.type})</option>
                  ))}
                </select>
              </div>
              <hr className="border-gray-100" />
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Tenant Name</label>
              <input value={form.name} onChange={set('name')} className={inputClass} placeholder="e.g. John Doe" required />
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
              <label className={labelClass}>{isAdd ? 'Monthly Rent (UGX)' : 'Monthly Rent (UGX)'}</label>
              <input type="number" value={form.monthlyRent} onChange={set('monthlyRent')} className={inputClass} placeholder="1000000" />
            </div>
            <div>
              <label className={labelClass}>Payment Status</label>
              <select value={form.paymentStatus} onChange={set('paymentStatus')} className={inputClass}>
                {paymentStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              {!isAdd && !confirmDelete && (
                <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Delete tenant
                </button>
              )}
              {!isAdd && confirmDelete && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600 font-medium">Are you sure?</span>
                  <button type="button" onClick={handleDelete} className="px-3 py-1.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                    Yes, delete
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
                {isAdd ? 'Add Tenant' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
