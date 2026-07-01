import { useState } from 'react'
import { useBuilding } from '../context/BuildingContext'
import FloorFormModal from '../components/FloorFormModal'
import TenantFormModal from '../components/TenantFormModal'

export default function Properties() {
  const { floors } = useBuilding()
  const [expandedFloor, setExpandedFloor] = useState(null)
  const [floorModal, setFloorModal] = useState(false)
  const [tenantModal, setTenantModal] = useState(null)

  const hasData = floors.length > 0

  if (!hasData) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="bg-surface rounded-card border border-outline p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">add_business</span>
          </div>
          <h2 className="text-lg font-bold text-on-surface mb-2">No floors yet</h2>
          <p className="text-sm text-on-surface-muted mb-6 max-w-md mx-auto">Get started by adding your first floor. Each floor can contain multiple shop units that you can assign to tenants.</p>
          <button onClick={() => setFloorModal(true)}
            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-card inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">add</span>
            Add Your First Floor
          </button>
          {floorModal && <FloorFormModal mode="add" onClose={() => setFloorModal(false)} />}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-on-surface-muted font-medium">{floors.length} floor{floors.length !== 1 ? 's' : ''} &middot; {floors.reduce((s, f) => s + f.units.length, 0)} units</p>
        <button onClick={() => setFloorModal(true)}
          className="px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-card inline-flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">add</span>
          Add Floor
        </button>
      </div>

      <div className="grid gap-4">
        {floors.map((floor) => {
          const occ = floor.units.filter(u => u.status === 'occupied').length
          const vac = floor.units.length - occ
          const pct = Math.round((occ / floor.units.length) * 100)
          const isExpanded = expandedFloor === floor.name

          return (
            <div key={floor.name} className="bg-surface rounded-card border border-outline overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
              <button
                onClick={() => setExpandedFloor(isExpanded ? null : floor.name)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-xl">layers</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface">{floor.name}</h3>
                    <p className="text-xs text-on-surface-muted">{occ} occupied &middot; {vac} vacant &middot; {floor.units.length} units</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-surface-container-highest rounded-full">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-on-surface-muted">{pct}%</span>
                  </div>
                  <span className={`material-symbols-outlined text-on-surface-dim transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-outline p-5 bg-surface-container/50">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {floor.units.map((unit) => {
                      const occupied = unit.status === 'occupied'
                      return (
                        <div key={unit.id}
                          className={`relative rounded-lg border p-3 text-center transition-all ${occupied ? 'bg-surface border-primary/20' : 'bg-surface-container border-outline'}`}>
                          <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${occupied ? 'bg-status-paid' : 'bg-status-vacant'}`} />
                          <p className={`text-xs font-semibold ${occupied ? 'text-on-surface' : 'text-on-surface-muted'}`}>{unit.name}</p>
                          {occupied && unit.tenant ? (
                            <p className="text-[10px] text-on-surface-muted mt-0.5 truncate">{unit.tenant.name}</p>
                          ) : (
                            <p className="text-[10px] text-on-surface-dim mt-0.5">Vacant</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-outline">
                    <button onClick={() => setTenantModal({ floor: floor.name })}
                      className="px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-50 rounded-lg transition-colors inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      Add Tenant
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {floorModal && <FloorFormModal mode="add" onClose={() => setFloorModal(false)} />}
      {tenantModal && (
        <TenantFormModal mode="add" floorName={tenantModal.floor} onClose={() => setTenantModal(null)} />
      )}
    </div>
  )
}
