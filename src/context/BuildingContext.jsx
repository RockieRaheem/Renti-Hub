import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { logAudit } from '../utils/audit'
import { supabase } from '../lib/supabase'
import * as q from '../lib/queries'
import {
  computeReceiptHash, anchorHash, anchorRecord,
  canonicalPayment, canonicalTenantAdd, canonicalTenantDelete,
  canonicalTenantUpdate, canonicalPaymentVoid,
  canonicalMaintenanceAdd, canonicalMaintenanceUpdate, canonicalMaintenanceDelete,
  canonicalFloorAdd, canonicalFloorDelete, canonicalFloorRename,
  canonicalUnitUpdate, canonicalUnitDelete,
} from '../lib/stellar'
import { sanitizePaymentData } from '../utils/sanitize'

const SESSION_CACHE_KEY = 'rh_user_session'

import {
  revenueMonthly, revenueMix, cashFlowData, paymentMethods, tenantFilters,
  statusBorders, priorityBorders, floorSlug,
} from '../data/currentBuilding'

const BuildingContext = createContext()

function computeInitials(name) {
  return name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

const CHIP_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700', 'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700', 'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700', 'bg-lime-100 text-lime-700',
]

function hashColor(initials) {
  if (!initials) return 'bg-gray-100 text-gray-700'
  let hash = 0
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CHIP_COLORS[Math.abs(hash) % CHIP_COLORS.length]
}

function cacheUserSession(data) {
  try { localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(data)) } catch { /* noop */ }
}
function loadCachedSession() {
  try {
    const raw = localStorage.getItem(SESSION_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
function clearCachedSession() {
  try { localStorage.removeItem(SESSION_CACHE_KEY) } catch { /* noop */ }
}

async function tryRestoreSession(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data: session } = await q.getSession()
      if (session?.user) {
        const { data: userData } = await q.getCurrentUser()
        if (userData) return userData
      }
    } catch { /* retry */ }
    if (i < maxRetries - 1) await new Promise((r) => setTimeout(r, 800 * (i + 1)))
  }

  const cached = loadCachedSession()
  if (cached) return cached

  return null
}

