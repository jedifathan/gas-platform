/**
 * lmsService.js
 * Course enrollment, lesson completion, quiz scoring, certificate issuance.
 *
 * Production swap:
 *   getCourses()         → GET   /api/lms/courses
 *   startCourse()        → POST  /api/lms/courses/:id/enroll
 *   completeLesson()     → PATCH /api/lms/progress/:id/lesson
 *   scoreQuiz()          → POST  /api/lms/courses/:id/quiz
 *   getLMSCompletionRate()→ GET  /api/lms/schools/:id/rate
 */

import coursesData  from '../data/courses.json'
import lessonsData  from '../data/lessons.json'
import progressData from '../data/teacher_progress.json'
import quizData     from '../data/quiz_questions.json'

// Mutable in-memory stores
let courses  = coursesData.map(c => ({ ...c }))
let lessons  = lessonsData.map(l => ({ ...l }))
let progress = progressData.map(p => ({ ...p, lessons_completed: [...p.lessons_completed] }))

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

// ─────────────────────────────────────────────────────────────────────────────

export function getCourses() {
  return courses.filter(c => c.is_published)
}

export function getCourseById(courseId) {
  return courses.find(c => c.id === courseId) ?? null
}

/** Returns course with sorted lessons array attached */
export function getCourseWithLessons(courseId) {
  const course = courses.find(c => c.id === courseId)
  if (!course) return null
  const courseLessons = lessons
    .filter(l => l.course_id === courseId)
    .sort((a, b) => a.order_index - b.order_index)
  return { ...course, lessons: courseLessons }
}

export function getLessonById(lessonId) {
  return lessons.find(l => l.id === lessonId) ?? null
}

export function getTeacherProgress(teacherId) {
  return progress.filter(p => p.teacher_id === teacherId)
}

export function getCourseProgress(teacherId, courseId) {
  return progress.find(p => p.teacher_id === teacherId && p.course_id === courseId) ?? null
}

/** Enroll teacher in a course — idempotent */
export function startCourse(teacherId, courseId) {
  const existing = progress.find(p => p.teacher_id === teacherId && p.course_id === courseId)
  if (existing) return { success: false, error: 'ALREADY_ENROLLED', existing }

  const course = courses.find(c => c.id === courseId)
  if (!course)          return { success: false, error: 'COURSE_NOT_FOUND' }
  if (!course.is_published) return { success: false, error: 'COURSE_NOT_PUBLISHED' }

  const record = {
    id: uid('tp'),
    teacher_id: teacherId,
    course_id: courseId,
    lessons_completed: [],
    quiz_score: null,
    quiz_attempts: 0,
    status: 'in_progress',
    started_at: new Date().toISOString(),
    completed_at: null,
    certificate_issued_at: null,
  }
  progress.push(record)
  return { success: true, record }
}

/** Mark one lesson as complete — state machine enforced */
export function completeLesson(teacherId, courseId, lessonId) {
  const prog = progress.find(p => p.teacher_id === teacherId && p.course_id === courseId)
  if (!prog)               return { success: false, error: 'NOT_ENROLLED' }
  if (prog.status === 'certified') return { success: false, error: 'ALREADY_CERTIFIED' }
  if (prog.lessons_completed.includes(lessonId))
    return { success: false, error: 'ALREADY_COMPLETED', lessons_completed: prog.lessons_completed }

  const lesson = lessons.find(l => l.id === lessonId && l.course_id === courseId)
  if (!lesson) return { success: false, error: 'LESSON_NOT_FOUND' }

  prog.lessons_completed = [...prog.lessons_completed, lessonId]

  const course       = courses.find(c => c.id === courseId)
  const nonQuizTotal = lessons.filter(l => l.course_id === courseId && l.is_required && l.content_type !== 'quiz').length
  const nonQuizDone  = prog.lessons_completed.filter(id => {
    const l = lessons.find(l => l.id === id)
    return l && l.content_type !== 'quiz'
  }).length

  return {
    success: true,
    lesson_title: lesson.title,
    lessons_completed: prog.lessons_completed,
    total_lessons: course?.total_lessons ?? 0,
    completion_pct: Math.round((prog.lessons_completed.length / (course?.total_lessons ?? 1)) * 100),
    quiz_unlocked: nonQuizDone >= nonQuizTotal,
  }
}

export function getQuizQuestions(courseId) {
  return quizData.filter(q => q.course_id === courseId)
}

/** Score a quiz attempt; issue certificate if passed */
export function scoreQuiz(teacherId, courseId, answers) {
  const prog = progress.find(p => p.teacher_id === teacherId && p.course_id === courseId)
  if (!prog) return { success: false, error: 'NOT_ENROLLED' }

  const questions = quizData.filter(q => q.course_id === courseId)
  if (!questions.length) return { success: false, error: 'NO_QUIZ_FOUND' }

  const course  = courses.find(c => c.id === courseId)
  let earned = 0, total = 0

  const breakdown = questions.map((q, i) => {
    const chosen  = answers[i]
    const correct = chosen === q.correct_index
    if (correct) earned += q.weight
    total += q.weight
    return {
      question:       q.question,
      chosen_index:   chosen,
      your_answer:    q.options[chosen]           ?? '(tidak dijawab)',
      correct_answer: q.options[q.correct_index],
      correct,
      points:         correct ? q.weight : 0,
      explanation:    q.explanation,
    }
  })

  const score_pct = Math.round((earned / total) * 100)
  const passed    = score_pct >= (course?.passing_score ?? 70)

  prog.quiz_score    = score_pct
  prog.quiz_attempts = (prog.quiz_attempts ?? 0) + 1

  if (passed) {
    prog.status                = 'certified'
    prog.completed_at          = new Date().toISOString()
    prog.certificate_issued_at = new Date().toISOString()
    // Auto-complete the quiz lesson
    const quizLesson = lessons.find(l => l.course_id === courseId && l.content_type === 'quiz')
    if (quizLesson && !prog.lessons_completed.includes(quizLesson.id)) {
      prog.lessons_completed = [...prog.lessons_completed, quizLesson.id]
    }
  }

  return { success: true, score_pct, passing_threshold: course?.passing_score ?? 70, passed, attempts: prog.quiz_attempts, certificate_issued: passed, breakdown }
}

/** LMS completion rate for a school → { rate, lms_score, certified, total_slots } */
export function getLMSCompletionRate(schoolId, teachers) {
  if (!teachers?.length) return { rate: 0, lms_score: 0, certified: 0, total_slots: 0 }
  const published   = courses.filter(c => c.is_published)
  const totalSlots  = teachers.length * published.length
  if (totalSlots === 0) return { rate: 0, lms_score: 0, certified: 0, total_slots: 0 }
  const certified   = progress.filter(p => teachers.some(t => t.id === p.teacher_id) && p.status === 'certified').length
  const inProgress  = progress.filter(p => teachers.some(t => t.id === p.teacher_id) && p.status === 'in_progress').length
  const rate        = Math.round((certified / totalSlots) * 100)
  return { rate, lms_score: Math.round((rate / 100) * 40), certified, in_progress: inProgress, total_slots: totalSlots }
}

/** True if all non-quiz required lessons are complete */
export function isQuizUnlocked(teacherId, courseId) {
  const prog = progress.find(p => p.teacher_id === teacherId && p.course_id === courseId)
  if (!prog) return false
  const required = lessons.filter(l => l.course_id === courseId && l.is_required && l.content_type !== 'quiz').length
  const done     = prog.lessons_completed.filter(id => {
    const l = lessons.find(l => l.id === id)
    return l && l.content_type !== 'quiz'
  }).length
  return done >= required
}
