import { useState, useRef } from 'react'
import ClassroomConfigModal from './ClassroomConfigModal'

export default function ContentInput({ onFileSelected, onManualSubmit, classroomCtx, onConfigChange }) {
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [manualText, setManualText] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const fileInputRef = useRef(null)

  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

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

  const handleManual = () => {
    if (!manualText.trim()) return
    onManualSubmit(manualText.trim())
  }

  const templateName = classroomCtx.template_id === 'extended-4-node' ? 'Extended (4-node)' : 'Standard (3-node)'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-8">
        {/* Left sidebar: info */}
        <div className="col-span-12 lg:col-span-4 stage-enter delay-0">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-[#f1f5f9] border border-[#e2e8f0] h-full flex flex-col justify-between shadow-sm">
            <div className="space-y-5">
              <div>
                <h2 className="font-extrabold text-2xl text-[#0058be] mb-2">
                  Thêm nội dung bài giảng
                </h2>
                <p className="text-[#424754] text-xs leading-relaxed">
                  Biến các tài liệu học tập của bạn thành kịch bản giảng dạy và câu hỏi trắc nghiệm
                  tương tác sinh động chỉ trong vài giây với AI của Deep Logic.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#727785]">
                  Định dạng hỗ trợ
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {['PDF', 'Word', 'TXT', 'MD'].map((fmt) => (
                    <span
                      key={fmt}
                      className="px-3 py-1 bg-[#eaedff] border border-[#c2c6d6] rounded-lg text-xs font-semibold text-[#424754]"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#727785]">Quy trình AI</h3>
                {[
                  { icon: 'description', label: 'Trích xuất nội dung' },
                  { icon: 'auto_fix_high', label: 'Semantic Chunking' },
                  { icon: 'account_tree', label: 'Single-Shot Generation' },
                ].map(({ icon, label }, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#424754]">
                    <div className="w-5 h-5 rounded-full bg-[#eaedff] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[11px] text-[#0058be]">{icon}</span>
                    </div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-[#0058be]/5 border border-[#0058be]/20 flex items-start gap-3">
              <span className="material-symbols-outlined text-[#0058be] text-[18px]">lightbulb</span>
              <div>
                <h4 className="font-bold text-xs text-[#0058be] mb-1">Mẹo nhỏ</h4>
                <p className="text-[10px] text-[#424754] leading-relaxed">
                  Đảm bảo tài liệu có cấu trúc rõ ràng, không bị nhòe chữ để AI trích xuất chính xác nhất.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: upload + manual */}
        <div className="col-span-12 lg:col-span-8 space-y-5 stage-enter delay-80">
          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative overflow-hidden group rounded-2xl border-2 border-dashed transition-all duration-300 p-12 flex flex-col items-center justify-center min-h-[280px] cursor-pointer
              ${isDragging
                ? 'border-[#0058be] bg-[#eaedff]/60 scale-[1.01]'
                : 'border-[#c2c6d6] bg-[#f2f3ff] hover:border-[#0058be] hover:bg-[#eaedff]/30'}`}
          >
            <div className="relative z-10 flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 bg-[#2170e4] text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#0058be]/20 transition-transform duration-300 ${
                  isDragging ? 'scale-110' : 'group-hover:scale-110'
                }`}
              >
                <span className="material-symbols-outlined text-3xl">cloud_upload</span>
              </div>
              <h3 className="font-bold text-lg text-[#151b2d] mb-1">
                {isDragging ? 'Thả tệp tại đây!' : 'Tải tài liệu lên'}
              </h3>
              <p className="text-[#424754] text-xs mb-5">
                Kéo và thả tệp vào đây hoặc nhấn để duyệt từ máy tính của bạn
              </p>
              <button className="bg-[#0058be] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#2170e4] transition-all text-sm active:scale-95">
                Chọn tệp tin
              </button>
              <input
                ref={fileInputRef}
                accept=".pdf,.doc,.docx,.txt,.md"
                className="hidden"
                type="file"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Manual text entry */}
          <div className="bg-gradient-to-br from-white to-[#f1f5f9] border border-[#e2e8f0] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#424754]">edit_note</span>
                <h3 className="font-bold text-[#151b2d] text-sm">Nhập văn bản thủ công</h3>
              </div>
              <button
                onClick={() => setIsManualOpen(!isManualOpen)}
                className="text-[#0058be] text-xs font-semibold flex items-center gap-1 hover:underline"
              >
                {isManualOpen ? 'Đóng' : 'Mở trình soạn thảo'}
                <span className="material-symbols-outlined text-sm">
                  {isManualOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>

            {isManualOpen && (
              <div className="space-y-4 animate-fade-slide-up">
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="w-full h-36 bg-white border border-[#c2c6d6] rounded-xl p-4 text-xs outline-none focus:ring-1 focus:ring-[#0058be] resize-none font-mono"
                  placeholder="Dán nội dung bài giảng tại đây..."
                />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#727785] font-mono">{manualText.length} ký tự</span>
                  <button
                    onClick={handleManual}
                    disabled={!manualText.trim()}
                    className="px-5 py-2.5 bg-[#0058be] text-white font-bold rounded-xl shadow-sm hover:bg-[#2170e4] text-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp tục xử lý →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isConfigOpen && (
        <ClassroomConfigModal
          ctx={classroomCtx}
          onChange={onConfigChange}
          onClose={() => setIsConfigOpen(false)}
        />
      )}
    </div>
  )
}
