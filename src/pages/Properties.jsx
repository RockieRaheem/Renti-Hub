import { Link } from 'react-router-dom'
import StatusBadge from '../components/ui/StatusBadge'
import { building, floors, totalUnits, occupiedUnits, monthlyRevenue, floorSlug } from '../data/currentBuilding'

const floorStyles = [
  {
    icon: 'storefront',
    gradient: 'from-amber-800 to-amber-600',
    lightBg: 'bg-amber-50',
    iconBg: 'bg-white/15',
    iconShadow: 'shadow-amber-800/15',
    accent: 'text-amber-700',
    chipFloor: 'bg-amber-100 text-amber-800',
  },
  {
    icon: 'business',
    gradient: 'from-slate-800 to-slate-600',
    lightBg: 'bg-slate-50',
    iconBg: 'bg-white/15',
    iconShadow: 'shadow-slate-800/15',
    accent: 'text-slate-700',
    chipFloor: 'bg-slate-100 text-slate-800',
  },
  {
    icon: 'celebration',
    gradient: 'from-rose-800 to-rose-600',
    lightBg: 'bg-rose-50',
    iconBg: 'bg-white/15',
    iconShadow: 'shadow-rose-800/15',
    accent: 'text-rose-700',
    chipFloor: 'bg-rose-100 text-rose-800',
  },
]

export default function Properties() {
  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Units', value: totalUnits, icon: 'door_front' },
          { label: 'Occupied', value: occupiedUnits, icon: 'check_circle' },
          { label: 'Vacant', value: totalUnits - occupiedUnits, icon: 'meeting_room' },
          { label: 'Monthly Revenue', value: `UGX ${(monthlyRevenue / 1000000).toFixed(1)}M`, icon: 'trending_up' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <span className="material-symbols-outlined text-gray-300 text-xl">{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-800/15">
          <span className="material-symbols-outlined text-white text-2xl">apartment</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{building.name}</h2>
          <p className="text-sm text-gray-400">{building.location}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>{occupiedUnits} occupied</span>
          </div>
          <div className="h-5 w-px bg-gray-200" />
          <StatusBadge status={building.type} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {floors.map((floor, index) => {
          const occ = floor.units.filter((u) => u.status === 'occupied').length
          const vac = floor.units.length - occ
          const rev = floor.units.reduce((s, u) => s + (u.status === 'occupied' ? u.monthlyRent : 0), 0)
          const pct = Math.round((occ / floor.units.length) * 100)
          const style = floorStyles[index]

          return (
            <Link
              key={floor.name}
              to={`/properties/floor/${floorSlug(floor.name)}`}
              className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`bg-gradient-to-r ${style.gradient} p-5 pb-6 relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }} />
                <div className="flex items-start justify-between relative">
                  <div className={`w-12 h-12 rounded-2xl ${style.iconBg} backdrop-blur-sm flex items-center justify-center shadow-lg ${style.iconShadow}`}>
                    <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>{style.icon}</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-semibold text-white tracking-wide">
                    {pct}% occupied
                  </div>
                </div>
                <h3 className="text-white text-xl font-bold mt-4 relative">{floor.name}</h3>
                <p className="text-white/70 text-sm mt-0.5 relative">{floor.units.length} units &middot; {building.name}</p>
              </div>

              <div className="p-5 -mt-2 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{occ}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Occupied</p>
                    </div>
                    <div className="w-px h-8 bg-gray-100" />
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-300">{vac}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Vacant</p>
                    </div>
                    <div className="w-px h-8 bg-gray-100" />
                    <div className="text-center">
                      <p className={`text-lg font-bold ${style.accent}`}>{pct}%</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Full</p>
                    </div>
                  </div>
                  <div className={style.lightBg + ' rounded-lg px-3 py-2 text-center'}>
                    <p className={`text-sm font-bold ${style.accent}`}>UGX {(rev / 1000000).toFixed(1)}M</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wide">Revenue</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  {floor.units.map((unit) => (
                    <div
                      key={unit.id}
                      className={`flex-1 h-2 rounded-full transition-all duration-300 group-hover:scale-y-150 ${
                        unit.status === 'occupied' ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      title={`${unit.name}: ${unit.status}`}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {floor.units.map((unit) => (
                    <span
                      key={unit.id}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition-colors ${
                        unit.status === 'occupied'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}
                    >
                      {unit.name}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    {floor.units.filter((u) => u.tenant).slice(0, 5).map((unit) => (
                      <div
                        key={unit.id}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold border-2 border-white -mr-1.5 shadow-sm ${style.chipFloor}`}
                      >
                        {unit.tenant?.initials}
                      </div>
                    ))}
                    {occ > 5 && (
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500 border-2 border-white -ml-1">
                        +{occ - 5}
                      </div>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    View floor
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
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
