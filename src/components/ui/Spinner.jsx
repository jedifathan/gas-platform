/**
 * Spinner — loading indicator.
 *
 * Props:
 *   size     'sm' | 'md' | 'lg'  (default 'md')
 *   color    'teal' | 'white' | 'gray'  (default 'teal')
 *   label    string  — accessible sr-only text (default 'Memuat...')
 *   center   boolean — wraps in a centred flex container (default false)
 */

const SIZES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
}

const COLORS = {
  teal:  'border-teal-200 border-t-teal-600',
  white: 'border-white/30 border-t-white',
  gray:  'border-gray-200 border-t-gray-500',
}

export default function Spinner({ size = 'md', color = 'teal', label = 'Memuat...', center = false }) {
  const el = (
    <span className="inline-flex items-center gap-2">
      <span
        className={`rounded-full animate-spin ${SIZES[size] ?? SIZES.md} ${COLORS[color] ?? COLORS.teal}`}
        role="status"
        aria-label={label}
      />
      <span className="sr-only">{label}</span>
    </span>
  )

  if (center) {
    return (
      <div className="flex items-center justify-center w-full py-12">
        {el}
      </div>
    )
  }

  return el
}

/** Full-page loading overlay */
export function PageLoader({ message = 'Memuat...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center
                      text-white font-bold text-xl animate-pulse">
        G
      </div>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
