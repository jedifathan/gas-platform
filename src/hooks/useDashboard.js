import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import {
  getAdminStats,
  getTeacherStats,
  getGovStats,
} from '../services/dashboardService'

/**
 * useDashboard — fetches the correct stats object for the current role.
 * Automatically re-fetches when period changes.
 *
 * Usage:
 *   const { stats, loading, period, setPeriod } = useDashboard()
 */
export function useDashboard() {
  const { session }              = useAuth()
  const { globalPeriod, setPeriod } = useContext(AppContext)

  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetch = useCallback(() => {
    if (!session) return
    setLoading(true)
    setError(null)

    try {
      let data = null
      if (session.role === 'admin') {
        data = getAdminStats(globalPeriod)
      } else if (session.role === 'teacher') {
        data = getTeacherStats(session.user_id, globalPeriod)
      } else if (session.role === 'gov_observer') {
        data = getGovStats(session.region_id, globalPeriod)
      }
      setStats(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [session, globalPeriod])

  useEffect(() => { fetch() }, [fetch])

  return {
    stats,
    loading,
    error,
    period:    globalPeriod,
    setPeriod,
    refresh:   fetch,
  }
}
