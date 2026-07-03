import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import StatusBadge from '../components/ui/StatusBadge'

function KpiCard({ icon, label, value, trend, sub }) {
  return (
    <div className="bg-surface rounded-card border border-outline p-5 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend > 0 ? 'text-status-paid' : trend < 0 ? 'text-status-unpaid' : 'text-on-surface-muted'}`}>
            <span className="material-symbols-outlined text-sm">{trend > 0 ? 'trending_up' : trend < 0 ? 'trending_down' : 'remove'}</span>
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-on-surface mb-0.5 tracking-tight">{value}</p>
      <p className="text-xs text-on-surface-muted">{label}</p>
      {sub && <p className="text-[11px] text-on-surface-dim mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { building, floors, floorSlug, maintenance, maintenanceStats, monthlyRevenue, totalOutstanding, payments, refreshing } = useBuilding()
  const [period, setPeriod] = useState('month')
  const totalUnits = floors.reduce((s, f) => s + f.units.length, 0)
  const occupiedUnits = floors.reduce((s, f) => s + f.units.filter(u => u.status === 'occupied').length, 0)
  const recentPayments = [...payments].reverse().slice(0, 5)
  const pendingMaint = maintenanceStats.pending + maintenanceStats.inProgress

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

  if (!hasData) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="bg-surface rounded-card border border-outline p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">dashboard</span>
          </div>
          <h2 className="text-lg font-bold text-on-surface mb-2">Welcome to RentiHub</h2>
          <p className="text-sm text-on-surface-muted mb-6 max-w-md mx-auto">Your dashboard is empty because you haven&rsquo;t added any floors yet. Start by creating your first floor with shops.</p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/properties" className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-card">
              Add Your First Floor
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-on-surface-muted font-medium">{building.name}</p>
        </div>
        <div className="flex items-center bg-surface-container-highest rounded-lg p-0.5 gap-0.5">
          {['week', 'month', 'year'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p ? 'bg-surface text-on-surface shadow-card' : 'text-on-surface-muted hover:text-on-surface'}`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard icon="payments" label="Monthly Revenue" value={`UGX ${(monthlyRevenue / 1000000).toFixed(1)}M`} trend={8.2} sub="vs last period" />
        <KpiCard icon="real_estate_agent" label="Occupancy" value={`${occupiedUnits}/${totalUnits}`} trend={occupiedUnits > 0 ? 4.1 : 0} sub={`${Math.round((occupiedUnits / totalUnits) * 100)}% occupied`} />
        <KpiCard icon="warning" label="Outstanding" value={`UGX ${totalOutstanding.toLocaleString()}`} trend={null} sub={totalOutstanding > 0 ? 'Tenant debt' : 'All cleared'} />
        <KpiCard icon="build" label="Pending Issues" value={pendingMaint} trend={null} sub={`${maintenanceStats.resolved} resolved this period`} />
        <KpiCard icon="group" label="Total Tenants" value={occupiedUnits} trend={null} sub="Across all floors" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface rounded-card border border-outline p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-on-surface">Recent Payments</h3>
            <Link to="/rent-collection" className="text-xs font-medium text-primary hover:text-primary-600 transition-colors">View all</Link>
          </div>
          {recentPayments.length > 0 ? (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline">
                    <th className="text-left px-5 py-2.5 text-[11px] text-on-surface-muted font-semibold uppercase tracking-wider">Tenant</th>
                    <th className="text-left px-5 py-2.5 text-[11px] text-on-surface-muted font-semibold uppercase tracking-wider">Unit</th>
                    <th className="text-left px-5 py-2.5 text-[11px] text-on-surface-muted font-semibold uppercase tracking-wider">Amount</th>
                    <th className="text-left px-5 py-2.5 text-[11px] text-on-surface-muted font-semibold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline">
                  {recentPayments.map((p) => {
                    const link = paymentLink(p)
                    const hlink = historyLink(p)
                    return (
                      <tr key={p.id} className="hover:bg-surface-container transition-colors group">
                        <td className="px-5 py-3">
                          {hlink ? (
                            <Link to={hlink} className="font-medium text-on-surface hover:text-primary transition-colors inline-flex items-center gap-1">
                              {p.tenantName}
                              <span className="material-symbols-outlined text-sm text-on-surface-dim opacity-0 group-hover:opacity-100 transition-opacity">receipt_long</span>
                            </Link>
                          ) : (
                            <span className="font-medium text-on-surface">{p.tenantName}</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {link ? (
                            <Link to={link} className="text-on-surface-muted hover:text-primary transition-colors">{p.unit}</Link>
                          ) : (
                            <span className="text-on-surface-muted">{p.unit}</span>
                          )}
                        </td>
                        <td className="px-5 py-3 font-medium text-on-surface">UGX {(p.amount || 0).toLocaleString()}</td>
                        <td className="px-5 py-3"><StatusBadge status={p.status || 'Paid'} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-3xl text-on-surface-dim mb-2">payments</span>
              <p className="text-sm text-on-surface-muted">No payments recorded yet</p>
              <Link to="/rent-collection" className="text-xs font-medium text-primary hover:underline mt-1 inline-block">Record your first payment</Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded-card border border-outline p-5 shadow-card">
            <h3 className="text-sm font-semibold text-on-surface mb-4">Occupancy by Floor</h3>
            <div className="space-y-3">
                {floors.slice(0, 5).map((f) => {
                const occ = f.units.filter(u => u.status === 'occupied').length
                const total = f.units.length
                const pct = Math.round((occ / total) * 100)
                return (
                  <Link key={f.name} to={`/properties/floor/${floorSlug(f.name)}`} className="block hover:bg-surface-container rounded-lg p-1.5 -mx-1.5 transition-colors group">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-on-surface-muted group-hover:text-primary transition-colors">{f.name}</span>
                      <span className="font-semibold text-on-surface">{occ}/{total}</span>
                    </div>
                    <div className="h-1.5 bg-surface-container-highest rounded-full">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </Link>
                )
              })}
            </div>
            {floors.length > 5 && (
              <Link to="/properties" className="text-xs font-medium text-primary hover:underline mt-3 inline-block">View all floors</Link>
            )}
            {floors.length === 0 && (
              <p className="text-xs text-on-surface-muted text-center py-4">No floors added yet</p>
            )}
          </div>

          <div className="bg-surface rounded-card border border-outline p-5 shadow-card">
            <h3 className="text-sm font-semibold text-on-surface mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { icon: 'add_business', label: 'Add Floor', to: '/properties', color: 'bg-primary-50 text-primary' },
                { icon: 'person_add', label: 'Add Tenant', to: '/properties', color: 'bg-green-50 text-green-700' },
                { icon: 'payments', label: 'Record Payment', to: '/rent-collection', color: 'bg-orange-50 text-orange-700' },
              ].map((a) => (
                <Link key={a.label} to={a.to} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-surface-container transition-colors group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.color}`}>
                    <span className="material-symbols-outlined text-lg">{a.icon}</span>
                  </div>
                  <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
