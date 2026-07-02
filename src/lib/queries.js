import { supabase } from './supabase'

// =========================================================================
// RentiHub — Data Access Layer (all Supabase operations)
// =========================================================================
// Every function returns { data, error }. Callers handle errors.
// =========================================================================

// ── Helpers ──────────────────────────────────────────────────────────────

function mapFloor(data) {
  return {
    name: data.name,
    units: (data.units || [])
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(mapUnit),
  }
}

function mapUnit(data) {
  const t = data.tenant
  const tenant = t
    ? {
        name: t.name,
        initials: t.initials,
        email: t.email || '',
        phone: t.phone || '',
        leaseStart: t.lease_start || '',
        leaseEnd: t.lease_end || '',
        leaseTerm: t.lease_term || '',
        paymentStatus: t.payment_status,
        paid: t.paid,
        outstandingBalance: Number(t.outstanding_balance),
        lastPayment: t.last_payment || '',
        lastPaymentDate: t.last_payment_date || '',
      }
    : null
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    size: data.size,
    rent: data.rent_display || 'TBD',
    monthlyRent: Number(data.monthly_rent),
    status: data.status,
    tenant,
  }
}

function mapPayment(data) {
  const floorName =
    data.floor_name ||
    data.floors?.name ||
    data.floor_id?.toString() ||
    ''
  const unitName =
    data.unit_name ||
    data.units?.name ||
    data.unit_id?.toString() ||
    ''
  return {
    id: data.id,
    floor: floorName,
    unit: unitName,
    amount: Number(data.amount),
    method: data.method,
    status: data.status,
    tenantName: data.tenant_name || '',
    date: data.date,
    time: new Date(data.created_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  }
}

function mapMaintenanceItem(data) {
  const floorName = data.floor_name || ''
  const unitName = data.unit_name || ''
  const tenantName = data.tenant_name || ''
  const createdAt = data.created_at
  return {
    id: data.id,
    title: data.title,
    priority: data.priority,
    status: data.status,
    assignee: data.assignee,
    resolution: data.resolution,
    floorName,
    unitName,
    tenantName,
    createdAt,
    // Aliases for component compatibility
    floor: floorName,
    unit: unitName,
    tenant: tenantName,
    date: createdAt
      ? new Date(createdAt).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric',
        })
      : '',
  }
}

function mapMaintenanceBoard(data) {
  const items = (data || []).map(mapMaintenanceItem)
  return {
    pending: items.filter((i) => i.status === 'pending'),
    inProgress: items.filter((i) => i.status === 'in_progress'),
    resolved: items.filter((i) => i.status === 'resolved'),
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────

export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp(
    { email, password },
    { data: { name } }
  )
  if (error) return { error: error.message }
  if (!data?.user) return { error: 'Registration failed. Check if email confirmation is required.' }
  return { data }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) return { error: error.message }
  return { data }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) return { error: error.message }
  return {}
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) return { error: error.message }
  return { data: data.session }
}

export async function getCurrentUser() {
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData?.session?.user) return { data: null }

  const u = sessionData.session.user
  let profile = null

  try {
    const { data } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', u.id)
      .limit(1)
    profile = data?.[0] || null
  } catch { /* profile table might not exist yet */ }

  if (!profile) {
    const name = u.user_metadata?.name || u.email?.split('@')[0] || 'User'
    try {
      await supabase.from('profiles').insert({ id: u.id, name })
    } catch { /* ignore — trigger may create it */ }
    return { data: { id: u.id, email: u.email, name } }
  }

  return { data: { id: u.id, email: u.email, name: profile.name } }
}

// ── Buildings ────────────────────────────────────────────────────────────

export async function fetchBuilding(userId) {
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at')
    .limit(1)
  if (error) return { error: error.message }
  return { data: data?.[0] || null }
}

export async function createBuilding({ name, location, type }) {
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData?.session?.user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('buildings')
    .insert({
      name,
      location: location || '',
      type: type || 'Mixed-Use',
      user_id: sessionData.session.user.id,
    })
    .select()
    .single()
  if (error) return { error: error.message }
  return { data }
}

export async function updateBuildingName(id, name) {
  const { error } = await supabase
    .from('buildings')
    .update({ name })
    .eq('id', id)
  if (error) return { error: error.message }
  return {}
}

// ── Floors ───────────────────────────────────────────────────────────────

export async function fetchFloorsWithUnits(buildingId) {
  const { data, error } = await supabase
    .from('floors')
    .select(
      `id, name, units:units(id, name, type, size, monthly_rent, rent_display, status, tenant:tenants(*))`
    )
    .eq('building_id', buildingId)
    .order('created_at')
  if (error) return { error: error.message }
  return { data: (data || []).map(mapFloor) }
}

