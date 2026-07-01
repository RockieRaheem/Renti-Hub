import { useBuilding } from '../context/BuildingContext'
import DonutChart from '../components/charts/DonutChart'

export default function FinancialReports() {
  const { building, floors, monthlyRevenue, cashFlowData, revenueMix } = useBuilding()
  const maxCashFlow = Math.max(...cashFlowData.flatMap((d) => [d.income, d.expenses]))
  const totalMix = revenueMix.reduce((s, item) => s + item.value, 0)

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="flex items-center gap-3 mb-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{building.name}</span> &mdash; Financial Reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Cash Flow</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-600" /><span className="text-xs text-gray-500">Income</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-500" /><span className="text-xs text-gray-500">Expenses</span></div>
          </div>
          <div className="flex items-end gap-3 h-52 border-b border-gray-100 pb-1">
            {cashFlowData.map((d) => {
              const incomeH = (d.income / maxCashFlow) * 85
              const expenseH = (d.expenses / maxCashFlow) * 85
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="flex items-end gap-1 w-full justify-center" style={{ height: `${Math.max(incomeH, expenseH)}%` }}>
                    <div className="w-[35%] bg-blue-600 rounded-t-sm transition-all" style={{ height: `${incomeH}%` }} />
                    <div className="w-[35%] bg-orange-500 rounded-t-sm transition-all" style={{ height: `${expenseH}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium pt-1">{d.month}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-5">Revenue Mix</h3>
            <div className="flex flex-col items-center">
              <DonutChart data={revenueMix} total={totalMix} size={160} strokeWidth={24} />
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6 w-full">
                {revenueMix.map((slice) => (
                  <div key={slice.label} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                    <span className="text-sm text-gray-500">{slice.label}</span>
                    <span className="text-sm font-semibold text-gray-900 ml-auto">{slice.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Revenue by Floor</h3>
            <div className="space-y-4">
              {floors.map((f) => {
                const rev = f.units.reduce((s, u) => s + (u.status === 'occupied' ? u.monthlyRent : 0), 0)
                const pct = monthlyRevenue > 0 ? Math.round((rev / monthlyRevenue) * 100) : 0
                return (
                  <div key={f.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{f.name}</span>
                      <span className="font-semibold text-gray-900">UGX {(rev / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{pct}% of total</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
