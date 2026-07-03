export function Skeleton({ className = '', as: Tag = 'div', ...props }) {
  return <Tag className={`sk-shimmer rounded-lg ${className}`} {...props} />
}

export function SkeletonText({ lines = 1, lastWidth = '60%', className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5"
          style={{ width: i === lines - 1 && lines > 1 ? lastWidth : '100%' }}
        />
      ))}
    </div>
  )
}

export function SkeletonAvatar({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-8 h-8', lg: 'w-10 h-10', xl: 'w-14 h-14' }
  return <Skeleton className={`${sizes[size] || sizes.md} rounded-full shrink-0 ${className}`} />
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-surface rounded-card border border-outline p-5 shadow-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <Skeleton className="w-12 h-4 rounded" />
      </div>
      <Skeleton className="h-8 w-3/4 mb-2 rounded" />
      <Skeleton className="h-3.5 w-1/2 rounded" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-surface rounded-card border border-outline overflow-hidden shadow-card">
      <div className="border-b border-outline bg-surface-container/50 px-5 py-3 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 flex-1 rounded" />
        ))}
      </div>
      <div className="divide-y divide-outline">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-6 px-5 py-3.5">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1 rounded" style={{ width: c === 0 ? '30%' : undefined }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonChart({ bars = 6, className = '' }) {
  const heights = [60, 75, 65, 85, 92, 80]
  return (
    <div className={`bg-surface rounded-card border border-outline p-6 shadow-card ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-3.5 w-56 rounded" />
        </div>
        <Skeleton className="h-7 w-28 rounded-lg" />
      </div>
      <div className="flex items-end gap-3 h-56 border-b border-outline pb-1">
        {Array.from({ length: bars }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: `${heights[i % heights.length]}%` }}>
              <Skeleton className="w-[40%] rounded-t-sm" style={{ height: '100%' }} />
              <Skeleton className="w-[40%] rounded-t-sm bg-surface-container-higher" style={{ height: '70%' }} />
            </div>
            <Skeleton className="h-3 w-8 rounded mt-1" />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonKanban({ columns = ['Pending', 'In Progress', 'Resolved'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {columns.map((title) => (
        <div key={title} className="bg-surface-container rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-5 w-6 rounded-md" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-lg border border-outline border-l-4 border-l-primary/30 p-4 shadow-card">
                <div className="flex items-start justify-between mb-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-12 rounded" />
                </div>
                <Skeleton className="h-3 w-1/2 rounded mb-3" />
                <div className="flex gap-1 pt-2 border-t border-outline">
                  <Skeleton className="h-6 w-14 rounded-md" />
                  <Skeleton className="h-6 w-14 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonFloorCard({ units = 4 }) {
  return (
    <div className="bg-surface rounded-card border border-outline overflow-hidden shadow-card">
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-4 flex-1">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-20 h-4 rounded hidden sm:block" />
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="w-7 h-7 rounded-lg" />
        </div>
      </div>
      <div className="border-t border-outline p-5 bg-surface-container/50">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: units }).map((_, i) => (
            <div key={i} className="rounded-lg border border-dashed border-outline p-3 text-center">
              <Skeleton className="w-2 h-2 rounded-full mx-auto mb-2" />
              <Skeleton className="h-3.5 w-14 mx-auto rounded" />
              <Skeleton className="h-3 w-16 mx-auto mt-1 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PageSkeleton({ children }) {
  return (
    <div className="p-6 md:p-8 space-y-6 animate-pulse">
      {children}
    </div>
  )
}
