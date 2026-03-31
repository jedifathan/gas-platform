/**
 * Badge — coloured label pill.
 *
 * Props:
 *   tier     'bronze' | 'silver' | 'gold' | 'platinum'
 *            If provided, uses the tier colour scheme.
 *   color    'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'purple'
 *            Used when tier is not set.
 *   size     'sm' | 'md'  (default 'md')
 *   dot      boolean — prepend a coloured dot
 */

const TIER_STYLES = {
  bronze:   { cls: 'bg-orange-50 text-orange-700 border border-orange-200', emoji: '🥉' },
  silver:   { cls: 'bg-gray-100  text-gray-700  border border-gray-300',   emoji: '🥈' },
  gold:     { cls: 'bg-amber-50  text-amber-700 border border-amber-200',  emoji: '🥇' },
  platinum: { cls: 'bg-purple-50 text-purple-700 border border-purple-200', emoji: '💎' },
}

const COLOR_STYLES = {
  green:  'bg-primary-50   text-primary-700   border border-primary-200',
  yellow: 'bg-amber-50  text-amber-700  border border-amber-200',
  red:    'bg-red-50    text-red-700    border border-red-200',
  gray:   'bg-gray-100  text-gray-600   border border-gray-200',
  blue:   'bg-blue-50   text-blue-700   border border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200',
}

const DOT_COLORS = {
  green: 'bg-primary-500', yellow: 'bg-amber-400', red: 'bg-red-500',
  gray: 'bg-gray-400',  blue: 'bg-blue-500',    purple: 'bg-purple-500',
}

export default function Badge({ tier, color = 'gray', size = 'md', dot = false, children, className = '' }) {
  const tierCfg = tier ? TIER_STYLES[tier] : null
  const cls     = tierCfg ? tierCfg.cls : (COLOR_STYLES[color] ?? COLOR_STYLES.gray)
  const sizeStr = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeStr} ${cls} ${className}`}>
      {tierCfg && <span>{tierCfg.emoji}</span>}
      {dot && !tierCfg && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_COLORS[color] ?? 'bg-gray-400'}`} />
      )}
      {children}
    </span>
  )
}
