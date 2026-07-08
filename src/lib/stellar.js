import { Keypair, TransactionBuilder, Operation, Asset, Memo, Networks, Horizon, BASE_FEE } from '@stellar/stellar-sdk'

const NETWORK = import.meta.env.VITE_STELLAR_NETWORK || 'testnet'
const HORIZON_URL = NETWORK === 'mainnet'
  ? 'https://horizon.stellar.org'
  : 'https://horizon-testnet.stellar.org'
const PASSPHRASE = NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET
const STELLAR_SECRET = import.meta.env.VITE_STELLAR_ANCHOR_SECRET
const NETWORK_NAME = NETWORK === 'mainnet' ? 'Mainnet' : 'Testnet'

export function isStellarConfigured() {
  return !!(STELLAR_SECRET && STELLAR_SECRET.length > 20)
}

export function getStellarNetwork() {
  return NETWORK_NAME
}

let server, keypair
function init() {
  if (server) return
  server = new Horizon.Server(HORIZON_URL)
  if (STELLAR_SECRET) {
    keypair = Keypair.fromSecret(STELLAR_SECRET)
  }
}

function canonicalStringify(obj) {
  if (obj === null || obj === undefined) return 'null'
  if (typeof obj === 'string') return JSON.stringify(obj)
  if (typeof obj === 'number') return Object.is(obj, -0) ? '-0' : String(obj)
  if (typeof obj === 'boolean') return String(obj)
  if (Array.isArray(obj)) return '[' + obj.map(canonicalStringify).join(',') + ']'
  const keys = Object.keys(obj).sort()
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalStringify(obj[k])).join(',') + '}'
}

export async function sha256(data) {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(typeof data === 'string' ? data : canonicalStringify(data))
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function anchorHash(data) {
  init()
  const hash = await sha256(data)
  if (!keypair) return { hash, txHash: null, ledger: null, error: 'Stellar not configured — set VITE_STELLAR_ANCHOR_SECRET' }

  try {
    const account = await server.loadAccount(keypair.publicKey())
    const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: PASSPHRASE })
      .addOperation(Operation.payment({
        destination: keypair.publicKey(),
        asset: Asset.native(),
        amount: '0.00001',
      }))
      .addMemo(Memo.hash(hash))
      .setTimeout(30)
      .build()

    tx.sign(keypair)
    const result = await server.submitTransaction(tx)

    return { hash, txHash: result.hash, ledger: result.ledger, error: null }
  } catch (err) {
    return { hash, txHash: null, ledger: null, error: err.message || 'Stellar anchor failed' }
  }
}

export async function verifyIntegrity(record, storedHash) {
  const computed = await sha256(record)
  return {
    valid: computed === storedHash,
    computedHash: computed,
    storedHash,
  }
}

export async function fetchAnchorTransaction(txHash) {
  init()
  try {
    const tx = await server.transactions().transaction(txHash).call()
    const memoHashHex = tx.memo_hash
      ? base64ToHex(tx.memo_hash)
      : null
    return {
      txHash: tx.hash,
      ledger: tx.ledger_attr,
      timestamp: tx.created_at,
      memoHash: memoHashHex,
      sourceAccount: tx.source_account,
      successful: tx.successful,
      error: null,
    }
  } catch (err) {
    return { error: err.message || 'Transaction not found' }
  }
}

export async function computeReceiptHash(payment) {
  return sha256({
    id: payment.id,
    receiptId: payment.receiptId,
    tenantName: payment.tenantName,
    amount: payment.amount,
    method: payment.method,
    date: payment.date,
    floor: payment.floor,
    unit: payment.unit,
  })
}

export const STELLAR_EXPLORER_URL = NETWORK === 'mainnet'
  ? 'https://stellar.expert/explorer/public/tx'
  : 'https://stellar.expert/explorer/testnet/tx'

function base64ToHex(b64) {
  const raw = atob(b64)
  let hex = ''
  for (let i = 0; i < raw.length; i++) {
    const h = raw.charCodeAt(i).toString(16)
    hex += h.length === 1 ? '0' + h : h
  }
  return hex
}

// ── Generic Anchor Record ────────────────────────────────────────────────
// Builds canonical data with timestamp, hashes it, anchors to Stellar.
// Returns { hash, txHash, ledger, error, recordSnapshot } where recordSnapshot
// is the exact data that was hashed (with timestamp), so verification matches.
export async function anchorRecord(canonicalData) {
  const recordSnapshot = {
    ...canonicalData,
    anchoredAt: new Date().toISOString(),
  }
  const result = await anchorHash(recordSnapshot)
  return { ...result, recordSnapshot }
}

