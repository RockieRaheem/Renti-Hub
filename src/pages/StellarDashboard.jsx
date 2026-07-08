import { useState, useCallback, useEffect } from 'react'
import { useBuilding } from '../context/BuildingContext'
import { anchorHash, fetchAnchorTransaction, STELLAR_EXPLORER_URL, sha256, isStellarConfigured, getStellarNetwork } from '../lib/stellar'

const PAYMENT_TYPES = new Set(['payment', 'payment_void'])
const SYSTEM_TYPES = new Set([
  'tenant_add', 'tenant_delete', 'tenant_update',
  'floor_add', 'floor_delete', 'floor_rename',
  'unit_update', 'unit_delete',
  'maintenance_add', 'maintenance_update', 'maintenance_move', 'maintenance_delete',
])

const TABS = [
  { key: 'payments', icon: 'receipt_long', label: 'Payments' },
  { key: 'system', icon: 'settings_suggest', label: 'System Events' },
  { key: 'all', icon: 'database', label: 'All Records' },
]

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

function fmtDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function timeAgo(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const now = new Date()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return fmtDate(dateStr)
}

function StatusBadge({ status }) {
  const map = {
    anchored: { label: 'Anchored', class: 'bg-emerald-50 text-emerald-700' },
    pending: { label: 'Pending', class: 'bg-amber-50 text-amber-700' },
    verified: { label: 'Verified', class: 'bg-emerald-50 text-emerald-700' },
    tampered: { label: 'Tampered', class: 'bg-red-50 text-red-700' },
    failed: { label: 'Failed', class: 'bg-red-50 text-red-700' },
    unanchored: { label: 'Not Anchored', class: 'bg-gray-50 text-gray-500' },
    skipped: { label: 'Skipped', class: 'bg-gray-50 text-gray-500' },
  }
  const s = map[status] || map.unanchored
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${s.class}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'verified' ? 'bg-emerald-500' : status === 'anchored' ? 'bg-emerald-400' : status === 'tampered' || status === 'failed' ? 'bg-red-500' : status === 'pending' ? 'bg-amber-400' : 'bg-gray-300'}`} />
      {s.label}
    </span>
  )
}

const RECORD_ICONS = {
  payment: 'receipt_long',
  payment_void: 'block',
  tenant_add: 'person_add',
  tenant_delete: 'person_remove',
  tenant_update: 'edit',
  floor_add: 'layers',
  floor_delete: 'layers_clear',
  floor_rename: 'drive_file_rename_outline',
  unit_update: 'meeting_room',
  unit_delete: 'delete_forever',
  maintenance_add: 'build',
  maintenance_update: 'construction',
  maintenance_move: 'swap_horiz',
  maintenance_delete: 'delete',
}

const RECORD_LABELS = {
  payment: 'Payment Received',
  payment_void: 'Payment Voided',
  tenant_add: 'Tenant Added',
  tenant_delete: 'Tenant Removed',
  tenant_update: 'Tenant Updated',
  floor_add: 'Floor Added',
  floor_delete: 'Floor Deleted',
  floor_rename: 'Floor Renamed',
  unit_update: 'Unit Updated',
  unit_delete: 'Unit Deleted',
  maintenance_add: 'Maintenance Created',
  maintenance_update: 'Maintenance Updated',
  maintenance_move: 'Maintenance Moved',
  maintenance_delete: 'Maintenance Deleted',
}

function RecordTypeIcon({ type }) {
  return (
    <span className="material-symbols-outlined text-on-surface-dim text-sm">{RECORD_ICONS[type] || 'circle'}</span>
  )
}

function RecordTypeLabel({ type }) {
  return <span className="text-on-surface-muted text-[10px]">{RECORD_LABELS[type] || type}</span>
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[6vh] bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-outline shrink-0">
          <h2 className="text-sm font-bold text-on-surface">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <div className="p-4 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-outline/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">{children}</div>
      </div>
    </div>
  )
}

export default function StellarDashboard() {
  const { anchors, building } = useBuilding()
  const [tab, setTab] = useState('payments')
  const [reanchoring, setReanchoring] = useState({})
  const [reanchoringAll, setReanchoringAll] = useState(false)
  const [verificationResults, setVerificationResults] = useState({})
  const [autoVerifying, setAutoVerifying] = useState(false)
  const [activeAnchor, setActiveAnchor] = useState(null)
  const [txDetail, setTxDetail] = useState(null)
  const [loadingTx, setLoadingTx] = useState(false)
  const [msg, setMsg] = useState(null)

  const allAnchors = (anchors || []).filter((a) => a.stellarTxHash)
  const payAnchors = allAnchors.filter((a) => PAYMENT_TYPES.has(a.recordType))
  const sysAnchors = allAnchors.filter((a) => SYSTEM_TYPES.has(a.recordType))
  const displayed = tab === 'payments' ? payAnchors : tab === 'system' ? sysAnchors : allAnchors

  // ── Auto-verify every anchor on mount ──
  useEffect(() => {
    if (allAnchors.length === 0) return
    let cancelled = false
    setAutoVerifying(true)
    ;(async () => {
      for (const a of allAnchors) {
        if (cancelled) break
        if (!a.recordSnapshot || !a.sha256Hash) continue
        const computedHash = await sha256(a.recordSnapshot)
        if (cancelled) break
        const valid = computedHash === a.sha256Hash
        setVerificationResults((prev) => {
          if (prev[a.id]?.valid === valid) return prev
          return { ...prev, [a.id]: { valid, computedHash, storedHash: a.sha256Hash } }
        })
      }
      if (!cancelled) setAutoVerifying(false)
    })()
    return () => { cancelled = true }
  }, [allAnchors])

  const vResults = Object.values(verificationResults)
  const verifiedCount = vResults.filter((r) => r?.valid).length
  const tamperedCount = vResults.filter((r) => r && !r.valid).length

  const handleReAnchor = useCallback(async (anchor) => {
    if (!anchor.recordSnapshot) return
    setReanchoring((prev) => ({ ...prev, [anchor.id]: true }))
    setMsg(null)
    try {
      const { hash, txHash, error } = await anchorHash(anchor.recordSnapshot)
      if (error) {
        setMsg({ type: 'error', text: `Re-anchor failed: ${error}` })
      } else if (hash && txHash) {
        setVerificationResults((prev) => ({
          ...prev,
          [anchor.id]: { valid: true, computedHash: hash, storedHash: hash },
        }))
        setMsg({ type: 'success', text: `Record re-anchored successfully` })
      }
    } catch (err) {
      setMsg({ type: 'error', text: `Re-anchor error: ${err.message}` })
    }
    setReanchoring((prev) => ({ ...prev, [anchor.id]: false }))
  }, [])

  const handleReAnchorAll = useCallback(async () => {
    const toFix = allAnchors.filter((a) => {
      const vr = verificationResults[a.id]
      return vr && !vr.valid && a.recordSnapshot
    })
    if (toFix.length === 0) return
    setReanchoringAll(true)
    setMsg(null)
    for (const anchor of toFix) {
      setReanchoring((prev) => ({ ...prev, [anchor.id]: true }))
      try {
        const { hash, txHash, error } = await anchorHash(anchor.recordSnapshot)
        if (!error && hash && txHash) {
          setVerificationResults((prev) => ({
            ...prev,
            [anchor.id]: { valid: true, computedHash: hash, storedHash: hash },
          }))
        }
      } catch (_) {}
      setReanchoring((prev) => ({ ...prev, [anchor.id]: false }))
    }
    setReanchoringAll(false)
    setMsg({ type: 'success', text: `Re-anchored ${toFix.length} record(s)` })
  }, [allAnchors, verificationResults])

  const handleViewTx = useCallback(async (anchor) => {
    if (!anchor.stellarTxHash) return
    setLoadingTx(true)
    setActiveAnchor(anchor)
    const detail = await fetchAnchorTransaction(anchor.stellarTxHash)
    setTxDetail(detail)
    setLoadingTx(false)
  }, [])

  const stellarConfigured = isStellarConfigured()
  const stellarNetwork = getStellarNetwork()

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-dim text-lg">verified</span>
          <div>
            <h2 className="text-base font-bold text-on-surface">Stellar Notary Dashboard</h2>
            <p className="text-[11px] text-on-surface-muted mt-px">Cryptographic integrity ledger for every data mutation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {autoVerifying && (
            <span className="text-[10px] text-on-surface-dim flex items-center gap-1">
              <span className="material-symbols-outlined text-sm animate-spin">sync</span>
              Verifying {allAnchors.length} anchors...
            </span>
          )}
          {tamperedCount > 0 && (
            <button onClick={handleReAnchorAll} disabled={reanchoringAll}
              className="px-3.5 py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors inline-flex items-center gap-1.5 border border-amber-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <span className={`material-symbols-outlined text-base ${reanchoringAll ? 'animate-spin' : ''}`}>
                {reanchoringAll ? 'sync' : 'autorenew'}
              </span>
              {reanchoringAll ? `Re-anchoring...` : `Re-anchor All (${tamperedCount})`}
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-xs flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span className="material-symbols-outlined text-base">{msg.type === 'success' ? 'check_circle' : 'error'}</span>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard icon="verified" label="Total Anchored" value={allAnchors.length} sub="All record types" accent="bg-primary-50" />
        <KpiCard icon="receipt_long" label="Payments" value={payAnchors.length} sub={`${allAnchors.length > 0 ? Math.round((payAnchors.length / allAnchors.length) * 100) : 0}% of all`} accent="bg-emerald-50" />
        <KpiCard icon="settings_suggest" label="System Events" value={sysAnchors.length} sub={`${allAnchors.length > 0 ? Math.round((sysAnchors.length / allAnchors.length) * 100) : 0}% of all`} accent="bg-blue-50" />
        <KpiCard icon="checklist" label="Integrity Verified" value={verifiedCount} sub={tamperedCount > 0 ? `${tamperedCount} need re-anchor` : 'All records intact'} accent={verifiedCount > 0 ? 'bg-emerald-50' : tamperedCount > 0 ? 'bg-red-50' : 'bg-surface-container'} />
        <KpiCard icon="security" label={`Blockchain (${stellarNetwork})`} value={stellarConfigured ? 'Configured' : 'Not Configured'} sub={stellarConfigured ? `${allAnchors.length} records anchored` : 'Set VITE_STELLAR_ANCHOR_SECRET'} accent={stellarConfigured ? 'bg-emerald-50' : 'bg-amber-50'} />
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 bg-surface-container rounded-xl p-1 border border-outline w-fit">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === t.key ? 'bg-surface text-on-surface shadow-card' : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-container-high'
            }`}>
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            {t.label}
            <span className={`text-[10px] ml-0.5 ${
              tab === t.key
                ? t.key === 'payments' ? 'bg-emerald-50 text-emerald-700' : t.key === 'system' ? 'bg-blue-50 text-blue-700' : 'bg-primary-50 text-primary'
                : 'text-on-surface-dim bg-surface-container-highest'
            } px-1.5 py-0.5 rounded-full`}>
              {t.key === 'payments' ? payAnchors.length : t.key === 'system' ? sysAnchors.length : allAnchors.length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-surface rounded-card border border-outline shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-dim text-base">
              {tab === 'payments' ? 'receipt_long' : tab === 'system' ? 'settings_suggest' : 'database'}
            </span>
            <h3 className="text-sm font-semibold text-on-surface">
              {tab === 'payments' ? 'Payment Integrity Ledger' : tab === 'system' ? 'System Event Integrity Ledger' : 'Complete Integrity Ledger'}
            </h3>
            <span className="text-[10px] text-on-surface-dim bg-surface-container px-1.5 py-0.5 rounded-full">{displayed.length}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-on-surface-dim">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Verified</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Anchored</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Alert</div>
          </div>
        </div>
        {displayed.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline bg-surface-container/50">
                  <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Event</th>
                  <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Description</th>
                  <th className="text-center px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Integrity</th>
                  <th className="text-center px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Anchored</th>
                  <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Timestamp</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {displayed.map((a) => {
                  const vr = verificationResults[a.id]
                  const integStatus = vr === undefined ? 'anchored' : vr.valid ? 'verified' : 'tampered'
                  return (
                    <tr key={a.id} className="hover:bg-surface-container/50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <RecordTypeIcon type={a.recordType} />
                          <RecordTypeLabel type={a.recordType} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-on-surface-muted max-w-[220px] truncate">
                        {a.recordLabel || a.recordId || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {autoVerifying && vr === undefined ? (
                          <span className="material-symbols-outlined text-sm text-on-surface-dim animate-spin">sync</span>
                        ) : (
                          <StatusBadge status={integStatus} />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={a.stellarTxHash ? 'anchored' : 'skipped'} />
                      </td>
                      <td className="px-4 py-3 text-right text-on-surface-dim text-xs whitespace-nowrap">
                        <span title={fmtDateTime(a.anchoredAt || a.createdAt)}>{timeAgo(a.anchoredAt || a.createdAt) || fmtDateTime(a.anchoredAt || a.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleViewTx(a)}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-muted hover:bg-surface-container hover:text-on-surface transition-colors"
                            title="View Stellar Transaction">
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                          </button>
                          {integStatus === 'tampered' ? (
                            <button onClick={() => handleReAnchor(a)}
                              disabled={reanchoring[a.id]}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40"
                              title="Re-anchor with correct hash">
                              <span className={`material-symbols-outlined text-sm ${reanchoring[a.id] ? 'animate-spin' : ''}`}>
                                {reanchoring[a.id] ? 'sync' : 'autorenew'}
                              </span>
                            </button>
                          ) : integStatus === 'verified' ? (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-5">
            <span className="material-symbols-outlined text-3xl text-on-surface-dim mb-2">
              {tab === 'payments' ? 'receipt_long' : tab === 'system' ? 'settings_suggest' : 'verified'}
            </span>
            <p className="text-sm text-on-surface-muted">
              {tab === 'payments'
                ? 'No payment records anchored yet'
                : tab === 'system'
                  ? 'No system events anchored yet'
                  : 'No records anchored yet'}
            </p>
            <p className="text-xs text-on-surface-dim mt-1">
              {tab === 'payments'
                ? 'Record a payment to see it cryptographically verified'
                : tab === 'system'
                  ? 'Add, edit, or delete tenants, floors, or maintenance to see events here'
                  : 'Perform any action to see it anchored on Stellar'}
            </p>
          </div>
        )}
      </div>

      {activeAnchor && (
        <Modal title="Stellar Transaction" onClose={() => { setActiveAnchor(null); setTxDetail(null) }}>
          <div className="space-y-3">
            <div className="bg-surface-container rounded-lg border border-outline p-3 space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-on-surface-muted">Event</span>
                <span className="font-semibold text-on-surface"><RecordTypeLabel type={activeAnchor.recordType} /></span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-on-surface-muted">Description</span>
                <span className="font-medium text-on-surface text-right leading-tight">{activeAnchor.recordLabel || '—'}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-on-surface-muted">Anchored At</span>
                <span className="font-semibold text-on-surface">{fmtDateTime(activeAnchor.anchoredAt || activeAnchor.createdAt)}</span>
              </div>
              <div className="border-t border-outline/50 pt-1.5 grid grid-cols-2 gap-y-1 gap-x-3 text-[11px]">
                {activeAnchor.recordSnapshot?.tenantName && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-dim">Tenant</span>
                    <span className="font-semibold text-on-surface">{activeAnchor.recordSnapshot.tenantName}</span>
                  </div>
                )}
                {activeAnchor.recordSnapshot?.floor && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-dim">Floor</span>
                    <span className="font-semibold text-on-surface">{activeAnchor.recordSnapshot.floor}</span>
                  </div>
                )}
                {activeAnchor.recordSnapshot?.unit && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-dim">Unit</span>
                    <span className="font-semibold text-on-surface">{activeAnchor.recordSnapshot.unit}</span>
                  </div>
                )}
                {activeAnchor.recordSnapshot?.monthlyRent !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-dim">Rent</span>
                    <span className="font-semibold text-on-surface">UGX {Number(activeAnchor.recordSnapshot.monthlyRent).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {activeAnchor.recordType === 'tenant_update' && activeAnchor.recordSnapshot?.changes && (
                <div className="border-t border-outline/50 pt-1.5">
                  <p className="text-[9px] text-on-surface-dim font-semibold uppercase tracking-wider mb-1">Changes</p>
                  <div className="space-y-1">
                    {Object.entries(activeAnchor.recordSnapshot.changes).map(([field, c]) => (
                      <div key={field} className="flex items-center gap-1 text-[11px] bg-surface rounded px-2 py-1 border border-outline/50">
                        <span className="text-[9px] text-on-surface-dim font-semibold uppercase mr-1 shrink-0">{field}</span>
                        <span className="text-status-unpaid line-through text-[10px]">{String(c.from || '—')}</span>
                        <span className="material-symbols-outlined text-[10px] text-on-surface-dim">arrow_forward</span>
                        <span className="font-medium text-status-paid text-[10px]">{String(c.to || '—')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeAnchor.recordType === 'tenant_delete' && activeAnchor.recordSnapshot && (
                <div className="border-t border-outline/50 pt-1.5">
                  <p className="text-[9px] text-red-600 font-semibold uppercase tracking-wider mb-1">Deleted Tenant</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-[10px] space-y-0.5">
                    {activeAnchor.recordSnapshot.tenantName && <div className="flex justify-between"><span className="text-red-600">Name</span><span className="font-medium text-red-800">{activeAnchor.recordSnapshot.tenantName}</span></div>}
                    {activeAnchor.recordSnapshot.email && <div className="flex justify-between"><span className="text-red-600">Email</span><span className="font-medium text-red-800">{activeAnchor.recordSnapshot.email}</span></div>}
                    {activeAnchor.recordSnapshot.phone && <div className="flex justify-between"><span className="text-red-600">Phone</span><span className="font-medium text-red-800">{activeAnchor.recordSnapshot.phone}</span></div>}
                    <div className="flex justify-between"><span className="text-red-600">Unit</span><span className="font-medium text-red-800">{activeAnchor.recordSnapshot.unit || '—'}</span></div>
                  </div>
                </div>
              )}

              {activeAnchor.recordType === 'payment' && activeAnchor.recordSnapshot && (
                <div className="border-t border-outline/50 pt-1.5">
                  <p className="text-[9px] text-on-surface-dim font-semibold uppercase tracking-wider mb-1">Payment Details</p>
                  <div className="bg-surface rounded-lg border border-outline p-2 text-[10px] space-y-0.5">
                    <div className="flex justify-between"><span className="text-on-surface-dim">Receipt</span><span className="font-mono font-semibold text-on-surface">{activeAnchor.recordSnapshot.receiptId || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-on-surface-dim">Amount</span><span className="font-semibold text-on-surface">UGX {Number(activeAnchor.recordSnapshot.amount || 0).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-on-surface-dim">Method</span><span className="font-medium text-on-surface">{activeAnchor.recordSnapshot.method || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-on-surface-dim">Tenant</span><span className="font-medium text-on-surface">{activeAnchor.recordSnapshot.tenantName || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-on-surface-dim">Floor / Unit</span><span className="font-medium text-on-surface">{activeAnchor.recordSnapshot.floor || ''} {activeAnchor.recordSnapshot.unit || ''}</span></div>
                  </div>
                </div>
              )}
            </div>

            {loadingTx ? (
              <div className="flex items-center justify-center py-3">
                <span className="material-symbols-outlined text-lg text-primary animate-spin">sync</span>
                <span className="text-[10px] text-on-surface-muted ml-1.5">Fetching from Stellar...</span>
              </div>
            ) : txDetail?.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-start gap-1.5 text-[10px]">
                <span className="material-symbols-outlined text-red-500 text-sm shrink-0">error</span>
                <div><p className="font-semibold text-red-700">Fetch Failed</p><p className="text-red-600">{txDetail.error}</p></div>
              </div>
            ) : txDetail ? (
              <>
                <div className="bg-surface-container rounded-lg border border-outline p-3 space-y-2">
                  <div>
                    <p className="text-[9px] text-on-surface-dim font-semibold uppercase tracking-wider mb-0.5">Transaction Hash</p>
                    <p className="font-mono text-[10px] text-on-surface break-all bg-surface px-2 py-1 rounded border border-outline leading-relaxed">{txDetail.txHash}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[9px] text-on-surface-dim font-semibold uppercase tracking-wider mb-0.5">Ledger</p>
                      <p className="text-[11px] font-mono text-on-surface">{txDetail.ledger || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-on-surface-dim font-semibold uppercase tracking-wider mb-0.5">On-Chain Timestamp</p>
                      <p className="text-[11px] text-on-surface">{txDetail.timestamp ? fmtDateTime(txDetail.timestamp) : '—'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-on-surface-dim font-semibold uppercase tracking-wider mb-0.5">Record Hash (Memo)</p>
                    <p className="font-mono text-[9px] text-on-surface break-all bg-surface px-2 py-1 rounded border border-outline leading-relaxed">{txDetail.memoHash || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px]">
                  <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0">check_circle</span>
                  <span className="text-emerald-800">Transaction Found on Stellar</span>
                </div>

                <a href={`${STELLAR_EXPLORER_URL}/${txDetail.txHash}`} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-white text-[11px] font-semibold rounded-lg hover:bg-primary-600 transition-colors">
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  View on Stellar Explorer
                </a>
              </>
            ) : null}
          </div>
        </Modal>
      )}
    </div>
  )
}
