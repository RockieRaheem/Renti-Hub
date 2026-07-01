export default function DonutChart({ data, total, size = 180, strokeWidth = 28 }) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e7e8ea" strokeWidth={strokeWidth} />
        {data.map((slice, i) => {
          const pct = (slice.value / total) * circ
          const dash = `${pct} ${circ - pct}`
          const dashOffset = -offset
          offset += pct
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dash}
              strokeDashoffset={dashOffset}
              className="transition-all duration-700"
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-on-surface">{total}%</span>
        <span className="text-[10px] text-on-surface-muted uppercase tracking-wider">Total</span>
      </div>
    </div>
  )
}
