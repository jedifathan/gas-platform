import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { hasPermission } from '../utils/permissions'

/**
 * useAuth — primary hook for auth state and RBAC helpers.
 *
 * Usage:
 *   const { session, isAuthenticated, login, logout, can, isRole } = useAuth()
 *
 *   can('reports:validate')          → true/false
 *   isRole('admin', 'gov_observer')  → true if current role is one of the listed
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')

  /** Check a named permission against the current role */
  function can(permission) {
    return hasPermission(ctx.session?.role, permission)
  }

  /** True if the current user's role is one of the provided values */
  function isRole(...roles) {
    return roles.includes(ctx.session?.role)
  }

  return { ...ctx, can, isRole }
}
