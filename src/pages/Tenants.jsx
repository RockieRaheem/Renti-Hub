import StatusBadge from '../components/ui/StatusBadge'
import { tenantStats, tenants } from '../data/tenants'

const badgeClass = (initials) => {
  const good = ['MT', 'SU', 'SB', 'CJ', 'FV', 'UT']
  const neutral = ['AM', 'BC']
  if (good.includes(initials)) return 'bg-primary-container text-white'
  if (neutral.includes(initials)) return 'bg-tertiary/20 text-tertiary'
  return 'bg-status-unpaid/10 text-status-unpaid'
}

export default function Tenants() {
  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Tenants', value: tenantStats.total, color: 'text-on-surface' },
          { label: 'Late Payers', value: tenantStats.latePayers, color: 'text-status-unpaid' },
          { label: 'Total Arrears', value: tenantStats.arrears, color: 'text-status-partial' },
          { label: 'Active Leases', value: tenantStats.activeLeases, color: 'text-status-paid' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-premium border border-border-subtle">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">{s.label}</p>
            <h3 className={`text-3xl font-extrabold ${s.color}`}>{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-premium border border-border-subtle overflow-hidden">
        <div className="px-8 py-5 border-b border-border-subtle flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            {['All', 'Good Payer', 'Neutral Payer', 'Bad Payer'].map((f) => (
              <button key={f} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${f === 'All' ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}>{f}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-4 py-2 border border-outline-variant">
              <span className="material-symbols-outlined text-outline text-[20px]">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-48 outline-none" placeholder="Search tenants..." />
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">download</span> Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                {['Tenant Name', 'Property / Unit', 'Lease Term', 'Monthly Rent', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {tenants.map((t, i) => (
                <tr key={i} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${badgeClass(t.initials)}`}>{t.initials}</div>
                      <span className="text-sm font-semibold text-on-surface">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">{t.unit}</td>
                  <td className="px-8 py-5 text-sm font-medium">{t.lease}</td>
                  <td className="px-8 py-5 text-sm font-bold">{t.rent}</td>
                  <td className="px-8 py-5"><StatusBadge status={t.status} /></td>
                  <td className="px-8 py-5">
                    <button className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-4 border-t border-border-subtle flex justify-between items-center">
          <p className="text-sm text-on-surface-variant">Showing 1-10 of {tenantStats.total} tenants</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((p) => (
              <button key={p} className={`w-9 h-9 rounded-lg text-sm font-bold ${p === 1 ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
