import { useState, useMemo } from 'react'
import StatusBadge from '../components/ui/StatusBadge'
import { tenantStats, tenants, tenantFilters, getAvatarColor, statusBorders } from '../data/tenants'

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
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const filtered = useMemo(() => {
    let result = tenants.filter((t) => {
      if (filter !== 'All' && t.status !== filter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          t.name.toLowerCase().includes(q) ||
          t.unit.toLowerCase().includes(q) ||
          t.initials.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q)
        )
      }
      return true
    })

    if (sortKey) {
      result = [...result].sort((a, b) => {
        let va = a[sortKey]
        let vb = b[sortKey]
        if (sortKey === 'rent') {
          va = parseRent(va)
          vb = parseRent(vb)
        } else {
          va = (va || '').toLowerCase()
          vb = (vb || '').toLowerCase()
        }
        if (va < vb) return sortDir === 'asc' ? -1 : 1
        if (va > vb) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [filter, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const distribution = useMemo(() => {
    const counts = { 'Good Payer': 0, 'Neutral Payer': 0, 'Bad Payer': 0 }
    tenants.forEach((t) => { counts[t.status]++ })
    const total = tenants.length
    return Object.entries(counts).map(([label, count]) => ({
      label, count, pct: Math.round((count / total) * 100),
    }))
  }, [])

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span className="material-symbols-outlined text-gray-200 text-base">unfold_more</span>
    return (
      <span className="material-symbols-outlined text-blue-600 text-base">
        {sortDir === 'asc' ? 'expand_less' : 'expand_more'}
      </span>
    )
  }

  const ThButton = ({ col, children }) => (
    <button onClick={() => handleSort(col)} className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold uppercase tracking-wider hover:text-gray-600 transition-colors">
      {children}
      <SortIcon col={col} />
    </button>
  )

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tenants', value: tenantStats.total },
          { label: 'Late Payers', value: tenantStats.latePayers, highlight: 'text-red-600' },
          { label: 'Total Arrears', value: tenantStats.arrears, highlight: 'text-orange-600' },
          { label: 'Active Leases', value: tenantStats.activeLeases, highlight: 'text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-medium mb-0.5">{s.label}</p>
            <p className={`text-2xl font-bold ${s.highlight || 'text-gray-900'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <p className="text-xs text-gray-500 font-medium mb-3">Payment Behavior Distribution</p>
        <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-100">
          {distribution.map((d) => (
            <div
              key={d.label}
              className={`h-full transition-all ${
                d.label === 'Good Payer' ? 'bg-green-500' : d.label === 'Neutral Payer' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${d.pct}%` }}
            />
          ))}
        </div>
        <div className="flex gap-5 mt-3">
          {distribution.map((d) => (
            <div key={d.label} className="flex items-center gap-1.5 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                d.label === 'Good Payer' ? 'bg-green-500' : d.label === 'Neutral Payer' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-gray-500">{d.label}</span>
              <span className="font-medium text-gray-900">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center bg-gray-50 rounded-lg p-0.5 gap-0.5">
            {tenantFilters.map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1) }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === f
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus-within:border-blue-400 transition-colors">
              <span className="material-symbols-outlined text-gray-400 text-xl">search</span>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="bg-transparent border-none outline-none text-sm w-44 text-gray-900 placeholder:text-gray-400"
                placeholder="Search tenants..."
              />
            </div>
            <button className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
              <span className="material-symbols-outlined text-lg">add</span>
              Add Tenant
            </button>
          </div>
        </div>

        {paged.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">people</span>
            <p className="text-gray-500 text-sm">No tenants match your search</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-6 py-3">
                      <ThButton col="name">Tenant</ThButton>
                    </th>
                    <th className="text-left px-6 py-3 text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Property / Unit</th>
                    <th className="text-left px-6 py-3">
                      <ThButton col="leaseEnd">Lease End</ThButton>
                    </th>
                    <th className="text-left px-6 py-3">
                      <ThButton col="rent">Rent</ThButton>
                    </th>
                    <th className="text-left px-6 py-3">
                      <ThButton col="status">Status</ThButton>
                    </th>
                    <th className="text-left px-6 py-3 text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paged.map((t) => (
                    <tr key={t.name} className={`hover:bg-gray-50 transition-colors border-l-4 ${statusBorders[t.status] || 'border-l-transparent'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${getAvatarColor(t.initials)}`}>
                            {t.initials}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{t.name}</p>
                            <p className="text-xs text-gray-400">{t.lease}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700">{t.unit}</p>
                        <p className="text-xs text-gray-400">{t.propertyType}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{t.leaseEnd}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{t.rent}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={t.status} />
                          <div className={`w-2 h-2 rounded-full ${t.paid ? 'bg-green-500' : 'bg-red-400'}`} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-500">{t.email}</p>
                        <p className="text-xs text-gray-400">{t.phone}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing {Math.min(filtered.length, (safePage - 1) * PAGE_SIZE + 1)}&ndash;{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} tenants
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${
                      p === safePage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
