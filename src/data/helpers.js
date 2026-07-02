export function assigneeInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
}

const assigneePalette = {
  'John Ssempijja': 'bg-blue-100 text-blue-700',
  'Sarah Nabatanzi': 'bg-teal-100 text-teal-700',
  'Peter Wasswa': 'bg-purple-100 text-purple-700',
}

export function getAssigneeColor(name) {
  return assigneePalette[name] || 'bg-gray-100 text-gray-700'
}

export function statusLabel(item) {
  const s = item.status
  if (s === 'resolved' || item.resolution) return { label: 'Resolved', class: 'bg-green-50 text-green-700' }
  if (s === 'in_progress' || item.assignee) return { label: 'In Progress', class: 'bg-blue-50 text-blue-700' }
  return { label: 'Pending', class: 'bg-yellow-50 text-yellow-700' }
}
