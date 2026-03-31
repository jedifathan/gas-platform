import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const CONFIGS = {
  success: {
    icon:      CheckCircle,
    container: 'bg-white border border-primary-200 shadow-lg',
    icon_cls:  'text-primary-600',
    bar:       'bg-primary-500',
  },
  error: {
    icon:      XCircle,
    container: 'bg-white border border-red-200 shadow-lg',
    icon_cls:  'text-red-600',
    bar:       'bg-red-500',
  },
  warning: {
    icon:      AlertTriangle,
    container: 'bg-white border border-amber-200 shadow-lg',
    icon_cls:  'text-amber-600',
    bar:       'bg-amber-500',
  },
  info: {
    icon:      Info,
    container: 'bg-white border border-blue-200 shadow-lg',
    icon_cls:  'text-blue-600',
    bar:       'bg-blue-500',
  },
}

/**
 * Toast — single notification pill.
 * Animates in on mount. The parent controls removal via onDismiss.
 *
 * Props:
 *   toast    { id, message, type }
 *   onDismiss  () => void
 */
export default function Toast({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false)
  const cfg = CONFIGS[toast.type] ?? CONFIGS.info
  const Icon = cfg.icon

  useEffect(() => {
    // Trigger enter animation after mount
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    setVisible(false)
    setTimeout(onDismiss, 200)
  }

  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 w-80 rounded-xl p-4
        transition-all duration-200 relative overflow-hidden
        ${cfg.container}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar}`} />

      <Icon size={18} className={`${cfg.icon_cls} shrink-0 mt-0.5 ml-2`} />

      <p className="flex-1 text-sm text-gray-800 leading-snug pr-1">
        {toast.message}
      </p>

      <button
        onClick={dismiss}
        className="shrink-0 p-0.5 rounded text-gray-400 hover:text-gray-700 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}
