import { useState } from 'react'
import { Search, MapPin, Calendar, CheckCircle } from 'lucide-react'
import schoolsData  from '../../data/schools.json'
import regionsData  from '../../data/regions.json'
import { formatDate } from '../../utils/formatters'

const STATUS_CONFIG = {
  active:  { label: 'Aktif',    className: 'pill-green' },
  pending: { label: 'Pending',  className: 'pill-yellow' },
  inactive:{ label: 'Nonaktif', className: 'pill-gray' },
}

export default function PublicSchools() {
  const [search,   setSearch]   = useState('')
  const [regionId, setRegionId] = useState('')

  const filtered = schoolsData.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.district.toLowerCase().includes(search.toLowerCase())
    const matchesRegion = !regionId || s.region_id === regionId
    return matchesSearch && matchesRegion
  })

  function getRegion(id) {
    return regionsData.find(r => r.id === id)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sekolah Peserta Program GAS</h1>
        <p className="text-sm text-gray-500">
          {schoolsData.filter(s => s.status === 'active').length} sekolah aktif dari{' '}
          {schoolsData.length} sekolah terdaftar
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-7">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama sekolah atau kecamatan..."
            className="input pl-9 text-sm"
          />
        </div>
        <select
          value={regionId}
          onChange={e => setRegionId(e.target.value)}
          className="input text-sm max-w-xs"
        >
          <option value="">Semua Wilayah</option>
          {regionsData.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* School grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400 text-sm">
          Tidak ada sekolah yang cocok dengan filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(school => {
            const region  = getRegion(school.region_id)
            const statusCfg = STATUS_CONFIG[school.status] ?? STATUS_CONFIG.inactive
            return (
              <div key={school.id} className="card p-5 hover:border-teal-200 transition-colors">
                {/* Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <CheckCircle size={16} className="text-teal-600" />
                  </div>
                  <span className={`pill ${statusCfg.className}`}>{statusCfg.label}</span>
                </div>

                {/* Name */}
                <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-snug">
                  {school.name}
                </h3>

                {/* Meta */}
                <div className="space-y-1.5 mt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{school.district}, {region?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={12} className="shrink-0" />
                    <span>Mulai: {formatDate(school.program_start_date)}</span>
                  </div>
                </div>

                {/* Principal */}
                <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100 truncate">
                  Kepala Sekolah: {school.principal_name}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
