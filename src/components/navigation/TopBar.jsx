import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth }    from '../../hooks/useAuth'
import { useApp }     from '../../hooks/useApp'
import { getRoleLabel, getPeriodOptions } from '../../utils/formatters'
import Breadcrumb         from './Breadcrumb'
import NotificationPanel  from './NotificationPanel'

/**
 * TopBar — fixed header inside AuthShell.
 * Shows breadcrumb, period selector, notification bell (admin only), and user pill.
 *
 * Performance fix: useReports() was called here on every authenticated page.
 * Replaced with NotificationPanel which reads the service directly — no hook overhead.
 */
export default function TopBar() {
  const { session, logout } = useAuth()
  const { period, setPeriod } = useApp()
  const navigate              = useNavigate()
  const periodOptions         = getPeriodOptions(6)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center
                       justify-between px-6 shrink-0 sticky top-0 z-20 shadow-sm">
      {/* Left: breadcrumb */}
      <Breadcrumb />

      {/* Right: controls */}
      <div className="flex items-center gap-3">
        {/* Period selector */}
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50
                     text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400
                     hover:border-gray-300 transition-colors cursor-pointer"
        >
          {periodOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Notification bell — admin only */}
        {session?.role === 'admin' && <NotificationPanel />}

        {/* User pill */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center
                          text-teal-700 font-semibold text-xs shrink-0">
            {session?.name?.charAt(0) ?? '?'}
          </div>
          <div className="hidden sm:block leading-none">
            <p className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
              {session?.name}
            </p>
            <p className="text-[10px] text-gray-500">{getRoleLabel(session?.role)}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar"
            className="ml-1 p-1.5 rounded-md text-gray-400 hover:text-red-600
                       hover:bg-red-50 transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  )
}
