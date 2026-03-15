import { Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useApp }  from '../hooks/useApp'
import Sidebar     from '../components/navigation/Sidebar'
import TopBar      from '../components/navigation/TopBar'
import Toast       from '../components/ui/Toast'

/**
 * AuthShell — authenticated layout wrapper.
 * Renders the role-aware Sidebar, TopBar, and the page content (Outlet).
 * Also renders the global Toast stack.
 */
export default function AuthShell() {
  const { isLoading }       = useAuth()
  const { sidebarOpen, toasts, removeToast } = useApp()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center
                          text-white font-bold text-lg animate-pulse">G</div>
          <p className="text-sm text-gray-500">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main area ── */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <TopBar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Global toast stack ── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <Toast
            key={t.id}
            toast={t}
            onDismiss={() => removeToast(t.id)}
          />
        ))}
      </div>
    </div>
  )
}
