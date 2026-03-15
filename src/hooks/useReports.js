import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import {
  getReports,
  getReportById,
  saveDraft,
  updateDraft,
  submitReport,
  validateReport,
  getActivityTypes,
  getPendingCount,
} from '../services/reportService'

/**
 * useReports — data + actions for activity reports.
 * Automatically scopes results to the current user's role:
 *   teacher      → own school only
 *   gov_observer → own region only
 *   admin        → all schools
 *
 * Usage:
 *   const { reports, loading, submit, validate } = useReports()
 *   const { reports } = useReports({ status: 'submitted' })
 */
export function useReports(initialFilters = {}) {
  const { session } = useAuth()

  const [reports,       setReports]       = useState([])
  const [activityTypes, setActivityTypes] = useState([])
  const [pendingCount,  setPendingCount]  = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [filters,       setFilters]       = useState(initialFilters)

  // Build scope-aware filter from session role
  function buildScopedFilters(extra = {}) {
    const base = { ...extra }
    if (session?.role === 'teacher')       base.school_id = session.school_id
    if (session?.role === 'gov_observer')  base.region_id = session.region_id
    return base
  }

  const refresh = useCallback(() => {
    setLoading(true)
    const scoped = buildScopedFilters(filters)
    setReports(getReports(scoped))
    setActivityTypes(getActivityTypes())
    setPendingCount(getPendingCount())
    setLoading(false)
  }, [session, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refresh() }, [refresh])

  // ── Filters ───────────────────────────────────────────────────────────────

  function applyFilters(newFilters) {
    setFilters(f => ({ ...f, ...newFilters }))
  }

  function clearFilters() {
    setFilters(initialFilters)
  }

  // ── Teacher actions ───────────────────────────────────────────────────────

  function createDraft(data) {
    const result = saveDraft({
      ...data,
      school_id:  session?.school_id,
      teacher_id: session?.user_id,
    })
    if (result.success) refresh()
    return result
  }

  function editDraft(reportId, data) {
    const result = updateDraft(reportId, data)
    if (result.success) refresh()
    return result
  }

  function submit(reportId) {
    const result = submitReport(reportId)
    if (result.success) refresh()
    return result
  }

  // ── Admin actions ─────────────────────────────────────────────────────────

  function validate(reportId, notes) {
    const result = validateReport(reportId, session?.user_id, notes, 'validated')
    if (result.success) refresh()
    return result
  }

  function reject(reportId, notes) {
    const result = validateReport(reportId, session?.user_id, notes, 'rejected')
    if (result.success) refresh()
    return result
  }

  // ── Reads ─────────────────────────────────────────────────────────────────

  function getById(reportId) {
    return getReportById(reportId)
  }

  function getFiltered(extraFilters) {
    return getReports(buildScopedFilters({ ...filters, ...extraFilters }))
  }

  return {
    reports,
    activityTypes,
    pendingCount,
    loading,
    filters,
    applyFilters,
    clearFilters,
    refresh,
    // Teacher
    createDraft,
    editDraft,
    submit,
    // Admin
    validate,
    reject,
    // Reads
    getById,
    getFiltered,
  }
}
