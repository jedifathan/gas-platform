/**
 * ProgressBar — horizontal progress indicator.
 *
 * Props:
 *   value     number  0–100
 *   size      'xs' | 'sm' | 'md'  (default 'sm')
 *   color     'teal' | 'amber' | 'blue' | 'red'  (default 'teal')
 *   label     string  — shown to the right of the bar (optional)
 *   showPct   boolean — show percentage inside/below bar (default false)
 *   animated  boolean — pulse animation when value > 0 and < 100 (default false)
 */

const HEIGHTS = { xs: 'h-1', sm: 'h-2', md: 'h-3' }
const COLORS  = {
  teal:  'bg-primary-500',
  amber: 'bg-amber-400',
  blue:  'bg-blue-500',
  red:   'bg-red-500',
  gray:  'bg-gray-400',
}

export default function ProgressBar({
  value     = 0,
  size      = 'sm',
  color     = 'teal',
  label,
  showPct   = false,
  animated  = false,
  className = '',
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  const h       = HEIGHTS[size] ?? HEIGHTS.sm
  const fill    = COLORS[color]  ?? COLORS.teal

  return (
    <div className={`w-full ${className}`}>
      {(label || showPct) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-gray-600 truncate">{label}</span>}
          {showPct && <span className="text-xs font-medium text-gray-700 ml-auto">{clamped}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${h}`}>
        <div
          className={`${h} ${fill} rounded-full transition-all duration-500
            ${animated && clamped > 0 && clamped < 100 ? 'animate-pulse' : ''}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
