import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import PaymentReceipt from '../components/PaymentReceipt'

function KpiCard({ icon, label, value, trend, sub, accent }) {
  return (
    <div className="bg-surface rounded-card border border-outline p-4 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between mb-2.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent || 'bg-primary-50'}`}>
          <span className="material-symbols-outlined text-xl" style={{ color: accent ? '#1a1a2e' : undefined }}>{icon}</span>
        </div>
        {trend !== null && trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend > 0 ? 'text-status-paid' : trend < 0 ? 'text-status-unpaid' : 'text-on-surface-muted'}`}>
            <span className="material-symbols-outlined text-sm">{trend > 0 ? 'trending_up' : trend < 0 ? 'trending_down' : 'remove'}</span>
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-xl font-bold text-on-surface mb-0.5 tracking-tight">{value}</p>
      <p className="text-[11px] text-on-surface-muted">{label}</p>
      {sub && <p className="text-[10px] text-on-surface-dim mt-0.5">{sub}</p>}
    </div>
  )
}

function timeAgo(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function fmtDate(d) {
  if (!d) return '—'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return d
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function methodBadge(method) {
  const styles = {
    Cash: 'bg-yellow-50 text-yellow-700',
    'Mobile Money': 'bg-blue-50 text-blue-700',
    'Bank Transfer': 'bg-purple-50 text-purple-700',
    Cheque: 'bg-orange-50 text-orange-700',
  }
  return styles[method] || 'bg-gray-50 text-gray-600'
}

function methodIcon(method) {
  const icons = {
    Cash: 'payments',
    'Mobile Money': 'smartphone',
    'Bank Transfer': 'account_balance',
    Cheque: 'receipt',
  }
  return icons[method] || 'payments'
}

export default function Dashboard() {
  const { building, floors, floorSlug, maintenanceStats, monthlyRevenue, totalOutstanding, payments } = useBuilding()
  const [receipt, setReceipt] = useState(null)
  const [search, setSearch] = useState('')
  const [paySearch, setPaySearch] = useState('')

  const totalUnits = floors.reduce((s, f) => s + f.units.length, 0)
  const occupiedUnits = floors.reduce((s, f) => s + f.units.filter(u => u.status === 'occupied').length, 0)
  const occupancyPct = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0
  const recentPayments = [...payments].reverse().slice(0, 8)
  const filteredRecentPayments = paySearch
    ? recentPayments.filter((p) =>
        (p.tenantName || '').toLowerCase().includes(paySearch.toLowerCase()) ||
        (p.receiptId || '').toLowerCase().includes(paySearch.toLowerCase()) ||
        (p.method || '').toLowerCase().includes(paySearch.toLowerCase()) ||
        (p.unit || '').toLowerCase().includes(paySearch.toLowerCase())
      )
    : recentPayments
  const pendingMaint = maintenanceStats.pending + maintenanceStats.inProgress
  const totalCredit = floors.reduce((s, f) => s + f.units.reduce((us, u) => us + Math.max(0, -(u.tenant?.outstandingBalance || 0)), 0), 0)
  const tenantsWithCredit = floors.reduce((s, f) => s + f.units.filter(u => (u.tenant?.outstandingBalance || 0) < 0).length, 0)

  const paymentMethodTotals = {}
  for (const p of payments) {
    const m = p.method || 'Cash'
    paymentMethodTotals[m] = (paymentMethodTotals[m] || 0) + (p.amount || 0)
  }
  const topMethod = Object.entries(paymentMethodTotals).sort((a, b) => b[1] - a[1])[0]

  function paymentLink(p) {
    const floor = floors.find(f => f.name === p.floor)
    if (!floor) return null
    const unit = floor.units.find(u => u.name === p.unit)
    if (!unit) return null
    return `/properties/floor/${floorSlug(floor.name)}/unit/${unit.id}`
  }
  function historyLink(p) {
    const floor = floors.find(f => f.name === p.floor)
    if (!floor) return null
    const unit = floor.units.find(u => u.name === p.unit)
    if (!unit || !unit.tenant) return null
    return `/tenant-payments/${floorSlug(floor.name)}/${unit.id}`
  }

  const hasData = totalUnits > 0

  const filteredFloors = floors.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase())
  )

  if (!hasData) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="bg-surface rounded-card border border-outline p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">dashboard</span>
          </div>
          <h2 className="text-lg font-bold text-on-surface mb-2">Welcome to RentiHub</h2>
          <p className="text-sm text-on-surface-muted mb-6 max-w-md mx-auto">Your dashboard is empty because you haven&rsquo;t added any floors yet. Start by creating your first floor with shops.</p>
          <Link to="/properties" className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-card">
            Add Your First Floor
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs text-on-surface-muted font-medium">{building?.name || 'Property'}</p>
          <p className="text-sm text-on-surface-muted">{totalUnits} unit{totalUnits > 1 ? 's' : ''} &middot; {occupiedUnits} occupied</p>
        </div>
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-dim text-sm pointer-events-none">search</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search floors..."
            className="w-full h-9 pl-7 pr-2.5 border border-outline rounded-lg text-xs text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <KpiCard icon="payments" label="Monthly Revenue" value={`UGX ${(monthlyRevenue / 1000000).toFixed(1)}M`} trend={null} sub={`${payments.length} payments recorded`} />
        <KpiCard icon="real_estate_agent" label="Occupancy" value={`${occupiedUnits}/${totalUnits}`} trend={null} sub={`${occupancyPct}% occupied`} />
        <KpiCard icon="warning" label="Outstanding" value={`UGX ${totalOutstanding.toLocaleString()}`} trend={null} sub={totalOutstanding > 0 ? 'Tenant debt' : 'All cleared'} accent={totalOutstanding > 0 ? 'bg-red-50' : 'bg-green-50'} />
        <KpiCard icon="account_balance_wallet" label="Credit Available" value={totalCredit > 0 ? `UGX ${totalCredit.toLocaleString()}` : 'None'} trend={null} sub={totalCredit > 0 ? `${tenantsWithCredit} with credit` : 'No prepayments'} />
        <KpiCard icon="build" label="Pending Issues" value={pendingMaint} trend={null} sub={`${maintenanceStats.resolved} resolved`} accent={pendingMaint > 0 ? 'bg-orange-50' : 'bg-green-50'} />
        <KpiCard icon="payments" label="Top Method" value={topMethod ? topMethod[0] : '—'} trend={null} sub={topMethod ? `UGX ${(topMethod[1] / 1000000).toFixed(1)}M` : 'No data'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-surface rounded-card border border-outline shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-dim text-base">receipt_long</span>
              <h3 className="text-sm font-semibold text-on-surface">Recent Payments</h3>
              <span className="text-[10px] text-on-surface-dim bg-surface-container px-1.5 py-0.5 rounded-full">{recentPayments.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-dim text-[12px] pointer-events-none">search</span>
                <input value={paySearch} onChange={(e) => setPaySearch(e.target.value)} placeholder="Search payments..."
                  className="w-40 h-7 pl-6 pr-2 border border-outline rounded-lg text-[10px] text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              {paySearch && (
                <button onClick={() => setPaySearch('')} className="text-[10px] text-status-unpaid hover:underline">Clear</button>
              )}
              <Link to="/rent-collection" className="text-xs font-medium text-primary hover:text-primary-600 transition-colors inline-flex items-center gap-1">
                View all
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
          </div>
          {filteredRecentPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline bg-surface-container/30">
                    <th className="text-left px-4 py-2.5 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Receipt</th>
                    <th className="text-left px-4 py-2.5 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Tenant</th>
                    <th className="text-left px-4 py-2.5 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Unit</th>
                    <th className="text-left px-4 py-2.5 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Method</th>
                    <th className="text-right px-4 py-2.5 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Amount</th>
                    <th className="text-right px-4 py-2.5 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline">
                  {filteredRecentPayments.map((p) => {
                    const link = paymentLink(p)
                    const hlink = historyLink(p)
                    return (
                      <tr key={p.id} className="hover:bg-surface-container/50 transition-colors group">
                        <td className="px-4 py-2.5">
                          <button onClick={() => setReceipt(p)}
                            className="font-mono text-[11px] text-on-surface-muted hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1">
                            {p.stellarTxHash && (
                              <span className="material-symbols-outlined text-[10px] text-emerald-500" title="Verified on Stellar">verified</span>
                            )}
                            {p.receiptId?.slice(0, 12) || '—'}
                          </button>
                        </td>
                        <td className="px-4 py-2.5">
                          {hlink ? (
                            <Link to={hlink} className="font-medium text-on-surface hover:text-primary transition-colors text-xs flex items-center gap-1">
                              {p.tenantName}
                              <span className="material-symbols-outlined text-[13px] text-on-surface-dim opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                            </Link>
                          ) : (
                            <span className="font-medium text-on-surface text-xs">{p.tenantName}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {link ? (
                            <Link to={link} className="text-on-surface-muted hover:text-primary transition-colors text-xs">{p.unit}</Link>
                          ) : (
                            <span className="text-on-surface-muted text-xs">{p.unit}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${methodBadge(p.method)}`}>
                            <span className="material-symbols-outlined text-[11px]">{methodIcon(p.method)}</span>
                            {p.method || 'Cash'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-on-surface text-xs">UGX {(p.amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right text-[11px] text-on-surface-dim whitespace-nowrap">{timeAgo(p.date) || fmtDate(p.date)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 px-5">
              <span className="material-symbols-outlined text-3xl text-on-surface-dim mb-2">payments</span>
              <p className="text-sm text-on-surface-muted">
                {paySearch ? 'No payments match your search' : 'No payments recorded yet'}
              </p>
              {paySearch && recentPayments.length > 0 ? (
                <button onClick={() => setPaySearch('')} className="text-xs font-medium text-primary hover:underline mt-1 inline-block">Clear search</button>
              ) : !paySearch ? (
                <Link to="/rent-collection" className="text-xs font-medium text-primary hover:underline mt-1 inline-block">Record your first payment</Link>
              ) : null}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-5">
          <div className="bg-surface rounded-card border border-outline shadow-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-dim text-base">layers</span>
                <h3 className="text-sm font-semibold text-on-surface">Floors</h3>
              </div>
              <Link to="/properties" className="text-xs font-medium text-primary hover:text-primary-600 transition-colors">Manage</Link>
            </div>
            <div className="p-4 space-y-2.5">
              {filteredFloors.length > 0 ? (
                filteredFloors.slice(0, 6).map((f) => {
                  const occ = f.units.filter(u => u.status === 'occupied').length
                  const total = f.units.length
                  const pct = total > 0 ? Math.round((occ / total) * 100) : 0
                  const floorDebt = f.units.reduce((s, u) => s + Math.max(0, u.tenant?.outstandingBalance || 0), 0)
                  return (
                    <Link key={f.name} to={`/properties/floor/${floorSlug(f.name)}`}
                      className="block hover:bg-surface-container rounded-lg p-2.5 -mx-1.5 transition-colors group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-md bg-primary-50 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-primary text-xs">layers</span>
                          </div>
                          <span className="text-xs font-medium text-on-surface group-hover:text-primary transition-colors truncate">{f.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-on-surface-muted">{occ}/{total} full</span>
                          {floorDebt > 0 && <span className="text-[10px] text-status-unpaid font-medium">UGX {(floorDebt / 1000000).toFixed(1)}M</span>}
                        </div>
                      </div>
                      <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#059669' : '#0037b0' }} />
                      </div>
                    </Link>
                  )
                })
              ) : (
                <p className="text-xs text-on-surface-muted text-center py-3">No floors match &quot;{search}&quot;</p>
              )}
              {floors.length > 6 && (
                <Link to="/properties" className="block text-center text-[11px] font-medium text-primary hover:underline pt-1">
                  View all {floors.length} floors
                </Link>
              )}
            </div>
          </div>

          <div className="bg-surface rounded-card border border-outline shadow-card">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-outline">
              <span className="material-symbols-outlined text-on-surface-dim text-base">bolt</span>
              <h3 className="text-sm font-semibold text-on-surface">Quick Actions</h3>
            </div>
            <div className="p-3 grid grid-cols-1 gap-1">
              {[
                { icon: 'add_business', label: 'Add Floor', to: '/properties', color: 'bg-primary-50 text-primary' },
                { icon: 'person_add', label: 'Add Tenant', to: '/properties', color: 'bg-green-50 text-green-700' },
                { icon: 'payments', label: 'Record Payment', to: '/rent-collection', color: 'bg-orange-50 text-orange-700' },
                { icon: 'build', label: 'Maintenance', to: '/maintenance', color: 'bg-purple-50 text-purple-700' },
              ].map((a) => (
                <Link key={a.label} to={a.to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container transition-colors group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.color} shrink-0`}>
                    <span className="material-symbols-outlined text-lg">{a.icon}</span>
                  </div>
                  <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{a.label}</span>
                  <span className="material-symbols-outlined text-sm text-on-surface-dim ml-auto">chevron_right</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {receipt && (
        <PaymentReceipt
          payment={receipt}
          tenant={receipt.tenantName}
          floor={receipt.floor}
          unit={receipt.unit}
          buildingName={building?.name}
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  )
}
