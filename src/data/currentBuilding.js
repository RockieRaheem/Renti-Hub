export const building = {
  id: 1,
  name: 'City Plaza',
  location: 'Nakasero, Kampala',
  type: 'Mixed-Use',
}

export const floors = [
  {
    name: 'Ground Floor',
    units: [
      {
        id: 'G1', name: 'Shop 1', type: 'Retail', size: '45 sqm', rent: 'UGX 12M/yr', monthlyRent: 1000000,
        status: 'occupied',
        tenant: {
          name: 'Mukwano Industries', initials: 'MI', email: 'accounts@mukwano.com', phone: '+256 700 123456',
          leaseStart: 'Jan 2025', leaseEnd: 'Dec 2027', leaseTerm: '3 years',
          paymentStatus: 'Good Payer', paid: true, lastPayment: 'UGX 1,000,000', lastPaymentDate: 'Jul 1, 2026',
        },
      },
      {
        id: 'G2', name: 'Shop 2', type: 'Retail', size: '38 sqm', rent: 'UGX 8M/yr', monthlyRent: 667000,
        status: 'occupied',
        tenant: {
          name: 'Centenary Bank ATM', initials: 'CB', email: 'facilities@centenarybank.co.ug', phone: '+256 712 345678',
          leaseStart: 'Jun 2024', leaseEnd: 'Jun 2029', leaseTerm: '5 years',
          paymentStatus: 'Good Payer', paid: true, lastPayment: 'UGX 667,000', lastPaymentDate: 'Jun 28, 2026',
        },
      },
      {
        id: 'G3', name: 'Shop 3', type: 'Retail', size: '42 sqm', rent: 'UGX 12M/yr', monthlyRent: 1000000,
        status: 'occupied',
        tenant: {
          name: 'Airtel Uganda', initials: 'AU', email: 'property@airtel.co.ug', phone: '+256 755 987654',
          leaseStart: 'Mar 2024', leaseEnd: 'Mar 2028', leaseTerm: '4 years',
          paymentStatus: 'Good Payer', paid: true, lastPayment: 'UGX 1,000,000', lastPaymentDate: 'Jul 2, 2026',
        },
      },
    ],
  },
  {
    name: '1st Floor',
    units: [
      {
        id: '1A', name: 'Office Suite A', type: 'Office', size: '120 sqm', rent: 'UGX 18M/yr', monthlyRent: 1500000,
        status: 'occupied',
        tenant: {
          name: 'Uganda Telecom Ltd', initials: 'UT', email: 'facilities@utl.co.ug', phone: '+256 754 444555',
          leaseStart: 'Oct 2024', leaseEnd: 'Oct 2027', leaseTerm: '3 years',
          paymentStatus: 'Good Payer', paid: true, lastPayment: 'UGX 1,500,000', lastPaymentDate: 'Jul 1, 2026',
        },
      },
      {
        id: '1B', name: 'Office Suite B', type: 'Office', size: '100 sqm', rent: 'UGX 15M/yr', monthlyRent: 1250000,
        status: 'vacant',
        tenant: null,
      },
    ],
  },
  {
    name: '2nd Floor',
    units: [
      {
        id: '2A', name: 'Conference Centre', type: 'Event Space', size: '200 sqm', rent: 'UGX 9M/yr', monthlyRent: 750000,
        status: 'occupied',
        tenant: {
          name: 'Events Uganda', initials: 'EU', email: 'bookings@eventsuganda.com', phone: '+256 772 333444',
          leaseStart: 'Aug 2024', leaseEnd: 'Aug 2026', leaseTerm: '2 years',
          paymentStatus: 'Neutral Payer', paid: false, lastPayment: 'UGX 375,000', lastPaymentDate: 'Jun 15, 2026',
        },
      },
    ],
  },
]

// Derived totals
export const totalUnits = floors.reduce((s, f) => s + f.units.length, 0)
export const occupiedUnits = floors.reduce((s, f) => s + f.units.filter((u) => u.status === 'occupied').length, 0)
export const vacantUnits = totalUnits - occupiedUnits
export const monthlyRevenue = floors.reduce((s, f) => s + f.units.reduce((us, u) => us + (u.status === 'occupied' ? u.monthlyRent : 0), 0), 0)

export const kpis = [
  { label: 'Total Units', value: String(totalUnits) },
  { label: 'Occupied', value: String(occupiedUnits) },
  { label: 'Monthly Revenue', value: `UGX ${(monthlyRevenue / 1000000).toFixed(1)}M` },
  { label: 'Vacant', value: String(vacantUnits) },
]

// Flat tenant list derived from floors
export const tenants = floors.flatMap((f) =>
  f.units.filter((u) => u.tenant).map((u) => ({
    ...u.tenant,
    unit: u.name,
    floor: f.name,
    rent: `UGX ${u.monthlyRent.toLocaleString()}/mo`,
    unitType: u.type,
    unitSize: u.size,
    unitRent: u.rent,
  }))
)

