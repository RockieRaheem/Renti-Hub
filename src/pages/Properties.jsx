import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import { floorSlug } from '../data/currentBuilding'
import StatusBadge from '../components/ui/StatusBadge'
import TenantFormModal from '../components/TenantFormModal'
import FloorFormModal from '../components/FloorFormModal'

const floorStyles = [
  {
    icon: 'storefront',
    gradient: 'from-amber-800 to-amber-600',
    lightBg: 'bg-amber-50',
    iconBg: 'bg-white/15',
    iconShadow: 'shadow-amber-800/15',
    accent: 'text-amber-700',
    chipFloor: 'bg-amber-100 text-amber-800',
  },
  {
    icon: 'business',
    gradient: 'from-slate-800 to-slate-600',
    lightBg: 'bg-slate-50',
    iconBg: 'bg-white/15',
    iconShadow: 'shadow-slate-800/15',
    accent: 'text-slate-700',
    chipFloor: 'bg-slate-100 text-slate-800',
  },
  {
    icon: 'celebration',
    gradient: 'from-rose-800 to-rose-600',
    lightBg: 'bg-rose-50',
    iconBg: 'bg-white/15',
    iconShadow: 'shadow-rose-800/15',
    accent: 'text-rose-700',
    chipFloor: 'bg-rose-100 text-rose-800',
  },
  {
    icon: 'layers',
    gradient: 'from-emerald-800 to-emerald-600',
    lightBg: 'bg-emerald-50',
    iconBg: 'bg-white/15',
    iconShadow: 'shadow-emerald-800/15',
    accent: 'text-emerald-700',
    chipFloor: 'bg-emerald-100 text-emerald-800',
  },
  {
    icon: 'stacked_line_chart',
    gradient: 'from-cyan-800 to-cyan-600',
    lightBg: 'bg-cyan-50',
    iconBg: 'bg-white/15',
    iconShadow: 'shadow-cyan-800/15',
    accent: 'text-cyan-700',
    chipFloor: 'bg-cyan-100 text-cyan-800',
  },
  {
    icon: 'grid_view',
    gradient: 'from-orange-800 to-orange-600',
    lightBg: 'bg-orange-50',
    iconBg: 'bg-white/15',
    iconShadow: 'shadow-orange-800/15',
    accent: 'text-orange-700',
    chipFloor: 'bg-orange-100 text-orange-800',
  },
]

