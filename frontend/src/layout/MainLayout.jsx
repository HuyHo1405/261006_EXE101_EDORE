import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

/**
 * MainLayout.jsx
 *
 * Layout chuẩn của app:  Header → <Outlet> → Footer
 *
 * CSS variables được khai báo tại đây để các Container con tự đọc:
 *   --layout-px   → padding ngang của mọi Container trong layout này
 *   --layout-max  → max-width của mọi Container trong layout này
 *
 * Pages được render thông qua <Outlet /> (react-router-dom).
 * Pages KHÔNG cần tự import Header/Footer nữa.
 */
export default function MainLayout() {
  return (
    <div
      className="min-h-screen flex flex-col bg-[#faf8ff] text-[#151b2d] font-sans antialiased"
      style={{
        '--layout-px': '1.5rem',   /* 24px — tương đương px-6 */
        '--layout-max': '80rem',   /* 1280px — tương đương max-w-7xl */
      }}
    >
      {/* Thanh đầu trang — fixed, tự xử lý max-width nội bộ */}
      <Header />

      {/* Nội dung trang — đẩy footer xuống đáy nhờ flex-1 */}
      {/* pt-20 bù cho Header fixed cao 64px (h-16) */}
      <main className="flex-1 pt-20 pb-10 flex flex-col bg-[#0058be]">
        <Outlet />
      </main>

      {/* Chân trang */}
      <Footer />
    </div>
  )
}
