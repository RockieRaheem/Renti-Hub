import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useBuilding } from '../../context/BuildingContext'
import { usePrivacy } from '../../context/PrivacyContext'

const titles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Portfolio overview and key metrics' },
  '/properties': { title: 'Tenants', subtitle: 'Browse tenants by floor' },
  '/rent-collection': { title: 'Rent Collection', subtitle: 'Record payments and track balances' },
  '/financial-reports': { title: 'Financial Reports', subtitle: 'Revenue and cash flow analysis' },
  '/maintenance-board': { title: 'Maintenance Board', subtitle: 'Track maintenance requests' },
  '/maintenance-requests': { title: 'Maintenance Requests', subtitle: 'All requests' },
}

function computeInitials(name) {
  return name?.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline">
          <h2 className="text-base font-bold text-on-surface">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function Dropdown({ children, onClose, align = 'right', className = '' }) {
  const ref = useRef()
  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])
  return (
    <div ref={ref} className={`absolute top-full mt-1.5 z-40 bg-white rounded-xl shadow-2xl border border-outline min-w-[200px] overflow-hidden ${align === 'right' ? 'right-0' : 'left-0'} ${className}`}>
      {children}
    </div>
  )
}

export default function Header() {
  const { pathname } = useLocation()
  const { building, auth, updateProfile, logout } = useBuilding()
  const { maskMode, toggleMask, blurred } = usePrivacy()
  const [showProfile, setShowProfile] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  let info = titles[pathname]
  if (!info) {
    if (pathname.startsWith('/properties/floor/') && pathname.includes('/unit/'))
      info = { title: 'Unit Details', subtitle: 'Shop information and tenant details' }
    else if (pathname.startsWith('/properties/floor/'))
      info = { title: 'Floor Overview', subtitle: 'Shops and units on this floor' }
    else
      info = { title: 'RentiHub', subtitle: '' }
  }

  const initials = auth?.name ? computeInitials(auth.name) : (building?.name ? computeInitials(building.name) : 'RH')
  const displayName = auth?.name || building?.name || 'RentiHub'
  const displayEmail = auth?.email || ''

  function handleEditName() {
    setNameInput(auth?.name || '')
    setEditingName(true)
  }

  async function handleSaveName() {
    if (nameInput.trim() && nameInput.trim() !== auth?.name) {
      await updateProfile(nameInput.trim())
    }
    setEditingName(false)
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-outline">
      <div className="px-6 h-14 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-on-surface">{info.title}</h1>
          <p className="text-[11px] text-on-surface-muted mt-px">{info.subtitle}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleMask}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors relative ${maskMode ? 'bg-amber-50 text-amber-600' : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-container'}`}
            title={maskMode ? 'Show amounts' : 'Hide amounts (privacy mode)'}>
            <span className="material-symbols-outlined text-lg">{maskMode ? 'visibility_off' : 'visibility'}</span>
          </button>

          <div className="relative">
            <button onClick={() => { setShowNotifications(v => !v); setShowHelp(false); setShowProfile(false) }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors relative"
              title="Notifications">
              <span className="material-symbols-outlined text-lg">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-status-unpaid"></span>
            </button>
            {showNotifications && (
              <Dropdown onClose={() => setShowNotifications(false)}>
                <div className="p-3 border-b border-outline">
                  <p className="text-xs font-semibold text-on-surface">Notifications</p>
                </div>
                <div className="max-h-[240px] overflow-y-auto">
                  <div className="px-4 py-6 text-center text-on-surface-dim">
                    <span className="material-symbols-outlined text-2xl mb-1 block">notifications_off</span>
                    <p className="text-xs">No notifications yet</p>
                  </div>
                </div>
              </Dropdown>
            )}
          </div>

          <div className="relative">
            <button onClick={() => { setShowHelp(v => !v); setShowNotifications(false); setShowProfile(false) }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors"
              title="Help">
              <span className="material-symbols-outlined text-lg">help</span>
            </button>
            {showHelp && (
              <Dropdown onClose={() => setShowHelp(false)}>
                <div className="p-3 border-b border-outline">
                  <p className="text-xs font-semibold text-on-surface">Help & Resources</p>
                </div>
                <div className="py-1">
                  <HelpItem icon="info" label="About RentiHub" detail="v1.0.0" />
                  <HelpItem icon="shortcut" label="Keyboard Shortcuts" detail="Coming soon" />
                  <HelpItem icon="contact_support" label="Contact Support" detail="support@rentihub.com" />
                  <HelpItem icon="description" label="Documentation" detail="docs.rentihub.com" />
                </div>
              </Dropdown>
            )}
          </div>

          <div className="w-px h-5 bg-outline mx-1" />

          <div className="relative flex items-center gap-2 pl-1">
            {blurred && <span className="w-2 h-2 rounded-full bg-amber-400" title="Window not focused" />}
            {maskMode && <span className="w-2 h-2 rounded-full bg-amber-600" title="Privacy mode active" />}
            <button onClick={() => { setShowProfile(v => !v); setShowNotifications(false); setShowHelp(false) }}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm hover:shadow-md hover:from-primary-600 hover:to-primary-700 transition-all cursor-pointer"
              title={displayName}>
              {initials}
            </button>
            {showProfile && (
              <Dropdown onClose={() => { setShowProfile(false); setEditingName(false) }}>
                <div className="p-4 border-b border-outline">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingName ? (
                        <div className="flex items-center gap-1">
                          <input value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                            className="flex-1 h-7 px-2 border border-outline rounded text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false) }} />
                          <button onClick={handleSaveName} className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center text-xs hover:bg-primary-600">
                            <span className="material-symbols-outlined text-sm">check</span>
                          </button>
                          <button onClick={() => setEditingName(false)} className="w-6 h-6 rounded text-on-surface-muted hover:text-on-surface flex items-center justify-center text-xs">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-on-surface truncate">{displayName}</p>
                      )}
                      <p className="text-[11px] text-on-surface-muted truncate">{displayEmail || 'Portfolio Manager'}</p>
                    </div>
                  </div>
                  {!editingName && (
                    <button onClick={handleEditName}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Edit name
                    </button>
                  )}
                </div>
                <button onClick={() => { logout(); setShowProfile(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-status-unpaid hover:bg-red-50 transition-colors">
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Sign out
                </button>
              </Dropdown>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function HelpItem({ icon, label, detail }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container transition-colors cursor-default">
      <span className="material-symbols-outlined text-lg text-on-surface-muted">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-on-surface">{label}</p>
        <p className="text-[10px] text-on-surface-dim">{detail}</p>
      </div>
    </div>
  )
}
