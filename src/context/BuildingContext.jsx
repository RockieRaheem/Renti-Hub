import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { building, floors as initialFloors } from '../data/currentBuilding'

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

const BuildingContext = createContext()

export function BuildingProvider({ children }) {
  const [floors, setFloors] = useState(() => clone(initialFloors))

  const addTenant = useCallback((floorName, unitId, tenantData, monthlyRent) => {
    const initials = tenantData.name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

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
                  ? tenantUpdates.name
                      .split(' ')
                      .filter(Boolean)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
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

  const totalUnits = useMemo(
    () => floors.reduce((s, f) => s + f.units.length, 0),
    [floors],
  )
  const occupiedUnits = useMemo(
    () => floors.reduce((s, f) => s + f.units.filter((u) => u.status === 'occupied').length, 0),
    [floors],
  )
  const monthlyRevenue = useMemo(
    () =>
      floors.reduce(
        (s, f) =>
          s +
          f.units.reduce((us, u) => us + (u.status === 'occupied' ? u.monthlyRent : 0), 0),
        0,
      ),
    [floors],
  )

  const value = useMemo(
    () => ({ building, floors, totalUnits, occupiedUnits, monthlyRevenue, addTenant, updateTenant, deleteTenant }),
    [floors, totalUnits, occupiedUnits, monthlyRevenue, addTenant, updateTenant, deleteTenant],
  )

  return <BuildingContext.Provider value={value}>{children}</BuildingContext.Provider>
}

export function useBuilding() {
  const ctx = useContext(BuildingContext)
  if (!ctx) throw new Error('useBuilding must be used within BuildingProvider')
  return ctx
}
