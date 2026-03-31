import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, FileText, ChevronRight, Check } from 'lucide-react'
import { getReports, getPendingCount } from '../../services/reportService'
import { formatRelativeTime } from '../../utils/formatters'

/**
 * NotificationPanel — bell icon with a live dropdown of pending reports.
 * Calls the report service directly (no hook) to avoid re-rendering every page.
 */
export default function NotificationPanel() {
  const [open, setOpen]   = useState(false)
  const ref               = useRef(null)
  const navigate          = useNavigate()

  // Live counts pulled from the service on every open
  const pendingCount  = getPendingCount()
  const pendingReports = open ? getReports({ status: 'submitted' }).slice(0, 6) : []

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function goToReport(id) {
    navigate(`/app/admin/reports/${id}`)
    setOpen(false)
  }

  function goToAll() {
    navigate('/app/admin/reports')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Notifikasi laporan"
        className={`relative p-2 rounded-lg transition-colors
          ${open
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
      >
        <Bell size={18} />
        {pendingCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full
                           text-white text-[9px] font-bold flex items-center justify-center
                           ring-2 ring-white leading-none">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl
                        border border-gray-200 shadow-xl z-50 overflow-hidden
                        animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Menunggu Validasi</p>
            {pendingCount > 0 ? (
              <span className="text-xs bg-red-50 text-red-700 border border-red-200
                               px-2 py-0.5 rounded-full font-medium">
                {pendingCount} laporan
              </span>
            ) : (
              <span className="text-xs text-gray-400">Semua bersih</span>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {pendingReports.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-gray-400">
                <Check size={22} className="text-primary-400" />
                <p className="text-sm">Tidak ada laporan pending.</p>
              </div>
            ) : (
              pendingReports.map(r => (
                <div
                  key={r.id}
                  onClick={() => goToReport(r.id)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-alabaster
                             cursor-pointer group border-b border-gray-50 last:border-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center
                                  justify-center shrink-0">
                    <FileText size={14} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate
                                  group-hover:text-primary-700 transition-colors">
                      {r.school_name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {r.activity_label} · {formatRelativeTime(r.submitted_at)}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-primary-500
                                                     shrink-0 transition-colors" />
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-alabaster/60">
            <button
              onClick={goToAll}
              className="w-full text-xs text-primary-600 hover:text-primary-700 font-medium
                         flex items-center justify-center gap-1 transition-colors"
            >
              Lihat semua laporan
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
