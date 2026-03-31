import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getDashboardPath } from '../../utils/permissions'
import Button from '../../components/ui/Button'

export default function NotFound() {
  const { isAuthenticated, session } = useAuth()
  const navigate = useNavigate()

  function goHome() {
    if (isAuthenticated) {
      navigate(getDashboardPath(session?.role))
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-alabaster flex flex-col items-center justify-center px-6 text-center">
      {/* Big 404 */}
      <p className="text-8xl font-black text-gray-200 select-none leading-none mb-4">404</p>

      {/* Brand mark */}
      <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center
                      text-white font-bold text-xl mb-5">G</div>

      <h1 className="text-xl font-bold text-gray-900 mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-sm text-gray-500 max-w-sm mb-8">
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
        Silakan kembali ke halaman utama.
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate(-1)}
        >
          Kembali
        </Button>
        <Button
          variant="primary"
          icon={<Home size={15} />}
          onClick={goHome}
        >
          {isAuthenticated ? 'Ke Dashboard' : 'Ke Beranda'}
        </Button>
      </div>
    </div>
  )
}
