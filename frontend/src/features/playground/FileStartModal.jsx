import { useState, useEffect } from 'react'

const templateOptions = [
  {
    value: 'standard-3-node',
    label: 'Khung 3 phần',
    description: 'Tập trung vào kiến thức trọng tâm',
    tags: ['Phổ biến', '45-90 phút'],
    icon: 'school' // Gợi ý icon
  },
  {
    value: 'extended-4-node',
    label: 'Khung 4 phần',
    description: 'Kết hợp thực hành và ứng dụng',
    tags: ['Chuyên sâu', '90 phút+'],
    icon: 'psychology_alt' // Gợi ý icon
  },
]

export default function FileStartModal({ fileName, ctx, onConfirm, onCancel }) {
  const [templateId, setTemplateId] = useState(ctx.template_id || 'standard-3-node')
  const [learningOutcome, setLearningOutcome] = useState(ctx.learning_outcome || '')

  // Khóa cuộn trang (body) khi modal mở
  useEffect(() => {
    // Lưu lại giá trị overflow cũ để trả lại khi đóng modal
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  const handleConfirm = () => {
    let updatedDuration = ctx.duration || 45;
    if (templateId === 'extended-4-node' && (updatedDuration === 45 || updatedDuration === '45')) {
      updatedDuration = 90;
    } else if (templateId === 'standard-3-node' && (updatedDuration === 90 || updatedDuration === '90')) {
      updatedDuration = 45;
    }
    onConfirm({ 
      ...ctx, 
      template_id: templateId, 
      learning_outcome: learningOutcome,
      duration: updatedDuration
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Đã bỏ max-h-[90vh] để modal tự fit nội dung */}
      <div className="bg-white rounded-2xl w-full max-w-lg border border-[#e2e8f0] shadow-2xl flex flex-col overflow-hidden animate-scale-up">

        {/* Header */}
        <div className="p-6 border-b border-[#e2e8f0]">
          <h2 className="font-extrabold text-lg text-[#151b2d]">Thiết lập bài giảng</h2>
          <p className="text-xs text-[#727785] mt-0.5">Chọn template và mục tiêu để AI tạo kịch bản phù hợp nhất</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Template selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#727785]">Khung bài học</label>
            <div className="grid grid-cols-2 gap-3">
              {templateOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTemplateId(opt.value)}
                  className={`relative w-full p-5 rounded-xl border transition-all flex flex-col items-center text-center gap-3 h-full
          ${templateId === opt.value
                      ? 'border-[#0058be] bg-[#0058be]/5 shadow-sm'
                      : 'border-[#e2e8f0] hover:border-[#c2c6d6]'}`}
                >
                  {/* Checkmark */}
                  <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
          ${templateId === opt.value ? 'border-[#0058be] bg-[#0058be]' : 'border-[#c2c6d6]'}`}
                  >
                    {templateId === opt.value && (
                      <span className="material-symbols-outlined text-white text-[10px] font-bold">check</span>
                    )}
                  </div>

                  {/* Icon */}
                  <div className={`p-3 rounded-full ${templateId === opt.value ? 'bg-[#0058be]/10 text-[#0058be]' : 'bg-gray-100 text-gray-500'}`}>
                    <span className="material-symbols-outlined text-2xl">{opt.icon || 'article'}</span>
                  </div>

                  {/* Title (Đóng vai trò là nhãn chính) */}
                  <p className={`text-sm font-bold ${templateId === opt.value ? 'text-[#0058be]' : 'text-[#151b2d]'}`}>
                    {opt.label}
                  </p>

                  {/* Tags (Giữ nguyên để tạo sự sinh động) */}
                  <div className="flex flex-wrap gap-1 justify-center mt-auto">
                    {opt.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-[#f1f5f9] text-[#424754] px-2 py-0.5 rounded-full font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Learning outcome */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#727785]">
              Mục tiêu bài học
              <span className="ml-1.5 text-[#c2c6d6] font-normal normal-case">(Không bắt buộc)</span>
            </label>
            <div className="relative">
              <textarea
                value={learningOutcome}
                onChange={(e) => setLearningOutcome(e.target.value)}
                placeholder="Sau buổi học, học sinh có thể..."
                className="w-full h-24 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-[#0058be] focus:border-[#0058be] focus:bg-white resize-none text-[#424754] leading-relaxed transition-all"
              />
            </div>
            <p className="text-[10px] text-[#727785] leading-relaxed">
              Mô tả mục tiêu giúp AI định hướng hoạt động sư phạm sát với chương trình dạy của bạn hơn.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#e2e8f0] bg-[#f8fafc] flex justify-between items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-[#e2e8f0] rounded-xl text-xs font-semibold hover:bg-white text-[#424754] transition-all active:scale-95"
          >
            ← Chọn file khác
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0058be] text-white rounded-xl text-xs font-bold hover:bg-[#2170e4] transition-all shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Bắt đầu tạo kịch bản
          </button>
        </div>
      </div>
    </div>
  )
}