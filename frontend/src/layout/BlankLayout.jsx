import { Outlet } from 'react-router-dom'

/**
 * BlankLayout.jsx
 *
 * A clean layout without Header or Footer,
 * suitable for authenticating/login screens, full-screen loaders, or onboarding.
 */
export default function BlankLayout() {
  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col font-sans antialiased text-[#151b2d]">
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
