import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, FileText, Trophy,
  School, Users, LogOut, User,
  ChevronLeft, ChevronRight, Map, Globe,
} from 'lucide-react'
import { useAuth }      from '../../hooks/useAuth'
import { useApp }       from '../../hooks/useApp'
import { useIsMobile }  from '../../hooks/useBreakpoint'
import { getRoleLabel } from '../../utils/formatters'

const TEACHER_NAV = [
  { to: '/app/teacher/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/teacher/lms',         icon: BookOpen,        label: 'Kursus Saya' },
  { to: '/app/teacher/reports',     icon: FileText,        label: 'Laporan Saya' },
  { to: '/app/teacher/reports/new', icon: FileText,        label: 'Buat Laporan', sub: true },
]

const ADMIN_NAV = [
  { to: '/app/admin/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/admin/monitoring',  icon: Map,             label: 'Monitoring' },
  { to: '/app/admin/reports',     icon: FileText,        label: 'Semua Laporan' },
  { to: '/app/admin/schools',     icon: School,          label: 'Sekolah' },
  { to: '/app/admin/regions',     icon: Globe,           label: 'Wilayah' },
  { to: '/app/admin/users',       icon: Users,           label: 'Pengguna' },
  { to: '/app/admin/leaderboard', icon: Trophy,          label: 'Peringkat' },
]

const GOV_NAV = [
  { to: '/app/gov/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/gov/monitoring',  icon: Map,             label: 'Monitoring' },
  { to: '/app/gov/reports',     icon: FileText,        label: 'Laporan Wilayah' },
  { to: '/app/gov/leaderboard', icon: Trophy,          label: 'Peringkat' },
]

function getNavItems(role) {
  if (role === 'admin')        return ADMIN_NAV
  if (role === 'teacher')      return TEACHER_NAV
  if (role === 'gov_observer') return GOV_NAV
  return []
}

export default function Sidebar() {
  const { session, logout }            = useAuth()
  const { sidebarOpen, toggleSidebar } = useApp()
  const isMobile                       = useIsMobile()
  const navigate                       = useNavigate()
  const navItems                       = getNavItems(session?.role)

  function handleLogout() { logout(); navigate('/login') }
  function handleNavClick() { if (isMobile && sidebarOpen) toggleSidebar() }

  return (
    <>
      <aside className={`fixed top-0 left-0 h-full z-30 flex flex-col bg-white border-r border-gray-200
                         transition-all duration-200 shadow-sm
                         ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">G</div>
            <div className="leading-none min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">Program GAS</p>
              <p className="text-xs text-gray-500 truncate">Gigi Anak Sehat</p>
            </div>
          </div>
          <button onClick={toggleSidebar} aria-label="Tutup sidebar"
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="px-3 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-xs shrink-0">
              {session?.name?.charAt(0) ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{session?.name}</p>
              <p className="text-xs text-gray-500 truncate">{getRoleLabel(session?.role)}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label, sub }) => (
            <NavLink key={to} to={to} end={to.endsWith('dashboard')} onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''} ${sub ? 'ml-4 text-xs' : ''}`
              }>
              <Icon size={sub ? 14 : 16} className="shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-gray-100 space-y-0.5 shrink-0">
          <NavLink to="/app/profile" onClick={handleNavClick}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}>
            <User size={16} className="shrink-0" />
            <span className="truncate">Profil Saya</span>
          </NavLink>
          <button onClick={handleLogout} className="nav-item w-full text-red-600 hover:bg-red-50 hover:text-red-700">
            <LogOut size={16} className="shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {!sidebarOpen && (
        <button onClick={toggleSidebar} aria-label="Buka sidebar"
          className="fixed top-4 left-3 z-30 p-2 rounded-lg bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-teal-700 hover:border-teal-300 transition-colors">
          <ChevronRight size={16} />
        </button>
      )}
    </>
  )
}
