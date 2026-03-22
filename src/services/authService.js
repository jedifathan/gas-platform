/**
 * authService.js  — Supabase version
 *
 * Replaces the in-memory JSON version.
 * Supabase Auth handles credentials; our `users` table stores role/profile.
 */

import { supabase } from './supabaseClient'
import { PERMISSIONS } from '../utils/permissions'

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Login with email + password via Supabase Auth.
 * Then fetch the user's profile row (role, school, region).
 */
export async function login(email, password) {
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password })

  if (authError) {
    const msg =
      authError.message === 'Invalid login credentials'
        ? 'Email atau password salah.'
        : authError.message
    return { success: false, error: authError.message, message: msg }
  }

  const profile = await getProfileByAuthId(authData.user.id)
  if (!profile) return { success: false, error: 'PROFILE_NOT_FOUND', message: 'Profil pengguna tidak ditemukan.' }
  if (!profile.is_active) return { success: false, error: 'ACCOUNT_DISABLED', message: 'Akun ini telah dinonaktifkan.' }

  // Update last_login
  await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', profile.id)

  return { success: true, session: buildSession(profile, authData.session) }
}

export async function logout() {
  await supabase.auth.signOut()
}

/**
 * Rehydrate session from Supabase session on page load.
 * Call this in AuthContext instead of reading from localStorage.
 */
export async function rehydrateSession() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const profile = await getProfileByAuthId(session.user.id)
  if (!profile || !profile.is_active) return null

  return buildSession(profile, session)
}

async function getProfileByAuthId(authId) {
  const { data } = await supabase
    .from('users')
    .select('*, school:schools(*), region:regions(*)')
    .eq('auth_id', authId)
    .single()
  return data
}

function buildSession(profile, supabaseSession) {
  return {
    user_id:     profile.id,
    name:        profile.name,
    email:       profile.email,
    role:        profile.role,
    school_id:   profile.school_id,
    region_id:   profile.region_id,
    school:      profile.school  ? { id: profile.school.id,  name: profile.school.name,  district: profile.school.district,  region_id: profile.school.region_id } : null,
    region:      profile.region  ? { id: profile.region.id,  name: profile.region.name,  province: profile.region.province } : null,
    permissions: PERMISSIONS[profile.role] ?? [],
    last_login:  profile.last_login,
    access_token: supabaseSession?.access_token,
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export async function getAllUsers() {
  const { data } = await supabase
    .from('users')
    .select('*, school:schools(id,name,district), region:regions(id,name,province)')
    .order('created_at')
  return data ?? []
}

export async function createUser(data) {
  const { name, email, password, role, school_id, region_id } = data

  // 1. Create auth account
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({ email, password, email_confirm: true })

  if (authError) {
    if (authError.message.includes('already')) return { success: false, error: 'DUPLICATE_EMAIL', message: 'Email sudah terdaftar.' }
    return { success: false, error: authError.message, message: authError.message }
  }

  // 2. Create profile row
  const { data: user, error: profileError } = await supabase.from('users').insert({
    auth_id:   authData.user.id,
    name,
    email,
    role,
    school_id: role === 'teacher'      ? school_id || null : null,
    region_id: role === 'gov_observer' ? region_id || null : null,
    is_active: true,
  }).select().single()

  if (profileError) return { success: false, error: profileError.message, message: profileError.message }
  return { success: true, user }
}

export async function updateUser(userId, data) {
  const update = {}
  if (data.name)     update.name     = data.name.trim()
  if (data.email)    update.email    = data.email.trim()
  if (data.role)     update.role     = data.role
  if (data.role === 'admin')        { update.school_id = null; update.region_id = null }
  if (data.role === 'teacher')      { update.school_id = data.school_id || null; update.region_id = null }
  if (data.role === 'gov_observer') { update.region_id = data.region_id || null; update.school_id = null }
  if (data.school_id !== undefined) update.school_id = data.school_id || null
  if (data.region_id !== undefined) update.region_id = data.region_id || null

  const { data: user, error } = await supabase.from('users').update(update).eq('id', userId).select().single()
  if (error) return { success: false, error: error.message }

  // Update password if provided
  if (data.password?.trim()) {
    await supabase.auth.admin.updateUserById(user.auth_id, { password: data.password.trim() })
  }

  return { success: true, user }
}

export async function toggleUserActive(userId) {
  const { data: user } = await supabase.from('users').select('role,is_active').eq('id', userId).single()
  if (!user) return { success: false, error: 'NOT_FOUND' }
  if (user.role === 'admin') return { success: false, error: 'CANNOT_DEACTIVATE_ADMIN', message: 'Admin tidak dapat dinonaktifkan.' }

  const { error } = await supabase.from('users').update({ is_active: !user.is_active }).eq('id', userId)
  if (error) return { success: false, error: error.message }
  return { success: true, user_id: userId, is_active: !user.is_active }
}
