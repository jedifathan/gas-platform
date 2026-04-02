import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import {
  getReports, getReportById,
  saveDraft, updateDraft, submitReport, validateReport, deleteDraft,
  getActivityTypes, getPendingCount,
} from '../services/reportService'

export function useReports(initialFilters = {}) {
  const { session } = useAuth()

  const [reports,       setReports]       = useState([])
  const [activityTypes, setActivityTypes] = useState([])
  const [pendingCount,  setPendingCount]  = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [filters,       setFilters]       = useState(initialFilters)

  function buildScopedFilters(extra = {}) {
    const base = { ...extra }
    if (session?.role === 'teacher')      base.school_id = session.school_id
    if (session?.role === 'gov_observer') base.region_id = session.region_id
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

  function applyFilters(newFilters) { setFilters(f => ({ ...f, ...newFilters })) }
  function clearFilters()           { setFilters(initialFilters) }

  function createDraft(data) {
    const result = saveDraft({
      ...data,
      school_id:    session?.school_id,
      teacher_id:   session?.user_id,
      teacher_name: session?.name,         // ← pass name from session
    })
    if (result.success) refresh()
    return result
  }

  function editDraft(reportId, data) {
    const result = updateDraft(reportId, data)
    if (result.success) refresh()
    return result
  }

  function removeDraft(reportId) {
    const result = deleteDraft(reportId, session?.user_id)
    if (result.success) refresh()
    return result
  }

  function submit(reportId) {
    const result = submitReport(reportId)
    if (result.success) refresh()
    return result
  }

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

  function getById(reportId)            { return getReportById(reportId) }
  function getFiltered(extraFilters)    { return getReports(buildScopedFilters({ ...filters, ...extraFilters })) }

  return {
    reports, activityTypes, pendingCount, loading, filters,
    applyFilters, clearFilters, refresh,
    createDraft, editDraft, removeDraft, submit,
    validate, reject,
    getById, getFiltered,
  }
}
