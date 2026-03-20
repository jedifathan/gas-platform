import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

/**
 * useApp — convenience hook for global app state.
 * Provides toast helpers, period selector, sidebar toggle.
 *
 * BUG FIX: AppContext stores the period under the key `globalPeriod`.
 * Several pages destructure `period` from this hook (per the JSDoc contract).
 * The missing alias caused `period` to be `undefined` in AdminLeaderboard,
 * GovReports, TeacherReports and anywhere else using `const { period } = useApp()`.
 * This triggered a crash in computeLeaderboard → computeConsistencyBonus →
 * getRecentPeriods → undefined.split('-').
 *
 * Fix: explicitly alias `period: ctx.globalPeriod` in the return value.
 *
 * Usage:
 *   const { toast, period, setPeriod } = useApp()
 *   toast.success('Laporan berhasil dikirim')
 *   toast.error('Terjadi kesalahan')
 */
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')

  const toast = {
    success: (msg) => ctx.addToast(msg, 'success'),
    error:   (msg) => ctx.addToast(msg, 'error'),
    info:    (msg) => ctx.addToast(msg, 'info'),
    warning: (msg) => ctx.addToast(msg, 'warning'),
  }

  return {
    ...ctx,
    // Expose `period` as a named alias for `globalPeriod` so all consuming
    // components can safely destructure `{ period }` from this hook.
    period: ctx.globalPeriod,
    toast,
  }
}
