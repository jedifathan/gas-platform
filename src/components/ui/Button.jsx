/**
 * Button — polymorphic button component.
 *
 * Props:
 *   variant   'primary' | 'secondary' | 'danger' | 'ghost'  (default 'secondary')
 *   size      'sm' | 'md' | 'lg'  (default 'md')
 *   loading   boolean — shows spinner, disables interaction
 *   icon      ReactNode — icon rendered before label
 *   iconRight ReactNode — icon rendered after label
 *   as        'button' | 'a'  (default 'button')
 *   ...rest   all native button/anchor props
 */
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:   'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 border-transparent',
  secondary: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-gray-400',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-transparent',
  ghost:     'bg-transparent text-gray-600 border-transparent hover:bg-gray-100 focus:ring-gray-400',
  teal_outline: 'bg-transparent text-teal-700 border-teal-300 hover:bg-teal-50 focus:ring-teal-400',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
}

export default function Button({
  variant  = 'secondary',
  size     = 'md',
  loading  = false,
  icon,
  iconRight,
  children,
  disabled,
  className = '',
  as: Tag   = 'button',
  ...rest
}) {
  const base = `inline-flex items-center justify-center font-medium rounded-lg border
    transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed select-none`

  return (
    <Tag
      disabled={disabled || loading}
      className={`${base} ${VARIANTS[variant] ?? VARIANTS.secondary} ${SIZES[size] ?? SIZES.md} ${className}`}
      {...rest}
    >
      {loading
        ? <Loader2 size={size === 'sm' ? 12 : 14} className="animate-spin shrink-0" />
        : icon && <span className="shrink-0">{icon}</span>
      }
      {children}
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </Tag>
  )
}
