/**
 * Card — surface container with optional header and footer slots.
 *
 * Props:
 *   title      string  — card heading (optional)
 *   subtitle   string  — muted sub-heading (optional)
 *   action     ReactNode — rendered top-right of header (optional)
 *   footer     ReactNode — rendered at bottom with divider (optional)
 *   noPadding  boolean — remove body padding (e.g. for full-bleed tables)
 *   className  string
 */
export default function Card({ title, subtitle, action, footer, noPadding = false, className = '', children }) {
  const hasHeader = title || subtitle || action

  return (
    <div className={`card flex flex-col ${className}`}>
      {/* Header */}
      {hasHeader && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          {action && <div className="ml-4 shrink-0">{action}</div>}
        </div>
      )}

      {/* Body */}
      <div className={`flex-1 ${noPadding ? '' : 'p-5'}`}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-5 py-3 border-t border-gray-100 shrink-0">
          {footer}
        </div>
      )}
    </div>
  )
}
