import { useState } from 'react'
import { Search, Users, Plus, Eye, EyeOff } from 'lucide-react'
import { getAllUsers, toggleUserActive, createUser } from '../../services/authService'
import schoolsData from '../../data/schools.json'
import regionsData from '../../data/regions.json'
import { useApp }    from '../../hooks/useApp'
import Card          from '../../components/ui/Card'
import Badge         from '../../components/ui/Badge'
import Button        from '../../components/ui/Button'
import Modal         from '../../components/ui/Modal'
import EmptyState    from '../../components/ui/EmptyState'
import TextInput     from '../../components/forms/TextInput'
import SelectInput   from '../../components/forms/SelectInput'
import { getRoleLabel, formatDateTime } from '../../utils/formatters'

const ROLE_COLOR = { admin: 'blue', teacher: 'green', gov_observer: 'purple' }

const EMPTY_FORM = {
  name: '', email: '', password: '', role: 'teacher', school_id: '', region_id: '',
}

export default function UserManagement() {
  const { toast }                    = useApp()
  const [users, setUsers]            = useState(() => getAllUsers())
  const [search, setSearch]          = useState('')
  const [roleFilter, setRoleFilter]  = useState('')
  const [modal, setModal]            = useState(false)
  const [form, setForm]              = useState(EMPTY_FORM)
  const [errors, setErrors]          = useState({})
  const [saving, setSaving]          = useState(false)
  const [showPwd, setShowPwd]        = useState(false)

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return (
      (!search || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (!roleFilter || u.role === roleFilter)
    )
  })

  function handleToggle(userId) {
    const result = toggleUserActive(userId)
    if (result.success) {
      setUsers(getAllUsers())
      toast.success(result.is_active ? 'Akun diaktifkan.' : 'Akun dinonaktifkan.')
    } else {
      toast.error(result.message ?? 'Gagal mengubah status.')
    }
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function openModal() {
    setForm(EMPTY_FORM)
    setErrors({})
    setShowPwd(false)
    setModal(true)
  }

  async function handleCreate() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    const payload = {
      ...form,
      school_id: form.role === 'teacher'      ? form.school_id  : null,
      region_id: form.role === 'gov_observer'  ? form.region_id : null,
    }
    const result = createUser(payload)
    setSaving(false)

    if (!result.success) {
      if (result.field) setErrors({ [result.field]: result.message })
      else toast.error(result.message ?? 'Gagal membuat pengguna.')
      return
    }

    setUsers(getAllUsers())
    toast.success(`Akun ${result.user.name} berhasil dibuat.`)
    setModal(false)
  }

  const schoolOpts  = schoolsData.map(s => ({ value: s.id, label: s.name }))
  const regionOpts  = regionsData.map(r => ({ value: r.id, label: r.name }))
  const roleOpts    = [
    { value: 'teacher',      label: 'Guru' },
    { value: 'gov_observer', label: 'Pengamat Dinas' },
    { value: 'admin',        label: 'Administrator' },
  ]

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} pengguna terdaftar</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={openModal}>
          Tambah Pengguna
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau email..." className="input pl-9 text-sm w-56" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input text-sm w-44">
          <option value="">Semua Role</option>
          <option value="admin">Administrator</option>
          <option value="teacher">Guru</option>
          <option value="gov_observer">Pengamat Dinas</option>
        </select>
      </div>

      {/* Table */}
      <Card noPadding>
        {filtered.length === 0 ? (
          <EmptyState icon={<Users size={28} />} title="Tidak ada pengguna ditemukan" compact />
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="th">Nama</th>
                <th className="th">Role</th>
                <th className="th">Sekolah / Wilayah</th>
                <th className="th w-32">Login Terakhir</th>
                <th className="th w-24 text-center">Status</th>
                <th className="th w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className={`border-b border-gray-100 hover:bg-gray-50 ${!user.is_active ? 'opacity-60' : ''}`}>
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center
                                      text-gray-600 text-xs font-semibold shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td">
                    <Badge color={ROLE_COLOR[user.role] ?? 'gray'} size="sm">
                      {getRoleLabel(user.role)}
                    </Badge>
                  </td>
                  <td className="td text-sm text-gray-600">
                    {user.school?.name ?? user.region?.name ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="td text-xs text-gray-500">{formatDateTime(user.last_login)}</td>
                  <td className="td text-center">
                    <Badge color={user.is_active ? 'green' : 'gray'} size="sm">
                      {user.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="td text-center">
                    {user.role !== 'admin' && (
                      <Button size="sm" variant={user.is_active ? 'danger' : 'secondary'}
                        onClick={() => handleToggle(user.id)}>
                        {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Add User Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Tambah Pengguna Baru"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
            <Button variant="primary" loading={saving} onClick={handleCreate}>
              Buat Akun
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextInput label="Nama Lengkap" required value={form.name}
            onChange={e => set('name', e.target.value)} error={errors.name}
            placeholder="Nama lengkap pengguna" />

          <TextInput label="Email" required type="email" value={form.email}
            onChange={e => set('email', e.target.value)} error={errors.email}
            placeholder="email@sekolah.id" />

          {/* Password with show/hide */}
          <div className="flex flex-col gap-1">
            <label className="label">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Minimal 6 karakter"
                className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
          </div>

          <SelectInput label="Role" required options={roleOpts} value={form.role}
            onChange={e => set('role', e.target.value)} placeholder={null} />

          {/* Conditional school / region selector */}
          {form.role === 'teacher' && (
            <SelectInput label="Sekolah" options={schoolOpts} value={form.school_id}
              onChange={e => set('school_id', e.target.value)}
              placeholder="Pilih sekolah..." />
          )}
          {form.role === 'gov_observer' && (
            <SelectInput label="Wilayah" options={regionOpts} value={form.region_id}
              onChange={e => set('region_id', e.target.value)}
              placeholder="Pilih wilayah..." />
          )}
        </div>
      </Modal>
    </div>
  )
}
