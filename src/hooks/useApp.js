import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

/**
 * useApp — convenience hook for global app state.
 * Provides toast helpers, period selector, sidebar toggle.
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
    toast,
  }
}
