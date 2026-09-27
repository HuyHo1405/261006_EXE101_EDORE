'use client'

import { useState, useEffect } from 'react'
import { School, BrainCircuit, Check, Sparkles, ArrowLeft, ArrowRight, FileText, Layers, Target, X } from 'lucide-react'
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
  const [scriptTitle, setScriptTitle] = useState(fileName ? fileName.replace(/\.[^/.]+$/, "") : '')
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    
    // Fake upload progress animation
    const timer = setTimeout(() => setUploadProgress(100), 150)
    
    return () => { 
      document.body.style.overflow = orig
      clearTimeout(timer)
    }
  }, [])

  const handleConfirm = () => {
    let dur = ctx.duration || 45
    if (templateId === 'extended-4-node' && (dur === 45 || dur === '45')) dur = 90
    else if (templateId === 'standard-3-node' && (dur === 90 || dur === '90')) dur = 45
    
    // Gắn scriptTitle vào context nếu sau này API cần, hoặc để giữ trạng thái
    onConfirm({ ...ctx, template_id: templateId, learning_outcome: learningOutcome, duration: dur, scriptTitle })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-6 md:p-8 animate-in fade-in duration-200 font-body">
      <div className="relative w-full max-w-5xl h-full max-h-[92vh] rounded-[var(--radius-xl)] border border-[var(--color-neutral-200)] bg-white shadow-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* ── LEFT COLUMN: INFO SIDEBAR ── */}
        <div className="w-full md:w-64 bg-[var(--color-neutral-100)] text-[var(--color-neutral-900)] p-5 md:p-6 flex flex-col justify-between shrink-0 border-b md:border-b-0 md:border-r border-[var(--color-neutral-200)]">
          <div>
            <div className="mb-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-neutral-500)] font-bold">
                Tạo kịch bản mới
              </span>
              <h2 className="text-base font-bold font-header uppercase tracking-tight text-[var(--color-neutral-900)] mt-0.5">
                Thiết lập bài giảng
              </h2>
            </div>
            
            <p className="font-body text-[11px] text-[var(--color-neutral-500)] mt-0.5 leading-relaxed font-medium">
              Thiết lập các tham số cơ bản để AI tự động phân tích tài liệu và xây dựng kịch bản bài giảng tốt nhất.
            </p>

            {/* Tài liệu tham chiếu (Aligned with right column inputs) */}
            {fileName && (
              <div className="mt-[34px] bg-white p-3.5 rounded-[var(--radius-md)] border border-[var(--color-neutral-200)] shadow-xs flex flex-col gap-3.5">
                <div>
                  <p className="text-[10px] font-bold text-[var(--color-neutral-400)] uppercase tracking-widest mb-1.5">
                    Tài liệu tham chiếu
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden text-[var(--color-primary-600)]">
                      <FileText className="w-4 h-4 shrink-0 text-[var(--color-primary-500)]" />
                      <span className="text-xs font-bold truncate" title={fileName}>{fileName}</span>
                    </div>
                    {uploadProgress === 100 && (
                      <div className="w-4 h-4 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[var(--color-primary-600)]" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[var(--color-neutral-500)]">
                    <span className={uploadProgress === 100 ? 'text-[var(--color-primary-600)]' : ''}>
                      {uploadProgress === 100 ? 'Đã tải lên xong' : 'Đang tải lên...'}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--color-neutral-100)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--color-primary-500)] transition-all duration-700 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="w-full mt-6 md:mt-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-[var(--radius-md)] text-xs font-bold text-[var(--color-neutral-600)] transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Đổi tài liệu khác
          </button>
        </div>

        {/* ── RIGHT COLUMN: MAIN CONTENT ── */}
        <div className="flex-1 bg-white flex flex-col justify-between overflow-y-auto relative">
          
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-800)] transition-colors cursor-pointer z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-5 md:p-6 flex flex-col gap-4">
            <div className="border-b border-[var(--color-neutral-100)] pb-3">
              <h3 className="font-header font-extrabold text-lg uppercase tracking-tight text-[var(--color-neutral-900)]">
                Thông số kịch bản
              </h3>
            </div>

            <div className="bg-[var(--color-neutral-100)] rounded-[var(--radius-xl)] p-4 md:p-5 border border-[var(--color-neutral-200)] space-y-5 shadow-sm">
              {/* Gộp Tên kịch bản & Mục tiêu (Split Input Group) */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-[11px] font-bold text-[var(--color-neutral-500)] uppercase tracking-widest">
                  Thông tin cơ bản <span className="text-[var(--color-secondary-500)]">*</span>
                </label>
                
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral-200)] bg-white shadow-sm focus-within:border-[var(--color-primary-400)] focus-within:ring-4 focus-within:ring-[var(--color-primary-50)] transition-all overflow-hidden group">
                  
                  {/* Tên kịch bản */}
                  <div className="flex items-center px-4 border-b border-[var(--color-neutral-200)] bg-white group-focus-within:bg-white transition-colors">
                    <FileText className="w-4 h-4 text-[var(--color-neutral-400)] shrink-0" />
                    <input
                      type="text"
                      placeholder="Tên kịch bản (VD: Bài 1 - Dao động điều hòa)"
                      value={scriptTitle}
                      onChange={(e) => setScriptTitle(e.target.value)}
                      className="w-full h-11 bg-transparent px-3 text-sm font-bold text-[var(--color-neutral-800)] outline-none placeholder:text-[var(--color-neutral-400)] placeholder:font-medium"
                    />
                  </div>

                  {/* Mục tiêu sư phạm */}
                  <div className="flex items-start px-4 py-3 bg-white group-focus-within:bg-white transition-colors">
                    <Target className="w-4 h-4 text-[var(--color-neutral-400)] shrink-0 mt-0.5" />
                    <textarea
                      value={learningOutcome}
                      onChange={(e) => setLearningOutcome(e.target.value)}
                      placeholder="Mục tiêu bài giảng (VD: Giúp học sinh hiểu cơ chế dao động...)"
                      className="w-full h-16 bg-transparent px-3 text-xs font-medium text-[var(--color-neutral-700)] outline-none resize-none leading-relaxed placeholder:text-[var(--color-neutral-400)] placeholder:font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Khung bài học */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-[11px] font-bold text-[var(--color-neutral-500)] uppercase tracking-widest">
                  <div className="p-1 rounded bg-[var(--color-neutral-200)] text-[var(--color-neutral-600)]"><Layers className="w-3 h-3" /></div>
                  Khung bài học (Template)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templateOptions.map((opt) => {
                    const Icon = opt.Icon
                    const isSelected = templateId === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setTemplateId(opt.value)}
                        className={`relative w-full p-3.5 rounded-[var(--radius-lg)] border transition-all flex flex-col items-center text-center gap-2 cursor-pointer
                          ${isSelected
                            ? 'border-[var(--color-primary-300)] bg-[var(--color-primary-50)] shadow-md ring-4 ring-[var(--color-primary-50)]'
                            : 'border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-neutral-300)] hover:bg-[var(--color-neutral-50)]'
                          }`}
                      >
                        <div className={`absolute top-3 right-3 w-4 h-4 rounded-[var(--radius-full)] border-2 flex items-center justify-center shrink-0 transition-all
                            ${isSelected ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]' : 'border-[var(--color-neutral-300)]'}`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </div>

                        <div className={`p-2.5 rounded-[var(--radius-full)] transition-colors ${isSelected ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-600)]' : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]'}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <div>
                          <p className={`font-header text-xs uppercase tracking-tight font-extrabold ${isSelected ? 'text-[var(--color-primary-700)]' : 'text-[var(--color-neutral-800)]'}`}>
                            {opt.label}
                          </p>
                          <p className="text-[10px] text-[var(--color-neutral-500)] mt-0.5 font-medium leading-tight">{opt.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── FOOTER ACTIONS ── */}
          <div className="border-t border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] px-6 md:px-8 py-5 flex items-center justify-end gap-3">
            <button
              onClick={handleConfirm}
              disabled={!scriptTitle.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary-500)] text-white rounded-[var(--radius-md)] text-xs font-bold hover:bg-[var(--color-primary-600)] transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Phân tích & Xây dựng kịch bản
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
