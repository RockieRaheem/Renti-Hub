import { usePrivacy } from '../../context/PrivacyContext'

export default function MaskAmount({ amount, currency, className }) {
  const { maskMode, blurred } = usePrivacy()

  const shouldMask = maskMode || blurred
  const prefix = currency || 'UGX'
  const formatted = typeof amount === 'number'
    ? `${prefix} ${amount.toLocaleString()}`
    : amount || `${prefix} 0`

  if (shouldMask) {
    return (
      <span className={`inline-flex items-center gap-1 ${className || ''}`} aria-label="Redacted for privacy">
        <span className="material-symbols-outlined text-xs text-on-surface-dim">visibility_off</span>
        <span className="tracking-wider text-on-surface-dim select-none" style={{ filter: 'blur(4px)', userSelect: 'none' }}>
          {formatted}
        </span>
      </span>
    )
  }

  return <span className={className}>{formatted}</span>
}
