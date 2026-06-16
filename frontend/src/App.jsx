import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from './store/authStore'

import AuthPage from './pages/AuthPage'
import LandingPage from './pages/LandingPage'
import MentorSearch from './pages/MentorSearch'
import MentorProfile from './pages/MentorProfile'
import StudentDashboard from './pages/StudentDashboard'
import MentorDashboard from './pages/MentorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/" replace />

  return children
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  
  if (isAuthenticated) {
    if (user.role === 'Student') return <Navigate to="/student/dashboard" replace />
    if (user.role === 'Mentor') return <Navigate to="/mentor/dashboard" replace />
    if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />
  }
  
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/mentors" element={<MentorSearch />} />
        <Route path="/mentors/:id" element={<MentorProfile />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRole="Student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/dashboard"
          element={
            <ProtectedRoute allowedRole="Mentor">
              <MentorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster theme="dark" position="bottom-right" />
    </BrowserRouter>
  )
}