export async function addFloorWithUnits(buildingId, name, unitCount) {
  const { data: floor, error: fe } = await supabase
    .from('floors')
    .insert({ building_id: buildingId, name })
    .select()
    .single()
  if (fe) return { error: fe.message }

  const units = Array.from({ length: unitCount }, (_, i) => ({
    floor_id: floor.id,
    building_id: buildingId,
    name: `Unit ${i + 1}`,
    type: 'Retail',
    size: 'TBD',
    monthly_rent: 0,
    status: 'vacant',
  }))

  const { error: ue } = await supabase.from('units').insert(units)
  if (ue) return { error: ue.message }

  return fetchFloorsWithUnits(buildingId)
}

export async function renameFloor(floorId, newName) {
  const { error } = await supabase
    .from('floors')
    .update({ name: newName })
    .eq('id', floorId)
  if (error) return { error: error.message }
  return {}
}

export async function deleteFloor(floorId) {
  const { error } = await supabase.from('floors').delete().eq('id', floorId)
  if (error) return { error: error.message }
  return {}
}

// ── Units ────────────────────────────────────────────────────────────────

export async function updateUnit(unitId, updates) {
  const db = {}
  if (updates.name !== undefined) db.name = updates.name
  if (updates.type !== undefined) db.type = updates.type
  if (updates.size !== undefined) db.size = updates.size
  if (updates.monthlyRent !== undefined) db.monthly_rent = Number(updates.monthlyRent)
  if (Object.keys(db).length === 0) return {}
  const { error } = await supabase.from('units').update(db).eq('id', unitId)
  if (error) return { error: error.message }
  return {}
}

export async function deleteUnit(unitId) {
  const { error } = await supabase.from('units').delete().eq('id', unitId)
  if (error) return { error: error.message }
  return {}
}

// ── Tenants ──────────────────────────────────────────────────────────────

export async function addTenant(unitId, buildingId, tenantData) {
  const { data, error } = await supabase
    .from('tenants')
    .insert({
      unit_id: unitId,
      building_id: buildingId,
      name: tenantData.name,
      email: tenantData.email || '',
      phone: tenantData.phone || '',
      lease_start: tenantData.leaseStart || '',
      lease_end: tenantData.leaseEnd || '',
      lease_term: tenantData.leaseTerm || '',
      payment_status: tenantData.paymentStatus || 'Good Payer',
      paid: true,
      outstanding_balance: 0,
    })
    .select()
    .single()
  if (error) return { error: error.message }
  return { data }
}

export async function updateTenant(tenantId, updates) {
  const db = {}
  if (updates.name !== undefined) db.name = updates.name
  if (updates.email !== undefined) db.email = updates.email
  if (updates.phone !== undefined) db.phone = updates.phone
  if (updates.leaseStart !== undefined) db.lease_start = updates.leaseStart
  if (updates.leaseEnd !== undefined) db.lease_end = updates.leaseEnd
  if (updates.leaseTerm !== undefined) db.lease_term = updates.leaseTerm
  if (updates.paymentStatus !== undefined) db.payment_status = updates.paymentStatus
  if (updates.paid !== undefined) db.paid = updates.paid
  if (updates.outstandingBalance !== undefined) db.outstanding_balance = updates.outstandingBalance
  if (updates.lastPayment !== undefined) db.last_payment = updates.lastPayment
  if (updates.lastPaymentDate !== undefined) db.last_payment_date = updates.lastPaymentDate
  if (Object.keys(db).length === 0) return {}
  const { error } = await supabase.from('tenants').update(db).eq('id', tenantId)
  if (error) return { error: error.message }
  return {}
}

export async function deleteTenant(tenantId) {
  const { error } = await supabase.from('tenants').delete().eq('id', tenantId)
  if (error) return { error: error.message }
  return {}
}

// ── Payments ─────────────────────────────────────────────────────────────

export async function fetchPayments(buildingId) {
  const { data, error } = await supabase
    .from('payments')
    .select('*, units!inner(name), floors!inner(name)')
    .eq('building_id', buildingId)
    .order('created_at', { ascending: false })
  if (error) return { error: error.message }
  return { data: (data || []).map(mapPayment) }
}

export async function addPayment(paymentData) {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      tenant_id: paymentData.tenantId || null,
      unit_id: paymentData.unitId,
      floor_id: paymentData.floorId,
      building_id: paymentData.buildingId,
      amount: Number(paymentData.amount),
      method: paymentData.method || 'Cash',
      status: paymentData.status || 'Paid',
      tenant_name: paymentData.tenantName || '',
      date: paymentData.date || new Date().toISOString().split('T')[0],
    })
    .select('*, units!inner(name), floors!inner(name)')
    .single()
  if (error) return { error: error.message }
  return { data: mapPayment(data) }
}

