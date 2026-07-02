import { useState, useRef, useEffect } from 'react'
import { usePrivacy } from '../context/PrivacyContext'

export default function PrivacySettings({ onClose }) {
  const overlayRef = useRef(null)
  const { maskMode, toggleMask, auditLog, exportAllData, deleteAllData, logAudit } = usePrivacy()
  const [tab, setTab] = useState('overview')
  const [confirmDelete, setConfirmDelete] = useState(0)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => { logAudit('Opened privacy settings') }, [logAudit])

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'shield' },
    { key: 'audit', label: 'Activity Log', icon: 'history' },
    { key: 'data', label: 'Your Data', icon: 'database' },
  ]

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === overlayRef.current) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">shield</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Privacy & Security</h2>
              <p className="text-xs text-on-surface-muted mt-0.5">Your data stays on your device</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex gap-0 border-b border-outline px-6 shrink-0">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`pb-3 pt-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                tab === t.key ? 'border-primary text-primary' : 'border-transparent text-on-surface-muted hover:text-on-surface'
              }`}>
              <span className="material-symbols-outlined text-sm">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'overview' && <PrivacyOverview maskMode={maskMode} toggleMask={toggleMask} />}
          {tab === 'audit' && <AuditLog auditLog={auditLog} />}
          {tab === 'data' && <DataManagement exportAllData={exportAllData} deleteAllData={deleteAllData} confirmDelete={confirmDelete} setConfirmDelete={setConfirmDelete} />}
        </div>
      </div>
    </div>
  )
}

function PrivacyOverview({ maskMode, toggleMask }) {
  return (
    <div className="space-y-6">
      <div className="bg-surface-container rounded-xl p-5">
        <h3 className="text-sm font-semibold text-on-surface mb-1">Where your data lives</h3>
        <p className="text-xs text-on-surface-muted leading-relaxed">
          RentiHub stores your data securely in <strong>PostgreSQL via Supabase</strong>. All data is encrypted in transit (TLS) and at rest. Row-level security ensures that you can only access your own data. You retain full control — export or delete your data at any time.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-600 text-xl shrink-0">warning</span>
          <div>
            <h3 className="text-sm font-semibold text-amber-800 mb-1">Important</h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              Because data lives in your browser, clearing your browser cache or using a different device will erase your data. Use the <strong>Export</strong> feature to create backups. Multiple users on the same computer can see each other's data unless they use separate browser profiles.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-outline p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-on-surface mb-1">Privacy mode</h3>
            <p className="text-xs text-on-surface-muted">Masks all financial amounts and blurs the screen when the window is not focused</p>
          </div>
          <button onClick={toggleMask}
            className={`relative w-11 h-6 rounded-full transition-colors ${maskMode ? 'bg-primary' : 'bg-outline'}`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-card transition-transform ${maskMode ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-outline p-5 space-y-3">
        <h3 className="text-sm font-semibold text-on-surface">Privacy features enabled</h3>
        <div className="grid gap-2">
          {[
            { icon: 'timer', label: 'Session timeout', desc: 'Auto-logout after 30 minutes of inactivity' },
            { icon: 'visibility_off', label: 'Amount masking', desc: maskMode ? 'Active — amounts are hidden' : 'Inactive — toggle from the header bar' },
            { icon: 'blur_on', label: 'Window blur protection', desc: 'Content blurred when window loses focus' },
            { icon: 'history', label: 'Activity audit log', desc: 'All sensitive operations are timestamped' },
            { icon: 'download', label: 'Data export', desc: 'Download all your data as JSON anytime' },
            { icon: 'delete', label: 'Account deletion', desc: 'Remove all data from this browser' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-2.5 text-sm">
              <span className="material-symbols-outlined text-base text-primary">{f.icon}</span>
              <div>
                <span className="font-medium text-on-surface">{f.label}</span>
                <p className="text-xs text-on-surface-muted">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AuditLog({ auditLog }) {
  if (!auditLog.length) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-3xl text-on-surface-dim mb-2">history</span>
        <p className="text-sm text-on-surface-muted">No activity recorded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-on-surface-muted mb-4">{auditLog.length} event{auditLog.length !== 1 ? 's' : ''} recorded (max 500)</p>
      <div className="space-y-0.5">
        {auditLog.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-outline/30 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-on-surface">{entry.action}</p>
              {entry.details && <p className="text-xs text-on-surface-muted">{entry.details}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] text-on-surface-muted font-medium">{new Date(entry.timestamp).toLocaleDateString('en-GB')}</p>
              <p className="text-[10px] text-on-surface-dim">{new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DataManagement({ exportAllData, deleteAllData, confirmDelete, setConfirmDelete }) {
  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-xl border border-outline p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-on-surface mb-1">Export all data</h3>
            <p className="text-xs text-on-surface-muted">Download a JSON file containing all your floors, tenants, payments, maintenance records, and activity log.</p>
          </div>
          <button onClick={exportAllData}
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-card inline-flex items-center gap-1.5 shrink-0">
            <span className="material-symbols-outlined text-base">download</span>
            Export
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-outline p-5">
        <h3 className="text-sm font-semibold text-on-surface mb-1">Delete all data</h3>
        <p className="text-xs text-on-surface-muted mb-4">Permanently remove all floors, tenants, payments, maintenance records, and account information from this browser. This cannot be undone.</p>
        {confirmDelete === 0 && (
          <button onClick={() => setConfirmDelete(1)}
            className="px-4 py-2 border border-status-unpaid text-status-unpaid text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">delete_forever</span>
            Delete all data
          </button>
        )}
        {confirmDelete === 1 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
            <span className="text-xs text-red-800 font-medium">Are you absolutely sure? This removes everything including your account.</span>
            <button onClick={() => { setConfirmDelete(2); setTimeout(() => deleteAllData(), 500) }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-status-unpaid hover:bg-red-700 rounded-lg transition-colors">Yes, delete everything</button>
            <button onClick={() => setConfirmDelete(0)}
              className="px-3 py-1.5 text-xs font-medium text-on-surface-muted hover:bg-surface-container rounded-lg transition-colors">Cancel</button>
          </div>
        )}
        {confirmDelete === 2 && (
          <p className="text-xs text-status-unpaid font-medium">Deleting all data...</p>
        )}
      </div>
    </div>
  )
}
