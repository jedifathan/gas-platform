/**
 * lmsService.js
 * Fetches courses and lessons from /api/courses (PostgreSQL).
 * Progress, quiz, enrollment remain in-memory (mock) for now.
 */

import progressData from '../data/teacher_progress.json'
import quizData     from '../data/quiz_questions.json'

const BASE = '/api'

// ── API fetchers ──────────────────────────────────────────────────────────────

export async function getCourses() {
  try {
    const res = await fetch(`${BASE}/courses`)
    if (!res.ok) return []
    const data = await res.json()
    return data.filter(c => c.is_published)
  } catch { return [] }
}

export async function getCourseById(courseId) {
  try {
    const res = await fetch(`${BASE}/courses/${courseId}`)
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export async function getCourseWithLessons(courseId) {
  return getCourseById(courseId)  // API already returns lessons array
}

// ── Progress (in-memory, scoped per teacher) ──────────────────────────────────

let progress = progressData.map(p => ({ ...p, lessons_completed: [...p.lessons_completed] }))

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`
}

export function getTeacherProgress(teacherId) {
  return progress.filter(p => p.teacher_id === teacherId)
}

export function getCourseProgress(teacherId, courseId) {
  return progress.find(p => p.teacher_id === teacherId && p.course_id === courseId) ?? null
}

export function startCourse(teacherId, courseId) {
  const existing = progress.find(p => p.teacher_id === teacherId && p.course_id === courseId)
  if (existing) return { success: false, error: 'ALREADY_ENROLLED', existing }

  const record = {
    id: uid('tp'), teacher_id: teacherId, course_id: courseId,
    lessons_completed: [], quiz_score: null, quiz_attempts: 0,
    status: 'in_progress', started_at: new Date().toISOString(),
    completed_at: null, certificate_issued_at: null,
  }
  progress.push(record)
  return { success: true, record }
}

export function completeLesson(teacherId, courseId, lessonId) {
  const prog = progress.find(p => p.teacher_id === teacherId && p.course_id === courseId)
  if (!prog) return { success: false, error: 'NOT_ENROLLED' }
  if (prog.status === 'certified') return { success: false, error: 'ALREADY_CERTIFIED' }
  if (prog.lessons_completed.includes(lessonId))
    return { success: false, error: 'ALREADY_COMPLETED', lessons_completed: prog.lessons_completed }

  prog.lessons_completed = [...prog.lessons_completed, lessonId]
  // quiz_unlocked = all non-quiz required lessons done — we'll check async in hook
  return {
    success: true,
    lessons_completed: prog.lessons_completed,
    quiz_unlocked: false,   // hook will re-check after API call
  }
}

export function getQuizQuestions(courseId) {
  return quizData.filter(q => q.course_id === courseId)
}

export function scoreQuiz(teacherId, courseId, answers, passingScore = 70) {
  const prog = progress.find(p => p.teacher_id === teacherId && p.course_id === courseId)
  if (!prog) return { success: false, error: 'NOT_ENROLLED' }

  const questions = quizData.filter(q => q.course_id === courseId)
  if (!questions.length) return { success: false, error: 'NO_QUIZ_FOUND' }

  let earned = 0, total = 0
  const breakdown = questions.map((q, i) => {
    const chosen  = answers[i]
    const correct = chosen === q.correct_index
    if (correct) earned += q.weight
    total += q.weight
    return {
      question: q.question, chosen_index: chosen,
      your_answer:    q.options[chosen]           ?? '(tidak dijawab)',
      correct_answer: q.options[q.correct_index],
      correct, points: correct ? q.weight : 0,
      explanation: q.explanation,
    }
  })

  const score_pct = Math.round((earned / total) * 100)
  const passed    = score_pct >= passingScore

  prog.quiz_score    = score_pct
  prog.quiz_attempts = (prog.quiz_attempts ?? 0) + 1

  if (passed) {
    prog.status                = 'certified'
    prog.completed_at          = new Date().toISOString()
    prog.certificate_issued_at = new Date().toISOString()
  }

  return { success: true, score_pct, passing_threshold: passingScore, passed, attempts: prog.quiz_attempts, breakdown }
}

export function isQuizUnlocked(teacherId, courseId, totalRequired) {
  const prog = progress.find(p => p.teacher_id === teacherId && p.course_id === courseId)
  if (!prog) return false
  // If totalRequired is passed (from fetched course), use it; else use progress length heuristic
  if (totalRequired !== undefined) {
    const nonQuizDone = prog.lessons_completed.length
    return nonQuizDone >= totalRequired
  }
  return prog.lessons_completed.length >= 3   // fallback: at least 3 lessons done
}

export function getLMSCompletionRate(schoolId, teachers) {
  if (!teachers?.length) return { rate: 0, lms_score: 0, certified: 0, total_slots: 0 }
  const certified = progress.filter(p => teachers.some(t => t.id === p.teacher_id) && p.status === 'certified').length
  return { rate: 0, lms_score: 0, certified, total_slots: teachers.length * 12 }
}

// getLessonById is no longer needed (lessons come with course from API)
export function getLessonById(lessonId) { return null }
