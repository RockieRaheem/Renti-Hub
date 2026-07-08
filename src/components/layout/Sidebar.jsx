import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useNavigate } from 'react-router-dom'
import { useBuilding } from '../../context/BuildingContext'
import PrivacySettings from '../PrivacySettings'

const sections = [
  {
    label: 'Overview',
    links: [
      { to: '/dashboard', icon: 'dashboard', label: 'Dashboard', desc: 'Portfolio overview, KPIs, and recent activity at a glance' },
      { to: '/properties', icon: 'groups', label: 'Tenants', desc: 'Browse tenants by floor, manage occupancy and lease details' },
      { to: '/rent-collection', icon: 'payments', label: 'Rent Collection', desc: 'Record payments, track balances, and manage billing periods' },
    ],
  },
  {
    label: 'Analytics',
    links: [
      { to: '/financial-reports', icon: 'analytics', label: 'Financial Reports', desc: 'Revenue analytics, cash flow trends, and payment method breakdowns' },
    ],
  },
  {
    label: 'Operations',
    links: [
      { to: '/maintenance-board', icon: 'build', label: 'Maintenance', desc: 'Track, assign, and resolve maintenance requests across all floors' },
      { to: '/stellar-dashboard', icon: 'verified', label: 'Stellar Notary', desc: 'Cryptographic proof of payment integrity on Stellar blockchain' },
    ],
  },
]

