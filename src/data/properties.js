export const propertyStats = { total: 3, occupancy: '94.2%', revenue: 'UGX 842M', tenants: 47 }

export const buildings = [
  {
    id: 1, name: 'City Plaza', location: 'Nakasero, Kampala', units: 24, occupied: 22, revenue: 'UGX 312M', status: 'Operational',
    floors: [
      { name: 'Ground Floor', units: [
        { id: 'G1', name: 'Shop 1', tenant: 'Mukwano Industries', rent: 'UGX 12M/yr', status: 'occupied' },
        { id: 'G2', name: 'Shop 2', tenant: 'Centenary Bank ATM', rent: 'UGX 8M/yr', status: 'occupied' },
        { id: 'G3', name: 'Shop 3', tenant: 'Airtel Uganda', rent: 'UGX 12M/yr', status: 'occupied' },
      ]},
      { name: '1st Floor', units: [
        { id: '1A', name: 'Office Suite A', tenant: 'Uganda Telecom Ltd', rent: 'UGX 18M/yr', status: 'occupied' },
        { id: '1B', name: 'Office Suite B', tenant: 'Vacant', rent: 'UGX 15M/yr', status: 'vacant' },
      ]},
      { name: '2nd Floor', units: [
        { id: '2A', name: 'Conference Centre', tenant: 'Events Uganda', rent: 'UGX 9M/yr', status: 'occupied' },
      ]},
    ],
  },
  {
    id: 2, name: 'Ham Mall', location: 'Kampala Road, Central', units: 18, occupied: 17, revenue: 'UGX 285M', status: 'Operational',
    floors: [
      { name: 'Ground Floor', units: [
        { id: 'H1', name: 'Shop A', tenant: 'Bella Cosmetics', rent: 'UGX 10M/yr', status: 'occupied' },
        { id: 'H2', name: 'Shop B', tenant: 'Cafe Javas', rent: 'UGX 15M/yr', status: 'occupied' },
      ]},
      { name: '1st Floor', units: [
        { id: 'H3', name: 'Office 101', tenant: 'Kampala Associates', rent: 'UGX 12M/yr', status: 'occupied' },
        { id: 'H4', name: 'Office 102', tenant: 'Vacant', rent: 'UGX 10M/yr', status: 'vacant' },
      ]},
    ],
  },
  {
    id: 3, name: 'Acacia Mall', location: 'Kololo, Kampala', units: 30, occupied: 30, revenue: 'UGX 245M', status: 'Full',
    floors: [
      { name: 'Ground Floor', units: [
        { id: 'A1', name: 'Retail Block A', tenant: 'Shoprite Uganda', rent: 'UGX 40M/yr', status: 'occupied' },
        { id: 'A2', name: 'Retail Block B', tenant: 'Stanbic Bank', rent: 'UGX 35M/yr', status: 'occupied' },
      ]},
      { name: 'Upper Floor', units: [
        { id: 'A3', name: 'Food Court', tenant: 'Food Village Ltd', rent: 'UGX 28M/yr', status: 'occupied' },
      ]},
    ],
  },
]
