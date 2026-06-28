export default function ProgressBar({ value, label, color = 'bg-primary', showValue = true, className = '' }) {
  return (
    <div className={className}>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold">{label}</span>
        {showValue && <span className="text-primary font-bold">{value}%</span>}
      </div>
      <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
