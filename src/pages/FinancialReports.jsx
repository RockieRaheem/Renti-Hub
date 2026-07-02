import { useMemo } from 'react'
import { useBuilding } from '../context/BuildingContext'
import DonutChart from '../components/charts/DonutChart'
import { downloadCSV } from '../utils/csv'

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
const TYPE_COLORS = { Retail: '#0037b0', Office: '#F97316', 'Event Space': '#22c55e' }

function getMonthLabel(dateStr) {
  const d = new Date(dateStr)
  return MONTHS[d.getMonth()]
}

function getMonthIndex(label) {
  return MONTHS.indexOf(label)
}

export default function FinancialReports() {
  const { floors, payments, monthlyRevenue } = useBuilding()

  const now = new Date()
  const currentMonth = now.getMonth()
  const last6 = Array.from({ length: 6 }, (_, i) => {
    const idx = (currentMonth - 5 + i + 12) % 12
    return MONTHS[idx]
  })

  const cashFlow = useMemo(() => {
    const monthlyPayments = {}
    payments.forEach((p) => {
      const label = p.date ? getMonthLabel(p.date) : null
      if (label && last6.includes(label)) {
        monthlyPayments[label] = (monthlyPayments[label] || 0) + (p.amount || 0)
      }
    })
    const occupiedTotal = floors.reduce((s, f) =>
      s + f.units.filter((u) => u.status === 'occupied').reduce((us, u) => us + (u.monthlyRent || 0), 0), 0
    )
    return last6.map((m) => ({
      month: m,
      income: monthlyPayments[m] || 0,
      expected: occupiedTotal,
    }))
  }, [payments, floors, last6])

  const maxCashFlow = Math.max(...cashFlow.flatMap((d) => [d.income, d.expected]), 1)
  const totalIncome = cashFlow.reduce((s, d) => s + d.income, 0)
  const totalExpected = cashFlow.reduce((s, d) => s + d.expected, 0)

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
    return Object.entries(byType).map(([label, value]) => ({
      label,
      value: Math.round((value / total) * 100),
      color: TYPE_COLORS[label] || '#9aa0a6',
    })).sort((a, b) => b.value - a.value)
  }, [floors])

  const totalMix = revenueMix.reduce((s, item) => s + item.value, 0)

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        <div className="lg:col-span-4 bg-surface rounded-card border border-outline p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-on-surface">Cash Flow</h3>
              <p className="text-xs text-on-surface-muted mt-0.5">Actual collections vs expected revenue</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-primary" />
                <span className="text-xs text-on-surface-muted">Collected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-status-partial" />
                <span className="text-xs text-on-surface-muted">Expected</span>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-3 h-56 border-b border-outline pb-1">
            {cashFlow.map((d) => {
              const incomeH = maxCashFlow > 0 ? (d.income / maxCashFlow) * 90 : 0
              const expenseH = maxCashFlow > 0 ? (d.expected / maxCashFlow) * 90 : 0
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="flex items-end gap-0.5 w-full justify-center transition-all" style={{ height: `${Math.max(incomeH, expenseH) || 4}%` }}>
                    <div className="w-[40%] bg-primary rounded-t-sm transition-all hover:opacity-80 min-h-[4px]" style={{ height: `${incomeH || 4}%` }} title={`Collected: UGX ${(d.income / 1000000).toFixed(1)}M`} />
                    <div className="w-[40%] bg-status-partial rounded-t-sm transition-all hover:opacity-80 min-h-[4px]" style={{ height: `${expenseH || 4}%` }} title={`Expected: UGX ${(d.expected / 1000000).toFixed(1)}M`} />
                  </div>
                  <span className="text-[10px] text-on-surface-muted font-medium pt-1">{d.month}</span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <div>
              <p className="text-on-surface-muted text-xs">Total Collected (6mo)</p>
              <p className="font-bold text-on-surface">UGX {(totalIncome / 1000000).toFixed(1)}M</p>
            </div>
            <div className="text-center">
              <p className="text-on-surface-muted text-xs">Avg Monthly Expected</p>
              <p className="font-bold text-on-surface">UGX {(monthlyRevenue / 1000000).toFixed(1)}M</p>
            </div>
            <div className="text-right">
              <p className="text-on-surface-muted text-xs">Collection Rate</p>
              <p className={`font-bold ${totalExpected > 0 ? 'text-status-paid' : 'text-on-surface-muted'}`}>
                {totalExpected > 0 ? `${Math.round((totalIncome / totalExpected) * 100)}%` : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-card border border-outline p-5 shadow-card">
            <h3 className="text-sm font-semibold text-on-surface mb-4">Revenue Mix</h3>
            {totalMix > 0 ? (
              <div className="flex flex-col items-center">
                <DonutChart data={revenueMix} total={totalMix} size={140} strokeWidth={22} />
                <div className="space-y-2 mt-5 w-full">
                  {revenueMix.map((slice) => (
                    <div key={slice.label} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                      <span className="text-on-surface-muted flex-1">{slice.label}</span>
                      <span className="font-semibold text-on-surface">{slice.value}%</span>
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
      </div>

      <div className="bg-surface rounded-card border border-outline p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-on-surface">Revenue by Floor</h3>
          <button onClick={() => {
            const data = floors.flatMap((f) =>
              f.units.filter((u) => u.tenant).map((u) => ({
                Floor: f.name, Unit: u.name, Tenant: u.tenant.name,
                'Monthly Rent UGX': u.monthlyRent || 0,
                Status: u.tenant.outstandingBalance > 0 ? 'Outstanding' : 'Paid',
              }))
            )
            downloadCSV(data, 'rentihub_revenue_by_floor.csv')
          }}
            className="text-xs font-medium text-primary hover:bg-primary-50 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
        </div>
        {floors.length > 0 ? (
          <div className="space-y-4">
            {floors.map((f) => {
              const rev = f.units.reduce((s, u) => s + (u.status === 'occupied' ? u.monthlyRent : 0), 0)
              const pct = monthlyRevenue > 0 ? Math.round((rev / monthlyRevenue) * 100) : 0
              return (
                <div key={f.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface-muted">{f.name}</span>
                    <div className="text-right">
                      <span className="font-semibold text-on-surface">UGX {(rev / 1000000).toFixed(1)}M</span>
                      <span className="text-on-surface-dim text-xs ml-2">({pct}%)</span>
                    </div>
                  </div>
                  <div className="h-2 bg-surface-container-highest rounded-full">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-on-surface-muted text-center py-6">Add floors to see revenue breakdown</p>
        )}
      </div>
    </div>
  )
}
