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

export default function Header() {
  const { pathname } = useLocation()
  const { building } = useBuilding()
  const { maskMode, toggleMask, blurred } = usePrivacy()

  let info = titles[pathname]
  if (!info) {
    if (pathname.startsWith('/properties/floor/') && pathname.includes('/unit/'))
      info = { title: 'Unit Details', subtitle: 'Shop information and tenant details' }
    else if (pathname.startsWith('/properties/floor/'))
      info = { title: 'Floor Overview', subtitle: 'Shops and units on this floor' }
    else
      info = { title: 'RentiHub', subtitle: '' }
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
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-lg">notifications</span>
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-lg">help</span>
          </button>
          <div className="w-px h-5 bg-outline mx-1" />
          <div className="flex items-center gap-2 pl-1">
            {blurred && (
              <span className="w-2 h-2 rounded-full bg-amber-400" title="Window not focused" />
            )}
            {maskMode && (
              <span className="w-2 h-2 rounded-full bg-amber-600" title="Privacy mode active" />
            )}
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
              {building?.name ? building.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'RH'}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
