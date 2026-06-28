import { useLocation } from 'react-router-dom'

const titles = {
  '/dashboard': { title: 'Executive Dashboard', subtitle: 'Reporting period: Oct 2023 - Mar 2024' },
  '/properties': { title: 'Property & Shop Management', subtitle: 'Oversee all buildings, floors, and shop units' },
  '/tenants': { title: 'Tenant Directory', subtitle: 'Manage all tenant profiles across properties' },
  '/rent-collection': { title: 'Rent Collection', subtitle: 'Record payments, print receipts, track balances' },
  '/financial-reports': { title: 'Financial Reports', subtitle: 'Revenue insights, collection rates, and cash flow' },
  '/maintenance-board': { title: 'Maintenance Board', subtitle: 'Track and manage maintenance requests' },
  '/maintenance-requests': { title: 'Maintenance Requests', subtitle: 'Alternate Kanban view of all requests' },
}

export default function Header() {
  const { pathname } = useLocation()
  const info = titles[pathname] || { title: 'RentiHub', subtitle: '' }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border-subtle px-8 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-primary">{info.title}</h1>
        <p className="text-sm text-on-surface-variant font-medium">{info.subtitle}</p>
      </div>
    </header>
  )
}
