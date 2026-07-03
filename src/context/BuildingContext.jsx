import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { logAudit } from '../utils/audit'
import { supabase } from '../lib/supabase'
import * as q from '../lib/queries'

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
  const [auth, setAuth] = useState(null)
  const [userId, setUserId] = useState(null)
  const [building, setBuilding] = useState(null)
  const [loading, setLoading] = useState(true)
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
    setBuilding(bld || null)
    if (!bld) return

    const [fr, pr, mr] = await Promise.all([
      q.fetchFloorsWithUnits(bld.id),
      q.fetchPayments(bld.id),
      q.fetchMaintenance(bld.id),
    ])
    if (fr.data) setFloors(fr.data)
    if (pr.data) setPayments(pr.data)
    if (mr.data) setMaintenance(mr.data)
  }

  const refreshData = useCallback(async () => {
    if (!building || !userId) return
    setLoading(true)
    await loadAllData(userId)
    setLoading(false)
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

  // ── Helpers ──
  const findTenantId = useCallback((floorName, unitId) => {
    const floor = floors.find((f) => f.name === floorName)
    if (!floor) return null
    const unit = floor.units.find((u) => u.id === unitId)
    return unit?.tenant?.id || null
  }, [floors])

  // ── Tenant ──
  const addTenant = useCallback(async (floorName, unitId, tenantData, monthlyRent) => {
    if (!building) return
    const result = await q.addTenant(unitId, building.id, tenantData)
    if (result.error) { setError(result.error); return }

    if (monthlyRent) {
      await q.updateUnit(unitId, { monthlyRent: Number(monthlyRent) })
    }
    await refreshData()
    logAudit('Tenant added', `${tenantData.name} → ${floorName} / ${unitId}`)
  }, [building, refreshData])

  const updateTenant = useCallback(async (floorName, unitId, updates) => {
    const tenantId = findTenantId(floorName, unitId)
    if (!tenantId) return

    const { monthlyRent, ...tenantUpdates } = updates
    if (Object.keys(tenantUpdates).length > 0) {
      await q.updateTenant(tenantId, tenantUpdates)
    }
    if (monthlyRent !== undefined) {
      await q.updateUnit(unitId, { monthlyRent: Number(monthlyRent) })
    }
    await refreshData()
    logAudit('Tenant updated', `${floorName} / ${unitId}`)
  }, [findTenantId, refreshData])

  const deleteTenant = useCallback(async (floorName, unitId) => {
    const tenantId = findTenantId(floorName, unitId)
    if (!tenantId) return
    await q.deleteTenant(tenantId)
    await refreshData()
    logAudit('Tenant removed', `${floorName} / ${unitId}`)
  }, [findTenantId, refreshData])

  // ── Floor ──
  const addFloor = useCallback(async (name, unitCount) => {
    if (!building) return
    const result = await q.addFloorWithUnits(building.id, name, unitCount)
    if (result.data) {
      setFloors(result.data)
      logAudit('Floor added', `${name} (${unitCount} units)`)
    } else {
      setError(result.error || 'Failed to add floor')
    }
  }, [building])

  const updateFloor = useCallback(async (oldName, newName) => {
    const floor = floors.find((f) => f.name === oldName)
    if (!floor?.id) return
    await q.renameFloor(floor.id, newName)
    setFloors((prev) => prev.map((f) => f.name === oldName ? { ...f, name: newName } : f))
    logAudit('Floor renamed', `${oldName} → ${newName}`)
  }, [floors])

  const deleteFloor = useCallback(async (name) => {
    const floor = floors.find((f) => f.name === name)
    if (!floor?.id) return
    await q.deleteFloor(floor.id)
    setFloors((prev) => prev.filter((f) => f.name !== name))
    logAudit('Floor deleted', name)
  }, [floors])

  // ── Unit ──
  const updateUnit = useCallback(async (floorName, unitId, updates) => {
    await q.updateUnit(unitId, updates)
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
    logAudit('Unit updated', `${floorName} / ${unitId}`)
  }, [])

  const deleteUnit = useCallback(async (floorName, unitId) => {
    await q.deleteUnit(unitId)
    setFloors((prev) =>
      prev.map((f) => {
        if (f.name !== floorName) return f
        return { ...f, units: f.units.filter((u) => u.id !== unitId) }
      }),
    )
    logAudit('Unit deleted', `${floorName} / ${unitId}`)
  }, [])

  // ── Payment ──
  const addPayment = useCallback(async ({ floor: floorName, unit: unitName, amount, method, tenantName, status, date }) => {
    if (!building) return
    const floor = floors.find((f) => f.name === floorName)
    if (!floor) return
    const unit = floor.units.find((u) => u.name === unitName)
    if (!unit) return

    const result = await q.addPayment({
      unitId: unit.id, floorId: floor.id, buildingId: building.id,
      amount, method: method || 'Cash', status: status || 'Paid',
      tenantName: tenantName || '', date,
    })
    if (result.data) {
      setPayments((prev) => [result.data, ...prev])
    }

    if (unit.tenant) {
      const rawAmount = Number(amount) || 0
      const newOutstanding = Math.max(0, (unit.tenant.outstandingBalance || 0) - rawAmount)
      await q.updateTenant(unit.tenant.id, {
        paid: newOutstanding <= 0,
        outstandingBalance: newOutstanding,
        lastPayment: `UGX ${rawAmount.toLocaleString()}`,
        lastPaymentDate: new Date().toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric',
        }),
      })
    }

    await refreshData()
    logAudit('Payment recorded', `${tenantName} UGX ${(Number(amount) || 0).toLocaleString()} (${status})`)
  }, [building, floors, refreshData])

  // ── Maintenance ──
  const addMaintenance = useCallback(async (item) => {
    if (!building) return
    const result = await q.addMaintenanceRequest(building.id, item)
    if (result.data) {
      setMaintenance((prev) => ({ ...prev, pending: [result.data, ...prev.pending] }))
    }
    logAudit('Maintenance request created', item.title)
  }, [building])

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
  }, [])

  const moveMaintenance = useCallback(async (id, from, to) => {
    const statusMap = { pending: 'pending', inProgress: 'in_progress', resolved: 'resolved' }
    await q.updateMaintenanceRequest(id, { status: statusMap[to] || 'pending' })

    setMaintenance((prev) => {
      const item = prev[from].find((m) => m.id === id)
      if (!item) return prev
      logAudit('Maintenance moved', `${item.title}: ${from} → ${to}`)
      return {
        ...prev,
        [from]: prev[from].filter((m) => m.id !== id),
        [to]: [{ ...item, status: to, assignee: to === 'pending' ? null : item.assignee }, ...prev[to]],
      }
    })
  }, [])

  const deleteMaintenance = useCallback(async (id) => {
    await q.deleteMaintenanceRequest(id)
    setMaintenance((prev) => {
      logAudit('Maintenance deleted', `#${id}`)
      return {
        pending: prev.pending.filter((m) => m.id !== id),
        inProgress: prev.inProgress.filter((m) => m.id !== id),
        resolved: prev.resolved.filter((m) => m.id !== id),
      }
    })
  }, [])

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
      building, floors, payments, totalUnits, occupiedUnits, monthlyRevenue,
      tenants, tenantStats, transactions, alerts, upcomingPayments,
      revenueMonthly, revenueMix, cashFlowData, maintenance, maintenanceStats,
      paymentMethods, tenantFilters, statusBorders, priorityBorders,
      floorSlug, getFloorBySlug, getUnitByFloorAndId, getAvatarColor,
      addTenant, updateTenant, deleteTenant,
      addFloor, updateFloor, deleteFloor,
      updateUnit, deleteUnit,
      addPayment, combinedActivityLog,
      addMaintenance, updateMaintenance, moveMaintenance, deleteMaintenance,
      auth, login, register, logout, loading, restoringSession, error, hasBuilding, createBuilding, supabaseReady,
    }),
    [
      building, floors, payments, maintenance, totalUnits, occupiedUnits,
      monthlyRevenue, tenants, tenantStats, transactions, alerts, upcomingPayments,
      getFloorBySlug, getUnitByFloorAndId, getAvatarColor,
      addTenant, updateTenant, deleteTenant,
      addFloor, updateFloor, deleteFloor,
      updateUnit, deleteUnit,
      addPayment, combinedActivityLog,
      addMaintenance, updateMaintenance, moveMaintenance, deleteMaintenance,
      auth, login, register, logout, loading, restoringSession, error, hasBuilding, createBuilding, supabaseReady,
    ],
  )

  return <BuildingContext.Provider value={value}>{children}</BuildingContext.Provider>
}

export function useBuilding() {
  const ctx = useContext(BuildingContext)
  if (!ctx) throw new Error('useBuilding must be used within BuildingProvider')
  return ctx
}
