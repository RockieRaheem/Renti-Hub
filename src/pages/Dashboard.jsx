import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../components/ui/StatusBadge'
import {
  kpis, revenueMonthly, revenueQuarterly, revenueYearly,
  regions, occupancyBreakdown, transactions, alerts, upcomingPayments,
} from '../data/dashboard'

const periodMap = {
  Monthly: revenueMonthly,
  Quarterly: revenueQuarterly,
  Annual: revenueYearly,
}

const urgencyColors = {
  Urgent: 'bg-red-50 border-red-200 text-red-700',
  Overdue: 'bg-orange-50 border-orange-200 text-orange-700',
  Upcoming: 'bg-blue-50 border-blue-200 text-blue-700',
}

export default function Dashboard() {
  const [period, setPeriod] = useState('Monthly')
  const revenueData = periodMap[period]
  const maxRevenue = Math.max(...revenueData.map((d) => d.value))

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-medium mb-0.5">{k.label}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{k.value}</p>
            <p className="text-xs text-gray-400">{k.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Revenue Growth</h3>
              <p className="text-sm text-gray-400">Rental income across all Kampala regions</p>
            </div>
            <div className="flex items-center bg-gray-50 rounded-lg p-0.5 gap-0.5">
              {['Monthly', 'Quarterly', 'Annual'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    period === p
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-3 h-48">
            {revenueData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] text-gray-400 font-medium leading-none">{d.label}</span>
                <div
                  className={`w-full rounded-sm transition-all duration-300 ${
                    d.projected
                      ? 'bg-orange-100 border border-dashed border-orange-400'
                      : 'bg-blue-600'
                  }`}
                  style={{ height: `${(d.value / maxRevenue) * 70}%` }}
                />
                <span className="text-[11px] text-gray-500 font-medium mt-auto pt-2">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-5">Alerts & Reminders</h3>
            {alerts.length === 0 && (
              <p className="text-sm text-gray-400">No active alerts</p>
            )}
            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a.issue} className={`rounded-lg border p-3.5 ${urgencyColors[a.urgency]}`}>
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">{a.type}</span>
                    <span className="text-xs font-semibold">{a.due}</span>
                  </div>
                  <p className="text-sm font-medium">{a.issue}</p>
                  <p className="text-xs opacity-80 mt-0.5">{a.property}</p>
                </div>
              ))}
              <Link to="/maintenance-requests" className="block text-center text-xs font-medium text-blue-600 hover:text-blue-700 pt-1">
                View all alerts
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Occupancy by Type</h3>
            <div className="space-y-3">
              {occupancyBreakdown.map((o) => (
                <div key={o.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{o.label}</span>
                    <span className="font-semibold text-gray-900">{o.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${o.value}%`, backgroundColor: o.color }}
                    />
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
            <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
            <Link to="/rent-collection" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Property', 'Unit', 'Tenant', 'Status', 'Amount'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((t) => (
                  <tr key={t.property + t.tenant} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{t.property}</td>
                    <td className="px-6 py-4 text-gray-500">{t.unit}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-500">{t.initials}</div>
                        <span className="text-gray-700">{t.tenant}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={t.badge} /></td>
                    <td className="px-6 py-4 font-medium text-gray-900">{t.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Upcoming Payments</h3>
            <Link to="/rent-collection" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingPayments.map((p) => (
              <div key={p.tenant} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.tenant}</p>
                  <p className="text-xs text-gray-400">{p.property}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{p.amount}</p>
                  <p className="text-xs text-gray-400">Due {p.due}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
