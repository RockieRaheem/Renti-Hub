export const maintenanceStats = { pending: 4, inProgress: 3, resolved: 5 }

export const requests = {
  pending: [
    { id: 1, title: 'Water pipe burst', property: 'City Plaza', priority: 'Critical', tenant: 'Mukwano Industries', date: '2 hours ago', assignee: null },
    { id: 2, title: 'Elevator malfunction', property: 'Ham Mall', priority: 'High', tenant: 'Cafe Javas', date: '1 day ago', assignee: 'John Ssempijja' },
    { id: 3, title: 'Broken window', property: 'Acacia Mall', priority: 'Medium', tenant: 'Shoprite Uganda', date: '2 days ago', assignee: null },
    { id: 4, title: 'Lighting replacement', property: 'City Plaza', priority: 'Low', tenant: 'Uganda Telecom', date: '3 days ago', assignee: 'Sarah Nabatanzi' },
  ],
  inProgress: [
    { id: 5, title: 'HVAC servicing', property: 'Ham Mall', priority: 'High', tenant: 'Bella Cosmetics', date: '5 days ago', assignee: 'John Ssempijja' },
    { id: 6, title: 'Roof leak repair', property: 'Speke Residences', priority: 'Critical', tenant: 'Andrew Mukasa', date: '3 days ago', assignee: 'Peter Wasswa' },
    { id: 7, title: 'Security camera setup', property: 'Acacia Mall', priority: 'Medium', tenant: 'Stanbic Bank', date: '1 week ago', assignee: 'Sarah Nabatanzi' },
  ],
  resolved: [
    { id: 8, title: 'Plumbing fixture', property: 'City Plaza', priority: 'Low', tenant: 'Mukwano Industries', date: '2 weeks ago', assignee: 'John Ssempijja', resolution: 'Replaced washer' },
    { id: 9, title: 'Electrical fault', property: 'Ham Mall', priority: 'High', tenant: 'Kampala Associates', date: '2 weeks ago', assignee: 'Peter Wasswa', resolution: 'Rewired circuit' },
    { id: 10, title: 'AC unit repair', property: 'Acacia Mall', priority: 'Medium', tenant: 'Food Village Ltd', date: '3 weeks ago', assignee: 'John Ssempijja', resolution: 'Replaced compressor' },
    { id: 11, title: 'Gate automation', property: 'City Plaza', priority: 'Low', tenant: 'Events Uganda', date: '1 month ago', assignee: 'Sarah Nabatanzi', resolution: 'Reprogrammed motor' },
    { id: 12, title: 'Paint touch-up', property: 'Ham Mall', priority: 'Low', tenant: 'Cafe Javas', date: '1 month ago', assignee: 'Peter Wasswa', resolution: 'Completed' },
  ],
}

function initials(name) {
  return name.split(' ').map((w) => w[0]).join('')
}

const assigneeColors = {
  'John Ssempijja': 'bg-blue-100 text-blue-700',
  'Peter Wasswa': 'bg-purple-100 text-purple-700',
  'Sarah Nabatanzi': 'bg-teal-100 text-teal-700',
}

export function getAssigneeColor(name) {
  return assigneeColors[name] || 'bg-gray-100 text-gray-700'
}

export function assigneeInitials(name) {
  return initials(name)
}

export const priorityBorders = {
  Critical: 'border-l-red-500',
  High: 'border-l-orange-500',
  Medium: 'border-l-yellow-500',
  Low: 'border-l-blue-400',
}
