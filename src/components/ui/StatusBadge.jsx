const colorMap = {
  Paid: 'bg-status-paid/10 text-status-paid',
  Partial: 'bg-status-partial/10 text-status-partial',
  Overdue: 'bg-status-unpaid/10 text-status-unpaid',
  'Good Payer': 'bg-status-paid/10 text-status-paid',
  'Neutral Payer': 'bg-status-partial/10 text-status-partial',
  'Bad Payer': 'bg-status-unpaid/10 text-status-unpaid',
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-blue-100 text-blue-700',
  occupied: 'bg-status-paid/10 text-status-paid',
  vacant: 'bg-surface-container-high text-on-surface-variant',
  Operational: 'bg-status-paid/10 text-status-paid',
  Full: 'bg-primary/10 text-primary',
  completed: 'bg-status-paid/10 text-status-paid',
  Pending: 'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-status-paid/10 text-status-paid',
}

export default function StatusBadge({ status, size = 'sm' }) {
  const cls = colorMap[status] || 'bg-surface-container-high text-on-surface-variant'
  const sizing = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'
  return (
    <span className={`${cls} ${sizing} font-bold rounded-full uppercase tracking-tighter inline-flex items-center`}>
      {status}
    </span>
  )
}
