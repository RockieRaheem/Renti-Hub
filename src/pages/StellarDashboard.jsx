import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import { computeReceiptHash, verifyIntegrity, fetchAnchorTransaction, STELLAR_EXPLORER_URL } from '../lib/stellar'

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
  }
  const s = map[status] || map.unanchored
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${s.class}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'verified' ? 'bg-emerald-500' : status === 'anchored' ? 'bg-emerald-400' : status === 'tampered' || status === 'failed' ? 'bg-red-500' : status === 'pending' ? 'bg-amber-400' : 'bg-gray-300'}`} />
      {s.label}
    </span>
  )
}

function AnchorIcon({ anchored }) {
  if (anchored) {
    return (
      <span className="material-symbols-outlined text-emerald-500 text-sm" title="Anchored to Stellar">verified</span>
    )
  }
  return (
    <span className="material-symbols-outlined text-gray-300 text-sm" title="Not anchored">radio_button_unchecked</span>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-on-surface">{title}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function StellarDashboard() {
  const { payments, floors, building } = useBuilding()
  const [verifying, setVerifying] = useState({})
  const [verificationResults, setVerificationResults] = useState({})
  const [activePayment, setActivePayment] = useState(null)
  const [txDetail, setTxDetail] = useState(null)
  const [loadingTx, setLoadingTx] = useState(false)

  const allPayments = payments || []

  const anchored = allPayments.filter((p) => p.stellarTxHash)
  const unanchored = allPayments.filter((p) => !p.stellarTxHash)
  const verifiedCount = Object.values(verificationResults).filter((r) => r?.valid).length
  const tamperedCount = Object.values(verificationResults).filter((r) => r && !r.valid).length

  function getTenantInfo(payment) {
    if (!payment?.floor || !payment?.unit) return null
    const floor = floors.find((f) => f.name === payment.floor)
    if (!floor) return null
    const unit = floor.units.find((u) => u.name === payment.unit)
    if (!unit) return { floorName: payment.floor, unitName: payment.unit }
    return {
      floorName: floor.name,
      unitName: unit.name,
      tenant: unit.tenant || null,
      monthlyRent: unit.monthlyRent,
    }
  }

  const handleVerify = useCallback(async (payment) => {
    if (!payment.stellarHash) return
    setVerifying((prev) => ({ ...prev, [payment.id]: true }))
    const result = await verifyIntegrity(
      {
        id: payment.id,
        receiptId: payment.receiptId,
        tenantName: payment.tenantName,
        amount: payment.amount,
        method: payment.method,
        date: payment.date,
        floor: payment.floor,
        unit: payment.unit,
      },
      payment.stellarHash,
    )
    setVerificationResults((prev) => ({ ...prev, [payment.id]: result }))
    setVerifying((prev) => ({ ...prev, [payment.id]: false }))
  }, [])

  const handleViewTx = useCallback(async (payment) => {
    if (!payment.stellarTxHash) return
    setLoadingTx(true)
    setActivePayment(payment)
    const detail = await fetchAnchorTransaction(payment.stellarTxHash)
    setTxDetail(detail)
    setLoadingTx(false)
  }, [])

  const handleVerifyAll = useCallback(async () => {
    const toVerify = anchored.filter((p) => p.stellarHash)
    for (const payment of toVerify) {
      await handleVerify(payment)
    }
  }, [anchored, handleVerify])

  const allVerified = anchored.length > 0 && anchored.every((p) => verificationResults[p.id])

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-dim text-lg">verified</span>
          <div>
            <h2 className="text-base font-bold text-on-surface">Stellar Notary Dashboard</h2>
            <p className="text-[11px] text-on-surface-muted mt-px">Cryptographic proof of payment integrity on the Stellar blockchain</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {anchored.length > 0 && (
            <button onClick={handleVerifyAll} disabled={allVerified}
              className="px-3.5 py-2 border border-outline text-on-surface-muted text-xs font-semibold rounded-lg hover:bg-surface-container transition-colors inline-flex items-center gap-1.5 disabled:opacity-50">
              <span className="material-symbols-outlined text-base">verified</span>
              {allVerified ? 'All Verified' : `Verify All (${anchored.length})`}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard icon="receipt_long" label="Total Payments" value={allPayments.length} sub="All time" />
        <KpiCard icon="verified" label="Anchored on Stellar" value={anchored.length} sub={`${allPayments.length > 0 ? Math.round((anchored.length / allPayments.length) * 100) : 0}% of payments`} accent={anchored.length > 0 ? 'bg-emerald-50' : 'bg-surface-container'} />
        <KpiCard icon="hourglass_top" label="Pending Anchoring" value={unanchored.length} sub={unanchored.length === 0 ? 'All payments secured' : 'Awaiting notarization'} accent={unanchored.length > 0 ? 'bg-amber-50' : 'bg-emerald-50'} />
        <KpiCard icon="checklist" label="Integrity Verified" value={verifiedCount} sub={tamperedCount > 0 ? `${tamperedCount} tamper alerts` : 'All records intact'} accent={verifiedCount > 0 ? 'bg-emerald-50' : tamperedCount > 0 ? 'bg-red-50' : 'bg-surface-container'} />
        <KpiCard icon="security" label="Blockchain Status" value={anchored.length > 0 ? 'Active' : 'Inactive'} sub={anchored.length > 0 ? `${Math.round((verifiedCount / Math.max(anchored.length, 1)) * 100)}% verified` : 'Set VITE_STELLAR_ANCHOR_SECRET'} accent={anchored.length > 0 ? 'bg-emerald-50' : 'bg-amber-50'} />
      </div>

      <div className="bg-surface rounded-card border border-outline shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-dim text-base">receipt_long</span>
            <h3 className="text-sm font-semibold text-on-surface">Payment Ledger</h3>
            <span className="text-[10px] text-on-surface-dim bg-surface-container px-1.5 py-0.5 rounded-full">{allPayments.length}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-on-surface-dim">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Anchored
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              Pending
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Verified
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Alert
            </div>
          </div>
        </div>
        {allPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline bg-surface-container/50">
                  <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Receipt</th>
                  <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Tenant</th>
                  <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Location</th>
                  <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Amount</th>
                  <th className="text-center px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Stellar</th>
                  <th className="text-center px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Integrity</th>
                  <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {allPayments.map((p) => {
                  const info = getTenantInfo(p)
                  const vr = verificationResults[p.id]
                  const integStatus = !p.stellarTxHash ? 'unanchored'
                    : vr === undefined ? 'anchored'
                    : vr.valid ? 'verified'
                    : 'tampered'
                  return (
                    <tr key={p.id} className="hover:bg-surface-container/50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <AnchorIcon anchored={!!p.stellarTxHash} />
                          <span className="font-mono text-[11px] text-on-surface-muted">{p.receiptId || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-on-surface text-xs">{p.tenantName || '—'}</span>
                        {info?.tenant && (
                          <span className="text-[10px] text-on-surface-dim block leading-tight">
                            {info.tenant.phone || info.tenant.email || ''}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-on-surface-muted text-xs">
                        {p.floor}{p.unit ? ` - ${p.unit}` : ''}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-on-surface text-xs">
                        UGX {(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={p.stellarTxHash ? 'anchored' : 'pending'} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={integStatus} />
                      </td>
                      <td className="px-4 py-3 text-right text-on-surface-dim text-xs">
                        <span title={fmtDate(p.date)}>{timeAgo(p.date) || fmtDate(p.date)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {p.stellarTxHash && (
                            <>
                              <button onClick={() => handleViewTx(p)}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-muted hover:bg-surface-container hover:text-on-surface transition-colors"
                                title="View Stellar Transaction">
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                              </button>
                              <button onClick={() => handleVerify(p)}
                                disabled={verifying[p.id] || integStatus === 'verified'}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-muted hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-40"
                                title="Verify Integrity">
                                <span className="material-symbols-outlined text-sm">
                                  {verifying[p.id] ? 'sync' : integStatus === 'verified' ? 'check_circle' : 'fact_check'}
                                </span>
                              </button>
                            </>
                          )}
                          {!p.stellarTxHash && (
                            <span className="text-[10px] text-on-surface-dim italic">pending</span>
                          )}
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
            <span className="material-symbols-outlined text-3xl text-on-surface-dim mb-2">receipt_long</span>
            <p className="text-sm text-on-surface-muted">No payments recorded yet</p>
            <p className="text-xs text-on-surface-dim mt-1">Record a payment to see it anchored on Stellar</p>
          </div>
        )}
      </div>

      {activePayment && (
        <Modal title="Stellar Transaction Detail" onClose={() => { setActivePayment(null); setTxDetail(null) }}>
          <div className="space-y-4">
            <div className="bg-surface-container rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-muted">Receipt</span>
                <span className="font-mono font-semibold text-on-surface">{activePayment.receiptId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-muted">Tenant</span>
                <span className="font-medium text-on-surface">{activePayment.tenantName || '—'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-muted">Amount</span>
                <span className="font-semibold text-on-surface">UGX {(activePayment.amount || 0).toLocaleString()}</span>
              </div>
            </div>

            {loadingTx ? (
              <div className="flex items-center justify-center py-6">
                <span className="material-symbols-outlined text-2xl text-primary animate-spin">sync</span>
                <span className="text-xs text-on-surface-muted ml-2">Fetching from Stellar...</span>
              </div>
            ) : txDetail?.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <span className="material-symbols-outlined text-red-500 text-base shrink-0">error</span>
                <div>
                  <p className="text-xs font-semibold text-red-700">Fetch Failed</p>
                  <p className="text-[11px] text-red-600 mt-0.5">{txDetail.error}</p>
                </div>
              </div>
            ) : txDetail ? (
              <>
                <div className="bg-surface-container rounded-lg p-3 space-y-2.5">
                  <div>
                    <p className="text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider mb-1">Transaction Hash</p>
                    <p className="font-mono text-[11px] text-on-surface break-all bg-surface px-2 py-1.5 rounded border border-outline">{txDetail.txHash}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider mb-0.5">Ledger</p>
                      <p className="text-xs font-mono text-on-surface">{txDetail.ledger || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider mb-0.5">Timestamp</p>
                      <p className="text-xs text-on-surface">{txDetail.timestamp ? fmtDate(txDetail.timestamp) : '—'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider mb-0.5">Receipt Hash (Memo)</p>
                    <p className="font-mono text-[10px] text-on-surface break-all bg-surface px-2 py-1.5 rounded border border-outline">{txDetail.memoHash || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                  <div>
                    <p className="text-xs font-semibold text-emerald-800">Transaction Found on Stellar</p>
                    <p className="text-[10px] text-emerald-600">This receipt hash exists in the Stellar ledger — immutable proof of data integrity.</p>
                  </div>
                </div>

                <a href={`${STELLAR_EXPLORER_URL}/${txDetail.txHash}`} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors">
                  <span className="material-symbols-outlined text-base">open_in_new</span>
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
