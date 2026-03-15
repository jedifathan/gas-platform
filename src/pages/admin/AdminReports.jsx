import { useState, useMemo } from 'react'
import { useNavigate }   from 'react-router-dom'
import { FileText }      from 'lucide-react'
import { useReports }    from '../../hooks/useReports'
import Card              from '../../components/ui/Card'
import StatusPill        from '../../components/ui/StatusPill'
import Button            from '../../components/ui/Button'
import EmptyState        from '../../components/ui/EmptyState'
import ReportFilterBar   from '../../components/reports/ReportFilterBar'
import schoolsData       from '../../data/schools.json'
import regionsData       from '../../data/regions.json'
import { formatPeriod, formatRelativeTime } from '../../utils/formatters'

export default function AdminReports() {
  const navigate                           = useNavigate()
  const { reports, loading, filters, applyFilters } = useReports()
  const [search, setSearch]                = useState('')

  // For admin, override role-scoped filter — get all reports
  const allReports = useReports().getFiltered({})

  const displayed = useMemo(() => {
    let list = allReports
    if (filters.status)    list = list.filter(r => r.status    === filters.status)
    if (filters.period)    list = list.filter(r => r.report_period === filters.period)
    if (filters.school_id) list = list.filter(r => r.school_id === filters.school_id)
    if (filters.region_id) {
      const ids = schoolsData.filter(s => s.region_id === filters.region_id).map(s => s.id)
      list = list.filter(r => ids.includes(r.school_id))
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.school_name?.toLowerCase().includes(q) ||
        r.activity_label?.toLowerCase().includes(q)
      )
    }
    return list
  }, [allReports, filters, search])

  const pendingCount = displayed.filter(r => r.status === 'submitted').length

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Semua Laporan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {displayed.length} laporan
            {pendingCount > 0 && <span className="ml-2 text-amber-600 font-medium">· {pendingCount} menunggu validasi</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5">
        <ReportFilterBar
          filters={filters}
          onChange={(key, value) => applyFilters({ [key]: value })}
          schools={schoolsData.map(s => ({ id: s.id, name: s.name }))}
          regions={regionsData}
          search={search}
          onSearch={setSearch}
        />
      </div>

      {/* Report list */}
      <Card noPadding>
        {displayed.length === 0 ? (
          <EmptyState icon={<FileText size={28} />} title="Tidak ada laporan" compact />
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="th">Sekolah</th>
                <th className="th">Kegiatan</th>
                <th className="th w-28">Periode</th>
                <th className="th w-20 text-center">Peserta</th>
                <th className="th w-28 text-center">Status</th>
                <th className="th w-24 text-center">Dikirim</th>
                <th className="th w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(r => (
                <tr key={r.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/app/admin/reports/${r.id}`)}
                >
                  <td className="td">
                    <p className="font-medium text-gray-900 text-sm">{r.school_name}</p>
                    <p className="text-xs text-gray-400">{r.school_district}</p>
                  </td>
                  <td className="td text-sm text-gray-700">{r.activity_label}</td>
                  <td className="td text-xs text-gray-600">{formatPeriod(r.report_period)}</td>
                  <td className="td text-center text-sm">{r.participant_count}</td>
                  <td className="td text-center"><StatusPill status={r.status} size="sm" /></td>
                  <td className="td text-center text-xs text-gray-500">
                    {r.submitted_at ? formatRelativeTime(r.submitted_at) : '—'}
                  </td>
                  <td className="td text-center" onClick={e => e.stopPropagation()}>
                    {r.status === 'submitted' && (
                      <Button size="sm" variant="primary"
                        onClick={() => navigate(`/app/admin/reports/${r.id}`)}>
                        Review
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
