/**
 * regionService.js — fetches from /api/regions (PostgreSQL via Express)
 */
const BASE = '/api'
import { getToken } from './authService'

function authHeaders() {
  const token = getToken()
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

export async function getAllRegions() {
  try {
    const res = await fetch(`${BASE}/regions`, { headers: authHeaders() })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export async function getRegionById(id) {
  try {
    const res = await fetch(`${BASE}/regions/${id}`, { headers: authHeaders() })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export async function createRegion(data) {
  try {
    const res = await fetch(`${BASE}/regions`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(data)
    })
    return res.json()
  } catch { return { success: false, error: 'NETWORK_ERROR', message: 'Tidak dapat terhubung ke server.' } }
}

export async function updateRegion(id, data) {
  try {
    const res = await fetch(`${BASE}/regions/${id}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data)
    })
    return res.json()
  } catch { return { success: false, error: 'NETWORK_ERROR', message: 'Tidak dapat terhubung ke server.' } }
}

export async function deleteRegion(id) {
  try {
    const res = await fetch(`${BASE}/regions/${id}`, {
      method: 'DELETE', headers: authHeaders()
    })
    return res.json()
  } catch { return { success: false, error: 'NETWORK_ERROR', message: 'Tidak dapat terhubung ke server.' } }
}
