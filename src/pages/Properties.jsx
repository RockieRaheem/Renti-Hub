import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import FloorFormModal from '../components/FloorFormModal'
import TenantFormModal from '../components/TenantFormModal'
import ConfirmModal from '../components/ConfirmModal'

function KpiCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-surface rounded-card border border-outline p-4 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between mb-2.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent || 'bg-primary-50'}`}>
          <span className="material-symbols-outlined text-xl" style={{ color: accent ? '#1a1a2e' : undefined }}>{icon}</span>
        </div>
      </div>
      <p className="text-xl font-bold text-on-surface mb-0.5 tracking-tight">{value}</p>
      <p className="text-[11px] text-on-surface-muted">{label}</p>
      {sub && <p className="text-[10px] text-on-surface-dim mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Properties() {
  const { floors, floorSlug, deleteFloor, deleteTenant } = useBuilding()
  const [expandedFloor, setExpandedFloor] = useState(null)
  const [floorModal, setFloorModal] = useState(null)
  const [tenantModal, setTenantModal] = useState(null)
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const hasData = floors.length > 0

  const totalUnits = floors.reduce((s, f) => s + f.units.length, 0)
  const occupiedUnits = floors.reduce((s, f) => s + f.units.filter(u => u.status === 'occupied').length, 0)
  const vacantUnits = totalUnits - occupiedUnits
  const occupancyPct = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0
  const monthlyRevenue = floors.reduce((s, f) => s + f.units.reduce((us, u) => us + (u.status === 'occupied' ? (u.monthlyRent || 0) : 0), 0), 0)
  const totalDebt = floors.reduce((s, f) => s + f.units.reduce((us, u) => us + Math.max(0, u.tenant?.outstandingBalance || 0), 0), 0)
  const tenantsCount = floors.reduce((s, f) => s + f.units.filter(u => u.tenant).length, 0)

  function handleDeleteFloor(name) {
    deleteFloor(name)
    if (expandedFloor === name) setExpandedFloor(null)
  }

  function handleDeleteTenant(floorName, unitId) {
    deleteTenant(floorName, unitId)
  }

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
        </div>
        {floorModal && <FloorFormModal mode={floorModal.mode} floorName={floorModal.name} onClose={() => setFloorModal(null)} />}
      </div>
    )
  }

  const filteredFloors = floors.filter((f) =>
    !search ||
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.units.some((u) => u.tenant?.name?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <KpiCard icon="layers" label="Floors" value={floors.length} sub={`${filteredFloors.length} shown`} />
        <KpiCard icon="meeting_room" label="Total Units" value={totalUnits} sub={`${occupiedUnits} occupied`} />
        <KpiCard icon="real_estate_agent" label="Occupancy" value={`${occupancyPct}%`} sub={`${vacantUnits} vacant`} accent={vacantUnits === 0 ? 'bg-green-50' : 'bg-primary-50'} />
        <KpiCard icon="payments" label="Monthly Revenue" value={`UGX ${(monthlyRevenue / 1000000).toFixed(1)}M`} sub={`${tenantsCount} tenants`} />
        <KpiCard icon="warning" label="Outstanding Debt" value={`UGX ${(totalDebt / 1000000).toFixed(1)}M`} sub={totalDebt > 0 ? 'Across all tenants' : 'All cleared'} accent={totalDebt > 0 ? 'bg-red-50' : 'bg-green-50'} />
        <KpiCard icon="bed" label="Vacant" value={vacantUnits} sub={`${totalUnits > 0 ? Math.round((vacantUnits / totalUnits) * 100) : 0}% of units`} accent={vacantUnits > 0 ? 'bg-orange-50' : 'bg-green-50'} />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <p className="text-xs text-on-surface-muted font-medium">{floors.length} floor{floors.length !== 1 ? 's' : ''} &middot; {tenantsCount} tenant{tenantsCount !== 1 ? 's' : ''}</p>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-dim text-sm pointer-events-none">search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search floor or tenant..."
              className="w-48 h-8 pl-7 pr-2.5 border border-outline rounded-lg text-xs text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
        </div>
        <button onClick={() => setFloorModal({ mode: 'add' })}
          className="px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-card inline-flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">add</span>
          Add Floor
        </button>
      </div>

      <div className="grid gap-4">
        {filteredFloors.map((floor) => {
          const occ = floor.units.filter(u => u.status === 'occupied').length
          const vac = floor.units.length - occ
          const pct = Math.round((occ / floor.units.length) * 100)
          const isExpanded = expandedFloor === floor.name
          const floorDebt = floor.units.reduce((s, u) => s + Math.max(0, u.tenant?.outstandingBalance || 0), 0)
          const floorRevenue = floor.units.reduce((s, u) => s + (u.status === 'occupied' ? (u.monthlyRent || 0) : 0), 0)
          const floorTenants = floor.units.filter(u => u.tenant).length

          return (
            <div key={floor.name} className="bg-surface rounded-card border border-outline overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Link to={`/properties/floor/${floorSlug(floor.name)}`}
                      className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary shrink-0 hover:bg-primary-100 transition-colors">
                      <span className="material-symbols-outlined text-xl">layers</span>
                    </Link>
                    <div className="min-w-0">
                      <Link to={`/properties/floor/${floorSlug(floor.name)}`}
                        className="text-base font-semibold text-on-surface hover:text-primary transition-colors block truncate">
                        {floor.name}
                      </Link>
                      <p className="text-xs text-on-surface-muted">{occ} occupied &middot; {vac} vacant &middot; {floor.units.length} units</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setFloorModal({ mode: 'edit', name: floor.name })}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-primary hover:bg-primary-50 transition-colors"
                      title="Edit floor">
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button onClick={() => setConfirmDelete({ type: 'floor', name: floor.name, title: 'Delete Floor', message: `Delete ${floor.name} and all its units? This cannot be undone.` })}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-status-unpaid hover:bg-red-50 transition-colors"
                      title="Delete floor">
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                    <button onClick={() => setExpandedFloor(isExpanded ? null : floor.name)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-dim hover:text-on-surface hover:bg-surface-container transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand'}>
                      <span className="material-symbols-outlined text-base">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#059669' : '#0037b0' }} />
                  </div>
                  <span className="text-xs font-semibold text-on-surface-muted shrink-0">{pct}%</span>
                </div>

                <div className="flex items-center gap-5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-on-surface-dim">payments</span>
                    <span className="font-medium text-on-surface">UGX {(floorRevenue / 1000000).toFixed(1)}M</span>
                    <span className="text-on-surface-dim">/mo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-on-surface-dim">groups</span>
                    <span className="font-medium text-on-surface">{floorTenants}</span>
                    <span className="text-on-surface-dim">tenant{floorTenants !== 1 ? 's' : ''}</span>
                  </div>
                  {floorDebt > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-status-unpaid">warning</span>
                      <span className="font-medium text-status-unpaid">UGX {(floorDebt / 1000000).toFixed(1)}M</span>
                      <span className="text-on-surface-dim">debt</span>
                    </div>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-outline bg-surface-container/30">
                  <div className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {floor.units.map((unit) => {
                        const occupied = unit.status === 'occupied'
                        const t = unit.tenant
                        return (
                          <div key={unit.id} className="relative group/unit">
                            <Link to={`/properties/floor/${floorSlug(floor.name)}/unit/${unit.id}`}
                              className={`block rounded-lg border p-3 text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${occupied ? 'bg-surface border-outline hover:border-primary/40' : 'bg-surface-container border-dashed border-outline hover:border-primary/30'}`}>
                              <div className={`w-6 h-6 rounded-full mx-auto mb-2 flex items-center justify-center ${occupied ? 'bg-primary-50' : 'bg-surface-container-highest'}`}>
                                <span className={`material-symbols-outlined text-xs ${occupied ? 'text-primary' : 'text-on-surface-dim'}`}>
                                  {occupied ? 'store' : 'meeting_room'}
                                </span>
                              </div>
                              <p className={`text-xs font-semibold ${occupied ? 'text-on-surface' : 'text-on-surface-muted'}`}>{unit.name}</p>
                              {t ? (
                                <>
                                  <p className="text-[10px] text-on-surface-muted mt-0.5 truncate">{t.name}</p>
                                  <div className="mt-1.5 flex items-center justify-center gap-2 text-[9px]">
                                    <span className="font-medium text-on-surface">UGX {(unit.monthlyRent || 0).toLocaleString()}</span>
                                    {(t.outstandingBalance || 0) > 0 && (
                                      <span className="text-status-unpaid font-medium">{Math.ceil((t.outstandingBalance || 0) / (unit.monthlyRent || 1))}mo</span>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <p className="text-[10px] text-primary/70 mt-0.5 font-medium">Add tenant</p>
                              )}
                            </Link>
                            {t && (
                              <div className="absolute -top-1.5 -right-1.5 flex gap-0.5 opacity-0 group-hover/unit:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.preventDefault(); setTenantModal({ mode: 'edit', floor: floor.name, unit: unit.id, data: t }) }}
                                  className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] hover:bg-primary-600 shadow-sm"
                                  title="Edit tenant">
                                  <span className="material-symbols-outlined text-[12px]">edit</span>
                                </button>
                                <button onClick={(e) => { e.preventDefault(); setConfirmDelete({ type: 'tenant', floorName: floor.name, unitId: unit.id, title: 'Remove Tenant', message: `Remove ${t.name} from ${unit.name}? Their payment history will be preserved.` }) }}
                                  className="w-5 h-5 rounded-full bg-status-unpaid text-white flex items-center justify-center text-[10px] hover:bg-red-700 shadow-sm"
                                  title="Remove tenant">
                                  <span className="material-symbols-outlined text-[12px]">close</span>
                                </button>
                              </div>
                            )}
                            {!occupied && (
                              <button onClick={(e) => { e.preventDefault(); setTenantModal({ mode: 'add', floor: floor.name, unit: unit.id }) }}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] hover:bg-primary-600 shadow-sm opacity-0 group-hover/unit:opacity-100 transition-opacity"
                                title="Add tenant">
                                <span className="material-symbols-outlined text-[12px]">add</span>
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3 border-t border-outline bg-surface-container/50">
                    <Link to={`/properties/floor/${floorSlug(floor.name)}`}
                      className="text-xs font-medium text-primary hover:text-primary-600 transition-colors inline-flex items-center gap-1">
                      View floor details
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </Link>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setTenantModal({ mode: 'add', floor: floor.name })}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-600 rounded-lg transition-colors shadow-sm inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">person_add</span>
                        Add Tenant
                      </button>
                    </div>
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

      <ConfirmModal
        isOpen={!!confirmDelete}
        title={confirmDelete?.title || ''}
        message={confirmDelete?.message || ''}
        onConfirm={() => {
          if (!confirmDelete) return
          const { type, name, floorName, unitId } = confirmDelete
          setConfirmDelete(null)
          if (type === 'floor') handleDeleteFloor(name)
          else if (type === 'tenant') handleDeleteTenant(floorName, unitId)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