export function BuildingProvider({ children }) {
  const [floors, setFloors] = useState([])
  const [payments, setPayments] = useState([])
  const [maintenance, setMaintenance] = useState({ pending: [], inProgress: [], resolved: [] })
  const [anchors, setAnchors] = useState([])
  const [auth, setAuth] = useState(null)
  const [userId, setUserId] = useState(null)
  const [building, setBuilding] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [restoringSession, setRestoringSession] = useState(false)
  const [error, setError] = useState(null)
  const [supabaseReady, setSupabaseReady] = useState(false)

  // ── Init ──
  useEffect(() => {
    let cancelled = false
    const configured = q.isSupabaseConfigured()
    setSupabaseReady(configured)

    async function init() {
      if (!configured) { setLoading(false); return }

      const cached = loadCachedSession()
      const hasCachedAuth = !!cached

      if (hasCachedAuth) setRestoringSession(true)

      const userData = await tryRestoreSession()
      if (cancelled) return

      if (userData) {
        cacheUserSession(userData)
        setAuth({ name: userData.name, email: userData.email })
        setUserId(userData.id)
        await loadAllData(userData.id)
        if (!cancelled) { setLoading(false); setRestoringSession(false) }
        return
      }

      if (cancelled) return
      clearCachedSession()
      setRestoringSession(false)
      setLoading(false)
    }

    init()

    let listener
    if (configured) {
      const sub = supabase.auth.onAuthStateChange(async (event, session) => {
        if (cancelled) return
        if (event === 'SIGNED_OUT') {
          clearCachedSession()
          setAuth(null); setUserId(null); setBuilding(null)
          setFloors([]); setPayments([])
          setMaintenance({ pending: [], inProgress: [], resolved: [] })
        } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
          const { data: userData } = await q.getCurrentUser()
          if (userData) {
            cacheUserSession(userData)
            setAuth({ name: userData.name, email: userData.email })
            setUserId(userData.id)
            await loadAllData(userData.id)
          }
        }
      })
      listener = sub.data
    }

    return () => { cancelled = true; listener?.subscription?.unsubscribe() }
  }, [])

  async function loadAllData(uid) {
    const { data: bld } = await q.fetchBuilding(uid)
    const bid = bld?.id || building?.id
    if (!bid) { setBuilding(bld || null); return }
    setBuilding(bld || building)

    const [fr, pr, mr, ar] = await Promise.all([
      q.fetchFloorsWithUnits(bid),
      q.fetchPayments(bid),
      q.fetchMaintenance(bid),
      q.fetchAnchors(bid),
    ])
    if (fr.data) setFloors(fr.data)
    if (pr.data) setPayments(pr.data)
    if (mr.data) setMaintenance(mr.data)
    if (ar.data) setAnchors(ar.data)
  }

  const refreshData = useCallback(async () => {
    if (!building || !userId) return
    setRefreshing(true)
    await loadAllData(userId)
    setRefreshing(false)
  }, [building, userId])

  // ── Building ──
  const createBuilding = useCallback(async (name, location, type) => {
    const result = await q.createBuilding({ name, location, type })
    if (result.data) {
      setBuilding(result.data)
      setFloors([])
      setPayments([])
      setMaintenance({ pending: [], inProgress: [], resolved: [] })
      logAudit('Building created', name)
      return true
    }
    setError(result.error || 'Failed to create building')
    return false
  }, [])

  // ── Auth ──
  const login = useCallback(async (email, password) => {
    const result = await q.signIn(email, password)
    if (result.error) return result.error
    logAudit('User logged in', email)
    return null
  }, [])

  const register = useCallback(async (name, email, password) => {
    const result = await q.signUp(email, password, name)
    if (result.error) return result.error
    logAudit('User registered', name)
    return null
  }, [])

  const logout = useCallback(async () => {
    logAudit('User logged out', auth?.name || '')
    await q.signOut()
  }, [auth])

  const updateProfile = useCallback(async (name) => {
    if (!userId) return { error: 'Not authenticated' }
    const result = await q.updateProfile(userId, { name })
    if (result.data) {
      setAuth((prev) => ({ ...prev, name: result.data.name }))
      logAudit('Profile updated', name)
    }
    return result
  }, [userId])

  // ── Helpers ──
  const findTenantId = useCallback((floorName, unitId) => {
    const floor = floors.find((f) => f.name === floorName)
    if (!floor) return null
    const unit = floor.units.find((u) => u.id === unitId)
    return unit?.tenant?.id || null
  }, [floors])

  // ── Helpers ──
  const doAnchor = useCallback(async (canonicalFn, recordId, recordLabel) => {
    if (!building) return
    const canonical = typeof canonicalFn === 'function' ? canonicalFn() : canonicalFn
    const { hash, txHash, error, recordSnapshot } = await anchorRecord(canonical)
    if (hash && !error) {
      const anchor = {
        buildingId: building.id,
        recordType: recordSnapshot?.recordType || canonical.recordType || 'unknown',
        recordId: recordId || '',
        recordLabel: recordLabel || '',
        recordSnapshot: recordSnapshot || canonical,
        sha256Hash: hash,
        stellarTxHash: txHash,
        anchoredAt: new Date().toISOString(),
      }
      setAnchors((prev) => [anchor, ...prev])
      const ins = await q.insertAnchor(anchor)
      if (ins?.error) console.warn('Anchor persist failed:', ins.error)
    }
  }, [building])

  // ── Tenant ──
  const addTenant = useCallback(async (floorName, unitId, tenantData, monthlyRent) => {
    if (!building) return
    // Set unit's monthly rent FIRST so the billing-period trigger picks it up
    if (monthlyRent) {
      await q.updateUnit(unitId, { monthlyRent: Number(monthlyRent) })
    }
    const result = await q.addTenant(unitId, building.id, tenantData)
    if (result.error) { setError(result.error); return }

    await refreshData()
    logAudit('Tenant added', `${tenantData.name} → ${floorName} / ${unitId}`)
    doAnchor(() => canonicalTenantAdd(tenantData, floorName, unitId), `tenant:${unitId}`, `${tenantData.name} added to ${floorName}`)
  }, [building, refreshData, doAnchor])

  const updateTenant = useCallback(async (floorName, unitId, updates) => {
    const tenantId = findTenantId(floorName, unitId)
    if (!tenantId) return

    const oldTenant = floors.find((f) => f.name === floorName)?.units.find((u) => u.id === unitId)?.tenant
    const unitName = floors.find((f) => f.name === floorName)?.units.find((u) => u.id === unitId)?.name || ''

    const { monthlyRent, ...tenantUpdates } = updates
    if (Object.keys(tenantUpdates).length > 0) {
      await q.updateTenant(tenantId, tenantUpdates)
    }
    if (monthlyRent !== undefined) {
      await q.updateUnit(unitId, { monthlyRent: Number(monthlyRent) })
    }
    await refreshData()
    logAudit('Tenant updated', `${floorName} / ${unitId}`)
    if (oldTenant) {
      doAnchor(() => canonicalTenantUpdate(oldTenant, updates, floorName, unitName), `tenant:${unitId}`, `${oldTenant.name} updated on ${floorName}`)
    }
  }, [findTenantId, refreshData, doAnchor, floors])

  const deleteTenant = useCallback(async (floorName, unitId) => {
    const tenantId = findTenantId(floorName, unitId)
    if (!tenantId) return

    const oldTenant = floors.find((f) => f.name === floorName)?.units.find((u) => u.id === unitId)?.tenant
    const unitName = floors.find((f) => f.name === floorName)?.units.find((u) => u.id === unitId)?.name || ''

    await q.deleteTenant(tenantId)
    await refreshData()
    logAudit('Tenant removed', `${floorName} / ${unitId}`)
    doAnchor(() => canonicalTenantDelete(oldTenant, floorName, unitName), `tenant:${unitId}`, `${oldTenant?.name || 'Tenant'} removed from ${floorName}`)
  }, [findTenantId, refreshData, doAnchor, floors])

  // ── Floor ──
  const addFloor = useCallback(async (name, unitCount) => {
    if (!building) return
    const result = await q.addFloorWithUnits(building.id, name, unitCount)
    if (result.data) {
      setFloors(result.data)
      logAudit('Floor added', `${name} (${unitCount} units)`)
      doAnchor(() => canonicalFloorAdd(name, unitCount), `floor:${name}`, `Floor ${name} added`)
    } else {
      setError(result.error || 'Failed to add floor')
    }
  }, [building, doAnchor])

  const updateFloor = useCallback(async (oldName, newName) => {
    const floor = floors.find((f) => f.name === oldName)
    if (!floor?.id) return
    await q.renameFloor(floor.id, newName)
    setFloors((prev) => prev.map((f) => f.name === oldName ? { ...f, name: newName } : f))
    logAudit('Floor renamed', `${oldName} → ${newName}`)
    doAnchor(() => canonicalFloorRename(oldName, newName), `floor:${oldName}`, `Floor renamed: ${oldName} → ${newName}`)
  }, [floors, doAnchor])

  const deleteFloor = useCallback(async (name) => {
    const floor = floors.find((f) => f.name === name)
    if (!floor?.id) return
    await q.deleteFloor(floor.id)
    setFloors((prev) => prev.filter((f) => f.name !== name))
    logAudit('Floor deleted', name)
    doAnchor(() => canonicalFloorDelete(name), `floor:${name}`, `Floor ${name} deleted`)
  }, [floors, doAnchor])

  // ── Unit ──
  const updateUnit = useCallback(async (floorName, unitId, updates) => {
    const unitName = floors.find((f) => f.name === floorName)?.units.find((u) => u.id === unitId)?.name || unitId
    const result = await q.updateUnit(unitId, updates)
    if (result.error) { setError(result.error); return }
    setFloors((prev) =>
      prev.map((f) => {
        if (f.name !== floorName) return f
        return {
          ...f,
          units: f.units.map((u) => {
            if (u.id !== unitId) return u
            const newRent = updates.monthlyRent !== undefined ? Number(updates.monthlyRent) : u.monthlyRent
            return {
              ...u, ...updates,
              monthlyRent: newRent,
              rent: updates.monthlyRent !== undefined ? `UGX ${newRent.toLocaleString()}/mo` : u.rent,
            }
          }),
        }
      }),
    )
    logAudit('Unit updated', `${floorName} / ${unitName}`)
    doAnchor(() => canonicalUnitUpdate(floorName, unitId, unitName, updates), unitId, `Unit ${unitName} on ${floorName} updated`)
  }, [floors, doAnchor])

  const deleteUnit = useCallback(async (floorName, unitId) => {
    const unitName = floors.find((f) => f.name === floorName)?.units.find((u) => u.id === unitId)?.name || unitId
    await q.deleteUnit(unitId)
    setFloors((prev) =>
      prev.map((f) => {
        if (f.name !== floorName) return f
        return { ...f, units: f.units.filter((u) => u.id !== unitId) }
      }),
    )
    logAudit('Unit deleted', `${floorName} / ${unitName}`)
    doAnchor(() => canonicalUnitDelete(floorName, unitId, unitName), unitId, `Unit ${unitName} on ${floorName} deleted`)
  }, [floors, doAnchor])

  // ── Payment ──
  const addPayment = useCallback(async ({ floor: floorName, unit: unitName, amount, method, tenantName, status, date }) => {
    if (!building) { return { error: 'Building not loaded' } }
    const floor = floors.find((f) => f.name === floorName)
    if (!floor) { return { error: `Floor "${floorName}" not found` } }
    const unit = floor.units.find((u) => u.name === unitName)
    if (!unit) { return { error: `Unit "${unitName}" not found on ${floorName}` } }

    const cleaned = sanitizePaymentData({ floor: floorName, unit: unitName, amount, method, tenantName, status, date })
    const tenantId = unit.tenant?.id
    const monthlyRent = unit.monthlyRent || 0

    // STEP 1: Ensure all billing periods exist (fill gaps from tenant start to now)
    if (tenantId) {
      await q.ensureTenantPeriods(tenantId, monthlyRent)
    }

    // STEP 2: Record the payment
    const result = await q.addPayment({
      unitId: unit.id, floorId: floor.id, buildingId: building.id,
      tenantId: tenantId || null,
      floorName: cleaned.floor, unitName: cleaned.unit,
      amount: cleaned.amount, method: cleaned.method,
      status: cleaned.status, tenantName: cleaned.tenantName, date: cleaned.date,
    })
    if (result.error) { return { error: result.error } }

    const paymentRecord = result.data

    // STEP 4: Compute balance from UI cache (no DB round-trip)
    const cachedBalance = Number(unit.tenant?.outstandingBalance || 0)
    const newBalance = cachedBalance - cleaned.amount
    paymentRecord.previousBalance = cachedBalance

    // STEP 5: Update local state immediately
    setFloors((prev) =>
      prev.map((f) => {
        if (f.name !== floorName) return f
        return {
          ...f,
          units: f.units.map((u) => {
            if (u.name !== unitName) return u
            return {
              ...u,
              tenant: u.tenant
                ? {
                    ...u.tenant,
                    outstandingBalance: newBalance,
                    paid: newBalance <= 0,
                    lastPayment: `UGX ${cleaned.amount.toLocaleString()}`,
                    lastPaymentDate: cleaned.date,
                  }
                : null,
            }
          }),
        }
      }),
    )

    setPayments((prev) => [paymentRecord, ...prev])

    logAudit('Payment recorded', `${cleaned.tenantName} UGX ${cleaned.amount.toLocaleString()} (${cleaned.status})`)

    // STEP 6–7: Waterfall allocation + DB tenant cache sync (non-blocking — doesn't hold up the return)
    ;(async () => {
      if (!tenantId) return
      const res = await q.fetchUnpaidPeriodsWithAllocations(tenantId)
      const periods = (res.data || [])
      if (!periods.length) return

      let remaining = cleaned.amount
      const newAllocs = []
      const statusUpdates = []

      for (const period of periods) {
        if (remaining <= 0) break
        const stillOwed = period.rentDue - (period.allocatedAmount || 0)
        if (stillOwed <= 0) { statusUpdates.push({ id: period.id, status: 'paid' }); continue }
        const toAllocate = Math.min(remaining, stillOwed)
        newAllocs.push({ payment_id: paymentRecord.id, period_id: period.id, amount: toAllocate })
        remaining -= toAllocate
        statusUpdates.push({ id: period.id, status: toAllocate >= stillOwed ? 'paid' : 'partial' })
      }

      if (newAllocs.length) await q.batchInsertAllocations(newAllocs)

      for (const u of statusUpdates) {
        await q.updatePeriodStatus(u.id, u.status)
      }

      await q.updateTenant(tenantId, {
        outstandingBalance: newBalance,
        paid: newBalance <= 0,
        lastPayment: `UGX ${cleaned.amount.toLocaleString()}`,
        lastPaymentDate: cleaned.date,
      })
    })()

    // Anchor receipt hash on Stellar (fire-and-forget — never blocks the payment flow)
    ;(async () => {
      const receiptData = canonicalPayment(paymentRecord)
      const { hash, txHash, error, recordSnapshot } = await anchorRecord(receiptData)
      if (hash && !error) {
        paymentRecord.stellarHash = hash
        paymentRecord.stellarTxHash = txHash
        await q.updatePaymentStellarHash(paymentRecord.id, hash, txHash)
        const anchor = {
          buildingId: building.id,
          recordType: 'payment',
          recordId: paymentRecord.id,
          recordLabel: `UGX ${(paymentRecord.amount || 0).toLocaleString()} from ${paymentRecord.tenantName}`,
          recordSnapshot: recordSnapshot || receiptData,
          sha256Hash: hash,
          stellarTxHash: txHash,
          anchoredAt: new Date().toISOString(),
        }
        setAnchors((prev) => [anchor, ...prev])
        const ins = await q.insertAnchor(anchor)
        if (ins?.error) console.warn('Payment anchor persist failed:', ins.error)
      }
    })()

    return paymentRecord
  }, [building, floors])

  const voidPayment = useCallback(async (paymentId) => {
    const payment = payments.find((p) => p.id === paymentId)
    if (!payment) return

    const result = await q.voidPayment(paymentId)
    if (result.error) { setError(result.error); return }

    await refreshData()
    logAudit('Payment voided', `${payment.tenantName} UGX ${(payment.amount || 0).toLocaleString()} (${payment.receiptId})`)
    doAnchor(() => canonicalPaymentVoid(payment), payment.id, `Payment ${payment.receiptId} voided`)
  }, [payments, refreshData, doAnchor])

  // ── Maintenance ──
  const addMaintenance = useCallback(async (item) => {
    if (!building) return
    const result = await q.addMaintenanceRequest(building.id, item)
    if (result.data) {
      setMaintenance((prev) => ({ ...prev, pending: [result.data, ...prev.pending] }))
    }
    logAudit('Maintenance request created', item.title)
    if (result.data) {
      doAnchor(() => canonicalMaintenanceAdd(item, building.id), result.data.id, `Maintenance: ${item.title}`)
    }
  }, [building, doAnchor])

  const updateMaintenance = useCallback(async (id, updates) => {
    await q.updateMaintenanceRequest(id, updates)
    setMaintenance((prev) => {
      const updateArr = (arr) => arr.map((m) => m.id === id ? { ...m, ...updates } : m)
      const keys = Object.keys(updates).filter(
        (k) => k !== 'showAssign' && k !== 'showEdit' && k !== 'showResolve',
      )
      if (keys.length) logAudit('Maintenance updated', `#${id} fields: ${keys.join(', ')}`)
      return {
        pending: updateArr(prev.pending),
        inProgress: updateArr(prev.inProgress),
        resolved: updateArr(prev.resolved),
      }
    })
    doAnchor(() => canonicalMaintenanceUpdate(id, updates), id, `Maintenance #${id} updated`)
  }, [doAnchor])

  const moveMaintenance = useCallback(async (id, from, to) => {
    const statusMap = { pending: 'pending', inProgress: 'in_progress', resolved: 'resolved' }
    await q.updateMaintenanceRequest(id, { status: statusMap[to] || 'pending' })

    setMaintenance((prev) => {
      const item = prev[from].find((m) => m.id === id)
      if (!item) return prev
      logAudit('Maintenance moved', `${item.title}: ${from} → ${to}`)
      doAnchor(() => ({ recordType: 'maintenance_move', id, title: item.title, from, to }), id, `${item.title}: ${from} → ${to}`)
      return {
        ...prev,
        [from]: prev[from].filter((m) => m.id !== id),
        [to]: [{ ...item, status: to, assignee: to === 'pending' ? null : item.assignee }, ...prev[to]],
      }
    })
  }, [doAnchor])

  const deleteMaintenance = useCallback(async (id) => {
    await q.deleteMaintenanceRequest(id)
    setMaintenance((prev) => {
      logAudit('Maintenance deleted', `#${id}`)
      ;(async () => {
        const allItems = [...prev.pending, ...prev.inProgress, ...prev.resolved]
        const item = allItems.find((m) => m.id === id)
        doAnchor(() => canonicalMaintenanceDelete(id, item?.title || ''), id, `Maintenance #${id} deleted`)
      })()
      return {
        pending: prev.pending.filter((m) => m.id !== id),
        inProgress: prev.inProgress.filter((m) => m.id !== id),
        resolved: prev.resolved.filter((m) => m.id !== id),
      }
    })
  }, [doAnchor])

  // ── Computed ──
  const totalUnits = useMemo(() => floors.reduce((s, f) => s + f.units.length, 0), [floors])
  const occupiedUnits = useMemo(
    () => floors.reduce((s, f) => s + f.units.filter((u) => u.status === 'occupied').length, 0),
    [floors],
  )
  const monthlyRevenue = useMemo(
    () => floors.reduce(
      (s, f) => s + f.units.reduce((us, u) => us + (u.status === 'occupied' ? u.monthlyRent : 0), 0),
      0,
    ),
    [floors],
  )
  const hasBuilding = !!building

  const tenants = useMemo(
    () => floors.flatMap((f) =>
      f.units.filter((u) => u.tenant).map((u) => ({
        ...u.tenant,
        unit: u.name, floor: f.name, monthlyRent: u.monthlyRent,
        rent: `UGX ${u.monthlyRent.toLocaleString()}/mo`,
        unitType: u.type, unitSize: u.size, unitRent: u.rent,
      })),
    ),
    [floors],
  )

  const totalOutstanding = useMemo(
    () => tenants.reduce((s, t) => s + Math.max(0, t.outstandingBalance || 0), 0),
    [tenants],
  )

  const tenantStats = useMemo(() => ({
    total: tenants.length,
    latePayers: tenants.filter((t) => !t.paid).length,
    arrears: `UGX ${tenants
      .filter((t) => !t.paid)
      .reduce((s, t) => s + (t.outstandingBalance || 0), 0)
      .toLocaleString()}`,
    activeLeases: tenants.filter((t) => t.paid).length,
  }), [tenants])

  const transactions = useMemo(() =>
    floors.flatMap((f) =>
      f.units.filter((u) => u.tenant).map((u) => ({
        unit: u.name, floor: f.name, tenant: u.tenant.name,
        initials: u.tenant.initials,
        badge: (u.tenant.outstandingBalance || 0) <= 0
          ? 'Paid'
          : (u.tenant.lastPayment ? 'Partial' : 'Overdue'),
        amount: `UGX ${(u.monthlyRent || 0).toLocaleString()}`,
      })),
    ),
    [floors],
  )

  const alerts = useMemo(
    () => [
      ...tenants.filter((t) => !t.paid).map((t) => ({
        type: 'Payment',
        issue: `${t.name} payment pending (${t.floor} - ${t.unit})`,
        urgency: 'Overdue',
        due: 'Requires attention',
      })),
      ...tenants.filter((t) => t.leaseEnd).map((t) => ({
        type: 'Lease',
        issue: `${t.name} lease ends ${t.leaseEnd} (${t.floor} - ${t.unit})`,
        urgency: 'Upcoming',
        due: t.leaseEnd,
      })),
    ],
    [tenants],
  )

  const upcomingPayments = useMemo(
    () => tenants.map((t) => ({
      tenant: t.name, unit: t.unit, floor: t.floor,
      amount: `UGX ${(t.monthlyRent || 0).toLocaleString()}`,
      due: (t.outstandingBalance || 0) > 0
        ? `${(t.outstandingBalance || 0).toLocaleString()} UGX outstanding`
        : 'Next cycle',
    })),
    [tenants],
  )

  const combinedActivityLog = useMemo(() => [...payments], [payments])

  const maintenanceStats = useMemo(() => ({
    pending: maintenance.pending.length,
    inProgress: maintenance.inProgress.length,
    resolved: maintenance.resolved.length,
  }), [maintenance])

  const getFloorBySlug = useCallback(
    (slug) => floors.find((f) => floorSlug(f.name) === slug) || null,
    [floors],
  )

  const getUnitByFloorAndId = useCallback(
    (slug, unitId) => {
      const f = getFloorBySlug(slug)
      if (!f) return null
      const unit = f.units.find((u) => u.id === unitId) || null
      return unit ? { ...unit, floor: f.name } : null
    },
    [getFloorBySlug],
  )

  const getAvatarColor = useCallback((initials) => hashColor(initials), [])

  const value = useMemo(
    () => ({
      building, floors, payments, anchors, totalUnits, occupiedUnits, monthlyRevenue, totalOutstanding,
      tenants, tenantStats, transactions, alerts, upcomingPayments,
      revenueMonthly, revenueMix, cashFlowData, maintenance, maintenanceStats,
      paymentMethods, tenantFilters, statusBorders, priorityBorders,
      floorSlug, getFloorBySlug, getUnitByFloorAndId, getAvatarColor,
      addTenant, updateTenant, deleteTenant,
      addFloor, updateFloor, deleteFloor,
      updateUnit, deleteUnit,
      addPayment, voidPayment, combinedActivityLog,
      addMaintenance, updateMaintenance, moveMaintenance, deleteMaintenance,
      updateProfile,
      auth, login, register, logout, loading, refreshing, restoringSession, error, hasBuilding, createBuilding, supabaseReady,
    }),
    [
      building, floors, payments, anchors, maintenance, totalUnits, occupiedUnits,
      monthlyRevenue, totalOutstanding, tenants, tenantStats, transactions, alerts, upcomingPayments,
      getFloorBySlug, getUnitByFloorAndId, getAvatarColor,
      addTenant, updateTenant, deleteTenant,
      addFloor, updateFloor, deleteFloor,
      updateUnit, deleteUnit,
      addPayment, voidPayment, combinedActivityLog,
      addMaintenance, updateMaintenance, moveMaintenance, deleteMaintenance,
      updateProfile,
      auth, login, register, logout, loading, refreshing, restoringSession, error, hasBuilding, createBuilding, supabaseReady,
    ],
  )

  return <BuildingContext.Provider value={value}>{children}</BuildingContext.Provider>
}

export function useBuilding() {
  const ctx = useContext(BuildingContext)
  if (!ctx) throw new Error('useBuilding must be used within BuildingProvider')
  return ctx
}
