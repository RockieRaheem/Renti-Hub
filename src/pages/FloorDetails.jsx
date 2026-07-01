import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import StatusBadge from '../components/ui/StatusBadge'
import FloorFormModal from '../components/FloorFormModal'
import TenantFormModal from '../components/TenantFormModal'

export default function FloorDetails() {
  const { floorName } = useParams()
  const navigate = useNavigate()
  const { building, floorSlug, getFloorBySlug, getAvatarColor, deleteFloor, deleteTenant } = useBuilding()
  const floor = getFloorBySlug(floorName)
  const [showFloorModal, setShowFloorModal] = useState(false)
  const [tenantModal, setTenantModal] = useState(null)

  if (!floor) {
    return (
      <div className="p-6 md:p-8 text-center py-20">
        <span className="material-symbols-outlined text-4xl text-on-surface-dim mb-3">layers</span>
        <p className="text-sm text-on-surface-muted">Floor not found</p>
        <Link to="/properties" className="text-sm font-medium text-primary hover:underline mt-2 inline-block">Back to Tenants</Link>
      </div>
    )
  }

  const occ = floor.units.filter((u) => u.status === 'occupied').length
  const vac = floor.units.length - occ
  const rev = floor.units.reduce((s, u) => s + (u.status === 'occupied' ? u.monthlyRent : 0), 0)
  const pct = Math.round((occ / floor.units.length) * 100)

  return (
    <div className="p-6 md:p-8 space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-on-surface-muted">
        <Link to="/properties" className="hover:text-primary transition-colors">Tenants</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-on-surface font-medium">{floor.name}</span>
      </nav>

      <div className="bg-surface rounded-card border border-outline overflow-hidden shadow-card">
        <div className="h-1.5 bg-gradient-to-r from-primary to-primary-300" />
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-on-surface">{floor.name}</h2>
                <div className="flex gap-1">
                  <button onClick={() => setShowFloorModal(true)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-primary hover:bg-primary-50 transition-colors text-sm"
                    title="Edit floor">
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                  <button onClick={() => { if (window.confirm(`Delete ${floor.name} and all its units?`)) { deleteFloor(floor.name); navigate('/properties') } }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-status-unpaid hover:bg-red-50 transition-colors text-sm"
                    title="Delete floor">
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
              <p className="text-sm text-on-surface-muted">{building.name} &middot; {floor.units.length} unit{floor.units.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-5 text-sm">
              <div className="text-center">
                <p className="font-bold text-on-surface text-lg">{occ}</p>
                <p className="text-[10px] text-on-surface-muted uppercase tracking-wide">Occupied</p>
              </div>
              <div className="w-px h-8 bg-outline" />
              <div className="text-center">
                <p className="font-bold text-on-surface-dim text-lg">{vac}</p>
                <p className="text-[10px] text-on-surface-muted uppercase tracking-wide">Vacant</p>
              </div>
              <div className="w-px h-8 bg-outline" />
              <div className="text-center">
                <p className="font-bold text-primary text-lg">{pct}%</p>
                <p className="text-[10px] text-on-surface-muted uppercase tracking-wide">Full</p>
              </div>
              <div className="w-px h-8 bg-outline" />
              <div className="text-center">
                <p className="font-bold text-on-surface text-lg">UGX {(rev / 1000000).toFixed(1)}M</p>
                <p className="text-[10px] text-on-surface-muted uppercase tracking-wide">Revenue</p>
              </div>
            </div>
          </div>

          <div className="h-2 bg-surface-container-highest rounded-full mb-6">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-on-surface uppercase tracking-wider">Units</p>
            <Link to="/properties" className="text-xs font-medium text-primary hover:text-primary-600 transition-colors">Back to overview</Link>
          </div>

          <div className="grid gap-4">
            {floor.units.map((unit) => {
              const t = unit.tenant
              return (
                <div key={unit.id} className="bg-surface rounded-lg border border-outline hover:border-primary/30 hover:shadow-card-hover transition-all group">
                  <div className="flex items-center justify-between p-4">
                    <Link to={`/properties/floor/${floorName}/unit/${unit.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0 ${unit.status === 'occupied' ? 'bg-primary-50 text-primary' : 'bg-surface-container text-on-surface-dim'}`}>
                        <span className="material-symbols-outlined text-xl">{unit.status === 'occupied' ? 'store' : 'meeting_room'}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{unit.name}</h3>
                          <StatusBadge status={unit.status} />
                        </div>
                        <p className="text-xs text-on-surface-muted">{unit.type} &middot; {unit.size}</p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-4 shrink-0">
                      {t ? (
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold ${getAvatarColor(t.initials)}`}>
                            {t.initials}
                          </div>
                          <span className="text-sm text-on-surface-muted hidden sm:inline">{t.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-dim italic">Vacant</span>
                      )}
                      <div className="text-right">
                        <p className="text-sm font-semibold text-on-surface">{unit.rent}</p>
                      </div>
                      <div className="flex gap-1">
                        {t && (
                          <>
                            <button onClick={() => setTenantModal({ mode: 'edit', data: t })}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-primary hover:bg-primary-50 transition-colors"
                              title="Edit tenant">
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button onClick={() => { deleteTenant(floor.name, unit.id) }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-status-unpaid hover:bg-red-50 transition-colors"
                              title="Remove tenant">
                              <span className="material-symbols-outlined text-base">person_remove</span>
                            </button>
                          </>
                        )}
                        <Link to={`/properties/floor/${floorName}/unit/${unit.id}`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-dim hover:text-primary hover:bg-primary-50 transition-colors"
                          title="View details">
                          <span className="material-symbols-outlined text-base">chevron_right</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {showFloorModal && (
        <FloorFormModal mode="edit" floorName={floor.name} onClose={() => setShowFloorModal(false)} />
      )}
      {tenantModal && (
        <TenantFormModal
          mode={tenantModal.mode}
          floorName={floor.name}
          unitId={unitIdForTenant(floor, tenantModal.data)}
          initialData={tenantModal.data}
          onClose={() => setTenantModal(null)}
        />
      )}
    </div>
  )
}

function unitIdForTenant(floor, tenant) {
  if (!floor || !tenant) return null
  const unit = floor.units.find(u => u.tenant && u.tenant.name === tenant.name)
  return unit ? unit.id : null
}
