import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle, BookOpen, Clock } from 'lucide-react'
import { useLMS }   from '../../hooks/useLMS'
import { useApp }   from '../../hooks/useApp'
import Button       from '../../components/ui/Button'
import Card         from '../../components/ui/Card'
import ProgressBar  from '../../components/ui/ProgressBar'

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams()
  const navigate               = useNavigate()
  const { getCourse, getProgress, markLessonDone, quizUnlocked } = useLMS()
  const { toast }              = useApp()
  const [marking, setMarking]  = useState(false)

  const course   = getCourse(courseId)
  const progress = getProgress(courseId)
  const lesson   = course?.lessons?.find(l => l.id === lessonId)

  if (!course || !lesson) {
    return <div className="page-wrapper text-center text-gray-400 py-20">Pelajaran tidak ditemukan.</div>
  }

  const completedIds  = progress?.lessons_completed ?? []
  const isDone        = completedIds.includes(lessonId)
  const pct           = Math.round((completedIds.length / course.total_lessons) * 100)

  // Adjacent lessons (excluding quiz)
  const contentLessons = course.lessons.filter(l => l.content_type !== 'quiz')
  const currentIdx     = contentLessons.findIndex(l => l.id === lessonId)
  const prevLesson     = currentIdx > 0 ? contentLessons[currentIdx - 1] : null
  const nextLesson     = currentIdx < contentLessons.length - 1 ? contentLessons[currentIdx + 1] : null
  const unlocked       = quizUnlocked(courseId)

  async function handleMarkDone() {
    if (isDone) {
      // Already done — just navigate forward
      if (nextLesson) navigate(`/app/teacher/lms/${courseId}/lesson/${nextLesson.id}`)
      else if (unlocked) navigate(`/app/teacher/lms/${courseId}/quiz`)
      else navigate(`/app/teacher/lms/${courseId}`)
      return
    }
    setMarking(true)
    const result = markLessonDone(courseId, lessonId)
    setMarking(false)

    if (result.success) {
      toast.success(`"${lesson.title}" selesai!`)
      if (result.quiz_unlocked && !nextLesson) {
        toast.info('Kuis sudah terbuka!')
        setTimeout(() => navigate(`/app/teacher/lms/${courseId}/quiz`), 800)
      } else if (nextLesson) {
        navigate(`/app/teacher/lms/${courseId}/lesson/${nextLesson.id}`)
      } else {
        navigate(`/app/teacher/lms/${courseId}`)
      }
    }
  }

  return (
    <div className="page-wrapper max-w-4xl">
      {/* Header bar */}
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="sm"
          icon={<ChevronLeft size={15} />}
          onClick={() => navigate(`/app/teacher/lms/${courseId}`)}>
          {course.title}
        </Button>
        <div className="flex-1 hidden sm:block">
          <ProgressBar value={pct} size="xs" color="teal" />
        </div>
        <span className="text-xs text-gray-500 shrink-0">{pct}%</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Lesson content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title card */}
          <Card>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                <BookOpen size={16} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base font-bold text-gray-900">{lesson.title}</h1>
                  {isDone && <CheckCircle size={16} className="text-primary-500 shrink-0" />}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400 capitalize">{lesson.content_type}</span>
                  {lesson.duration_minutes && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={11} /> {lesson.duration_minutes} mnt
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Content area */}
          <Card noPadding>
            <div className="p-6">
              {lesson.content_type === 'article' && lesson.content_body ? (
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  {lesson.content_body.split('\n').map((para, i) => {
                    if (!para.trim()) return <div key={i} className="h-3" />
                    if (para.startsWith('**') && para.endsWith('**')) {
                      return <h3 key={i} className="font-semibold text-gray-900 mt-4 mb-1 text-sm">{para.slice(2, -2)}</h3>
                    }
                    if (para.match(/^\d+\. /)) {
                      return (
                        <div key={i} className="flex gap-2 text-sm mb-1">
                          <span className="text-primary-600 font-medium shrink-0">{para.match(/^\d+/)[0]}.</span>
                          <span>{para.replace(/^\d+\.\s/, '')}</span>
                        </div>
                      )
                    }
                    if (para.startsWith('- ')) {
                      return (
                        <div key={i} className="flex gap-2 text-sm mb-1">
                          <span className="text-primary-400 shrink-0">•</span>
                          <span>{para.slice(2)}</span>
                        </div>
                      )
                    }
                    return <p key={i} className="text-sm text-gray-700 mb-2">{para}</p>
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                  <BookOpen size={36} className="opacity-40" />
                  <p className="text-sm">
                    {lesson.content_type === 'video'
                      ? 'Video akan tersedia di versi produksi.'
                      : lesson.content_type === 'pdf'
                      ? 'Dokumen PDF akan tersedia di versi produksi.'
                      : 'Konten tidak tersedia.'}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-alabaster">
              <Button
                variant="ghost" size="sm"
                icon={<ChevronLeft size={14} />}
                disabled={!prevLesson}
                onClick={() => prevLesson && navigate(`/app/teacher/lms/${courseId}/lesson/${prevLesson.id}`)}
              >
                Sebelumnya
              </Button>

              <Button
                variant="primary" size="sm"
                loading={marking}
                iconRight={<ChevronRight size={14} />}
                onClick={handleMarkDone}
              >
                {isDone
                  ? nextLesson ? 'Lanjut' : unlocked ? 'Ke Kuis' : 'Selesai'
                  : 'Tandai Selesai'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar: lesson list */}
        <div className="lg:col-span-1">
          <Card title="Daftar Pelajaran" noPadding>
            <div className="divide-y divide-gray-100">
              {course.lessons.map((l, i) => {
                const done       = completedIds.includes(l.id)
                const isCurrent  = l.id === lessonId
                const isQuiz     = l.content_type === 'quiz'
                const quizLocked = isQuiz && !unlocked

                return (
                  <div
                    key={l.id}
                    onClick={() => {
                      if (quizLocked) return
                      if (isQuiz) navigate(`/app/teacher/lms/${courseId}/quiz`)
                      else navigate(`/app/teacher/lms/${courseId}/lesson/${l.id}`)
                    }}
                    className={`flex items-center gap-3 px-4 py-3 text-xs transition-colors
                      ${isCurrent ? 'bg-primary-50' : 'hover:bg-alabaster'}
                      ${quizLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {done
                      ? <CheckCircle size={14} className="text-primary-500 shrink-0" />
                      : <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0
                          ${isCurrent ? 'border-primary-500' : 'border-gray-300'}`} />
                    }
                    <span className={`truncate ${
                      isCurrent ? 'font-medium text-primary-700' :
                      done      ? 'text-gray-400 line-through' : 'text-gray-700'
                    }`}>
                      {i + 1}. {l.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
