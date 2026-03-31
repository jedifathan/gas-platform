import { useParams, useNavigate, Link } from 'react-router-dom'
import { useRef } from 'react'
import { Award, Download, ChevronLeft, CheckCircle, BookOpen } from 'lucide-react'
import { useLMS }    from '../../hooks/useLMS'
import { useAuth }   from '../../hooks/useAuth'
import Button        from '../../components/ui/Button'
import { formatDate } from '../../utils/formatters'

/**
 * CertificatePage — printable teacher certification view.
 * Accessible at: /app/teacher/lms/:courseId/certificate
 * Linked from QuizPage (after passing) and CourseDetail (if certified).
 */
export default function CertificatePage() {
  const { courseId } = useParams()
  const navigate     = useNavigate()
  const { session }  = useAuth()
  const { getCourse, getProgress } = useLMS()
  const printRef     = useRef(null)

  const course   = getCourse(courseId)
  const progress = getProgress(courseId)

  if (!course || !progress || progress.status !== 'certified') {
    return (
      <div className="page-wrapper text-center py-20 text-gray-400">
        <Award size={36} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">Sertifikat tidak tersedia.</p>
        <p className="text-xs mt-1">Selesaikan kursus dan lulus kuis untuk mendapatkan sertifikat.</p>
        <Button className="mt-5" variant="secondary"
          onClick={() => navigate(`/app/teacher/lms/${courseId}`)}>
          Kembali ke Kursus
        </Button>
      </div>
    )
  }

  function handlePrint() {
    window.print()
  }

  const issuedDate = formatDate(progress.certificate_issued_at)
  const certId     = `GAS-${courseId.toUpperCase()}-${progress.teacher_id.slice(-4).toUpperCase()}`

  return (
    <div className="page-wrapper max-w-3xl">
      {/* Action bar — hidden when printing */}
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <Button variant="ghost" size="sm" icon={<ChevronLeft size={15} />}
          onClick={() => navigate(`/app/teacher/lms/${courseId}`)}>
          Kembali ke Kursus
        </Button>
        <div className="flex-1" />
        <Button variant="primary" icon={<Download size={14} />} onClick={handlePrint}>
          Cetak / Simpan PDF
        </Button>
      </div>

      {/* ── Certificate card ── */}
      <div
        ref={printRef}
        className="bg-white rounded-2xl border-2 border-primary-200 shadow-lg overflow-hidden"
        style={{ printColorAdjust: 'exact' }}
      >
        {/* Top accent strip */}
        <div className="h-2 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400" />

        {/* Header */}
        <div className="px-10 pt-10 pb-6 text-center border-b border-gray-100">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center
                            text-white font-bold text-xl shadow-md">G</div>
            <div className="text-left leading-none">
              <p className="text-base font-bold text-gray-900">Program GAS</p>
              <p className="text-xs text-gray-500">Gigi Anak Sehat</p>
            </div>
          </div>
          <p className="text-xs uppercase tracking-widest text-primary-600 font-semibold mb-1">
            Sertifikat Penyelesaian
          </p>
          <h1 className="text-2xl font-black text-gray-900">Certificate of Completion</h1>
        </div>

        {/* Body */}
        <div className="px-10 py-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Diberikan kepada</p>
          <h2 className="text-3xl font-black text-primary-700 mb-1">{session?.name}</h2>
          <p className="text-sm text-gray-500 mb-6">
            {session?.school?.name ?? 'Guru Program GAS'} · {session?.school?.district}
          </p>

          <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
            telah berhasil menyelesaikan pelatihan dan lulus evaluasi pada kursus
          </p>

          {/* Course highlight box */}
          <div className="inline-block bg-primary-50 border border-primary-200 rounded-2xl px-8 py-5 mb-6 text-left max-w-lg w-full">
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: course.thumbnail_color ?? '#E1F5EE' }}
              >
                <BookOpen size={20} className="text-primary-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-primary-600 mb-0.5">{course.category_label}</p>
                <p className="text-base font-bold text-gray-900 leading-snug">{course.title}</p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
            <div className="bg-alabaster rounded-xl p-3 text-center">
              <p className="text-lg font-black text-primary-700">{progress.quiz_score}%</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Skor Kuis</p>
            </div>
            <div className="bg-alabaster rounded-xl p-3 text-center">
              <p className="text-lg font-black text-gray-800">{course.total_lessons}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Pelajaran</p>
            </div>
            <div className="bg-alabaster rounded-xl p-3 text-center">
              <p className="text-lg font-black text-gray-800">{progress.quiz_attempts}x</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Percobaan</p>
            </div>
          </div>

          {/* Completion badge */}
          <div className="inline-flex items-center gap-2 bg-primary-600 text-white
                          rounded-full px-5 py-2 text-sm font-semibold mb-8">
            <CheckCircle size={16} />
            Lulus dengan nilai {progress.quiz_score}%
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-alabaster border-t border-gray-100 flex items-center justify-between">
          {/* Signature block */}
          <div className="text-left">
            <div className="w-32 border-b border-gray-400 mb-1 pb-0.5">
              <p className="text-xs text-gray-400 italic font-serif">ttd.</p>
            </div>
            <p className="text-xs font-semibold text-gray-700">Direktur Program GAS</p>
            <p className="text-[10px] text-gray-400">Kemenkes RI</p>
          </div>

          {/* Right info */}
          <div className="text-right">
            <p className="text-xs text-gray-500">Diterbitkan: <span className="font-medium text-gray-700">{issuedDate}</span></p>
            <p className="text-[10px] text-gray-400 mt-0.5 font-mono">No: {certId}</p>
          </div>
        </div>

        {/* Bottom accent strip */}
        <div className="h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />
      </div>

      {/* Print styles injected at page level */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .page-wrapper, .page-wrapper * { visibility: visible !important; }
          .page-wrapper { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
