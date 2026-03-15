/**
 * ReportFilterBar — filter controls shared by AdminReports and GovReports.
 *
 * Props:
 *   filters      { status, period, school_id, region_id }
 *   onChange     (key, value) => void
 *   schools      { id, name }[]  (optional — show school dropdown)
 *   regions      { id, name }[]  (optional — show region dropdown)
 *   showSearch   boolean  (default true)
 *   search       string
 *   onSearch     (value) => void
 */
import { Search } from 'lucide-react'
import { getPeriodOptions } from '../../utils/formatters'

const STATUS_OPTS = [
  { value: '',          label: 'Semua Status' },
  { value: 'submitted', label: 'Menunggu Validasi' },
  { value: 'validated', label: 'Tervalidasi' },
  { value: 'rejected',  label: 'Ditolak' },
  { value: 'draft',     label: 'Draft' },
]

export default function ReportFilterBar({
  filters    = {},
  onChange,
  schools    = [],
  regions    = [],
  showSearch = true,
  search     = '',
  onSearch,
}) {
  const periodOpts = getPeriodOptions(6)

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      {showSearch && (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => onSearch?.(e.target.value)}
            placeholder="Cari sekolah atau kegiatan..."
            className="input pl-9 text-sm w-56"
          />
        </div>
      )}

      {/* Period */}
      <select
        value={filters.period ?? ''}
        onChange={e => onChange('period', e.target.value || undefined)}
        className="input text-sm w-40"
      >
        <option value="">Semua Periode</option>
        {periodOpts.map(p => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      {/* Status */}
      <select
        value={filters.status ?? ''}
        onChange={e => onChange('status', e.target.value || undefined)}
        className="input text-sm w-44"
      >
        {STATUS_OPTS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Region (admin only) */}
      {regions.length > 0 && (
        <select
          value={filters.region_id ?? ''}
          onChange={e => onChange('region_id', e.target.value || undefined)}
          className="input text-sm w-48"
        >
          <option value="">Semua Wilayah</option>
          {regions.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      )}

      {/* School */}
      {schools.length > 0 && (
        <select
          value={filters.school_id ?? ''}
          onChange={e => onChange('school_id', e.target.value || undefined)}
          className="input text-sm w-48"
        >
          <option value="">Semua Sekolah</option>
          {schools.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}
    </div>
  )
}
