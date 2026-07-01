import { useState } from 'react'
import StatusBadge from '../components/ui/StatusBadge'
import { building, floors } from '../data/currentBuilding'

function UnitRow({ unit }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-2 h-2 rounded-full shrink-0 ${unit.status === 'occupied' ? 'bg-green-500' : 'bg-gray-300'}`} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{unit.name}</p>
          <p className="text-xs text-gray-400 truncate">{unit.tenant}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-medium text-gray-900">{unit.rent}</span>
        <div className="w-16 text-right">
          <StatusBadge status={unit.status} />
        </div>
      </div>
    </div>
  )
}

export default function Properties() {
  const [expanded, setExpanded] = useState(true)

  const totalUnits = floors.reduce((s, f) => s + f.units.length, 0)
  const occupiedUnits = floors.reduce((s, f) => s + f.units.filter((u) => u.status === 'occupied').length, 0)
  const vacantUnits = totalUnits - occupiedUnits
  const occPct = Math.round((occupiedUnits / totalUnits) * 100)

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 pb-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{building.name}</h2>
              <p className="text-sm text-gray-400">{building.location}</p>
            </div>
            <StatusBadge status={building.type} />
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{totalUnits}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Units</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{occupiedUnits}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Occupied</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-400">{vacantUnits}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Vacant</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{occPct}%</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Full</p>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400 font-medium">Occupancy</span>
              <span className="font-semibold text-gray-900">{occPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${occPct}%` }} />
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium">{floors.length} floors &middot; {totalUnits} units</span>
          <span className={`material-symbols-outlined text-lg transition-transform ${expanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        {expanded && (
          <div className="px-6 pb-6 space-y-5">
            {floors.map((floor) => (
              <div key={floor.name} className="pt-4 first:pt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{floor.name}</p>
                <div className="divide-y divide-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                  {floor.units.map((unit) => (
                    <UnitRow key={unit.id} unit={unit} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
