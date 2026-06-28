import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../components/ui/StatusBadge'
import { requests } from '../data/maintenance'

const allRequests = [...requests.pending, ...requests.inProgress, ...requests.resolved]

const statusClass = (r) => {
  if (r.resolution) return 'bg-status-paid/10 text-status-paid'
  if (r.assignee && r.assignee !== 'Unassigned') return 'bg-blue-100 text-blue-700'
  return 'bg-yellow-100 text-yellow-700'
}
const statusLabel = (r) => {
  if (r.resolution) return 'Resolved'
  if (r.assignee && r.assignee !== 'Unassigned') return 'In Progress'
  return 'Pending'
}

function KanbanView() {
  const columns = [
    { title: 'Pending', items: requests.pending, color: 'bg-yellow-400' },
    { title: 'In Progress', items: requests.inProgress, color: 'bg-blue-400' },
    { title: 'Resolved', items: requests.resolved, color: 'bg-green-400' },
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((col) => (
        <div key={col.title} className="bg-surface-container-low/50 rounded-2xl p-5 border border-border-subtle">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-3 h-3 rounded-full ${col.color}`} />
            <h3 className="font-bold text-on-surface">{col.title}</h3>
            <span className="ml-auto px-2.5 py-0.5 text-xs font-bold rounded-full bg-white/50 text-on-surface-variant">{col.items.length}</span>
          </div>
          <div className="space-y-4">
            {col.items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-border-subtle shadow-sm p-4 hover:shadow-md transition-shadow">
                <h4 className="font-bold text-sm text-on-surface mb-2">{item.title}</h4>
                <p className="text-xs text-on-surface-variant mb-3">{item.property} - {item.tenant}</p>
                <div className="flex justify-between items-center">
                  <StatusBadge status={item.priority} />
                  <span className="text-[10px] text-on-surface-variant">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ListView() {
  return (
    <div className="bg-white rounded-2xl shadow-premium border border-border-subtle overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-surface-container-low">
          <tr>
            {['Request', 'Property', 'Tenant', 'Priority', 'Status', 'Assignee', 'Date'].map((h) => (
              <th key={h} className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {allRequests.map((r) => (
            <tr key={r.id} className="hover:bg-surface-container-lowest transition-colors">
              <td className="px-6 py-4 font-semibold text-sm text-on-surface">{r.title}</td>
              <td className="px-6 py-4 text-sm text-on-surface-variant">{r.property}</td>
              <td className="px-6 py-4 text-sm">{r.tenant}</td>
              <td className="px-6 py-4"><StatusBadge status={r.priority} /></td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusClass(r)}`}>{statusLabel(r)}</span>
              </td>
              <td className="px-6 py-4 text-sm text-on-surface-variant">{r.assignee}</td>
              <td className="px-6 py-4 text-sm text-on-surface-variant">{r.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function MaintenanceRequests() {
  const [view, setView] = useState('kanban')

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 bg-surface-container-low p-1 rounded-lg">
          <button onClick={() => setView('kanban')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${view === 'kanban' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant'}`}>Kanban</button>
          <button onClick={() => setView('list')} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${view === 'list' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant'}`}>List</button>
        </div>
        <Link to="/maintenance-board" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">dashboard</span> Board View
        </Link>
      </div>
      {view === 'kanban' ? <KanbanView /> : <ListView />}
    </div>
  )
}
