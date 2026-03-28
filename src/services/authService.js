/**
 * authService.js
 *
 * All calls now go to the local Express API (proxied by Vite via /api/*).
 * The session shape returned by the API is IDENTICAL to the old JSON mock,
 * so AuthContext and useAuth require no changes.
 *
 * ⚠  getAllUsers / createUser / updateUser / toggleUserActive are now async.
 *    Any caller that used these synchronously must add `await`.
 *    (Primarily: src/pages/admin/UserManagement.jsx)
 */

const BASE = '/api'

// ── Token helpers ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'gas_token'

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * login(email, password)
 * Returns { success, session, token } on success — same shape as the old mock.
 * The token is stored in localStorage so subsequent API calls are authenticated.
 */
export async function login(email, password) {
  try {
    const res  = await fetch(`${BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    })
    const data = await res.json()

    if (data.success && data.token) {
      localStorage.setItem(TOKEN_KEY, data.token)
    }

    return data   // { success, session, token } or { success: false, error, message }
  } catch {
    return { success: false, error: 'NETWORK_ERROR', message: 'Tidak dapat terhubung ke server.' }
  }
}

/** Call this on logout to clear the stored token. */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// ── User management (admin only) ──────────────────────────────────────────────

export async function getAllUsers() {
  try {
    const res = await fetch(`${BASE}/users`, { headers: authHeaders() })
    if (!res.ok) return []
    return res.json()          // returns the array directly
  } catch {
    return []
  }
}

export async function getUserById(userId) {
  try {
    const res = await fetch(`${BASE}/users/${userId}`, { headers: authHeaders() })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function createUser(data) {
  try {
    const res = await fetch(`${BASE}/users`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify(data),
    })
    return res.json()          // { success, user } or { success: false, error, message }
  } catch {
    return { success: false, error: 'NETWORK_ERROR', message: 'Tidak dapat terhubung ke server.' }
  }
}

export async function updateUser(userId, data) {
  try {
    const res = await fetch(`${BASE}/users/${userId}`, {
      method:  'PATCH',
      headers: authHeaders(),
      body:    JSON.stringify(data),
    })
    return res.json()
  } catch {
    return { success: false, error: 'NETWORK_ERROR', message: 'Tidak dapat terhubung ke server.' }
  }
}

export async function toggleUserActive(userId) {
  try {
    const res = await fetch(`${BASE}/users/${userId}/toggle`, {
      method:  'PATCH',
      headers: authHeaders(),
    })
    return res.json()
  } catch {
    return { success: false, error: 'NETWORK_ERROR', message: 'Tidak dapat terhubung ke server.' }
  }
}