function computeInitials(name) {
  return name?.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function NavTooltip({ link, style }) {
  return (
    <div style={style} className="fixed -translate-y-1/2 z-[9999] pointer-events-none">
      <div className="px-3 py-1.5 bg-white text-on-surface rounded-[8px] shadow-lg border border-outline whitespace-nowrap">
        <p className="text-xs font-semibold">{link.label}</p>
      </div>
    </div>
  )
}

export default function Sidebar({ collapsed, onToggle }) {
  const { building, auth, logout } = useBuilding()
  const navigate = useNavigate()
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef()

  const [tooltip, setTooltip] = useState(null)
  const tooltipTimer = useRef()
  const itemRefs = useRef({})

  useEffect(() => {
    function handleClick(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = auth?.name ? computeInitials(auth.name) : (building?.name ? computeInitials(building.name) : 'RH')
  const displayName = auth?.name || building?.name || 'RentiHub'
  const displayEmail = auth?.email || ''
  const flatLinks = sections.flatMap(s => s.links)

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  const showTooltip = useCallback((i) => {
    clearTimeout(tooltipTimer.current)
    const el = itemRefs.current[i]
    if (!el) return
    const rect = el.getBoundingClientRect()
    setTooltip({ link: flatLinks[i], left: rect.right + 12, top: rect.top + rect.height / 2 })
  }, [flatLinks])

  const hideTooltip = useCallback(() => {
    tooltipTimer.current = setTimeout(() => setTooltip(null), 100)
  }, [])

  let linkIndex = 0

  return (
    <aside
      className={`bg-white border-r border-outline transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hidden md:flex flex-col shrink-0 ${
        collapsed ? 'w-[60px]' : 'w-60'
      }`}
    >
      {/* ── Brand ── */}
      <div className={`flex items-center gap-3 h-16 px-4 border-b border-outline/60 shrink-0 ${collapsed ? 'justify-center px-0' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-primary-600 flex items-center justify-center shadow-sm ring-1 ring-black/[0.06] shrink-0">
          <span className="material-symbols-outlined text-white text-xl">corporate_fare</span>
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-on-surface tracking-tight">RentiHub</p>
            {building?.name && (
              <p className="text-[10px] text-on-surface-dim truncate leading-tight mt-px">{building.name}</p>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2.5 space-y-5">
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[10px] font-semibold text-on-surface-dim uppercase tracking-[0.12em] select-none">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const currentIndex = linkIndex++
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/dashboard'}
                    ref={(el) => { itemRefs.current[currentIndex] = el }}
                    onMouseEnter={() => collapsed && showTooltip(currentIndex)}
                    onMouseLeave={hideTooltip}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm transition-all duration-200 ${
                        collapsed ? 'justify-center' : ''
                      } ${
                        isActive
                          ? 'bg-primary-50/80 text-primary font-semibold shadow-sm'
                          : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-container-high active:bg-surface-container-highest'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <>
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-primary rounded-r-full shadow-sm shadow-primary/30" />
                            <span className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary/30" />
                          </>
                        )}
                        <span className={`material-symbols-outlined text-[20px] shrink-0 transition-all duration-200 ${
                          isActive ? 'scale-105' : 'group-hover:scale-105'
                        }`}>
                          {link.icon}
                        </span>
                        {!collapsed && (
                          <span className={`truncate transition-all duration-200 ${
                            isActive ? 'translate-x-px' : ''
                          }`}>
                            {link.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Collapsed Tooltip Portal ── */}
      {collapsed && tooltip !== null && createPortal(
        <NavTooltip link={tooltip.link} style={{ left: tooltip.left, top: tooltip.top }} />,
        document.body
      )}

      {/* ── Bottom Section ── */}
      <div className="shrink-0 px-2.5 pb-1 border-t border-outline/60 pt-1.5">
        <button onClick={() => setShowPrivacy(true)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm text-on-surface-muted hover:text-on-surface hover:bg-surface-container-high transition-all duration-200 ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Privacy & Security">
          <span className="material-symbols-outlined text-[20px] shrink-0">shield</span>
          {!collapsed && <span className="truncate">Privacy & Security</span>}
        </button>
      </div>

      {/* ── Profile ── */}
      <div className="relative shrink-0 px-2.5 pb-2.5">
        <button onClick={() => setMenuOpen(v => !v)}
          className={`w-full flex items-center rounded-[10px] transition-all duration-200 ${
            collapsed
              ? 'justify-center p-2 hover:bg-surface-container-high'
              : 'gap-3 px-3 py-2 hover:bg-surface-container-high'
          }`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-primary to-primary-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm ring-2 ring-white/60 shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-medium text-on-surface truncate leading-tight">{displayName}</p>
                <p className="text-[10px] text-on-surface-dim truncate leading-tight">{displayEmail || 'Portfolio Manager'}</p>
              </div>
              <span className={`material-symbols-outlined text-[18px] text-on-surface-dim/50 transition-all duration-200 ${
                menuOpen ? 'rotate-180 text-on-surface-dim' : ''
              }`}>
                expand_more
              </span>
            </>
          )}
        </button>

        {menuOpen && (
          <div ref={menuRef}
            className={`absolute bottom-full mb-1.5 bg-white rounded-xl shadow-xl border border-outline overflow-hidden z-50 ${
              collapsed ? 'left-1/2 -translate-x-1/2 min-w-[200px]' : 'left-2 right-2'
            }`}
          >
            <div className="px-4 py-3 border-b border-outline/60 bg-gradient-to-r from-[#fafafa] to-white">
              <p className="text-sm font-semibold text-on-surface truncate">{displayName}</p>
              {displayEmail && <p className="text-[11px] text-on-surface-dim truncate mt-0.5">{displayEmail}</p>}
            </div>
            <div className="py-1">
              <button onClick={() => { setMenuOpen(false); setShowPrivacy(true) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-muted hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[18px]">shield</span>
                Privacy & Security
              </button>
            </div>
            <div className="border-t border-outline/60">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-status-unpaid hover:bg-red-50 transition-colors">
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Collapse Toggle ── */}
      <button onClick={onToggle}
        className="hidden lg:flex items-center justify-center h-9 gap-2 text-[11px] font-medium text-on-surface-dim hover:text-on-surface hover:bg-surface-container-high transition-all duration-200 border-t border-outline/60 shrink-0"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        <span className="material-symbols-outlined text-lg transition-transform duration-300">
          {collapsed ? 'chevron_right' : 'chevron_left'}
        </span>
        {!collapsed && <span>Collapse</span>}
      </button>

      {showPrivacy && <PrivacySettings onClose={() => setShowPrivacy(false)} />}
    </aside>
  )
}
