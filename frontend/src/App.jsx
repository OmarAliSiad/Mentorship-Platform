import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from './store/authStore'

import { PublicLayout } from './layouts/PublicLayout'
const AuthPage = lazy(() => import('./pages/AuthPage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const MentorSearch = lazy(() => import('./pages/MentorSearch'))
const MentorProfile = lazy(() => import('./pages/MentorProfile'))
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'))
const MentorDashboard = lazy(() => import('./pages/MentorDashboard'))
const NotFound = lazy(() => import('./pages/NotFound'))

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
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground text-xl">Loading platform module...</div></div>}>
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
              <PublicLayout>
                <StudentDashboard />
              </PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/dashboard"
          element={
            <ProtectedRoute allowedRole="Mentor">
              <PublicLayout>
                <MentorDashboard />
              </PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="Admin">
              <PublicLayout>
                <AdminDashboard />
              </PublicLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster theme="dark" position="bottom-right" />
    </BrowserRouter>
  )
}
