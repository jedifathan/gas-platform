import { useState, useMemo } from 'react'
import { FileText }        from 'lucide-react'
import { useReports }      from '../../hooks/useReports'
import { useAuth }         from '../../hooks/useAuth'
import { useApp }          from '../../hooks/useApp'
import Card                from '../../components/ui/Card'
import StatusPill          from '../../components/ui/StatusPill'
import EmptyState          from '../../components/ui/EmptyState'
import ReportFilterBar     from '../../components/reports/ReportFilterBar'
import schoolsData         from '../../data/schools.json'
import { formatPeriod, formatRelativeTime } from '../../utils/formatters'

export default function GovReports() {
  const { session }   = useAuth()
  const { period }    = useApp()
  const { getFiltered, activityTypes } = useReports()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ period })

  function handleFilterChange(key, value) {
    setFilters(f => ({ ...f, [key]: value }))
  }

  // Gov observer: region scoped reports
  const reports = useMemo(() => {
    return getFiltered({ region_id: session?.region_id, ...filters })
  }, [session, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  const displayed = useMemo(() => {
    if (!search) return reports
    const q = search.toLowerCase()
    return reports.filter(r =>
      r.school_name?.toLowerCase().includes(q) ||
      r.activity_label?.toLowerCase().includes(q)
    )
  }, [reports, search])

  // Only schools in this region
  const regionSchools = schoolsData.filter(s => s.region_id === session?.region_id)

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan Wilayah</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {displayed.length} laporan · hanya baca
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5">
        <ReportFilterBar
          filters={filters}
          onChange={handleFilterChange}
          schools={regionSchools.map(s => ({ id: s.id, name: s.name }))}
          search={search}
          onSearch={setSearch}
        />
      </div>

      {/* Read-only badge */}
      <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700 w-fit">
        <FileText size={13} />
        Mode hanya baca — Pengamat Dinas tidak dapat memvalidasi laporan.
      </div>

      {/* Table */}
      <Card noPadding>
        {displayed.length === 0 ? (
          <EmptyState icon={<FileText size={28} />} title="Tidak ada laporan ditemukan" compact />
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="th">Sekolah</th>
                <th className="th">Kegiatan</th>
                <th className="th w-28">Periode</th>
                <th className="th w-20 text-center">Peserta</th>
                <th className="th w-28 text-center">Status</th>
                <th className="th w-24">Dikirim</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(r => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="td">
                    <p className="font-medium text-gray-900 text-sm">{r.school_name}</p>
                    <p className="text-xs text-gray-400">{r.school_district}</p>
                  </td>
                  <td className="td text-sm text-gray-700">{r.activity_label}</td>
                  <td className="td text-xs text-gray-600">{formatPeriod(r.report_period)}</td>
                  <td className="td text-center text-sm">{r.participant_count}</td>
                  <td className="td text-center"><StatusPill status={r.status} size="sm" /></td>
                  <td className="td text-xs text-gray-500">
                    {r.submitted_at ? formatRelativeTime(r.submitted_at) : '—'}
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
