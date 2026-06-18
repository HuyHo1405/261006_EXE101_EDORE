import { useState, useEffect } from 'react'

const templateOptions = [
  {
    value: 'standard-3-node',
    label: 'Khung 3 phần chuẩn',
    description: 'Khởi động → Hình thành kiến thức → Luyện tập',
    tags: ['Phổ biến', '45–90 phút'],
  },
  {
    value: 'extended-4-node',
    label: 'Khung 4 phần mở rộng',
    description: 'Khởi động → Hình thành kiến thức → Luyện tập → Vận dụng',
    tags: ['Chuyên sâu', '90 phút+'],
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
    onConfirm({ ...ctx, template_id: templateId, learning_outcome: learningOutcome })
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
        {/* Đã bỏ overflow-y-auto để nội dung không bị cuộn */}
        <div className="p-6 space-y-6 flex-1">
          {/* Template selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#727785]">Khung bài học</label>
            <div className="grid grid-cols-2 gap-3">
              {templateOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTemplateId(opt.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col h-full
                    ${templateId === opt.value
                      ? 'border-[#0058be] bg-[#0058be]/5 shadow-sm'
                      : 'border-[#e2e8f0] hover:border-[#c2c6d6]'}`}
                >
                  <div className="flex items-start justify-between gap-2 w-full mb-2">
                    <p className={`text-sm font-bold ${templateId === opt.value ? 'text-[#0058be]' : 'text-[#151b2d]'}`}>
                      {opt.label}
                    </p>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                      ${templateId === opt.value ? 'border-[#0058be] bg-[#0058be]' : 'border-[#c2c6d6]'}`}
                    >
                      {templateId === opt.value && (
                        <span className="material-symbols-outlined text-white text-[10px] font-bold">check</span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#727785] mb-3 flex-1 leading-relaxed">{opt.description}</p>

                  <div className="flex flex-wrap gap-1 mt-auto">
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