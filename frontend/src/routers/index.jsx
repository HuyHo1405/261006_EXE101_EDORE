/**
 * routers/index.jsx
 * Centralised route configuration — imported by App.jsx.
 * Add all new pages here; keep App.jsx clean.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import Playground from '../pages/Playground'
import Dashboard from '../pages/Dashboard'

// Lazy-load less critical pages to keep the initial bundle small
import { lazy, Suspense } from 'react'

const AddContent = lazy(() => import('../pages/AddContent'))
const FilterLogistics = lazy(() => import('../pages/FilterLogistics'))
const FilterActiveView = lazy(() => import('../pages/FilterActiveView'))
const TeachingScript = lazy(() => import('../pages/TeachingScript'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-64 text-[#727785] font-mono text-xs gap-2">
      <div className="w-5 h-5 rounded-full border-2 border-[#0058be] border-t-transparent animate-spin" />
      Đang tải...
    </div>
  )
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Default → playground */}
        <Route path="/" element={<Navigate to="/playground" replace />} />

        {/* Core interactive page */}
        <Route path="/playground" element={<Playground />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Legacy / standalone pages (kept for reference) */}
        <Route path="/add-content" element={<AddContent />} />
        <Route path="/filter-logistics" element={<FilterLogistics />} />
        <Route path="/filter-active-view" element={<FilterActiveView />} />
        <Route path="/teaching-script" element={<TeachingScript />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/playground" replace />} />
      </Routes>
    </Suspense>
  )
}
