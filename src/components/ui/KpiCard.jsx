export default function KpiCard({ label, value, trend, icon, positive }) {
  const trendIcon = positive === true ? 'trending_up' : positive === false ? 'trending_up' : 'horizontal_rule'
  const trendColor = positive === true ? 'text-status-paid' : positive === false ? 'text-status-unpaid' : 'text-status-partial'

  return (
    <div className="bg-white p-6 rounded-2xl shadow-premium border border-border-subtle relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <span className="material-symbols-outlined text-6xl text-primary">{icon}</span>
      </div>
      <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider mb-2">{label}</p>
      <h3 className="text-3xl font-extrabold text-on-surface">{value}</h3>
      <div className={`mt-4 flex items-center gap-2 font-bold text-sm ${trendColor}`}>
        {positive !== null && <span className="material-symbols-outlined text-sm">{trendIcon}</span>}
        <span>{trend}</span>
      </div>
    </div>
  )
}
