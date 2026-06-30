import { useState } from 'react'
import StatusBadge from '../components/ui/StatusBadge'
import { propertyStats, buildings, propertyTypes } from '../data/properties'

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
  const [expanded, setExpanded] = useState({})
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  const filtered = buildings.filter((b) => {
    if (filter !== 'All' && b.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        b.name.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        b.floors.some((f) =>
          f.units.some(
            (u) =>
              u.name.toLowerCase().includes(q) ||
              u.tenant.toLowerCase().includes(q)
          )
        )
      )
    }
    return true
  })

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-72 focus-within:border-blue-400 transition-colors">
          <span className="material-symbols-outlined text-gray-400 text-xl">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties, units or tenants..."
            className="flex-1 text-sm outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-gray-50 rounded-lg p-0.5 gap-0.5">
            {propertyTypes.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === t
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
            <span className="material-symbols-outlined text-lg">add</span>
            Add Property
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Properties', value: propertyStats.total },
          { label: 'Occupancy Rate', value: propertyStats.occupancy },
          { label: 'Total Revenue', value: propertyStats.revenue },
          { label: 'Active Tenants', value: propertyStats.tenants },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-medium mb-0.5">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">estate</span>
          <p className="text-gray-500 text-sm">No properties match your search</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((b) => {
          const vacant = b.units - b.occupied
          const occPct = Math.round((b.occupied / b.units) * 100)
          const isOpen = expanded[b.id]
          return (
            <div key={b.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="h-2 bg-blue-600" />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{b.name}</h3>
                    <p className="text-sm text-gray-400">{b.location}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">{b.units}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Units</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-green-600">{b.occupied}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Full</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-400">{vacant}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Open</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-blue-600">{b.shops}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Shops</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 font-medium">Occupancy</span>
                    <span className="font-semibold text-gray-900">{occPct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${occPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-semibold text-gray-900">{b.revenue}</span>
                  <button
                    onClick={() => toggle(b.id)}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {isOpen ? 'Hide units' : `${b.floors.length} floors`}
                    <span className={`material-symbols-outlined text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                    {b.floors.map((floor) => (
                      <div key={floor.name}>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{floor.name}</p>
                        <div className="divide-y divide-gray-50">
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
        })}
      </div>
    </div>
  )
}
