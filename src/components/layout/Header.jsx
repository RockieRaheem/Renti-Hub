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
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
      <div className="px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{info.title}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{info.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <span className="material-symbols-outlined text-xl">help</span>
          </button>
          <div className="w-px h-6 bg-gray-100 mx-1" />
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              JK
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-tight">James Kato</p>
              <p className="text-xs text-gray-400 leading-tight">Chief Executive</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
