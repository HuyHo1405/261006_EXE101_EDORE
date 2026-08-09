import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import Container from './Container'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (isMobileMenuOpen) return

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isMobileMenuOpen])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
    navigate('/login')
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full border-b border-[#c2c6d6]/50 bg-[#faf8ff]/95 backdrop-blur-md transition-all duration-300 transform ${isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
    >
      <Container className="h-16 flex items-center justify-between">

        {/* Brand/Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-black text-xl tracking-wider bg-gradient-to-r from-[#0058be] via-[#2170e4] to-[#8455ef] bg-clip-text text-transparent block">
            EDORE
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3">
          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              `text-sm font-semibold transition-colors duration-200 ${isActive ? 'text-[#0058be]' : 'text-[#727785] hover:text-[#151b2d]'
              }`
            }
          >
            Bảng giá
          </NavLink>

          <span className="w-[1px] h-5 bg-[#c2c6d6]/50"></span>

          {isLoggedIn && (
            <>
              {/* Cụm công cụ dạng "Viên thuốc" (Pill Shape) */}
              <div className="flex items-center p-1 bg-[#f0f2f8] border border-[#c2c6d6]/40 rounded-full shadow-inner">
                {/* Nút Thư viện */}
                <NavLink
                  to="/dashboard"
                  title="Thư viện của tôi"
                  className={({ isActive }) =>
                    `h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 ${isActive
                      ? 'bg-white text-[#0058be] shadow-sm'
                      : 'text-[#727785] hover:text-[#151b2d] hover:bg-[#e4e7f0]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[18px]">folder_open</span>
                </NavLink>

                {/* Nút Tạo kịch bản */}
                <Link
                  to="/studio"
                  title="Tạo kịch bản mới"
                  className="h-8 w-8 ml-1 rounded-full bg-[#0058be] text-white flex items-center justify-center hover:bg-[#004799] hover:shadow-md transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[20px] font-medium">add</span>
                </Link>
              </div>
            </>
          )}

          {/* User Account / Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0058be] to-[#8455ef] flex items-center justify-center text-white font-bold text-sm shadow-sm hover:shadow-md hover:scale-105 transition-all"
                  title={`Tài khoản: ${user?.name}`}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[#c2c6d6]/40 shadow-xl rounded-2xl p-2 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-[#f0f2f8] mb-1">
                      <p className="text-sm font-bold text-[#151b2d] truncate">{user?.name}</p>
                      <p className="text-xs text-[#727785] truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-[#424754] hover:bg-[#f0f2f8] hover:text-[#0058be] rounded-xl flex items-center gap-2 transition-all"
                    >
                      <span className="material-symbols-outlined text-base">folder_open</span>
                      Thư viện của tôi
                    </Link>
                    <Link
                      to="/studio"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-[#424754] hover:bg-[#f0f2f8] hover:text-[#0058be] rounded-xl flex items-center gap-2 transition-all"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      Tạo kịch bản mới
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-all mt-1"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-[#0058be] rounded-full hover:bg-[#004799] transition-all"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-[#424754] hover:bg-[#c2c6d6]/20 hover:text-[#151b2d] focus:outline-none"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-2xl">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </Container>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#c2c6d6]/40 bg-[#faf8ff] px-6 py-5 space-y-3 shadow-xl">
          <Link
            to="/pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-[#424754] hover:bg-[#c2c6d6]/20 hover:text-[#151b2d]"
          >
            <span className="material-symbols-outlined text-xl">payments</span>
            Bảng giá dịch vụ
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/studio"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl bg-[#0058be] text-white text-base font-bold active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[22px] font-medium">add</span>
                Tạo kịch bản mới
              </Link>

              <NavLink
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${isActive
                    ? 'bg-[#0058be]/10 text-[#0058be]'
                    : 'text-[#424754] hover:bg-[#c2c6d6]/20 hover:text-[#151b2d]'
                  }`
                }
              >
                <span className="material-symbols-outlined text-xl">folder_open</span>
                Thư viện của tôi
              </NavLink>

              <div className="pt-4 mt-2 border-t border-[#c2c6d6]/30 flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0058be] to-[#8455ef] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#151b2d] truncate max-w-[120px]">
                      {user?.name}
                    </span>
                    <span className="text-xs text-[#727785]">Personal Account</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[#727785] hover:text-[#e11d48] transition-colors"
                  title="Đăng xuất"
                >
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#0058be] text-white text-base font-bold active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              Đăng nhập / Đăng ký
            </Link>
          )}
        </div>
      )}
    </header>
  )
}