import { useState } from 'react'
import StatusBadge from '../components/ui/StatusBadge'
import { building, floors, getAvatarColor } from '../data/currentBuilding'

function UnitDetail({ unit }) {
  const [showTenant, setShowTenant] = useState(false)

  return (
    <div className="border-b border-gray-50 last:border-0">
      <button
        onClick={() => unit.tenant && setShowTenant(!showTenant)}
        className={`w-full flex items-center justify-between py-3 px-4 transition-colors ${unit.tenant ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${unit.status === 'occupied' ? 'bg-green-500' : 'bg-gray-300'}`} />
          <div className="min-w-0 text-left">
            <p className="text-sm font-medium text-gray-900">{unit.name}</p>
            <p className="text-xs text-gray-400">{unit.type} &middot; {unit.size}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{unit.rent}</p>
            {unit.tenant && (
              <p className={`text-xs ${unit.tenant.paid ? 'text-green-600' : 'text-red-500'}`}>
                {unit.tenant.paid ? 'Paid' : 'Outstanding'}
              </p>
            )}
          </div>
          <StatusBadge status={unit.status} />
          {unit.tenant && (
            <span className={`material-symbols-outlined text-gray-300 text-lg transition-transform ${showTenant ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          )}
        </div>
      </button>

      {showTenant && unit.tenant && (
        <div className="px-4 pb-4 pt-2 ml-5 border-t border-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${getAvatarColor(unit.tenant.initials)}`}>
              {unit.tenant.initials}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{unit.tenant.name}</p>
              <p className="text-xs text-gray-400">{unit.tenant.email} &middot; {unit.tenant.phone}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
            {[
              { label: 'Lease', value: `${unit.tenant.leaseStart} - ${unit.tenant.leaseEnd}` },
              { label: 'Monthly Rent', value: `UGX ${unit.monthlyRent.toLocaleString()}/mo` },
              { label: 'Status', value: unit.tenant.paymentStatus },
              { label: 'Last Payment', value: `${unit.tenant.lastPayment} on ${unit.tenant.lastPaymentDate}` },
            ].map((d) => (
              <div key={d.label} className="flex justify-between">
                <span className="text-gray-400">{d.label}</span>
                <span className="font-medium text-gray-700">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Properties() {
  const [expandedFloor, setExpandedFloor] = useState(floors.map((f) => f.name))

  const toggleFloor = (name) => {
    setExpandedFloor((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const totalUnits = floors.reduce((s, f) => s + f.units.length, 0)
  const occupiedUnits = floors.reduce((s, f) => s + f.units.filter((u) => u.status === 'occupied').length, 0)
  const occPct = Math.round((occupiedUnits / totalUnits) * 100)

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 pb-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{building.name}</h2>
              <p className="text-sm text-gray-400">{building.location} &middot; {floors.length} floors</p>
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
              <p className="text-lg font-bold text-gray-400">{totalUnits - occupiedUnits}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Vacant</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{occPct}%</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Full</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400 font-medium">Occupancy</span>
              <span className="font-semibold text-gray-900">{occPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${occPct}%` }} />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100">
          {floors.map((floor) => {
            const isOpen = expandedFloor.includes(floor.name)
            const occCount = floor.units.filter((u) => u.status === 'occupied').length
            return (
              <div key={floor.name} className="border-b border-gray-100 last:border-0">
                <button onClick={() => toggleFloor(floor.name)}
                  className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-gray-300 text-lg transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                      chevron_right
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{floor.name}</span>
                    <span className="text-xs text-gray-400">{occCount}/{floor.units.length} occupied</span>
                  </div>
                  <span className="text-xs font-medium text-blue-600">
                    UGX {(floor.units.reduce((s, u) => s + (u.status === 'occupied' ? u.monthlyRent : 0), 0) / 1000000).toFixed(1)}M
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-50 divide-y divide-gray-50">
                    {floor.units.map((unit) => (
                      <UnitDetail key={unit.id} unit={unit} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
