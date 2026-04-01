import { useState, useEffect } from 'react'
import { useNavigate, Link }   from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { getAllSchools }   from '../../services/schoolService'
import { getAllRegions }   from '../../services/regionService'
import Button      from '../../components/ui/Button'
import SelectInput from '../../components/forms/SelectInput'
import TextInput   from '../../components/forms/TextInput'

const ROLE_OPTS = [
  { value: 'teacher',      label: 'Guru' },
  { value: 'gov_observer', label: 'Pengamat Dinas' },
]

export default function SignupPage() {
  const navigate = useNavigate()

  const [schools,  setSchools]  = useState([])
  const [regions,  setRegions]  = useState([])
  const [loadingData, setLoadingData] = useState(true)

  const [form,    setForm]    = useState({ name: '', email: '', password: '', role: 'teacher', school_id: '', region_id: '' })
  const [errors,  setErrors]  = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Load schools and regions on mount
  useEffect(() => {
    Promise.all([getAllSchools(), getAllRegions()])
      .then(([s, r]) => { setSchools(s); setRegions(r) })
      .finally(() => setLoadingData(false))
  }, [])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function setRole(value) {
    setForm(f => ({ ...f, role: value, school_id: '', region_id: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})

    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:      form.name,
          email:     form.email,
          password:  form.password,
          role:      form.role,
          school_id: form.role === 'teacher'      ? form.school_id  : undefined,
          region_id: form.role === 'gov_observer' ? form.region_id  : undefined,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        if (data.field) setErrors({ [data.field]: data.message })
        else setErrors({ _general: data.message ?? 'Pendaftaran gagal.' })
        return
      }
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch {
      setErrors({ _general: 'Tidak dapat terhubung ke server.' })
    } finally {
      setLoading(false)
    }
  }

  // Build grouped school options
  const schoolOpts  = schools.map(s => ({ value: s.id, label: `${s.name} (${s.district})` }))
  // Group regions by kota for display
  const regionOpts  = regions.map(r => ({ value: r.id, label: `${r.name} — ${r.kota}` }))

  if (success) {
    return (
      <div className="card p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
          <UserPlus size={24} className="text-primary-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Akun Berhasil Dibuat!</h2>
        <p className="text-sm text-gray-500">Mengalihkan ke halaman masuk...</p>
      </div>
    )
  }

  return (
    <div className="card p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Daftar Akun</h1>
        <p className="text-sm text-gray-500 mt-1">
          Buat akun untuk mengakses Platform GAS.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextInput
          label="Nama Lengkap" required
          value={form.name} onChange={e => set('name', e.target.value)}
          error={errors.name} placeholder="Nama lengkap Anda"
        />

        <TextInput
          label="Email" required type="email"
          value={form.email} onChange={e => set('email', e.target.value)}
          error={errors.email} placeholder="email@sekolah.id"
        />

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="label">Password <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="Minimal 6 karakter"
              className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
            />
            <button type="button" onClick={() => setShowPwd(v => !v)} tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
        </div>

        <SelectInput
          label="Daftar Sebagai" required
          options={ROLE_OPTS} value={form.role}
          onChange={e => setRole(e.target.value)}
          placeholder={null}
        />

        {/* Conditional school / region */}
        {form.role === 'teacher' && (
          <div>
            <label className="label">Sekolah <span className="text-red-500">*</span></label>
            <select
              value={form.school_id}
              onChange={e => set('school_id', e.target.value)}
              className={`input ${errors.school_id ? 'input-error' : ''}`}
              disabled={loadingData}
            >
              <option value="">{loadingData ? 'Memuat sekolah...' : 'Pilih sekolah...'}</option>
              {schoolOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.school_id && <p className="text-xs text-red-600 mt-1">{errors.school_id}</p>}
          </div>
        )}

        {form.role === 'gov_observer' && (
          <div>
            <label className="label">Wilayah (Kecamatan) <span className="text-red-500">*</span></label>
            <select
              value={form.region_id}
              onChange={e => set('region_id', e.target.value)}
              className={`input ${errors.region_id ? 'input-error' : ''}`}
              disabled={loadingData}
            >
              <option value="">{loadingData ? 'Memuat wilayah...' : 'Pilih kecamatan...'}</option>
              {regionOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.region_id && <p className="text-xs text-red-600 mt-1">{errors.region_id}</p>}
          </div>
        )}

        {errors._general && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {errors._general}
          </p>
        )}

        <Button type="submit" variant="primary" loading={loading}
          icon={<UserPlus size={15} />} className="w-full justify-center mt-2">
          {loading ? 'Mendaftar...' : 'Buat Akun'}
        </Button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-6">
        Sudah punya akun?{' '}
        <Link to="/login" className="text-primary-600 hover:underline font-medium">Masuk di sini</Link>
      </p>
    </div>
  )
}
