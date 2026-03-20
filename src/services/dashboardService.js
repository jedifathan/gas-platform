/**
 * dashboardService.js
 * Role-scoped KPI aggregation for the three dashboard variants.
 *
 * Production swap:
 *   getAdminStats()        → GET /api/dashboard/stats?role=admin&period=
 *   getTeacherStats()      → GET /api/dashboard/stats?role=teacher&period=
 *   getGovStats()          → GET /api/dashboard/stats?role=gov&period=
 *   getMultiPeriodStats()  → GET /api/dashboard/trend?n=4&region=
 */

import schoolsData  from '../data/schools.json'
import usersData    from '../data/users.json'
import regionsData  from '../data/regions.json'
import { getReports }           from './reportService'
import { getTeacherProgress, getCourses } from './lmsService'
import { computeLeaderboard }   from './leaderboardService'

// ─────────────────────────────────────────────────────────────────────────────

/** Build N period strings ending at (and including) currentPeriod, oldest first */
function recentPeriods(currentPeriod, n) {
  const [year, month] = currentPeriod.split('-').map(Number)
  const result = []
  for (let i = n - 1; i >= 0; i--) {
    let m = month - i
    let y = year
    while (m <= 0) { m += 12; y-- }
    result.push(`${y}-${String(m).padStart(2, '0')}`)
  }
  return result
}

// ─────────────────────────────────────────────────────────────────────────────

/** Admin: system-wide KPIs, coverage per region, top schools, recent reports */
export function getAdminStats(period) {
  const allReports     = getReports({ period })
  const validated      = allReports.filter(r => r.status === 'validated')
  const pending        = allReports.filter(r => r.status === 'submitted')
  const activeSchools  = schoolsData.filter(s => s.status === 'active')
  const teachers       = usersData.filter(u => u.role === 'teacher' && u.is_active)
  const allProgress    = teachers.flatMap(t => getTeacherProgress(t.id))
  const certifiedIds   = [...new Set(allProgress.filter(p => p.status === 'certified').map(p => p.teacher_id))]
  const reportingIds   = [...new Set(validated.map(r => r.school_id))]

  const rankings  = computeLeaderboard(period)
  const avgScore  = rankings.length
    ? Math.round((rankings.reduce((s, r) => s + r.total_score, 0) / rankings.length) * 10) / 10
    : 0

  const coverage = regionsData.map(reg => {
    const regSchools   = activeSchools.filter(s => s.region_id === reg.id)
    const regReporting = regSchools.filter(s => reportingIds.includes(s.id))
    return {
      region_id:   reg.id,
      region_name: reg.name,
      total:       regSchools.length,
      reporting:   regReporting.length,
      pct:         regSchools.length
        ? Math.round((regReporting.length / regSchools.length) * 100)
        : 0,
    }
  })

  return {
    period,
    role: 'admin',
    kpis: {
      active_schools:    activeSchools.length,
      total_schools:     schoolsData.length,
      validated_reports: validated.length,
      pending_reports:   pending.length,
      trained_teachers:  certifiedIds.length,
      total_teachers:    teachers.length,
      avg_score:         avgScore,
      reporting_schools: reportingIds.length,
    },
    coverage,
    top_schools:    rankings.slice(0, 5),
    recent_reports: allReports.slice(0, 8),
  }
}

