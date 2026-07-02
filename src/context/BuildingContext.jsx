import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { building as seedBuilding, floors as seedFloors } from '../data/currentBuilding'

const STORAGE_KEY = 'rentihub_floors'
const PAYMENTS_KEY = 'rentihub_payments'
const MAINTENANCE_KEY = 'rentihub_maintenance'
const AUTH_KEY = 'rentihub_auth'

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function computeInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const CHIP_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-lime-100 text-lime-700',
]

function hashColor(initials) {
  if (!initials) return 'bg-gray-100 text-gray-700'
  let hash = 0
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CHIP_COLORS[Math.abs(hash) % CHIP_COLORS.length]
}

function makeId(name) {
  return name
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 3)
    .toUpperCase() || 'FL'
}

const BuildingContext = createContext()

// Static data that never changes
import {
  revenueMonthly, revenueMix, cashFlowData, seedMaintenance, paymentMethods,
  tenantFilters, statusBorders, priorityBorders, floorSlug,
} from '../data/currentBuilding'

const maintenanceSeed = clone(seedMaintenance)

export function BuildingProvider({ children }) {
  const [floors, setFloors] = useState(() => load(STORAGE_KEY, clone(seedFloors)))
  const [payments, setPayments] = useState(() => load(PAYMENTS_KEY, []))
  const [auth, setAuth] = useState(() => load(AUTH_KEY, null))

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(floors))
  }, [floors])

  useEffect(() => {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments))
  }, [payments])

  // ---- Cross-tab Sync ----
  useEffect(() => {
    const handler = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { setFloors(JSON.parse(e.newValue)) } catch { /* ignore */ }
      }
      if (e.key === PAYMENTS_KEY && e.newValue) {
        try { setPayments(JSON.parse(e.newValue)) } catch { /* ignore */ }
      }
      if (e.key === MAINTENANCE_KEY && e.newValue) {
        try { setMaintenance(JSON.parse(e.newValue)) } catch { /* ignore */ }
      }
      if (e.key === AUTH_KEY) {
        try { setAuth(e.newValue ? JSON.parse(e.newValue) : null) } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // ---- Auth ----
  const login = useCallback((email, password) => {
    const users = load('rentihub_users', [])
    const user = users.find((u) => u.email === email && u.password === password)
    if (user) {
      const session = { name: user.name, email: user.email }
      setAuth(session)
      localStorage.setItem(AUTH_KEY, JSON.stringify(session))
    }
    return !!user
  }, [])

  const register = useCallback((name, email, password) => {
    const users = load('rentihub_users', [])
    if (users.find((u) => u.email === email)) return false
    users.push({ name, email, password })
    localStorage.setItem('rentihub_users', JSON.stringify(users))
    const session = { name, email }
    setAuth(session)
    localStorage.setItem(AUTH_KEY, JSON.stringify(session))
    return true
  }, [])

  const logout = useCallback(() => {
    setAuth(null)
    localStorage.removeItem(AUTH_KEY)
  }, [])

  // ---- Maintenance State ----
  const [maintenance, setMaintenance] = useState(() => load(MAINTENANCE_KEY, clone(maintenanceSeed)))

  useEffect(() => {
    localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(maintenance))
  }, [maintenance])

  const maintenanceStats = useMemo(() => ({
    pending: maintenance.pending.length,
    inProgress: maintenance.inProgress.length,
    resolved: maintenance.resolved.length,
  }), [maintenance])

  const addMaintenance = useCallback((item) => {
    const newItem = { id: Date.now(), ...item }
    setMaintenance((prev) => ({ ...prev, pending: [newItem, ...prev.pending] }))
  }, [])

  const updateMaintenance = useCallback((id, updates) => {
    setMaintenance((prev) => {
      const update = (arr) => arr.map((m) => m.id === id ? { ...m, ...updates } : m)
      return {
        pending: update(prev.pending),
        inProgress: update(prev.inProgress),
        resolved: update(prev.resolved),
      }
    })
  }, [])

  const moveMaintenance = useCallback((id, from, to) => {
    setMaintenance((prev) => {
      const item = prev[from].find((m) => m.id === id)
      if (!item) return prev
      const remove = (arr) => arr.filter((m) => m.id !== id)
      return {
        ...prev,
        [from]: remove(prev[from]),
        [to]: [{ ...item, assignee: to === 'pending' ? null : item.assignee }, ...prev[to]],
      }
    })
  }, [])

  const deleteMaintenance = useCallback((id) => {
    setMaintenance((prev) => {
      const remove = (arr) => arr.filter((m) => m.id !== id)
      return { pending: remove(prev.pending), inProgress: remove(prev.inProgress), resolved: remove(prev.resolved) }
    })
  }, [])

  // ---- CRUD: Tenant ----
  const addTenant = useCallback((floorName, unitId, tenantData, monthlyRent) => {
    const initials = computeInitials(tenantData.name)
    setFloors((prev) =>
      prev.map((floor) => {
        if (floor.name !== floorName) return floor
        return {
          ...floor,
          units: floor.units.map((unit) => {
            if (unit.id !== unitId) return unit
            return {
              ...unit,
              status: 'occupied',
              monthlyRent: Number(monthlyRent) || 0,
              tenant: {
                name: tenantData.name,
                initials,
                email: tenantData.email || '',
                phone: tenantData.phone || '',
                leaseStart: tenantData.leaseStart || '',
                leaseEnd: tenantData.leaseEnd || '',
                leaseTerm: tenantData.leaseTerm || '',
                paymentStatus: tenantData.paymentStatus || 'Good Payer',
                paid: true,
                outstandingBalance: 0,
                lastPayment: '',
                lastPaymentDate: '',
              },
            }
          }),
        }
      }),
    )
  }, [])

  const updateTenant = useCallback((floorName, unitId, updates) => {
    const { monthlyRent, ...tenantUpdates } = updates
    setFloors((prev) =>
      prev.map((floor) => {
        if (floor.name !== floorName) return floor
        return {
          ...floor,
          units: floor.units.map((unit) => {
            if (unit.id !== unitId) return unit
            const updated = { ...unit }
            if (monthlyRent !== undefined) updated.monthlyRent = Number(monthlyRent)
            if (unit.tenant) {
              const initials =
                tenantUpdates.name && tenantUpdates.name !== unit.tenant.name
                  ? computeInitials(tenantUpdates.name)
                  : unit.tenant.initials
              updated.tenant = { ...unit.tenant, ...tenantUpdates, initials }
            }
            return updated
          }),
        }
      }),
    )
  }, [])

  const deleteTenant = useCallback((floorName, unitId) => {
    setFloors((prev) =>
      prev.map((floor) => {
        if (floor.name !== floorName) return floor
        return {
          ...floor,
          units: floor.units.map((unit) => {
            if (unit.id !== unitId) return unit
            return { ...unit, status: 'vacant', monthlyRent: 0, tenant: null }
          }),
        }
      }),
    )
  }, [])

  // ---- CRUD: Floor ----
  const addFloor = useCallback((name, unitCount) => {
    const prefix = makeId(name)
    const units = Array.from({ length: unitCount }, (_, i) => ({
      id: `${prefix}${i + 1}`,
      name: `Unit ${i + 1}`,
      type: 'Retail',
      size: 'TBD',
      rent: 'TBD',
      monthlyRent: 0,
      status: 'vacant',
      tenant: null,
    }))
    setFloors((prev) => [...prev, { name, units }])
  }, [])

  const updateFloor = useCallback((oldName, newName) => {
    setFloors((prev) =>
      prev.map((f) => (f.name !== oldName ? f : { ...f, name: newName })),
    )
  }, [])

  const deleteFloor = useCallback((name) => {
    setFloors((prev) => prev.filter((f) => f.name !== name))
  }, [])

  // ---- Record Payment ----
  const addPayment = useCallback(({ floor, unit, amount, method, tenantName, status, date }) => {
    const rawAmount = Number(amount) || 0
    setPayments((prev) => [
      {
        id: Date.now().toString(),
        floor, unit, amount: rawAmount,
        method: method || 'Cash',
        status: status || 'Paid',
        tenantName: tenantName || '',
        date: date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      },
      ...prev,
    ])
    setFloors((prev) =>
      prev.map((f) => {
        if (f.name !== floor) return f
        return {
          ...f,
          units: f.units.map((u) => {
            if (u.name !== unit || !u.tenant) return u
            const currentOutstanding = u.tenant.outstandingBalance || 0
            const newOutstanding = Math.max(0, currentOutstanding - rawAmount)
            return {
              ...u,
              tenant: {
                ...u.tenant,
                outstandingBalance: newOutstanding,
                paid: newOutstanding <= 0,
                lastPayment: `UGX ${rawAmount.toLocaleString()}`,
                lastPaymentDate: new Date().toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                }),
              },
            }
          }),
        }
      }),
    )
  }, [])

  // ---- Computed ----
  const totalUnits = useMemo(() => floors.reduce((s, f) => s + f.units.length, 0), [floors])
  const occupiedUnits = useMemo(() => floors.reduce((s, f) => s + f.units.filter((u) => u.status === 'occupied').length, 0), [floors])
  const monthlyRevenue = useMemo(
    () => floors.reduce((s, f) => s + f.units.reduce((us, u) => us + (u.status === 'occupied' ? u.monthlyRent : 0), 0), 0),
    [floors],
  )

  const tenants = useMemo(
    () => floors.flatMap((f) =>
      f.units.filter((u) => u.tenant).map((u) => ({
        ...u.tenant,
        unit: u.name,
        floor: f.name,
        monthlyRent: u.monthlyRent,
        rent: `UGX ${u.monthlyRent.toLocaleString()}/mo`,
        unitType: u.type,
        unitSize: u.size,
        unitRent: u.rent,
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

  const transactions = useMemo(() => {
    return floors.flatMap((f) =>
      f.units.filter((u) => u.tenant).map((u) => ({
        unit: u.name, floor: f.name, tenant: u.tenant.name, initials: u.tenant.initials,
        badge: (u.tenant.outstandingBalance || 0) <= 0 ? 'Paid' : (u.tenant.lastPayment ? 'Partial' : 'Overdue'),
        amount: `UGX ${(u.monthlyRent || 0).toLocaleString()}`,
      })),
    )
  }, [floors])

  const alerts = useMemo(
    () => [
      { type: 'Maintenance', issue: 'Water pipe burst - Ground Floor Shop 1', urgency: 'Urgent', due: 'Today' },
      ...tenants
        .filter((t) => !t.paid)
        .map((t) => ({
          type: 'Payment',
          issue: `${t.name} payment pending (${t.floor} - ${t.unit})`,
          urgency: 'Overdue',
          due: 'Requires attention',
        })),
      ...tenants
        .filter((t) => t.leaseEnd)
        .map((t) => ({
          type: 'Lease',
          issue: `${t.name} lease ends ${t.leaseEnd} (${t.floor} - ${t.unit})`,
          urgency: 'Upcoming',
          due: t.leaseEnd,
        })),
    ],
    [tenants],
  )

  const upcomingPayments = useMemo(
    () =>
      tenants.map((t) => ({
        tenant: t.name,
        unit: t.unit,
        floor: t.floor,
        amount: `UGX ${(t.monthlyRent || 0).toLocaleString()}`,
        due: (t.outstandingBalance || 0) > 0 ? `${(t.outstandingBalance || 0).toLocaleString()} UGX outstanding` : 'Next cycle',
      })),
    [tenants],
  )

  const combinedActivityLog = useMemo(() => {
    const staticLog = [
      { time: '09:15 AM', tenant: 'Mukwano Industries', unit: 'Shop 1', floor: 'Ground Floor', amount: 'UGX 1,000,000', method: 'Bank Transfer', status: 'completed' },
      { time: '11:45 AM', tenant: 'Centenary Bank ATM', unit: 'Shop 2', floor: 'Ground Floor', amount: 'UGX 667,000', method: 'Mobile Money', status: 'completed' },
      { time: '14:00 PM', tenant: 'Uganda Telecom Ltd', unit: 'Office Suite A', floor: '1st Floor', amount: 'UGX 1,500,000', method: 'Bank Transfer', status: 'completed' },
    ]
    return [...payments, ...staticLog]
  }, [payments])

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
      building: seedBuilding, floors, payments,
      totalUnits, occupiedUnits, monthlyRevenue,
      tenants, tenantStats, transactions, alerts, upcomingPayments,
      revenueMonthly, revenueMix, cashFlowData, maintenance, maintenanceStats,
      paymentMethods, tenantFilters, statusBorders, priorityBorders,
      floorSlug, getFloorBySlug, getUnitByFloorAndId, getAvatarColor,
      addTenant, updateTenant, deleteTenant,
      addFloor, updateFloor, deleteFloor,
      addPayment, combinedActivityLog,
      addMaintenance, updateMaintenance, moveMaintenance, deleteMaintenance,
      auth, login, register, logout,
    }),
    [
      floors, payments, maintenance, totalUnits, occupiedUnits, monthlyRevenue,
      tenants, tenantStats, transactions, alerts, upcomingPayments,
      getFloorBySlug, getUnitByFloorAndId, getAvatarColor,
      addTenant, updateTenant, deleteTenant,
      addFloor, updateFloor, deleteFloor,
      addPayment, combinedActivityLog,
      addMaintenance, updateMaintenance, moveMaintenance, deleteMaintenance,
      auth, login, register, logout,
    ],
  )

  return <BuildingContext.Provider value={value}>{children}</BuildingContext.Provider>
}

export function useBuilding() {
  const ctx = useContext(BuildingContext)
  if (!ctx) throw new Error('useBuilding must be used within BuildingProvider')
  return ctx
}
