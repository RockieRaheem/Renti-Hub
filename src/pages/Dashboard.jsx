import { Link } from 'react-router-dom'
import KpiCard from '../components/ui/KpiCard'
import StatusBadge from '../components/ui/StatusBadge'
import ProgressBar from '../components/ui/ProgressBar'
import BarChart from '../components/charts/BarChart'
import { kpis, revenueData, regions, transactions } from '../data/dashboard'

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-premium border border-border-subtle">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-on-surface">Revenue Growth & Projections</h3>
              <p className="text-on-surface-variant text-sm">Analyzing monthly rental income across all Kampala regions</p>
            </div>
            <div className="flex bg-surface-container-low p-1 rounded-lg">
              <button className="px-4 py-1.5 bg-white shadow-sm rounded-md text-sm font-bold text-primary">Monthly</button>
              <button className="px-4 py-1.5 text-sm font-medium text-on-surface-variant">Quarterly</button>
            </div>
          </div>
          <BarChart data={revenueData} />
          <div className="flex justify-between px-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            {revenueData.map((d, i) => <span key={i} className={d.projected ? 'text-tertiary' : ''}>{d.month}</span>)}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-premium border border-border-subtle flex flex-col">
          <h3 className="text-xl font-bold text-on-surface mb-6">Regional Performance</h3>
          <div className="space-y-6 flex-1">
            {regions.map((r, i) => (
              <ProgressBar key={i} label={r.name} value={r.pct} color={i === 0 ? 'bg-primary shadow-[0_0_8px_rgba(0,55,176,0.3)]' : 'bg-primary'} />
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-border-subtle">
            <p className="text-xs text-on-surface-variant font-medium">Top region: <span className="text-status-paid font-bold">Nakasero</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-premium border border-border-subtle overflow-hidden">
        <div className="px-8 py-6 border-b border-border-subtle flex justify-between items-center">
          <h3 className="text-xl font-bold text-on-surface">Critical Operational Insights</h3>
          <Link to="/rent-collection" className="text-primary text-sm font-bold hover:underline">View All Transactions</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                {['Property Asset', 'Type', 'Tenant', 'Payment Status', 'Amount', 'Action'].map((h) => (
                  <th key={h} className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {transactions.map((t, i) => (
                <tr key={i} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-bold text-on-surface">{t.property}</div>
                    <div className="text-xs text-on-surface-variant">{t.unit}</div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium">{t.type}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded ${t.initials === 'MT' ? 'bg-primary-container' : t.initials === 'AM' ? 'bg-tertiary/20 text-tertiary' : 'bg-secondary-container text-on-secondary-container'} text-[10px] text-white flex items-center justify-center font-bold`}>
                        {t.initials}
                      </div>
                      <span className="text-sm font-medium">{t.tenant}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5"><StatusBadge status={t.badge} /></td>
                  <td className="px-8 py-5 font-bold text-on-surface">{t.amount}</td>
                  <td className="px-8 py-5">
                    <Link to="/rent-collection" className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors inline-flex">
                      <span className="material-symbols-outlined">visibility</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
