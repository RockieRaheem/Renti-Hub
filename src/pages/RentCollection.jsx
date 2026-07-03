import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import StatusBadge from '../components/ui/StatusBadge'
import PaymentReceipt from '../components/PaymentReceipt'
import { downloadCSV } from '../utils/csv'
import { downloadTenantPDF, downloadPaymentPDF } from '../utils/pdf'

function initials(name) {
  return (name || '').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function statusColor(ps) {
  if (ps === 'Good Payer') return 'bg-green-50 text-green-700'
  if (ps === 'Neutral Payer') return 'bg-yellow-50 text-yellow-700'
  if (ps === 'Bad Payer') return 'bg-red-50 text-red-700'
  return 'bg-gray-100 text-gray-600'
}

function agingDays(lastPaymentDate) {
  if (!lastPaymentDate) return 90
  const d = new Date(lastPaymentDate)
  if (isNaN(d.getTime())) return 90
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
}

function fmtDate(d) {
  if (!d) return '—'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return d
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function AgingIndicator({ days }) {
  if (days < 0) return null
  if (days === 0) return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-green-600 bg-green-50">Today</span>
  const color = days <= 30 ? 'text-yellow-600 bg-yellow-50' : days <= 60 ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50'
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${color}`}>{days}d</span>
}

const inputClass = 'w-full h-10 px-3.5 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'

export default function RentCollection() {
  const { floors, floorSlug, payments, addPayment, building } = useBuilding()
  const [filterFloor, setFilterFloor] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [search, setSearch] = useState('')
  const [expandedTenant, setExpandedTenant] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [form, setForm] = useState({
    tenantName: '', unit: '', floor: '', amount: '', method: 'Cash', status: 'Paid', date: new Date().toISOString().slice(0, 10),
  })

  const allTenants = floors.flatMap((f) =>
    f.units.filter((u) => u.tenant).map((u) => ({
      ...u.tenant, unit: u.name, floor: f.name, unitId: u.id, monthlyRent: u.monthlyRent,
      outstandingBalance: u.tenant.outstandingBalance || 0,
    }))
  )
  const filtered = (filterFloor === 'all' ? allTenants : allTenants.filter((t) => t.floor === filterFloor))
    .filter((t) => !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.unit?.toLowerCase().includes(search.toLowerCase()))

  const totalCollected = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const totalExpected = allTenants.reduce((s, t) => s + (t.monthlyRent || 0), 0)
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0
  const overdueCount = allTenants.filter((t) => !t.paid).length
  const totalOutstanding = allTenants.reduce((s, t) => s + (t.outstandingBalance || 0), 0)

  const handleRecordPayment = async (e) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)
    try {
      const result = await addPayment({
        floor: form.floor, unit: form.unit, amount: parseFloat(form.amount) || 0,
        method: form.method, tenantName: form.tenantName, status: form.status, date: form.date,
      })
      if (result?.error) {
        setSubmitError(result.error)
      } else if (result) {
        setReceipt(result)
        setForm({
          tenantName: '', unit: '', floor: '', amount: '', method: 'Cash', status: 'Paid',
          date: new Date().toISOString().slice(0, 10),
        })
        setShowModal(false)
      }
    } catch (err) {
      setSubmitError(err?.message || 'An unexpected error occurred while recording payment.')
    } finally {
      setSubmitting(false)
    }
  }

  const openPaymentForm = (tenant) => {
    setForm({
      tenantName: tenant.name, unit: tenant.unit, floor: tenant.floor,
      amount: (tenant.monthlyRent || 0).toString(), method: 'Cash', status: 'Paid',
      date: new Date().toISOString().slice(0, 10),
    })
    setShowModal(true)
  }

  const tenantPayments = (tenant) =>
    payments.filter((p) => p.tenantName === tenant.name && p.unit === tenant.unit).slice(0, 20)

  const latestPayments = [...payments].reverse().slice(0, 5)

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: 'payments', label: 'Total Collected', value: `UGX ${(totalCollected / 1000000).toFixed(1)}M`, sub: `${payments.length} payments` },
          { icon: 'account_balance', label: 'Expected Revenue', value: `UGX ${(totalExpected / 1000000).toFixed(1)}M`, sub: `${allTenants.length} tenants` },
          { icon: 'pie_chart', label: 'Collection Rate', value: `${collectionRate}%`, sub: totalExpected > 0 ? `${totalCollected >= totalExpected ? 'On target' : `${((totalExpected - totalCollected) / 1000000).toFixed(1)}M short`}` : 'No data' },
          { icon: 'warning', label: 'Outstanding', value: `UGX ${(totalOutstanding / 1000000).toFixed(1)}M`, sub: `${overdueCount} overdue tenant${overdueCount !== 1 ? 's' : ''}` },
          { icon: 'receipt_long', label: 'Avg per Tenant', value: `UGX ${allTenants.length ? Math.round(totalCollected / allTenants.length / 1000) * 1000 : 0}`, sub: `${((collectionRate / 100) * totalExpected / (allTenants.length || 1) / 1000000).toFixed(1)}M avg rent` },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-card border border-outline p-4 shadow-card">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-lg">{s.icon}</span>
              </div>
            </div>
            <p className="text-xl font-bold text-on-surface mb-0.5 tracking-tight">{s.value}</p>
            <p className="text-[11px] text-on-surface-muted">{s.label}</p>
            {s.sub && <p className="text-[10px] text-on-surface-dim mt-0.5">{s.sub}</p>}
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
                  {['Tenant', 'Unit / Floor', 'Monthly Rent', 'Status', 'Outstanding', 'Aging', 'Last Payment', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] text-on-surface-muted font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {filtered.map((t) => {
                  const isExpanded = expandedTenant === `${t.floor}|${t.unit}`
                  const history = tenantPayments(t)
                  const lastPayStatus = history[0]?.status
                  const displayStatus = lastPayStatus || (t.outstandingBalance > 0 ? 'Overdue' : t.lastPayment ? 'Paid' : 'No Payment')
                  const days = agingDays(t.lastPaymentDate || history[0]?.date)
                  return (
                    <React.Fragment key={`${t.floor}-${t.unit}`}>
                      <tr className="hover:bg-surface-container transition-colors group">
                        <td className="px-4 py-3">
                          <button onClick={() => setExpandedTenant(isExpanded ? null : `${t.floor}|${t.unit}`)}
                            className="flex items-center gap-2.5 group/link text-left">
                            <div className={`w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold ${statusColor(t.paymentStatus)}`}>
                              {initials(t.name)}
                            </div>
                            <div>
                              <span className="font-medium text-on-surface group-hover/link:text-primary transition-colors text-sm">{t.name || 'Unknown'}</span>
                              {history.length > 0 && (
                                <span className="text-[10px] text-on-surface-dim ml-1.5">{history.length} payment{history.length !== 1 ? 's' : ''}</span>
                              )}
                            </div>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/properties/floor/${floorSlug(t.floor)}/unit/${t.unitId}`}
                            className="text-on-surface-muted hover:text-primary transition-colors">
                            {t.unit} <span className="text-on-surface-dim text-[11px]">{t.floor}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-medium text-on-surface whitespace-nowrap">UGX {(t.monthlyRent || 0).toLocaleString()}</td>
                        <td className="px-4 py-3"><StatusBadge status={displayStatus} /></td>
                        <td className={`px-4 py-3 text-xs font-medium whitespace-nowrap ${t.outstandingBalance > 0 ? 'text-status-unpaid' : 'text-on-surface-muted'}`}>
                          {t.outstandingBalance > 0 ? `UGX ${t.outstandingBalance.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {t.outstandingBalance > 0 ? <AgingIndicator days={days} /> : <span className="text-[10px] text-on-surface-dim">Current</span>}
                        </td>
                        <td className="px-4 py-3 text-on-surface-muted text-xs whitespace-nowrap">{fmtDate(t.lastPaymentDate)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openPaymentForm(t)}
                              className="text-xs font-medium text-primary hover:bg-primary-50 px-2 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">payments</span>
                              Pay
                            </button>
                            {history.length > 0 && (
                              <button onClick={() => setExpandedTenant(isExpanded ? null : `${t.floor}|${t.unit}`)}
                                className="text-xs font-medium text-on-surface-muted hover:bg-surface-container px-2 py-1.5 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-sm">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && history.length > 0 && (
                        <tr key={`${t.floor}-${t.unit}-history`}>
                          <td colSpan={8} className="px-4 pb-4 pt-0">
                            <div className="bg-surface-container/50 rounded-lg border border-outline/50 overflow-hidden ml-12">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-outline/50 bg-surface-container/30">
                                    <th className="text-left px-4 py-2 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Receipt</th>
                                    <th className="text-left px-4 py-2 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Date</th>
                                    <th className="text-left px-4 py-2 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Method</th>
                                    <th className="text-right px-4 py-2 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Amount</th>
                                    <th className="text-center px-4 py-2 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2"></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-outline/30">
                                  {history.map((p) => (
                                    <tr key={p.id} className="hover:bg-surface-container/50">
                                      <td className="px-4 py-2 font-mono text-[11px] text-on-surface-muted">{p.receiptId}</td>
                                      <td className="px-4 py-2 text-on-surface-muted">{fmtDate(p.date)}</td>
                                      <td className="px-4 py-2 text-on-surface-muted">{p.method || 'Cash'}</td>
                                      <td className="px-4 py-2 text-right font-medium text-on-surface">UGX {(p.amount || 0).toLocaleString()}</td>
                                      <td className="px-4 py-2 text-center">
                                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${p.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                          {p.status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-right">
                                        <button onClick={() => setReceipt({ ...p, previousBalance: 0 })}
                                          className="text-[11px] text-primary hover:underline">
                                          Receipt
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
                <tr className="bg-surface-container/30 font-medium text-sm">
                  <td className="px-4 py-3 text-on-surface">Total ({filtered.length} tenant{filtered.length !== 1 ? 's' : ''})</td>
                  <td colSpan={2}></td>
                  <td></td>
                  <td className="px-4 py-3 font-bold text-status-unpaid">UGX {filtered.reduce((s, t) => s + (t.outstandingBalance || 0), 0).toLocaleString()}</td>
                  <td colSpan={3}></td>
                </tr>
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
          <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider mb-4">Recent Payments</h3>
          <div className="space-y-2">
            {latestPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-outline/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-status-paid" />
                  <div>
                    <p className="text-sm font-medium text-on-surface">{p.tenantName}</p>
                    <p className="text-xs text-on-surface-muted">{p.unit} &middot; {fmtDate(p.date)} &middot; <span className="font-mono text-[10px]">{p.receiptId}</span></p>
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
                      const ft = allTenants.filter((t) => t.floor === f.name)
                      if (ft.length === 0) return null
                      return (
                        <optgroup key={f.name} label={f.name}>
                          {ft.map((t) => (
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
                <div>
                  <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Payment Method</label>
                  <select value={form.method} onChange={(e) => setForm(p => ({ ...p, method: e.target.value }))} className={inputClass}>
                    <option value="Cash">Cash</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))} className={inputClass}>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
              {submitError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                  <span>{submitError}</span>
                </div>
              )}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} disabled={submitting}
                  className="px-4 py-2.5 text-sm font-medium text-on-surface-muted hover:bg-surface-container rounded-lg transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-card transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1.5">
                  {submitting ? (
                    <><span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                  ) : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {receipt && (
        <PaymentReceipt
          payment={receipt}
          tenant={receipt.tenantName}
          floor={receipt.floor}
          unit={receipt.unit}
          buildingName={building?.name}
          onClose={() => setReceipt(null)}
        />
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
