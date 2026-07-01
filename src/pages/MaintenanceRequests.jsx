import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import StatusBadge from '../components/ui/StatusBadge'
import { assigneeInitials, getAssigneeColor, statusLabel } from '../data/helpers'

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
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${getAssigneeColor(item.assignee)}`}>
            {assigneeInitials(item.assignee)}
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

function ListView({ allRequests }) {
  return (
    <div className="bg-surface rounded-card border border-outline overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline bg-surface-container/50">
              {['Request', 'Location', 'Priority', 'Status', 'Assignee', 'Date'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-[11px] text-on-surface-muted font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline">
            {allRequests.map((r) => {
              const sm = statusLabel(r)
              return (
                <tr key={r.id} className="hover:bg-surface-container transition-colors">
                  <td className="px-5 py-3.5 font-medium text-on-surface">{r.title}</td>
                  <td className="px-5 py-3.5 text-on-surface-muted text-xs">
                    {r.floor}{r.unit ? ` - ${r.unit}` : ''}<br />
                    <span className="text-on-surface-dim">{r.tenant}</span>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={r.priority} /></td>
                  <td className="px-5 py-3.5">
                    <span className={`${sm.class} px-2.5 py-1 text-[11px] font-semibold rounded-md`}>{sm.label}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {r.assignee ? (
                        <>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${getAssigneeColor(r.assignee)}`}>
                            {assigneeInitials(r.assignee)}
                          </div>
                          <span className="text-on-surface-muted text-xs">{r.assignee}</span>
                        </>
                      ) : (
                        <span className="text-on-surface-dim text-xs">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-on-surface-dim text-xs">{r.date}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KanbanView({ maintenance }) {
  const columns = [
    { title: 'Pending', items: maintenance.pending },
    { title: 'In Progress', items: maintenance.inProgress },
    { title: 'Resolved', items: maintenance.resolved },
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {columns.map((col) => (
        <div key={col.title} className="bg-surface-container rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4 px-1">
            <h3 className="text-sm font-semibold text-on-surface">{col.title}</h3>
            <span className="text-xs text-on-surface-muted bg-surface border border-outline rounded-md px-2 py-0.5 font-medium">{col.items.length}</span>
          </div>
          <div className="space-y-3">
            {col.items.length > 0 ? col.items.map((item) => <KanbanCard key={item.id} item={item} />) : (
              <div className="text-center py-8 text-on-surface-dim">
                <span className="material-symbols-outlined text-2xl mb-1">check</span>
                <p className="text-xs">No requests</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MaintenanceRequests() {
  const { building, maintenance } = useBuilding()
  const [view, setView] = useState('kanban')
  const allRequests = [...maintenance.pending, ...maintenance.inProgress, ...maintenance.resolved]

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="flex items-center justify-between">
        <p className="text-xs text-on-surface-muted font-medium">{allRequests.length} request{allRequests.length !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-container-highest rounded-lg p-0.5 gap-0.5">
            {['kanban', 'list'].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === v ? 'bg-surface text-on-surface shadow-card' : 'text-on-surface-muted hover:text-on-surface'}`}>
                {v === 'kanban' ? 'Kanban' : 'List'}
              </button>
            ))}
          </div>
          <Link to="/maintenance-board" className="text-xs font-medium text-primary hover:text-primary-600 flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-sm">dashboard</span> Board View
          </Link>
        </div>
      </div>

      {view === 'kanban' ? <KanbanView maintenance={maintenance} /> : <ListView allRequests={allRequests} />}
    </div>
  )
}
