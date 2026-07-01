import { useState } from 'react'
import { building, tenants, paymentMethods, activityLog } from '../data/currentBuilding'

export default function RentCollection() {
  const [selected, setSelected] = useState(tenants[0].name)
  const [method, setMethod] = useState('Mobile Money')
  const [amount, setAmount] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [receiptId, setReceiptId] = useState('')

  const tenant = tenants.find((t) => t.name === selected)
  const due = tenant ? parseInt(tenant.rent.replace(/[^0-9]/g, ''), 10) : 0

  const handleSubmit = (e) => {
    e.preventDefault()
    setReceiptId(Math.random().toString(36).slice(2, 8).toUpperCase())
    setSubmitted(true)
  }

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="flex items-center gap-3 mb-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{building.name}</span> &mdash; Rent Collection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Record Payment</h3>

          {submitted ? (
            <div>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Payment Recorded</h4>
                  <p className="text-sm text-gray-400">Receipt #{receiptId}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm mb-6">
                {[
                  { label: 'Tenant', value: tenant?.name },
                  { label: 'Amount', value: `UGX ${Number(amount || due).toLocaleString()}` },
                  { label: 'Method', value: method },
                  { label: 'Date', value: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-gray-400">{r.label}</span>
                    <span className="font-medium text-gray-900">{r.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { setAmount(''); setSubmitted(false); setReceiptId('') }}
                className="w-full border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Record Another Payment
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tenant</label>
                <select value={selected} onChange={(e) => { setSelected(e.target.value); setSubmitted(false) }}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none transition-all">
                  {tenants.map((t) => (
                    <option key={t.name} value={t.name}>{t.name} &mdash; {t.unit}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 font-medium mb-1">Monthly Rent</p>
                  <p className="text-xl font-bold text-gray-900">{tenant?.rent || 'UGX 0'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none transition-all" placeholder="Enter amount..." />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="flex gap-2 flex-wrap">
                  {paymentMethods.map((m) => (
                    <button key={m} type="button" onClick={() => setMethod(m)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        method === m ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                      }`}>{m}</button>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                Complete Payment
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-5 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900">Today&rsquo;s Activity</h3>
            <span className="text-xs text-gray-400 font-medium">{activityLog.length} payments</span>
          </div>
          <div className="space-y-3">
            {activityLog.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-blue-600 text-lg">payments</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-medium text-gray-900">{a.tenant}</p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{a.time}</span>
                  </div>
                  <p className="text-xs text-gray-400">{a.method}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm font-semibold text-gray-900">{a.amount}</span>
                    <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">{a.status}</span>
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