/** Teacher: personal LMS + report stats, school rank */
export function getTeacherStats(teacherId, period) {
  const teacher = usersData.find(u => u.id === teacherId)
  if (!teacher) return null

  const progress         = getTeacherProgress(teacherId)
  const publishedCourses = getCourses()
  const certified        = progress.filter(p => p.status === 'certified').length
  const inProgress       = progress.filter(p => p.status === 'in_progress').length

  const myReports       = getReports({ school_id: teacher.school_id, teacher_id: teacherId })
  const periodReports   = myReports.filter(r => r.report_period === period)
  const validatedPeriod = periodReports.filter(r => r.status === 'validated')

  const rankings   = computeLeaderboard(period)
  const schoolRank = rankings.find(r => r.school_id === teacher.school_id)

  return {
    period,
    role:         'teacher',
    teacher_name: teacher.name,
    school_id:    teacher.school_id,
    kpis: {
      courses_certified:     certified,
      courses_in_progress:   inProgress,
      total_courses:         publishedCourses.length,
      reports_this_period:   periodReports.length,
      validated_this_period: validatedPeriod.length,
      school_rank:           schoolRank?.rank        ?? null,
      school_score:          schoolRank?.total_score ?? 0,
      school_badge:          schoolRank?.badge       ?? null,
    },
    course_progress: publishedCourses.map(c => {
      const prog = progress.find(p => p.course_id === c.id)
      return {
        course:   c,
        progress: prog || null,
        status:   prog?.status || 'not_started',
        pct: prog
          ? Math.round((prog.lessons_completed.length / c.total_lessons) * 100)
          : 0,
      }
    }),
    recent_reports: myReports.slice(0, 5),
  }
}

/** Gov Observer: region-scoped KPIs, per-school status, rankings */
export function getGovStats(regionId, period) {
  const region = regionsData.find(r => r.id === regionId)
  if (!region) return null

  const regionSchools  = schoolsData.filter(s => s.region_id === regionId)
  const regionTeachers = usersData.filter(u =>
    u.role === 'teacher' && regionSchools.some(s => s.id === u.school_id)
  )
  const allProgress  = regionTeachers.flatMap(t => getTeacherProgress(t.id))
  const certifiedIds = [...new Set(allProgress.filter(p => p.status === 'certified').map(p => p.teacher_id))]

  const regionReports = getReports({ region_id: regionId, period })
  const validated     = regionReports.filter(r => r.status === 'validated')
  const reportingIds  = [...new Set(validated.map(r => r.school_id))]

  const rankings = computeLeaderboard(period, regionId)
  const avgScore = rankings.length
    ? Math.round((rankings.reduce((s, r) => s + r.total_score, 0) / rankings.length) * 10) / 10
    : 0

  const schoolStatus = regionSchools.map(school => ({
    school,
    rank:      rankings.find(r => r.school_id === school.id) ?? null,
    reports:   regionReports.filter(r => r.school_id === school.id),
    reporting: reportingIds.includes(school.id),
  }))

  return {
    period,
    role:        'gov_observer',
    region_name: region.name,
    region_id:   regionId,
    kpis: {
      total_schools:      regionSchools.length,
      reporting_schools:  reportingIds.length,
      validated_reports:  validated.length,
      avg_score:          avgScore,
      certified_teachers: certifiedIds.length,
      total_teachers:     regionTeachers.length,
    },
    school_status: schoolStatus,
    rankings,
  }
}

/**
 * Multi-period trend data for dashboard charts.
 * Returns the last N months (oldest → newest) for bar/line charts.
 *
 * @param {string} currentPeriod  e.g. "2025-02"
 * @param {number} n              number of periods to include (default 4)
 * @param {string|null} regionId  scope to a region (gov/admin filter)
 */
export function getMultiPeriodStats(currentPeriod, n = 4, regionId = null) {
  const periods = recentPeriods(currentPeriod, n)

  return periods.map(period => {
    const allReports = regionId
      ? getReports({ region_id: regionId, period })
      : getReports({ period })

    const validated = allReports.filter(r => r.status === 'validated')
    const rankings  = computeLeaderboard(period, regionId)
    const avgScore  = rankings.length
      ? Math.round(rankings.reduce((s, r) => s + r.total_score, 0) / rankings.length)
      : 0

    // Short month label for chart x-axis
    const [y, m] = period.split('-')
    const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
    const label  = `${MONTHS[parseInt(m) - 1]} '${y.slice(2)}`

    return {
      period,
      name:       label,
      validated:  validated.length,
      avg_score:  avgScore,
      reporting:  new Set(validated.map(r => r.school_id)).size,
    }
  })
}
