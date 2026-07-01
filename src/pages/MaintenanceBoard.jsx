import { Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import StatusBadge from '../components/ui/StatusBadge'
import { assigneeInitials, getAssigneeColor } from '../data/helpers'

function KanbanCard({ item }) {
  const borderColor = item.priority === 'Critical' ? 'border-l-red-500'
    : item.priority === 'High' ? 'border-l-orange-500'
    : item.priority === 'Medium' ? 'border-l-yellow-500'
    : 'border-l-blue-400'

  return (
    <div className={`bg-surface rounded-lg border border-outline border-l-4 ${borderColor} p-4 shadow-card hover:shadow-card-hover transition-shadow`}>
      <div className="flex items-start justify-between mb-2 gap-2">
        <h4 className="text-sm font-semibold text-on-surface leading-snug">{item.title}</h4>
        <span className="text-[10px] text-on-surface-dim whitespace-nowrap shrink-0">{item.date}</span>
      </div>
      <p className="text-xs text-on-surface-muted mb-3">
        {item.floor}{item.unit ? ` \u00b7 ${item.unit}` : ''}
        {item.tenant ? ` \u00b7 ${item.tenant}` : ''}
      </p>
      <div className="flex items-center justify-between">
        <StatusBadge status={item.priority} />
        {item.assignee && (
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${getAssigneeColor(item.assignee)}`}>
              {assigneeInitials(item.assignee)}
            </div>
            <span className="text-xs text-on-surface-muted hidden sm:inline">{item.assignee}</span>
          </div>
        )}
      </div>
      {item.resolution && (
        <p className="mt-3 pt-3 border-t border-outline text-[11px] text-status-paid font-medium flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          {item.resolution}
        </p>
      )}
    </div>
  )
}

function KanbanColumn({ title, count, items }) {
  return (
    <div className="bg-surface-container rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4 px-1">
        <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
        <span className="text-xs text-on-surface-muted bg-surface border border-outline rounded-md px-2 py-0.5 font-medium">{count}</span>
      </div>
      <div className="space-y-3">
        {items.length > 0 ? items.map((item) => <KanbanCard key={item.id} item={item} />) : (
          <div className="text-center py-8 text-on-surface-dim">
            <span className="material-symbols-outlined text-2xl mb-1">check</span>
            <p className="text-xs">No requests</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MaintenanceBoard() {
  const { building, maintenance, maintenanceStats } = useBuilding()
  const columns = [
    { title: 'Pending', count: maintenanceStats.pending, items: maintenance.pending },
    { title: 'In Progress', count: maintenanceStats.inProgress, items: maintenance.inProgress },
    { title: 'Resolved', count: maintenanceStats.resolved, items: maintenance.resolved },
  ]
  const total = maintenanceStats.pending + maintenanceStats.inProgress + maintenanceStats.resolved

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="grid grid-cols-3 gap-4">
        {columns.map((c) => (
          <div key={c.title} className="bg-surface rounded-card border border-outline p-5 shadow-card">
            <p className="text-xs text-on-surface-muted font-medium mb-0.5">{c.title}</p>
            <p className="text-2xl font-bold text-on-surface">{c.count}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-on-surface-muted">{total} total request{total !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-3">
          <Link to="/maintenance-requests"
            className="text-xs font-medium text-primary hover:text-primary-600 flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-sm">list_alt</span>
            List View
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map((c) => (
          <KanbanColumn key={c.title} title={c.title} count={c.count} items={c.items} />
        ))}
      </div>
    </div>
  )
}
