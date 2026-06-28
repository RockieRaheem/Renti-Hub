export default function BarChart({ data, maxValue, height = 'h-[300px]' }) {
  const max = maxValue || Math.max(...data.map((d) => d.value))
  return (
    <div className={`${height} w-full flex items-end justify-between gap-4 px-4 border-b border-border-subtle mb-6 relative`}>
      <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none opacity-5">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="border-t border-black w-full" />)}
      </div>
      {data.map((item, i) => (
        <div
          key={i}
          className={`flex-1 transition-all hover:brightness-110 relative group rounded-t-lg ${
            item.projected ? 'bg-tertiary/80 border-2 border-dashed border-tertiary' : 'bg-primary'
          }`}
          style={{ height: `${(item.value / max) * 100}%`, opacity: item.projected ? undefined : 0.4 + (item.value / max) * 0.6 }}
        >
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}
