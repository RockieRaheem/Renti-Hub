import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import StatusBadge from '../components/ui/StatusBadge'

const STAFF = ['John Ssempijja', 'Sarah Nabatanzi', 'Peter Wasswa', 'David Okello']

const priorityOptions = ['Low', 'Medium', 'High', 'Critical']
const borderColor = (p) =>
  p === 'Critical' ? 'border-l-red-500'
    : p === 'High' ? 'border-l-orange-500'
    : p === 'Medium' ? 'border-l-yellow-500'
    : 'border-l-blue-400'

function MaintenanceModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline">
          <div>
            <h2 className="text-base font-bold text-on-surface">{title}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

function KanbanCard({ item, status, onUpdate, onMove, onDelete }) {
  return (
    <div className={`bg-surface rounded-lg border border-outline border-l-4 ${borderColor(item.priority)} p-4 shadow-card`}>
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-on-surface leading-snug">{item.title}</h4>
          </div>
          <p className="text-[11px] text-on-surface-muted">
            {item.floor}{item.unit ? ` · ${item.unit}` : ''}{item.tenant ? ` · ${item.tenant}` : ''}
          </p>
        </div>
        <span className="text-[10px] text-on-surface-dim whitespace-nowrap shrink-0">{item.date}</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <StatusBadge status={item.priority} size="sm" />
        {item.assignee && (
          <span className="text-[11px] text-on-surface-muted bg-surface-container-highest rounded px-1.5 py-0.5">{item.assignee}</span>
        )}
      </div>

      {item.resolution && (
        <p className="mb-3 text-[11px] text-status-paid font-medium flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          {item.resolution}
        </p>
      )}

      <div className="flex flex-wrap gap-1 pt-2 border-t border-outline">
        {status === 'pending' && (
          <>
            <ActionBtn icon="person_add" label="Assign" onClick={() => onUpdate(item.id, { showAssign: true })} />
            <ActionBtn icon="play_arrow" label="Start" onClick={() => onMove(item.id, 'pending', 'inProgress')} />
            <ActionBtn icon="edit" label="Edit" onClick={() => onUpdate(item.id, { showEdit: true })} />
            <ActionBtn icon="delete" label="Delete" onClick={() => onDelete(item.id)} destructive />
          </>
        )}
        {status === 'inProgress' && (
          <>
            <ActionBtn icon="person_add" label="Assign" onClick={() => onUpdate(item.id, { showAssign: true })} />
            <ActionBtn icon="check_circle" label="Resolve" onClick={() => onUpdate(item.id, { showResolve: true })} />
            <ActionBtn icon="undo" label="Reopen" onClick={() => onMove(item.id, 'inProgress', 'pending')} />
          </>
        )}
        {status === 'resolved' && (
          <>
            <ActionBtn icon="undo" label="Reopen" onClick={() => onMove(item.id, 'resolved', 'inProgress')} />
          </>
        )}
      </div>
    </div>
  )
}

