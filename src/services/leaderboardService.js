/**
 * leaderboardService.js
 * School scoring, leaderboard computation, badge assignment, ranking persistence.
 *
 * Production swap:
 *   computeLeaderboard() → GET  /api/scores?period=&region=
 *   recomputeScores()    → POST /api/scores/recompute
 *   getSchoolScore()     → GET  /api/scores/:schoolId?period=
 */

import schoolsData from '../data/schools.json'
import usersData   from '../data/users.json'
import scoresData  from '../data/school_scores.json'
import { getReports }         from './reportService'
import { getLMSCompletionRate } from './lmsService'
import { computeActivityScore, computeConsistencyBonus, computeBadge } from '../utils/scoring'

// Mutable scores store
let scores = scoresData.map(s => ({ ...s }))

// ─────────────────────────────────────────────────────────────────────────────

/** Stored (pre-computed) scores with optional filters */
export function getScores(filters = {}) {
  let result = [...scores]
  if (filters.period)    result = result.filter(s => s.period === filters.period)
  if (filters.school_id) result = result.filter(s => s.school_id === filters.school_id)
  return result
}

/**
 * Live-compute leaderboard for a period.
 * Optionally scope to a region. Returns ranked array.
 */
export function computeLeaderboard(period, regionId = null) {
  let schools = schoolsData.filter(s => s.status === 'active')
  if (regionId) schools = schools.filter(s => s.region_id === regionId)

  const allReports = getReports({})

  const rankings = schools.map(school => {
    const teachers      = usersData.filter(u => u.role === 'teacher' && u.school_id === school.id)
    const periodValidated = allReports.filter(r =>
      r.school_id === school.id && r.report_period === period && r.status === 'validated'
    )

    const { lms_score }      = getLMSCompletionRate(school.id, teachers)
    const activity_score     = computeActivityScore(periodValidated)
    const consistency_bonus  = computeConsistencyBonus(allReports, school.id, period)
    const total_score        = lms_score + activity_score + consistency_bonus
    const badge              = computeBadge(total_score)

    return {
      school_id:   school.id,
      school_name: school.name,
      district:    school.district,
      region_id:   school.region_id,
      period,
      lms_score,
      activity_score,
      consistency_bonus,
      total_score,
      badge,
      report_count:  periodValidated.length,
      teacher_count: teachers.length,
    }
  })

  rankings.sort((a, b) => b.total_score - a.total_score)
  rankings.forEach((s, i) => { s.rank = i + 1 })

  return rankings
}

/** Single school live score */
export function getSchoolScore(schoolId, period) {
  const rankings = computeLeaderboard(period)
  return rankings.find(r => r.school_id === schoolId) ?? null
}

/**
 * Recompute scores for a period and persist into the in-memory store.
 * Called from admin "Hitung Ulang" action.
 */
export function recomputeScores(period, regionId = null) {
  const rankings = computeLeaderboard(period, regionId)

  rankings.forEach(r => {
    const existing = scores.find(s => s.school_id === r.school_id && s.period === period)
    const payload  = {
      lms_score:         r.lms_score,
      activity_score:    r.activity_score,
      consistency_bonus: r.consistency_bonus,
      total_score:       r.total_score,
      rank:              r.rank,
      badge_id:          r.badge?.id ?? null,
      computed_at:       new Date().toISOString(),
    }
    if (existing) {
      Object.assign(existing, payload)
    } else {
      scores.push({ id: `ss-${Date.now().toString(36)}-${r.school_id}`, school_id: r.school_id, period, ...payload })
    }
  })

  return { success: true, recomputed: rankings.length, period, rankings }
}
