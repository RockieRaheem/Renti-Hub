import { useState } from 'react'
import StatusBadge from '../components/ui/StatusBadge'
import { propertyStats, buildings } from '../data/properties'

export default function Properties() {
  const [expanded, setExpanded] = useState({})
  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Properties', value: propertyStats.total },
          { label: 'Occupancy Rate', value: propertyStats.occupancy },
          { label: 'Total Revenue', value: propertyStats.revenue },
          { label: 'Active Tenants', value: propertyStats.tenants },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-premium border border-border-subtle">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">{s.label}</p>
            <h3 className="text-3xl font-extrabold text-on-surface">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {buildings.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl shadow-premium border border-border-subtle overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-primary/30">apartment</span>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-on-surface">{b.name}</h3>
                  <p className="text-sm text-on-surface-variant">{b.location}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-surface-container-low rounded-xl">
                <div className="text-center">
                  <p className="text-lg font-extrabold text-on-surface">{b.units}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Units</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold text-status-paid">{b.occupied}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Occupied</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold text-primary">{b.units - b.occupied}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Vacant</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-primary">{b.revenue}</span>
                <button onClick={() => toggle(b.id)} className="text-sm text-tertiary font-bold flex items-center gap-1 hover:underline">
                  {expanded[b.id] ? 'Collapse' : 'View Units'}
                  <span className="material-symbols-outlined text-sm">{expanded[b.id] ? 'expand_less' : 'expand_more'}</span>
                </button>
              </div>
              {expanded[b.id] && (
                <div className="mt-4 space-y-4 border-t border-border-subtle pt-4">
                  {b.floors.map((floor, fi) => (
                    <div key={fi}>
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{floor.name}</p>
                      <div className="space-y-2">
                        {floor.units.map((unit) => (
                          <div key={unit.id} className="flex justify-between items-center p-3 bg-surface-container-low rounded-lg">
                            <div>
                              <p className="text-sm font-semibold text-on-surface">{unit.name}</p>
                              <p className="text-xs text-on-surface-variant">{unit.tenant}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-on-surface">{unit.rent}</p>
                              <StatusBadge status={unit.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
