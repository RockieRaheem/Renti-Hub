import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import StatusBadge from '../components/ui/StatusBadge'
import PaymentReceipt from '../components/PaymentReceipt'
import { downloadCSV } from '../utils/csv'
import { downloadTenantPDF, downloadPaymentPDF } from '../utils/pdf'
import { fetchUnpaidPeriodCounts } from '../lib/queries'

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

function timeAgo(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return fmtDate(dateStr)
}

function paymentMonthLabel(dateStr) {
  if (!dateStr) return ''
  const dt = new Date(dateStr + 'T00:00:00')
  if (isNaN(dt.getTime())) return ''
  return dt.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function AgingIndicator({ days }) {
  if (days < 0) return null
  if (days === 0) return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-green-600 bg-green-50">Today</span>
  const color = days <= 30 ? 'text-yellow-600 bg-yellow-50' : days <= 60 ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50'
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${color}`}>{days}d</span>
}

function methodBadge(method) {
  const styles = {
    Cash: 'bg-yellow-50 text-yellow-700',
    'Mobile Money': 'bg-blue-50 text-blue-700',
    'Bank Transfer': 'bg-purple-50 text-purple-700',
    Cheque: 'bg-orange-50 text-orange-700',
  }
  return styles[method] || 'bg-gray-50 text-gray-600'
}

function KpiCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-surface rounded-card border border-outline p-4 shadow-card">
      <div className="flex items-center justify-between mb-2.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent || 'bg-primary-50'}`}>
          <span className="material-symbols-outlined text-xl" style={{ color: accent ? '#1a1a2e' : undefined }}>{icon}</span>
        </div>
      </div>
      <p className="text-xl font-bold text-on-surface mb-0.5 tracking-tight">{value}</p>
      <p className="text-[11px] text-on-surface-muted">{label}</p>
      {sub && <p className="text-[10px] text-on-surface-dim mt-0.5">{sub}</p>}
    </div>
  )
}

