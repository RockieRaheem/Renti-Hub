import { STELLAR_EXPLORER_URL } from '../lib/stellar'

export default function PaymentReceipt({ payment, tenant, floor, unit, buildingName, onClose }) {
  const prevBal = payment.previousBalance ?? 0
  const amount = payment.amount || 0
  const newBal = prevBal - amount
  const isCredit = newBal < 0
  const isSettled = newBal === 0
  const statusText = isCredit ? 'Overpaid / Credit' : isSettled ? 'Settled' : 'Partially Paid'
  const statusColor = isCredit ? 'text-blue-600' : isSettled ? 'text-status-paid' : 'text-status-unpaid'

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Receipt ${payment.receiptId}</title>
      <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 400px; margin: 0 auto; padding: 32px 20px; color: #1a1a2e; font-size: 13px; }
        h1 { margin: 0 0 2px; font-size: 18px; letter-spacing: 0.5px; }
        .sub { color: #666; font-size: 11px; margin: 0 0 16px; }
        .receipt-no { font-size: 11px; color: #888; margin-bottom: 16px; }
        .row { display: flex; justify-content: space-between; padding: 5px 0; }
        .label { color: #888; }
        .divider { border-top: 1px solid #ddd; margin: 8px 0; }
        .total { border-top: 2px solid #1a1a2e; padding-top: 8px; font-weight: 700; font-size: 15px; margin-top: 8px; }
        .total span:last-child { color: #2563eb; }
        .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; }
        .green { color: #155724; font-weight: 600; }
        .red { color: #dc3545; font-weight: 600; }
      </style>
      </head>
      <body>
        <h1>${buildingName || 'RentiHub'}</h1>
        <p class="sub">Payment Receipt</p>
        <p class="receipt-no">#${payment.receiptId}</p>
        <div class="row"><span class="label">Tenant</span><span>${tenant || payment.tenantName}</span></div>
        <div class="row"><span class="label">Unit</span><span>${unit} &middot; ${floor}</span></div>
        <div class="row"><span class="label">Date</span><span>${payment.date || '—'}</span></div>
        <div class="row"><span class="label">Method</span><span>${payment.method || 'Cash'}</span></div>
        <div class="row"><span class="label">Status</span><span class="${payment.status === 'Paid' ? 'green' : 'red'}">${payment.status}</span></div>
        <div class="divider"></div>
        <div class="row"><span class="label">Balance Before</span><span>UGX ${prevBal.toLocaleString()}</span></div>
        <div class="row total"><span>Amount Paid</span><span>UGX ${amount.toLocaleString()}</span></div>
        <div class="row"><span class="label">Balance After</span><span class="${isCredit ? '' : newBal > 0 ? 'red' : 'green'}">${isCredit ? '−UGX ' + Math.abs(newBal).toLocaleString() + ' (Credit)' : newBal > 0 ? 'UGX ' + newBal.toLocaleString() + ' (Due)' : 'UGX 0 (Cleared)'}</span></div>
        ${payment.stellarTxHash ? `<div class="footer"><p>Verified on Stellar</p></div>` : ''}
        <div class="footer"><p>RentiHub &middot; ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
        <script>window.print()</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-outline">
          <div>
            <h2 className="text-sm font-bold text-on-surface">{buildingName || 'RentiHub'}</h2>
            <p className="text-[10px] text-on-surface-muted">Receipt #{payment.receiptId}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-on-surface-dim">Tenant</span>
              <p className="font-medium text-on-surface">{tenant || payment.tenantName}</p>
            </div>
            <div className="text-right">
              <span className="text-on-surface-dim">Date</span>
              <p className="font-normal text-on-surface">{payment.date || '—'}</p>
            </div>
            <div>
              <span className="text-on-surface-dim">Unit</span>
              <p className="font-normal text-on-surface">{unit} &middot; {floor}</p>
            </div>
            <div className="text-right">
              <span className="text-on-surface-dim">Method</span>
              <p className="font-normal text-on-surface">{payment.method || 'Cash'}</p>
            </div>
          </div>

          <div className="bg-surface-container rounded-lg border border-outline p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-on-surface-muted">Status</span>
              <span className={`text-xs font-semibold ${payment.status === 'Paid' ? 'text-status-paid' : 'text-status-unpaid'}`}>{payment.status}</span>
            </div>
            <div className="border-t border-outline/50 pt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-on-surface-muted">Balance Before</span>
                <span className="font-medium text-on-surface">UGX {prevBal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t-2 border-primary/20 pt-2 -mx-3 px-3">
                <span>Amount Paid</span>
                <span className="text-primary">UGX {amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-muted">Balance After</span>
                <span className={`font-semibold ${isCredit ? 'text-blue-600' : newBal > 0 ? 'text-status-unpaid' : 'text-status-paid'}`}>
                  {isCredit ? '−UGX ' + Math.abs(newBal).toLocaleString() + ' (Prepaid)' : newBal > 0 ? 'UGX ' + newBal.toLocaleString() + ' (Due)' : 'Settled'}
                </span>
              </div>
            </div>
          </div>

          {newBal > 0 && (
            <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-100 rounded-lg text-xs">
              <span className="material-symbols-outlined text-status-unpaid text-sm shrink-0">warning</span>
              <span className="text-red-700">Owes UGX {newBal.toLocaleString()} after this payment</span>
            </div>
          )}

          {isCredit && (
            <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-xs">
              <span className="material-symbols-outlined text-blue-500 text-sm shrink-0">account_balance_wallet</span>
              <span className="text-blue-700">Prepaid UGX {Math.abs(newBal).toLocaleString()} — applies to next month</span>
            </div>
          )}

          {isSettled && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs">
              <span className="material-symbols-outlined text-emerald-600 text-sm shrink-0">check_circle</span>
              <span className="text-emerald-700">Settled — fully paid up</span>
            </div>
          )}

          {payment.stellarTxHash ? (
            <a href={`${STELLAR_EXPLORER_URL}/${payment.stellarTxHash}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs hover:bg-emerald-100 transition-colors">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-emerald-600 text-xs">verified</span>
              </div>
              <span className="flex-1 text-emerald-700">Anchored to Stellar</span>
              <span className="material-symbols-outlined text-emerald-500 text-sm">open_in_new</span>
            </a>
          ) : (
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs">
              <span className="material-symbols-outlined text-amber-500 text-sm shrink-0">hourglass_top</span>
              <span className="text-amber-700">Notarizing to Stellar...</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-outline bg-surface-container/30 rounded-b-xl">
          <button onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-on-surface-muted hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors">
            Close
          </button>
          <button onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-card transition-colors inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">print</span>
            Print
          </button>
        </div>
      </div>
    </div>
  )
}
