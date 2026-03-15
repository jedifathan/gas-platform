import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, AlertCircle } from 'lucide-react'
import { useReports }    from '../../hooks/useReports'
import { useApp }        from '../../hooks/useApp'
import { useAuth }       from '../../hooks/useAuth'
import Card              from '../../components/ui/Card'
import Button            from '../../components/ui/Button'
import SelectInput       from '../../components/forms/SelectInput'
import TextInput         from '../../components/forms/TextInput'
import TextArea          from '../../components/forms/TextArea'
import Modal             from '../../components/ui/Modal'
import { formatPeriod, getPeriodOptions } from '../../utils/formatters'

export default function SubmitReport() {
  const navigate               = useNavigate()
  const { session }            = useAuth()
  const { toast }              = useApp()
  const { activityTypes, createDraft, submit, getById } = useReports()

  const periodOptions = getPeriodOptions(6)

  const [form, setForm] = useState({
    activity_type_id:  '',
    report_period:     '2025-02',
    participant_count: '',
    description:       '',
    evidence_notes:    '',
  })
  const [errors,       setErrors]       = useState({})
  const [saving,       setSaving]       = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [confirmOpen,  setConfirmOpen]  = useState(false)
  const [draftId,      setDraftId]      = useState(null)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const errs = {}
    if (!form.activity_type_id) errs.activity_type_id = 'Pilih jenis kegiatan.'
    if (!form.report_period)    errs.report_period    = 'Pilih periode laporan.'
    if (!form.participant_count || Number(form.participant_count) < 1)
      errs.participant_count = 'Jumlah peserta minimal 1.'
    if (!form.description || form.description.trim().length < 10)
      errs.description = 'Deskripsi minimal 10 karakter.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSaveDraft() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    const result = createDraft(form)
    setSaving(false)
    if (result.success) {
      setDraftId(result.report.id)
      toast.success('Draft laporan tersimpan.')
    } else {
      toast.error(result.message ?? 'Gagal menyimpan draft.')
      if (result.error === 'DUPLICATE_PERIOD') {
        setErrors({ activity_type_id: result.message })
      }
    }
  }

  function handleOpenConfirm() {
    if (!validate()) return
    setConfirmOpen(true)
  }

  async function handleFinalSubmit() {
    setConfirmOpen(false)
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600))

    // Save draft first if not yet saved
    let id = draftId
    if (!id) {
      const draftResult = createDraft(form)
      if (!draftResult.success) {
        setSubmitting(false)
        toast.error(draftResult.message ?? 'Gagal menyimpan laporan.')
        return
      }
      id = draftResult.report.id
      setDraftId(id)
    }

    const result = submit(id)
    setSubmitting(false)

    if (result.success) {
      toast.success('Laporan berhasil dikirim. Menunggu validasi admin.')
      navigate('/app/teacher/reports')
    } else {
      toast.error(result.message ?? 'Gagal mengirim laporan.')
    }
  }

  const selectedType = activityTypes.find(t => t.id === form.activity_type_id)

  return (
    <div className="page-wrapper max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Buat Laporan Kegiatan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {session?.school?.name} · {session?.school?.district}
          </p>
        </div>
      </div>

      <Card>
        <div className="space-y-5">
          {/* Period */}
          <SelectInput
            label="Periode Laporan"
            required
            options={periodOptions}
            value={form.report_period}
            onChange={e => set('report_period', e.target.value)}
            error={errors.report_period}
            placeholder={null}
          />

          {/* Activity type */}
          <SelectInput
            label="Jenis Kegiatan"
            required
            options={activityTypes.map(t => ({
              value: t.id,
              label: `${t.label} (${t.score_weight} pts)`,
            }))}
            value={form.activity_type_id}
            onChange={e => set('activity_type_id', e.target.value)}
            error={errors.activity_type_id}
            placeholder="Pilih jenis kegiatan..."
          />

          {/* Activity type description hint */}
          {selectedType && (
            <div className="flex gap-2 p-3 rounded-lg bg-teal-50 border border-teal-100">
              <AlertCircle size={14} className="text-teal-600 shrink-0 mt-0.5" />
              <p className="text-xs text-teal-700 leading-relaxed">{selectedType.description}</p>
            </div>
          )}

          {/* Participant count */}
          <TextInput
            label="Jumlah Peserta"
            required
            type="number"
            min="1"
            placeholder="contoh: 25"
            value={form.participant_count}
            onChange={e => set('participant_count', e.target.value)}
            error={errors.participant_count}
            hint="Jumlah anak yang berpartisipasi dalam kegiatan."
          />

          {/* Description */}
          <TextArea
            label="Deskripsi Kegiatan"
            required
            rows={5}
            maxLength={500}
            placeholder="Ceritakan kegiatan yang dilakukan, bagaimana respon anak-anak, dan hal menarik yang terjadi..."
            value={form.description}
            onChange={e => set('description', e.target.value)}
            error={errors.description}
          />

          {/* Evidence notes */}
          <TextArea
            label="Catatan Dokumentasi"
            rows={3}
            maxLength={300}
            placeholder="Contoh: foto kegiatan tersedia, daftar hadir tercatat, notulensi dibuat..."
            value={form.evidence_notes}
            onChange={e => set('evidence_notes', e.target.value)}
          />

          {/* Warning */}
          <div className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Laporan yang sudah dikirim <strong>tidak dapat diedit</strong>.
              Gunakan simpan draft untuk menyimpan sementara.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => navigate('/app/teacher/reports')}>
              Batal
            </Button>
            <Button
              variant="ghost"
              loading={saving}
              onClick={handleSaveDraft}
              icon={<FileText size={14} />}
            >
              Simpan Draft
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              onClick={handleOpenConfirm}
              className="ml-auto"
            >
              Kirim Laporan →
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirm modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Konfirmasi Pengiriman Laporan"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Batal</Button>
            <Button variant="primary" onClick={handleFinalSubmit}>Ya, Kirim</Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Anda akan mengirimkan laporan berikut untuk divalidasi oleh admin:
          </p>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Periode</span>
              <span className="font-medium">{formatPeriod(form.report_period)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Jenis</span>
              <span className="font-medium">{selectedType?.label ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Peserta</span>
              <span className="font-medium">{form.participant_count} anak</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Nilai</span>
              <span className="font-medium text-teal-700">{selectedType?.score_weight ?? 0} pts</span>
            </div>
          </div>
          <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            Laporan yang telah dikirim tidak dapat diedit atau ditarik kembali.
          </p>
        </div>
      </Modal>
    </div>
  )
}
