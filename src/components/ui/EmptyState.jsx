/**
 * EmptyState — zero-data placeholder.
 *
 * Props:
 *   icon      ReactNode  (optional, defaults to a generic box icon)
 *   title     string
 *   message   string  (optional)
 *   action    ReactNode  (optional CTA button)
 *   compact   boolean  — smaller version for use inside cards (default false)
 */
import { Inbox } from 'lucide-react'

export default function EmptyState({ icon, title, message, action, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center
      ${compact ? 'py-8 px-4' : 'py-16 px-6'}`}
    >
      <div className={`rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4
        ${compact ? 'w-12 h-12' : 'w-16 h-16'}`}
      >
        {icon ?? <Inbox size={compact ? 22 : 28} />}
      </div>

      <p className={`font-semibold text-gray-700 ${compact ? 'text-sm' : 'text-base'}`}>
        {title}
      </p>

      {message && (
        <p className={`text-gray-500 mt-1 max-w-xs ${compact ? 'text-xs' : 'text-sm'}`}>
          {message}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
