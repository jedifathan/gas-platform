/**
 * reportService.js
 * Activity report CRUD — draft → submitted → validated/rejected state machine.
 *
 * RBAC summary (enforced at service level for correctness):
 *   CREATE draft    → teacher (own school only, checked by caller via session.school_id)
 *   UPDATE draft    → teacher who created it (checked by canEditReport)
 *   DELETE draft    → teacher who created it (checked by canDeleteReport)
 *   SUBMIT draft    → teacher who created it
 *   VALIDATE/REJECT → admin only (enforced by route guard + validateReport action param)
 *   READ            → scoped by role via useReports buildScopedFilters
 *
 * Production swap:
 *   getReports()     → GET    /api/reports
 *   saveDraft()      → POST   /api/reports
 *   updateDraft()    → PATCH  /api/reports/:id
 *   deleteDraft()    → DELETE /api/reports/:id
 *   submitReport()   → PATCH  /api/reports/:id/submit
 *   validateReport() → PATCH  /api/reports/:id/validate
 */

import reportsData       from '../data/activity_reports.json'
import activityTypesData from '../data/activity_types.json'
import schoolsData       from '../data/schools.json'
import usersData         from '../data/users.json'

let reports = reportsData.map(r => ({ ...r }))

function uid(p) { return `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}` }
function now()  { return new Date().toISOString() }

