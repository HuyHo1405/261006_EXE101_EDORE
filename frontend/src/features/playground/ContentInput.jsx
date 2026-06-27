import { useState, useRef } from 'react'

// ─── Feature strip data ────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: 'tune',
    title: 'Cấu hình lớp học',
    desc: 'Thiết lập mục tiêu, đối tượng học sinh và trình độ để AI cá nhân hóa nội dung phù hợp nhất.',
  },
  {
    icon: 'edit_document',
    title: 'Thiết lập bài giảng',
    desc: 'Tải tài liệu và chọn khung bài học, AI sẽ nắm bắt cấu trúc và yêu cầu cốt lõi của bạn.',
  },
  {
    icon: 'psychology',
    title: 'Hệ thống AI xử lý',
    desc: 'Công nghệ phân tích ngữ nghĩa tự động trích xuất kiến thức và soạn thảo kịch bản giảng dạy logic.',
  },
  {
    icon: 'settings_suggest',
    title: 'Tùy ý chỉnh sửa',
    desc: 'Dễ dàng tinh chỉnh, thay đổi hoặc bổ sung chi tiết vào kịch bản trước khi đưa vào giảng dạy.',
  },
]

// ─── Main component ────────────────────────────────────────────────────────────
export default function ContentInput({ onFileSelected, onManualSubmit, classroomCtx, onConfigChange, onOpenConfig }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert('Kích thước file vượt quá giới hạn cho phép (tối đa 50MB).')
        e.target.value = ''
        return
      }
      onFileSelected(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert('Kích thước file vượt quá giới hạn cho phép (tối đa 50MB).')
        return
      }
      onFileSelected(file)
    }
  }

  // Resolve a short summary of current config for badge display
  const configSummary = (() => {
    const parts = []
    if (classroomCtx?.duration) parts.push(`${classroomCtx.duration} phút`)
    if (classroomCtx?.studentCount) parts.push(classroomCtx.studentCount === '<=10' ? '≤10 HV' : classroomCtx.studentCount === '>30' ? '31+ HV' : '11–30 HV')
    if (classroomCtx?.learningSpace) parts.push({ classroom: 'Lớp học', lab: 'Lab', outdoor: 'Ngoài trời', online: 'Online' }[classroomCtx.learningSpace] || '')
    return parts.filter(Boolean)
  })()

  const hasConfig = configSummary.length > 0

  return (
    <div className="space-y-5">

      {/* ── Row 1: Drop zone full width ── */}
      <div className="stage-enter delay-0">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative overflow-hidden group rounded-2xl border-2 border-dashed transition-all duration-300 p-12 flex flex-col items-center justify-center min-h-[280px] cursor-pointer
      ${isDragging
              ? 'border-[#0058be] bg-[#eaedff]/60 scale-[1.005]'
              : 'border-[#c2c6d6] bg-[#f2f3ff] hover:border-[#0058be] hover:bg-[#eaedff]/30'}`}
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#0058be]/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#7c3aed]/5 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Upload icon */}
            <div className={`w-16 h-16 bg-gradient-to-br from-[#2170e4] to-[#0058be] text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#0058be]/25 transition-transform duration-300 ${isDragging ? 'scale-110 rotate-3' : 'group-hover:scale-110'}`}>
              <span className="material-symbols-outlined text-3xl">cloud_upload</span>
            </div>

            <h3 className="font-extrabold text-xl text-[#151b2d] mb-1">
              {isDragging ? 'Thả tệp tại đây!' : 'Tải tài liệu lên'}
            </h3>
            <p className="text-[#424754] text-xs mb-1 leading-relaxed">
              Kéo và thả tệp vào đây, hoặc nhấn để duyệt từ máy tính của bạn
            </p>

            {/* SỬA: Bỏ absolute, dùng flex tĩnh để nằm trong luồng layout */}
            <div className="flex gap-2 mb-8">
              {['PDF', 'Word', 'TXT', 'MD'].map(fmt => (
                <span key={fmt} className="px-2.5 py-0.5 bg-white/80 border border-[#c2c6d6] rounded-full text-[10px] font-bold text-[#424754] shadow-sm">
                  {fmt}
                </span>
              ))}
            </div>

            {/* ── Two action buttons side by side ── */}
            <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-[#0058be] border-2 border-[#0058be] px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-[#0058be]/10 hover:bg-[#eaedff] active:scale-95 transition-all duration-150 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">folder_open</span>
                Chọn tệp tin
              </button>

              <button
                onClick={() => onOpenConfig?.()}
                className={`relative px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-150 active:scale-95
            ${hasConfig
                    ? 'bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white shadow-lg shadow-[#0058be]/30 hover:shadow-[#0058be]/50'
                    : 'bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white shadow-lg shadow-[#ff6b35]/30 hover:shadow-[#ff6b35]/50'
                  }`}
              >
                {!hasConfig && (
                  <span className="absolute inset-0 rounded-xl animate-ping bg-[#ff6b35]/30 pointer-events-none" />
                )}
                <span className="material-symbols-outlined text-[16px]">tune</span>
                Cấu hình lớp học
                {hasConfig && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/25 rounded-full text-[10px] font-bold">✓</span>
                )}
              </button>
            </div>

            <input ref={fileInputRef} accept=".pdf,.doc,.docx,.txt,.md" className="hidden" type="file" onChange={handleFileChange} />
          </div>

          {/* Config summary strip — top-right corner */}
          {hasConfig && (
            <div className="absolute top-4 right-4 flex gap-1.5 flex-wrap justify-end max-w-[200px]">
              {configSummary.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-[#0058be]/10 border border-[#0058be]/20 rounded-full text-[10px] font-bold text-[#0058be]">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: 4 feature cols ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stage-enter delay-80">
        {FEATURES.map(({ icon, title, desc }, i) => (
          <div
            key={i}
            className="group p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-sm hover:border-[#0058be]/40 hover:shadow-md transition-all duration-200 cursor-default"
          >
            <div className="w-8 h-8 rounded-lg bg-[#eaedff] flex items-center justify-center mb-3 group-hover:bg-[#0058be] transition-colors duration-200">
              <span className="material-symbols-outlined text-[18px] text-[#0058be] group-hover:text-white transition-colors duration-200">{icon}</span>
            </div>
            <h4 className="font-bold text-sm text-[#151b2d] mb-1">{title}</h4>
            <p className="text-[11px] text-[#727785] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

    </div>
  )
}
