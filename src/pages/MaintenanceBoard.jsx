import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'

const STAFF = ['John Ssempijja', 'Sarah Nabatanzi', 'Peter Wasswa', 'David Okello']
const priorityOptions = ['Low', 'Medium', 'High', 'Critical']

function KpiCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-surface rounded-card border border-outline p-4 shadow-card">
      <div className="flex items-center justify-between mb-2.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent || 'bg-primary-50'}`}>
          <span className="material-symbols-outlined text-xl" style={{ color: accent ? '#1a1a2e' : undefined }}>{icon}</span>
        </div>
      </div>
      <p className="text-xl font-bold text-on-surface mb-0.5 tracking-tight">{value}</p>
      <p className="text-[11px] text-on-surface-muted">{label}</p>
      {sub && <p className="text-[10px] text-on-surface-dim mt-0.5">{sub}</p>}
    </div>
  )
}

function priorityBorder(p) {
  return p === 'Critical' ? 'border-l-red-500'
    : p === 'High' ? 'border-l-orange-500'
    : p === 'Medium' ? 'border-l-yellow-500'
    : 'border-l-blue-400'
}

function priorityColor(p) {
  if (p === 'Critical') return 'bg-red-50 text-red-700'
  if (p === 'High') return 'bg-orange-50 text-orange-700'
  if (p === 'Medium') return 'bg-yellow-50 text-yellow-700'
  return 'bg-blue-50 text-blue-700'
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-on-surface">{title}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const inputClass = 'w-full h-10 px-3.5 border border-outline rounded-lg text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'

export default function MaintenanceBoard() {
  const { floors, maintenance, maintenanceStats, addMaintenance, updateMaintenance, moveMaintenance, deleteMaintenance } = useBuilding()
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [view, setView] = useState('kanban')

  const allItems = [...maintenance.pending, ...maintenance.inProgress, ...maintenance.resolved]
  const criticalCount = allItems.filter((i) => i.priority === 'Critical' && i.status !== 'resolved').length

  function matchesSearch(item) {
    if (!search) return true
    const q = search.toLowerCase()
    return (item.title || '').toLowerCase().includes(q)
      || (item.floor || '').toLowerCase().includes(q)
      || (item.unit || '').toLowerCase().includes(q)
      || (item.tenant || '').toLowerCase().includes(q)
      || (item.assignee || '').toLowerCase().includes(q)
  }

  function matchesPriority(item) {
    return priorityFilter === 'all' || item.priority === priorityFilter
  }

  const filterItems = (items) => items.filter(matchesSearch).filter(matchesPriority)

  const filteredPending = filterItems(maintenance.pending)
  const filteredInProgress = filterItems(maintenance.inProgress)
  const filteredResolved = filterItems(maintenance.resolved)
  const filteredTotal = filteredPending.length + filteredInProgress.length + filteredResolved.length

  const columns = [
    { title: 'Pending', key: 'pending', count: filteredPending.length, items: filteredPending, emptyIcon: 'pending_actions', emptyText: 'No pending requests' },
    { title: 'In Progress', key: 'inProgress', count: filteredInProgress.length, items: filteredInProgress, emptyIcon: 'engineering', emptyText: 'No work in progress' },
    { title: 'Resolved', key: 'resolved', count: filteredResolved.length, items: filteredResolved, emptyIcon: 'check_circle', emptyText: 'No resolved requests' },
  ]

  function handleUpdate(id, actions) {
    if (actions.showAssign) setModal({ type: 'assign', id })
    else if (actions.showEdit) {
      const item = allItems.find(m => m.id === id)
      if (item) setModal({ type: 'edit', id, data: item })
    } else if (actions.showResolve) setModal({ type: 'resolve', id })
  }

  function handleAssign(id, assignee) { updateMaintenance(id, { assignee }); setModal(null) }
  function handleResolve(id, resolution) { updateMaintenance(id, { resolution }); moveMaintenance(id, 'inProgress', 'resolved'); setModal(null) }
  function handleEditSave(id, data) { updateMaintenance(id, data); setModal(null) }
  function handleMove(id, from, to) { moveMaintenance(id, from, to) }
  function handleDelete(id) { if (window.confirm('Delete this maintenance request?')) deleteMaintenance(id) }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <KpiCard icon="build" label="Total Requests" value={allItems.length} sub="All time" />
        <KpiCard icon="pending_actions" label="Pending" value={maintenance.pending.length} sub={criticalCount > 0 ? `${criticalCount} critical` : 'No critical items'} accent={maintenance.pending.length > 0 ? 'bg-orange-50' : 'bg-green-50'} />
        <KpiCard icon="engineering" label="In Progress" value={maintenance.inProgress.length} sub="Being worked on" accent={maintenance.inProgress.length > 0 ? 'bg-blue-50' : 'bg-green-50'} />
        <KpiCard icon="check_circle" label="Resolved" value={maintenanceStats.resolved} sub="Completed" accent={maintenanceStats.resolved > 0 ? 'bg-green-50' : 'bg-surface-container'} />
        <KpiCard icon="warning" label="Critical" value={criticalCount} sub={criticalCount > 0 ? 'Needs immediate attention' : 'None'} accent={criticalCount > 0 ? 'bg-red-50' : 'bg-green-50'} />
        <KpiCard icon="trending_up" label="Resolution Rate" value={allItems.length > 0 ? `${Math.round((maintenanceStats.resolved / allItems.length) * 100)}%` : '—'} sub={`${maintenanceStats.resolved} of ${allItems.length} resolved`} />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
          <p className="text-xs text-on-surface-muted font-medium">
            {search || priorityFilter !== 'all' ? `${filteredTotal} of ${allItems.length}` : allItems.length} request{(allItems.length) !== 1 ? 's' : ''}
          </p>
          <div className="relative flex-1 sm:flex-initial min-w-[180px]">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-dim text-sm pointer-events-none">search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, floor, tenant..."
              className="w-full h-8 pl-7 pr-2.5 border border-outline rounded-lg text-xs text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8 px-2.5 border border-outline rounded-lg text-xs text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            <option value="all">All Priorities</option>
            {priorityOptions.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface-container-highest rounded-lg p-0.5 gap-0.5">
            {['kanban', 'list'].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${view === v ? 'bg-surface text-on-surface shadow-card' : 'text-on-surface-muted hover:text-on-surface'}`}>
                {v === 'kanban' ? <span className="material-symbols-outlined text-sm align-middle mr-1">view_column</span> : <span className="material-symbols-outlined text-sm align-middle mr-1">list</span>}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => setModal({ type: 'add' })}
            className="px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-card inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">add</span>
            New Request
          </button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {columns.map((col) => (
            <div key={col.key} className="bg-surface-container rounded-lg p-4 flex flex-col min-h-[300px]">
              <div className="flex items-center gap-2 mb-4 px-1 shrink-0">
                <h3 className="text-sm font-semibold text-on-surface">{col.title}</h3>
                <span className="text-[11px] text-on-surface-muted bg-surface border border-outline rounded-md px-2 py-0.5 font-medium">{col.count}</span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {col.items.length > 0 ? col.items.map((item) => (
                  <div key={item.id}
                    className={`bg-surface rounded-lg border border-outline border-l-4 ${priorityBorder(item.priority)} p-4 shadow-card hover:shadow-card-hover transition-shadow`}>
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-on-surface leading-snug">{item.title}</h4>
                        <p className="text-[11px] text-on-surface-muted mt-0.5">
                          {item.floor}{item.unit ? ` · ${item.unit}` : ''}{item.tenant ? ` · ${item.tenant}` : ''}
                        </p>
                      </div>
                      <span className="text-[10px] text-on-surface-dim whitespace-nowrap shrink-0">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${priorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      {item.assignee && (
                        <span className="text-[11px] text-on-surface-muted bg-surface-container-highest rounded px-1.5 py-0.5 inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">person</span>
                          {item.assignee}
                        </span>
                      )}
                    </div>
                    {item.resolution && (
                      <p className="mb-3 text-[11px] text-status-paid font-medium flex items-center gap-1 bg-green-50/50 rounded px-2 py-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        {item.resolution}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 pt-2.5 border-t border-outline">
                      {col.key === 'pending' && (
                        <>
                          <ActionBtn icon="person_add" label="Assign" onClick={() => handleUpdate(item.id, { showAssign: true })} />
                          <ActionBtn icon="play_arrow" label="Start" onClick={() => handleMove(item.id, 'pending', 'inProgress')} />
                          <ActionBtn icon="edit" label="Edit" onClick={() => handleUpdate(item.id, { showEdit: true })} />
                          <ActionBtn icon="delete" label="Delete" onClick={() => handleDelete(item.id)} destructive />
                        </>
                      )}
                      {col.key === 'inProgress' && (
                        <>
                          <ActionBtn icon="person_add" label="Assign" onClick={() => handleUpdate(item.id, { showAssign: true })} />
                          <ActionBtn icon="check_circle" label="Resolve" onClick={() => handleUpdate(item.id, { showResolve: true })} />
                          <ActionBtn icon="undo" label="Reopen" onClick={() => handleMove(item.id, 'inProgress', 'pending')} />
                        </>
                      )}
                      {col.key === 'resolved' && (
                        <>
                          <ActionBtn icon="info" label="Details" onClick={() => handleUpdate(item.id, { showEdit: true })} />
                          <ActionBtn icon="undo" label="Reopen" onClick={() => handleMove(item.id, 'resolved', 'inProgress')} />
                        </>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-12 text-on-surface-dim">
                    <span className="material-symbols-outlined text-3xl mb-2">{col.emptyIcon}</span>
                    <p className="text-xs">{col.emptyText}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
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
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {allItems.filter(matchesSearch).filter(matchesPriority).length > 0 ? allItems.filter(matchesSearch).filter(matchesPriority).map((r) => (
                  <tr key={r.id} className="hover:bg-surface-container/50 transition-colors group">
                    <td className="px-4 py-3 font-medium text-on-surface text-xs">{r.title}</td>
                    <td className="px-4 py-3 text-on-surface-muted text-xs">
                      {r.floor}{r.unit ? ` - ${r.unit}` : ''}
                      {r.tenant && <span className="text-on-surface-dim"> · {r.tenant}</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${priorityColor(r.priority)}`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        r.status === 'resolved' ? 'bg-green-50 text-green-700' :
                        r.status === 'in_progress' ? 'bg-blue-50 text-blue-700' :
                        'bg-orange-50 text-orange-700'
                      }`}>
                        {r.status === 'in_progress' ? 'In Progress' : r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.assignee ? (
                        <span className="text-xs text-on-surface-muted inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-on-surface-dim">person</span>
                          {r.assignee}
                        </span>
                      ) : (
                        <span className="text-xs text-on-surface-dim">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface-dim text-xs">{r.date}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {r.status === 'pending' && (
                          <ActionBtn icon="play_arrow" label="" onClick={() => handleMove(r.id, 'pending', 'inProgress')} />
                        )}
                        {r.status === 'in_progress' && (
                          <ActionBtn icon="check_circle" label="" onClick={() => handleUpdate(r.id, { showResolve: true })} />
                        )}
                        {r.status !== 'resolved' && (
                          <ActionBtn icon="person_add" label="" onClick={() => handleUpdate(r.id, { showAssign: true })} />
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-on-surface-dim">
                      <span className="material-symbols-outlined text-3xl mb-1 block">search_off</span>
                      <p className="text-xs">No requests match your filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal?.type === 'assign' && (
        <Modal title="Assign Staff" onClose={() => setModal(null)}>
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
        </Modal>
      )}

      {modal?.type === 'resolve' && (
        <Modal title="Resolve Request" onClose={() => setModal(null)}>
          <ResolveForm onResolve={(res) => handleResolve(modal.id, res)} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal?.type === 'edit' && (
        <Modal title="Edit Request" onClose={() => setModal(null)}>
          <EditForm data={modal.data} onSave={(data) => handleEditSave(modal.id, data)} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal?.type === 'add' && (
        <Modal title="New Maintenance Request" onClose={() => setModal(null)}>
          <AddForm floors={floors} onSave={(data) => { addMaintenance(data); setModal(null) }} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </div>
  )
}

function ActionBtn({ icon, label, onClick, destructive }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick() }}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
        destructive
          ? 'text-status-unpaid hover:bg-red-50'
          : 'text-on-surface-muted hover:bg-surface-container hover:text-on-surface'
      } ${!label ? 'p-1.5' : ''}`}>
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {label}
    </button>
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
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required autoFocus />
      </div>
      <div>
        <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass}>
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

function AddForm({ floors, onSave, onCancel }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [floorName, setFloorName] = useState('')
  const [unitName, setUnitName] = useState('')
  const [tenantName, setTenantName] = useState('')

  const selectedFloor = floors.find((f) => f.name === floorName)
  const units = selectedFloor?.units || []
  const unit = units.find((u) => u.name === unitName)

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      if (!title.trim()) return
      onSave({
        title: title.trim(),
        priority,
        floor: floorName,
        unit: unitName,
        tenant: tenantName || unit?.tenant?.name || '',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        assignee: null,
        resolution: null,
      })
    }} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Leaking tap in Shop 2" required autoFocus />
      </div>
      <div>
        <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass}>
          {priorityOptions.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {floors.length > 0 && (
        <>
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Floor</label>
            <select value={floorName} onChange={(e) => { setFloorName(e.target.value); setUnitName(''); setTenantName('') }} className={inputClass}>
              <option value="">Select floor...</option>
              {floors.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
            </select>
          </div>
          {floorName && units.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wide mb-1.5">Unit (optional)</label>
              <select value={unitName} onChange={(e) => { setUnitName(e.target.value); setTenantName(e.target.value ? '' : tenantName) }} className={inputClass}>
                <option value="">Entire floor</option>
                {units.map((u) => (
                  <option key={u.id} value={u.name}>{u.name}{u.tenant ? ` — ${u.tenant.name}` : ''}</option>
                ))}
              </select>
            </div>
          )}
        </>
      )}
      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2.5 text-sm font-medium text-on-surface-muted hover:bg-surface-container rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={!title.trim()} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg shadow-card transition-colors disabled:opacity-50">Create Request</button>
      </div>
    </form>
  )
}
