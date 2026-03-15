import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, CheckCircle, XCircle, FileText, User, Calendar, Users, MessageSquare } from 'lucide-react'
import { useReports }  from '../../hooks/useReports'
import { useApp }      from '../../hooks/useApp'
import Card            from '../../components/ui/Card'
import Button          from '../../components/ui/Button'
import StatusPill      from '../../components/ui/StatusPill'
import Modal           from '../../components/ui/Modal'
import TextArea        from '../../components/forms/TextArea'
import { formatPeriod, formatDateTime } from '../../utils/formatters'

export default function ReportReview() {
  const { reportId }             = useParams()
  const navigate                 = useNavigate()
  const { getById, validate, reject, refresh } = useReports()
  const { toast }                = useApp()

  const [modal,    setModal]    = useState(null) // 'validate' | 'reject' | null
  const [notes,    setNotes]    = useState('')
  const [notesErr, setNotesErr] = useState('')
  const [loading,  setLoading]  = useState(false)

  const report = getById(reportId)

  if (!report) {
    return (
      <div className="page-wrapper text-center py-20 text-gray-400">
        <p>Laporan tidak ditemukan.</p>
        <Button className="mt-4" variant="secondary" onClick={() => navigate('/app/admin/reports')}>
          Kembali
        </Button>
      </div>
    )
  }

  async function handleAction() {
    if (modal === 'reject' && notes.trim().length < 5) {
      setNotesErr('Catatan wajib diisi minimal 5 karakter saat menolak laporan.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))

    const result = modal === 'validate'
      ? validate(reportId, notes)
      : reject(reportId, notes)

    setLoading(false)

    if (result.success) {
      toast.success(modal === 'validate' ? 'Laporan berhasil divalidasi.' : 'Laporan ditolak.')
      setModal(null)
      navigate('/app/admin/reports')
    } else {
      toast.error(result.message ?? 'Terjadi kesalahan.')
    }
  }

  const isSubmitted = report.status === 'submitted'

  const infoRows = [
    { icon: Calendar, label: 'Periode',         value: formatPeriod(report.report_period) },
    { icon: FileText, label: 'Jenis Kegiatan',   value: `${report.activity_label} (+${report.score_weight} pts)` },
    { icon: Users,    label: 'Jumlah Peserta',   value: `${report.participant_count} anak` },
    { icon: User,     label: 'Guru Pelapor',     value: report.teacher_name },
    { icon: Calendar, label: 'Tanggal Dikirim',  value: formatDateTime(report.submitted_at) },
  ]

  return (
    <div className="page-wrapper max-w-3xl">
      {/* Back */}
      <div className="mb-5">
        <Button variant="ghost" size="sm" icon={<ChevronLeft size={15} />}
          onClick={() => navigate('/app/admin/reports')}>
          Kembali ke Semua Laporan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: report details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header card */}
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-base font-bold text-gray-900">{report.activity_label}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{report.school_name} · {report.school_district}</p>
              </div>
              <StatusPill status={report.status} />
            </div>
          </Card>

          {/* Info */}
          <Card title="Informasi Laporan">
            <dl className="divide-y divide-gray-100">
              {infoRows.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 py-2.5">
                  <Icon size={14} className="text-gray-400 shrink-0" />
                  <dt className="w-32 text-xs font-medium text-gray-500 shrink-0">{label}</dt>
                  <dd className="text-sm text-gray-800">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* Description */}
          <Card title="Deskripsi Kegiatan">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {report.description || <span className="text-gray-400 italic">Tidak ada deskripsi.</span>}
            </p>
          </Card>

          {/* Evidence */}
          {report.evidence_notes && (
            <Card title="Catatan Dokumentasi">
              <p className="text-sm text-gray-700">{report.evidence_notes}</p>
            </Card>
          )}

          {/* Previous admin notes */}
          {report.admin_notes && (
            <Card className="border-gray-200">
              <div className="flex gap-2">
                <MessageSquare size={15} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Catatan Admin Sebelumnya</p>
                  <p className="text-sm text-gray-700 italic">"{report.admin_notes}"</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right: action panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card title="Tindakan Admin">
            {!isSubmitted ? (
              <div className="text-center py-4">
                <StatusPill status={report.status} />
                <p className="text-xs text-gray-500 mt-3">
                  Laporan ini sudah {report.status === 'validated' ? 'divalidasi' : 'ditolak'}.
                </p>
                {report.validated_at && (
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(report.validated_at)}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Review laporan ini lalu pilih validasi atau tolak.
                </p>
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  icon={<CheckCircle size={15} />}
                  onClick={() => { setNotes(''); setNotesErr(''); setModal('validate') }}
                >
                  Validasi Laporan
                </Button>
                <Button
                  variant="danger"
                  className="w-full justify-center"
                  icon={<XCircle size={15} />}
                  onClick={() => { setNotes(''); setNotesErr(''); setModal('reject') }}
                >
                  Tolak Laporan
                </Button>
                <p className="text-[10px] text-gray-400 text-center">
                  Catatan wajib diisi saat menolak laporan.
                </p>
              </div>
            )}
          </Card>

          {/* Report history hint */}
          <Card title="Riwayat Sekolah" subtitle={report.school_name}>
            <p className="text-xs text-gray-500">
              Laporan sebelumnya dapat dilihat di halaman detail sekolah.
            </p>
          </Card>
        </div>
      </div>

      {/* Confirm modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'validate' ? 'Konfirmasi Validasi' : 'Konfirmasi Penolakan'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Batal</Button>
            <Button
              variant={modal === 'validate' ? 'primary' : 'danger'}
              loading={loading}
              onClick={handleAction}
            >
              {modal === 'validate' ? 'Ya, Validasi' : 'Ya, Tolak'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            {modal === 'validate'
              ? 'Laporan ini akan divalidasi dan skor sekolah akan diperbarui.'
              : 'Laporan ini akan ditolak. Guru dapat membuat laporan baru.'}
          </p>
          <TextArea
            label={modal === 'validate' ? 'Catatan (opsional)' : 'Catatan Penolakan'}
            required={modal === 'reject'}
            rows={3}
            placeholder={modal === 'validate'
              ? 'Contoh: Laporan lengkap dan sesuai format.'
              : 'Jelaskan alasan penolakan...'}
            value={notes}
            onChange={e => { setNotes(e.target.value); setNotesErr('') }}
            error={notesErr}
          />
        </div>
      </Modal>
    </div>
  )
}
