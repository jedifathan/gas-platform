/**
 * reportService.js — Supabase version
 *
 * All functions are now async. Update call sites:
 *   const result = await saveDraft(data)
 *   const reports = await getReports(filters)
 */

import { supabase } from './supabaseClient'

// ─────────────────────────────────────────────────────────────────────────────

function now() { return new Date().toISOString() }

/**
 * Enrich a raw report row with display-friendly joined fields.
 * Supabase does this automatically when you use select with joins.
 * Map the joined fields to match the shape the UI expects.
 */
function enrich(r) {
  return {
    ...r,
    school_name:      r.school?.name       ?? '—',
    school_district:  r.school?.district   ?? '—',
    school_region_id: r.school?.region_id  ?? null,
    activity_label:   r.activity_type?.label        ?? '—',
    activity_code:    r.activity_type?.code         ?? null,
    score_weight:     r.activity_type?.score_weight ?? 0,
    teacher_name:     r.teacher?.name      ?? '—',
  }
}

const REPORT_SELECT = `
  *,
  school:schools(id, name, district, region_id),
  teacher:users!teacher_id(id, name),
  activity_type:activity_types(id, code, label, score_weight)
`

export async function getReports(filters = {}) {
  let query = supabase.from('activity_reports').select(REPORT_SELECT)

  if (filters.status)     query = query.eq('status', filters.status)
  if (filters.school_id)  query = query.eq('school_id', filters.school_id)
  if (filters.period)     query = query.eq('report_period', filters.period)
  if (filters.teacher_id) query = query.eq('teacher_id', filters.teacher_id)
  if (filters.region_id) {
    // Get school IDs in this region first
    const { data: schools } = await supabase
      .from('schools').select('id').eq('region_id', filters.region_id)
    const ids = (schools ?? []).map(s => s.id)
    query = query.in('school_id', ids.length ? ids : ['__none__'])
  }

  const { data, error } = await query.order('updated_at', { ascending: false })
  if (error) { console.error('getReports:', error); return [] }
  return (data ?? []).map(enrich)
}

export async function getReportById(id) {
  const { data } = await supabase.from('activity_reports')
    .select(REPORT_SELECT).eq('id', id).single()
  return data ? enrich(data) : null
}

export async function saveDraft(data) {
  const { school_id, teacher_id, activity_type_id, report_period, participant_count, description, evidence_notes } = data

  // Duplicate check
  const { data: dup } = await supabase.from('activity_reports')
    .select('id,status')
    .eq('school_id', school_id)
    .eq('report_period', report_period)
    .eq('activity_type_id', activity_type_id)
    .in('status', ['draft','submitted','validated'])
    .single()

  if (dup) return { success: false, error: 'DUPLICATE_PERIOD', message: 'Laporan untuk periode dan jenis kegiatan ini sudah ada.', existing_id: dup.id, existing_status: dup.status }

  const count = parseInt(participant_count)
  if (!count || count < 1) return { success: false, error: 'VALIDATION_FAILED', field: 'participant_count', message: 'Jumlah peserta minimal 1.' }

  const { data: report, error } = await supabase.from('activity_reports').insert({
    school_id, teacher_id, activity_type_id, report_period,
    participant_count: count,
    description:    description    || '',
    evidence_notes: evidence_notes || null,
    status: 'draft',
  }).select(REPORT_SELECT).single()

  if (error) return { success: false, error: error.message, message: error.message }
  return { success: true, report: enrich(report) }
}

export async function updateDraft(reportId, data) {
  const { data: existing } = await supabase.from('activity_reports').select('status').eq('id', reportId).single()
  if (!existing)               return { success: false, error: 'NOT_FOUND' }
  if (existing.status !== 'draft') return { success: false, error: 'NOT_DRAFT', message: 'Hanya laporan draft yang bisa diedit.' }

  const update = {}
  if (data.activity_type_id  !== undefined) update.activity_type_id  = data.activity_type_id
  if (data.report_period     !== undefined) update.report_period     = data.report_period
  if (data.participant_count !== undefined) update.participant_count = parseInt(data.participant_count)
  if (data.description       !== undefined) update.description       = data.description
  if (data.evidence_notes    !== undefined) update.evidence_notes    = data.evidence_notes
  update.updated_at = now()

  const { data: report, error } = await supabase.from('activity_reports')
    .update(update).eq('id', reportId).select(REPORT_SELECT).single()
  if (error) return { success: false, error: error.message }
  return { success: true, report: enrich(report) }
}

export async function deleteDraft(reportId, teacherId) {
  const { data: existing } = await supabase.from('activity_reports').select('status,teacher_id').eq('id', reportId).single()
  if (!existing)               return { success: false, error: 'NOT_FOUND' }
  if (existing.status !== 'draft') return { success: false, error: 'NOT_DRAFT', message: 'Hanya laporan draft yang dapat dihapus.' }
  if (existing.teacher_id !== teacherId) return { success: false, error: 'NOT_OWNER', message: 'Anda hanya dapat menghapus laporan Anda sendiri.' }

  const { error } = await supabase.from('activity_reports').delete().eq('id', reportId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function submitReport(reportId) {
  const { data: existing } = await supabase.from('activity_reports').select('status,description').eq('id', reportId).single()
  if (!existing)               return { success: false, error: 'NOT_FOUND' }
  if (existing.status !== 'draft') return { success: false, error: 'NOT_DRAFT', message: 'Hanya laporan draft yang bisa dikirim.' }
  if (!existing.description || existing.description.trim().length < 10)
    return { success: false, error: 'VALIDATION_FAILED', field: 'description', message: 'Deskripsi minimal 10 karakter.' }

  const { data: report, error } = await supabase.from('activity_reports')
    .update({ status: 'submitted', submitted_at: now(), updated_at: now() })
    .eq('id', reportId).select(REPORT_SELECT).single()
  if (error) return { success: false, error: error.message }
  return { success: true, report: enrich(report) }
}

export async function validateReport(reportId, adminId, notes, action) {
  if (!['validated','rejected'].includes(action)) return { success: false, error: 'INVALID_ACTION' }

  const { data: existing } = await supabase.from('activity_reports').select('status').eq('id', reportId).single()
  if (!existing) return { success: false, error: 'NOT_FOUND' }
  if (existing.status !== 'submitted') return { success: false, error: 'INVALID_STATE', message: `Tidak bisa ${action} laporan berstatus: ${existing.status}` }
  if (action === 'rejected' && (!notes || notes.trim().length < 5))
    return { success: false, error: 'NOTES_REQUIRED', message: 'Catatan wajib diisi saat menolak (min. 5 karakter).' }

  const { data: report, error } = await supabase.from('activity_reports').update({
    status:       action,
    admin_notes:  notes || null,
    validated_by: adminId,
    validated_at: now(),
    updated_at:   now(),
  }).eq('id', reportId).select(REPORT_SELECT).single()
  if (error) return { success: false, error: error.message }
  return { success: true, report: enrich(report) }
}

export async function getActivityTypes() {
  const { data } = await supabase.from('activity_types').select('*').eq('is_active', true)
  return data ?? []
}

export async function getPendingCount() {
  const { count } = await supabase.from('activity_reports')
    .select('*', { count: 'exact', head: true }).eq('status', 'submitted')
  return count ?? 0
}
