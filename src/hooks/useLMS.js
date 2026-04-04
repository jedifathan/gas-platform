import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import {
  getCourses, getCourseWithLessons,
  getTeacherProgress, startCourse, completeLesson,
  scoreQuiz, getQuizQuestions, isQuizUnlocked,
} from '../services/lmsService'

export function useLMS() {
  const { session } = useAuth()
  const teacherId   = session?.user_id

  const [courses,  setCourses]  = useState([])
  const [progress, setProgress] = useState([])
  const [loading,  setLoading]  = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const raw  = await getCourses()          // async API call
    const prog = teacherId ? getTeacherProgress(teacherId) : []

    const enriched = raw.map(course => {
      const p = prog.find(pr => pr.course_id === course.id)
      return {
        ...course,
        progress: p ?? null,
        status:   p?.status ?? 'not_started',
        pct: p ? Math.round((p.lessons_completed.length / (course.total_lessons || 1)) * 100) : 0,
      }
    })

    setCourses(enriched)
    setProgress(prog)
    setLoading(false)
  }, [teacherId])

  useEffect(() => { refresh() }, [refresh])

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

  function submitQuiz(courseId, answers, passingScore) {
    const result = scoreQuiz(teacherId, courseId, answers, passingScore)
    if (result.success) refresh()
    return result
  }

  // Async — fetches course+lessons from API
  async function getCourse(courseId) {
    return getCourseWithLessons(courseId)
  }

  function getProgress(courseId) {
    return progress.find(p => p.course_id === courseId) ?? null
  }

  function quizUnlocked(courseId) {
    const course = courses.find(c => c.id === courseId)
    const nonQuizRequired = (course?.total_lessons ?? 4) - 1   // total minus quiz lesson
    return isQuizUnlocked(teacherId, courseId, nonQuizRequired)
  }

  function getQuestions(courseId) { return getQuizQuestions(courseId) }

  return {
    courses, progress, loading, refresh,
    enroll, markLessonDone, submitQuiz,
    getCourse, getProgress, quizUnlocked, getQuestions,
  }
}
