import { useState, useEffect } from 'react'
import { getTemplates } from '../../services/templateService'

/**
 * FilterModal — Stage: 'filters'
 * Responsive / Mobile-First Design
 */
export default function FilterModal({ fileName, onBack, onConfirm }) {
  // Mode: 'context' (auto-match) or 'manual' (direct select)
  const [mode, setMode] = useState('context')

  // --- Context Form Step (Used when mode === 'context') ---
  const [formStep, setFormStep] = useState(1) // 1: Space & Equipment, 2: Organization & Focus

  // --- Form Context States ---
  // Space & Equipment (Step 1)
  const [space, setSpace] = useState('Học trong nhà')
  const [seating, setSeating] = useState('Hàng ngang')
  const [studentEquip, setStudentEquip] = useState(['Laptop'])
  const [hasWifi, setHasWifi] = useState(true)
  const [hasPower, setHasPower] = useState(false)

  // Organization & Focus (Step 2)
  const [duration, setDuration] = useState(90)
  const [studentCount, setStudentCount] = useState(24)
  const [knowledgeClass, setKnowledgeClass] = useState('Đại cương')
  const [bloomObjective, setBloomObjective] = useState('NB - Nhận biết')

  // --- Templates States ---
  const [templates, setTemplates] = useState([])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch templates from DB on mount
  useEffect(() => {
    async function loadTemplates() {
      setLoading(true)
      try {
        const data = await getTemplates()
        setTemplates(data)
        if (data.length > 0) {
          const standard = data.find((t) => t.id === 'standard-3-node')
          setSelectedTemplateId(standard ? standard.id : data[0].id)
        }
      } catch (err) {
        console.error(err)
        setError('Không thể tải danh sách template.')
      } finally {
        setLoading(false)
      }
    }
    loadTemplates()
  }, [])

  const toggleList = (setter) => (item) =>
    setter((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )

  // Helper to match a template programmatically based on context values
  const getAutoMatchedTemplate = () => {
    const currentBloomCode = bloomObjective.split(' - ')[0]

    const matched = templates.find((t) => {
      const sf = t.suitable_for || {}
      const durMin = sf.duration_min ?? 0
      const durMax = sf.duration_max ?? 999
      const bloomLevels = sf.bloom_levels || []
      const countMin = sf.student_count_min ?? 0
      const countMax = sf.student_count_max ?? 999

      return (
        duration >= durMin &&
        duration <= durMax &&
        bloomLevels.includes(currentBloomCode) &&
        studentCount >= countMin &&
        studentCount <= countMax
      )
    })

    return matched || templates.find((t) => t.id === 'standard-3-node') || templates[0]
  }

  const handleConfirm = () => {
    let finalTemplateId = selectedTemplateId

    if (mode === 'context') {
      const matched = getAutoMatchedTemplate()
      if (matched) {
        finalTemplateId = matched.id
      }
    }

    if (!finalTemplateId) {
      alert('Vui lòng chọn một khung bài học (template).')
      return
    }

    onConfirm({
      space,
      seating,
      studentEquip,
      hasWifi,
      hasPower,
      duration,
      studentCount,
      knowledgeClass,
      bloomObjective,
      template_id: finalTemplateId,
    })
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-[#151b2d]/50 backdrop-blur-[1.5px] md:hidden z-40 animate-fade-in" 
        onClick={onBack} 
      />

      {/* Main Bottom Sheet / Modal Card Container */}
      <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto w-full max-w-2xl mx-auto bg-gradient-to-br from-white to-[#f8fafc] border-t md:border border-[#e2e8f0] rounded-t-3xl md:rounded-2xl shadow-2xl md:shadow-xl flex flex-col overflow-hidden animate-slide-up md:animate-fade-slide-up z-50 max-h-[88vh] md:max-h-none">
        
        {/* Bottom Sheet Drag Handle for Mobile */}
        <div className="md:hidden flex justify-center py-2.5 shrink-0 bg-[#f8fafc]">
          <div className="w-12 h-1 bg-[#c2c6d6] rounded-full" />
        </div>

        {/* Header */}

        {/* [SELECT SECTION] */}
        <div className="px-3 sm:px-6 py-3 bg-[#f8fafc] flex gap-2 border-b border-[#c2c6d6]">
        <button
          type="button"
          onClick={() => setMode('context')}
          className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'context'
            ? 'bg-[#0058be] text-white shadow-sm'
            : 'text-[#424754] hover:bg-[#faf8ff]'
            }`}
        >
          <span className="material-symbols-outlined text-[14px] sm:text-[16px] pb-1.5">school</span>
          <span className="hidden sm:inline">NGỮ CẢNH</span>
          <span className="sm:hidden">NGỮ CẢNH</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'manual'
            ? 'bg-[#0058be] text-white shadow-sm'
            : 'text-[#424754] hover:bg-[#faf8ff]'
            }`}
        >
          <span className="material-symbols-outlined text-[14px] sm:text-[16px] pb-1.5">list_alt</span>
          <span className="hidden sm:inline">MẪU CÓ SẴN</span>
          <span className="sm:hidden">MẪU CÓ SẴN</span>
        </button>
      </div>

      {/* [CONTENT SECTION] */}
      <div className="p-4 sm:p-6 overflow-y-auto max-h-[55vh] flex-1 space-y-4 text-xs">
        {mode === 'context' ? (
          <div className="space-y-4">

            {/* Step navigation display */}
            <div className="flex items-center justify-center pb-1">
              <div className="flex gap-1.5">
                <span className={`w-5 sm:w-6 h-1.5 rounded-full transition-all ${formStep === 1 ? 'bg-[#0058be]' : 'bg-[#e2e8f0]'}`} />
                <span className={`w-5 sm:w-6 h-1.5 rounded-full transition-all ${formStep === 2 ? 'bg-[#0058be]' : 'bg-[#e2e8f0]'}`} />
              </div>
            </div>

            {formStep === 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-slide-up">

                {/* Space type - Card layout */}
                <div className="p-3 sm:p-4 bg-white rounded-xl border border-[#e2e8f0] space-y-2 col-span-1 sm:col-span-2 shadow-sm">
                  <p className="font-mono text-[9px] text-[#727785] uppercase tracking-wider">Không gian học</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'Học trong nhà', label: 'Trong nhà', icon: 'room' },
                      { key: 'Lab', label: 'Phòng Lab', icon: 'biotech' },
                      { key: 'Ngoài trời', label: 'Ngoài trời', icon: 'forest' },
                    ].map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setSpace(s.key)}
                        className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${space === s.key
                          ? 'bg-[#0058be]/5 border-[#0058be] text-[#0058be] shadow-sm font-semibold'
                          : 'border-[#e2e8f0] text-[#424754] bg-white hover:border-[#0058be]/40'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{s.icon}</span>
                        <span className="text-[10px] sm:text-[11px] font-medium">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seating Layout - Visual grid */}
                <div className="p-3 sm:p-4 bg-white rounded-xl border border-[#e2e8f0] space-y-2 col-span-1 sm:col-span-2 shadow-sm">
                  <p className="font-mono text-[9px] text-[#727785] uppercase tracking-wider">Bố trí chỗ ngồi</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'Hàng ngang', label: 'Hàng dọc/ngang', icon: 'grid_on' },
                      { key: 'Chữ U', label: 'Kiểu chữ U', icon: 'explore' },
                      { key: 'Nhóm nhỏ', label: 'Theo cụm nhóm', icon: 'group_work' },
                      { key: 'Linh hoạt', label: 'Linh hoạt/Tự do', icon: 'published_with_changes' },
                    ].map((o) => (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => setSeating(o.key)}
                        className={`p-2 sm:p-2.5 rounded-lg border text-center transition-all flex items-center justify-center sm:justify-start gap-2 ${seating === o.key
                          ? 'bg-[#0058be]/5 border-[#0058be] text-[#0058be] font-bold'
                          : 'border-[#e2e8f0] text-[#424754] bg-white hover:border-[#0058be]/40'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[16px] shrink-0">{o.icon}</span>
                        <span className="text-[9px] sm:text-[10px]">{o.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Infrastructure/Connectivity */}
                <div className="p-3 sm:p-4 bg-white rounded-xl border border-[#e2e8f0] space-y-2 shadow-sm">
                  <p className="font-mono text-[9px] text-[#727785] uppercase tracking-wider">Hạ tầng lớp học</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Kết mạng Wifi', value: hasWifi, setter: setHasWifi, icon: 'wifi' },
                      { label: 'Nguồn điện bàn', value: hasPower, setter: setHasPower, icon: 'bolt' },
                    ].map(({ label, value, setter, icon }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setter(!value)}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-xl border font-semibold transition-all ${value
                          ? 'bg-[#eaedff] border-[#0058be] text-[#0058be]'
                          : 'bg-white border-[#e2e8f0] text-[#727785]'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[16px] sm:text-[18px]">{icon}</span>
                        <span className="text-[10px] sm:text-[11px]">{label}</span>
                        <span className="ml-auto text-[8px] sm:text-[9px] bg-white px-2 py-0.5 rounded border border-black/5">{value ? 'Có' : 'Không'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Student Equipment */}
                <div className="p-3 sm:p-4 bg-white rounded-xl border border-[#e2e8f0] space-y-2 shadow-sm">
                  <p className="font-mono text-[9px] text-[#727785] uppercase tracking-wider">Thiết bị học viên</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Laptop', 'Điện thoại', 'Tool Kit', 'Bút & Giấy'].map((item) => {
                      const active = studentEquip.includes(item)
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleList(setStudentEquip)(item)}
                          className={`p-1.5 rounded-lg border font-semibold transition-all text-center flex items-center justify-center gap-1 ${active
                            ? 'bg-[#0058be] text-white border-[#0058be]'
                            : 'border-[#e2e8f0] text-[#424754] bg-white hover:border-[#0058be]/40'
                            }`}
                        >
                          {active && <span className="material-symbols-outlined text-[11px]">check</span>}
                          <span className="text-[9px] sm:text-[10px]">{item}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-slide-up">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Duration */}
                  <div className="p-3 sm:p-4 bg-white rounded-xl border border-[#e2e8f0] space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <label htmlFor="duration-select" className="font-mono text-[9px] text-[#727785] uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        Thời lượng giảng dạy
                      </label>
                    </div>
                    <div className="pt-1">
                      <select
                        id="duration-select"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full p-2.5 border border-[#e2e8f0] rounded-lg text-sm font-bold text-[#0058be] bg-gray-50 hover:bg-gray-100 focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-all cursor-pointer"
                      >
                        <option value={30}>30 phút</option>
                        <option value={45}>45 phút</option>
                        <option value={60}>60 phút</option>
                        <option value={90}>90 phút</option>
                        <option value={120}>120 phút</option>
                        <option value={150}>150 phút</option>
                        <option value={180}>180 phút</option>
                      </select>
                    </div>
                  </div>

                  {/* Student Count Range */}
                  <div className="p-3 sm:p-4 bg-white rounded-xl border border-[#e2e8f0] space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <label htmlFor="student-count-select" className="font-mono text-[9px] text-[#727785] uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">groups</span>
                        Quy mô lớp học
                      </label>
                    </div>
                    <div className="pt-1 relative">
                      <select
                        id="student-count-select"
                        value={studentCount}
                        onChange={(e) => setStudentCount(e.target.value)}
                        // Thêm 'appearance-none' để tắt mũi tên mặc định, giảm padding-right xuống pr-12
                        className="w-full pl-3 pr-12 py-2.5 appearance-none border border-[#e2e8f0] rounded-lg text-sm font-bold text-[#0058be] bg-gray-50 hover:bg-gray-100 focus:outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be] transition-all cursor-pointer truncate"
                      >
                        <option value="1-10">≤ 10</option>
                        <option value="11-30">11 - 30</option>
                        <option value="31-60">31 - 60</option>
                        <option value="60+">≥ 60</option>
                      </select>

                      {/* Bọc cả icon người và mũi tên xuống vào một cụm để dễ căn chỉnh */}
                      <div className="absolute right-2 top-[calc(50%+2px)] -translate-y-1/2 flex items-center text-[#0058be] pointer-events-none">
                        <span className="material-symbols-outlined text-[16px] mr-0.5 text-[#727785]">
                          person
                        </span>
                        <span className="material-symbols-outlined text-[20px]">
                          expand_more
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Knowledge class */}
                <div className="p-3 sm:p-4 bg-white rounded-xl border border-[#e2e8f0] space-y-2 shadow-sm">
                  <p className="font-mono text-[9px] text-[#727785] uppercase tracking-wider">Cấp độ học tập</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Đại cương', 'Chuyên ngành', 'Nâng cao'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setKnowledgeClass(k)}
                        className={`py-1.5 px-1 rounded-lg border font-semibold text-center transition-all ${knowledgeClass === k
                          ? 'bg-[#0058be]/5 border-[#0058be] text-[#0058be]'
                          : 'border-[#e2e8f0] text-[#424754] bg-white hover:border-[#0058be]/40'
                          }`}
                      >
                        <span className="text-[9px] sm:text-[10px]">{k}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bloom objective */}
                <div className="p-3 sm:p-4 bg-white rounded-xl border border-[#e2e8f0] space-y-2 shadow-sm col-span-1 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[9px] text-[#727785] uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">psychology</span>
                      Mục tiêu Bloom cần đạt
                    </p>
                  </div>

                  {/* Đổi thành 4 cột trên màn lớn (sm:grid-cols-4), 2 cột trên điện thoại */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {['NB - Nhận biết', 'TH - Thông hiểu', 'VD - Vận dụng', 'PT - Phân tích'].map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setBloomObjective(o)}
                        // Đồng bộ toàn bộ màu tím sang màu xanh #0058be
                        className={`py-2 px-1 rounded-lg border font-semibold text-center transition-all flex flex-col items-center justify-center ${bloomObjective === o
                          ? 'bg-[#0058be]/10 border-[#0058be] text-[#0058be]'
                          : 'border-[#e2e8f0] text-[#424754] bg-white hover:border-[#0058be]'
                          }`}
                      >
                        <span className="text-[11px] sm:text-[12px] font-bold">{o.split(' - ')[0]}</span>
                        <span className="text-[9px] opacity-75 font-normal mt-0.5">{o.split(' - ')[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        ) : (
          /* Manual Template List */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {loading && (
              <div className="col-span-1 sm:col-span-3 flex flex-col items-center justify-center py-12 text-[#727785] gap-2">
                <span className="animate-spin text-2xl">⏳</span>
                <p className="text-xs">Đang tải templates...</p>
              </div>
            )}

            {error && (
              <div className="col-span-1 sm:col-span-3 p-4 bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] rounded-xl text-xs flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            {!loading && !error && templates.map((template) => {
              const active = selectedTemplateId === template.id

              // Dynamic helper for icon & pros based on template id
              let iconName = 'star'
              let prosText = 'Cân bằng lý thuyết & thực hành'

              if (template.id.includes('2-node') || template.id.includes('compact')) {
                iconName = 'bolt'
                prosText = 'Tiết kiệm thời gian, tập trung thực hành nhanh gọn.'
              } else if (template.id.includes('3-node') || template.id.includes('standard')) {
                iconName = 'auto_awesome'
                prosText = 'Cân bằng hoàn hảo giữa tiếp thu lý thuyết và luyện tập.'
              } else if (template.id.includes('4-node') || template.id.includes('extended')) {
                iconName = 'psychology'
                prosText = 'Học sâu, nhiều hoạt động và có hệ thống tổng kết bài bản.'
              }

              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between select-none relative ${active
                    ? 'border-[#0058be] bg-[#0058be]/5 shadow-sm font-semibold'
                    : 'border-[#e2e8f0] bg-white hover:border-[#0058be]/40 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2 flex-1">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${active ? 'bg-[#0058be] text-white' : 'bg-[#f1f5f9] text-[#727785]'
                      }`}>
                      <span className="material-symbols-outlined text-[20px]">{iconName}</span>
                    </div>

                    {/* Label */}
                    <h5 className="font-bold text-xs sm:text-sm text-[#151b2d] mt-1">
                      {template.name}
                    </h5>

                    {/* Text ưu điểm */}
                    <p className="text-[10px] text-[#727785] mt-1.5 leading-relaxed">
                      <strong className="text-[#0058be] block mb-0.5">Ưu điểm:</strong>
                      {prosText}
                    </p>
                  </div>

                  {/* Active Radio Dot */}
                  <div className="mt-3 flex items-center justify-center">
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${active ? 'border-[#0058be] bg-[#0058be]' : 'border-[#c2c6d6] bg-white'
                      }`}>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* [FLEXIBLE FOOTER SECTION] */}
      <div className="p-3 sm:p-4 border-t border-[#c2c6d6] bg-white flex gap-2 sm:gap-3">
        {mode === 'context' ? (
          // Footer styles for Context Form
          formStep === 1 ? (
            <>
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-2 sm:py-2.5 border border-[#c2c6d6] rounded-xl font-bold text-xs hover:bg-[#faf8ff] transition-all flex items-center justify-center gap-1 text-[#424754]"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => setFormStep(2)}
                className="flex-[2] py-2 sm:py-2.5 bg-[#0058be] text-white rounded-xl font-bold text-xs hover:bg-[#2170e4] transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95"
              >
                Tiếp tục (Bước 2)
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setFormStep(1)}
                className="flex-1 py-2 sm:py-2.5 border border-[#c2c6d6] rounded-xl font-bold text-xs hover:bg-[#faf8ff] transition-all flex items-center justify-center gap-1 text-[#424754]"
              >
                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                Lùi lại
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-[2] py-2 sm:py-2.5 bg-[#0058be] text-white rounded-xl font-bold text-xs hover:bg-[#2170e4] transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95 animate-pulse-slow"
              >
                Khớp &amp; Tạo kịch bản
                <span className="material-symbols-outlined text-[14px]">bolt</span>
              </button>
            </>
          )
        ) : (
          // Footer styles for Manual Selection
          <>
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-2 sm:py-2.5 border border-[#c2c6d6] rounded-xl font-bold text-xs hover:bg-[#faf8ff] transition-all flex items-center justify-center gap-1 text-[#424754]"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-[2] py-2 sm:py-2.5 bg-[#0058be] text-white rounded-xl font-bold text-xs hover:bg-[#2170e4] transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95"
            >
              Áp dụng Template này
              <span className="material-symbols-outlined text-[14px]">check</span>
            </button>
          </>
        )}
      </div>

    </div>
    </>
  )
}
