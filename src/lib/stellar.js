import { Keypair, TransactionBuilder, Operation, Asset, Memo, Networks, Horizon, BASE_FEE } from '@stellar/stellar-sdk'

const NETWORK = import.meta.env.VITE_STELLAR_NETWORK || 'testnet'
const HORIZON_URL = NETWORK === 'mainnet'
  ? 'https://horizon.stellar.org'
  : 'https://horizon-testnet.stellar.org'
const PASSPHRASE = NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET
const STELLAR_SECRET = import.meta.env.VITE_STELLAR_ANCHOR_SECRET

let server, keypair
function init() {
  if (server) return
  server = new Horizon.Server(HORIZON_URL)
  if (STELLAR_SECRET) {
    keypair = Keypair.fromSecret(STELLAR_SECRET)
  }
}

export async function sha256(data) {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data))
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
