/**
 * StatCard — KPI metric display card.
 *
 * Props:
 *   label      string
 *   value      string | number
 *   sub        string  — secondary line below value (optional)
 *   trend      string  — e.g. "+4" or "▲ 12%"  (optional)
 *   trendUp    boolean — green if true, red if false, neutral if undefined
 *   icon       ReactNode (optional)
 *   color      'teal' | 'amber' | 'blue' | 'red' | 'gray'  (accent, default 'teal')
 *   onClick    () => void  (optional — makes card clickable)
 */

const ACCENT = {
  teal:  { icon_bg: 'bg-teal-50',   icon_txt: 'text-teal-600',  val_txt: 'text-teal-700'  },
  amber: { icon_bg: 'bg-amber-50',  icon_txt: 'text-amber-600', val_txt: 'text-amber-700' },
  blue:  { icon_bg: 'bg-blue-50',   icon_txt: 'text-blue-600',  val_txt: 'text-blue-700'  },
  red:   { icon_bg: 'bg-red-50',    icon_txt: 'text-red-600',   val_txt: 'text-red-700'   },
  gray:  { icon_bg: 'bg-gray-100',  icon_txt: 'text-gray-500',  val_txt: 'text-gray-800'  },
}

export default function StatCard({
  label, value, sub, trend, trendUp, icon, color = 'teal', onClick, className = '',
}) {
  const ac       = ACCENT[color] ?? ACCENT.teal
  const clickable = !!onClick

  const trendColor =
    trendUp === true  ? 'text-teal-600' :
    trendUp === false ? 'text-red-600'  : 'text-gray-500'

  return (
    <div
      onClick={onClick}
      className={`stat-card flex items-start gap-4
        ${clickable ? 'cursor-pointer hover:border-teal-300 hover:shadow-md transition-all' : ''}
        ${className}`}
    >
      {/* Icon slot */}
      {icon && (
        <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${ac.icon_bg} ${ac.icon_txt}`}>
          {icon}
        </div>
      )}

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 leading-none ${ac.val_txt}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1 truncate">{sub}</p>}
        {trend && (
          <p className={`text-xs font-medium mt-1 ${trendColor}`}>{trend}</p>
        )}
      </div>
    </div>
  )
}
