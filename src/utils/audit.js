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

  // Also send to Supabase if configured
  try {
    const { isSupabaseConfigured, logAuditDb } = await_import()
    if (isSupabaseConfigured()) {
      logAuditDb(action, details)
    }
  } catch { /* silent */ }
}

async function await_import() {
  const mod = await import('../lib/queries')
  return mod
}

export async function logAuditAsync(action, details) {
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

  try {
    const { isSupabaseConfigured, logAuditDb } = await import('../lib/queries')
    if (isSupabaseConfigured()) {
      await logAuditDb(action, details)
    }
  } catch { /* silent */ }
}