// ── Maintenance ──────────────────────────────────────────────────────────

export async function fetchMaintenance(buildingId) {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('*')
    .eq('building_id', buildingId)
    .order('created_at', { ascending: false })
  if (error) return { error: error.message }
  return {
    data: mapMaintenanceBoard(data),
    flat: data || [],
  }
}

export async function addMaintenanceRequest(buildingId, item) {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .insert({
      building_id: buildingId,
      floor_name: item.floorName || '',
      unit_name: item.unitName || '',
      tenant_name: item.tenantName || '',
      title: item.title,
      priority: item.priority || 'Medium',
      status: 'pending',
    })
    .select()
    .single()
  if (error) return { error: error.message }
  return { data: mapMaintenanceItem(data) }
}

export async function updateMaintenanceRequest(id, updates) {
  const db = {}
  if (updates.title !== undefined) db.title = updates.title
  if (updates.priority !== undefined) db.priority = updates.priority
  if (updates.assignee !== undefined) db.assignee = updates.assignee
  if (updates.resolution !== undefined) db.resolution = updates.resolution
  if (updates.status !== undefined) db.status = updates.status
  if (updates.floorName !== undefined) db.floor_name = updates.floorName
  if (updates.unitName !== undefined) db.unit_name = updates.unitName
  if (updates.tenantName !== undefined) db.tenant_name = updates.tenantName
  if (Object.keys(db).length === 0) return {}
  const { error } = await supabase
    .from('maintenance_requests')
    .update(db)
    .eq('id', id)
  if (error) return { error: error.message }
  return {}
}

export async function deleteMaintenanceRequest(id) {
  const { error } = await supabase
    .from('maintenance_requests')
    .delete()
    .eq('id', id)
  if (error) return { error: error.message }
  return {}
}

// ── Audit ────────────────────────────────────────────────────────────────

export async function logAuditDb(action, details) {
  const { data: userData } = await supabase.auth.getSession()
  const userId = userData?.session?.user?.id
  if (!userId) return
  await supabase.from('audit_log').insert({
    user_id: userId,
    action,
    details: details || '',
  })
}

export async function fetchAuditLog() {
  const { data: userData } = await supabase.auth.getSession()
  if (!userData?.session?.user?.id) return { data: [] }
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('user_id', userData.session.user.id)
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) return { error: error.message }
  return {
    data: (data || []).map((e) => ({
      id: e.id,
      action: e.action,
      details: e.details,
      time: new Date(e.created_at).toLocaleString('en-GB'),
    })),
  }
}

// ── Data Portability ─────────────────────────────────────────────────────

export async function exportAllData(userId) {
  const [buildings, floors, payments, maintenance, audit] =
    await Promise.all([
      supabase.from('buildings').select('*').eq('user_id', userId),
      supabase
        .from('floors')
        .select(
          '*, units:units(*, tenant:tenants(*))'
        )
        .in(
          'building_id',
          (
            await supabase
              .from('buildings')
              .select('id')
              .eq('user_id', userId)
          ).data?.map((b) => b.id) || []
        ),
      supabase
        .from('payments')
        .select('*')
        .in(
          'building_id',
          (
            await supabase
              .from('buildings')
              .select('id')
              .eq('user_id', userId)
          ).data?.map((b) => b.id) || []
        ),
      supabase
        .from('maintenance_requests')
        .select('*')
        .in(
          'building_id',
          (
            await supabase
              .from('buildings')
              .select('id')
              .eq('user_id', userId)
          ).data?.map((b) => b.id) || []
        ),
      supabase
        .from('audit_log')
        .select('*')
        .eq('user_id', userId),
    ])

  return {
    buildings: buildings.data || [],
    floors: floors.data || [],
    payments: payments.data || [],
    maintenance: maintenance.data || [],
    audit_log: audit.data || [],
    exported_at: new Date().toISOString(),
  }
}

export async function deleteAllUserData(userId) {
  // auth.users deletion handled by Supabase Admin API or trigger
  // All cascade deletes handle the rest
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)
  if (error) return { error: error.message }
  await supabase.auth.signOut()
  return {}
}

// ── Check if Supabase is configured ──────────────────────────────────────

export function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return !!(
    url &&
    key &&
    url !== 'https://your-project-id.supabase.co' &&
    key !== 'your-anon-key-here'
  )
}
