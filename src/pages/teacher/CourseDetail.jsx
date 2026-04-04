import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { BookOpen, CheckCircle, Lock, ChevronRight, Award, Play, FileText, HelpCircle } from 'lucide-react'
import { useLMS }      from '../../hooks/useLMS'
import Card            from '../../components/ui/Card'
import Button          from '../../components/ui/Button'
import ProgressBar     from '../../components/ui/ProgressBar'
import Spinner         from '../../components/ui/Spinner'

const CONTENT_ICONS = {
  article: <FileText size={14} />,
  video:   <Play     size={14} />,
  pdf:     <FileText size={14} />,
  quiz:    <HelpCircle size={14} />,
}
const CONTENT_LABELS = { article: 'Artikel', video: 'Video', pdf: 'PDF', quiz: 'Kuis' }

export default function CourseDetail() {
  const { courseId }    = useParams()
  const navigate        = useNavigate()
  const { getCourse, getProgress, quizUnlocked, enroll } = useLMS()

  const [course,  setCourse]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCourse(courseId).then(c => { setCourse(c); setLoading(false) })
  }, [courseId]) // eslint-disable-line

  const progress = getProgress(courseId)
  const unlocked = quizUnlocked(courseId)

  if (loading) return <Spinner center />
  if (!course)  return <div className="page-wrapper text-center py-20 text-gray-400">Kursus tidak ditemukan.</div>

  const completedIds = progress?.lessons_completed ?? []
  const pct          = Math.round((completedIds.length / (course.total_lessons || 1)) * 100)
  const isCertified  = progress?.status === 'certified'
  const isEnrolled   = !!progress

  function handleStart(lesson) {
    if (!isEnrolled) {
      const res = enroll(courseId)
      if (res.success || res.error === 'ALREADY_ENROLLED') {
        navigateToLesson(lesson)
      }
    } else {
      navigateToLesson(lesson)
    }
  }

  function navigateToLesson(lesson) {
    if (lesson.content_type === 'quiz') {
      if (unlocked || isCertified) navigate(`/app/teacher/lms/${courseId}/quiz`)
    } else {
      navigate(`/app/teacher/lms/${courseId}/lesson/${lesson.id}`)
    }
  }

  return (
    <div className="page-wrapper max-w-3xl">
      {/* Course header */}
      <div className="card p-6 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: course.thumbnail_color || '#DCFCE7' }}>
            <BookOpen size={24} className="text-primary-700" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-0.5 rounded-full">
              {course.category_label || course.month_label}
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-2 mb-1">{course.title}</h1>
            <p className="text-sm text-gray-500 leading-relaxed">{course.description}</p>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>{completedIds.length}/{course.total_lessons} pelajaran selesai</span>
            <span className="font-semibold text-primary-700">{pct}%</span>
          </div>
          <ProgressBar value={pct} color={isCertified ? 'teal' : 'amber'} size="sm" />
        </div>
        {isCertified && (
          <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-primary-50 border border-primary-200">
            <Award size={20} className="text-primary-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-primary-800">Sertifikat Diterbitkan</p>
              <p className="text-xs text-primary-600">Skor kuis: {progress?.quiz_score}% · Lulus ✓</p>
            </div>
          </div>
        )}
      </div>

      {/* Lesson list */}
      <Card title="Daftar Pelajaran">
        <div className="divide-y divide-gray-100">
          {(course.lessons || []).map((lesson, idx) => {
            const isDone   = completedIds.includes(lesson.id)
            const isQuiz   = lesson.content_type === 'quiz'
            const isLocked = isQuiz && !unlocked && !isCertified
            const Icon     = CONTENT_ICONS[lesson.content_type] ?? <FileText size={14} />

            return (
              <div key={lesson.id}
                onClick={() => !isLocked && handleStart(lesson)}
                className={`flex items-center gap-4 py-3.5 px-1 rounded-lg transition-colors ${
                  isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-alabaster group'
                }`}>
                <div className="shrink-0">
                  {isDone ? <CheckCircle size={20} className="text-primary-500" />
                   : isLocked ? <Lock size={18} className="text-gray-400" />
                   : <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-primary-400 transition-colors" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-gray-400">{idx + 1}</span>
                    <p className={`text-sm font-medium truncate ${
                      isDone ? 'text-gray-500 line-through' : 'text-gray-800 group-hover:text-primary-700'
                    }`}>{lesson.title}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 ml-4">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      {Icon} {CONTENT_LABELS[lesson.content_type]}
                    </span>
                    {lesson.duration_minutes && (
                      <span className="text-[10px] text-gray-400">· {lesson.duration_minutes} mnt</span>
                    )}
                    {isLocked && <span className="text-[10px] text-amber-600">Selesaikan pelajaran sebelumnya</span>}
                  </div>
                </div>
                {!isLocked && <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 shrink-0 transition-colors" />}
              </div>
            )
          })}
        </div>

        <div className="pt-4 border-t border-gray-100 mt-2">
          {isCertified ? (
            <p className="text-xs text-center text-gray-400">Kursus ini sudah selesai.</p>
          ) : (
            <Button variant="primary" className="w-full justify-center" onClick={() => {
              const first = (course.lessons || []).find(l => !completedIds.includes(l.id) && l.content_type !== 'quiz')
              if (first) handleStart(first)
              else if (unlocked) navigate(`/app/teacher/lms/${courseId}/quiz`)
            }}>
              {!isEnrolled ? 'Mulai Kursus' : unlocked ? 'Kerjakan Kuis' : 'Lanjutkan Belajar'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
