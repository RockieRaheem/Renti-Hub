export const tenantStats = { total: 124, latePayers: 12, arrears: 'UGX 4.2M', activeLeases: 118 }

export const tenants = [
  { name: 'MTN Uganda HQ', unit: 'The Pearl Towers - Unit 402', lease: '5 years', rent: 'UGX 3,750,000/mo', status: 'Good Payer', paid: true, initials: 'MT' },
  { name: 'Andrew Mukasa', unit: 'Speke Residences - Penthouse B', lease: '2 years', rent: 'UGX 8,500,000/mo', status: 'Neutral Payer', paid: false, initials: 'AM' },
  { name: 'Namuli & Kironde Ltd', unit: 'Kira Plaza - Ground Floor 12A', lease: '3 years', rent: 'UGX 3,200,000/mo', status: 'Bad Payer', paid: false, initials: 'NK' },
  { name: 'Shoprite Uganda', unit: 'Acacia Mall - Retail Block A', lease: '7 years', rent: 'UGX 40,000,000/mo', status: 'Good Payer', paid: true, initials: 'SU' },
  { name: 'Stanbic Bank Uganda', unit: 'Acacia Mall - Retail Block B', lease: '10 years', rent: 'UGX 35,000,000/mo', status: 'Good Payer', paid: true, initials: 'SB' },
  { name: 'Bella Cosmetics Ltd', unit: 'Ham Mall - Shop A', lease: '2 years', rent: 'UGX 10,000,000/mo', status: 'Neutral Payer', paid: true, initials: 'BC' },
  { name: 'Cafe Javas Uganda', unit: 'Ham Mall - Shop B', lease: '4 years', rent: 'UGX 15,000,000/mo', status: 'Good Payer', paid: true, initials: 'CJ' },
  { name: 'Kampala Associates', unit: 'Ham Mall - Office 101', lease: '1 year', rent: 'UGX 12,000,000/mo', status: 'Bad Payer', paid: false, initials: 'KA' },
  { name: 'Food Village Ltd', unit: 'Acacia Mall - Food Court', lease: '5 years', rent: 'UGX 28,000,000/mo', status: 'Good Payer', paid: true, initials: 'FV' },
  { name: 'Uganda Telecom Ltd', unit: 'City Plaza - Office Suite A', lease: '3 years', rent: 'UGX 18,000,000/mo', status: 'Good Payer', paid: true, initials: 'UT' },
]

export const tenantFilters = ['All', 'Good Payer', 'Neutral Payer', 'Bad Payer']

const avatarColors = {
  MT: 'bg-blue-100 text-blue-700',
  AM: 'bg-orange-100 text-orange-700',
  NK: 'bg-red-100 text-red-700',
  SU: 'bg-green-100 text-green-700',
  SB: 'bg-indigo-100 text-indigo-700',
  BC: 'bg-purple-100 text-purple-700',
  CJ: 'bg-teal-100 text-teal-700',
  KA: 'bg-red-100 text-red-700',
  FV: 'bg-cyan-100 text-cyan-700',
  UT: 'bg-blue-100 text-blue-700',
}

export function getAvatarColor(initials) {
  return avatarColors[initials] || 'bg-gray-100 text-gray-700'
}
