import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import {
  getCourses,
  getCourseWithLessons,
  getLessonById,
  getTeacherProgress,
  startCourse,
  completeLesson,
  scoreQuiz,
  getQuizQuestions,
  isQuizUnlocked,
} from '../services/lmsService'

/**
 * useLMS — teacher-scoped LMS hook.
 * Provides courses enriched with per-teacher progress, and all mutating actions.
 *
 * Usage:
 *   const { courses, loading, enroll, markLessonDone, submitQuiz } = useLMS()
 */
export function useLMS() {
  const { session } = useAuth()
  const teacherId   = session?.user_id

  const [courses,  setCourses]  = useState([])
  const [progress, setProgress] = useState([])
  const [loading,  setLoading]  = useState(true)

  const refresh = useCallback(() => {
    const raw  = getCourses()
    const prog = teacherId ? getTeacherProgress(teacherId) : []

    const enriched = raw.map(course => {
      const p = prog.find(pr => pr.course_id === course.id)
      return {
        ...course,
        progress: p ?? null,
        status:   p?.status ?? 'not_started',
        pct: p
          ? Math.round((p.lessons_completed.length / course.total_lessons) * 100)
          : 0,
      }
    })

    setCourses(enriched)
    setProgress(prog)
    setLoading(false)
  }, [teacherId])

  useEffect(() => { refresh() }, [refresh])

  // ── Actions ──────────────────────────────────────────────────────────────

  function enroll(courseId) {
    const result = startCourse(teacherId, courseId)
    refresh()
    return result
  }

  function markLessonDone(courseId, lessonId) {
    const result = completeLesson(teacherId, courseId, lessonId)
    if (result.success) refresh()
    return result
  }

  function submitQuiz(courseId, answers) {
    const result = scoreQuiz(teacherId, courseId, answers)
    if (result.success) refresh()
    return result
  }

  // ── Reads ─────────────────────────────────────────────────────────────────

  function getCourse(courseId)   { return getCourseWithLessons(courseId) }
  function getLesson(lessonId)   { return getLessonById(lessonId) }
  function getProgress(courseId) { return progress.find(p => p.course_id === courseId) ?? null }
  function quizUnlocked(courseId){ return isQuizUnlocked(teacherId, courseId) }
  function getQuestions(courseId){ return getQuizQuestions(courseId) }

  return {
    courses, progress, loading,
    refresh,
    enroll, markLessonDone, submitQuiz,
    getCourse, getLesson, getProgress, quizUnlocked, getQuestions,
  }
}
