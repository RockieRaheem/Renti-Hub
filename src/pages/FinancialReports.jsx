import { useMemo, useState, useRef, useEffect } from 'react'
import { useBuilding } from '../context/BuildingContext'
import DonutChart from '../components/charts/DonutChart'
import { downloadCSV } from '../utils/csv'
import { downloadRevenuePDF } from '../utils/pdf'

const TYPE_COLORS = { Retail: '#0037b0', Office: '#F97316', 'Event Space': '#22c55e' }

function KpiCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-surface rounded-card border border-outline p-4 shadow-card">
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

function fmtAmount(ugx) {
  if (ugx >= 1000000) return `UGX ${(ugx / 1000000).toFixed(1)}M`
  if (ugx >= 1000) return `UGX ${(ugx / 1000).toFixed(0)}K`
  return `UGX ${ugx}`
}

function pctOf(value, total) {
  if (total <= 0) return 0
  return (value / total) * 100
}

function pctDisplay(value, total) {
  const raw = pctOf(value, total)
  if (raw < 0.5) return { text: '<1%', bar: raw }
  return { text: `${Math.round(raw)}%`, bar: raw }
}

function methodColor(method) {
  const map = {
    Cash: 'bg-yellow-400',
    'Mobile Money': 'bg-blue-500',
    'Bank Transfer': 'bg-purple-500',
    Cheque: 'bg-orange-400',
  }
  return map[method] || 'bg-gray-400'
}

function methodHex(method) {
  const map = {
    Cash: '#facc15',
    'Mobile Money': '#3b82f6',
    'Bank Transfer': '#a855f7',
    Cheque: '#fb923c',
  }
  return map[method] || '#9ca3af'
}

