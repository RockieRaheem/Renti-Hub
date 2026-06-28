export const kpis = [
  { label: 'Total Portfolio Value', value: 'UGX 4.2B', trend: '+12.5% vs LY', icon: 'account_balance_wallet', positive: true },
  { label: 'Occupancy Rate', value: '94.2%', trend: '+2.1% from Q4', icon: 'domain', positive: true },
  { label: 'Monthly Revenue', value: 'UGX 185M', trend: 'Steady trend', icon: 'savings', positive: null },
  { label: 'Maintenance Costs', value: 'UGX 12.4M', trend: '+4.8% (Budget alert)', icon: 'engineering', positive: false },
]

export const revenueData = [
  { month: 'Oct', value: 140, label: 'UGX 140M' },
  { month: 'Nov', value: 165, label: 'UGX 165M' },
  { month: 'Dec', value: 155, label: 'UGX 155M' },
  { month: 'Jan', value: 190, label: 'UGX 190M' },
  { month: 'Feb', value: 210, label: 'UGX 210M' },
  { month: 'Mar (Est)', value: 180, label: 'Proj: UGX 180M', projected: true },
]

export const regions = [
  { name: 'Nakasero Business District', pct: 98 },
  { name: 'Kololo Residential', pct: 92 },
  { name: 'Naguru Heightlands', pct: 85 },
  { name: 'Bugolobi Estate', pct: 78 },
]

export const transactions = [
  { property: 'The Pearl Towers', unit: 'Unit 402 - Commercial', type: 'Commercial', tenant: 'MTN Uganda HQ', initials: 'MT', badge: 'Paid', amount: 'UGX 45,000,000' },
  { property: 'Speke Residences', unit: 'Penthouse B - Luxury', type: 'Residential', tenant: 'Andrew Mukasa', initials: 'AM', badge: 'Partial', amount: 'UGX 8,500,000' },
  { property: 'Kira Plaza', unit: 'Ground Floor 12A - Retail', type: 'Retail', tenant: 'Namuli & Kironde Ltd', initials: 'NK', badge: 'Overdue', amount: 'UGX 3,200,000' },
]
