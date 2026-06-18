import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from './store/authStore'

import { PublicLayout } from './layouts/PublicLayout'
import AuthPage from './pages/AuthPage'
import LandingPage from './pages/LandingPage'
import MentorSearch from './pages/MentorSearch'
import MentorProfile from './pages/MentorProfile'
import StudentDashboard from './pages/StudentDashboard'
import MentorDashboard from './pages/MentorDashboard'
import NotFound from './pages/NotFound'

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/not-found" replace />

  return children
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  
  if (isAuthenticated) {
    if (user.role === 'Student') return <Navigate to="/student/dashboard" replace />
    if (user.role === 'Mentor') return <Navigate to="/mentor/dashboard" replace />
    if (user.role === 'Admin') return <Navigate to="/admin" replace />
  }
  
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages — wrapped with FloatingNav + Footer */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <LandingPage />
            </PublicLayout>
          }
        />
        <Route
          path="/mentors"
          element={
            <PublicLayout>
              <MentorSearch />
            </PublicLayout>
          }
        />
        <Route
          path="/mentors/:id"
          element={
            <PublicLayout>
              <MentorProfile />
            </PublicLayout>
          }
        />

        {/* Auth — full-screen, no shared layout */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        {/* Protected dashboard routes */}
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
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="Admin">
              <Suspense fallback={<main className="min-h-screen bg-background p-8 text-foreground">Loading admin...</main>}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster theme="dark" position="bottom-right" />
    </BrowserRouter>
  )
}
