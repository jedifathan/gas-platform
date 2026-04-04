import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

import PublicLayout from './layouts/PublicLayout'
import AuthShell    from './layouts/AuthShell'
import LoginLayout  from './layouts/LoginLayout'

import PublicHome        from './pages/public/PublicHome'
import PublicSchools     from './pages/public/PublicSchools'
import PublicLeaderboard from './pages/public/PublicLeaderboard'
import AboutProgram      from './pages/public/AboutProgram'

import LoginPage   from './pages/auth/LoginPage'
import SignupPage  from './pages/auth/SignupPage'
import ProfilePage from './pages/auth/ProfilePage'
import NotFound    from './pages/auth/NotFound'

import TeacherDashboard  from './pages/teacher/TeacherDashboard'
import TeacherCourseList from './pages/teacher/TeacherCourseList'
import CourseDetail      from './pages/teacher/CourseDetail'
import LessonPlayer      from './pages/teacher/LessonPlayer'
import QuizPage          from './pages/teacher/QuizPage'
import CertificatePage   from './pages/teacher/CertificatePage'
import TeacherReports    from './pages/teacher/TeacherReports'
import SubmitReport      from './pages/teacher/SubmitReport'
import ReportDetail      from './pages/teacher/ReportDetail'

import AdminDashboard    from './pages/admin/AdminDashboard'
import AdminMonitoring   from './pages/admin/AdminMonitoring'
import AdminReports      from './pages/admin/AdminReports'
import ReportReview      from './pages/admin/ReportReview'
import SchoolManagement  from './pages/admin/SchoolManagement'
import SchoolDetail      from './pages/admin/SchoolDetail'
import UserManagement    from './pages/admin/UserManagement'
import RegionManagement  from './pages/admin/RegionManagement'
import AdminLeaderboard  from './pages/admin/AdminLeaderboard'
import CourseManagement  from './pages/admin/CourseManagement'

import GovDashboard   from './pages/gov/GovDashboard'
import GovMonitoring  from './pages/gov/GovMonitoring'
import GovReports     from './pages/gov/GovReports'
import GovLeaderboard from './pages/gov/GovLeaderboard'

function ProtectedRoute({ children, requiredRole }) {
  const { session, isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requiredRole && session?.role !== requiredRole) return <Navigate to="/app/dashboard" replace />
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
      <Route element={<PublicLayout />}>
        <Route path="/"            element={<PublicHome />} />
        <Route path="/schools"     element={<PublicSchools />} />
        <Route path="/leaderboard" element={<PublicLeaderboard />} />
        <Route path="/about"       element={<AboutProgram />} />
      </Route>

      <Route element={<LoginLayout />}>
        <Route path="/login" element={<LoginPage />} />
	<Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route path="/app" element={<ProtectedRoute><AuthShell /></ProtectedRoute>}>
        <Route index element={<DashboardRedirect />} />
        <Route path="dashboard" element={<DashboardRedirect />} />

        {/* Teacher */}
        <Route path="teacher/dashboard"                      element={<ProtectedRoute requiredRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="teacher/lms"                            element={<ProtectedRoute requiredRole="teacher"><TeacherCourseList /></ProtectedRoute>} />
        <Route path="teacher/lms/:courseId"                  element={<ProtectedRoute requiredRole="teacher"><CourseDetail /></ProtectedRoute>} />
        <Route path="teacher/lms/:courseId/lesson/:lessonId" element={<ProtectedRoute requiredRole="teacher"><LessonPlayer /></ProtectedRoute>} />
        <Route path="teacher/lms/:courseId/quiz"             element={<ProtectedRoute requiredRole="teacher"><QuizPage /></ProtectedRoute>} />
        <Route path="teacher/lms/:courseId/certificate"      element={<ProtectedRoute requiredRole="teacher"><CertificatePage /></ProtectedRoute>} />
        <Route path="teacher/reports"                        element={<ProtectedRoute requiredRole="teacher"><TeacherReports /></ProtectedRoute>} />
        <Route path="teacher/reports/new"                    element={<ProtectedRoute requiredRole="teacher"><SubmitReport /></ProtectedRoute>} />
        <Route path="teacher/reports/:reportId"              element={<ProtectedRoute requiredRole="teacher"><ReportDetail /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="admin/dashboard"         element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/monitoring"        element={<ProtectedRoute requiredRole="admin"><AdminMonitoring /></ProtectedRoute>} />
        <Route path="admin/reports"           element={<ProtectedRoute requiredRole="admin"><AdminReports /></ProtectedRoute>} />
        <Route path="admin/reports/:reportId" element={<ProtectedRoute requiredRole="admin"><ReportReview /></ProtectedRoute>} />
        <Route path="admin/schools"           element={<ProtectedRoute requiredRole="admin"><SchoolManagement /></ProtectedRoute>} />
        <Route path="admin/schools/:schoolId" element={<ProtectedRoute requiredRole="admin"><SchoolDetail /></ProtectedRoute>} />
        <Route path="admin/users"             element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>} />
        <Route path="admin/regions"           element={<ProtectedRoute requiredRole="admin"><RegionManagement /></ProtectedRoute>} />
        <Route path="admin/leaderboard"       element={<ProtectedRoute requiredRole="admin"><AdminLeaderboard /></ProtectedRoute>} />
	<Route path="admin/courses"           element={<ProtectedRoute requiredRole="admin"><CourseManagement /></ProtectedRoute>} />

        {/* Gov */}
        <Route path="gov/dashboard"   element={<ProtectedRoute requiredRole="gov_observer"><GovDashboard /></ProtectedRoute>} />
        <Route path="gov/monitoring"  element={<ProtectedRoute requiredRole="gov_observer"><GovMonitoring /></ProtectedRoute>} />
        <Route path="gov/reports"     element={<ProtectedRoute requiredRole="gov_observer"><GovReports /></ProtectedRoute>} />
        <Route path="gov/leaderboard" element={<ProtectedRoute requiredRole="gov_observer"><GovLeaderboard /></ProtectedRoute>} />

        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
