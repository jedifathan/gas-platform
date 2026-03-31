import { useNavigate } from 'react-router-dom'
import { BookOpen, Award, Lock, ChevronRight } from 'lucide-react'
import { useLMS }      from '../../hooks/useLMS'
import Card            from '../../components/ui/Card'
import ProgressBar     from '../../components/ui/ProgressBar'
import Button          from '../../components/ui/Button'
import Spinner         from '../../components/ui/Spinner'

const STATUS_CONFIG = {
  certified:   { label: 'Bersertifikat', cls: 'bg-primary-50 text-primary-700',   icon: '🏅' },
  in_progress: { label: 'Berlangsung',   cls: 'bg-amber-50 text-amber-700', icon: '⏳' },
  not_started: { label: 'Belum mulai',   cls: 'bg-gray-100 text-gray-500',  icon: '○' },
}

export default function TeacherCourseList() {
  const { courses, loading, enroll } = useLMS()
  const navigate = useNavigate()

  if (loading) return <Spinner center />

  const certified   = courses.filter(c => c.status === 'certified').length
  const inProgress  = courses.filter(c => c.status === 'in_progress').length
  const notStarted  = courses.filter(c => c.status === 'not_started').length

  function handleStart(e, course) {
    e.stopPropagation()
    if (course.status === 'not_started') {
      const result = enroll(course.id)
      if (result.success || result.error === 'ALREADY_ENROLLED') {
        navigate(`/app/teacher/lms/${course.id}`)
      }
    } else {
      navigate(`/app/teacher/lms/${course.id}`)
    }
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Kursus Pelatihan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {certified} selesai · {inProgress} berlangsung · {notStarted} belum mulai
          </p>
        </div>
      </div>

      {/* Summary bar */}
      <div className="card p-4 mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
            <span className="font-medium">Total Progres</span>
            <span className="font-semibold text-primary-700">
              {certified}/{courses.length} kursus selesai
            </span>
          </div>
          <ProgressBar
            value={courses.length ? (certified / courses.length) * 100 : 0}
            color="teal"
            size="md"
          />
        </div>
        {certified === courses.length && courses.length > 0 && (
          <div className="shrink-0 text-center">
            <span className="text-2xl">🎉</span>
            <p className="text-[10px] text-primary-700 font-medium mt-0.5">Semua selesai!</p>
          </div>
        )}
      </div>

      {/* Course list */}
      <div className="space-y-4">
        {courses.map(course => {
          const statusCfg = STATUS_CONFIG[course.status] ?? STATUS_CONFIG.not_started
          const locked    = false // All courses are accessible in prototype

          return (
            <div
              key={course.id}
              onClick={(e) => !locked && handleStart(e, course)}
              className={`card p-5 transition-all ${
                locked
                  ? 'opacity-60 cursor-not-allowed'
                  : 'cursor-pointer hover:border-primary-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-2xl"
                  style={{ backgroundColor: course.thumbnail_color ?? '#E1F5EE' }}
                >
                  {locked ? <Lock size={20} className="text-gray-400" /> : <BookOpen size={20} className="text-primary-700" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug">{course.title}</h3>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusCfg.cls}`}>
                      {statusCfg.icon} {statusCfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{course.description}</p>

                  {/* Progress */}
                  <ProgressBar
                    value={course.pct}
                    size="xs"
                    color={course.status === 'certified' ? 'teal' : 'amber'}
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[10px] text-gray-400">
                      {course.progress?.lessons_completed?.length ?? 0}/{course.total_lessons} pelajaran
                      {course.status === 'certified' && ` · Skor: ${course.progress?.quiz_score}%`}
                    </p>
                    {!locked && (
                      <span className="text-xs font-medium text-primary-600 flex items-center gap-0.5">
                        {course.status === 'certified' ? 'Lihat Sertifikat' :
                         course.status === 'in_progress' ? 'Lanjutkan' : 'Mulai'}
                        <ChevronRight size={13} />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Certificate badge */}
              {course.status === 'certified' && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                  <Award size={14} className="text-primary-600 shrink-0" />
                  <p className="text-xs text-primary-700 font-medium">
                    Sertifikat diterbitkan · Skor kuis: {course.progress?.quiz_score}%
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
