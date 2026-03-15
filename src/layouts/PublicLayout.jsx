import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getDashboardPath } from '../utils/permissions'

const NAV_LINKS = [
  { to: '/about',       label: 'Tentang Program' },
  { to: '/schools',     label: 'Sekolah' },
  { to: '/leaderboard', label: 'Peringkat' },
]

export default function PublicLayout() {
  const { isAuthenticated, session } = useAuth()
  const navigate = useNavigate()

  function handleCTA() {
    if (isAuthenticated) {
      navigate(getDashboardPath(session?.role))
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center
                            text-white font-bold text-sm group-hover:bg-teal-700 transition-colors">
              G
            </div>
            <div className="leading-none">
              <p className="text-sm font-bold text-gray-900">Program GAS</p>
              <p className="text-xs text-gray-500">Gigi Anak Sehat</p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* CTA */}
          <button onClick={handleCTA} className="btn-primary btn-sm">
            {isAuthenticated ? 'Masuk ke Dashboard' : 'Masuk'}
          </button>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-teal-600 flex items-center justify-center
                                text-white font-bold text-xs">G</div>
                <span className="text-white font-semibold text-sm">Program GAS</span>
              </div>
              <p className="text-xs leading-relaxed">
                Platform digital untuk program kesehatan gigi anak prasekolah
                di seluruh Indonesia.
              </p>
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-3">Tautan</p>
              <ul className="space-y-1.5 text-xs">
                {NAV_LINKS.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-3">Penyelenggara</p>
              <p className="text-xs leading-relaxed">
                Direktorat Kesehatan Gigi Masyarakat<br />
                Kementerian Kesehatan Republik Indonesia
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-xs text-center">
            © 2025 Program Gigi Anak Sehat (GAS). Hak cipta dilindungi.
          </div>
        </div>
      </footer>
    </div>
  )
}
