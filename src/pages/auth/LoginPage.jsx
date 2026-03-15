import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useApp }  from '../../hooks/useApp'
import { login }   from '../../services/authService'
import { getDashboardPath } from '../../utils/permissions'
import Button from '../../components/ui/Button'

const DEMO_ACCOUNTS = [
  { label: 'Admin',         email: 'admin@gas-program.id',          role: 'admin' },
  { label: 'Guru (Ani)',    email: 'ani.rahayu@tktunasbangsa.id',   role: 'teacher' },
  { label: 'Guru (Doni)',   email: 'doni.kusuma@paudmelati.id',     role: 'teacher' },
  { label: 'Pengamat Dinas',email: 'a.fauzi@dinkes-tangsel.go.id', role: 'gov_observer' },
]

export default function LoginPage() {
  const { login: setSession } = useAuth()
  const { toast }             = useApp()
  const navigate              = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  function fillDemo(acc) {
    setEmail(acc.email)
    setPassword('password123')
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim())    return setError('Email wajib diisi.')
    if (!password.trim()) return setError('Password wajib diisi.')

    setLoading(true)
    // Simulate async network latency
    await new Promise(r => setTimeout(r, 600))

    const result = login(email.trim(), password)
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
          Masukkan akun Anda untuk melanjutkan.
        </p>
      </div>

      {/* Demo accounts quick-fill */}
      <div className="mb-6">
        <p className="text-xs font-medium text-gray-500 mb-2">Demo akun:</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map(acc => (
            <button
              key={acc.email}
              type="button"
              onClick={() => fillDemo(acc)}
              className="text-left px-3 py-2 rounded-lg border border-gray-200 text-xs
                         hover:border-teal-300 hover:bg-teal-50 transition-colors group"
            >
              <span className="font-medium text-gray-700 group-hover:text-teal-700 block truncate">
                {acc.label}
              </span>
              <span className="text-gray-400 truncate block">{acc.email}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-6">
        {/* Email */}
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

        {/* Password */}
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

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Submit */}
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

      <p className="text-xs text-gray-400 text-center mt-6">
        Platform ini adalah prototipe internal GAS.
      </p>
    </div>
  )
}
