export const kpis = [
  { label: 'Total Portfolio Value', value: 'UGX 4.2B', trend: '+12.5% vs LY' },
  { label: 'Occupancy Rate', value: '94.2%', trend: '+2.1% from Q4' },
  { label: 'Monthly Revenue', value: 'UGX 185M', trend: 'Steady trend' },
  { label: 'Maintenance Costs', value: 'UGX 12.4M', trend: '+4.8% (Budget alert)' },
]

export const revenueMonthly = [
  { month: 'Oct', value: 140, label: 'UGX 140M' },
  { month: 'Nov', value: 165, label: 'UGX 165M' },
  { month: 'Dec', value: 155, label: 'UGX 155M' },
  { month: 'Jan', value: 190, label: 'UGX 190M' },
  { month: 'Feb', value: 210, label: 'UGX 210M' },
  { month: 'Mar (Est)', value: 180, label: 'Proj: UGX 180M', projected: true },
]

export const revenueQuarterly = [
  { month: 'Q1', value: 450, label: 'UGX 450M' },
  { month: 'Q2', value: 520, label: 'UGX 520M' },
  { month: 'Q3', value: 495, label: 'UGX 495M' },
  { month: 'Q4 (Est)', value: 560, label: 'Proj: UGX 560M', projected: true },
]

export const revenueYearly = [
  { month: '2021', value: 1280, label: 'UGX 1.28B' },
  { month: '2022', value: 1520, label: 'UGX 1.52B' },
  { month: '2023', value: 1810, label: 'UGX 1.81B' },
  { month: '2024', value: 2100, label: 'UGX 2.10B' },
  { month: '2025 (Est)', value: 2450, label: 'Proj: UGX 2.45B', projected: true },
]

export const regions = [
  { name: 'Nakasero Business District', pct: 98 },
  { name: 'Kololo Residential', pct: 92 },
  { name: 'Naguru Heightlands', pct: 85 },
  { name: 'Bugolobi Estate', pct: 78 },
]

export const occupancyBreakdown = [
  { label: 'Commercial', value: 92, color: '#0037b0' },
  { label: 'Residential', value: 87, color: '#F97316' },
  { label: 'Retail', value: 78, color: '#22c55e' },
]

export const transactions = [
  { property: 'The Pearl Towers', unit: 'Unit 402 - Commercial', type: 'Commercial', tenant: 'MTN Uganda HQ', initials: 'MT', badge: 'Paid', amount: 'UGX 45,000,000' },
  { property: 'Speke Residences', unit: 'Penthouse B - Luxury', type: 'Residential', tenant: 'Andrew Mukasa', initials: 'AM', badge: 'Partial', amount: 'UGX 8,500,000' },
  { property: 'Kira Plaza', unit: 'Ground Floor 12A - Retail', type: 'Retail', tenant: 'Namuli & Kironde Ltd', initials: 'NK', badge: 'Overdue', amount: 'UGX 3,200,000' },
  { property: 'Victoria Courts', unit: 'Block C - Unit 7', type: 'Residential', tenant: 'Sarah Nabatanzi', initials: 'SN', badge: 'Paid', amount: 'UGX 1,800,000' },
  { property: 'Garden City Mall', unit: 'Kiosk 14', type: 'Retail', tenant: 'Fresh Foods Ltd', initials: 'FF', badge: 'Paid', amount: 'UGX 5,600,000' },
]

export const alerts = [
  { type: 'Maintenance', property: 'Speke Residences', issue: 'Water pump failure', urgency: 'Urgent', due: 'Today' },
  { type: 'Lease', property: 'Kira Plaza', issue: 'Lease renewal pending', urgency: 'Upcoming', due: 'In 7 days' },
  { type: 'Inspection', property: 'Naguru Heightlands', issue: 'Annual inspection overdue', urgency: 'Overdue', due: '3 days ago' },
]

export const upcomingPayments = [
  { tenant: 'J. Kato', property: 'Victoria Courts', amount: 'UGX 2,400,000', due: 'Jul 5' },
  { tenant: 'M. Ssali', property: 'Naguru Heightlands', amount: 'UGX 5,800,000', due: 'Jul 8' },
  { tenant: 'R. Nambi', property: 'Bugolobi Estate', amount: 'UGX 3,200,000', due: 'Jul 12' },
]
