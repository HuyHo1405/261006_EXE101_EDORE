'use client'

import { useState, useRef } from 'react'
import {
  Upload,
  FolderOpen,
  Users,
  FileText,
  Brain,
  Pencil,
} from 'lucide-react'

const FEATURES = [
  {
    Icon: Users,
    title: 'Cấu hình lớp học',
    desc: 'Thiết lập mục tiêu, đối tượng học sinh và trình độ để AI cá nhân hóa nội dung phù hợp nhất.',
  },
  {
    Icon: FileText,
    title: 'Thiết lập bài giảng',
    desc: 'Tải tài liệu và chọn khung bài học, AI sẽ nắm bắt cấu trúc và yêu cầu cốt lõi của bạn.',
  },
  {
    Icon: Brain,
    title: 'Hệ thống AI xử lý',
    desc: 'Công nghệ phân tích ngữ nghĩa tự động trích xuất kiến thức và soạn thảo kịch bản giảng dạy logic.',
  },
  {
    Icon: Pencil,
    title: 'Tùy ý chỉnh sửa',
    desc: 'Dễ dàng tinh chỉnh, thay đổi hoặc bổ sung chi tiết vào kịch bản trước khi đưa vào giảng dạy.',
  },
]

interface ClassroomCtx {
  duration?: number | string
  studentCount?: string
  learningSpace?: string
  [key: string]: unknown
}

interface ContentInputProps {
  onFileSelected: (file: File) => void
  onManualSubmit?: (text: string) => void
  classroomCtx: ClassroomCtx
  onConfigChange?: (ctx: ClassroomCtx) => void
  onOpenConfig?: () => void
  onViewDemo?: () => void
}

export default function ContentInput({
  onFileSelected,
  classroomCtx,
  onOpenConfig,
  onViewDemo,
}: ContentInputProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelected(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFileSelected(file)
  }

  const configSummary = (() => {
    const parts: string[] = []
    if (classroomCtx?.duration) parts.push(`${classroomCtx.duration} phút`)
    if (classroomCtx?.studentCount) {
      parts.push(
        classroomCtx.studentCount === '<=10' ? '≤10 HV'
          : classroomCtx.studentCount === '>30' ? '31+ HV'
          : '11–30 HV'
      )
    }
    if (classroomCtx?.learningSpace) {
      const spaceMap: Record<string, string> = { classroom: 'Lớp học', lab: 'Lab', outdoor: 'Ngoài trời', online: 'Online' }
      parts.push(spaceMap[classroomCtx.learningSpace] || '')
    }
    return parts.filter(Boolean)
  })()

  const hasConfig = configSummary.length > 0

  return (
    <div className="space-y-5">
      {/* ── Drop zone ── */}
      <div className="stage-enter delay-0">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative overflow-hidden group rounded-[var(--radius-2xl)] border-2 border-dashed transition-all duration-300 p-12 flex flex-col items-center justify-center min-h-[280px] cursor-pointer
            ${isDragging
              ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] scale-[1.005]'
              : 'border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] hover:border-[var(--color-primary-400)] hover:bg-[var(--color-primary-50)]'
            }`}
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[var(--color-primary-500)]/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[var(--color-tertiary-500)]/5 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Upload icon */}
            <div className={`w-16 h-16 bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] text-white rounded-[var(--radius-xl)] flex items-center justify-center mb-4 shadow-lg shadow-[var(--color-primary-500)]/25 transition-transform duration-300 ${isDragging ? 'scale-110 rotate-3' : 'group-hover:scale-110'}`}>
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="font-header text-xl font-extrabold uppercase tracking-tight text-[var(--color-neutral-900)] mb-1">
              {isDragging ? 'Thả tệp tại đây!' : 'Tải tài liệu lên'}
            </h3>
            <p className="font-body text-[var(--color-neutral-600)] text-xs mb-1 leading-relaxed">
              Kéo và thả tệp vào đây, hoặc nhấn để duyệt từ máy tính của bạn
            </p>

            <div className="flex gap-2 mb-8">
              {['PDF', 'Word', 'TXT', 'MD'].map((fmt) => (
                <span key={fmt} className="px-2.5 py-0.5 bg-white/80 border border-[var(--color-neutral-300)] rounded-[var(--radius-full)] text-[10px] font-mono font-bold text-[var(--color-neutral-700)] shadow-sm">
                  {fmt}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="font-body bg-white text-[var(--color-primary-500)] border-2 border-[var(--color-primary-500)] px-6 py-2.5 rounded-[var(--radius-md)] font-bold text-sm shadow-md shadow-[var(--color-primary-500)]/10 hover:bg-[var(--color-primary-50)] active:scale-95 transition-all duration-150 flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Chọn tệp tin
              </button>

              <button
                onClick={() => onOpenConfig?.()}
                className={`font-body relative px-5 py-2.5 rounded-[var(--radius-md)] font-bold text-sm flex items-center gap-2 transition-all duration-150 active:scale-95
                  ${hasConfig
                    ? 'bg-[var(--color-primary-500)] text-white shadow-lg shadow-[var(--color-primary-500)]/30 hover:bg-[var(--color-primary-400)]'
                    : 'bg-[var(--color-secondary-500)] text-white shadow-lg shadow-[var(--color-secondary-500)]/30 hover:bg-[var(--color-secondary-400)]'
                  }`}
              >
                {!hasConfig && (
                  <span className="absolute inset-0 rounded-[var(--radius-md)] animate-ping bg-[var(--color-secondary-500)]/30 pointer-events-none" />
                )}
                <Users className="w-4 h-4" />
                Cấu hình lớp học
              </button>
            </div>

            <input ref={fileInputRef} accept=".pdf,.doc,.docx,.txt,.md" className="hidden" type="file" onChange={handleFileChange} />
          </div>

          {/* Config summary strip */}
          {hasConfig && (
            <div className="absolute top-4 right-4 flex gap-1.5 flex-wrap justify-end max-w-[200px]">
              {configSummary.map((s, i) => (
                <span key={i} className="font-mono px-2 py-0.5 bg-[var(--color-primary-100)] border border-[var(--color-primary-200)] rounded-[var(--radius-full)] text-[10px] font-bold text-[var(--color-primary-700)]">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Feature cols ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stage-enter delay-80">
        {FEATURES.map(({ Icon, title, desc }, i) => (
          <div key={i} className="group p-4 rounded-[var(--radius-lg)] bg-white border border-[var(--color-neutral-200)] shadow-sm hover:border-[var(--color-primary-300)] hover:shadow-md transition-all duration-200 cursor-default">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-primary-100)] flex items-center justify-center mb-3 group-hover:bg-[var(--color-primary-500)] transition-colors duration-200">
              <Icon className="w-4 h-4 text-[var(--color-primary-500)] group-hover:text-white transition-colors duration-200" />
            </div>
            <h4 className="font-body font-bold text-sm text-[var(--color-neutral-900)] mb-1">{title}</h4>
            <p className="font-body text-[11px] text-[var(--color-neutral-500)] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
