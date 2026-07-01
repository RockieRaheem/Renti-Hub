import { useParams, Link } from 'react-router-dom'
import { useBuilding } from '../context/BuildingContext'
import StatusBadge from '../components/ui/StatusBadge'

export default function UnitDetails() {
  const { floorName, unitId } = useParams()
  const { building, getUnitByFloorAndId, maintenance, getAvatarColor } = useBuilding()
  const unit = getUnitByFloorAndId(floorName, unitId)
  const t = unit?.tenant

  const unitMaintenance = [
    ...maintenance.pending.filter((m) => m.floor === unit?.floor && m.unit === unit?.name),
    ...maintenance.inProgress.filter((m) => m.floor === unit?.floor && m.unit === unit?.name),
    ...maintenance.resolved.filter((m) => m.floor === unit?.floor && m.unit === unit?.name),
  ]

  if (!unit) {
    return (
      <div className="p-6 md:p-8 text-center py-20">
        <p className="text-gray-400 text-sm">Unit not found</p>
        <Link to={`/properties/floor/${floorName}`} className="text-blue-600 text-sm font-medium mt-2 inline-block hover:underline">Back to Floor</Link>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <Link to="/properties" className="hover:text-blue-600 transition-colors">Tenants</Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <Link to={`/properties/floor/${floorName}`} className="hover:text-blue-600 transition-colors">{unit.floor}</Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="text-gray-900 font-medium">{unit.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className={`h-2 ${t ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${t ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'}`}>
                    <span className="material-symbols-outlined">{t ? 'store' : 'meeting_room'}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{unit.name}</h2>
                    <p className="text-sm text-gray-400">{unit.floor} &middot; {building.name}</p>
                  </div>
                </div>
                <StatusBadge status={unit.status} />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-5 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="font-semibold text-gray-900">{unit.type}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Size</p>
                  <p className="font-semibold text-gray-900">{unit.size}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Annual Rent</p>
                  <p className="font-semibold text-gray-900">{unit.rent}</p>
                </div>
              </div>

              {t ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Tenant</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${getAvatarColor(t.initials)}`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.email} &middot; {t.phone}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <StatusBadge status={t.paymentStatus} />
                      <div className={`w-2 h-2 rounded-full ${t.paid ? 'bg-green-500' : 'bg-red-400'}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {[
                      { label: 'Lease Start', value: t.leaseStart },
                      { label: 'Lease End', value: t.leaseEnd },
                      { label: 'Lease Term', value: t.leaseTerm },
                      { label: 'Monthly Rent', value: `UGX ${unit.monthlyRent.toLocaleString()}` },
                    ].map((d) => (
                      <div key={d.label} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-0.5">{d.label}</p>
                        <p className="font-medium text-gray-900">{d.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                    <h4 className="font-semibold text-gray-900 mb-2">Payment History</h4>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-400">Last Payment</span>
                      <span className="font-medium text-green-600">{t.lastPayment || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-400">Date</span>
                      <span className="font-medium text-gray-900">{t.lastPaymentDate || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">Status</span>
                      <span className={`font-medium ${t.paid ? 'text-green-600' : 'text-red-500'}`}>
                        {t.paid ? 'Up to date' : 'Outstanding balance'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 text-center">
                  <span className="material-symbols-outlined text-yellow-500 text-3xl mb-2">meeting_room</span>
                  <p className="text-yellow-700 font-medium">This unit is currently vacant</p>
                  <p className="text-yellow-600 text-sm mt-1">Available for lease at {unit.rent}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/rent-collection"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors ${!t ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-lg">payments</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Record Payment</p>
                  <p className="text-xs text-gray-400">{t ? `UGX ${unit.monthlyRent.toLocaleString()}/mo` : 'No tenant'}</p>
                </div>
              </Link>
              <Link to="/maintenance-board"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors ${!t ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-600 text-lg">build</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Report Maintenance</p>
                  <p className="text-xs text-gray-400">{unitMaintenance.length} past requests</p>
                </div>
              </Link>
              <Link to={`/properties/floor/${floorName}`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-500 text-lg">arrow_back</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Back to Floor</p>
                  <p className="text-xs text-gray-400">{unit.floor}</p>
                </div>
              </Link>
            </div>
          </div>

          {unitMaintenance.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Maintenance</h3>
              <div className="space-y-3">
                {unitMaintenance.map((m) => (
                  <div key={m.id} className={`rounded-lg border p-3.5 ${
                    m.resolution ? 'bg-green-50 border-green-200' :
                    m.assignee ? 'bg-blue-50 border-blue-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider">{m.priority}</span>
                      <span className="text-[10px] text-gray-500">{m.date}</span>
                    </div>
                    <p className="text-sm font-medium">{m.title}</p>
                    {m.resolution && <p className="text-xs text-green-600 mt-1">{m.resolution}</p>}
                    {m.assignee && <p className="text-xs text-gray-500 mt-1">Assigned: {m.assignee}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Unit Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-400">Unit ID</span>
                <span className="font-medium text-gray-900">{unit.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-400">Floor</span>
                <span className="font-medium text-gray-900">{unit.floor}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-400">Type</span>
                <span className="font-medium text-gray-900">{unit.type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-400">Size</span>
                <span className="font-medium text-gray-900">{unit.size}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Annual Rent</span>
                <span className="font-medium text-gray-900">{unit.rent}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
