import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, Trash2 } from 'lucide-react'
import { useReports }  from '../../hooks/useReports'
import { useApp }      from '../../hooks/useApp'
import Button          from '../../components/ui/Button'
import Card            from '../../components/ui/Card'
import Modal           from '../../components/ui/Modal'
import StatusPill      from '../../components/ui/StatusPill'
import EmptyState      from '../../components/ui/EmptyState'
import Spinner         from '../../components/ui/Spinner'
import SelectInput     from '../../components/forms/SelectInput'
import { formatPeriod, formatRelativeTime } from '../../utils/formatters'

const STATUS_OPTS = [
  { value: '', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Menunggu Validasi' },
  { value: 'validated', label: 'Tervalidasi' },
  { value: 'rejected', label: 'Ditolak' },
]

export default function TeacherReports() {
  const navigate = useNavigate()
  const { period, toast } = useApp()
  const { getFiltered, loading, removeDraft } = useReports()
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const reports = useMemo(() => {
    const f = { period }
    if (statusFilter) f.status = statusFilter
    return getFiltered(f)
  }, [period, statusFilter, getFiltered])

  if (loading) return <Spinner center />

  async function handleDeleteConfirm() {
    setDeleting(true)
    await new Promise(r => setTimeout(r, 300))
    const result = removeDraft(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    if (result.success) toast.success('Draft laporan dihapus.')
    else toast.error(result.message ?? 'Gagal menghapus laporan.')
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan Kegiatan</h1>
          <p className="text-sm text-gray-500 mt-0.5">{reports.length} laporan · {formatPeriod(period)}</p>
        </div>
        <Button variant="primary" icon={<Plus size={15} />} onClick={() => navigate('/app/teacher/reports/new')}>
          Buat Laporan
        </Button>
      </div>
      <div className="flex gap-3 mb-5">
        <SelectInput options={STATUS_OPTS} value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)} placeholder={null} className="max-w-[200px]" />
      </div>
      {reports.length === 0 ? (
        <Card>
          <EmptyState icon={<FileText size={28} />} title="Belum ada laporan"
            message="Buat laporan kegiatan pertama Anda untuk periode ini."
            action={<Button variant="primary" icon={<Plus size={15} />} onClick={() => navigate('/app/teacher/reports/new')}>Buat Laporan</Button>} />
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map(report => (
            <div key={report.id} className="card p-4 flex items-center gap-4 hover:border-teal-200 transition-colors group">
              <div className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate(`/app/teacher/reports/${report.id}`)}>
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-teal-50 transition-colors">
                  <FileText size={16} className="text-gray-500 group-hover:text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-teal-700">{report.activity_label}</p>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{report.participant_count} peserta</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{formatPeriod(report.report_period)} · {formatRelativeTime(report.updated_at)}</p>
                  {report.admin_notes && <p className="text-xs text-gray-500 mt-1 italic truncate">Catatan: {report.admin_notes}</p>}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                <StatusPill status={report.status} size="sm" />
                <span className="text-[10px] text-gray-400">{report.score_weight} pts</span>
              </div>
              {report.status === 'draft' && (
                <button onClick={e => { e.stopPropagation(); setDeleteTarget(report) }}
                  title="Hapus draft"
                  className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Draft Laporan" size="sm"
        footer={<><Button variant="secondary" onClick={() => setDeleteTarget(null)}>Batal</Button><Button variant="danger" loading={deleting} onClick={handleDeleteConfirm}>Ya, Hapus</Button></>}>
        <div className="space-y-3">
          <p className="text-sm text-gray-700">Hapus draft laporan <strong>{deleteTarget?.activity_label}</strong> untuk periode <strong>{formatPeriod(deleteTarget?.report_period)}</strong>?</p>
          <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">Tindakan ini tidak dapat dibatalkan. Hanya laporan berstatus Draft yang dapat dihapus.</p>
        </div>
      </Modal>
    </div>
  )
}