export default function FinancialReports() {
  const { floors, payments, monthlyRevenue } = useBuilding()

  const last6 = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
      return d.toLocaleDateString('en-GB', { month: 'short' })
    })
  }, [])

  const cashFlow = useMemo(() => {
    const grouped = {}
    payments.forEach((p) => {
      if (!p.date) return
      const d = new Date(p.date)
      if (isNaN(d.getTime())) return
      const label = d.toLocaleDateString('en-GB', { month: 'short' })
      if (last6.includes(label)) {
        grouped[label] = (grouped[label] || 0) + (p.amount || 0)
      }
    })
    return last6.map((m) => ({
      month: m,
      collected: grouped[m] || 0,
      expected: monthlyRevenue,
    }))
  }, [payments, monthlyRevenue, last6])

  const maxBar = Math.max(...cashFlow.flatMap((d) => [d.collected, d.expected]), 1)
  const totalCollected6 = cashFlow.reduce((s, d) => s + d.collected, 0)
  const totalExpected6 = cashFlow.reduce((s, d) => s + d.expected, 0)
  const collRate = totalExpected6 > 0 ? Math.round((totalCollected6 / totalExpected6) * 100) : 0

  const bestMonth = cashFlow.reduce((best, d) => d.collected > (best?.collected || 0) ? d : best, cashFlow[0])
  const totalDebt = floors.reduce((s, f) => s + f.units.reduce((us, u) => us + Math.max(0, u.tenant?.outstandingBalance || 0), 0), 0)
  const totalTenants = floors.reduce((s, f) => s + f.units.filter((u) => u.tenant).length, 0)
  const totalUnits = floors.reduce((s, f) => s + f.units.length, 0)
  const totalOccupied = floors.reduce((s, f) => s + f.units.filter((u) => u.status === 'occupied').length, 0)

  const revenueMix = useMemo(() => {
    const byType = {}
    floors.forEach((f) =>
      f.units.filter((u) => u.tenant).forEach((u) => {
        const type = u.type || 'Other'
        byType[type] = (byType[type] || 0) + (u.monthlyRent || 0)
      })
    )
    const total = Object.values(byType).reduce((s, v) => s + v, 0)
    if (total === 0) return []
    return Object.entries(byType).map(([label, ugx]) => ({
      label,
      value: Math.round((ugx / total) * 100),
      ugx,
      color: TYPE_COLORS[label] || '#9aa0a6',
    })).sort((a, b) => b.value - a.value)
  }, [floors])

  const totalMix = revenueMix.reduce((s, i) => s + i.value, 0)

  const methodTotals = useMemo(() => {
    const byMethod = {}
    payments.forEach((p) => {
      const m = p.method || 'Cash'
      byMethod[m] = (byMethod[m] || 0) + (p.amount || 0)
    })
    const entries = Object.entries(byMethod).map(([method, amount]) => ({ method, amount }))
    return entries.sort((a, b) => b.amount - a.amount)
  }, [payments])

  const methodGrand = methodTotals.reduce((s, m) => s + m.amount, 0)

  const monthlyTrends = useMemo(() => {
    const byMonth = {}
    payments.forEach((p) => {
      if (!p.date) return
      const d = new Date(p.date)
      if (isNaN(d.getTime())) return
      const key = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
      byMonth[key] = (byMonth[key] || 0) + (p.amount || 0)
    })
    return Object.entries(byMonth)
      .map(([month, collected]) => ({
        month,
        collected,
        expected: monthlyRevenue,
        rate: monthlyRevenue > 0 ? Math.round((collected / monthlyRevenue) * 100) : 0,
      }))
      .sort((a, b) => {
        const da = new Date(a.month)
        const db = new Date(b.month)
        return db - da
      })
      .slice(0, 12)
  }, [payments, monthlyRevenue])

  const floorRevenue = useMemo(() => {
    return floors.map((f) => {
      const units = f.units.length
      const occupied = f.units.filter((u) => u.status === 'occupied').length
      const rev = f.units.reduce((s, u) => s + (u.status === 'occupied' ? (u.monthlyRent || 0) : 0), 0)
      const debt = f.units.reduce((s, u) => s + Math.max(0, u.tenant?.outstandingBalance || 0), 0)
      const tenantCount = f.units.filter((u) => u.tenant).length
      const pct = monthlyRevenue > 0 ? Math.round((rev / monthlyRevenue) * 100) : 0
      return { name: f.name, units, occupied, rev, debt, tenants: tenantCount, pct }
    }).sort((a, b) => b.rev - a.rev)
  }, [floors, monthlyRevenue])

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-dim text-lg">finance</span>
          <h2 className="text-base font-bold text-on-surface">Financial Reports</h2>
        </div>
        <ExportMenuFinancial
          floors={floors}
          onCSV={() => {
            const data = floors.flatMap((f) =>
              f.units.filter((u) => u.tenant).map((u) => ({
                Floor: f.name, Unit: u.name, Tenant: u.tenant.name,
                'Monthly Rent UGX': u.monthlyRent || 0,
                Status: u.tenant.outstandingBalance > 0 ? 'Outstanding' : 'Paid',
              }))
            )
            downloadCSV(data, 'rentihub_financial_report.csv')
          }}
          onPDF={() => downloadRevenuePDF(floors)}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <KpiCard icon="payments" label="Total Collected (6mo)" value={fmtAmount(totalCollected6)} sub={`${payments.length} payments`} />
        <KpiCard icon="account_balance" label="Expected Revenue (6mo)" value={fmtAmount(totalExpected6)} sub={`${totalTenants} tenants × UGX ${(monthlyRevenue / 1000000).toFixed(1)}M`} />
        <KpiCard icon="pie_chart" label="Collection Rate" value={`${collRate}%`} sub={collRate >= 80 ? 'Healthy collection rate' : collRate >= 50 ? 'Needs attention' : 'Critical'} accent={collRate >= 80 ? 'bg-green-50' : collRate >= 50 ? 'bg-yellow-50' : 'bg-red-50'} />
        <KpiCard icon="trending_up" label="Best Month" value={bestMonth?.month || '—'} sub={bestMonth ? fmtAmount(bestMonth.collected) : 'No data'} />
        <KpiCard icon="calendar_month" label="Avg Monthly" value={fmtAmount(Math.round(totalCollected6 / 6))} sub="Over last 6 months" />
        <KpiCard icon="warning" label="Outstanding Debt" value={fmtAmount(totalDebt)} sub={`${totalOccupied}/${totalUnits} units occupied`} accent={totalDebt > 0 ? 'bg-red-50' : 'bg-green-50'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        <div className="lg:col-span-4 bg-surface rounded-card border border-outline p-5 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-on-surface">Cash Flow</h3>
              <p className="text-xs text-on-surface-muted mt-0.5">Actual collections vs expected revenue (last 6 months)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
                <span className="text-[11px] text-on-surface-muted">Collected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                <span className="text-[11px] text-on-surface-muted">Expected</span>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-60 border-b border-outline pb-1.5 relative">
            {[25, 50, 75].map((pct) => (
              <div key={pct} className="absolute left-0 right-0 border-t border-dashed border-outline/20 pointer-events-none"
                style={{ bottom: `${pct}%` }} />
            ))}
            {cashFlow.map((d) => {
              const collectedH = (d.collected / maxBar) * 100
              const expectedH = (d.expected / maxBar) * 100
              const groupH = Math.max(collectedH, expectedH, 3)
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
                  <div className="w-full flex flex-col items-center justify-end"
                    style={{ height: `${groupH}%` }}>
                    <div
                      className="w-[55%] bg-primary rounded-sm transition-all hover:opacity-80 cursor-pointer min-h-[2px]"
                      style={{ height: `${collectedH > 0 ? (collectedH / groupH) * 100 : 0}%` }}
                      title={`${d.month}: Collected ${fmtAmount(d.collected)}`}
                    />
                    <div
                      className="w-[55%] bg-amber-400 rounded-sm transition-all hover:opacity-80 cursor-pointer min-h-[2px]"
                      style={{ height: `${expectedH > 0 ? (expectedH / groupH) * 100 : 0}%` }}
                      title={`${d.month}: Expected ${fmtAmount(d.expected)}`}
                    />
                  </div>
                  <span className="text-[10px] text-on-surface-muted font-medium mt-1.5">{d.month}</span>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-[10px] text-on-surface-dim uppercase tracking-wide font-medium">Total Collected</p>
              <p className="text-base font-bold text-on-surface">{fmtAmount(totalCollected6)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-on-surface-dim uppercase tracking-wide font-medium">Total Expected</p>
              <p className="text-base font-bold text-on-surface">{fmtAmount(totalExpected6)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-on-surface-dim uppercase tracking-wide font-medium">Collection Rate</p>
              <p className={`text-base font-bold ${collRate >= 80 ? 'text-status-paid' : collRate >= 50 ? 'text-orange-500' : 'text-status-unpaid'}`}>
                {collRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface rounded-card border border-outline p-5 shadow-card">
          <h3 className="text-sm font-semibold text-on-surface mb-4">Revenue Mix</h3>
          {totalMix > 0 ? (
            <div className="flex flex-col items-center">
              <DonutChart data={revenueMix} total={totalMix} size={140} strokeWidth={22} />
              <div className="w-full mt-5 space-y-2.5">
                {revenueMix.map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-on-surface-muted flex-1">{s.label}</span>
                    <span className="font-semibold text-on-surface">{s.value}%</span>
                    <span className="text-on-surface-dim text-[10px]">{fmtAmount(s.ugx)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-3xl text-on-surface-dim mb-2">pie_chart</span>
              <p className="text-sm text-on-surface-muted">No revenue data yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface rounded-card border border-outline shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-outline">
          <span className="material-symbols-outlined text-on-surface-dim text-base">business</span>
          <h3 className="text-sm font-semibold text-on-surface">Revenue by Floor</h3>
        </div>
        {floorRevenue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline bg-surface-container/50">
                  <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Floor</th>
                  <th className="text-center px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Units</th>
                  <th className="text-center px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Occupied</th>
                  <th className="text-center px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Tenants</th>
                  <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Revenue/mo</th>
                  <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">% of Total</th>
                  <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Outstanding</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {floorRevenue.map((f) => (
                  <tr key={f.name} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-on-surface">{f.name}</td>
                    <td className="px-4 py-3 text-center text-on-surface-muted">{f.units}</td>
                    <td className="px-4 py-3 text-center text-on-surface-muted">{f.occupied}</td>
                    <td className="px-4 py-3 text-center text-on-surface-muted">{f.tenants}</td>
                    <td className="px-4 py-3 text-right font-semibold text-on-surface">{fmtAmount(f.rev)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-16 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${f.pct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-on-surface-muted w-8 text-right">{f.pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {f.debt > 0 ? (
                        <span className="text-status-unpaid text-xs font-medium">{fmtAmount(f.debt)}</span>
                      ) : (
                        <span className="text-on-surface-dim text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-1.5 h-6 rounded-full mx-auto"
                        style={{ backgroundColor: f.occupied === f.units ? '#059669' : f.occupied > 0 ? '#0037b0' : '#d1d5db' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-container/30 text-sm border-t-2 border-outline">
                  <td className="px-4 py-3 font-semibold text-on-surface">{floorRevenue.length} floor{(floorRevenue.length) !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3 text-center text-on-surface-muted">{floorRevenue.reduce((s, f) => s + f.units, 0)}</td>
                  <td className="px-4 py-3 text-center text-on-surface-muted">{floorRevenue.reduce((s, f) => s + f.occupied, 0)}</td>
                  <td className="px-4 py-3 text-center text-on-surface-muted">{floorRevenue.reduce((s, f) => s + f.tenants, 0)}</td>
                  <td className="px-4 py-3 text-right font-bold text-on-surface">{fmtAmount(floorRevenue.reduce((s, f) => s + f.rev, 0))}</td>
                  <td className="px-4 py-3 text-right text-on-surface-dim">100%</td>
                  <td className="px-4 py-3 text-right font-bold text-status-unpaid">{fmtAmount(floorRevenue.reduce((s, f) => s + f.debt, 0))}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-sm text-on-surface-muted text-center py-6">Add floors to see revenue breakdown</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-card border border-outline p-5 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-on-surface-dim text-base">account_balance</span>
            <h3 className="text-sm font-semibold text-on-surface">Payment Methods</h3>
          </div>
          {methodTotals.length > 0 ? (
            <div className="space-y-4">
              {methodTotals.map((m) => {
                const { text, bar } = pctDisplay(m.amount, methodGrand)
                return (
                  <div key={m.method}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${methodColor(m.method)}`} />
                        <span className="text-on-surface-muted font-medium">{m.method}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-on-surface">{fmtAmount(m.amount)}</span>
                        <span className="text-on-surface-dim w-8 text-right text-[10px]">{text}</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${methodColor(m.method)}`}
                        style={{ width: `${Math.max(bar, methodTotals.length > 1 ? 1 : 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-outline">
                <span className="text-on-surface-dim font-medium">Total</span>
                <span className="font-bold text-on-surface">{fmtAmount(methodGrand)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-3xl text-on-surface-dim mb-2">payments</span>
              <p className="text-sm text-on-surface-muted">No payment data yet</p>
            </div>
          )}
        </div>

        <div className="bg-surface rounded-card border border-outline p-5 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-on-surface-dim text-base">calendar_month</span>
            <h3 className="text-sm font-semibold text-on-surface">Monthly Trends</h3>
          </div>
          {monthlyTrends.length > 0 ? (
            <div className="space-y-1">
              <div className="flex items-center text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider px-2 py-1.5 border-b border-outline">
                <span className="flex-1">Month</span>
                <span className="w-24 text-right">Collected</span>
                <span className="w-12 text-right">Rate</span>
                <span className="w-14 text-right"></span>
              </div>
              {monthlyTrends.map((m) => (
                <div key={m.month} className="flex items-center text-xs px-2 py-2 rounded-lg hover:bg-surface-container/50 transition-colors">
                  <span className="flex-1 font-medium text-on-surface">{m.month}</span>
                  <span className="w-24 text-right font-medium text-on-surface">{fmtAmount(m.collected)}</span>
                  <span className={`w-12 text-right font-semibold ${m.rate >= 80 ? 'text-status-paid' : m.rate >= 50 ? 'text-orange-500' : 'text-status-unpaid'}`}>
                    {m.rate}%
                  </span>
                  <div className="w-14 flex justify-end">
                    <div className="w-10 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${m.rate >= 80 ? 'bg-status-paid' : m.rate >= 50 ? 'bg-orange-400' : 'bg-status-unpaid'}`}
                        style={{ width: `${m.rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-3xl text-on-surface-dim mb-2">trending_up</span>
              <p className="text-sm text-on-surface-muted">No trend data yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ExportMenuFinancial({ floors, onCSV, onPDF }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)}
        className="px-3.5 py-2 border border-outline text-on-surface-muted text-xs font-semibold rounded-lg hover:bg-surface-container transition-colors inline-flex items-center gap-1.5">
        <span className="material-symbols-outlined text-base">download</span>
        Export
        <span className="material-symbols-outlined text-sm">{open ? 'expand_less' : 'expand_more'}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-surface rounded-xl border border-outline shadow-lg z-20 py-1">
          <button onClick={() => { onCSV(); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors text-left">
            <span className="material-symbols-outlined text-lg text-on-surface-muted">table_chart</span>
            <div>
              <p className="font-medium text-on-surface">Export CSV</p>
              <p className="text-[11px] text-on-surface-dim">Revenue by floor breakdown</p>
            </div>
          </button>
          <button onClick={() => { onPDF(); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors text-left">
            <span className="material-symbols-outlined text-lg text-status-unpaid">picture_as_pdf</span>
            <div>
              <p className="font-medium text-on-surface">Revenue Report (PDF)</p>
              <p className="text-[11px] text-on-surface-dim">Revenue by floor breakdown</p>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
