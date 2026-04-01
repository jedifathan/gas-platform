import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useApp }  from '../../hooks/useApp'
import { login }   from '../../services/authService'
import { getDashboardPath } from '../../utils/permissions'
import Button from '../../components/ui/Button'

export default function LoginPage() {
  const { login: setSession } = useAuth()
  const { toast }             = useApp()
  const navigate              = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim())    return setError('Email wajib diisi.')
    if (!password.trim()) return setError('Password wajib diisi.')

    setLoading(true)
    const result = await login(email.trim(), password)
    setLoading(false)

    if (!result.success) {
      setError(result.message ?? 'Login gagal.')
      return
    }

    setSession(result.session)
    toast.success(`Selamat datang, ${result.session.name}!`)
    navigate(getDashboardPath(result.session.role), { replace: true })
  }

  return (
    <div className="card p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Masuk ke Platform GAS</h1>
        <p className="text-sm text-gray-500 mt-1">
          Masukkan email dan password Anda untuk melanjutkan.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            placeholder="nama@sekolah.id"
            className={`input ${error ? 'input-error' : ''}`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              className={`input pr-10 ${error ? 'input-error' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          icon={<LogIn size={15} />}
          className="w-full justify-center mt-2"
        >
          {loading ? 'Masuk...' : 'Masuk'}
        </Button>
      </form>
      <p className="text-xs text-gray-400 text-center mt-4">
         Belum punya akun?{' '}
         <Link to="/signup" className="text-primary-600 hover:underline font-medium">
         Daftar di sini
         </Link>
      </p>
      <p className="text-xs text-gray-400 text-center mt-6">
        Platform GAS — Gigi Anak Sehat
      </p>
    </div>
  )
}
