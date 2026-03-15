/**
 * scoring.js
 * Pure scoring functions for the leaderboard engine.
 * No side effects — safe to unit-test in isolation.
 *
 * Formula:
 *   LMS score        0–40  (teacher certification rate × 40)
 *   Activity score   0–40  (sum of validated report weights, capped)
 *   Consistency      0–20  (consecutive months with ≥1 validated report)
 *   ─────────────────────
 *   Total            0–100
 */

import activityTypes from '../data/activity_types.json'
import badges from '../data/badges.json'

/**
 * LMS score: (certified / total_slots) × 40
 * @param {Array} progressList  - all teacher_progress records for this school
 * @param {Array} teachers      - user records with role=teacher for this school
 * @param {Array} publishedCourses
 * @returns {number} 0–40
 */
export function computeLMSScore(progressList, teachers, publishedCourses) {
  const totalSlots = teachers.length * publishedCourses.length
  if (totalSlots === 0) return 0
  const certified = progressList.filter(p =>
    teachers.some(t => t.id === p.teacher_id) && p.status === 'certified'
  ).length
  return Math.round((certified / totalSlots) * 40)
}

/**
 * Activity score: sum of score_weight for validated reports in the period, capped at 40
 * @param {Array} validatedReports - already filtered to school + period + status=validated
 * @returns {number} 0–40
 */
export function computeActivityScore(validatedReports) {
  const raw = validatedReports.reduce((sum, r) => {
    const type = activityTypes.find(t => t.id === r.activity_type_id)
    return sum + (type?.score_weight || 0)
  }, 0)
  return Math.min(40, raw)
}

/**
 * Consistency bonus: how many of the last 3 months had ≥1 validated report?
 *   3 months → 20 pts | 2 months → 10 pts | ≤1 month → 0 pts
 * @param {Array}  allReports    - entire reports dataset
 * @param {string} schoolId
 * @param {string} currentPeriod - "YYYY-MM"
 * @returns {number} 0 | 10 | 20
 */
export function computeConsistencyBonus(allReports, schoolId, currentPeriod) {
  const periods = getRecentPeriods(currentPeriod, 3)
  const hit = periods.filter(p =>
    allReports.some(r =>
      r.school_id === schoolId &&
      r.report_period === p &&
      r.status === 'validated'
    )
  ).length
  if (hit >= 3) return 20
  if (hit >= 2) return 10
  return 0
}

/**
 * Returns the N most-recent period strings ending at (and including) currentPeriod.
 * Example: getRecentPeriods("2025-03", 3) → ["2025-03", "2025-02", "2025-01"]
 */
export function getRecentPeriods(currentPeriod, n) {
  const [year, month] = currentPeriod.split('-').map(Number)
  const result = []
  for (let i = 0; i < n; i++) {
    let m = month - i
    let y = year
    while (m <= 0) { m += 12; y-- }
    result.push(`${y}-${String(m).padStart(2, '0')}`)
  }
  return result
}

/**
 * Returns the highest badge whose min_score ≤ totalScore, or null.
 */
export function computeBadge(totalScore) {
  const sorted = [...badges].sort((a, b) => b.min_score - a.min_score)
  return sorted.find(b => totalScore >= b.min_score) || null
}

/**
 * Full single-school score computation (convenience wrapper).
 */
export function computeSchoolScore({ school, teachers, teacherProgress, publishedCourses, allReports, period }) {
  const periodValidated = allReports.filter(r =>
    r.school_id === school.id && r.report_period === period && r.status === 'validated'
  )
  const lms_score        = computeLMSScore(teacherProgress, teachers, publishedCourses)
  const activity_score   = computeActivityScore(periodValidated)
  const consistency_bonus = computeConsistencyBonus(allReports, school.id, period)
  const total_score      = lms_score + activity_score + consistency_bonus
  const badge            = computeBadge(total_score)

  return {
    school_id: school.id,
    school_name: school.name,
    period,
    lms_score,
    activity_score,
    consistency_bonus,
    total_score,
    badge,
    report_count: periodValidated.length,
    teacher_count: teachers.length,
  }
}
