import { NavLink, useNavigate } from 'react-router-dom'
import { useBuilding } from '../../context/BuildingContext'

const links = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/properties', icon: 'groups', label: 'Tenants' },
  { to: '/rent-collection', icon: 'payments', label: 'Rent Collection' },
  { to: '/financial-reports', icon: 'analytics', label: 'Financial Reports' },
  { to: '/maintenance-board', icon: 'build', label: 'Maintenance' },
]

function computeInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function Sidebar({ collapsed, onToggle }) {
  const { auth, logout } = useBuilding()
  const navigate = useNavigate()
  const initials = auth?.name ? computeInitials(auth.name) : '?'
  const displayName = auth?.name || 'Guest'
  const role = auth?.name ? 'Portfolio Manager' : 'Not signed in'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className={`bg-white border-r border-outline transition-all duration-200 hidden md:flex flex-col shrink-0 ${collapsed ? 'w-16' : 'w-56'}`}>
      <div className="px-4 h-14 flex items-center gap-3 border-b border-outline">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
          <span className="material-symbols-outlined text-white text-lg">corporate_fare</span>
        </div>
        {!collapsed && <span className="text-sm font-bold text-on-surface tracking-tight">RentiHub</span>}
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-primary-50 text-primary font-semibold'
                  : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-container-highest/50 active:bg-surface-container'
              }`
            }
          >
            <span className={`material-symbols-outlined text-xl transition-colors shrink-0`}>
              {link.icon}
            </span>
            {!collapsed && <span className="truncate">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-outline">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-1 px-3 py-2 rounded-lg hover:bg-surface-container transition-colors group">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-on-surface truncate leading-tight">{displayName}</p>
                <p className="text-[11px] text-on-surface-muted truncate leading-tight">{role}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="w-6 h-6 rounded-md flex items-center justify-center text-on-surface-dim opacity-0 group-hover:opacity-100 hover:text-status-unpaid hover:bg-red-50 transition-all shrink-0"
              title="Sign out">
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center relative group">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm cursor-pointer">
              {initials}
            </div>
            <button onClick={handleLogout}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-surface border border-outline flex items-center justify-center text-on-surface-dim opacity-0 group-hover:opacity-100 hover:text-status-unpaid transition-all"
              title="Sign out">
              <span className="material-symbols-outlined text-[10px]">logout</span>
            </button>
          </div>
        )}
      </div>

      <button onClick={onToggle} className="hidden lg:flex items-center justify-center h-9 text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors border-t border-outline text-sm">
        <span className="material-symbols-outlined text-lg">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
      </button>
    </aside>
  )
}
