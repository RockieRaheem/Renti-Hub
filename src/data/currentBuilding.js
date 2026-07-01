export const building = {
  id: 1,
  name: 'City Plaza',
  location: 'Nakasero, Kampala',
  type: 'Mixed-Use',
  units: 24,
  occupied: 22,
}

export const kpis = [
  { label: 'Total Units', value: '24' },
  { label: 'Occupied', value: '22' },
  { label: 'Monthly Revenue', value: 'UGX 4.9M' },
  { label: 'Maintenance Open', value: '2' },
]

export const floors = [
  {
    name: 'Ground Floor',
    units: [
      { id: 'G1', name: 'Shop 1', tenant: 'Mukwano Industries', rent: 'UGX 12M/yr', status: 'occupied' },
      { id: 'G2', name: 'Shop 2', tenant: 'Centenary Bank ATM', rent: 'UGX 8M/yr', status: 'occupied' },
      { id: 'G3', name: 'Shop 3', tenant: 'Airtel Uganda', rent: 'UGX 12M/yr', status: 'occupied' },
    ],
  },
  {
    name: '1st Floor',
    units: [
      { id: '1A', name: 'Office Suite A', tenant: 'Uganda Telecom Ltd', rent: 'UGX 18M/yr', status: 'occupied' },
      { id: '1B', name: 'Office Suite B', tenant: 'Vacant', rent: 'UGX 15M/yr', status: 'vacant' },
    ],
  },
  {
    name: '2nd Floor',
    units: [
      { id: '2A', name: 'Conference Centre', tenant: 'Events Uganda', rent: 'UGX 9M/yr', status: 'occupied' },
    ],
  },
]

export const tenants = [
  { name: 'Mukwano Industries', unit: 'Shop 1', lease: '3 years', rent: 'UGX 1,000,000/mo', status: 'Good Payer', paid: true, initials: 'MI', email: 'accounts@mukwano.com', phone: '+256 700 123456', leaseEnd: 'Dec 2027' },
  { name: 'Centenary Bank ATM', unit: 'Shop 2', lease: '5 years', rent: 'UGX 667,000/mo', status: 'Good Payer', paid: true, initials: 'CB', email: 'facilities@centenarybank.co.ug', phone: '+256 712 345678', leaseEnd: 'Jun 2029' },
  { name: 'Airtel Uganda', unit: 'Shop 3', lease: '4 years', rent: 'UGX 1,000,000/mo', status: 'Good Payer', paid: true, initials: 'AU', email: 'property@airtel.co.ug', phone: '+256 755 987654', leaseEnd: 'Mar 2028' },
  { name: 'Uganda Telecom Ltd', unit: 'Office Suite A', lease: '3 years', rent: 'UGX 1,500,000/mo', status: 'Good Payer', paid: true, initials: 'UT', email: 'facilities@utl.co.ug', phone: '+256 754 444555', leaseEnd: 'Oct 2027' },
  { name: 'Events Uganda', unit: 'Conference Centre', lease: '2 years', rent: 'UGX 750,000/mo', status: 'Neutral Payer', paid: false, initials: 'EU', email: 'bookings@eventsuganda.com', phone: '+256 772 333444', leaseEnd: 'Aug 2026' },
]

export const tenantFilters = ['All', 'Good Payer', 'Neutral Payer', 'Bad Payer']

export const maintenance = {
  pending: [
    { id: 1, title: 'Water pipe burst', priority: 'Critical', tenant: 'Mukwano Industries', date: '2 hours ago', assignee: null },
    { id: 2, title: 'Lighting replacement', property: '', priority: 'Low', tenant: 'Uganda Telecom', date: '3 days ago', assignee: 'Sarah Nabatanzi' },
  ],
  inProgress: [
    { id: 3, title: 'HVAC servicing', priority: 'High', tenant: 'Airtel Uganda', date: '5 days ago', assignee: 'John Ssempijja' },
  ],
  resolved: [
    { id: 4, title: 'Plumbing fixture', priority: 'Low', tenant: 'Mukwano Industries', date: '2 weeks ago', assignee: 'John Ssempijja', resolution: 'Replaced washer' },
    { id: 5, title: 'Gate automation', priority: 'Low', tenant: 'Events Uganda', date: '1 month ago', assignee: 'Sarah Nabatanzi', resolution: 'Reprogrammed motor' },
  ],
}

