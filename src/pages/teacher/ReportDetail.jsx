import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, FileText, User, Calendar, Users, MessageSquare } from 'lucide-react'
import { useReports }    from '../../hooks/useReports'
import Card              from '../../components/ui/Card'
import Button            from '../../components/ui/Button'
import StatusPill        from '../../components/ui/StatusPill'
import { formatPeriod, formatDateTime } from '../../utils/formatters'

export default function ReportDetail() {
  const { reportId } = useParams()
  const navigate     = useNavigate()
  const { getById }  = useReports()

  const report = getById(reportId)

  if (!report) {
    return (
      <div className="page-wrapper text-center text-gray-400 py-20">
        <FileText size={36} className="mx-auto mb-3 opacity-40" />
        <p>Laporan tidak ditemukan.</p>
        <Button className="mt-4" variant="secondary"
          onClick={() => navigate('/app/teacher/reports')}>
          Kembali ke Laporan
        </Button>
      </div>
    )
  }

  const infoRows = [
    { icon: Calendar,      label: 'Periode',          value: formatPeriod(report.report_period) },
    { icon: FileText,      label: 'Jenis Kegiatan',    value: report.activity_label },
    { icon: Users,         label: 'Jumlah Peserta',    value: `${report.participant_count} anak` },
    { icon: User,          label: 'Guru Pelapor',      value: report.teacher_name },
    { icon: Calendar,      label: 'Dikirim',           value: formatDateTime(report.submitted_at) },
  ]

  return (
    <div className="page-wrapper max-w-2xl">
      {/* Back button */}
      <div className="mb-5">
        <Button variant="ghost" size="sm" icon={<ChevronLeft size={15} />}
          onClick={() => navigate('/app/teacher/reports')}>
          Kembali ke Laporan
        </Button>
      </div>

      {/* Header card */}
      <Card className="mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
              <FileText size={18} className="text-teal-600" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">{report.activity_label}</h1>
              <p className="text-xs text-gray-500">{report.school_name} · {report.school_district}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <StatusPill status={report.status} />
            <span className="text-xs font-semibold text-teal-700">
              +{report.score_weight} pts
            </span>
          </div>
        </div>
      </Card>

      {/* Info table */}
      <Card title="Informasi Laporan" className="mb-4">
        <dl className="divide-y divide-gray-100">
          {infoRows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 py-3">
              <Icon size={14} className="text-gray-400 shrink-0" />
              <dt className="w-36 text-xs font-medium text-gray-500 shrink-0">{label}</dt>
              <dd className="text-sm text-gray-800">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* Description */}
      <Card title="Deskripsi Kegiatan" className="mb-4">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {report.description || <span className="text-gray-400 italic">Tidak ada deskripsi.</span>}
        </p>
      </Card>

      {/* Evidence */}
      {report.evidence_notes && (
        <Card title="Catatan Dokumentasi" className="mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">{report.evidence_notes}</p>
        </Card>
      )}

      {/* Admin notes */}
      {(report.status === 'validated' || report.status === 'rejected') && (
        <Card
          className={`mb-4 ${
            report.status === 'validated'
              ? 'border-teal-200 bg-teal-50/30'
              : 'border-red-200 bg-red-50/30'
          }`}
        >
          <div className="flex items-start gap-3">
            <MessageSquare size={16} className={
              report.status === 'validated' ? 'text-teal-500 shrink-0 mt-0.5' : 'text-red-500 shrink-0 mt-0.5'
            } />
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {report.status === 'validated' ? 'Laporan Divalidasi' : 'Laporan Ditolak'}
              </p>
              <p className="text-xs text-gray-600">{formatDateTime(report.validated_at)}</p>
              {report.admin_notes && (
                <p className="text-sm text-gray-700 mt-2 leading-relaxed italic">
                  "{report.admin_notes}"
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      {report.status === 'rejected' && (
        <Button variant="primary" icon={<FileText size={14} />}
          onClick={() => navigate('/app/teacher/reports/new')}>
          Buat Laporan Baru
        </Button>
      )}
    </div>
  )
}