function ActionBtn({ icon, label, onClick, destructive }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
        destructive
          ? 'text-status-unpaid hover:bg-red-50'
          : 'text-on-surface-muted hover:bg-surface-container hover:text-on-surface'
      }`}>
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {label}
    </button>
  )
}

function KanbanColumn({ title, count, items, status, onUpdate, onMove, onDelete }) {
  return (
    <div className="bg-surface-container rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 px-1 shrink-0">
        <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
        <span className="text-xs text-on-surface-muted bg-surface border border-outline rounded-md px-2 py-0.5 font-medium">{count}</span>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto min-h-[200px]">
        {items.length > 0 ? items.map((item) => (
          <KanbanCard key={item.id} item={item} status={status} onUpdate={onUpdate} onMove={onMove} onDelete={onDelete} />
        )) : (
          <div className="text-center py-10 text-on-surface-dim">
            <span className="material-symbols-outlined text-2xl mb-1">check</span>
            <p className="text-xs">No requests</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MaintenanceBoard() {
  const { building, maintenance, maintenanceStats, addMaintenance, updateMaintenance, moveMaintenance, deleteMaintenance } = useBuilding()
  const [modal, setModal] = useState(null)

  const total = maintenanceStats.pending + maintenanceStats.inProgress + maintenanceStats.resolved
  const columns = [
    { title: 'Pending', key: 'pending', count: maintenanceStats.pending, items: maintenance.pending },
    { title: 'In Progress', key: 'inProgress', count: maintenanceStats.inProgress, items: maintenance.inProgress },
    { title: 'Resolved', key: 'resolved', count: maintenanceStats.resolved, items: maintenance.resolved },
  ]

  function handleUpdate(id, actions) {
    if (actions.showAssign) {
      setModal({ type: 'assign', id })
    } else if (actions.showEdit) {
      const item = [...maintenance.pending, ...maintenance.inProgress, ...maintenance.resolved].find(m => m.id === id)
      if (item) setModal({ type: 'edit', id, data: item })
    } else if (actions.showResolve) {
      setModal({ type: 'resolve', id })
    }
  }

  function handleAssign(id, assignee) {
    updateMaintenance(id, { assignee })
    setModal(null)
  }

  function handleResolve(id, resolution) {
    updateMaintenance(id, { resolution })
    moveMaintenance(id, 'inProgress', 'resolved')
    setModal(null)
  }

  function handleEditSave(id, data) {
    updateMaintenance(id, data)
    setModal(null)
  }

  function handleMove(id, from, to) {
    moveMaintenance(id, from, to)
  }

  function handleDelete(id) {
    if (window.confirm('Delete this maintenance request?')) deleteMaintenance(id)
  }

  const inputClass = 'w-full h-10 px-3.5 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'

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
          <button onClick={() => setModal({ type: 'add' })}
            className="px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-card inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">add</span>
            New Request
          </button>
          <Link to="/maintenance-requests"
            className="text-xs font-medium text-primary hover:text-primary-600 flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-sm">list_alt</span>
            List View
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map((c) => (
          <KanbanColumn
            key={c.key}
            title={c.title}
            count={c.count}
            items={c.items}
            status={c.key}
            onUpdate={handleUpdate}
            onMove={handleMove}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* ─── Assign Modal ─── */}
      {modal?.type === 'assign' && (
        <MaintenanceModal title="Assign Staff" onClose={() => setModal(null)}>
          <p className="text-sm text-on-surface-muted mb-4">Who should handle this request?</p>
          <div className="space-y-1">
            {STAFF.map((name) => (
              <button key={name} onClick={() => handleAssign(modal.id, name)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-outline hover:border-primary/30 hover:bg-primary-50/30 transition-all text-left">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary text-sm font-bold">
                  {name.split(' ').map(w => w[0]).join('')}
                </div>
                <span className="text-sm font-medium text-on-surface">{name}</span>
              </button>
            ))}
          </div>
        </MaintenanceModal>
      )}

      {/* ─── Resolve Modal ─── */}
      {modal?.type === 'resolve' && (
        <MaintenanceModal title="Resolve Request" onClose={() => setModal(null)}>
          <ResolveForm onResolve={(res) => handleResolve(modal.id, res)} onCancel={() => setModal(null)} />
        </MaintenanceModal>
      )}

      {/* ─── Edit Modal ─── */}
      {modal?.type === 'edit' && (
        <MaintenanceModal title="Edit Request" onClose={() => setModal(null)}>
          <EditForm data={modal.data} onSave={(data) => handleEditSave(modal.id, data)} onCancel={() => setModal(null)} />
        </MaintenanceModal>
      )}

      {/* ─── Add Modal ─── */}
      {modal?.type === 'add' && (
        <MaintenanceModal title="New Maintenance Request" onClose={() => setModal(null)}>
          <AddForm floors={building.name ? [building] : []} contextFloors={[]} onSave={(data) => { addMaintenance(data); setModal(null) }} onCancel={() => setModal(null)} />
        </MaintenanceModal>
      )}
    </div>
  )
}

function ResolveForm({ onResolve, onCancel }) {
  const [text, setText] = useState('')
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) onResolve(text.trim()) }} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Resolution Note</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
          className="w-full px-3.5 py-2.5 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          placeholder="What was done to fix this?" required autoFocus />
      </div>
      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2.5 text-sm font-medium text-on-surface-muted hover:bg-surface-container rounded-lg transition-colors">Cancel</button>
        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-card transition-colors">Resolve</button>
      </div>
    </form>
  )
}

function EditForm({ data, onSave, onCancel }) {
  const [title, setTitle] = useState(data?.title || '')
  const [priority, setPriority] = useState(data?.priority || 'Medium')
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ title, priority }) }} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-10 px-3.5 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required autoFocus />
      </div>
      <div>
        <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full h-10 px-3.5 border border-outline rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
          {priorityOptions.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2.5 text-sm font-medium text-on-surface-muted hover:bg-surface-container rounded-lg transition-colors">Cancel</button>
        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-card transition-colors">Save</button>
      </div>
    </form>
  )
}

function AddForm({ floors, contextFloors, onSave, onCancel }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('Medium')
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; onSave({ title: title.trim(), priority, floor: '', unit: '', tenant: '', date: 'Just now', assignee: null, resolution: null }) }} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-10 px-3.5 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="e.g. Leaking tap in Shop 2" required autoFocus />
      </div>
      <div>
        <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full h-10 px-3.5 border border-outline rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
          {priorityOptions.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2.5 text-sm font-medium text-on-surface-muted hover:bg-surface-container rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={!title.trim()} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-card transition-colors disabled:opacity-50">Create Request</button>
      </div>
    </form>
  )
}
