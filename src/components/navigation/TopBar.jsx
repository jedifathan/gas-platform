import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, LogOut, User } from 'lucide-react'
import { useAuth }    from '../../hooks/useAuth'
import { useApp }     from '../../hooks/useApp'
import { useReports } from '../../hooks/useReports'
import { getRoleLabel, formatPeriod, getPeriodOptions } from '../../utils/formatters'
import Breadcrumb from './Breadcrumb'

/**
 * TopBar — fixed header inside AuthShell.
 * Shows breadcrumb, period selector, notification badge, and user menu.
 */
export default function TopBar() {
  const { session, logout }      = useAuth()
  const { period, setPeriod }    = useApp()
  const navigate                 = useNavigate()
  const periodOptions            = getPeriodOptions(6)

  // Show pending badge only for admin
  const { pendingCount } = useReports()
  const showBadge = session?.role === 'admin' && pendingCount > 0

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

        {/* Notification bell (admin: shows pending reports badge) */}
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100
                           hover:text-gray-700 transition-colors">
          <Bell size={18} />
          {showBadge && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full
                             text-white text-[9px] font-bold flex items-center justify-center
                             ring-2 ring-white">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>

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
