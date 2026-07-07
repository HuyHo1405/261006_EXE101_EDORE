import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage({ isMockup = false, onMockupNext }) {
  const [isLoginTab, setIsLoginTab] = useState(true)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu.')
      return
    }
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      if (isMockup) {
        onMockupNext?.()
      } else {
        login(email, password)
        navigate('/dashboard')
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ các thông tin.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.')
      return
    }
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      if (isMockup) {
        onMockupNext?.()
      } else {
        register(name, email, password)
        navigate('/dashboard')
      }
    } catch (err) {
      setError('Đăng ký không thành công, vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex justify-center">
      <div className="w-full max-w-md bg-white border border-[#c2c6d6]/40 shadow-xl rounded-3xl p-8 relative overflow-hidden transition-all duration-300">

        {/* Logo on Mobile */}
        <div className="flex md:hidden items-center justify-center gap-2 mb-6">
          <span className="font-black text-2xl tracking-wider bg-gradient-to-r from-[#0058be] to-[#6b38d4] bg-clip-text text-transparent">
            EDORE
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-[#151b2d]">Chào mừng bạn đến với EDORE</h3>
          <p className="text-sm text-[#727785] mt-1">Đăng nhập tài khoản giáo viên để tiếp tục</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#f0f2f8] p-1 rounded-2xl mb-6">
          <button
            onClick={() => { setIsLoginTab(true); setError(''); }}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${isLoginTab
              ? 'bg-white text-[#0058be] shadow-sm'
              : 'text-[#727785] hover:text-[#151b2d]'
              }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => { setIsLoginTab(false); setError(''); }}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${!isLoginTab
              ? 'bg-white text-[#0058be] shadow-sm'
              : 'text-[#727785] hover:text-[#151b2d]'
              }`}
          >
            Đăng ký
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        {/* Form Forms */}
        {isLoginTab ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#424754] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#727785]">
                  mail
                </span>
                <input
                  type="email"
                  placeholder="giao-vien@edore.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#c2c6d6]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#424754] uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#727785]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[#f8fafc] border border-[#c2c6d6]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727785] hover:text-[#151b2d]"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#424754] select-none">
                <input type="checkbox" className="rounded text-[#0058be] focus:ring-0" />
                Ghi nhớ đăng nhập
              </label>
              <a href="#forgot" className="text-[#0058be] font-semibold hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-[#0058be] text-white font-bold rounded-xl hover:bg-[#004799] disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full" />
                  Đang xử lý...
                </>
              ) : (
                'Đăng nhập ngay'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#424754] uppercase tracking-wider mb-1.5">
                Họ và tên
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#727785]">
                  person
                </span>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#c2c6d6]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#424754] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#727785]">
                  mail
                </span>
                <input
                  type="email"
                  placeholder="giao-vien@edore.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#c2c6d6]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#424754] uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#727785]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[#f8fafc] border border-[#c2c6d6]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#424754] uppercase tracking-wider mb-1.5">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#727785]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[#f8fafc] border border-[#c2c6d6]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-[#0058be] text-white font-bold rounded-xl hover:bg-[#004799] disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full" />
                  Đang xử lý...
                </>
              ) : (
                'Tạo tài khoản mới'
              )}
            </button>
          </form>
        )}

        {/* Policy disclaimer */}
        <div className="text-center mt-6 text-[10px] text-[#727785] px-4 leading-normal">
          Bằng việc tiếp tục, bạn đồng ý với{' '}
          <a href="#terms" className="underline hover:text-[#151b2d]">Điều khoản dịch vụ</a> và{' '}
          <a href="#privacy" className="underline hover:text-[#151b2d]">Chính sách bảo mật</a> của EDORE.
        </div>
      </div>
    </div>
  )
}
