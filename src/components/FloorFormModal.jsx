import { useState, useEffect, useRef } from 'react'
import { useBuilding } from '../context/BuildingContext'

export default function FloorFormModal({ mode, floorName, onClose }) {
  const overlayRef = useRef(null)
  const { floors, addFloor, updateFloor, deleteFloor } = useBuilding()
  const isAdd = mode === 'add'

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const [name, setName] = useState(isAdd ? '' : floorName)
  const [unitCount, setUnitCount] = useState(4)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isAdd) {
      addFloor(name, unitCount)
    } else {
      updateFloor(floorName, name)
    }
    onClose()
  }

  const handleDelete = () => {
    deleteFloor(floorName)
    onClose()
  }

  const inputClass =
    'w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === overlayRef.current) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isAdd ? 'Add Floor' : 'Edit Floor'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isAdd ? 'Create a new floor with units' : `Rename or delete ${floorName}`}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Floor Name</label>
              <input autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="e.g. 3rd Floor, Basement"
                required
              />
          </div>

          {isAdd && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Number of Shops</label>
              <input
                type="number"
                min={1}
                value={unitCount}
                onChange={(e) => setUnitCount(Math.max(1, parseInt(e.target.value) || 1))}
                className={inputClass}
                placeholder="e.g. 6"
                required
              />
              <p className="text-xs text-gray-400 mt-1.5">Auto-generates {unitCount} vacant shop{unitCount !== 1 ? 's' : ''} on this floor</p>
            </div>
          )}

          {!isAdd && floors.filter((f) => f.name === floorName)[0]?.units.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-500 text-lg shrink-0 mt-0.5">warning</span>
                <div>
                  <p className="text-sm font-medium text-amber-800">Floor has active units</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Renaming will update the floor name but preserve all units and tenants.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              {!isAdd && !confirmDelete && (
                <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Delete floor
                </button>
              )}
              {!isAdd && confirmDelete && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600 font-medium">Delete all?</span>
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
                {isAdd ? 'Add Floor' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
