import { useState } from 'react'
import { Search, Users, Plus, Eye, EyeOff, Edit2 } from 'lucide-react'
import { getAllUsers, toggleUserActive, createUser, updateUser } from '../../services/authService'
import { getAllRegions } from '../../services/regionService'
import schoolsData from '../../data/schools.json'
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
const EMPTY_FORM = { name: '', email: '', password: '', role: 'teacher', school_id: '', region_id: '' }

const ROLE_OPTS = [
  { value: 'teacher',      label: 'Guru' },
  { value: 'gov_observer', label: 'Pengamat Dinas' },
  { value: 'admin',        label: 'Administrator' },
]

export default function UserManagement() {
  const { toast }                   = useApp()
  const [users,      setUsers]      = useState(() => getAllUsers())
  const [search,     setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [modal,      setModal]      = useState(null)   // 'create' | 'edit' | null
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [errors,     setErrors]     = useState({})
  const [saving,     setSaving]     = useState(false)
  const [showPwd,    setShowPwd]    = useState(false)

  // Pull regions dynamically so new regions added via RegionManagement appear here
  const regions   = getAllRegions()
  const schoolOpts = schoolsData.map(s => ({ value: s.id, label: s.name }))
  const regionOpts = regions.map(r => ({ value: r.id, label: `${r.name} (${r.province})` }))

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

  // When role changes in form, clear incompatible school/region
  function setRole(value) {
    setForm(f => ({
      ...f,
      role:      value,
      school_id: value === 'teacher'      ? f.school_id : '',
      region_id: value === 'gov_observer' ? f.region_id : '',
    }))
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setShowPwd(false)
    setModal('create')
  }

  function openEdit(e, user) {
    e.stopPropagation()
    setEditing(user)
    setForm({
      name:      user.name,
      email:     user.email,
      password:  '',
      role:      user.role,
      school_id: user.school?.id  ?? '',
      region_id: user.region?.id  ?? '',
    })
    setErrors({})
    setShowPwd(false)
    setModal('edit')
  }

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    let result
    if (modal === 'create') {
      result = createUser({
        ...form,
        school_id: form.role === 'teacher'      ? form.school_id : null,
        region_id: form.role === 'gov_observer' ? form.region_id : null,
      })
    } else {
      const payload = {
        name:      form.name,
        email:     form.email,
        role:      form.role,
        school_id: form.role === 'teacher'      ? form.school_id : null,
        region_id: form.role === 'gov_observer' ? form.region_id : null,
      }
      if (form.password.trim()) payload.password = form.password.trim()
      result = updateUser(editing.id, payload)
    }

    setSaving(false)

    if (!result.success) {
      if (result.field) setErrors({ [result.field]: result.message })
      else toast.error(result.message ?? 'Gagal menyimpan.')
      return
    }

    setUsers(getAllUsers())
    toast.success(modal === 'create'
      ? `Akun ${result.user.name} berhasil dibuat.`
      : 'Data pengguna berhasil diperbarui.')
    setModal(null)
  }

  const isCreate = modal === 'create'

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} pengguna terdaftar</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>
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
                <th className="th w-40 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${!user.is_active ? 'opacity-60' : ''}`}>
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
                    <div className="flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" icon={<Edit2 size={12} />}
                        onClick={e => openEdit(e, user)}>
                        Edit
                      </Button>
                      {user.role !== 'admin' && (
                        <Button size="sm" variant={user.is_active ? 'danger' : 'ghost'}
                          onClick={() => handleToggle(user.id)}>
                          {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={isCreate ? 'Tambah Pengguna Baru' : `Edit — ${editing?.name}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              {isCreate ? 'Buat Akun' : 'Simpan Perubahan'}
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

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="label">
              Password {isCreate && <span className="text-red-500">*</span>}
              {!isCreate && <span className="text-gray-400 font-normal text-xs ml-1">(kosongkan jika tidak diubah)</span>}
            </label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder={isCreate ? 'Minimal 6 karakter' : '••••••••'}
                className={`input pr-10 ${errors.password ? 'input-error' : ''}`} />
              <button type="button" onClick={() => setShowPwd(v => !v)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
          </div>

          {/* Role — now editable in both create AND edit modes */}
          <SelectInput label="Role" required options={ROLE_OPTS} value={form.role}
            onChange={e => setRole(e.target.value)} placeholder={null} />

          {/* Role change warning when editing */}
          {!isCreate && form.role !== editing?.role && (
            <div className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <span className="text-xs text-amber-700">
                Mengubah role dari <strong>{getRoleLabel(editing?.role)}</strong> ke <strong>{getRoleLabel(form.role)}</strong>.
                Sekolah/wilayah yang tidak sesuai akan dihapus otomatis.
              </span>
            </div>
          )}

          {/* Conditional school / region */}
          {form.role === 'teacher' && (
            <SelectInput label="Sekolah" options={schoolOpts} value={form.school_id}
              onChange={e => set('school_id', e.target.value)} placeholder="Pilih sekolah..." />
          )}
          {form.role === 'gov_observer' && (
            <SelectInput label="Wilayah" options={regionOpts} value={form.region_id}
              onChange={e => set('region_id', e.target.value)} placeholder="Pilih wilayah..." />
          )}
        </div>
      </Modal>
    </div>
  )
}
