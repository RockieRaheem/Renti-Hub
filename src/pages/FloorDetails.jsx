import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import StatusBadge from '../components/ui/StatusBadge'
import FloorFormModal from '../components/FloorFormModal'
import TenantFormModal from '../components/TenantFormModal'
import UnitFormModal from '../components/UnitFormModal'
import ReassignTenantModal from '../components/ReassignTenantModal'
import PaymentReceipt from '../components/PaymentReceipt'
import { fetchUnpaidPeriodCounts } from '../lib/queries'

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
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'Cash', date: new Date().toISOString().slice(0, 10) })
  const [paymentReceipt, setPaymentReceipt] = useState(null)
  const [paymentSubmitting, setPaymentSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const [unpaidMonthCount, setUnpaidMonthCount] = useState(0)

  const handleFloorPayment = async (e) => {
    e.preventDefault()
    const amount = parseFloat(paymentForm.amount)
    if (!amount || amount <= 0) { setPaymentError('Enter a valid payment amount'); return }
    setPaymentError(null)
    setPaymentSubmitting(true)
    try {
      const result = await addPayment({
        floor: floor.name, unit: paymentModal.unit,
        amount, method: paymentForm.method,
        tenantName: paymentModal.tenant.name, status: 'Paid',
        date: paymentForm.date,
      })
      if (result?.error) {
        setPaymentError(result.error)
      } else if (result) {
        setPaymentReceipt(result)
        setPaymentModal(null)
        setPaymentForm({ amount: '', method: 'Cash', date: new Date().toISOString().slice(0, 10) })
      }
    } catch {
      setPaymentError('An unexpected error occurred')
    } finally {
      setPaymentSubmitting(false)
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
                            <IconBtn icon="payments" title="Record payment" onClick={() => { setPaymentModal({ tenant: t, unit: unit.name, monthlyRent: unit.monthlyRent || 0 }); setPaymentForm({ amount: '', method: 'Cash', date: new Date().toISOString().slice(0, 10) }); setPaymentError(null); setUnpaidMonthCount(0); if (t?.id) fetchUnpaidPeriodCounts([t.id]).then(({ data }) => { if (data) setUnpaidMonthCount(data[t.id] || 0) }) }} color="primary" />
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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) { setPaymentModal(null); setPaymentError(null) } }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-outline">
              <h2 className="text-sm font-bold text-on-surface">Record Payment</h2>
              <button onClick={() => { setPaymentModal(null); setPaymentError(null) }} className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <form onSubmit={handleFloorPayment} className="p-4 space-y-3">
              {paymentForm.date && paymentModal?.tenant?.name && (
                <div className="bg-primary-50 border border-primary-100 rounded-lg px-3 py-1.5 text-[11px] text-primary-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs">calendar_month</span>
                  <span>Paying <strong>{paymentMonthLabel(paymentForm.date)}</strong> for <strong>{paymentModal.tenant.name}</strong></span>
                </div>
              )}

              <div className="bg-surface-container rounded-lg border border-outline p-2.5 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-dim">{paymentModal.tenant.name}</span>
                  <span className="text-on-surface-muted">{paymentModal.unit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-dim">Rent</span>
                  <span className="font-medium text-on-surface">UGX {(paymentModal.monthlyRent || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-dim">Outstanding</span>
                  <span className={`font-semibold ${(paymentModal.tenant.outstandingBalance || 0) > 0 ? 'text-status-unpaid' : (paymentModal.tenant.outstandingBalance || 0) < 0 ? 'text-blue-600' : 'text-status-paid'}`}>
                    {(paymentModal.tenant.outstandingBalance || 0) > 0
                      ? <>UGX {paymentModal.tenant.outstandingBalance.toLocaleString()}{unpaidMonthCount > 0 ? <span className="text-[10px] text-on-surface-dim font-normal"> ({unpaidMonthCount}mo)</span> : ''}</>
                      : (paymentModal.tenant.outstandingBalance || 0) < 0
                        ? `UGX ${Math.abs(paymentModal.tenant.outstandingBalance).toLocaleString()} cr`
                        : 'Settled'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-on-surface-muted uppercase tracking-wide mb-1">Amount (UGX)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-dim text-xs font-medium">UGX</span>
                  <input type="number" min="0" step="100" required autoFocus
                    value={paymentForm.amount} onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                    className="w-full h-9 pl-9 pr-2.5 border border-outline rounded-lg text-xs text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-on-surface-muted uppercase tracking-wide mb-1">Method</label>
                  <select value={paymentForm.method} onChange={(e) => setPaymentForm((p) => ({ ...p, method: e.target.value }))}
                    className="w-full h-9 px-2.5 border border-outline rounded-lg text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-no-repeat bg-[length:14px] bg-[right_10px_center]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")" }}>
                    <option value="Cash">Cash</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-on-surface-muted uppercase tracking-wide mb-1">Date</label>
                  <input type="date" value={paymentForm.date}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full h-9 px-2.5 border border-outline rounded-lg text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>

              {paymentError && (
                <div className="flex items-start gap-1.5 p-2.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700">
                  <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">error</span>
                  <span>{paymentError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button type="button" onClick={() => { setPaymentModal(null); setPaymentError(null) }}
                  className="px-3 py-1.5 text-xs font-medium text-on-surface-muted hover:bg-surface-container rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={paymentSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-card transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1">
                  {paymentSubmitting ? (
                    <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <><span className="material-symbols-outlined text-sm">payments</span> Record</>
                  )}
                </button>
              </div>
            </form>
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

function paymentMonthLabel(dateStr) {
  if (!dateStr) return ''
  const dt = new Date(dateStr + 'T00:00:00')
  if (isNaN(dt.getTime())) return ''
  return dt.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
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
