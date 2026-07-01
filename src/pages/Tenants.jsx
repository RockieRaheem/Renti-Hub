import { useState, useMemo } from 'react'
import StatusBadge from '../components/ui/StatusBadge'
import { building, floors, tenantFilters, getAvatarColor, statusBorders } from '../data/currentBuilding'

const PAGE_SIZE = 5

const allTenants = floors.flatMap((f) =>
  f.units.filter((u) => u.tenant).map((u) => ({ ...u.tenant, floor: f.name, unit: u.name }))
)

export default function Tenants() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [groupByFloor, setGroupByFloor] = useState(true)

  const filtered = useMemo(() => {
    return allTenants.filter((t) => {
      if (filter !== 'All' && t.paymentStatus !== filter) return false
      if (search) {
        const q = search.toLowerCase()
        return t.name.toLowerCase().includes(q) || t.unit.toLowerCase().includes(q) || t.floor.toLowerCase().includes(q)
      }
      return true
    })
  }, [filter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach((t) => {
      if (!map[t.floor]) map[t.floor] = []
      map[t.floor].push(t)
    })
    return map
  }, [filtered])

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="flex items-center gap-3 mb-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{building.name}</span> &mdash; {allTenants.length} tenants across {floors.length} floors
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-50 rounded-lg p-0.5 gap-0.5">
              {tenantFilters.map((f) => (
                <button key={f} onClick={() => { setFilter(f); setPage(1) }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>{f}</button>
              ))}
            </div>
            <div className="w-px h-5 bg-gray-200" />
            <button onClick={() => setGroupByFloor(!groupByFloor)}
              className={`text-xs font-medium transition-colors ${groupByFloor ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
              {groupByFloor ? 'By Floor' : 'Flat View'}
            </button>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus-within:border-blue-400 transition-colors">
            <span className="material-symbols-outlined text-gray-400 text-xl">search</span>
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="bg-transparent border-none outline-none text-sm w-44 text-gray-900 placeholder:text-gray-400" placeholder="Search tenants..." />
          </div>
        </div>

        {paged.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">people</span>
            <p className="text-gray-500 text-sm">No tenants match</p>
          </div>
        ) : groupByFloor ? (
          <div className="divide-y divide-gray-100">
            {Object.entries(grouped).map(([floorName, floorTenants]) => {
              const f = floors.find((fl) => fl.name === floorName)
              const occ = f ? f.units.filter((u) => u.status === 'occupied').length : 0
              return (
                <div key={floorName}>
                  <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">{floorName}</span>
                      <span className="text-xs text-gray-400">{floorTenants.length} tenants</span>
                    </div>
                    <span className="text-xs text-gray-400">{occ} units</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {floorTenants.map((t) => (
                      <div key={t.name} className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-l-4 ${statusBorders[t.paymentStatus] || 'border-l-transparent'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${getAvatarColor(t.initials)}`}>{t.initials}</div>
                          <div>
                            <p className="font-medium text-gray-900">{t.name}</p>
                            <p className="text-xs text-gray-400">{t.unit} &middot; {t.rent}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={t.paymentStatus} />
                          <div className={`w-2 h-2 rounded-full ${t.paid ? 'bg-green-500' : 'bg-red-400'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {filtered.length > PAGE_SIZE && (
              <div className="px-6 py-4 flex items-center justify-between">
                <p className="text-xs text-gray-400">{(safePage - 1) * PAGE_SIZE + 1}&ndash;{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none">Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-md text-xs font-medium ${p === safePage ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>{p}</button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none">Next</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {paged.map((t) => (
                <div key={t.name} className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-l-4 ${statusBorders[t.paymentStatus] || 'border-l-transparent'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${getAvatarColor(t.initials)}`}>{t.initials}</div>
                    <div>
                      <p className="font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.floor} &middot; {t.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={t.paymentStatus} />
                    <div className={`w-2 h-2 rounded-full ${t.paid ? 'bg-green-500' : 'bg-red-400'}`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">{(safePage - 1) * PAGE_SIZE + 1}&ndash;{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none">Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-md text-xs font-medium ${p === safePage ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>{p}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
