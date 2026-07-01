import { Link } from 'react-router-dom'
import StatusBadge from '../components/ui/StatusBadge'
import { building, floors, totalUnits, occupiedUnits, monthlyRevenue, floorSlug } from '../data/currentBuilding'

const floorIcons = {
  'Ground Floor': 'ground_floor',
  '1st Floor': 'floor',
  '2nd Floor': 'floor_3',
}

const floorColors = [
  { bg: 'bg-blue-50', icon: 'text-blue-600', badge: 'bg-blue-600', from: 'from-blue-600', to: 'to-blue-400' },
  { bg: 'bg-indigo-50', icon: 'text-indigo-600', badge: 'bg-indigo-600', from: 'from-indigo-600', to: 'to-indigo-400' },
  { bg: 'bg-purple-50', icon: 'text-purple-600', badge: 'bg-purple-600', from: 'from-purple-600', to: 'to-purple-400' },
]

export default function Properties() {
  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Units', value: totalUnits },
          { label: 'Occupied Units', value: occupiedUnits },
          { label: 'Vacant', value: totalUnits - occupiedUnits },
          { label: 'Monthly Revenue', value: `UGX ${(monthlyRevenue / 1000000).toFixed(1)}M` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-medium mb-0.5">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-xl">apartment</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{building.name}</h2>
            <p className="text-sm text-gray-400">{building.location} &middot; {floors.length} floors</p>
          </div>
          <div className="ml-auto">
            <StatusBadge status={building.type} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {floors.map((floor, index) => {
          const occ = floor.units.filter((u) => u.status === 'occupied').length
          const vac = floor.units.length - occ
          const rev = floor.units.reduce((s, u) => s + (u.status === 'occupied' ? u.monthlyRent : 0), 0)
          const pct = Math.round((occ / floor.units.length) * 100)
          const colors = floorColors[index % floorColors.length]

          return (
            <Link
              key={floor.name}
              to={`/properties/floor/${floorSlug(floor.name)}`}
              className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className={`h-2 bg-gradient-to-r ${colors.from} ${colors.to}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-xl">{floorIcons[floor.name] || 'floor'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={pct >= 90 ? 'Full' : pct >= 70 ? 'Operational' : 'vacant'} />
                  </div>
                </div>

                <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">{floor.name}</h3>
                <p className="text-xs text-gray-400 mb-4">{floor.units.length} units</p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="font-medium text-gray-900">{occ}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-300" />
                      <span className="text-gray-400">{vac}</span>
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">UGX {(rev / 1000000).toFixed(1)}M</span>
                </div>

                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className={`h-full rounded-full transition-all ${occ === floor.units.length ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${pct}%` }} />
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400">{occ} occupied &middot; {pct}% full</span>
                  <span className="flex items-center gap-0.5 text-xs font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                    View units
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
