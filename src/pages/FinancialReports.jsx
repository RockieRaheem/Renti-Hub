import BarChart from '../components/charts/BarChart'
import DonutChart from '../components/charts/DonutChart'
import StatusBadge from '../components/ui/StatusBadge'
import { reportSummary, cashFlowData, revenueMix, propertyBreakdown } from '../data/financialReports'

export default function FinancialReports() {
  const totalMix = revenueMix.reduce((s, item) => s + item.value, 0)
  const maxCashFlow = Math.max(...cashFlowData.flatMap((d) => [d.income, d.expenses]))

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {reportSummary.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-premium border border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
              <span className={`text-xs font-bold ${s.color}`}>{s.trend}</span>
            </div>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">{s.label}</p>
            <h3 className="text-2xl font-extrabold text-on-surface">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-premium border border-border-subtle">
          <h3 className="text-xl font-bold text-on-surface mb-6">Cash Flow Analysis</h3>
          <div className="flex gap-6 mb-6">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary" /><span className="text-xs text-on-surface-variant">Income</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-tertiary" /><span className="text-xs text-on-surface-variant">Expenses</span></div>
          </div>
          <div className="h-[280px] w-full flex items-end justify-between gap-3 px-2 border-b border-border-subtle">
            {cashFlowData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-1">
                  <div className="w-full bg-primary rounded-t transition-all" style={{ height: `${(d.income / maxCashFlow) * 200}px`, opacity: 0.4 + (d.income / maxCashFlow) * 0.6 }} />
                  <div className="w-full bg-tertiary rounded-t transition-all" style={{ height: `${(d.expenses / maxCashFlow) * 200}px`, opacity: 0.6 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-3">
            {cashFlowData.map((d, i) => <span key={i}>{d.month}</span>)}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-premium border border-border-subtle">
          <h3 className="text-xl font-bold text-on-surface mb-6">Revenue Mix</h3>
          <div className="flex flex-col items-center">
            <DonutChart data={revenueMix} total={totalMix} />
            <div className="flex flex-wrap gap-6 mt-8 justify-center">
              {revenueMix.map((slice, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: slice.color }} />
                  <span className="text-sm text-on-surface-variant">{slice.label}</span>
                  <span className="text-sm font-bold text-on-surface">{slice.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-premium border border-border-subtle overflow-hidden">
        <div className="px-8 py-6 border-b border-border-subtle">
          <h3 className="text-xl font-bold text-on-surface">Property Revenue Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                {['Property', 'Type', 'Occupied Units', 'Occupancy', 'Revenue', 'Collection Rate'].map((h) => (
                  <th key={h} className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {propertyBreakdown.map((p, i) => (
                <tr key={i} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-8 py-5 font-bold text-on-surface">{p.name}</td>
                  <td className="px-8 py-5"><StatusBadge status={p.type} /></td>
                  <td className="px-8 py-5 font-medium">{p.units}</td>
                  <td className="px-8 py-5 font-bold text-status-paid">{p.occupancy}</td>
                  <td className="px-8 py-5 font-bold">{p.revenue}</td>
                  <td className="px-8 py-5"><span className="font-bold text-primary">{p.collection}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
