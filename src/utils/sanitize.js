export function sanitizeString(val) {
  if (typeof val !== 'string') return ''
  return val.replace(/<[^>]*>/g, '').trim()
}

export function sanitizeNumber(val) {
  if (val === undefined || val === null) return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  const cleaned = String(val).replace(/[^0-9.\-]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

export function sanitizeDate(val) {
  if (!val) return new Date().toISOString().split('T')[0]
  const d = new Date(val)
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0]
  return d.toISOString().split('T')[0]
}

export function sanitizeTenantData(data) {
  return {
    name: sanitizeString(data.name),
    email: sanitizeString(data.email),
    phone: sanitizeString(data.phone),
    leaseStart: sanitizeString(data.leaseStart),
    leaseEnd: sanitizeString(data.leaseEnd),
    leaseTerm: sanitizeString(data.leaseTerm),
    paymentStatus: sanitizeString(data.paymentStatus) || 'Good Payer',
  }
}

export function sanitizePaymentData(data) {
  return {
    floor: sanitizeString(data.floor),
    unit: sanitizeString(data.unit),
    amount: sanitizeNumber(data.amount),
    method: sanitizeString(data.method) || 'Cash',
    tenantName: sanitizeString(data.tenantName),
    status: sanitizeString(data.status) || 'Paid',
    date: sanitizeDate(data.date),
  }
}

export function sanitizeMaintenanceData(data) {
  return {
    title: sanitizeString(data.title),
    priority: sanitizeString(data.priority) || 'Medium',
    floorName: sanitizeString(data.floorName),
    unitName: sanitizeString(data.unitName),
    tenantName: sanitizeString(data.tenantName),
    description: sanitizeString(data.description),
  }
}
