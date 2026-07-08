import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import { fetchPaymentsByTenant, fetchAllPeriods, fetchPeriodAllocations } from '../lib/queries'
import PaymentReceipt from '../components/PaymentReceipt'

function fmtDate(d) {
  if (!d) return '—'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return d
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function monthLabel(periodStart) {
  if (!periodStart) return ''
  const dt = new Date(periodStart + 'T00:00:00')
  return dt.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export default function TenantPayments() {
  const { floorName, unitId } = useParams()
  const { getUnitByFloorAndId, building } = useBuilding()
  const unit = getUnitByFloorAndId(floorName, unitId)
  const tenant = unit?.tenant
  const [payments, setPayments] = useState([])
  const [periods, setPeriods] = useState([])
  const [loading, setLoading] = useState(true)
  const [receipt, setReceipt] = useState(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (!tenant?.id) { setLoading(false); return }
    setLoading(true)
    Promise.all([
      fetchPaymentsByTenant(tenant.id),
      fetchAllPeriods(tenant.id),
    ]).then(([payResult, periodResult]) => {
      if (payResult.data) setPayments(payResult.data)
      if (periodResult.data) setPeriods(periodResult.data)
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
  const outstanding = Math.max(0, currentBalance)
  const credit = Math.max(0, -currentBalance)
  const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const hasCredit = credit > 0

  const filteredPayments = payments.filter((p) => {
    if (methodFilter && p.method !== methodFilter) return false
    if (statusFilter && p.status !== statusFilter) return false
    if (dateFrom && new Date(p.date) < new Date(dateFrom)) return false
    if (dateTo) {
      const end = new Date(dateTo)
      end.setDate(end.getDate() + 1)
      if (new Date(p.date) >= end) return false
    }
    return true
  })

  // Build period-based ledger: merge periods with their allocations
  const [ledgerData, setLedgerData] = useState([])
  useEffect(() => {
    if (periods.length === 0) { setLedgerData([]); return }
    Promise.all(
      periods.map(async (period) => {
        const { data: allocs } = await fetchPeriodAllocations(period.id) || { data: [] }
        const paidAmount = allocs.reduce((s, a) => s + a.amount, 0)
        return { ...period, paidAmount, balance: period.rentDue - paidAmount }
      }),
    ).then((results) => setLedgerData(results))
  }, [periods])

  const cumulativeBalance = ledgerData.reduce((s, p) => s + p.balance, 0)
  const totalRentDue = ledgerData.reduce((s, p) => s + p.rentDue, 0)
  const totalPaidAllocated = ledgerData.reduce((s, p) => s + p.paidAmount, 0)

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

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
            <div className="bg-surface-container/50 rounded-lg p-4 border border-outline/50">
              <p className="text-[10px] text-on-surface-dim uppercase tracking-wide font-semibold mb-1">Total Rent Due</p>
              <p className="text-lg font-bold text-on-surface">UGX {totalRentDue.toLocaleString()}</p>
              <p className="text-[10px] text-on-surface-dim mt-0.5">{ledgerData.length} month{ledgerData.length !== 1 ? 's' : ''}</p>
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
                    This will be applied to the next month's rent automatically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <span className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : ledgerData.length === 0 && payments.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-3xl text-on-surface-dim mb-2">receipt_long</span>
              <p className="text-sm text-on-surface-muted">No payments recorded yet</p>
            </div>
          ) : (
            <>
              {/* Period-based ledger table */}
              {ledgerData.length > 0 && (
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline bg-surface-container/50">
                        <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Month</th>
                        <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Rent Due</th>
                        <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Paid</th>
                        <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Balance</th>
                        <th className="text-center px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline">
                      {ledgerData.map((p) => {
                        const balColor = p.balance > 0 ? 'text-status-unpaid' : p.balance < 0 ? 'text-blue-600' : 'text-status-paid'
                        return (
                          <tr key={p.id} className="hover:bg-surface-container/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-on-surface">{monthLabel(p.periodStart)}</td>
                            <td className="px-4 py-3 text-right text-on-surface-muted">UGX {p.rentDue.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-on-surface font-medium">UGX {p.paidAmount.toLocaleString()}</td>
                            <td className={`px-4 py-3 text-right font-medium ${balColor}`}>
                              {p.balance > 0 ? `UGX ${p.balance.toLocaleString()}` : p.balance < 0 ? `-UGX ${Math.abs(p.balance).toLocaleString()}` : '—'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                p.status === 'paid' ? 'bg-green-50 text-green-700' :
                                p.status === 'partial' ? 'bg-yellow-50 text-yellow-700' :
                                p.status === 'credited' ? 'bg-blue-50 text-blue-700' :
                                'bg-red-50 text-red-700'
                              }`}>
                                {p.status === 'paid' ? 'Paid' : p.status === 'partial' ? 'Partial' : p.status === 'credited' ? 'Credited' : 'Unpaid'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-surface-container/30 font-medium text-sm border-t-2 border-outline">
                        <td className="px-4 py-3 text-on-surface font-semibold">{ledgerData.length} month{ledgerData.length !== 1 ? 's' : ''}</td>
                        <td className="px-4 py-3 text-right font-bold text-on-surface">UGX {totalRentDue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-on-surface">UGX {totalPaidAllocated.toLocaleString()}</td>
                        <td className={`px-4 py-3 text-right font-bold ${cumulativeBalance > 0 ? 'text-status-unpaid' : cumulativeBalance < 0 ? 'text-blue-600' : 'text-status-paid'}`}>
                          {cumulativeBalance > 0 ? `UGX ${cumulativeBalance.toLocaleString()}` : cumulativeBalance < 0 ? `-UGX ${Math.abs(cumulativeBalance).toLocaleString()}` : '—'}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Payment details table */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h4 className="text-xs font-semibold text-on-surface uppercase tracking-wider">Payment Transactions</h4>
                <span className="text-[10px] text-on-surface-dim bg-surface-container px-1.5 py-0.5 rounded-full">{filteredPayments.length}</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                    className="h-7 px-2 border border-outline rounded-lg text-[10px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary w-[130px]" />
                  <span className="text-[10px] text-on-surface-dim">to</span>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                    className="h-7 px-2 border border-outline rounded-lg text-[10px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary w-[130px]" />
                  <div className="w-px h-5 bg-outline/50 mx-0.5" />
                  <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}
                    className="h-7 px-2 border border-outline rounded-lg text-[10px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary appearance-none bg-white"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', paddingRight: '20px' }}>
                    <option value="">All Methods</option>
                    <option value="Cash">Cash</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-7 px-2 border border-outline rounded-lg text-[10px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary appearance-none bg-white"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', paddingRight: '20px' }}>
                    <option value="">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                  </select>
                  {(dateFrom || dateTo || methodFilter || statusFilter) && (
                    <button onClick={() => { setDateFrom(''); setDateTo(''); setMethodFilter(''); setStatusFilter('') }}
                      className="text-[10px] text-status-unpaid hover:underline inline-flex items-center gap-0.5">
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline bg-surface-container/50">
                      <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">#</th>
                      <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Receipt</th>
                      <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Date</th>
                      <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Time</th>
                      <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Method</th>
                      <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">For Month</th>
                      <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Amount</th>
                      <th className="text-center px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline">
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((p, i) => (
                      <tr key={p.id} className="hover:bg-surface-container/50 transition-colors">
                        <td className="px-4 py-3 text-[11px] text-on-surface-dim font-mono">{i + 1}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-on-surface-muted">{p.receiptId}</td>
                        <td className="px-4 py-3 text-on-surface-muted whitespace-nowrap">{fmtDate(p.date)}</td>
                        <td className="px-4 py-3 text-on-surface-dim text-[11px] whitespace-nowrap">{p.time || ''}</td>
                        <td className="px-4 py-3 text-on-surface-muted">{p.method || 'Cash'}</td>
                        <td className="px-4 py-3 text-on-surface-dim text-[11px]">{p.forMonth || '-'}</td>
                        <td className="px-4 py-3 text-right font-medium text-on-surface whitespace-nowrap">UGX {(p.amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${p.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setReceipt(p)}
                            className="text-[11px] text-primary hover:underline">
                            Receipt
                          </button>
                        </td>
                      </tr>
                    ))) : (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-xs text-on-surface-muted">No payments match the current filters</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-surface-container/30 font-medium text-sm border-t-2 border-outline">
                      <td colSpan={6} className="px-4 py-3 text-on-surface font-semibold">
                        {filteredPayments.length > 0
                          ? `Total (${filteredPayments.length} payment${filteredPayments.length !== 1 ? 's' : ''})`
                          : `${payments.length} total payment${payments.length !== 1 ? 's' : ''}`}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-on-surface">UGX {filteredPayments.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}</td>
                      <td colSpan={2}></td>
                    </tr>
                    {hasCredit && (
                      <tr className="bg-blue-50/50 text-sm">
                        <td colSpan={6} className="px-4 py-3 text-blue-700 font-medium">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                            Prepaid Credit Available
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-blue-600">UGX {credit.toLocaleString()}</td>
                        <td colSpan={2}></td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>
            </>
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
