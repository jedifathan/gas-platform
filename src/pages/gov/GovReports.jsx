import { useState, useMemo, useCallback } from 'react'
import { FileText, Download }  from 'lucide-react'
import { useReports }          from '../../hooks/useReports'
import { useAuth }             from '../../hooks/useAuth'
import { useApp }              from '../../hooks/useApp'
import Card                    from '../../components/ui/Card'
import StatusPill              from '../../components/ui/StatusPill'
import Button                  from '../../components/ui/Button'
import EmptyState              from '../../components/ui/EmptyState'
import ReportFilterBar         from '../../components/reports/ReportFilterBar'
import schoolsData             from '../../data/schools.json'
import { downloadCSV }         from '../../utils/csvExport'
import { formatPeriod, formatRelativeTime } from '../../utils/formatters'

/**
 * BUG FIX: The previous useMemo for `reports` suppressed its `getFiltered`
 * dependency with an eslint-disable comment, causing stale data when underlying
 * reports changed. Now uses a stable useCallback ref so the memo updates correctly.
 */
export default function GovReports() {
  const { session }   = useAuth()
  const { period, toast } = useApp()
  const { getFiltered, activityTypes } = useReports()

  const [search,  setSearch]  = useState('')
  const [filters, setFilters] = useState({ period })

  function handleFilterChange(key, value) {
    setFilters(f => ({ ...f, [key]: value }))
  }

  // Stable scoped fetch — depends on session, filters, and getFiltered
  const reports = useMemo(() => {
    return getFiltered({ region_id: session?.region_id, ...filters })
  }, [session?.region_id, filters, getFiltered])

  const displayed = useMemo(() => {
    if (!search) return reports
    const q = search.toLowerCase()
    return reports.filter(r =>
      r.school_name?.toLowerCase().includes(q) ||
      r.activity_label?.toLowerCase().includes(q)
    )
  }, [reports, search])

  const regionSchools = schoolsData.filter(s => s.region_id === session?.region_id)

  function handleExport() {
    downloadCSV(`laporan-wilayah-${filters.period ?? 'semua'}.csv`, displayed, [
      { key: 'school_name',       label: 'Nama Sekolah' },
      { key: 'school_district',   label: 'Kecamatan' },
      { key: 'activity_label',    label: 'Jenis Kegiatan' },
      { key: 'report_period',     label: 'Periode' },
      { key: 'participant_count', label: 'Jumlah Peserta' },
      { key: 'status',            label: 'Status' },
      { key: 'teacher_name',      label: 'Guru' },
      { key: 'submitted_at',      label: 'Dikirim' },
    ])
    toast.success(`${displayed.length} laporan diekspor.`)
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan Wilayah</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {displayed.length} laporan · hanya baca
          </p>
        </div>
        <Button
          variant="secondary"
          icon={<Download size={14} />}
          onClick={handleExport}
          disabled={displayed.length === 0}
        >
          Export CSV
        </Button>
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
      <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50
                      border border-blue-200 text-xs text-blue-700 w-fit">
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
                <tr key={r.id} className="border-b border-gray-100 hover:bg-alabaster">
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
