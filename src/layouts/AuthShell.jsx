import { Outlet }    from 'react-router-dom'
import { useAuth }   from '../hooks/useAuth'
import { useApp }    from '../hooks/useApp'
import { useIsMobile } from '../hooks/useBreakpoint'
import Sidebar  from '../components/navigation/Sidebar'
import TopBar   from '../components/navigation/TopBar'
import Toast    from '../components/ui/Toast'

/**
 * AuthShell — authenticated layout wrapper.
 * - Desktop: persistent sidebar with ml-64 offset.
 * - Mobile (<768px): sidebar renders as a fixed drawer above an overlay.
 *   Tapping the overlay closes the sidebar.
 */
export default function AuthShell() {
  const { isLoading }                          = useAuth()
  const { sidebarOpen, toggleSidebar, toasts, removeToast } = useApp()
  const isMobile                               = useIsMobile()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-alabaster">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center
                          text-white font-bold text-lg animate-pulse">G</div>
          <p className="text-sm text-gray-500">Memuat...</p>
        </div>
      </div>
    )
  }

  // On mobile, content is always full-width regardless of sidebar state.
  // The sidebar slides over content (drawer pattern) rather than pushing it.
  const mainOffset = !isMobile && sidebarOpen ? 'ml-64' : 'ml-0'

  return (
    <div className="min-h-screen flex bg-alabaster">
      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Mobile overlay — closes sidebar on tap ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      {/* ── Main area ── */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${mainOffset}`}>
        <TopBar />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Global toast stack ── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </div>
    </div>
  )
}
