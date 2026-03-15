/**
 * StatusPill — report status label with dot indicator.
 *
 * Props:
 *   status   'draft' | 'submitted' | 'validated' | 'rejected'
 *   size     'sm' | 'md'  (default 'md')
 *   dot      boolean — show leading dot  (default true)
 */
import { getStatusConfig } from '../../utils/formatters'

export default function StatusPill({ status, size = 'md', dot = true }) {
  const { label, className, dotColor } = getStatusConfig(status)
  const textSize = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${textSize} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      {label}
    </span>
  )
}