export default function Properties() {
  const { building, floors, totalUnits, occupiedUnits, monthlyRevenue } = useBuilding()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [floorModal, setFloorModal] = useState(null)

  const q = search.toLowerCase().trim()

  const filteredFloors = useMemo(() => {
    if (!q) return floors
    return floors
      .map((floor) => ({
        ...floor,
        units: floor.units.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            (u.tenant && u.tenant.name.toLowerCase().includes(q)),
        ),
      }))
      .filter((f) => f.units.length > 0)
  }, [floors, q])

  const closeModal = () => setModal(null)

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Units', value: totalUnits, icon: 'door_front' },
          { label: 'Occupied', value: occupiedUnits, icon: 'check_circle' },
          { label: 'Vacant', value: totalUnits - occupiedUnits, icon: 'meeting_room' },
          { label: 'Monthly Revenue', value: `UGX ${(monthlyRevenue / 1000000).toFixed(1)}M`, icon: 'trending_up' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <span className="material-symbols-outlined text-gray-300 text-xl">{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-800/15 shrink-0">
          <span className="material-symbols-outlined text-white text-2xl">groups</span>
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900">{building.name}</h2>
          <p className="text-sm text-gray-400 truncate">{building.location}</p>
        </div>
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>{occupiedUnits} occupied</span>
          </div>
          <div className="h-5 w-px bg-gray-200" />
          <StatusBadge status={building.type} />
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-lg pointer-events-none">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenants or units..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFloorModal({ mode: 'add' })}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 text-sm font-semibold rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add_business</span>
            Add Floor
          </button>
          <button
            onClick={() => setModal({ mode: 'add' })}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Add Tenant
          </button>
        </div>
        {q && (
          <span className="text-xs text-gray-400">
            {filteredFloors.reduce((s, f) => s + f.units.length, 0)} result{(filteredFloors.reduce((s, f) => s + f.units.length, 0)) !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredFloors.map((floor, index) => {
          const occ = floor.units.filter((u) => u.status === 'occupied').length
          const vac = floor.units.length - occ
          const rev = floor.units.reduce((s, u) => s + (u.status === 'occupied' ? u.monthlyRent : 0), 0)
          const pct = floor.units.length ? Math.round((occ / floor.units.length) * 100) : 0
          const style = floorStyles[index % floorStyles.length]

          return (
            <div key={floor.name} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="relative">
                <Link to={`/properties/floor/${floorSlug(floor.name)}`} className="block">
                  <div className={`bg-gradient-to-r ${style.gradient} p-5 pb-6 relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }} />
                    <div className="flex items-start justify-between relative">
                      <div className={`w-12 h-12 rounded-2xl ${style.iconBg} backdrop-blur-sm flex items-center justify-center shadow-lg ${style.iconShadow}`}>
                        <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>{style.icon}</span>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-semibold text-white tracking-wide">
                        {pct}% occupied
                      </div>
                    </div>
                    <h3 className="text-white text-xl font-bold mt-4 relative">{floor.name}</h3>
                    <p className="text-white/70 text-sm mt-0.5 relative">{floor.units.length} units &middot; {building.name}</p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setFloorModal({ mode: 'edit', floorName: floor.name }) }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm text-white/80 hover:bg-white/30 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20"
                  title="Edit floor"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
              </div>

              <div className="p-5 -mt-2 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{occ}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Occupied</p>
                    </div>
                    <div className="w-px h-8 bg-gray-100" />
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-300">{vac}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Vacant</p>
                    </div>
                    <div className="w-px h-8 bg-gray-100" />
                    <div className="text-center">
                      <p className={`text-lg font-bold ${style.accent}`}>{pct}%</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Full</p>
                    </div>
                  </div>
                  <div className={style.lightBg + ' rounded-lg px-3 py-2 text-center'}>
                    <p className={`text-sm font-bold ${style.accent}`}>UGX {(rev / 1000000).toFixed(1)}M</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wide">Revenue</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  {floor.units.map((unit) => (
                    <div
                      key={unit.id}
                      className={`flex-1 h-2 rounded-full transition-all duration-300 group-hover:scale-y-150 ${
                        unit.status === 'occupied' ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      title={`${unit.name}: ${unit.status}`}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {floor.units.map((unit) => {
                    const hasTenant = !!unit.tenant
                    return (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() =>
                          setModal(
                            hasTenant
                              ? { mode: 'edit', floorName: floor.name, unitId: unit.id, data: unit.tenant }
                              : { mode: 'add', floorName: floor.name, unitId: unit.id },
                          )
                        }
                        className={`group/chip relative text-[10px] font-medium px-2 py-0.5 rounded-md border transition-all ${
                          hasTenant
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
                            : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200'
                        }`}
                        title={hasTenant ? `Click to edit ${unit.tenant.name}` : 'Click to add tenant'}
                      >
                        {unit.name}
                        <span className={`ml-1 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full transition-all ${
                          hasTenant ? 'text-green-400 group-hover/chip:text-green-600' : 'text-gray-300 group-hover/chip:text-blue-400'
                        }`}>
                          <span className="material-symbols-outlined text-[10px]">
                            {hasTenant ? 'edit' : 'add'}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    {floor.units.filter((u) => u.tenant).slice(0, 5).map((unit) => (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => setModal({ mode: 'edit', floorName: floor.name, unitId: unit.id, data: unit.tenant })}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold border-2 border-white -mr-1.5 shadow-sm hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer ${style.chipFloor}`}
                        title={`Edit ${unit.tenant.name}`}
                      >
                        {unit.tenant.initials}
                      </button>
                    ))}
                    {occ > 5 && (
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500 border-2 border-white -ml-1">
                        +{occ - 5}
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/properties/floor/${floorSlug(floor.name)}`}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    View floor
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredFloors.length === 0 && q && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-gray-200 mb-3">search_off</span>
          <p className="text-gray-400 font-medium">No results for &ldquo;{q}&rdquo;</p>
          <p className="text-xs text-gray-300 mt-1">Try a different name or unit</p>
        </div>
      )}

      {modal && (
        <TenantFormModal
          mode={modal.mode}
          initialData={modal.data}
          floorName={modal.floorName}
          unitId={modal.unitId}
          onClose={closeModal}
        />
      )}
      {floorModal && (
        <FloorFormModal
          mode={floorModal.mode}
          floorName={floorModal.floorName}
          onClose={() => setFloorModal(null)}
        />
      )}
    </div>
  )
}
