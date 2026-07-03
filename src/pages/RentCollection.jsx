import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import StatusBadge from '../components/ui/StatusBadge'
import { downloadCSV } from '../utils/csv'
import { downloadTenantPDF, downloadPaymentPDF } from '../utils/pdf'

export default function RentCollection() {
  const { floors, floorSlug, payments, addPayment } = useBuilding()
  const [filterFloor, setFilterFloor] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ tenantName: '', unit: '', floor: '', amount: '', status: 'Paid', date: new Date().toISOString().slice(0, 10) })

  const allTenants = floors.flatMap((f) =>
    f.units.filter((u) => u.tenant).map((u) => ({ ...u.tenant, unit: u.name, floor: f.name, unitId: u.id, monthlyRent: u.monthlyRent, outstandingBalance: u.tenant.outstandingBalance || 0 }))
  )
  const filtered = (filterFloor === 'all' ? allTenants : allTenants.filter((t) => t.floor === filterFloor))
    .filter((t) => !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.unit?.toLowerCase().includes(search.toLowerCase()))

  const totalCollected = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const totalExpected = allTenants.reduce((s, t) => s + (t.monthlyRent || 0), 0)
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0
  const overdueCount = allTenants.filter((t) => !t.paid).length
  const totalOutstanding = allTenants.reduce((s, t) => s + (t.outstandingBalance || 0), 0)

  const inputClass = 'w-full h-10 px-3.5 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'

  const handleRecordPayment = async (e) => {
    e.preventDefault()
    await addPayment({
      floor: form.floor, unit: form.unit, amount: parseFloat(form.amount),
      method: 'Cash', tenantName: form.tenantName, status: form.status, date: form.date,
    })
    setForm({ tenantName: '', unit: '', floor: '', amount: '', status: 'Paid', date: new Date().toISOString().slice(0, 10) })
    setShowModal(false)
  }

  const latestPayments = [...payments].reverse().slice(0, 5)

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: 'payments', label: 'Total Collected', value: `UGX ${(totalCollected / 1000000).toFixed(1)}M` },
          { icon: 'account_balance', label: 'Expected Revenue', value: `UGX ${(totalExpected / 1000000).toFixed(1)}M` },
          { icon: 'pie_chart', label: 'Collection Rate', value: `${collectionRate}%`, sub: `${payments.length} payments` },
          { icon: 'warning', label: 'Outstanding / Overdue', value: `UGX ${(totalOutstanding / 1000000).toFixed(1)}M`, sub: `${overdueCount} tenant${overdueCount !== 1 ? 's' : ''}` },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-card border border-outline p-5 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">{s.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-on-surface mb-0.5 tracking-tight">{s.value}</p>
            <p className="text-xs text-on-surface-muted">{s.label}</p>
            {s.sub && <p className="text-[11px] text-on-surface-dim mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-card border border-outline overflow-hidden shadow-card">
        <div className="p-5 border-b border-outline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
            <h3 className="text-sm font-semibold text-on-surface">Tenants</h3>
            <div className="relative flex-1 sm:flex-initial min-w-[160px]">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-dim text-sm pointer-events-none">search</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tenant or unit..."
                className="w-full h-8 pl-7 pr-2.5 border border-outline rounded-lg text-xs text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="flex items-center bg-surface-container-highest rounded-lg p-0.5 gap-0.5">
              <button onClick={() => setFilterFloor('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${filterFloor === 'all' ? 'bg-surface text-on-surface shadow-card' : 'text-on-surface-muted hover:text-on-surface'}`}>
                All
              </button>
              {floors.map((f) => (
                <button key={f.name} onClick={() => setFilterFloor(f.name)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${filterFloor === f.name ? 'bg-surface text-on-surface shadow-card' : 'text-on-surface-muted hover:text-on-surface'}`}>
                  {f.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportMenu
              onCSV={() => {
                const data = allTenants.map((t) => ({
                  Tenant: t.name, Unit: t.unit, Floor: t.floor,
                  'Monthly Rent': t.monthlyRent || 0,
                  Status: t.paid ? 'Paid' : 'Overdue',
                  'Outstanding UGX': t.outstandingBalance || 0,
                  'Last Payment': t.lastPaymentDate || '',
                }))
                downloadCSV(data, 'rentihub_tenants.csv')
              }}
              onPDF={() => downloadTenantPDF(allTenants)}
              onPDFPayments={() => downloadPaymentPDF(payments)}
            />
            <button onClick={() => setShowModal(true)}
              className="px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-card inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">add</span>
              Record Payment
            </button>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline bg-surface-container/50">
                  {['Tenant', 'Unit', 'Floor', 'Monthly Rent', 'Status', 'Outstanding', 'Last Payment', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] text-on-surface-muted font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {filtered.map((t) => (
                  <tr key={`${t.floor}-${t.unit}`} className="hover:bg-surface-container transition-colors group">
                    <td className="px-5 py-3">
                      <Link to={`/properties/floor/${floorSlug(t.floor)}/unit/${t.unitId}`}
                        className="flex items-center gap-2.5 group/link">
                        <div className={`w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold ${t.paymentStatus === 'Good Payer' ? 'bg-green-50 text-green-700' : t.paymentStatus === 'Neutral Payer' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                          {t.name ? t.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'}
                        </div>
                        <span className="font-medium text-on-surface group-hover/link:text-primary transition-colors">{t.name || 'Unknown'}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <Link to={`/properties/floor/${floorSlug(t.floor)}/unit/${t.unitId}`}
                        className="text-on-surface-muted hover:text-primary transition-colors">
                        {t.unit}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-on-surface-muted">{t.floor}</td>
                    <td className="px-5 py-3 font-medium text-on-surface">UGX {(t.monthlyRent || 0).toLocaleString()}</td>
                    <td className="px-5 py-3"><StatusBadge status={t.paid ? 'Paid' : 'Overdue'} /></td>
                    <td className={`px-5 py-3 text-xs font-medium ${t.outstandingBalance > 0 ? 'text-status-unpaid' : 'text-on-surface-muted'}`}>
                      {t.outstandingBalance > 0 ? `UGX ${t.outstandingBalance.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-on-surface-muted text-xs">{t.lastPaymentDate || '—'}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => {
                        setForm({ tenantName: t.name, unit: t.unit, floor: t.floor, amount: (t.monthlyRent || 0).toString(), status: 'Paid', date: new Date().toISOString().slice(0, 10) })
                        setShowModal(true)
                      }}
                        className="text-xs font-medium text-primary hover:bg-primary-50 px-2.5 py-1.5 rounded-lg transition-colors">
                        Record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-5">
            <span className="material-symbols-outlined text-4xl text-on-surface-dim mb-3">payments</span>
            <p className="text-sm text-on-surface-muted mb-1">No tenants found</p>
            <p className="text-xs text-on-surface-dim">Add tenants to start tracking rent payments</p>
          </div>
        )}
      </div>

      {latestPayments.length > 0 && (
        <div className="bg-surface rounded-card border border-outline p-5 shadow-card">
          <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {latestPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-outline/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-status-paid" />
                  <div>
                    <p className="text-sm font-medium text-on-surface">{p.tenantName}</p>
                    <p className="text-xs text-on-surface-muted">{p.unit} &middot; {p.date}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-status-paid">UGX {(p.amount || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline">
              <div>
                <h2 className="text-base font-bold text-on-surface">Record Payment</h2>
                <p className="text-xs text-on-surface-muted mt-0.5">Select tenant and enter amount</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Select Tenant</label>
                  <select value={`${form.floor}|${form.unit}`} onChange={(e) => {
                    const [floor, unit] = e.target.value.split('|')
                    const tenant = allTenants.find((t) => t.floor === floor && t.unit === unit)
                    setForm(p => ({ ...p, floor, unit, tenantName: tenant?.name || '', amount: tenant ? (tenant.monthlyRent || 0).toString() : p.amount }))
                  }} className={inputClass}>
                    <option value="|">Choose a tenant...</option>
                    {floors.map((f) => {
                      const floorTenants = allTenants.filter((t) => t.floor === f.name)
                      if (floorTenants.length === 0) return null
                      return (
                        <optgroup key={f.name} label={f.name}>
                          {floorTenants.map((t) => (
                            <option key={`${t.floor}|${t.unit}`} value={`${t.floor}|${t.unit}`}>
                              {t.name} — {t.unit} (UGX {(t.monthlyRent || 0).toLocaleString()})
                            </option>
                          ))}
                        </optgroup>
                      )
                    })}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Tenant Name</label>
                  <input value={form.tenantName} onChange={(e) => setForm(p => ({ ...p, tenantName: e.target.value }))} className={inputClass} placeholder="Tenant name" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Floor</label>
                  <input value={form.floor} onChange={(e) => setForm(p => ({ ...p, floor: e.target.value }))} className={inputClass} placeholder="Floor" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Unit</label>
                  <input value={form.unit} onChange={(e) => setForm(p => ({ ...p, unit: e.target.value }))} className={inputClass} placeholder="Unit" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Amount (UGX)</label>
                  <input type="number" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))} className={inputClass} placeholder="1000000" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} className={inputClass} required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))} className={inputClass}>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-sm font-medium text-on-surface-muted hover:bg-surface-container rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-card transition-colors">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ExportMenu({ onCSV, onPDF, onPDFPayments }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)}
        className="px-3.5 py-2 border border-outline text-on-surface-muted text-xs font-semibold rounded-lg hover:bg-surface-container transition-colors inline-flex items-center gap-1.5">
        <span className="material-symbols-outlined text-base">download</span>
        Export
        <span className="material-symbols-outlined text-sm">{open ? 'expand_less' : 'expand_more'}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-surface rounded-xl border border-outline shadow-lg z-20 py-1">
          <button onClick={() => { onCSV(); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors text-left">
            <span className="material-symbols-outlined text-lg text-on-surface-muted">table_chart</span>
            <div>
              <p className="font-medium text-on-surface">Export CSV</p>
              <p className="text-[11px] text-on-surface-dim">Spreadsheet format</p>
            </div>
          </button>
          <button onClick={() => { onPDF(); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors text-left">
            <span className="material-symbols-outlined text-lg text-status-unpaid">picture_as_pdf</span>
            <div>
              <p className="font-medium text-on-surface">Tenants Report (PDF)</p>
              <p className="text-[11px] text-on-surface-dim">Tenant list with balances</p>
            </div>
          </button>
          <button onClick={() => { onPDFPayments(); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors text-left">
            <span className="material-symbols-outlined text-lg text-primary">receipt_long</span>
            <div>
              <p className="font-medium text-on-surface">Payments Report (PDF)</p>
              <p className="text-[11px] text-on-surface-dim">All recorded payments</p>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
