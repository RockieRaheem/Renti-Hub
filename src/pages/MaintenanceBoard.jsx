import { Link } from 'react-router-dom'
import StatusBadge from '../components/ui/StatusBadge'
import { maintenanceStats, requests } from '../data/maintenance'

const priorityColor = { Critical: 'border-l-red-500', High: 'border-l-orange-500', Medium: 'border-l-yellow-500', Low: 'border-l-blue-500' }

function KanbanCard({ item }) {
  return (
    <div className={`bg-white rounded-xl border border-border-subtle shadow-sm p-4 border-l-4 ${priorityColor[item.priority] || 'border-l-gray-300'} hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-sm text-on-surface">{item.title}</h4>
        <span className="material-symbols-outlined text-on-surface-variant text-[18px] cursor-grab">drag_indicator</span>
      </div>
      <p className="text-xs text-on-surface-variant mb-3">{item.property} - {item.tenant}</p>
      <div className="flex justify-between items-center">
        <StatusBadge status={item.priority} />
        <span className="text-[10px] text-on-surface-variant">{item.date}</span>
      </div>
      {item.assignee && item.assignee !== 'Unassigned' && (
        <div className="mt-3 pt-3 border-t border-border-subtle flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
            {item.assignee.split(' ').map((w) => w[0]).join('')}
          </div>
          <span className="text-[10px] text-on-surface-variant">{item.assignee}</span>
        </div>
      )}
      {item.resolution && (
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <p className="text-[10px] text-status-paid font-medium">Resolution: {item.resolution}</p>
        </div>
      )}
    </div>
  )
}

function KanbanColumn({ title, count, color, items }) {
  return (
    <div className="bg-surface-container-low/50 rounded-2xl p-5 border border-border-subtle">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <h3 className="font-bold text-on-surface">{title}</h3>
        <span className={`ml-auto px-2.5 py-0.5 text-xs font-bold rounded-full ${color}/10 text-on-surface-variant`}>{count}</span>
      </div>
      <div className="space-y-4 min-h-[300px]">
        {items.map((item) => <KanbanCard key={item.id} item={item} />)}
      </div>
    </div>
  )
}

export default function MaintenanceBoard() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          {[
            { label: 'Pending', value: maintenanceStats.pending, color: 'bg-yellow-400' },
            { label: 'In Progress', value: maintenanceStats.inProgress, color: 'bg-blue-400' },
            { label: 'Resolved', value: maintenanceStats.resolved, color: 'bg-green-400' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-premium border border-border-subtle">
              <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
              <span className="text-sm text-on-surface-variant">{s.label}</span>
              <span className="font-bold text-on-surface">{s.value}</span>
            </div>
          ))}
        </div>
        <Link to="/maintenance-requests" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">swap_view</span> List View
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KanbanColumn title="Pending" count={requests.pending.length} color="bg-yellow-400" items={requests.pending} />
        <KanbanColumn title="In Progress" count={requests.inProgress.length} color="bg-blue-400" items={requests.inProgress} />
        <KanbanColumn title="Resolved" count={requests.resolved.length} color="bg-green-400" items={requests.resolved} />
      </div>
    </div>
  )
}
