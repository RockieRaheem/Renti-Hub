import { useState, useEffect, useRef } from 'react'
import { useBuilding } from '../context/BuildingContext'

const unitTypes = ['Retail', 'Office', 'Event Space', 'Storage', 'Residential']

export default function UnitFormModal({ floorName, unit, onClose }) {
  const overlayRef = useRef(null)
  const { updateUnit, deleteUnit } = useBuilding()

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const [name, setName] = useState(unit?.name || '')
  const [type, setType] = useState(unit?.type || 'Retail')
  const [size, setSize] = useState(unit?.size || '')
  const [monthlyRent, setMonthlyRent] = useState(unit?.monthlyRent || 0)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await updateUnit(floorName, unit.id, { name, type, size, monthlyRent: Number(monthlyRent) || 0 })
    onClose()
  }

  const handleDelete = async () => {
    await deleteUnit(floorName, unit.id)
    onClose()
  }

  const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'
  const inputClass = 'w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === overlayRef.current) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Unit</h2>
            <p className="text-xs text-gray-400 mt-0.5">{floorName} &middot; {unit?.id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Unit Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Shop 1" required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
                {unitTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Size</label>
              <input value={size} onChange={(e) => setSize(e.target.value)} className={inputClass} placeholder="e.g. 45 sqm" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Monthly Rent (UGX)</label>
            <input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} className={inputClass} placeholder="1000000" min="0" />
            {Number(monthlyRent) > 0 && (
              <p className="text-[11px] text-gray-400 mt-1">Annual: UGX {(Number(monthlyRent) * 12).toLocaleString()}/yr</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              {!confirmDelete && (
                <button type="button" onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Delete unit
                </button>
              )}
              {confirmDelete && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600 font-medium">Remove this unit?</span>
                  <button type="button" onClick={handleDelete} className="px-3 py-1.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Yes, remove</button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">Save Changes</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
