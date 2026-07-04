import { useState, useEffect, useRef } from 'react'
import { useBuilding } from '../context/BuildingContext'
import { sanitizeTenantData, sanitizeNumber } from '../utils/sanitize'

const paymentStatuses = ['Good Payer', 'Neutral Payer', 'Bad Payer']

function validate(form, isAdd) {
  const errors = {}

  if (!form.name || form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address'
  }

  if (form.phone && form.phone.replace(/[\s+\-\d()]/g, '').length > 0) {
    errors.phone = 'Phone can only contain numbers, spaces, +, -, and parentheses'
  }

  if (form.leaseStart && form.leaseEnd && form.leaseStart > form.leaseEnd) {
    errors.leaseEnd = 'Lease End must be after Lease Start'
  }

  if (isAdd) {
    const rent = sanitizeNumber(form.monthlyRent)
    if (rent <= 0) {
      errors.monthlyRent = 'Monthly Rent must be greater than 0'
    }
  }

  return errors
}

export default function TenantFormModal({ mode, initialData, floorName, unitId, onClose }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])
  const { floors, addTenant, updateTenant, deleteTenant, getUnitByFloorAndId } = useBuilding()
  const isAdd = mode === 'add'

  const editUnit = !isAdd ? getUnitByFloorAndId(floorName, unitId) : null

  const [selectedFloor, setSelectedFloor] = useState(floorName || '')
  const [selectedUnit, setSelectedUnit] = useState(unitId || '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    leaseStart: initialData?.leaseStart || '',
    leaseEnd: initialData?.leaseEnd || '',
    leaseTerm: initialData?.leaseTerm || '',
    monthlyRent: isAdd ? '' : (editUnit?.monthlyRent ? String(editUnit.monthlyRent) : ''),
    paymentStatus: initialData?.paymentStatus || 'Good Payer',
  })
  const [errors, setErrors] = useState({})

  const currentFloor = floors.find((f) => f.name === selectedFloor)
  const availableUnits = isAdd
    ? (currentFloor?.units || []).filter((u) => u.status === 'vacant')
    : []
  const preSelected = isAdd && floorName && unitId
  const selectedUnitName = preSelected
    ? currentFloor?.units?.find((u) => u.id === unitId)?.name || unitId
    : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cleanForm = sanitizeTenantData(form)
    const cleanRent = isAdd ? sanitizeNumber(form.monthlyRent) : sanitizeNumber(form.monthlyRent)
    const v = validate({ ...cleanForm, monthlyRent: cleanRent }, isAdd)
    setErrors(v)
    if (Object.keys(v).length > 0) return

    setSubmitting(true)
    try {
      if (isAdd) {
        await addTenant(selectedFloor, selectedUnit, cleanForm, cleanRent)
      } else {
        cleanForm.monthlyRent = cleanRent
        await updateTenant(floorName, unitId, cleanForm)
      }
      onClose()
    } catch {
      setErrors({ _form: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    await deleteTenant(floorName, unitId)
    onClose()
  }

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n })
  }

  const labelClass = 'block text-xs font-semibold text-on-surface-dim uppercase tracking-wide mb-1.5'
  const inputClass =
    'w-full px-3.5 py-2.5 bg-surface text-on-surface border border-outline rounded-lg text-sm placeholder-on-surface-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
  const inputErrorClass =
    'w-full px-3.5 py-2.5 bg-surface text-on-surface border border-status-unpaid rounded-lg text-sm placeholder-on-surface-muted/50 focus:outline-none focus:ring-2 focus:ring-status-unpaid/20 focus:border-status-unpaid transition-all'

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === overlayRef.current) onClose() }}>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline/50">
          <div>
            <h2 className="text-lg font-bold text-on-surface">
              {isAdd ? 'Add New Tenant' : 'Edit Tenant'}
            </h2>
            <p className="text-xs text-on-surface-muted mt-0.5">
              {isAdd ? 'Assign a tenant to a vacant unit' : `Update ${initialData?.name || 'tenant'} details`}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-dim transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          {errors._form && (
            <div className="bg-status-unpaid/10 border border-status-unpaid/30 rounded-lg px-4 py-3 text-sm text-status-unpaid font-medium">
              <span className="material-symbols-outlined text-base align-text-bottom mr-1.5">error</span>
              {errors._form}
            </div>
          )}

          {isAdd && (
            <>
              {preSelected ? (
                <div className="bg-primary-50/50 rounded-lg border border-primary/10 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                    <span className="font-medium text-on-surface">{selectedFloor}</span>
                    <span className="text-on-surface-muted">&rarr;</span>
                    <span className="font-medium text-on-surface">{selectedUnitName}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-muted pl-7">Adding tenant to this vacant unit</p>
                </div>
              ) : (
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
                </>
              )}
              <hr className="border-outline/30" />
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Tenant Name</label>
              <input
                value={form.name} onChange={set('name')}
                className={errors.name ? inputErrorClass : inputClass}
                placeholder="e.g. John Doe" required autoFocus={!isAdd || !!preSelected}
              />
              {errors.name && <p className="mt-1 text-xs text-status-unpaid flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.name}</p>}
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={set('email')}
                className={errors.email ? inputErrorClass : inputClass}
                placeholder="email@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-status-unpaid flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.email}</p>}
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={form.phone} onChange={set('phone')}
                className={errors.phone ? inputErrorClass : inputClass}
                placeholder="+256 700 000000"
              />
              {errors.phone && <p className="mt-1 text-xs text-status-unpaid flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.phone}</p>}
            </div>
            <div>
              <label className={labelClass}>Lease Start</label>
              <input type="date" value={form.leaseStart} onChange={set('leaseStart')}
                className={errors.leaseStart ? inputErrorClass : inputClass}
              />
              {errors.leaseStart && <p className="mt-1 text-xs text-status-unpaid flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.leaseStart}</p>}
            </div>
            <div>
              <label className={labelClass}>Lease End</label>
              <input type="date" value={form.leaseEnd} onChange={set('leaseEnd')}
                className={errors.leaseEnd ? inputErrorClass : inputClass}
              />
              {errors.leaseEnd && <p className="mt-1 text-xs text-status-unpaid flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.leaseEnd}</p>}
            </div>
            <div>
              <label className={labelClass}>Lease Term</label>
              <input value={form.leaseTerm} onChange={set('leaseTerm')}
                className={errors.leaseTerm ? inputErrorClass : inputClass}
                placeholder="e.g. 3 years"
              />
              {errors.leaseTerm && <p className="mt-1 text-xs text-status-unpaid flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.leaseTerm}</p>}
            </div>
            <div>
              <label className={labelClass}>{isAdd ? 'Monthly Rent (UGX)' : 'Monthly Rent (UGX)'}</label>
              <input type="number" min="0" step="1000" value={form.monthlyRent} onChange={set('monthlyRent')}
                className={errors.monthlyRent ? inputErrorClass : inputClass}
                placeholder="1000000"
              />
              {errors.monthlyRent && <p className="mt-1 text-xs text-status-unpaid flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.monthlyRent}</p>}
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

          <div className="flex items-center justify-between pt-4 border-t border-outline/30">
            <div>
              {!isAdd && !confirmDelete && (
                <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-status-unpaid hover:bg-status-unpaid/10 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Delete tenant
                </button>
              )}
              {!isAdd && confirmDelete && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-status-unpaid font-medium">Are you sure?</span>
                  <button type="button" onClick={handleDelete} className="px-3 py-1.5 text-sm font-semibold text-white bg-status-unpaid hover:bg-red-700 rounded-lg transition-colors">
                    Yes, delete
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-sm font-medium text-on-surface-muted hover:bg-surface-dim rounded-lg transition-colors">
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-on-surface-muted hover:bg-surface-dim rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2">
                {submitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {submitting ? 'Processing...' : (isAdd ? 'Add Tenant' : 'Save Changes')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
