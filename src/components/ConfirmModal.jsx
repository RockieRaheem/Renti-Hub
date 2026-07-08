import { useEffect, useRef } from 'react'

export default function ConfirmModal({ isOpen, title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel', onConfirm, onCancel, danger = true }) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => confirmRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onCancel?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel?.() }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs mx-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}>
        <div className="p-5 text-center">
          <div className={`w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center ${danger ? 'bg-red-50' : 'bg-surface-container'}`}>
            <span className={`material-symbols-outlined ${danger ? 'text-status-unpaid' : 'text-on-surface-dim'}`}>
              {danger ? 'delete_forever' : 'help'}
            </span>
          </div>
          <h3 className="text-sm font-bold text-on-surface mb-1">{title}</h3>
          <p className="text-xs text-on-surface-muted leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center gap-2 px-5 pb-5">
          <button onClick={onCancel}
            className="flex-1 h-9 text-xs font-medium text-on-surface-muted hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors">
            {cancelLabel}
          </button>
          <button ref={confirmRef} onClick={onConfirm}
            className={`flex-1 h-9 text-xs font-semibold text-white rounded-lg shadow-card transition-colors inline-flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${danger ? 'bg-status-unpaid hover:bg-red-700 focus:ring-red-400' : 'bg-primary hover:bg-primary-600 focus:ring-primary/30'}`}>
            <span className="material-symbols-outlined text-sm">{danger ? 'delete' : 'check'}</span>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
