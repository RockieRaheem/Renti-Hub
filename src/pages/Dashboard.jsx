import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../components/ui/StatusBadge'
import { building, floors, totalUnits, occupiedUnits, vacantUnits, monthlyRevenue, revenueMonthly, revenueMix, transactions, alerts, upcomingPayments, tenantFilters } from '../data/currentBuilding'

const maxRevenue = Math.max(...revenueMonthly.map((d) => d.value))

function FloorCard({ floor }) {
  const occ = floor.units.filter((u) => u.status === 'occupied').length
  const rev = floor.units.reduce((s, u) => s + (u.status === 'occupied' ? u.monthlyRent : 0), 0)
  const pct = Math.round((occ / floor.units.length) * 100)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900">{floor.name}</h4>
        <span className="text-xs text-gray-400">{occ}/{floor.units.length} occupied</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full mb-3">
        <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">Revenue</span>
        <span className="font-semibold text-gray-900">UGX {(rev / 1000000).toFixed(1)}M</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [period, setPeriod] = useState('Monthly')
  const data = revenueMonthly

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="flex items-center gap-3 mb-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{building.name}</span> &mdash; {building.location}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Units', value: totalUnits },
          { label: 'Occupied', value: occupiedUnits },
          { label: 'Monthly Revenue', value: `UGX ${(monthlyRevenue / 1000000).toFixed(1)}M` },
          { label: 'Vacant', value: vacantUnits },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-medium mb-0.5">{k.label}</p>
            <p className="text-2xl font-bold text-gray-900">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Monthly Revenue</h3>
              <p className="text-sm text-gray-400">{building.name}</p>
            </div>
            <div className="flex items-center bg-gray-50 rounded-lg p-0.5 gap-0.5">
              {['Monthly', 'Quarterly', 'Annual'].map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-3 h-48">
            {data.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] text-gray-400 font-medium leading-none">{d.label}</span>
                <div className={`w-full rounded-sm transition-all duration-300 ${d.projected ? 'bg-orange-100 border border-dashed border-orange-400' : 'bg-blue-600'}`}
                  style={{ height: `${(d.value / maxRevenue) * 70}%` }} />
                <span className="text-[11px] text-gray-500 font-medium mt-auto pt-2">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Floor Overview</h3>
            <div className="space-y-3">
              {floors.map((f) => <FloorCard key={f.name} floor={f} />)}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Revenue by Type</h3>
            <div className="space-y-3">
              {revenueMix.map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{r.label}</span>
                    <span className="font-semibold text-gray-900">{r.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-full rounded-full transition-all" style={{ width: `${r.value}%`, backgroundColor: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Recent Payments</h3>
            <Link to="/rent-collection" className="text-xs font-medium text-blue-600 hover:text-blue-700">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Floor', 'Unit', 'Tenant', 'Status', 'Amount'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((t) => (
                  <tr key={t.tenant} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-400 text-xs">{t.floor}</td>
                    <td className="px-6 py-4 text-gray-500">{t.unit}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{t.tenant}</td>
                    <td className="px-6 py-4"><StatusBadge status={t.badge} /></td>
                    <td className="px-6 py-4 font-medium text-gray-900">{t.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Alerts</h3>
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.issue} className={`rounded-lg border p-3.5 ${
                a.urgency === 'Urgent' ? 'bg-red-50 border-red-200 text-red-700' :
                a.urgency === 'Overdue' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider">{a.type}</span>
                  <span className="text-xs font-semibold">{a.due}</span>
                </div>
                <p className="text-sm font-medium">{a.issue}</p>
              </div>
            ))}
            <Link to="/maintenance-requests" className="block text-center text-xs font-medium text-blue-600 hover:text-blue-700 pt-1">View all</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
