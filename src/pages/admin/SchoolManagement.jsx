import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, School, MapPin, ChevronRight } from 'lucide-react'
import schoolsData  from '../../data/schools.json'
import regionsData  from '../../data/regions.json'
import Card         from '../../components/ui/Card'
import Badge        from '../../components/ui/Badge'
import EmptyState   from '../../components/ui/EmptyState'
import { formatDate } from '../../utils/formatters'

const STATUS_CONFIG = {
  active:   { label: 'Aktif',    color: 'green'  },
  pending:  { label: 'Pending',  color: 'yellow' },
  inactive: { label: 'Nonaktif', color: 'gray'   },
}

export default function SchoolManagement() {
  const navigate           = useNavigate()
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [status, setStatus] = useState('')

  const filtered = schoolsData.filter(s => {
    const q = search.toLowerCase()
    return (
      (!search || s.name.toLowerCase().includes(q) || s.district.toLowerCase().includes(q)) &&
      (!region || s.region_id === region) &&
      (!status || s.status === status)
    )
  })

  function getRegion(id) { return regionsData.find(r => r.id === id) }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Sekolah</h1>
          <p className="text-sm text-gray-500 mt-0.5">{schoolsData.length} sekolah terdaftar</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau kecamatan..." className="input pl-9 text-sm w-56" />
        </div>
        <select value={region} onChange={e => setRegion(e.target.value)} className="input text-sm w-48">
          <option value="">Semua Wilayah</option>
          {regionsData.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input text-sm w-36">
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="pending">Pending</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      {/* Table */}
      <Card noPadding>
        {filtered.length === 0 ? (
          <EmptyState icon={<School size={28} />} title="Tidak ada sekolah ditemukan" compact />
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="th">Nama Sekolah</th>
                <th className="th">Wilayah</th>
                <th className="th w-28">Bergabung</th>
                <th className="th w-24 text-center">Status</th>
                <th className="th w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(school => {
                const region   = getRegion(school.region_id)
                const statusCfg = STATUS_CONFIG[school.status] ?? STATUS_CONFIG.inactive
                return (
                  <tr key={school.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer group"
                    onClick={() => navigate(`/app/admin/schools/${school.id}`)}
                  >
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                          <School size={14} className="text-teal-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-teal-700">
                            {school.name}
                          </p>
                          <p className="text-xs text-gray-400">{school.principal_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        <span className="truncate">{school.district}, {region?.name}</span>
                      </div>
                    </td>
                    <td className="td text-xs text-gray-500">{formatDate(school.program_start_date)}</td>
                    <td className="td text-center">
                      <Badge color={statusCfg.color} size="sm">{statusCfg.label}</Badge>
                    </td>
                    <td className="td text-center">
                      <ChevronRight size={15} className="text-gray-300 group-hover:text-teal-500 transition-colors" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
