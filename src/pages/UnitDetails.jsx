import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import StatusBadge from '../components/ui/StatusBadge'
import TenantFormModal from '../components/TenantFormModal'
import ConfirmModal from '../components/ConfirmModal'

export default function UnitDetails() {
  const { floorName, unitId } = useParams()
  const { building, getUnitByFloorAndId, maintenance, getAvatarColor, deleteTenant } = useBuilding()
  const unit = getUnitByFloorAndId(floorName, unitId)
  const t = unit?.tenant
  const [showTenantModal, setShowTenantModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const unitMaintenance = [
    ...maintenance.pending.filter((m) => m.floor === unit?.floor && m.unit === unit?.name),
    ...maintenance.inProgress.filter((m) => m.floor === unit?.floor && m.unit === unit?.name),
    ...maintenance.resolved.filter((m) => m.floor === unit?.floor && m.unit === unit?.name),
  ]

  if (!unit) {
    return (
      <div className="p-6 md:p-8 text-center py-20">
        <span className="material-symbols-outlined text-4xl text-on-surface-dim mb-3">meeting_room</span>
        <p className="text-sm text-on-surface-muted">Unit not found</p>
        <Link to={`/properties/floor/${floorName}`} className="text-sm font-medium text-primary hover:underline mt-2 inline-block">Back to Floor</Link>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-on-surface-muted">
        <Link to="/properties" className="hover:text-primary transition-colors">Tenants</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link to={`/properties/floor/${floorName}`} className="hover:text-primary transition-colors">{unit.floor}</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-on-surface font-medium">{unit.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-surface rounded-card border border-outline overflow-hidden shadow-card">
            <div className={`h-1.5 ${t ? 'bg-status-paid' : 'bg-status-vacant'}`} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${t ? 'bg-primary-50 text-primary' : 'bg-surface-container text-on-surface-dim'}`}>
                    <span className="material-symbols-outlined">{t ? 'store' : 'meeting_room'}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">{unit.name}</h2>
                    <p className="text-sm text-on-surface-muted">{unit.floor} &middot; {building.name}</p>
                  </div>
                </div>
                <StatusBadge status={unit.status} />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Type', value: unit.type },
                  { label: 'Size', value: unit.size },
                  { label: 'Annual Rent', value: unit.rent },
                ].map((d) => (
                  <div key={d.label} className="bg-surface-container rounded-lg p-3 text-center">
                    <p className="text-xs text-on-surface-muted">{d.label}</p>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">{d.value}</p>
                  </div>
                ))}
              </div>

              {t ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider">Tenant Details</h3>
                    <div className="flex gap-1">
                      <button onClick={() => setShowTenantModal(true)}
                        className="px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary-50 rounded-lg transition-colors inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Edit
                      </button>
                      <button onClick={() => setConfirmDelete({ title: 'Remove Tenant', message: `Remove ${t.name} from ${unit.name}? Their payment history will be preserved.` })}
                        className="px-2.5 py-1.5 text-xs font-medium text-status-unpaid hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">person_remove</span>
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4 p-3 bg-surface-container rounded-lg">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${getAvatarColor(t.initials)}`}>
                      {t.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface">{t.name}</p>
                      <p className="text-xs text-on-surface-muted truncate">{t.email} &middot; {t.phone}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={t.paymentStatus} />
                      <div className={`w-2 h-2 rounded-full ${t.paid ? 'bg-status-paid' : 'bg-status-unpaid'}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: 'Lease Start', value: t.leaseStart || '—' },
                      { label: 'Lease End', value: t.leaseEnd || '—' },
                      { label: 'Lease Term', value: t.leaseTerm || '—' },
                      { label: 'Monthly Rent', value: `UGX ${(unit.monthlyRent || 0).toLocaleString()}` },
                    ].map((d) => (
                      <div key={d.label} className="bg-surface-container rounded-lg p-3">
                        <p className="text-xs text-on-surface-muted mb-0.5">{d.label}</p>
                        <p className="font-medium text-on-surface">{d.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-outline pt-4 space-y-2 text-sm">
                    <h4 className="text-xs font-semibold text-on-surface uppercase tracking-wider mb-2">Payment History</h4>
                    <div className="space-y-1">
                      {[
                        { label: 'Last Payment', value: t.lastPayment || 'N/A', color: 'text-status-paid' },
                        { label: 'Date', value: t.lastPaymentDate || 'N/A', color: 'text-on-surface' },
                        { label: 'Status', value: t.paid ? 'Up to date' : 'Outstanding balance', color: t.paid ? 'text-status-paid' : 'text-status-unpaid' },
                      ].map((d) => (
                        <div key={d.label} className="flex justify-between py-1.5 border-b border-outline/50">
                          <span className="text-on-surface-muted">{d.label}</span>
                          <span className={`font-medium ${d.color}`}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                    <Link to={`/tenant-payments/${floorName}/${unit.id}`}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-card">
                      <span className="material-symbols-outlined text-lg">receipt_long</span>
                      View Full Payment History
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 text-center">
                  <span className="material-symbols-outlined text-amber-500 text-3xl mb-2">meeting_room</span>
                  <p className="text-amber-800 font-medium">This unit is currently vacant</p>
                  <p className="text-amber-600 text-sm mt-1">Available for lease at {unit.rent}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-card border border-outline p-5 shadow-card">
            <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { icon: 'payments', label: 'Record Payment', sub: t ? `UGX ${(unit.monthlyRent || 0).toLocaleString()}/mo` : 'No tenant', to: '/rent-collection', color: 'bg-primary-50 text-primary', disabled: !t },
                { icon: 'build', label: 'Report Maintenance', sub: `${unitMaintenance.length} past requests`, to: '/maintenance-board', color: 'bg-orange-50 text-orange-700', disabled: !t },
                { icon: 'receipt_long', label: 'Payment History', sub: t ? 'View full payment ledger' : 'No tenant', to: `/tenant-payments/${floorName}/${unit.id}`, color: 'bg-indigo-50 text-indigo-600', disabled: !t },
                { icon: 'arrow_back', label: 'Back to Floor', sub: unit.floor, to: `/properties/floor/${floorName}`, color: 'bg-surface-container text-on-surface-muted' },
              ].map((a) => (
                <Link key={a.label} to={a.to}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-lg border border-outline hover:border-primary/30 hover:bg-primary-50/30 transition-all ${a.disabled ? 'opacity-40 pointer-events-none' : ''}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${a.color}`}>
                    <span className="material-symbols-outlined text-lg">{a.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">{a.label}</p>
                    <p className="text-xs text-on-surface-muted">{a.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {unitMaintenance.length > 0 && (
            <div className="bg-surface rounded-card border border-outline p-5 shadow-card">
              <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider mb-4">Maintenance Requests</h3>
              <div className="space-y-2">
                {unitMaintenance.map((m) => (
                  <div key={m.id} className={`rounded-lg border p-3 text-sm ${
                    m.resolution ? 'bg-green-50 border-green-200' :
                    m.assignee ? 'bg-blue-50 border-blue-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-start justify-between mb-1">
                      <StatusBadge status={m.priority} />
                      <span className="text-[10px] text-on-surface-muted">{m.date}</span>
                    </div>
                    <p className="text-sm font-medium text-on-surface mt-1">{m.title}</p>
                    {m.resolution && <p className="text-xs text-status-paid mt-1">{m.resolution}</p>}
                    {m.assignee && <p className="text-xs text-on-surface-muted mt-1">Assigned: {m.assignee}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-surface rounded-card border border-outline p-5 shadow-card">
            <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider mb-4">Unit Information</h3>
            <div className="space-y-1 text-sm">
              {[
                { label: 'Unit ID', value: unit.id },
                { label: 'Floor', value: unit.floor },
                { label: 'Type', value: unit.type },
                { label: 'Size', value: unit.size },
                { label: 'Annual Rent', value: unit.rent },
              ].map((d) => (
                <div key={d.label} className="flex justify-between py-1.5 border-b border-outline/50 last:border-0">
                  <span className="text-on-surface-muted">{d.label}</span>
                  <span className="font-medium text-on-surface">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showTenantModal && (
        <TenantFormModal
          mode="edit"
          floorName={unit.floor}
          unitId={unit.id}
          initialData={t}
          onClose={() => setShowTenantModal(false)}
        />
      )}

      <ConfirmModal
        isOpen={!!confirmDelete}
        title={confirmDelete?.title || ''}
        message={confirmDelete?.message || ''}
        onConfirm={() => { setConfirmDelete(null); deleteTenant(unit.floor, unit.id) }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
