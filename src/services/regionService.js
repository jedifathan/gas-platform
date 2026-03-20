/**
 * regionService.js
 * Wilayah CRUD for admin management.
 *
 * Production swap:
 *   getAllRegions()  → GET    /api/regions
 *   createRegion()  → POST   /api/regions
 *   updateRegion()  → PATCH  /api/regions/:id
 *   deleteRegion()  → DELETE /api/regions/:id  (soft-delete if schools exist)
 */

import regionsData from '../data/regions.json'

let regions = regionsData.map(r => ({ ...r }))

function uid() {
  return `reg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

// ─────────────────────────────────────────────────────────────────────────────

export function getAllRegions() {
  return [...regions]
}

export function getRegionById(id) {
  return regions.find(r => r.id === id) ?? null
}

export function createRegion(data) {
  const { name, province } = data
  if (!name?.trim())     return { success: false, error: 'VALIDATION', field: 'name',     message: 'Nama wilayah wajib diisi.' }
  if (!province?.trim()) return { success: false, error: 'VALIDATION', field: 'province', message: 'Provinsi wajib diisi.' }

  const dup = regions.find(r => r.name.trim().toLowerCase() === name.trim().toLowerCase())
  if (dup) return { success: false, error: 'DUPLICATE_NAME', message: 'Nama wilayah sudah terdaftar.' }

  const region = {
    id:         uid(),
    name:       name.trim(),
    province:   province.trim(),
    created_at: new Date().toISOString(),
  }
  regions.push(region)
  return { success: true, region }
}

export function updateRegion(id, data) {
  const region = regions.find(r => r.id === id)
  if (!region) return { success: false, error: 'NOT_FOUND' }

  if (data.name !== undefined)     region.name     = data.name.trim()
  if (data.province !== undefined) region.province = data.province.trim()
  return { success: true, region }
}

/**
 * Delete a region.
 * Blocked if any schools are still assigned to this region.
 * Pass schoolsData to perform the check.
 */
export function deleteRegion(id, schoolsData = []) {
  const region = regions.find(r => r.id === id)
  if (!region) return { success: false, error: 'NOT_FOUND' }

  const linked = schoolsData.filter(s => s.region_id === id)
  if (linked.length > 0) {
    return {
      success: false,
      error:   'HAS_SCHOOLS',
      message: `Wilayah tidak dapat dihapus karena masih memiliki ${linked.length} sekolah terdaftar. Pindahkan sekolah terlebih dahulu.`,
    }
  }

  regions = regions.filter(r => r.id !== id)
  return { success: true }
}
