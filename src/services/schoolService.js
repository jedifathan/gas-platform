/**
 * schoolService.js — fetches from /api/schools (PostgreSQL via Express)
 */
const BASE = '/api'
import { getToken } from './authService'

function authHeaders() {
  const token = getToken()
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

export async function getAllSchools() {
  try {
    const res = await fetch(`${BASE}/schools`, { headers: authHeaders() })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export async function getSchoolsByRegion(regionId) {
  try {
    const res = await fetch(`${BASE}/schools?region_id=${regionId}`, { headers: authHeaders() })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export async function getSchoolById(id) {
  try {
    const res = await fetch(`${BASE}/schools/${id}`, { headers: authHeaders() })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export async function createSchool(data) {
  try {
    const res = await fetch(`${BASE}/schools`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) })
    return res.json()
  } catch { return { success: false, error: 'NETWORK_ERROR', message: 'Tidak dapat terhubung ke server.' } }
}

export async function updateSchool(id, data) {
  try {
    const res = await fetch(`${BASE}/schools/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data) })
    return res.json()
  } catch { return { success: false, error: 'NETWORK_ERROR', message: 'Tidak dapat terhubung ke server.' } }
}
