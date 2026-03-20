import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import AuthShell    from './layouts/AuthShell'
import LoginLayout  from './layouts/LoginLayout'

// Public pages
import PublicHome        from './pages/public/PublicHome'
import PublicSchools     from './pages/public/PublicSchools'
import PublicLeaderboard from './pages/public/PublicLeaderboard'
import AboutProgram      from './pages/public/AboutProgram'

// Auth pages
import LoginPage  from './pages/auth/LoginPage'
import ProfilePage from './pages/auth/ProfilePage'
import NotFound   from './pages/auth/NotFound'

// Teacher pages
import TeacherDashboard  from './pages/teacher/TeacherDashboard'
import TeacherCourseList from './pages/teacher/TeacherCourseList'
import CourseDetail      from './pages/teacher/CourseDetail'
import LessonPlayer      from './pages/teacher/LessonPlayer'
import QuizPage          from './pages/teacher/QuizPage'
import CertificatePage   from './pages/teacher/CertificatePage'
import TeacherReports    from './pages/teacher/TeacherReports'
import SubmitReport      from './pages/teacher/SubmitReport'
import ReportDetail      from './pages/teacher/ReportDetail'

// Admin pages
import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminMonitoring  from './pages/admin/AdminMonitoring'
import AdminReports     from './pages/admin/AdminReports'
import ReportReview     from './pages/admin/ReportReview'
import SchoolManagement from './pages/admin/SchoolManagement'
import SchoolDetail     from './pages/admin/SchoolDetail'
import UserManagement   from './pages/admin/UserManagement'
import AdminLeaderboard from './pages/admin/AdminLeaderboard'

// Gov pages
import GovDashboard   from './pages/gov/GovDashboard'
import GovMonitoring  from './pages/gov/GovMonitoring'
import GovReports     from './pages/gov/GovReports'
import GovLeaderboard from './pages/gov/GovLeaderboard'

// Route guard
function ProtectedRoute({ children, requiredRole }) {
  const { session, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requiredRole && session?.role !== requiredRole) {
    return <Navigate to="/app/dashboard" replace />
  }
  return children
}

function DashboardRedirect() {
  const { session } = useAuth()
  if (session?.role === 'admin')        return <Navigate to="/app/admin/dashboard" replace />
  if (session?.role === 'teacher')      return <Navigate to="/app/teacher/dashboard" replace />
  if (session?.role === 'gov_observer') return <Navigate to="/app/gov/dashboard" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route element={<PublicLayout />}>
        <Route path="/"           element={<PublicHome />} />
        <Route path="/schools"    element={<PublicSchools />} />
        <Route path="/leaderboard" element={<PublicLeaderboard />} />
        <Route path="/about"      element={<AboutProgram />} />
      </Route>

      {/* ── Login ── */}
      <Route element={<LoginLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* ── Protected app shell ── */}
      <Route path="/app" element={<ProtectedRoute><AuthShell /></ProtectedRoute>}>
        <Route index element={<DashboardRedirect />} />
        <Route path="dashboard" element={<DashboardRedirect />} />

        {/* Teacher routes */}
        <Route path="teacher/dashboard" element={<ProtectedRoute requiredRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="teacher/lms"       element={<ProtectedRoute requiredRole="teacher"><TeacherCourseList /></ProtectedRoute>} />
        <Route path="teacher/lms/:courseId"                      element={<ProtectedRoute requiredRole="teacher"><CourseDetail /></ProtectedRoute>} />
        <Route path="teacher/lms/:courseId/lesson/:lessonId"     element={<ProtectedRoute requiredRole="teacher"><LessonPlayer /></ProtectedRoute>} />
        <Route path="teacher/lms/:courseId/quiz"                 element={<ProtectedRoute requiredRole="teacher"><QuizPage /></ProtectedRoute>} />
        <Route path="teacher/lms/:courseId/certificate"          element={<ProtectedRoute requiredRole="teacher"><CertificatePage /></ProtectedRoute>} />
        <Route path="teacher/reports"     element={<ProtectedRoute requiredRole="teacher"><TeacherReports /></ProtectedRoute>} />
        <Route path="teacher/reports/new" element={<ProtectedRoute requiredRole="teacher"><SubmitReport /></ProtectedRoute>} />
        <Route path="teacher/reports/:reportId" element={<ProtectedRoute requiredRole="teacher"><ReportDetail /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="admin/dashboard"           element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/monitoring"          element={<ProtectedRoute requiredRole="admin"><AdminMonitoring /></ProtectedRoute>} />
        <Route path="admin/reports"             element={<ProtectedRoute requiredRole="admin"><AdminReports /></ProtectedRoute>} />
        <Route path="admin/reports/:reportId"   element={<ProtectedRoute requiredRole="admin"><ReportReview /></ProtectedRoute>} />
        <Route path="admin/schools"             element={<ProtectedRoute requiredRole="admin"><SchoolManagement /></ProtectedRoute>} />
        <Route path="admin/schools/:schoolId"   element={<ProtectedRoute requiredRole="admin"><SchoolDetail /></ProtectedRoute>} />
        <Route path="admin/users"               element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>} />
        <Route path="admin/leaderboard"         element={<ProtectedRoute requiredRole="admin"><AdminLeaderboard /></ProtectedRoute>} />

        {/* Gov Observer routes */}
        <Route path="gov/dashboard"   element={<ProtectedRoute requiredRole="gov_observer"><GovDashboard /></ProtectedRoute>} />
        <Route path="gov/monitoring"  element={<ProtectedRoute requiredRole="gov_observer"><GovMonitoring /></ProtectedRoute>} />
        <Route path="gov/reports"     element={<ProtectedRoute requiredRole="gov_observer"><GovReports /></ProtectedRoute>} />
        <Route path="gov/leaderboard" element={<ProtectedRoute requiredRole="gov_observer"><GovLeaderboard /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
