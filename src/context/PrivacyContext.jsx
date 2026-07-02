import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useBuilding } from './BuildingContext'

const SESSION_KEY = 'rentihub_session_timeout'
const AUDIT_KEY = 'rentihub_audit_log'
const MASK_KEY = 'rentihub_mask_mode'
const PRIVACY_KEY = 'rentihub_privacy_consent'
const SESSION_DURATION_MS = 30 * 60 * 1000 // 30 minutes
const WARNING_BEFORE_MS = 60 * 1000 // warn 1 minute before

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

const PrivacyContext = createContext()

export function PrivacyProvider({ children }) {
  const { logout, auth } = useBuilding()
  const [maskMode, setMaskMode] = useState(() => load(MASK_KEY, false))
  const [auditLog, setAuditLog] = useState(() => load(AUDIT_KEY, []))
  const [blurred, setBlurred] = useState(false)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const lastActivity = useRef(Date.now())
  const warningTimer = useRef(null)
  const timeoutTimer = useRef(null)

  // ── Mask mode ──
  const toggleMask = useCallback(() => {
    setMaskMode((prev) => {
      const next = !prev
      localStorage.setItem(MASK_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  // ── Window blur protection ──
  useEffect(() => {
    const handleBlur = () => setBlurred(true)
    const handleFocus = () => setBlurred(false)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // ── Session timeout (only when authenticated) ──
  useEffect(() => {
    if (!auth) return

    const resetTimers = () => {
      lastActivity.current = Date.now()
      setShowTimeoutWarning(false)
      clearTimeout(warningTimer.current)
      clearTimeout(timeoutTimer.current)

      if (SESSION_DURATION_MS > 0) {
        warningTimer.current = setTimeout(() => {
          setShowTimeoutWarning(true)
        }, SESSION_DURATION_MS - WARNING_BEFORE_MS)

        timeoutTimer.current = setTimeout(() => {
          logAudit('Session expired due to inactivity')
          logout()
        }, SESSION_DURATION_MS)
      }
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
    const handleActivity = () => resetTimers()

    events.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }))
    resetTimers()

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity))
      clearTimeout(warningTimer.current)
      clearTimeout(timeoutTimer.current)
    }
  }, [auth, logout])

  const extendSession = useCallback(() => {
    setShowTimeoutWarning(false)
    clearTimeout(warningTimer.current)
    clearTimeout(timeoutTimer.current)
    if (auth && SESSION_DURATION_MS > 0) {
      warningTimer.current = setTimeout(() => setShowTimeoutWarning(true), SESSION_DURATION_MS - WARNING_BEFORE_MS)
      timeoutTimer.current = setTimeout(() => { logAudit('Session expired'); logout() }, SESSION_DURATION_MS)
    }
  }, [auth, logout])

  // ── Audit log (last 500 entries) ──
  const logAudit = useCallback((action, details) => {
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      action,
      details: details || '',
      user: auth?.name || 'anonymous',
      timestamp: new Date().toISOString(),
    }
    setAuditLog((prev) => {
      const updated = [entry, ...prev].slice(0, 500)
      localStorage.setItem(AUDIT_KEY, JSON.stringify(updated))
      return updated
    })
  }, [auth])

  // ── Data export (GDPR right to data portability) ──
  const exportAllData = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: auth?.name || 'unknown',
      floors: load('rentihub_floors', []),
      payments: load('rentihub_payments', []),
      maintenance: load('rentihub_maintenance', {}),
      auditLog: load(AUDIT_KEY, []),
      privacyConsent: load(PRIVACY_KEY, false),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    const dateStr = new Date().toISOString().slice(0, 10)
    link.download = `rentihub_export_${dateStr}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    logAudit('Exported all data')
  }, [auth, logAudit])

  // ── Delete all data (GDPR right to erasure) ──
  const deleteAllData = useCallback(() => {
    const keys = ['rentihub_floors', 'rentihub_payments', 'rentihub_maintenance',
      'rentihub_users', 'rentihub_auth', AUDIT_KEY, MASK_KEY, PRIVACY_KEY,
      'rentihub_session_timeout']
    keys.forEach((k) => localStorage.removeItem(k))
    logAudit('Deleted all data')
    window.location.href = '/'
  }, [logAudit])

  // ── Privacy consent ──
  const recordPrivacyConsent = useCallback(() => {
    localStorage.setItem(PRIVACY_KEY, JSON.stringify({
      consented: true,
      timestamp: new Date().toISOString(),
    }))
  }, [])

  const value = {
    maskMode, toggleMask, blurred,
    showTimeoutWarning, extendSession,
    auditLog, logAudit,
    exportAllData, deleteAllData,
    recordPrivacyConsent,
  }

  return (
    <PrivacyContext.Provider value={value}>
      {children}
      {showTimeoutWarning && <SessionTimeoutModal onExtend={extendSession} onLogout={logout} />}
    </PrivacyContext.Provider>
  )
}

export function usePrivacy() {
  const ctx = useContext(PrivacyContext)
  if (!ctx) throw new Error('usePrivacy must be used within PrivacyProvider')
  return ctx
}

function SessionTimeoutModal({ onExtend, onLogout }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-amber-600 text-3xl">timer_off</span>
        </div>
        <h2 className="text-lg font-bold text-on-surface mb-2">Session expiring</h2>
        <p className="text-sm text-on-surface-muted mb-6">
          You will be logged out in about 1 minute due to inactivity.
        </p>
        <div className="flex items-center gap-2 justify-center">
          <button onClick={onLogout}
            className="px-4 py-2.5 text-sm font-medium text-on-surface-muted hover:bg-surface-container rounded-lg transition-colors">
            Log out now
          </button>
          <button onClick={onExtend}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-card transition-colors">
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  )
}
