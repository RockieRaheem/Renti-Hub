import { useParams, Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import StatusBadge from '../components/ui/StatusBadge'

export default function FloorDetails() {
  const { floorName } = useParams()
  const { building, getFloorBySlug, getAvatarColor } = useBuilding()
  const floor = getFloorBySlug(floorName)

  if (!floor) {
    return (
      <div className="p-6 md:p-8 text-center py-20">
        <p className="text-gray-400 text-sm">Floor not found</p>
        <Link to="/properties" className="text-blue-600 text-sm font-medium mt-2 inline-block hover:underline">Back to Building</Link>
      </div>
    )
  }

  const occ = floor.units.filter((u) => u.status === 'occupied').length
  const vac = floor.units.length - occ
  const rev = floor.units.reduce((s, u) => s + (u.status === 'occupied' ? u.monthlyRent : 0), 0)
  const pct = Math.round((occ / floor.units.length) * 100)

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <Link to="/properties" className="hover:text-blue-600 transition-colors">Tenants</Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="text-gray-900 font-medium">{floor.name}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 to-blue-400" />
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{floor.name}</h2>
              <p className="text-sm text-gray-400">{building.name} &middot; {floor.units.length} units</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="font-bold text-gray-900">{occ}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Occupied</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-400">{vac}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Vacant</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-blue-600">{pct}%</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Full</p>
              </div>
            </div>
          </div>

          <div className="h-2 bg-gray-100 rounded-full mb-5">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>

          <div className="grid gap-4">
            {floor.units.map((unit) => {
              const t = unit.tenant
              return (
                <Link
                  key={unit.id}
                  to={`/properties/floor/${floorName}/unit/${unit.id}`}
                  className="block bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold ${unit.status === 'occupied' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'}`}>
                        <span className="material-symbols-outlined text-xl">{unit.status === 'occupied' ? 'store' : 'meeting_room'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{unit.name}</h3>
                          <StatusBadge status={unit.status} />
                        </div>
                        <p className="text-xs text-gray-400">{unit.type} &middot; {unit.size}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 group-hover:text-blue-400 transition-colors">chevron_right</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    {t ? (
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold ${getAvatarColor(t.initials)}`}>
                          {t.initials}
                        </div>
                        <span className="text-gray-700">{t.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300 italic text-xs">No tenant</span>
                    )}
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{unit.rent}</p>
                      {t && (
                        <p className={`text-[10px] font-medium ${t.paid ? 'text-green-600' : 'text-red-500'}`}>
                          {t.paid ? 'Paid' : 'Outstanding'}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
