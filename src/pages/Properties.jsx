import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import FloorFormModal from '../components/FloorFormModal'
import TenantFormModal from '../components/TenantFormModal'

function useMenu() {
  const [openId, setOpenId] = useState(null)
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpenId(null) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return { openId, setOpenId, ref }
}

export default function Properties() {
  const { floors, floorSlug, deleteFloor, deleteTenant } = useBuilding()
  const { openId, setOpenId, ref } = useMenu()
  const [expandedFloor, setExpandedFloor] = useState(null)
  const [floorModal, setFloorModal] = useState(null)
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
          <button onClick={() => setFloorModal({ mode: 'add' })}
            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-card inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">add</span>
            Add Your First Floor
          </button>
          {floorModal && <FloorFormModal mode={floorModal.mode} floorName={floorModal.name} onClose={() => setFloorModal(null)} />}
        </div>
      </div>
    )
  }

  function handleDeleteFloor(name) {
    deleteFloor(name)
    setOpenId(null)
    if (expandedFloor === name) setExpandedFloor(null)
  }

  function handleDeleteTenant(floorName, unitId) {
    deleteTenant(floorName, unitId)
  }

  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-on-surface-muted font-medium">{floors.length} floor{floors.length !== 1 ? 's' : ''} &middot; {floors.reduce((s, f) => s + f.units.length, 0)} units</p>
        <button onClick={() => setFloorModal({ mode: 'add' })}
          className="px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-card inline-flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">add</span>
          Add Floor
        </button>
      </div>

      <div className="grid gap-4" ref={ref}>
        {floors.map((floor) => {
          const occ = floor.units.filter(u => u.status === 'occupied').length
          const vac = floor.units.length - occ
          const pct = Math.round((occ / floor.units.length) * 100)
          const isExpanded = expandedFloor === floor.name
          const menuOpen = openId === floor.name

          return (
            <div key={floor.name} className="bg-surface rounded-card border border-outline overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
              <div className="w-full flex items-center justify-between p-5 hover:bg-surface-container transition-colors group">
                <Link to={`/properties/floor/${floorSlug(floor.name)}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-xl">layers</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{floor.name}</h3>
                    <p className="text-xs text-on-surface-muted">{occ} occupied &middot; {vac} vacant &middot; {floor.units.length} units</p>
                  </div>
                </Link>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="hidden sm:flex items-center gap-2 mr-2">
                    <div className="w-20 h-1.5 bg-surface-container-highest rounded-full">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-on-surface-muted">{pct}%</span>
                  </div>

                  <button onClick={(e) => { e.preventDefault(); setExpandedFloor(isExpanded ? null : floor.name) }}
                    className="material-symbols-outlined text-on-surface-dim hover:text-on-surface transition-all p-1.5 rounded-lg hover:bg-surface-container"
                    title="Quick view units">
                    {isExpanded ? 'expand_less' : 'expand_more'}
                  </button>

                  <div className="relative">
                    <button onClick={() => setOpenId(menuOpen ? null : floor.name)}
                      className="material-symbols-outlined text-on-surface-dim hover:text-on-surface transition-all p-1.5 rounded-lg hover:bg-surface-container opacity-0 group-hover:opacity-100"
                      title="Floor actions">
                      more_vert
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-surface rounded-xl border border-outline shadow-lg z-20 py-1">
                        <button onClick={() => { setFloorModal({ mode: 'edit', name: floor.name }); setOpenId(null) }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors text-left">
                          <span className="material-symbols-outlined text-lg text-on-surface-muted">edit</span>
                          Edit Floor
                        </button>
                        <button onClick={() => handleDeleteFloor(floor.name)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-status-unpaid hover:bg-red-50 transition-colors text-left">
                          <span className="material-symbols-outlined text-lg">delete</span>
                          Delete Floor
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-outline p-5 bg-surface-container/50">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {floor.units.map((unit) => {
                      const occupied = unit.status === 'occupied'
                      return (
                        <div key={unit.id} className="relative group/unit">
                          <Link to={`/properties/floor/${floorSlug(floor.name)}/unit/${unit.id}`}
                            className={`block rounded-lg border p-3 text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${occupied ? 'bg-surface border-primary/20 hover:border-primary/40' : 'bg-surface-container border-dashed border-outline hover:border-primary/30'}`}>
                            <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${occupied ? 'bg-status-paid' : 'bg-status-vacant'}`} />
                            <p className={`text-xs font-semibold ${occupied ? 'text-on-surface' : 'text-on-surface-muted'}`}>{unit.name}</p>
                            {occupied && unit.tenant ? (
                              <p className="text-[10px] text-on-surface-muted mt-0.5 truncate">{unit.tenant.name}</p>
                            ) : (
                              <p className="text-[10px] text-primary/70 mt-0.5 font-medium">Click to add tenant</p>
                            )}
                          </Link>
                          {occupied && unit.tenant && (
                            <div className="absolute -top-1.5 -right-1.5 flex gap-0.5 opacity-0 group-hover/unit:opacity-100 transition-opacity">
                              <button onClick={() => setTenantModal({ mode: 'edit', floor: floor.name, unit: unit.id, data: unit.tenant })}
                                className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] hover:bg-primary-600 shadow-sm"
                                title="Edit tenant">
                                <span className="material-symbols-outlined text-[12px]">edit</span>
                              </button>
                              <button onClick={() => handleDeleteTenant(floor.name, unit.id)}
                                className="w-5 h-5 rounded-full bg-status-unpaid text-white flex items-center justify-center text-[10px] hover:bg-red-700 shadow-sm"
                                title="Remove tenant">
                                <span className="material-symbols-outlined text-[12px]">close</span>
                              </button>
                            </div>
                          )}
                          {!occupied && (
                            <button onClick={(e) => { e.preventDefault(); setTenantModal({ mode: 'add', floor: floor.name, unit: unit.id }) }}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] hover:bg-primary-600 shadow-sm opacity-0 group-hover/unit:opacity-100 transition-opacity"
                              title="Add tenant to this unit">
                              <span className="material-symbols-outlined text-[12px]">add</span>
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline">
                    <Link to={`/properties/floor/${floorSlug(floor.name)}`}
                      className="text-xs font-medium text-primary hover:text-primary-600 transition-colors inline-flex items-center gap-1">
                      View floor details
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </Link>
                    <button onClick={() => setTenantModal({ mode: 'add', floor: floor.name })}
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

      {floorModal && <FloorFormModal mode={floorModal.mode} floorName={floorModal.name} onClose={() => setFloorModal(null)} />}
      {tenantModal && (
        <TenantFormModal
          mode={tenantModal.mode}
          floorName={tenantModal.floor}
          unitId={tenantModal.unit}
          initialData={tenantModal.data}
          onClose={() => setTenantModal(null)}
        />
      )}
    </div>
  )
}
