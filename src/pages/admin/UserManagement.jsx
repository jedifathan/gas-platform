import { useState } from 'react'
import { Search, Users, Shield, School } from 'lucide-react'
import { getAllUsers, toggleUserActive } from '../../services/authService'
import { useApp }    from '../../hooks/useApp'
import Card          from '../../components/ui/Card'
import Badge         from '../../components/ui/Badge'
import Button        from '../../components/ui/Button'
import EmptyState    from '../../components/ui/EmptyState'
import { getRoleLabel, formatDateTime } from '../../utils/formatters'

const ROLE_COLOR = { admin: 'blue', teacher: 'green', gov_observer: 'purple' }

export default function UserManagement() {
  const { toast }                = useApp()
  const [users, setUsers]        = useState(() => getAllUsers())
  const [search, setSearch]      = useState('')
  const [roleFilter, setRoleFilter] = useState('')

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

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} pengguna terdaftar</p>
        </div>
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
                <th className="th w-24 text-center">Aksi</th>
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
                  <td className="td text-xs text-gray-500">
                    {formatDateTime(user.last_login)}
                  </td>
                  <td className="td text-center">
                    <Badge color={user.is_active ? 'green' : 'gray'} size="sm">
                      {user.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="td text-center">
                    {user.role !== 'admin' && (
                      <Button
                        size="sm"
                        variant={user.is_active ? 'danger' : 'secondary'}
                        onClick={() => handleToggle(user.id)}
                      >
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
    </div>
  )
}