function enrich(report) {
  const school  = schoolsData.find(s => s.id === report.school_id)
  const type    = activityTypesData.find(t => t.id === report.activity_type_id)
  const teacher = usersData.find(u => u.id === report.teacher_id)
  return {
    ...report,
    school_name:      school?.name       ?? '—',
    school_district:  school?.district   ?? '—',
    school_region_id: school?.region_id  ?? null,
    activity_label:   type?.label        ?? '—',
    activity_code:    type?.code         ?? null,
    score_weight:     type?.score_weight ?? 0,
    teacher_name:     teacher?.name      ?? '—',
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export function getReports(filters = {}) {
  let result = [...reports]
  if (filters.status)     result = result.filter(r => r.status === filters.status)
  if (filters.school_id)  result = result.filter(r => r.school_id === filters.school_id)
  if (filters.period)     result = result.filter(r => r.report_period === filters.period)
  if (filters.teacher_id) result = result.filter(r => r.teacher_id === filters.teacher_id)
  if (filters.region_id) {
    const regionSchools = schoolsData.filter(s => s.region_id === filters.region_id).map(s => s.id)
    result = result.filter(r => regionSchools.includes(r.school_id))
  }
  return result
    .map(enrich)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
}

export function getReportById(id) {
  const r = reports.find(r => r.id === id)
  return r ? enrich(r) : null
}

/** Check if a user can edit a draft report */
export function canEditReport(reportId, userId, schoolId) {
  const report = reports.find(r => r.id === reportId)
  if (!report)               return { allowed: false, reason: 'NOT_FOUND' }
  if (report.status !== 'draft') return { allowed: false, reason: 'NOT_DRAFT' }
  if (report.teacher_id !== userId && report.school_id !== schoolId)
    return { allowed: false, reason: 'NOT_OWNER' }
  return { allowed: true }
}

/** Check if a user can delete a draft report */
export function canDeleteReport(reportId, userId) {
  const report = reports.find(r => r.id === reportId)
  if (!report)               return { allowed: false, reason: 'NOT_FOUND' }
  if (report.status !== 'draft') return { allowed: false, reason: 'NOT_DRAFT', message: 'Hanya laporan draft yang dapat dihapus.' }
  if (report.teacher_id !== userId) return { allowed: false, reason: 'NOT_OWNER', message: 'Anda hanya dapat menghapus laporan Anda sendiri.' }
  return { allowed: true }
}

export function saveDraft(data) {
  const { school_id, teacher_id, activity_type_id, report_period, participant_count, description, evidence_notes } = data

  const dup = reports.find(r =>
    r.school_id === school_id &&
    r.report_period === report_period &&
    r.activity_type_id === activity_type_id &&
    ['draft', 'submitted', 'validated'].includes(r.status)
  )
  if (dup) return {
    success: false, error: 'DUPLICATE_PERIOD',
    message: 'Laporan untuk periode dan jenis kegiatan ini sudah ada.',
    existing_id: dup.id, existing_status: dup.status,
  }

  const count = parseInt(participant_count)
  if (!count || count < 1)
    return { success: false, error: 'VALIDATION_FAILED', field: 'participant_count', message: 'Jumlah peserta minimal 1.' }

  const report = {
    id: uid('rpt'), school_id, teacher_id, activity_type_id, report_period,
    participant_count: count,
    description:    description    || '',
    evidence_notes: evidence_notes || null,
    submitted_at: null, status: 'draft',
    admin_notes: null, validated_by: null, validated_at: null,
    created_at: now(), updated_at: now(),
  }
  reports.push(report)
  return { success: true, report: enrich(report) }
}

export function updateDraft(reportId, data) {
  const report = reports.find(r => r.id === reportId)
  if (!report)               return { success: false, error: 'NOT_FOUND' }
  if (report.status !== 'draft') return { success: false, error: 'NOT_DRAFT', message: 'Hanya laporan draft yang bisa diedit.' }
  Object.assign(report, {
    activity_type_id:  data.activity_type_id  ?? report.activity_type_id,
    report_period:     data.report_period      ?? report.report_period,
    participant_count: data.participant_count  ? parseInt(data.participant_count) : report.participant_count,
    description:       data.description        ?? report.description,
    evidence_notes:    data.evidence_notes     ?? report.evidence_notes,
    updated_at: now(),
  })
  return { success: true, report: enrich(report) }
}

/**
 * Delete a draft report.
 * Only the creating teacher can delete their own draft.
 * Submitted / validated / rejected reports cannot be deleted (audit trail).
 */
export function deleteDraft(reportId, teacherId) {
  const report = reports.find(r => r.id === reportId)
  if (!report)               return { success: false, error: 'NOT_FOUND' }
  if (report.status !== 'draft')
    return { success: false, error: 'NOT_DRAFT', message: 'Hanya laporan draft yang dapat dihapus.' }
  if (report.teacher_id !== teacherId)
    return { success: false, error: 'NOT_OWNER', message: 'Anda hanya dapat menghapus laporan Anda sendiri.' }

  reports = reports.filter(r => r.id !== reportId)
  return { success: true }
}

export function submitReport(reportId) {
  const report = reports.find(r => r.id === reportId)
  if (!report)               return { success: false, error: 'NOT_FOUND' }
  if (report.status !== 'draft') return { success: false, error: 'NOT_DRAFT', message: 'Hanya laporan draft yang bisa dikirim.' }
  if (!report.description || report.description.trim().length < 10)
    return { success: false, error: 'VALIDATION_FAILED', field: 'description', message: 'Deskripsi minimal 10 karakter.' }
  report.status      = 'submitted'
  report.submitted_at = now()
  report.updated_at   = now()
  return { success: true, report: enrich(report) }
}

/** Admin only: validate or reject a submitted report */
export function validateReport(reportId, adminId, notes, action) {
  if (!['validated', 'rejected'].includes(action))
    return { success: false, error: 'INVALID_ACTION' }
  const report = reports.find(r => r.id === reportId)
  if (!report) return { success: false, error: 'NOT_FOUND' }
  if (report.status !== 'submitted')
    return { success: false, error: 'INVALID_STATE', message: `Tidak bisa ${action} laporan berstatus: ${report.status}` }
  if (action === 'rejected' && (!notes || notes.trim().length < 5))
    return { success: false, error: 'NOTES_REQUIRED', message: 'Catatan wajib diisi saat menolak (min. 5 karakter).' }
  report.status       = action
  report.admin_notes  = notes || null
  report.validated_by = adminId
  report.validated_at = now()
  report.updated_at   = now()
  return { success: true, report: enrich(report) }
}

export function getActivityTypes() {
  return activityTypesData.filter(t => t.is_active)
}

export function getPendingCount() {
  return reports.filter(r => r.status === 'submitted').length
}
