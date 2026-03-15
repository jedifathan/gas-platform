/**
 * permissions.js
 * Central RBAC model. All permission checks flow through this module.
 * Mirrors the architecture spec exactly — one source of truth for role capabilities.
 */

export const PERMISSIONS = {
  admin: [
    'auth:login', 'auth:logout',
    'schools:read_own', 'schools:read_all', 'schools:write',
    'users:read_own', 'users:read_all', 'users:write',
    'lms:read_courses', 'lms:manage_content',
    'reports:read_own_school', 'reports:read_all', 'reports:validate',
    'monitoring:view_regional', 'monitoring:view_all',
    'leaderboard:view_public', 'leaderboard:view_full',
    'scores:read', 'scores:compute',
    'export:regional', 'export:all',
  ],
  teacher: [
    'auth:login', 'auth:logout',
    'schools:read_own',
    'users:read_own',
    'lms:read_courses', 'lms:enroll', 'lms:submit_quiz',
    'reports:create', 'reports:read_own_school',
    'leaderboard:view_public',
    'scores:read',
  ],
  gov_observer: [
    'auth:login', 'auth:logout',
    'schools:read_own', 'schools:read_all',
    'users:read_own',
    'reports:read_own_school', 'reports:read_all',
    'monitoring:view_regional',
    'leaderboard:view_public', 'leaderboard:view_full',
    'scores:read',
    'export:regional',
  ],
}

/**
 * Check if a role has a specific permission.
 * @param {string} role
 * @param {string} permission
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  return (PERMISSIONS[role] || []).includes(permission)
}

/**
 * Scope guard: enforces that a user can only access resources within their scope.
 * teacher  → own school only
 * gov      → own region only
 * admin    → unrestricted
 */
export function canAccessResource(user, resourceType, resource) {
  if (!user) return false
  if (user.role === 'admin') return true

  if (user.role === 'teacher') {
    if (resourceType === 'school')  return resource?.id === user.school_id
    if (resourceType === 'report')  return resource?.school_id === user.school_id
    if (resourceType === 'score')   return resource?.school_id === user.school_id
    return false
  }

  if (user.role === 'gov_observer') {
    if (resourceType === 'school')  return resource?.region_id === user.region_id
    // Reports are enriched with school_region_id by reportService
    if (resourceType === 'report')  return resource?.school_region_id === user.region_id
    if (resourceType === 'score')   return resource?.region_id === user.region_id
    return false
  }

  return false
}

/**
 * Returns the home dashboard path for a given role.
 */
export function getDashboardPath(role) {
  const map = {
    admin:        '/app/admin/dashboard',
    teacher:      '/app/teacher/dashboard',
    gov_observer: '/app/gov/dashboard',
  }
  return map[role] || '/login'
}
