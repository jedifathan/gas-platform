import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import {
  getAdminStats,
  getTeacherStats,
  getGovStats,
} from '../services/dashboardService'

export function useDashboard() {
  const { session }                 = useAuth()
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
        // Pass full session — avoids looking up teacher in users.json
        // (only has the original 6 seed users, new teachers won't be found)
        data = getTeacherStats(session, globalPeriod)
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

  return { stats, loading, error, period: globalPeriod, setPeriod, refresh: fetch }
}
