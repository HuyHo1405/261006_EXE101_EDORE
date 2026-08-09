/**
 * routers/index.jsx
 *
 * Cấu hình route tập trung — được import bởi App.jsx.
 *
 * Pattern layout:
 *   - Route cha là layout component (MainLayout, BlankLayout, ...)
 *   - Route con là page component, được render qua <Outlet /> của layout cha
 *   - Thêm layout mới → thêm Route cha mới, không sửa App.jsx hay page nào
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from '../context/AuthContext'

import MainLayout from '../layout/MainLayout'
import BlankLayout from '../layout/BlankLayout'

// Pages - Eager loaded
import Playground from '../pages/Playground'
import Dashboard from '../pages/Dashboard'
import LoginPage from '../pages/auth/LoginPage'

// Pages - Lazy loaded
const AddContent = lazy(() => import('../pages/AddContent'))
const FilterLogistics = lazy(() => import('../pages/FilterLogistics'))
const FilterActiveView = lazy(() => import('../pages/FilterActiveView'))
const TeachingScript = lazy(() => import('../pages/TeachingScript'))
const DemoUI = lazy(() => import('../pages/DemoUI'))
const PricingPage = lazy(() => import('../pages/PricingPage'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-64 text-[#727785] font-mono text-xs gap-2">
      <div className="w-5 h-5 rounded-full border-2 border-[#0058be] border-t-transparent animate-spin" />
      Đang tải...
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth()
  if (isLoading) return <PageFallback />
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth()
  if (isLoading) return <PageFallback />
  return !isLoggedIn ? children : <Navigate to="/dashboard" replace />
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* ── Auth Layout (Blank) ── */}
        <Route element={<BlankLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
        </Route>

        {/* ── Main Layout: Header + Footer ── */}
        <Route element={<MainLayout />}>
          {/* Default → dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Core Protected Pages */}
          <Route
            path="/studio"
            element={
              <ProtectedRoute>
                <Playground />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/demo-ui"
            element={
              <ProtectedRoute>
                <DemoUI />
              </ProtectedRoute>
            }
          />

          {/* Public/Sales Pages */}
          <Route path="/pricing" element={<PricingPage />} />

          {/* Legacy / standalone pages */}
          <Route
            path="/add-content"
            element={
              <ProtectedRoute>
                <AddContent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/filter-logistics"
            element={
              <ProtectedRoute>
                <FilterLogistics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/filter-active-view"
            element={
              <ProtectedRoute>
                <FilterActiveView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teaching-script"
            element={
              <ProtectedRoute>
                <TeachingScript />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
