import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { CheckCircle, XCircle, Award, ChevronLeft, HelpCircle } from 'lucide-react'
import { useLMS }   from '../../hooks/useLMS'
import { useApp }   from '../../hooks/useApp'
import Button       from '../../components/ui/Button'
import Card         from '../../components/ui/Card'
import ProgressBar  from '../../components/ui/ProgressBar'

export default function QuizPage() {
  const { courseId }  = useParams()
  const navigate      = useNavigate()
  const { getCourse, getProgress, quizUnlocked, submitQuiz, getQuestions } = useLMS()
  const { toast }     = useApp()

  const course    = getCourse(courseId)
  const progress  = getProgress(courseId)
  const unlocked  = quizUnlocked(courseId)
  const questions = getQuestions(courseId)

  const [answers,   setAnswers]   = useState({})
  const [result,    setResult]    = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!course || !questions.length) {
    return <div className="page-wrapper text-center text-gray-400 py-20">Kuis tidak tersedia.</div>
  }

  if (progress?.status === 'certified') {
    return (
      <div className="page-wrapper max-w-lg">
        <Card className="text-center p-10">
          <Award size={48} className="text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Anda Sudah Bersertifikat!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Skor kuis: <strong>{progress.quiz_score}%</strong> ·
            Threshold: {course.passing_score}%
          </p>
          <Button variant="primary" onClick={() => navigate(`/app/teacher/lms/${courseId}`)}>
            Kembali ke Kursus
          </Button>
        </Card>
      </div>
    )
  }

  if (!unlocked) {
    return (
      <div className="page-wrapper max-w-lg">
        <Card className="text-center p-10">
          <HelpCircle size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Kuis Belum Terbuka</h2>
          <p className="text-sm text-gray-500 mb-6">
            Selesaikan semua pelajaran terlebih dahulu untuk mengakses kuis.
          </p>
          <Button variant="primary" onClick={() => navigate(`/app/teacher/lms/${courseId}`)}>
            Kembali ke Kursus
          </Button>
        </Card>
      </div>
    )
  }

  const allAnswered   = questions.every((_, i) => answers[i] !== undefined)
  const answeredCount = Object.keys(answers).length

  function handleAnswer(qIdx, optIdx) {
    if (result) return // lock after submit
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }))
  }

  async function handleSubmit() {
    if (!allAnswered) {
      toast.warning(`Jawab semua ${questions.length} pertanyaan terlebih dahulu.`)
      return
    }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600)) // simulate latency
    const answerArray = questions.map((_, i) => answers[i])
    const res         = submitQuiz(courseId, answerArray)
    setSubmitting(false)
    setResult(res)
    if (res.passed) toast.success(`Selamat! Skor Anda ${res.score_pct}% — Bersertifikat!`)
    else             toast.error(`Skor ${res.score_pct}% — Minimal ${res.passing_threshold}%. Coba lagi.`)
  }

  // ── Results view ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="page-wrapper max-w-2xl">
        {/* Score banner */}
        <Card className={`text-center p-8 mb-5 ${result.passed ? 'border-teal-200 bg-teal-50/30' : 'border-red-200 bg-red-50/30'}`}>
          {result.passed
            ? <Award size={52} className="text-teal-500 mx-auto mb-3" />
            : <XCircle size={52} className="text-red-400 mx-auto mb-3" />}
          <h2 className="text-2xl font-black text-gray-900 mb-1">
            {result.passed ? 'Selamat, Anda Lulus!' : 'Belum Lulus'}
          </h2>
          <p className="text-4xl font-black mt-2 mb-1 text-gray-900">{result.score_pct}%</p>
          <p className="text-sm text-gray-500">
            Nilai minimum: {result.passing_threshold}% · Percobaan ke-{result.attempts}
          </p>
          <ProgressBar
            value={result.score_pct}
            color={result.passed ? 'teal' : 'red'}
            size="md"
            className="mt-4 max-w-xs mx-auto"
          />
        </Card>

        {/* Breakdown */}
        <Card title="Pembahasan Jawaban" noPadding>
          <div className="divide-y divide-gray-100">
            {result.breakdown.map((item, i) => (
              <div key={i} className="p-4">
                <div className="flex items-start gap-2 mb-2">
                  {item.correct
                    ? <CheckCircle size={15} className="text-teal-500 shrink-0 mt-0.5" />
                    : <XCircle    size={15} className="text-red-500 shrink-0 mt-0.5" />}
                  <p className="text-sm font-medium text-gray-900">{item.question}</p>
                </div>
                <div className={`text-xs ml-5 mb-1 px-2 py-1 rounded-md inline-block ${
                  item.correct ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'
                }`}>
                  Jawaban Anda: {item.your_answer}
                </div>
                {!item.correct && (
                  <div className="text-xs ml-5 px-2 py-1 rounded-md bg-teal-50 text-teal-700 inline-block ml-2">
                    Jawaban benar: {item.correct_answer}
                  </div>
                )}
                {item.explanation && (
                  <p className="text-xs text-gray-500 ml-5 mt-1.5 leading-relaxed">
                    💡 {item.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <Button variant="secondary" onClick={() => navigate(`/app/teacher/lms/${courseId}`)}>
            Kembali ke Kursus
          </Button>
          {!result.passed && (
            <Button variant="primary" onClick={() => { setResult(null); setAnswers({}) }}>
              Coba Lagi
            </Button>
          )}
          {result.passed && (
            <Button variant="primary" onClick={() => navigate('/app/teacher/lms')}>
              Ke Daftar Kursus
            </Button>
          )}
        </div>
      </div>
    )
  }

  // ── Quiz form ─────────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="sm" icon={<ChevronLeft size={15} />}
          onClick={() => navigate(`/app/teacher/lms/${courseId}`)}>
          {course.title}
        </Button>
      </div>

      <Card className="mb-5 p-5 bg-amber-50/50 border-amber-200">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Kuis: {course.title}</h1>
        <p className="text-xs text-gray-500">
          {questions.length} pertanyaan · Nilai minimum: {course.passing_score}% ·
          Percobaan: {(progress?.quiz_attempts ?? 0) + 1}
        </p>
        <div className="mt-3">
          <ProgressBar value={(answeredCount / questions.length) * 100} size="xs" color="amber" />
          <p className="text-[10px] text-gray-400 mt-1">{answeredCount}/{questions.length} terjawab</p>
        </div>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, qIdx) => (
          <Card key={q.id}>
            <p className="text-sm font-semibold text-gray-900 mb-3">
              <span className="text-teal-600 font-bold mr-1">{qIdx + 1}.</span>
              {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                const selected = answers[qIdx] === optIdx
                return (
                  <label
                    key={optIdx}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                      transition-all text-sm ${
                        selected
                          ? 'border-teal-400 bg-teal-50 text-teal-800'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selected ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                    }`}>
                      {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <input
                      type="radio"
                      name={`q-${qIdx}`}
                      value={optIdx}
                      checked={selected}
                      onChange={() => handleAnswer(qIdx, optIdx)}
                      className="sr-only"
                    />
                    {opt}
                  </label>
                )
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Submit */}
      <div className="sticky bottom-4 mt-5">
        <Button
          variant="primary"
          loading={submitting}
          disabled={!allAnswered}
          className="w-full justify-center shadow-lg"
          onClick={handleSubmit}
        >
          {submitting ? 'Menilai...' : `Kirim Jawaban (${answeredCount}/${questions.length})`}
        </Button>
      </div>
    </div>
  )
}
