import { useState, useMemo } from 'react'
import StatusBadge from '../components/ui/StatusBadge'
import { building, tenants, tenantFilters, getAvatarColor, statusBorders } from '../data/currentBuilding'

const PAGE_SIZE = 5
const sortKeys = { name: 'name', rent: 'rent', leaseEnd: 'leaseEnd', status: 'status' }

function parseRent(r) {
  return parseInt(r.replace(/[^0-9]/g, ''), 10)
}

export default function Tenants() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (key) => {
    if (sortKey === key) { setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')) }
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const filtered = useMemo(() => {
    let result = tenants.filter((t) => {
      if (filter !== 'All' && t.status !== filter) return false
      if (search) {
        const q = search.toLowerCase()
        return t.name.toLowerCase().includes(q) || t.unit.toLowerCase().includes(q) || t.initials.toLowerCase().includes(q)
      }
      return true
    })
    if (sortKey) {
      result = [...result].sort((a, b) => {
        let va = a[sortKey], vb = b[sortKey]
        if (sortKey === 'rent') { va = parseRent(va); vb = parseRent(vb) }
        else { va = (va || '').toLowerCase(); vb = (vb || '').toLowerCase() }
        return va < vb ? (sortDir === 'asc' ? -1 : 1) : va > vb ? (sortDir === 'asc' ? 1 : -1) : 0
      })
    }
    return result
  }, [filter, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span className="material-symbols-outlined text-gray-200 text-base">unfold_more</span>
    return <span className="material-symbols-outlined text-blue-600 text-base">{sortDir === 'asc' ? 'expand_less' : 'expand_more'}</span>
  }
  const ThButton = ({ col, children }) => (
    <button onClick={() => handleSort(col)} className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold uppercase tracking-wider hover:text-gray-600 transition-colors">
      {children} <SortIcon col={col} />
    </button>
  )

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="flex items-center gap-3 mb-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{building.name}</span> &mdash; {tenants.length} tenants
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center bg-gray-50 rounded-lg p-0.5 gap-0.5">
            {tenantFilters.map((f) => (
              <button key={f} onClick={() => { setFilter(f); setPage(1) }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>{f}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus-within:border-blue-400 transition-colors">
              <span className="material-symbols-outlined text-gray-400 text-xl">search</span>
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="bg-transparent border-none outline-none text-sm w-44 text-gray-900 placeholder:text-gray-400" placeholder="Search tenants..." />
            </div>
          </div>
        </div>

        {paged.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">people</span>
            <p className="text-gray-500 text-sm">No tenants match</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-6 py-3"><ThButton col="name">Tenant</ThButton></th>
                    <th className="text-left px-6 py-3 text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Unit</th>
                    <th className="text-left px-6 py-3"><ThButton col="leaseEnd">Lease End</ThButton></th>
                    <th className="text-left px-6 py-3"><ThButton col="rent">Rent</ThButton></th>
                    <th className="text-left px-6 py-3"><ThButton col="status">Status</ThButton></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paged.map((t) => (
                    <tr key={t.name} className={`hover:bg-gray-50 transition-colors border-l-4 ${statusBorders[t.status] || 'border-l-transparent'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${getAvatarColor(t.initials)}`}>{t.initials}</div>
                          <div>
                            <p className="font-medium text-gray-900">{t.name}</p>
                            <p className="text-xs text-gray-400">{t.lease}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{t.unit}</td>
                      <td className="px-6 py-4 text-gray-700">{t.leaseEnd}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{t.rent}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={t.status} />
                          <div className={`w-2 h-2 rounded-full ${t.paid ? 'bg-green-500' : 'bg-red-400'}`} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">Showing {(safePage - 1) * PAGE_SIZE + 1}&ndash;{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-colors">Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${p === safePage ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>{p}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-colors">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