export default function RentCollection() {
  const { floors, floorSlug, payments, addPayment, building } = useBuilding()
  const [filterFloor, setFilterFloor] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [search, setSearch] = useState('')
  const [expandedTenant, setExpandedTenant] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [unpaidCounts, setUnpaidCounts] = useState({})
  const [form, setForm] = useState({
    tenantName: '', unit: '', floor: '', amount: '', method: 'Cash', status: 'Paid', date: new Date().toISOString().slice(0, 10),
  })

  const allTenants = floors.flatMap((f) =>
    f.units.filter((u) => u.tenant).map((u) => ({
      ...u.tenant, unit: u.name, floor: f.name, unitId: u.id, monthlyRent: u.monthlyRent,
      outstandingBalance: u.tenant.outstandingBalance || 0,
    }))
  )

  useEffect(() => {
    const ids = allTenants.map((t) => t.id).filter(Boolean)
    if (ids.length === 0) { setUnpaidCounts({}); return }
    fetchUnpaidPeriodCounts(ids).then(({ data }) => {
      if (data) setUnpaidCounts(data)
    })
  }, [allTenants.length])

  const filtered = (filterFloor === 'all' ? allTenants : allTenants.filter((t) => t.floor === filterFloor))
    .filter((t) => !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.unit?.toLowerCase().includes(search.toLowerCase()))

  const totalCollected = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const totalExpected = allTenants.reduce((s, t) => s + (t.monthlyRent || 0), 0)
  const overdueCount = allTenants.filter((t) => (t.outstandingBalance || 0) > 0).length
  const totalDebt = allTenants.reduce((s, t) => s + Math.max(0, t.outstandingBalance || 0), 0)
  const totalCredit = allTenants.reduce((s, t) => s + Math.max(0, -(t.outstandingBalance || 0)), 0)
  const collectionRate = totalExpected > 0 ? Math.round(((totalExpected - totalDebt) / totalExpected) * 100) : 0

  const submitTimeoutRef = useRef(null)
  const [formErrors, setFormErrors] = useState({})

  const handleRecordPayment = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    const errors = {}
    if (!form.tenantName) errors.tenantName = 'Tenant is required'
    if (!form.floor) errors.floor = 'Floor is required'
    if (!form.unit) errors.unit = 'Unit is required'
    if (!form.amount || parseFloat(form.amount) <= 0) errors.amount = 'Valid amount required'
    if (!form.date) errors.date = 'Date is required'
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)

    clearTimeout(submitTimeoutRef.current)
    submitTimeoutRef.current = setTimeout(() => {
      setSubmitting(false)
      setSubmitError('Request timed out. Please try again.')
    }, 15000)

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
        setFormErrors({})
        setShowModal(false)
      }
    } catch (err) {
      setSubmitError(err?.message || 'An unexpected error occurred while recording payment.')
    } finally {
      clearTimeout(submitTimeoutRef.current)
      setSubmitting(false)
    }
  }

  const handleTenantSelect = (value) => {
    if (!value || value === '|') {
      setForm({ tenantName: '', unit: '', floor: '', amount: '', method: 'Cash', status: 'Paid', date: form.date })
      setFormErrors({})
      return
    }
    const [floor, unit] = value.split('|')
    const tenant = allTenants.find((t) => t.floor === floor && t.unit === unit)
    if (tenant) {
      setForm({
        tenantName: tenant.name,
        unit: tenant.unit,
        floor: tenant.floor,
        amount: (tenant.monthlyRent || 0).toString(),
        method: 'Cash',
        status: 'Paid',
        date: form.date,
      })
      setFormErrors({})
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

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <KpiCard icon="payments" label="Total Collected" value={`UGX ${(totalCollected / 1000000).toFixed(1)}M`} sub={`${payments.length} payments`} />
        <KpiCard icon="account_balance" label="Expected Revenue" value={`UGX ${(totalExpected / 1000000).toFixed(1)}M`} sub={`${allTenants.length} tenants`} />
        <KpiCard icon="pie_chart" label="Collection Rate" value={`${collectionRate}%`} sub={totalExpected > 0 ? (totalDebt > 0 ? `${overdueCount} tenant${overdueCount !== 1 ? 's' : ''} overdue` : 'All paid up') : 'No data'} accent={collectionRate >= 90 ? 'bg-green-50' : collectionRate >= 50 ? 'bg-yellow-50' : 'bg-red-50'} />
        <KpiCard icon="warning" label="Outstanding Debt" value={`UGX ${(totalDebt / 1000000).toFixed(1)}M`} sub={`${overdueCount} tenant${overdueCount !== 1 ? 's' : ''} overdue`} accent={totalDebt > 0 ? 'bg-red-50' : 'bg-green-50'} />
        <KpiCard icon="account_balance_wallet" label="Credit / Prepaid" value={totalCredit > 0 ? `UGX ${(totalCredit / 1000000).toFixed(1)}M` : 'None'} sub={totalCredit > 0 ? `${allTenants.filter(t => (t.outstandingBalance || 0) < 0).length} tenant(s) with credit` : 'No prepayments'} />
        <KpiCard icon="trending_up" label="Avg per Tenant" value={allTenants.length > 0 ? `UGX ${Math.round(totalExpected / allTenants.length).toLocaleString()}` : '—'} sub={`${allTenants.length} active tenants`} />
      </div>

      <div className="bg-surface rounded-card border border-outline overflow-hidden shadow-card">
        <div className="p-5 border-b border-outline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-dim text-base">groups</span>
              <h3 className="text-sm font-semibold text-on-surface">Tenants</h3>
              <span className="text-[10px] text-on-surface-dim bg-surface-container px-1.5 py-0.5 rounded-full">{filtered.length}</span>
            </div>
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
                  <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Tenant</th>
                  <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Unit / Floor</th>
                  <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Rent</th>
                  <th className="text-center px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Outstanding</th>
                  <th className="text-center px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Aging</th>
                  <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Last Payment</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {filtered.map((t) => {
                  const isExpanded = expandedTenant === `${t.floor}|${t.unit}`
                  const history = tenantPayments(t)
                  const displayStatus = !t.lastPayment && history.length === 0 ? 'No Payment' : t.paid ? 'Paid' : 'Overdue'
                  const days = agingDays(t.lastPaymentDate || history[0]?.date)
                  return (
                    <React.Fragment key={`${t.floor}-${t.unit}`}>
                      <tr className="hover:bg-surface-container/50 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold ${statusColor(t.paymentStatus)}`}>
                              {initials(t.name)}
                            </div>
                            <div>
                              <Link to={`/tenant-payments/${floorSlug(t.floor)}/${t.unitId}`}
                                className="font-medium text-on-surface hover:text-primary transition-colors text-sm">
                                {t.name || 'Unknown'}
                              </Link>
                              {history.length > 0 && (
                                <span className="text-[10px] text-on-surface-dim ml-1.5">{history.length} payment{history.length !== 1 ? 's' : ''}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/properties/floor/${floorSlug(t.floor)}/unit/${t.unitId}`}
                            className="text-on-surface-muted hover:text-primary transition-colors">
                            {t.unit} <span className="text-on-surface-dim text-[11px]">{t.floor}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-on-surface whitespace-nowrap">UGX {(t.monthlyRent || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-center"><StatusBadge status={displayStatus} /></td>
                        <td className={`px-4 py-3 text-xs font-medium whitespace-nowrap text-right ${
                          t.outstandingBalance > 0 ? 'text-status-unpaid' :
                          t.outstandingBalance < 0 ? 'text-blue-600' : 'text-on-surface-muted'
                        }`}>
                          {t.outstandingBalance > 0
                            ? (() => {
                                const mo = unpaidCounts[t.id] || 0
                                return <><span>UGX {t.outstandingBalance.toLocaleString()}</span>{mo > 0 && <span className="text-[9px] text-on-surface-dim ml-1">({mo}mo)</span>}</>
                              })()
                            : t.outstandingBalance < 0
                              ? `UGX ${Math.abs(t.outstandingBalance).toLocaleString()} cr`
                              : '\u2014'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {t.outstandingBalance > 0 ? <AgingIndicator days={days} /> : <span className="text-[10px] text-on-surface-dim">Current</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-on-surface-muted text-xs whitespace-nowrap">{fmtDate(t.lastPaymentDate)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openPaymentForm(t)}
                              className="text-xs font-medium text-primary hover:bg-primary-50 px-2 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">payments</span>
                              Pay
                            </button>
                            <Link to={`/tenant-payments/${floorSlug(t.floor)}/${t.unitId}`}
                              className="text-xs font-medium text-on-surface-muted hover:text-primary p-1.5 rounded-lg hover:bg-surface-container transition-colors"
                              title="Payment history">
                              <span className="material-symbols-outlined text-sm">receipt_long</span>
                            </Link>
                            {history.length > 0 && (
                              <button onClick={() => setExpandedTenant(isExpanded ? null : `${t.floor}|${t.unit}`)}
                                className="text-xs font-medium text-on-surface-muted hover:bg-surface-container p-1.5 rounded-lg transition-colors">
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
                                      <td className="px-4 py-2 text-on-surface-muted whitespace-nowrap">
                                        <span title={fmtDate(p.date)}>{timeAgo(p.date) || fmtDate(p.date)}</span>
                                      </td>
                                      <td className="px-4 py-2">
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${methodBadge(p.method)}`}>
                                          {p.method || 'Cash'}
                                        </span>
                                      </td>
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
              </tbody>
              <tfoot>
                <tr className="bg-surface-container/30 text-sm border-t-2 border-outline">
                  <td className="px-4 py-3 text-on-surface font-medium">{filtered.length} tenant{filtered.length !== 1 ? 's' : ''}</td>
                  <td colSpan={2}></td>
                  <td></td>
                  <td className="px-4 py-3 text-right font-bold text-status-unpaid">UGX {Math.max(0, filtered.reduce((s, t) => s + (t.outstandingBalance || 0), 0)).toLocaleString()}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-outline">
              <h2 className="text-sm font-bold text-on-surface">Record Payment</h2>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-4 space-y-3">
              {form.tenantName && form.date && (
                <div className="bg-primary-50 border border-primary-100 rounded-lg px-3 py-1.5 text-[11px] text-primary-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs">calendar_month</span>
                  <span>Paying <strong>{paymentMonthLabel(form.date)}</strong> for <strong>{form.tenantName}</strong></span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-on-surface-muted uppercase tracking-wide mb-1">Tenant</label>
                <select value={`${form.floor}|${form.unit}`} onChange={(e) => handleTenantSelect(e.target.value)}
                  className={`w-full h-9 px-3 border rounded-lg text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-no-repeat bg-[length:14px] bg-[right_10px_center] ${formErrors.tenantName ? 'border-red-400 bg-red-50' : 'border-outline'}`}
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")" }}>
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
                {formErrors.tenantName && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.tenantName}</p>}
              </div>

              {form.tenantName && (
                <div className="bg-surface-container rounded-lg border border-outline p-2.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-dim">{form.tenantName}</span>
                    <span className="text-on-surface-muted">{form.floor} &middot; {form.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-dim">Monthly Rent</span>
                    <span className="font-medium text-on-surface">UGX {(() => {
                      const t = allTenants.find((t) => t.floor === form.floor && t.unit === form.unit)
                      return t ? (t.monthlyRent || 0).toLocaleString() : '—'
                    })()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-dim">Outstanding</span>
                    <span className={`font-semibold ${(() => {
                      const t = allTenants.find((t) => t.floor === form.floor && t.unit === form.unit)
                      const bal = t?.outstandingBalance || 0
                      return bal > 0 ? 'text-status-unpaid' : bal < 0 ? 'text-blue-600' : 'text-status-paid'
                    })()}`}>
                      {(() => {
                        const t = allTenants.find((t) => t.floor === form.floor && t.unit === form.unit)
                        const bal = t?.outstandingBalance || 0
                        return bal > 0 ? `UGX ${bal.toLocaleString()} due` : bal < 0 ? `UGX ${Math.abs(bal).toLocaleString()} cr` : 'Settled'
                      })()}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-on-surface-muted uppercase tracking-wide mb-1">Amount (UGX)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-dim text-xs font-medium">UGX</span>
                    <input type="number" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
                      className={`w-full h-9 pl-9 pr-2.5 border rounded-lg text-xs text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${formErrors.amount ? 'border-red-400 bg-red-50' : 'border-outline'}`}
                      placeholder="0" min="0" step="100" required />
                  </div>
                  {formErrors.amount && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.amount}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-on-surface-muted uppercase tracking-wide mb-1">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                    className={`w-full h-9 px-2.5 border rounded-lg text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${formErrors.date ? 'border-red-400 bg-red-50' : 'border-outline'}`}
                    required />
                  {formErrors.date && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.date}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-on-surface-muted uppercase tracking-wide mb-1">Method</label>
                  <select value={form.method} onChange={(e) => setForm(p => ({ ...p, method: e.target.value }))}
                    className="w-full h-9 px-2.5 border border-outline rounded-lg text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-no-repeat bg-[length:14px] bg-[right_10px_center]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")" }}>
                    <option value="Cash">Cash</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-on-surface-muted uppercase tracking-wide mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full h-9 px-2.5 border border-outline rounded-lg text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-no-repeat bg-[length:14px] bg-[right_10px_center]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")" }}>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              {submitError && (
                <div className="flex items-start gap-1.5 p-2.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700">
                  <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">error</span>
                  <span>{submitError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)} disabled={submitting}
                  className="px-3 py-1.5 text-xs font-medium text-on-surface-muted hover:bg-surface-container rounded-lg transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-card transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1">
                  {submitting ? (
                    <><span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
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
