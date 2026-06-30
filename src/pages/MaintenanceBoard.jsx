import { Link } from 'react-router-dom'
import StatusBadge from '../components/ui/StatusBadge'
import { maintenanceStats, requests, getAssigneeColor, assigneeInitials, priorityBorders } from '../data/maintenance'

function KanbanCard({ item }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 border-l-4 ${priorityBorders[item.priority] || 'border-l-gray-300'} p-4`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-3">{item.date}</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">{item.property} &middot; {item.tenant}</p>
      <div className="flex items-center justify-between">
        <StatusBadge status={item.priority} />
        {item.assignee && (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${getAssigneeColor(item.assignee)}`}>
            {assigneeInitials(item.assignee)}
          </div>
        )}
      </div>
      {item.resolution && (
        <p className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-green-600 font-medium">
          Resolution: {item.resolution}
        </p>
      )}
    </div>
  )
}

function KanbanColumn({ title, count, items }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-md px-2 py-0.5">{count}</span>
      </div>
      <div className="space-y-3">
        {items.map((item) => <KanbanCard key={item.id} item={item} />)}
      </div>
    </div>
  )
}

export default function MaintenanceBoard() {
  const columns = [
    { title: 'Pending', count: maintenanceStats.pending, items: requests.pending },
    { title: 'In Progress', count: maintenanceStats.inProgress, items: requests.inProgress },
    { title: 'Resolved', count: maintenanceStats.resolved, items: requests.resolved },
  ]

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="grid grid-cols-3 gap-4">
        {columns.map((c) => (
          <div key={c.title} className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-medium mb-0.5">{c.title}</p>
            <p className="text-2xl font-bold text-gray-900">{c.count}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{maintenanceStats.pending + maintenanceStats.inProgress + maintenanceStats.resolved} total requests</p>
        <Link to="/maintenance-requests" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">list_alt</span>
          List View
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map((c) => (
          <KanbanColumn key={c.title} title={c.title} count={c.count} items={c.items} />
        ))}
      </div>
    </div>
  )
}
