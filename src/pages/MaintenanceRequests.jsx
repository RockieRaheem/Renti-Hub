import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../components/ui/StatusBadge'
import { building, maintenance, priorityBorders } from '../data/currentBuilding'

const allRequests = [...maintenance.pending, ...maintenance.inProgress, ...maintenance.resolved]

function assigneeInitials(name) {
  return name.split(' ').map((w) => w[0]).join('')
}

function getAvatarColor(name) {
  const colors = { 'John Ssempijja': 'bg-blue-100 text-blue-700', 'Sarah Nabatanzi': 'bg-teal-100 text-teal-700' }
  return colors[name] || 'bg-gray-100 text-gray-700'
}

const statusMeta = (r) => {
  if (r.resolution) return { label: 'Resolved', class: 'bg-green-50 text-green-700' }
  if (r.assignee) return { label: 'In Progress', class: 'bg-blue-50 text-blue-700' }
  return { label: 'Pending', class: 'bg-yellow-50 text-yellow-700' }
}

function KanbanCard({ item }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 border-l-4 ${priorityBorders[item.priority] || 'border-l-gray-300'} p-4`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-3">{item.date}</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">{item.tenant}</p>
      <div className="flex items-center justify-between">
        <StatusBadge status={item.priority} />
        {item.assignee && (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${getAvatarColor(item.assignee)}`}>
            {assigneeInitials(item.assignee)}
          </div>
        )}
      </div>
      {item.resolution && (
        <p className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-green-600 font-medium">{item.resolution}</p>
      )}
    </div>
  )
}

function KanbanView() {
  const columns = [
    { title: 'Pending', items: maintenance.pending },
    { title: 'In Progress', items: maintenance.inProgress },
    { title: 'Resolved', items: maintenance.resolved },
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {columns.map((col) => (
        <div key={col.title} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-gray-900">{col.title}</h3>
            <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-md px-2 py-0.5">{col.items.length}</span>
          </div>
          <div className="space-y-3">
            {col.items.map((item) => <KanbanCard key={item.id} item={item} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function ListView() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              {['Request', 'Tenant', 'Priority', 'Status', 'Assignee', 'Date'].map((h) => (
                <th key={h} className="text-left px-6 py-3 text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {allRequests.map((r) => {
              const sm = statusMeta(r)
              return (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.title}</td>
                  <td className="px-6 py-4 text-gray-700">{r.tenant}</td>
                  <td className="px-6 py-4"><StatusBadge status={r.priority} /></td>
                  <td className="px-6 py-4">
                    <span className={`${sm.class} px-2.5 py-1 text-[11px] font-semibold rounded-md`}>{sm.label}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {r.assignee ? (
                        <>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${getAvatarColor(r.assignee)}`}>
                            {assigneeInitials(r.assignee)}
                          </div>
                          <span className="text-gray-500 text-sm">{r.assignee}</span>
                        </>
                      ) : (
                        <span className="text-gray-300 text-sm">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{r.date}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function MaintenanceRequests() {
  const [view, setView] = useState('kanban')

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{building.name}</span> &mdash; {allRequests.length} requests
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center bg-gray-50 rounded-lg p-0.5 gap-0.5">
          {['kanban', 'list'].map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              {v === 'kanban' ? 'Kanban' : 'List'}
            </button>
          ))}
        </div>
        <Link to="/maintenance-board" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">dashboard</span> Board View
        </Link>
      </div>

      {view === 'kanban' ? <KanbanView /> : <ListView />}
    </div>
  )
}