// ── Canonical Data Builders ──────────────────────────────────────────────
// Each returns the minimal set of fields that define a record for integrity verification.
export function canonicalPayment(p) {
  return {
    recordType: 'payment',
    id: p.id,
    receiptId: p.receiptId || `RCP-${(p.id || '').substring(0, 4).toUpperCase()}-${(p.id || '').substring(4, 8).toUpperCase()}`,
    tenantName: p.tenantName || p.tenant_name || '',
    amount: Number(p.amount || 0),
    method: p.method || '',
    date: p.date || '',
    floor: p.floor || p.floor_name || '',
    unit: p.unit || p.unit_name || '',
  }
}

export function canonicalTenantAdd(tenantData, floorName, unitId) {
  return {
    recordType: 'tenant_add',
    tenantName: tenantData.name || '',
    email: tenantData.email || '',
    phone: tenantData.phone || '',
    floor: floorName || '',
    unitId: unitId || '',
    monthlyRent: Number(tenantData.monthlyRent || 0),
    leaseStart: tenantData.leaseStart || '',
    leaseEnd: tenantData.leaseEnd || '',
    leaseTerm: tenantData.leaseTerm || '',
  }
}

export function canonicalTenantDelete(tenant, floorName, unitName) {
  return {
    recordType: 'tenant_delete',
    tenantName: tenant?.name || '',
    email: tenant?.email || '',
    phone: tenant?.phone || '',
    floor: floorName || '',
    unit: unitName || '',
  }
}

export function canonicalTenantUpdate(oldTenant, updates, floorName, unitName) {
  const changes = {}
  const fieldMap = {
    name: 'name', email: 'email', phone: 'phone',
    leaseStart: 'lease_start', leaseEnd: 'lease_end', leaseTerm: 'lease_term',
    paymentStatus: 'payment_status',
  }
  for (const [key, dbKey] of Object.entries(fieldMap)) {
    if (key in updates || dbKey in updates) {
      const newVal = updates[key] ?? updates[dbKey] ?? ''
      const oldVal = oldTenant[key] ?? oldTenant[dbKey] ?? ''
      if (String(newVal) !== String(oldVal)) {
        changes[key] = { from: oldVal, to: newVal }
      }
    }
  }
  return {
    recordType: 'tenant_update',
    tenantName: oldTenant?.name || '',
    tenantId: oldTenant?.id || '',
    floor: floorName || '',
    unit: unitName || '',
    changes,
    changedFields: Object.keys(changes),
  }
}

export function canonicalPaymentVoid(payment) {
  return {
    recordType: 'payment_void',
    id: payment.id,
    receiptId: payment.receiptId || '',
    tenantName: payment.tenantName || '',
    amount: Number(payment.amount || 0),
    date: payment.date || '',
  }
}

export function canonicalMaintenanceAdd(item, buildingId) {
  return {
    recordType: 'maintenance_add',
    title: item.title || '',
    description: item.description || '',
    floor: item.floor || '',
    unit: item.unit || '',
    priority: item.priority || 'medium',
    category: item.category || '',
  }
}

export function canonicalMaintenanceUpdate(id, updates) {
  return {
    recordType: 'maintenance_update',
    id: id || '',
    updates,
  }
}

export function canonicalMaintenanceDelete(id, title) {
  return {
    recordType: 'maintenance_delete',
    id: id || '',
    title: title || '',
  }
}

export function canonicalFloorAdd(name, unitCount) {
  return {
    recordType: 'floor_add',
    name: name || '',
    unitCount: unitCount || 0,
  }
}

export function canonicalFloorDelete(name) {
  return {
    recordType: 'floor_delete',
    name: name || '',
  }
}

export function canonicalFloorRename(oldName, newName) {
  return {
    recordType: 'floor_rename',
    oldName: oldName || '',
    newName: newName || '',
  }
}

export function canonicalUnitUpdate(floorName, unitId, updates) {
  return {
    recordType: 'unit_update',
    floor: floorName || '',
    unitId: unitId || '',
    updates,
  }
}

export function canonicalUnitDelete(floorName, unitId) {
  return {
    recordType: 'unit_delete',
    floor: floorName || '',
    unitId: unitId || '',
  }
}
