import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import ConfirmModal from '../components/ConfirmModal'

const priorityOptions = ['All', 'Low', 'Medium', 'High', 'Critical']
const statusOptions = ['All', 'Pending', 'In Progress', 'Resolved']
const STAFF = ['John Ssempijja', 'Sarah Nabatanzi', 'Peter Wasswa', 'David Okello']

function priorityColor(p) {
  if (p === 'Critical') return 'bg-red-50 text-red-700'
  if (p === 'High') return 'bg-orange-50 text-orange-700'
  if (p === 'Medium') return 'bg-yellow-50 text-yellow-700'
  return 'bg-blue-50 text-blue-700'
}

function statusColor(s) {
  if (s === 'resolved') return 'bg-green-50 text-green-700'
  if (s === 'in_progress') return 'bg-blue-50 text-blue-700'
  return 'bg-orange-50 text-orange-700'
}

function statusLabel(s) {
  if (s === 'in_progress') return 'In Progress'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const inputClass = 'w-full h-10 px-3.5 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'

export default function MaintenanceRequests() {
  const { maintenance, updateMaintenance, moveMaintenance, deleteMaintenance, addMaintenance, floors } = useBuilding()
  const allItems = [...maintenance.pending, ...maintenance.inProgress, ...maintenance.resolved]
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = allItems.filter((item) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (item.title || '').toLowerCase().includes(q)
      || (item.floor || '').toLowerCase().includes(q)
      || (item.unit || '').toLowerCase().includes(q)
      || (item.tenant || '').toLowerCase().includes(q)
      || (item.assignee || '').toLowerCase().includes(q)
  }).filter((item) => priorityFilter === 'All' || item.priority === priorityFilter)
    .filter((item) => {
      if (statusFilter === 'All') return true
      if (statusFilter === 'Pending') return item.status === 'pending'
      if (statusFilter === 'In Progress') return item.status === 'in_progress'
      if (statusFilter === 'Resolved') return item.status === 'resolved'
      return true
    })

  function handleQuickAction(id, action) {
    const item = allItems.find(m => m.id === id)
    if (!item) return
    if (action === 'start') moveMaintenance(id, 'pending', 'inProgress')
    else if (action === 'reopen') moveMaintenance(id, 'resolved', 'inProgress')
    else if (action === 'reopenPending') moveMaintenance(id, 'inProgress', 'pending')
    else if (action === 'delete') setConfirmDelete({ id, title: 'Delete Request', message: 'Delete this maintenance request? This cannot be undone.' })
    else if (action === 'resolve') setSelected({ type: 'resolve', id, item })
    else if (action === 'assign') setSelected({ type: 'assign', id, item })
    else if (action === 'edit') setSelected({ type: 'edit', id, item })
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
          <p className="text-xs text-on-surface-muted font-medium">
            {search || priorityFilter !== 'All' || statusFilter !== 'All' ? `${filtered.length} of ${allItems.length}` : allItems.length} request{allItems.length !== 1 ? 's' : ''}
          </p>
          <div className="relative flex-1 sm:flex-initial min-w-[200px]">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-dim text-sm pointer-events-none">search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search requests..."
              className="w-full h-8 pl-7 pr-2.5 border border-outline rounded-lg text-xs text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8 px-2.5 border border-outline rounded-lg text-xs text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            {priorityOptions.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 border border-outline rounded-lg text-xs text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/maintenance-board"
            className="px-3.5 py-2 border border-outline text-on-surface-muted text-xs font-semibold rounded-lg hover:bg-surface-container transition-colors inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">view_column</span>
            Board
          </Link>
          <Link to="/maintenance-board"
            className="px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-card inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">add</span>
            New
          </Link>
        </div>
      </div>

      <div className="bg-surface rounded-card border border-outline shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline bg-surface-container/50">
                <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Request</th>
                <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Location</th>
                <th className="text-center px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Priority</th>
                <th className="text-center px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Assignee</th>
                <th className="text-right px-4 py-3 text-[10px] text-on-surface-dim font-semibold uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {filtered.length > 0 ? filtered.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container/50 transition-colors group">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-on-surface text-xs">{r.title}</p>
                    {r.resolution && (
                      <p className="text-[10px] text-status-paid mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[11px]">check_circle</span>
                        {r.resolution}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-on-surface-muted text-xs">
                    {r.floor}{r.unit ? ` - ${r.unit}` : ''}
                    {r.tenant && <span className="text-on-surface-dim"> / {r.tenant}</span>}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${priorityColor(r.priority)}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusColor(r.status)}`}>
                      {statusLabel(r.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {r.assignee ? (
                      <span className="text-xs text-on-surface-muted inline-flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-primary-50 text-primary flex items-center justify-center text-[8px] font-bold">
                          {r.assignee.split(' ').map(w => w[0]).join('')}
                        </span>
                        {r.assignee}
                      </span>
                    ) : (
                      <span className="text-xs text-on-surface-dim">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right text-on-surface-dim text-xs">{r.date}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {r.status === 'pending' && (
                        <ActionBtn icon="play_arrow" onClick={() => handleQuickAction(r.id, 'start')} tooltip="Start" />
                      )}
                      {r.status === 'in_progress' && (
                        <ActionBtn icon="check_circle" onClick={() => handleQuickAction(r.id, 'resolve')} tooltip="Resolve" />
                      )}
                      {r.status === 'resolved' && (
                        <ActionBtn icon="undo" onClick={() => handleQuickAction(r.id, 'reopen')} tooltip="Reopen" />
                      )}
                      {r.status !== 'resolved' && (
                        <ActionBtn icon="person_add" onClick={() => handleQuickAction(r.id, 'assign')} tooltip="Assign" />
                      )}
                      <ActionBtn icon="edit" onClick={() => handleQuickAction(r.id, 'edit')} tooltip="Edit" />
                      <ActionBtn icon="delete" onClick={() => handleQuickAction(r.id, 'delete')} tooltip="Delete" destructive />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-on-surface-dim">
                    <span className="material-symbols-outlined text-3xl mb-1 block">search_off</span>
                    <p className="text-xs">No requests match your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected?.type === 'assign' && (
        <Modal title="Assign Staff" onClose={() => setSelected(null)}>
          <p className="text-sm text-on-surface-muted mb-4">Who should handle this request?</p>
          <div className="space-y-1">
            {STAFF.map((name) => (
              <button key={name} onClick={() => { updateMaintenance(selected.id, { assignee: name }); setSelected(null) }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-outline hover:border-primary/30 hover:bg-primary-50/30 transition-all text-left">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary text-sm font-bold">
                  {name.split(' ').map(w => w[0]).join('')}
                </div>
                <span className="text-sm font-medium text-on-surface">{name}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {selected?.type === 'resolve' && (
        <Modal title="Resolve Request" onClose={() => setSelected(null)}>
          <form onSubmit={(e) => {
            e.preventDefault()
            const text = new FormData(e.target).get('resolution')
            if (text.trim()) {
              updateMaintenance(selected.id, { resolution: text.trim() })
              moveMaintenance(selected.id, 'inProgress', 'resolved')
              setSelected(null)
            }
          }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Resolution Note</label>
              <textarea name="resolution" rows={3} required autoFocus
                className="w-full px-3.5 py-2.5 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                placeholder="What was done?" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setSelected(null)} className="px-4 py-2.5 text-sm font-medium text-on-surface-muted hover:bg-surface-container rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-card transition-colors">Resolve</button>
            </div>
          </form>
        </Modal>
      )}

      {selected?.type === 'edit' && (
        <Modal title="Edit Request" onClose={() => setSelected(null)}>
          <form onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.target)
            updateMaintenance(selected.id, { title: fd.get('title'), priority: fd.get('priority') })
            setSelected(null)
          }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Title</label>
              <input name="title" defaultValue={selected.item.title} className={inputClass} required autoFocus />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Priority</label>
              <select name="priority" defaultValue={selected.item.priority} className={inputClass}>
                {['Low', 'Medium', 'High', 'Critical'].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setSelected(null)} className="px-4 py-2.5 text-sm font-medium text-on-surface-muted hover:bg-surface-container rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-card transition-colors">Save</button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmModal
        isOpen={!!confirmDelete}
        title={confirmDelete?.title || ''}
        message={confirmDelete?.message || ''}
        onConfirm={() => { if (confirmDelete) { deleteMaintenance(confirmDelete.id); setConfirmDelete(null) } }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

function ActionBtn({ icon, onClick, tooltip, destructive }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick() }} title={tooltip}
      className={`w-7 h-7 rounded-md flex items-center justify-center text-sm transition-colors ${
        destructive
          ? 'text-status-unpaid hover:bg-red-50'
          : 'text-on-surface-muted hover:bg-surface-container hover:text-on-surface'
      }`}>
      <span className="material-symbols-outlined text-sm">{icon}</span>
    </button>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline">
          <h2 className="text-base font-bold text-on-surface">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
