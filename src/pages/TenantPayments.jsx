import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import { fetchPaymentsByTenant } from '../lib/queries'
import PaymentReceipt from '../components/PaymentReceipt'

function fmtDate(d) {
  if (!d) return '—'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return d
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtTime(d) {
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  return dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function TenantPayments() {
  const { floorName, unitId } = useParams()
  const { getUnitByFloorAndId, building } = useBuilding()
  const unit = getUnitByFloorAndId(floorName, unitId)
  const tenant = unit?.tenant
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [receipt, setReceipt] = useState(null)

  useEffect(() => {
    if (!tenant?.id) { setLoading(false); return }
    setLoading(true)
    fetchPaymentsByTenant(tenant.id).then(({ data, error }) => {
      if (data) setPayments(data)
      setLoading(false)
    })
  }, [tenant?.id])

  if (!unit) {
    return (
      <div className="p-6 md:p-8 text-center py-20">
        <span className="material-symbols-outlined text-4xl text-on-surface-dim mb-3">receipt_long</span>
        <p className="text-sm text-on-surface-muted">Tenant not found</p>
        <Link to="/rent-collection" className="text-sm font-medium text-primary hover:underline mt-2 inline-block">Back to Rent Collection</Link>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="p-6 md:p-8 text-center py-20">
        <span className="material-symbols-outlined text-4xl text-on-surface-dim mb-3">person_off</span>
        <p className="text-sm text-on-surface-muted">No tenant assigned to this unit</p>
        <Link to={`/properties/floor/${floorName}`} className="text-sm font-medium text-primary hover:underline mt-2 inline-block">Back to Floor</Link>
      </div>
    )
  }

  const monthlyRent = unit.monthlyRent || 0
  const currentBalance = tenant.outstandingBalance || 0
  const credit = Math.max(0, -currentBalance)
  const outstanding = Math.max(0, currentBalance)

  const running = []
  const sorted = [...payments].reverse()
  let currentObligation
  if (currentBalance > 0) {
    currentObligation = currentBalance
  } else if (currentBalance < 0) {
    currentObligation = Math.max(0, monthlyRent + currentBalance)
  } else {
    currentObligation = monthlyRent
  }
  sorted.forEach((p, i) => {
    const balBefore = currentObligation
    const balAfter = Math.max(0, balBefore - p.amount)
    running.push({ ...p, balBefore, balAfter, idx: i + 1 })
    currentObligation = balAfter
    if (balAfter === 0 && i < sorted.length - 1) {
      currentObligation = monthlyRent
    }
  })
  running.reverse()

  const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const hasCredit = credit > 0

  return (
    <div className="p-6 md:p-8 space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-on-surface-muted">
        <Link to="/rent-collection" className="hover:text-primary transition-colors">Rent Collection</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link to={`/properties/floor/${floorName}`} className="hover:text-primary transition-colors">{unit.floor}</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-on-surface font-medium">{tenant.name}</span>
      </nav>

      <div className="bg-surface rounded-card border border-outline overflow-hidden shadow-card">
        <div className="h-1.5 bg-gradient-to-r from-primary to-primary-300" />
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">person</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-on-surface">{tenant.name}</h2>
                <p className="text-sm text-on-surface-muted">{unit.name} &middot; {unit.floor} &middot; {unit.type}</p>
              </div>
            </div>
            <Link to={`/properties/floor/${floorName}/unit/${unitId}`}
              className="text-xs font-medium text-primary hover:text-primary-600 transition-colors inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              Unit Details
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface-container/50 rounded-lg p-4 border border-outline/50">
              <p className="text-[10px] text-on-surface-dim uppercase tracking-wide font-semibold mb-1">Monthly Rent</p>
              <p className="text-lg font-bold text-on-surface">UGX {monthlyRent.toLocaleString()}</p>
            </div>
            <div className="bg-surface-container/50 rounded-lg p-4 border border-outline/50">
              <p className="text-[10px] text-on-surface-dim uppercase tracking-wide font-semibold mb-1">Outstanding</p>
              <p className={`text-lg font-bold ${outstanding > 0 ? 'text-status-unpaid' : 'text-status-paid'}`}>
                {outstanding > 0 ? `UGX ${outstanding.toLocaleString()}` : 'Cleared'}
              </p>
            </div>
            <div className="bg-surface-container/50 rounded-lg p-4 border border-outline/50">
              <p className="text-[10px] text-on-surface-dim uppercase tracking-wide font-semibold mb-1">Credit / Prepaid</p>
              <p className={`text-lg font-bold ${hasCredit ? 'text-blue-600' : 'text-on-surface-muted'}`}>
                {hasCredit ? `UGX ${credit.toLocaleString()}` : 'None'}
              </p>
              {hasCredit && (
                <p className="text-[10px] text-blue-500 mt-0.5">Available for next payment</p>
              )}
            </div>
            <div className="bg-surface-container/50 rounded-lg p-4 border border-outline/50">
              <p className="text-[10px] text-on-surface-dim uppercase tracking-wide font-semibold mb-1">Total Paid</p>
              <p className="text-lg font-bold text-on-surface">UGX {totalPaid.toLocaleString()}</p>
              <p className="text-[10px] text-on-surface-dim mt-0.5">{payments.length} payment{payments.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {hasCredit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-500 text-lg shrink-0 mt-0.5">account_balance_wallet</span>
                <div>
                  <p className="text-sm font-semibold text-blue-800">Money on Account</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    {tenant.name} has <strong>UGX {credit.toLocaleString()}</strong> in prepaid credit.
                    This amount will be applied to the next month's rent automatically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <span className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-3xl text-on-surface-dim mb-2">receipt_long</span>
              <p className="text-sm text-on-surface-muted">No payments recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline bg-surface-container/50">
                    <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">#</th>
                    <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Receipt</th>
                    <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Time</th>
                    <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Method</th>
                    <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Amount</th>
                    <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Balance Before</th>
                    <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Balance After</th>
                    <th className="text-center px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline">
                  {running.map((p) => {
                    const overpaid = p.amount > p.balBefore
                    return (
                      <tr key={p.id} className="hover:bg-surface-container/50 transition-colors">
                        <td className="px-4 py-3 text-[11px] text-on-surface-dim font-mono">{p.idx}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-on-surface-muted">{p.receiptId}</td>
                        <td className="px-4 py-3 text-on-surface-muted whitespace-nowrap">{fmtDate(p.date)}</td>
                        <td className="px-4 py-3 text-on-surface-dim text-[11px] whitespace-nowrap">{p.time || fmtTime(p.date)}</td>
                        <td className="px-4 py-3 text-on-surface-muted">{p.method || 'Cash'}</td>
                        <td className="px-4 py-3 text-right font-medium text-on-surface whitespace-nowrap">
                          UGX {(p.amount || 0).toLocaleString()}
                          {overpaid && (
                            <span className="ml-1.5 text-[10px] text-blue-600 font-semibold">
                              (+UGX {((p.amount || 0) - p.balBefore).toLocaleString()} credit)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-on-surface-muted whitespace-nowrap">
                          UGX {p.balBefore.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <span className={p.balAfter > 0 ? 'text-status-unpaid font-medium' : 'text-status-paid font-medium'}>
                            {p.balAfter > 0 ? `UGX ${p.balAfter.toLocaleString()}` : 'Cleared'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${p.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setReceipt({ ...p, previousBalance: p.balBefore })}
                            className="text-[11px] text-primary hover:underline">
                            Receipt
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-surface-container/30 font-medium text-sm border-t-2 border-outline">
                    <td colSpan={5} className="px-4 py-3 text-on-surface font-semibold">Total</td>
                    <td className="px-4 py-3 text-right font-bold text-on-surface">UGX {totalPaid.toLocaleString()}</td>
                    <td colSpan={4}></td>
                  </tr>
                  {hasCredit && (
                    <tr className="bg-blue-50/50 text-sm">
                      <td colSpan={5} className="px-4 py-3 text-blue-700 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                          Prepaid Credit Available
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">UGX {credit.toLocaleString()}</td>
                      <td colSpan={4}></td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      {receipt && (
        <PaymentReceipt
          payment={receipt}
          tenant={tenant.name}
          floor={unit.floor}
          unit={unit.name}
          buildingName={building?.name}
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  )
}
