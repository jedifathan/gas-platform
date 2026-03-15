import { Outlet, Link } from 'react-router-dom'

/**
 * LoginLayout — minimal centred layout for the login page.
 * No navigation chrome; just the brand mark, content slot, and footer.
 */
export default function LoginLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50
                    flex flex-col items-center justify-center px-4">
      {/* Brand mark */}
      <Link to="/" className="flex items-center gap-3 mb-8 group">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center
                        text-white font-bold text-xl shadow-lg group-hover:bg-teal-700 transition-colors">
          G
        </div>
        <div className="leading-none">
          <p className="text-xl font-bold text-gray-900">Program GAS</p>
          <p className="text-sm text-gray-500">Gigi Anak Sehat</p>
        </div>
      </Link>

      {/* Page slot */}
      <div className="w-full max-w-md">
        <Outlet />
      </div>

      {/* Footer */}
      <p className="mt-10 text-xs text-gray-400 text-center">
        © 2025 Direktorat Kesehatan Gigi Masyarakat, Kemenkes RI
      </p>
    </div>
  )
}