export const tenantStats = {
  total: tenants.length,
  latePayers: tenants.filter((t) => !t.paid).length,
  arrears: `UGX ${tenants.filter((t) => !t.paid).reduce((s, t) => s + parseInt(t.rent.replace(/[^0-9]/g, ''), 10), 0).toLocaleString()}`,
  activeLeases: tenants.filter((t) => t.paid).length,
}

export const tenantFilters = ['All', 'Good Payer', 'Neutral Payer', 'Bad Payer']

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
  { label: 'Event Space', value: 15, color: '#22c55e' },
]

export const cashFlowData = [
  { month: 'Oct', income: 4.2, expenses: 1.2 },
  { month: 'Nov', income: 4.5, expenses: 1.5 },
  { month: 'Dec', income: 4.3, expenses: 1.1 },
  { month: 'Jan', income: 4.9, expenses: 1.8 },
  { month: 'Feb', income: 5.1, expenses: 1.4 },
  { month: 'Mar', income: 4.8, expenses: 1.3 },
]

// Payment transactions derived from floors
export const transactions = floors.flatMap((f) =>
  f.units.filter((u) => u.tenant && u.tenant.paid).map((u) => ({
    unit: u.name, floor: f.name, tenant: u.tenant.name, initials: u.tenant.initials,
    badge: 'Paid', amount: `UGX ${u.monthlyRent.toLocaleString()}`,
  }))
)
transactions.push({
  unit: 'Conference Centre', floor: '2nd Floor', tenant: 'Events Uganda', initials: 'EU',
  badge: 'Partial', amount: 'UGX 375,000',
})

export const alerts = [
  { type: 'Maintenance', issue: 'Water pipe burst - Ground Floor Shop 1', urgency: 'Urgent', due: 'Today' },
  { type: 'Lease', issue: 'Events Uganda (2nd Floor) lease renews Aug 2026', urgency: 'Upcoming', due: 'Aug 2026' },
  { type: 'Payment', issue: 'Events Uganda partial payment pending', urgency: 'Overdue', due: '3 days ago' },
]

export const upcomingPayments = [
  { tenant: 'Mukwano Industries', unit: 'Shop 1', floor: 'Ground Floor', amount: 'UGX 1,000,000', due: 'Jul 5' },
  { tenant: 'Airtel Uganda', unit: 'Shop 3', floor: 'Ground Floor', amount: 'UGX 1,000,000', due: 'Jul 8' },
  { tenant: 'Uganda Telecom Ltd', unit: 'Office Suite A', floor: '1st Floor', amount: 'UGX 1,500,000', due: 'Jul 12' },
]

export const activityLog = [
  { time: '09:15 AM', tenant: 'Mukwano Industries', unit: 'Shop 1', floor: 'Ground Floor', amount: 'UGX 1,000,000', method: 'Bank Transfer', status: 'completed' },
  { time: '11:45 AM', tenant: 'Centenary Bank ATM', unit: 'Shop 2', floor: 'Ground Floor', amount: 'UGX 667,000', method: 'Mobile Money', status: 'completed' },
  { time: '14:00 PM', tenant: 'Uganda Telecom Ltd', unit: 'Office Suite A', floor: '1st Floor', amount: 'UGX 1,500,000', method: 'Bank Transfer', status: 'completed' },
]

export const paymentMethods = ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque']

export const maintenance = {
  pending: [
    { id: 1, title: 'Water pipe burst', floor: 'Ground Floor', unit: 'Shop 1', priority: 'Critical', tenant: 'Mukwano Industries', date: '2 hours ago', assignee: null },
    { id: 2, title: 'Lighting replacement', floor: '1st Floor', unit: 'Office Suite A', priority: 'Low', tenant: 'Uganda Telecom', date: '3 days ago', assignee: 'Sarah Nabatanzi' },
  ],
  inProgress: [
    { id: 3, title: 'HVAC servicing', floor: 'Ground Floor', unit: 'Shop 3', priority: 'High', tenant: 'Airtel Uganda', date: '5 days ago', assignee: 'John Ssempijja' },
  ],
  resolved: [
    { id: 4, title: 'Plumbing fixture', floor: 'Ground Floor', unit: 'Shop 1', priority: 'Low', tenant: 'Mukwano Industries', date: '2 weeks ago', assignee: 'John Ssempijja', resolution: 'Replaced washer' },
    { id: 5, title: 'Gate automation', floor: 'Ground Floor', priority: 'Low', tenant: 'Events Uganda', date: '1 month ago', assignee: 'Sarah Nabatanzi', resolution: 'Reprogrammed motor' },
  ],
}

export const maintenanceStats = {
  pending: maintenance.pending.length,
  inProgress: maintenance.inProgress.length,
  resolved: maintenance.resolved.length,
}

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
