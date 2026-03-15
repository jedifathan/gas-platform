/**
 * authService.js
 * Login simulation, session data assembly, user management.
 *
 * Production swap:
 *   login()          → POST /api/auth/login
 *   getAllUsers()     → GET  /api/users
 *   toggleUserActive()→ PATCH /api/users/:id
 */

import usersData    from '../data/users.json'
import schoolsData  from '../data/schools.json'
import regionsData  from '../data/regions.json'
import { PERMISSIONS } from '../utils/permissions'

// Mutable in-memory copy — simulates DB row updates
let users = usersData.map(u => ({ ...u }))

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Authenticate a user.
 * @returns {{ success, session } | { success, error, message }}
 */
export function login(email, password) {
  const user = users.find(u => u.email === email)

  if (!user)
    return { success: false, error: 'USER_NOT_FOUND',      message: 'Email tidak ditemukan.' }
  if (!user.is_active)
    return { success: false, error: 'ACCOUNT_DISABLED',    message: 'Akun ini telah dinonaktifkan.' }
  if (user.password !== password)
    return { success: false, error: 'INVALID_PASSWORD',    message: 'Password salah.' }

  // Stamp last_login (simulates DB write)
  user.last_login = new Date().toISOString()

  const school = user.school_id
    ? schoolsData.find(s => s.id === user.school_id) ?? null
    : null

  const region = user.region_id
    ? regionsData.find(r => r.id === user.region_id) ?? null
    : null

  const session = {
    user_id:     user.id,
    name:        user.name,
    email:       user.email,
    role:        user.role,
    school_id:   user.school_id  ?? null,
    region_id:   user.region_id  ?? null,
    school:      school  ? { id: school.id,  name: school.name,  district: school.district, region_id: school.region_id } : null,
    region:      region  ? { id: region.id,  name: region.name,  province: region.province } : null,
    permissions: PERMISSIONS[user.role] ?? [],
    last_login:  user.last_login,
  }

  return { success: true, session }
}

/**
 * Return all users (admin view) — password field stripped.
 */
export function getAllUsers() {
  return users.map(u => ({
    ...u,
    password: undefined,
    school: u.school_id ? (schoolsData.find(s => s.id === u.school_id) ?? null) : null,
    region: u.region_id ? (regionsData.find(r => r.id === u.region_id) ?? null) : null,
  }))
}

/**
 * Get one user by ID — password stripped.
 */
export function getUserById(userId) {
  const u = users.find(u => u.id === userId)
  if (!u) return null
  return {
    ...u,
    password: undefined,
    school: u.school_id ? (schoolsData.find(s => s.id === u.school_id) ?? null) : null,
    region: u.region_id ? (regionsData.find(r => r.id === u.region_id) ?? null) : null,
  }
}

/**
 * Toggle is_active for a non-admin user.
 */
export function toggleUserActive(userId) {
  const user = users.find(u => u.id === userId)
  if (!user)              return { success: false, error: 'USER_NOT_FOUND' }
  if (user.role === 'admin')
    return { success: false, error: 'CANNOT_DEACTIVATE_ADMIN', message: 'Admin tidak dapat dinonaktifkan.' }
  user.is_active = !user.is_active
  return { success: true, user_id: userId, is_active: user.is_active }
}
