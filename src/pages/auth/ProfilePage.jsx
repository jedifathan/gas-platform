import { useState } from 'react'
import { User, Mail, Shield, School, MapPin, Clock } from 'lucide-react'
import { useAuth }  from '../../hooks/useAuth'
import { useApp }   from '../../hooks/useApp'
import Card         from '../../components/ui/Card'
import Button       from '../../components/ui/Button'
import Badge        from '../../components/ui/Badge'
import { getRoleLabel, formatDateTime } from '../../utils/formatters'

const ROLE_COLOR = {
  admin:        'blue',
  teacher:      'green',
  gov_observer: 'purple',
}

export default function ProfilePage() {
  const { session }   = useAuth()
  const { toast }     = useApp()
  const [saved, setSaved] = useState(false)

  // Simulated save — in production this would call PATCH /api/users/:id
  function handleSave() {
    setSaved(true)
    toast.success('Profil berhasil disimpan.')
    setTimeout(() => setSaved(false), 2000)
  }

  if (!session) return null

  const infoRows = [
    { icon: User,    label: 'Nama Lengkap',  value: session.name },
    { icon: Mail,    label: 'Email',         value: session.email },
    { icon: Shield,  label: 'Role',          value: getRoleLabel(session.role) },
    session.school && { icon: School, label: 'Sekolah', value: `${session.school.name} — ${session.school.district}` },
    session.region && { icon: MapPin,  label: 'Wilayah', value: session.region.name },
    { icon: Clock,   label: 'Login Terakhir', value: formatDateTime(session.last_login) },
  ].filter(Boolean)

  return (
    <div className="page-wrapper max-w-2xl">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Profil Saya</h1>
          <p className="text-sm text-gray-500 mt-0.5">Informasi akun Anda di Platform GAS.</p>
        </div>
      </div>

      {/* Avatar + name card */}
      <Card className="mb-5">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center
                          text-teal-700 font-bold text-2xl shrink-0">
            {session.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{session.name}</h2>
            <p className="text-sm text-gray-500 truncate">{session.email}</p>
            <div className="mt-2">
              <Badge color={ROLE_COLOR[session.role] ?? 'gray'}>
                {getRoleLabel(session.role)}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Detail rows */}
      <Card title="Informasi Akun" className="mb-5">
        <dl className="divide-y divide-gray-100">
          {infoRows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 py-3">
              <Icon size={15} className="text-gray-400 shrink-0" />
              <dt className="w-36 text-xs font-medium text-gray-500 shrink-0">{label}</dt>
              <dd className="text-sm text-gray-800 truncate">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* Permissions card */}
      <Card title="Hak Akses" subtitle={`${session.permissions.length} permission aktif`}>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {session.permissions.map(p => (
            <span key={p}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
              {p}
            </span>
          ))}
        </div>
      </Card>

      {/* Prototype note */}
      <p className="text-xs text-gray-400 mt-6 text-center">
        Prototipe: perubahan profil tidak disimpan ke database permanen.
      </p>
    </div>
  )
}
