import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Container from '../components/Container'

const MOCK_LIBRARY_SEEDS = [
  {
    id: 'script-1',
    title: 'Trung Quốc từ thời cổ đại đến thế kỉ VII',
    subject: 'Lịch sử - Lớp 6',
    bloomLevel: 'Hiểu & Vận dụng',
    duration: '45 phút',
    nodesCount: 3,
    createdAt: '2026-07-06',
    summary: 'Khám phá địa lý, quá trình thống nhất của Tần Thủy Hoàng và văn minh Trung Hoa cổ đại.',
    color: 'from-red-500 to-amber-600',
    favorite: true
  },
  {
    id: 'script-2',
    title: 'La Mã cổ đại',
    subject: 'Lịch sử - Lớp 6',
    bloomLevel: 'Phân tích',
    duration: '45 phút',
    nodesCount: 3,
    createdAt: '2026-07-06',
    summary: 'Tìm hiểu điều kiện tự nhiên, bộ máy nhà nước đế chế và di sản văn hóa La Mã cổ đại.',
    color: 'from-purple-500 to-slate-700',
    favorite: false
  }
]


export default function Dashboard({ isMockup = false, onMockupCreate, onMockupEdit }) {
  const [scripts, setScripts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    const savedRaw = localStorage.getItem('edore_saved_scripts')
    if (savedRaw) {
      try {
        const parsed = JSON.parse(savedRaw)
        // Reset nếu data cũ (seed cũ khác summary)
        const firstSummary = parsed?.[0]?.summary
        if (firstSummary !== MOCK_LIBRARY_SEEDS[0].summary) {
          setScripts(MOCK_LIBRARY_SEEDS)
          localStorage.setItem('edore_saved_scripts', JSON.stringify(MOCK_LIBRARY_SEEDS))
        } else {
          setScripts(parsed)
        }
      } catch (e) {
        setScripts(MOCK_LIBRARY_SEEDS)
      }
    } else {
      setScripts(MOCK_LIBRARY_SEEDS)
      localStorage.setItem('edore_saved_scripts', JSON.stringify(MOCK_LIBRARY_SEEDS))
    }
  }, [])

  const handleToggleFavorite = (id) => {
    const updated = scripts.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s))
    setScripts(updated)
    localStorage.setItem('edore_saved_scripts', JSON.stringify(updated))
  }

  const handleDeleteScript = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa kịch bản giảng dạy này?')) {
      const updated = scripts.filter((s) => s.id !== id)
      setScripts(updated)
      localStorage.setItem('edore_saved_scripts', JSON.stringify(updated))
    }
  }

  const handleEditScript = (script) => {
    localStorage.setItem('edore_active_editing_script', JSON.stringify(script))
    if (isMockup) {
      onMockupEdit?.(script)
    } else {
      navigate('/studio')
    }
  }
  // Filters logic
  const filteredScripts = scripts.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase()))

    if (activeTab === 'favorites') {
      return matchesSearch && item.favorite
    }
    if (activeTab === 'recent') {
      // Sort or filter by recent (for mockup, show items created in last 2 days)
      return matchesSearch
    }
    return matchesSearch
  })

  // Calculate stats
  const totalScripts = scripts.length
  const totalFavorites = scripts.filter((s) => s.favorite).length
  const totalDurationMin = scripts.reduce((acc, curr) => {
    const mins = parseInt(curr.duration) || 0
    return acc + mins
  }, 0)

  return (
    <Container className="flex flex-col gap-6">

      {/* ── Library Workspace Layout ── */}
      <div className="w-full bg-[#faf8ff] min-h-[85vh] rounded-3xl border border-[#c2c6d6]/60 shadow-lg p-6 sm:p-8 flex flex-col gap-5">

        {/* Header Title Area */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#e2e8f0] pb-3">
          <div>
            <h1 className="font-extrabold text-3xl text-[#151b2d] tracking-tight">Thư viện của tôi</h1>
            <p className="text-sm text-[#727785] mt-1">
              Quản lý và chỉnh sửa các kịch bản giảng dạy đã tạo của bạn
            </p>
          </div>

          {isMockup ? (
            <button
              onClick={() => onMockupCreate?.()}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#0058be] hover:bg-[#004799] text-white font-bold rounded-2xl shadow-md transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Tạo kịch bản mới
            </button>
          ) : (
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#0058be] hover:bg-[#004799] text-white font-bold rounded-2xl shadow-md transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Tạo kịch bản mới
            </Link>
          )}
        </div>

        {/* ── Filters & Search Controls ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Tab Switchers */}
          <div className="flex bg-[#f0f2f8] p-1 rounded-2xl w-full sm:w-auto">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'favorites', label: 'Yêu thích' },
              { id: 'recent', label: 'Gần đây' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === tab.id
                  ? 'bg-white text-[#0058be] shadow-sm'
                  : 'text-[#727785] hover:text-[#151b2d]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Inputs */}
          <div className="relative w-full sm:max-w-xs">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-[#727785]">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm kịch bản, môn học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#c2c6d6]/60 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:border-[#0058be] transition-all"
            />
          </div>
        </div>

        {/* ── Main Cards Grid ── */}
        {filteredScripts.length > 0 ? (
          <div className="space-y-3">
            {filteredScripts.map((script) => (
              <div
                key={script.id}
                className="group flex items-center justify-between p-4 bg-white border border-[#c2c6d6]/40 rounded-2xl hover:border-[#0058be]/30 hover:shadow-sm transition-all"
              >
                {/* Left: Info Section */}
                <div className="flex items-center gap-4 overflow-hidden flex-1">
                  <div className="p-3 bg-[#f0f2f8] rounded-xl text-[#0058be] shrink-0">
                    <span className="material-symbols-outlined">description</span>
                  </div>

                  <div className="overflow-hidden flex-1">
                    {/* Title + Category */}
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-bold text-[#151b2d] truncate">{script.title}</h3>
                      <span className="text-xs font-bold text-[#94a3b8] shrink-0 uppercase">
                        {script.subject}
                      </span>
                    </div>

                    {/* Subtitle + Time */}
                    <div className="flex items-center justify-between gap-4 mt-0.5">
                      <p className="text-xs text-[#727785] truncate">
                        {script.summary || 'Không có mô tả chi tiết'}
                      </p>
                      <span className="text-[11px] font-medium text-[#94a3b8] font-mono shrink-0">
                        {script.createdAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Controls (Chỉ còn nút bấm) */}
                <div className="flex items-center gap-1 ml-6 shrink-0">
                  <button
                    onClick={() => handleEditScript(script)}
                    className="p-2 text-[#727785] hover:text-[#0058be] hover:bg-[#0058be]/10 rounded-lg transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteScript(script.id)}
                    className="p-2 text-[#727785] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[#c2c6d6]/60 rounded-3xl bg-[#faf8ff] p-8">
            <span className="material-symbols-outlined text-5xl text-[#727785] mb-3">
              folder_open
            </span>
            <h3 className="font-bold text-lg text-[#151b2d]">Thư viện trống</h3>
            <p className="text-sm text-[#727785] max-w-sm mt-1 mb-6">
              Bạn chưa có kịch bản giảng dạy nào. Hãy khởi chạy AI Playground để kiến tạo kịch bản đầu tiên của bạn!
            </p>
            {isMockup ? (
              <button
                onClick={() => onMockupCreate?.()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0058be] text-white font-bold rounded-xl text-xs hover:bg-[#004799] transition-all"
              >
                Tạo bài học đầu tiên
              </button>
            ) : (
              <Link
                to="/studio"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0058be] text-white font-bold rounded-xl text-xs hover:bg-[#004799] transition-all"
              >
                Tạo bài học đầu tiên
              </Link>
            )}
          </div>
        )}

      </div>
    </Container>
  )
}