export const maintenanceStats = {
  pending: maintenance.pending.length,
  inProgress: maintenance.inProgress.length,
  resolved: maintenance.resolved.length,
}

export const transactions = [
  { property: 'City Plaza', unit: 'Shop 1', tenant: 'Mukwano Industries', initials: 'MI', badge: 'Paid', amount: 'UGX 1,000,000' },
  { property: 'City Plaza', unit: 'Shop 2', tenant: 'Centenary Bank ATM', initials: 'CB', badge: 'Paid', amount: 'UGX 667,000' },
  { property: 'City Plaza', unit: 'Shop 3', tenant: 'Airtel Uganda', initials: 'AU', badge: 'Paid', amount: 'UGX 1,000,000' },
  { property: 'City Plaza', unit: 'Office Suite A', tenant: 'Uganda Telecom Ltd', initials: 'UT', badge: 'Paid', amount: 'UGX 1,500,000' },
  { property: 'City Plaza', unit: 'Conference Centre', tenant: 'Events Uganda', initials: 'EU', badge: 'Partial', amount: 'UGX 375,000' },
]

export const revenueMonthly = [
  { month: 'Oct', value: 4.2, label: 'UGX 4.2M' },
  { month: 'Nov', value: 4.5, label: 'UGX 4.5M' },
  { month: 'Dec', value: 4.3, label: 'UGX 4.3M' },
  { month: 'Jan', value: 4.9, label: 'UGX 4.9M' },
  { month: 'Feb', value: 5.1, label: 'UGX 5.1M' },
  { month: 'Mar (Est)', value: 4.8, label: 'Proj: UGX 4.8M', projected: true },
]

export const revenueMix = [
  { label: 'Retail Shops', value: 55, color: '#0037b0' },
  { label: 'Office Spaces', value: 30, color: '#F97316' },
  { label: 'Conference', value: 15, color: '#22c55e' },
]

export const cashFlowData = [
  { month: 'Oct', income: 4.2, expenses: 1.2 },
  { month: 'Nov', income: 4.5, expenses: 1.5 },
  { month: 'Dec', income: 4.3, expenses: 1.1 },
  { month: 'Jan', income: 4.9, expenses: 1.8 },
  { month: 'Feb', income: 5.1, expenses: 1.4 },
  { month: 'Mar', income: 4.8, expenses: 1.3 },
]

export const alerts = [
  { type: 'Maintenance', issue: 'Water pipe burst - Shop 1', urgency: 'Urgent', due: 'Today' },
  { type: 'Lease', issue: 'Events Uganda lease renews in 2 months', urgency: 'Upcoming', due: 'Aug 2026' },
  { type: 'Payment', issue: 'Events Uganda partial payment pending', urgency: 'Overdue', due: '3 days ago' },
]

export const upcomingPayments = [
  { tenant: 'Mukwano Industries', amount: 'UGX 1,000,000', due: 'Jul 5' },
  { tenant: 'Airtel Uganda', amount: 'UGX 1,000,000', due: 'Jul 8' },
  { tenant: 'Uganda Telecom Ltd', amount: 'UGX 1,500,000', due: 'Jul 12' },
]

export const activityLog = [
  { time: '09:15 AM', tenant: 'Mukwano Industries', amount: 'UGX 1,000,000', method: 'Bank Transfer', status: 'completed' },
  { time: '11:45 AM', tenant: 'Centenary Bank ATM', amount: 'UGX 667,000', method: 'Mobile Money', status: 'completed' },
  { time: '14:00 PM', tenant: 'Uganda Telecom Ltd', amount: 'UGX 1,500,000', method: 'Bank Transfer', status: 'completed' },
]

export const paymentMethods = ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque']

const avatarColors = {
  MI: 'bg-blue-100 text-blue-700',
  CB: 'bg-green-100 text-green-700',
  AU: 'bg-purple-100 text-purple-700',
  UT: 'bg-teal-100 text-teal-700',
  EU: 'bg-orange-100 text-orange-700',
}

export function getAvatarColor(initials) {
  return avatarColors[initials] || 'bg-gray-100 text-gray-700'
}

export const statusBorders = {
  'Good Payer': 'border-l-green-500',
  'Neutral Payer': 'border-l-yellow-500',
  'Bad Payer': 'border-l-red-500',
}

export const priorityBorders = {
  Critical: 'border-l-red-500',
  High: 'border-l-orange-500',
  Medium: 'border-l-yellow-500',
  Low: 'border-l-blue-400',
}
