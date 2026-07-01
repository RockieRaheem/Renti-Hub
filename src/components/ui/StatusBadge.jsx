const colorMap = {
  Paid: 'bg-green-50 text-green-700',
  Partial: 'bg-yellow-50 text-yellow-700',
  Overdue: 'bg-red-50 text-red-700',
  'Good Payer': 'bg-green-50 text-green-700',
  'Neutral Payer': 'bg-yellow-50 text-yellow-700',
  'Bad Payer': 'bg-red-50 text-red-700',
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-blue-100 text-blue-700',
  occupied: 'bg-green-50 text-green-700',
  vacant: 'bg-gray-100 text-gray-500',
  Operational: 'bg-green-50 text-green-700',
  Full: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-green-50 text-green-700',
}

export default function StatusBadge({ status, size = 'sm' }) {
  const cls = colorMap[status] || 'bg-gray-100 text-gray-500'
  const sizing = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'
  return (
    <span className={`${cls} ${sizing} font-bold rounded-full uppercase tracking-tighter inline-flex items-center`}>
      {status}
    </span>
  )
}
