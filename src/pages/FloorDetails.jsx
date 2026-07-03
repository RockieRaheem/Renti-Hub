import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import StatusBadge from '../components/ui/StatusBadge'
import FloorFormModal from '../components/FloorFormModal'
import TenantFormModal from '../components/TenantFormModal'
import UnitFormModal from '../components/UnitFormModal'
import ReassignTenantModal from '../components/ReassignTenantModal'
import PaymentReceipt from '../components/PaymentReceipt'

export default function FloorDetails() {
  const { floorName } = useParams()
  const navigate = useNavigate()
  const { building, floorSlug, getFloorBySlug, getAvatarColor, deleteFloor, deleteTenant, deleteUnit, addPayment } = useBuilding()
  const floor = getFloorBySlug(floorName)
  const [showFloorModal, setShowFloorModal] = useState(false)
  const [tenantModal, setTenantModal] = useState(null)
  const [unitModal, setUnitModal] = useState(null)
  const [reassignModal, setReassignModal] = useState(null)
  const [paymentModal, setPaymentModal] = useState(null)
  const [paymentReceipt, setPaymentReceipt] = useState(null)

  const handleFloorPayment = async (tenant, unitName) => {
    const result = await addPayment({
      floor: floor.name, unit: unitName,
      amount: tenant.monthlyRent || 0, method: 'Cash',
      tenantName: tenant.name, status: 'Paid',
      date: new Date().toISOString().slice(0, 10),
    })
    if (result?.error) {
      alert(result.error)
    } else if (result) {
      setPaymentReceipt(result)
      setPaymentModal(null)
    }
  }

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
            <div className="flex items-center gap-2">
              {vac > 0 ? (
                <button onClick={() => setTenantModal({ mode: 'add', floor: floor.name })}
                  className="px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-card inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">person_add</span>
                  Add Tenant
                </button>
              ) : (
                <span className="text-[11px] text-on-surface-dim italic">All units occupied</span>
              )}
              <Link to="/properties" className="text-xs font-medium text-primary hover:text-primary-600 transition-colors">Back to overview</Link>
            </div>
          </div>

          <div className="grid gap-3">
            {floor.units.map((unit) => {
              const t = unit.tenant
              const occupied = unit.status === 'occupied'
              return (
                <div key={unit.id} className={`rounded-lg border transition-all group ${occupied ? 'bg-surface border-outline hover:border-primary/30 hover:shadow-card-hover' : 'bg-surface-container/30 border-dashed border-outline hover:border-primary/30 hover:shadow-card-hover'}`}>
                  <div className="flex items-center justify-between p-4">
                    <Link to={`/properties/floor/${floorName}/unit/${unit.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0 ${occupied ? 'bg-primary-50 text-primary' : 'bg-surface-container text-on-surface-dim'}`}>
                        <span className="material-symbols-outlined text-xl">{occupied ? 'store' : 'meeting_room'}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{unit.name}</h3>
                          <StatusBadge status={unit.status} />
                        </div>
                        <p className="text-xs text-on-surface-muted">{unit.type} &middot; {unit.size}</p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-3 shrink-0">
                      {t ? (
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold ${getAvatarColor(t.initials)}`}>
                            {t.initials}
                          </div>
                          <Link to={`/tenant-payments/${floorName}/${unit.id}`}
                            className="text-sm text-on-surface-muted hover:text-primary transition-colors hidden sm:inline max-w-[120px] truncate">
                            {t.name}
                          </Link>
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-dim italic hidden sm:inline">Vacant</span>
                      )}
                      <div className="text-right min-w-[80px]">
                        <p className="text-sm font-semibold text-on-surface">{unit.rent}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {occupied && (
                          <>
                            <IconBtn icon="payments" title="Record payment" onClick={() => setPaymentModal({ tenant: t, unit: unit.name })} color="primary" />
                            <IconBtn icon="edit" title="Edit tenant" onClick={() => setTenantModal({ mode: 'edit', floor: floor.name, unit: unit.id, data: t })} color="primary" />
                            <Link to={`/tenant-payments/${floorName}/${unit.id}`}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-primary hover:bg-primary-50 transition-colors"
                              title="Payment history">
                              <span className="material-symbols-outlined text-base">receipt_long</span>
                            </Link>
                            <IconBtn icon="swap_horiz" title="Reassign to new tenant" onClick={() => setReassignModal({ unit })} color="amber" />
                            <IconBtn icon="person_remove" title="Remove tenant" onClick={() => { if (window.confirm(`Remove ${t.name} from ${unit.name}?`)) deleteTenant(floor.name, unit.id) }} color="red" />
                          </>
                        )}
                        {!occupied && (
                          <>
                            <IconBtn icon="person_add" title="Add tenant" onClick={() => setTenantModal({ mode: 'add', floor: floor.name, unit: unit.id })} color="primary" />
                          </>
                        )}
                        <IconBtn icon="edit" title="Edit unit" onClick={() => setUnitModal({ unit })} color="primary" />
                        <IconBtn icon="delete" title="Delete unit" onClick={() => { if (window.confirm(`Delete ${unit.name} from ${floor.name}?`)) deleteUnit(floor.name, unit.id) }} color="red" />
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

      {showFloorModal && <FloorFormModal mode="edit" floorName={floor.name} onClose={() => setShowFloorModal(false)} />}

      {tenantModal && (
        <TenantFormModal
          mode={tenantModal.mode}
          floorName={tenantModal.floor || floor.name}
          unitId={tenantModal.unit || (tenantModal.data?.name ? findUnitId(floor, tenantModal.data) : null)}
          initialData={tenantModal.data}
          onClose={() => setTenantModal(null)}
        />
      )}

      {unitModal && (
        <UnitFormModal floorName={floor.name} unit={unitModal.unit} onClose={() => setUnitModal(null)} />
      )}

      {reassignModal && (
        <ReassignTenantModal floorName={floor.name} unit={reassignModal.unit} onClose={() => setReassignModal(null)} />
      )}

      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setPaymentModal(null) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline">
              <div>
                <h2 className="text-base font-bold text-on-surface">Record Payment</h2>
                <p className="text-xs text-on-surface-muted mt-0.5">{paymentModal.tenant.name} &middot; {paymentModal.unit}</p>
              </div>
              <button onClick={() => setPaymentModal(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-surface-container/50 rounded-lg p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-on-surface-muted">Tenant</span>
                  <span className="font-medium text-on-surface">{paymentModal.tenant.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-muted">Unit</span>
                  <span className="font-medium text-on-surface">{paymentModal.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-muted">Monthly Rent</span>
                  <span className="font-medium text-on-surface">UGX {(paymentModal.tenant.monthlyRent || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-muted">Outstanding</span>
                  <span className={`font-medium ${(paymentModal.tenant.outstandingBalance || 0) > 0 ? 'text-status-unpaid' : 'text-status-paid'}`}>
                    {paymentModal.tenant.outstandingBalance > 0 ? `UGX ${paymentModal.tenant.outstandingBalance.toLocaleString()}` : 'Cleared'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => setPaymentModal(null)}
                  className="px-4 py-2.5 text-sm font-medium text-on-surface-muted hover:bg-surface-container rounded-lg transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleFloorPayment(paymentModal.tenant, paymentModal.unit)}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-card transition-colors inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">payments</span>
                  Pay UGX {(paymentModal.tenant.monthlyRent || 0).toLocaleString()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {paymentReceipt && (
        <PaymentReceipt
          payment={paymentReceipt}
          tenant={paymentReceipt.tenantName}
          floor={floor?.name}
          unit={paymentReceipt.unit}
          buildingName={building?.name}
          onClose={() => setPaymentReceipt(null)}
        />
      )}
    </div>
  )
}

function findUnitId(floor, tenant) {
  if (!floor || !tenant) return null
  const unit = floor.units.find(u => u.tenant && u.tenant.name === tenant.name)
  return unit ? unit.id : null
}

function IconBtn({ icon, title, onClick, color }) {
  const colorMap = {
    primary: 'text-on-surface-muted hover:text-primary hover:bg-primary-50',
    red: 'text-on-surface-muted hover:text-status-unpaid hover:bg-red-50',
    amber: 'text-on-surface-muted hover:text-amber-600 hover:bg-amber-50',
  }
  return (
    <button onClick={onClick}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${colorMap[color] || colorMap.primary}`}
      title={title}>
      <span className="material-symbols-outlined text-base">{icon}</span>
    </button>
  )
}
