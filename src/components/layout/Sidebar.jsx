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
    <aside className="w-64 bg-[#0b1422] hidden md:flex flex-col shrink-0">
      <div className="px-5 h-16 flex items-center gap-3 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-lg bg-[#0037b0] flex items-center justify-center shadow-lg shadow-blue-600/20">
          <span className="material-symbols-outlined text-white text-lg">corporate_fare</span>
        </div>
        <span className="text-base font-bold text-white tracking-tight">RentiHub</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/10 text-white font-medium shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] active:bg-white/[0.08]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {isActive && (
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-full" />
                  )}
                  <span className={`material-symbols-outlined text-[20px] transition-colors ${
                    isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-300'
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

      <div className="px-3 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
            JK
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">James Kato</p>
            <p className="text-xs text-gray-500 truncate">Chief Executive</p>
          </div>
          <span className="material-symbols-outlined text-gray-600 text-lg ml-auto">more_horiz</span>
        </div>
      </div>
    </aside>
  )
}
