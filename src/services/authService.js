/**
 * authService.js
 * Login simulation, session data assembly, user management.
 *
 * Production swap:
 *   login()          → POST  /api/auth/login
 *   getAllUsers()     → GET   /api/users
 *   createUser()     → POST  /api/users
 *   updateUser()     → PATCH /api/users/:id
 *   toggleUserActive()→ PATCH /api/users/:id
 */

import usersData    from '../data/users.json'
import schoolsData  from '../data/schools.json'
import regionsData  from '../data/regions.json'
import { PERMISSIONS } from '../utils/permissions'

// Mutable in-memory copy
let users = usersData.map(u => ({ ...u }))

function uid() {
  return `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

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

  user.last_login = new Date().toISOString()

  const school = user.school_id ? (schoolsData.find(s => s.id === user.school_id) ?? null) : null
  const region = user.region_id ? (regionsData.find(r => r.id === user.region_id) ?? null)  : null

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
 * Create a new user account.
 */
export function createUser(data) {
  const { name, email, password, role, school_id, region_id } = data

  if (!name?.trim())         return { success: false, error: 'VALIDATION', field: 'name',     message: 'Nama wajib diisi.' }
  if (!email?.trim())        return { success: false, error: 'VALIDATION', field: 'email',    message: 'Email wajib diisi.' }
  if (!password || password.length < 6)
    return { success: false, error: 'VALIDATION', field: 'password', message: 'Password minimal 6 karakter.' }
  if (!['teacher', 'gov_observer', 'admin'].includes(role))
    return { success: false, error: 'VALIDATION', field: 'role',     message: 'Role tidak valid.' }

  const dup = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())
  if (dup) return { success: false, error: 'DUPLICATE_EMAIL', message: 'Email sudah terdaftar.' }

  const user = {
    id:         uid(),
    name:       name.trim(),
    email:      email.trim().toLowerCase(),
    password,
    role,
    school_id:  school_id  || null,
    region_id:  region_id  || null,
    is_active:  true,
    created_at: new Date().toISOString(),
    last_login: null,
  }
  users.push(user)
  return { success: true, user: { ...user, password: undefined } }
}

/**
 * Update an existing user's editable fields.
 */
export function updateUser(userId, data) {
  const user = users.find(u => u.id === userId)
  if (!user) return { success: false, error: 'NOT_FOUND' }

  const allowed = ['name', 'email', 'school_id', 'region_id', 'password']
  allowed.forEach(key => {
    if (data[key] !== undefined && data[key] !== '') {
      user[key] = typeof data[key] === 'string' ? data[key].trim() : data[key]
    }
  })
  return { success: true, user: { ...user, password: undefined } }
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
