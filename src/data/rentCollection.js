export const collectionStats = { today: 'UGX 1,240,000', week: 'UGX 8,750,000', month: 'UGX 142,800,000', pending: 14 }

export const tenants = [
  { id: 1, name: 'MTN Uganda HQ', unit: 'The Pearl Towers - Unit 402', rent: 3750000, lateFee: 0 },
  { id: 2, name: 'Andrew Mukasa', unit: 'Speke Residences - Penthouse B', rent: 8500000, lateFee: 425000 },
  { id: 3, name: 'Shoprite Uganda', unit: 'Acacia Mall - Retail Block A', rent: 40000000, lateFee: 0 },
  { id: 4, name: 'Stanbic Bank Uganda', unit: 'Acacia Mall - Retail Block B', rent: 35000000, lateFee: 0 },
]

export const paymentMethods = ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque']

export const activityLog = [
  { time: '09:15 AM', tenant: 'MTN Uganda HQ', amount: 'UGX 3,750,000', method: 'Bank Transfer', status: 'completed' },
  { time: '10:30 AM', tenant: 'Cafe Javas Uganda', amount: 'UGX 15,000,000', method: 'Mobile Money', status: 'completed' },
  { time: '11:45 AM', tenant: 'Bella Cosmetics Ltd', amount: 'UGX 10,000,000', method: 'Cash', status: 'completed' },
  { time: '14:00 PM', tenant: 'Uganda Telecom Ltd', amount: 'UGX 18,000,000', method: 'Bank Transfer', status: 'completed' },
]
