const AUDIT_KEY = 'rentihub_audit_log'

export function logAudit(action, details) {
  try {
    const raw = localStorage.getItem(AUDIT_KEY)
    const log = raw ? JSON.parse(raw) : []
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      action,
      details: details || '',
      timestamp: new Date().toISOString(),
    }
    const updated = [entry, ...log].slice(0, 500)
    localStorage.setItem(AUDIT_KEY, JSON.stringify(updated))
  } catch { /* silently fail */ }
}
