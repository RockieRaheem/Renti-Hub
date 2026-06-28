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
    <aside className="w-64 bg-primary text-white hidden md:flex flex-col shadow-2xl">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-primary font-bold">corporate_fare</span>
        </div>
        <span className="text-xl font-extrabold tracking-tight">RentiHub</span>
      </div>
      <nav className="flex-1 px-4 mt-6 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive ? 'bg-white/10 font-medium' : 'text-white/70 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center text-white font-bold">JK</div>
          <div>
            <p className="text-sm font-semibold">James Kato</p>
            <p className="text-xs text-white/50">Chief Executive</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
