import { useNavigate } from 'react-router-dom'
import { Plus, FileText } from 'lucide-react'
import { useReports }  from '../../hooks/useReports'
import { useApp }      from '../../hooks/useApp'
import Button          from '../../components/ui/Button'
import Card            from '../../components/ui/Card'
import StatusPill      from '../../components/ui/StatusPill'
import EmptyState      from '../../components/ui/EmptyState'
import Spinner         from '../../components/ui/Spinner'
import SelectInput     from '../../components/forms/SelectInput'
import { formatPeriod, formatRelativeTime, getPeriodOptions } from '../../utils/formatters'

const STATUS_OPTS = [
  { value: '', label: 'Semua Status' },
  { value: 'draft',     label: 'Draft' },
  { value: 'submitted', label: 'Menunggu Validasi' },
  { value: 'validated', label: 'Tervalidasi' },
  { value: 'rejected',  label: 'Ditolak' },
]

export default function TeacherReports() {
  const navigate               = useNavigate()
  const { period }             = useApp()
  const { reports, loading, filters, applyFilters } = useReports({ period })

  if (loading) return <Spinner center />

  const filteredByStatus = filters.status
    ? reports.filter(r => r.status === filters.status)
    : reports

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan Kegiatan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {reports.length} laporan · {formatPeriod(period)}
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={15} />}
          onClick={() => navigate('/app/teacher/reports/new')}>
          Buat Laporan
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 mb-5">
        <SelectInput
          options={STATUS_OPTS}
          value={filters.status ?? ''}
          onChange={e => applyFilters({ status: e.target.value || undefined })}
          placeholder={null}
          className="max-w-[200px]"
        />
      </div>

      {/* Report list */}
      {filteredByStatus.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText size={28} />}
            title="Belum ada laporan"
            message="Buat laporan kegiatan pertama Anda untuk periode ini."
            action={
              <Button variant="primary" icon={<Plus size={15} />}
                onClick={() => navigate('/app/teacher/reports/new')}>
                Buat Laporan
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredByStatus.map(report => (
            <div
              key={report.id}
              onClick={() => navigate(`/app/teacher/reports/${report.id}`)}
              className="card p-4 flex items-center gap-4 cursor-pointer
                         hover:border-teal-200 transition-colors group"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center
                              justify-center shrink-0 group-hover:bg-teal-50 transition-colors">
                <FileText size={16} className="text-gray-500 group-hover:text-teal-600" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-teal-700">
                    {report.activity_label}
                  </p>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">{report.participant_count} peserta</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatPeriod(report.report_period)} · {formatRelativeTime(report.updated_at)}
                </p>
                {report.admin_notes && (
                  <p className="text-xs text-gray-500 mt-1 italic truncate">
                    Catatan: {report.admin_notes}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="shrink-0 flex flex-col items-end gap-1">
                <StatusPill status={report.status} size="sm" />
                <span className="text-[10px] text-gray-400">
                  {report.score_weight} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
