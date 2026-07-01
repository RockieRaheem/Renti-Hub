import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', icon: 'dashboard', label: 'Executive Dashboard' },
  { to: '/properties', icon: 'apartment', label: 'Properties & Shops' },
  { to: '/tenants', icon: 'groups', label: 'Tenant Directory' },
  { to: '/rent-collection', icon: 'payments', label: 'Rent Collection' },
  { to: '/financial-reports', icon: 'analytics', label: 'Financial Reports' },
  { to: '/maintenance-board', icon: 'build', label: 'Maintenance' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col shrink-0">
      <div className="px-5 h-16 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#0037b0] flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-white text-lg">corporate_fare</span>
        </div>
        <span className="text-base font-bold text-gray-900 tracking-tight">RentiHub</span>
      </div>

      <div className="px-3 py-2">
        <p className="px-3 text-[11px] font-semibold text-gray-300 uppercase tracking-widest mb-1">Main Menu</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative flex items-center">
                  {isActive && (
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-600 rounded-full" />
                  )}
                  <span className={`material-symbols-outlined text-[20px] transition-colors ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}>
                    {link.icon}
                  </span>
                </div>
                <span className="truncate">{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-gray-100 mt-auto">
        <p className="px-3 text-[11px] font-semibold text-gray-300 uppercase tracking-widest mb-2">Account</p>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
            JK
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">James Kato</p>
            <p className="text-xs text-gray-400 truncate">Chief Executive</p>
          </div>
          <span className="material-symbols-outlined text-gray-300 text-lg">more_horiz</span>
        </div>
      </div>
    </aside>
  )
}
