/**
 * schoolService.js
 * School CRUD for admin management panel.
 *
 * Production swap:
 *   getAllSchools()  → GET   /api/schools
 *   createSchool()  → POST  /api/schools
 *   updateSchool()  → PATCH /api/schools/:id
 */

import schoolsData from '../data/schools.json'
import regionsData from '../data/regions.json'

// Mutable in-memory store — mirrors the pattern used by authService / lmsService
let schools = schoolsData.map(s => ({ ...s }))

function uid() {
  return `sch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function enrich(school) {
  const region = regionsData.find(r => r.id === school.region_id) ?? null
  return { ...school, region }
}

// ─────────────────────────────────────────────────────────────────────────────

export function getAllSchools() {
  return schools.map(enrich)
}

export function getSchoolById(id) {
  const s = schools.find(s => s.id === id)
  return s ? enrich(s) : null
}

export function createSchool(data) {
  const { name, region_id, district, address, principal_name, phone, program_start_date, status = 'pending' } = data

  if (!name?.trim())     return { success: false, error: 'VALIDATION', field: 'name',      message: 'Nama sekolah wajib diisi.' }
  if (!region_id)        return { success: false, error: 'VALIDATION', field: 'region_id', message: 'Wilayah wajib dipilih.' }
  if (!district?.trim()) return { success: false, error: 'VALIDATION', field: 'district',  message: 'Kecamatan wajib diisi.' }

  const dup = schools.find(s => s.name.trim().toLowerCase() === name.trim().toLowerCase())
  if (dup) return { success: false, error: 'DUPLICATE_NAME', message: 'Nama sekolah sudah terdaftar.' }

  const school = {
    id: uid(),
    name: name.trim(),
    region_id,
    district: district.trim(),
    address: address?.trim() ?? '',
    principal_name: principal_name?.trim() ?? '',
    phone: phone?.trim() ?? '',
    enrollment_year: new Date().getFullYear(),
    program_start_date: program_start_date ?? new Date().toISOString().slice(0, 10),
    status,
    created_at: new Date().toISOString(),
  }
  schools.push(school)
  return { success: true, school: enrich(school) }
}

export function updateSchool(id, data) {
  const school = schools.find(s => s.id === id)
  if (!school) return { success: false, error: 'NOT_FOUND' }

  const allowed = ['name', 'region_id', 'district', 'address', 'principal_name', 'phone', 'status', 'program_start_date']
  allowed.forEach(key => {
    if (data[key] !== undefined) {
      school[key] = typeof data[key] === 'string' ? data[key].trim() : data[key]
    }
  })
  return { success: true, school: enrich(school) }
}
