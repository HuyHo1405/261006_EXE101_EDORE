'use client'

import { useState, useEffect } from 'react'
import { School, BrainCircuit, Check, Sparkles, ArrowLeft } from 'lucide-react'
import type { ClassroomCtx } from './ClassroomConfigModal'

const templateOptions = [
  {
    value: 'standard-3-node',
    label: 'Khung 3 phần',
    description: 'Tập trung vào kiến thức trọng tâm',
    tags: ['Phổ biến', '45-90 phút'],
    Icon: School,
  },
  {
    value: 'extended-4-node',
    label: 'Khung 4 phần',
    description: 'Kết hợp thực hành và ứng dụng',
    tags: ['Chuyên sâu', '90 phút+'],
    Icon: BrainCircuit,
  },
]

interface FileStartModalProps {
  fileName: string
  ctx: ClassroomCtx
  onConfirm: (ctx: ClassroomCtx) => void
  onCancel: () => void
}

export default function FileStartModal({ fileName, ctx, onConfirm, onCancel }: FileStartModalProps) {
  const [templateId, setTemplateId] = useState(ctx.template_id || 'standard-3-node')
  const [learningOutcome, setLearningOutcome] = useState(ctx.learning_outcome || '')

  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = orig }
  }, [])

  const handleConfirm = () => {
    let dur = ctx.duration || 45
    if (templateId === 'extended-4-node' && (dur === 45 || dur === '45')) dur = 90
    else if (templateId === 'standard-3-node' && (dur === 90 || dur === '90')) dur = 45
    onConfirm({ ...ctx, template_id: templateId, learning_outcome: learningOutcome, duration: dur })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[var(--radius-xl)] w-full max-w-lg border border-[var(--color-neutral-200)] shadow-2xl flex flex-col overflow-hidden animate-scale-up">

        {/* Header */}
        <div className="p-6 border-b border-[var(--color-neutral-200)]">
          <h2 className="font-header text-lg font-extrabold uppercase tracking-tight text-[var(--color-neutral-900)]">Thiết lập bài giảng</h2>
          <p className="font-body text-xs text-[var(--color-neutral-500)] mt-0.5">
            Chọn template và mục tiêu để AI tạo kịch bản phù hợp nhất
          </p>
          {fileName && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--color-primary-600)] bg-[var(--color-primary-50)] px-2.5 py-1 rounded-[var(--radius-full)] w-fit font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-500)]" />
              {fileName}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Template */}
          <div className="space-y-2.5">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-neutral-500)]">
              Khung bài học
            </label>
            <div className="grid grid-cols-2 gap-3">
              {templateOptions.map((opt) => {
                const Icon = opt.Icon
                const isSelected = templateId === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTemplateId(opt.value)}
                    className={`relative w-full p-5 rounded-[var(--radius-lg)] border transition-all flex flex-col items-center text-center gap-3 h-full
                      ${isSelected
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] shadow-sm'
                        : 'border-[var(--color-neutral-200)] hover:border-[var(--color-neutral-300)]'
                      }`}
                  >
                    <div className={`absolute top-3 right-3 w-5 h-5 rounded-[var(--radius-full)] border-2 flex items-center justify-center shrink-0 transition-all
                        ${isSelected ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]' : 'border-[var(--color-neutral-300)]'}`}>
                      {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>

                    <div className={`p-3 rounded-[var(--radius-full)] ${isSelected ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-500)]' : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]'}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <p className={`font-body text-sm font-bold ${isSelected ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-neutral-900)]'}`}>
                      {opt.label}
                    </p>

                    <div className="flex flex-wrap gap-1 justify-center mt-auto">
                      {opt.tags.map((tag) => (
                        <span key={tag} className="font-mono text-[10px] bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)] px-2 py-0.5 rounded-[var(--radius-full)] font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Learning outcome */}
          <div className="space-y-2.5">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-neutral-500)]">
              Mục tiêu bài học
              <span className="ml-1.5 text-[var(--color-neutral-400)] font-normal normal-case">(Không bắt buộc)</span>
            </label>
            <textarea
              value={learningOutcome}
              onChange={(e) => setLearningOutcome(e.target.value)}
              placeholder="Sau buổi học, học sinh có thể..."
              className="font-body w-full h-24 bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-[var(--radius-lg)] p-3 text-xs outline-none focus:ring-1 focus:ring-[var(--color-primary-400)] focus:border-[var(--color-primary-500)] focus:bg-white resize-none text-[var(--color-neutral-700)] leading-relaxed transition-all"
            />
            <p className="font-body text-[10px] text-[var(--color-neutral-500)] leading-relaxed">
              Mô tả mục tiêu giúp AI định hướng hoạt động sư phạm sát với chương trình dạy của bạn hơn.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] flex justify-between items-center gap-3">
          <button
            onClick={onCancel}
            className="font-body px-4 py-2 border border-[var(--color-neutral-200)] rounded-[var(--radius-md)] text-xs font-semibold hover:bg-white text-[var(--color-neutral-700)] transition-all active:scale-95 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Chọn file khác
          </button>
          <button
            onClick={handleConfirm}
            className="font-body flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary-500)] text-white rounded-[var(--radius-md)] text-xs font-bold hover:bg-[var(--color-primary-400)] transition-all shadow-md active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Bắt đầu tạo kịch bản
          </button>
        </div>
      </div>
    </div>
  )
}
