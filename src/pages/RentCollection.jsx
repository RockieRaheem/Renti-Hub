import { useState } from 'react'
import { collectionStats, tenants, paymentMethods, activityLog } from '../data/rentCollection'

export default function RentCollection() {
  const [selected, setSelected] = useState(tenants[0].id)
  const [method, setMethod] = useState('Mobile Money')
  const [amount, setAmount] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const tenant = tenants.find((t) => t.id === selected)
  const due = tenant ? tenant.rent + tenant.lateFee : 0

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Today's Collection", value: collectionStats.today, icon: 'payments', color: 'text-primary' },
          { label: 'This Week', value: collectionStats.week, icon: 'calendar_month', color: 'text-status-paid' },
          { label: 'Monthly Total', value: collectionStats.month, icon: 'account_balance', color: 'text-tertiary' },
          { label: 'Pending Payments', value: collectionStats.pending, icon: 'hourglass_empty', color: 'text-status-partial' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-premium border border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">{s.label}</p>
              <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
            </div>
            <h3 className="text-2xl font-extrabold text-on-surface">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-premium border border-border-subtle p-8">
          <h3 className="text-xl font-bold text-on-surface mb-6">Record Payment</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Tenant</label>
              <select value={selected} onChange={(e) => { setSelected(Number(e.target.value)); setSubmitted(false) }}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none">
                {tenants.map((t) => <option key={t.id} value={t.id}>{t.name} - {t.unit}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Amount Due</label>
                <p className="text-2xl font-extrabold text-primary">UGX {due.toLocaleString()}</p>
                {tenant && tenant.lateFee > 0 && <p className="text-xs text-status-unpaid">Includes UGX {tenant.lateFee.toLocaleString()} late fee</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Amount Paying</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none" placeholder="Enter amount..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Payment Method</label>
              <div className="flex gap-3 flex-wrap">
                {paymentMethods.map((m) => (
                  <button key={m} type="button" onClick={() => setMethod(m)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${method === m ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}>{m}</button>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-container transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">check_circle</span> Complete Payment
            </button>
          </form>
          {submitted && (
            <div className="mt-6 p-6 bg-surface-container-low rounded-2xl border border-border-subtle">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-status-paid/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-status-paid">check_circle</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Payment Recorded</h4>
                  <p className="text-sm text-on-surface-variant">Receipt #{Math.random().toString(36).slice(2, 8).toUpperCase()}</p>
                </div>
              </div>
              <div className="border-t border-border-subtle pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-on-surface-variant">Tenant</span><span className="font-bold">{tenant?.name}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Amount</span><span className="font-bold">UGX {Number(amount || due).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Method</span><span className="font-bold">{method}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Date</span><span className="font-bold">{new Date().toLocaleDateString()}</span></div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-premium border border-border-subtle p-8">
          <h3 className="text-xl font-bold text-on-surface mb-6">Today's Activity</h3>
          <div className="space-y-4">
            {activityLog.map((a, i) => (
              <div key={i} className="flex gap-4 p-4 bg-surface-container-low rounded-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-sm">payments</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm text-on-surface">{a.tenant}</p>
                    <span className="text-xs text-on-surface-variant whitespace-nowrap">{a.time}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">{a.method}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-sm text-on-surface">{a.amount}</span>
                    <span className="text-[10px] font-bold text-status-paid uppercase tracking-wider">{a.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
