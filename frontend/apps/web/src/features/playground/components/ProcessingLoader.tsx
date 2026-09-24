'use client'

import { useEffect, useState } from 'react'
import { FileText, Sparkles, Brain, CheckCircle2, XCircle, X } from 'lucide-react'

const LOADING_STEPS = [
  { Icon: FileText, label: 'Đang trích xuất nội dung tài liệu...' },
  { Icon: Sparkles, label: 'Đang phân tích và chunk ngữ nghĩa...' },
  { Icon: Brain, label: 'AI đang tạo kịch bản bài học...' },
  { Icon: CheckCircle2, label: 'Hoàn thiện và sắp xếp kết quả...' },
]

interface ProcessingLoaderProps {
  hasError?: boolean
  errorMessage?: string
  onCancel?: () => void
}

export default function ProcessingLoader({ hasError = false, errorMessage = '', onCancel }: ProcessingLoaderProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (hasError) return
    const id = setInterval(() => setActiveStep((s) => (s + 1) % LOADING_STEPS.length), 2200)
    return () => clearInterval(id)
  }, [hasError])

  useEffect(() => {
    if (hasError) return
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 400)
    return () => clearInterval(id)
  }, [hasError])

  const ActiveIcon = LOADING_STEPS[activeStep].Icon

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-10">
      {hasError ? (
        <div className="flex flex-col items-center gap-5 max-w-md text-center stage-enter">
          <div className="w-20 h-20 rounded-[var(--radius-full)] bg-red-50 border-2 border-red-200 flex items-center justify-center shadow-lg">
            <XCircle className="w-10 h-10 text-[var(--color-semantic-error)]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-header text-lg font-extrabold uppercase tracking-tight text-[var(--color-neutral-900)]">
              Đã xảy ra lỗi
            </h3>
            <p className="font-mono text-xs text-[var(--color-semantic-error)] leading-relaxed bg-red-50 border border-red-100 rounded-[var(--radius-lg)] px-4 py-3">
              {errorMessage || 'Không thể xử lý tài liệu. Vui lòng thử lại.'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="font-body px-6 py-2.5 bg-[var(--color-primary-500)] text-white rounded-[var(--radius-md)] text-xs font-bold hover:bg-[var(--color-primary-400)] transition-all shadow-md active:scale-95"
          >
            ← Quay lại
          </button>
        </div>
      ) : (
        <>
          {/* Orbital spinner */}
          <div className="relative flex items-center justify-center w-32 h-32">
            <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="58" fill="none" stroke="var(--color-primary-100)" strokeWidth="4" />
              <circle cx="64" cy="64" r="58" fill="none" stroke="url(#grad1)" strokeWidth="4" strokeLinecap="round" strokeDasharray="80 284" />
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-primary-500)" />
                  <stop offset="100%" stopColor="var(--color-primary-300)" />
                </linearGradient>
              </defs>
            </svg>

            <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '1.2s', animationDirection: 'reverse' }} viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="42" fill="none" stroke="var(--color-neutral-200)" strokeWidth="3" />
              <circle cx="64" cy="64" r="42" fill="none" stroke="var(--color-primary-300)" strokeWidth="3" strokeLinecap="round" strokeDasharray="40 224" strokeOpacity="0.5" />
            </svg>

            <div className="relative z-10 w-14 h-14 rounded-[var(--radius-full)] bg-white shadow-lg border border-[var(--color-neutral-200)] flex items-center justify-center">
              <ActiveIcon key={activeStep} className="w-7 h-7 text-[var(--color-primary-500)] animate-fade-in" />
            </div>
          </div>

          <div className="text-center space-y-3">
            <h3 className="font-header text-xl font-extrabold uppercase tracking-tight text-[var(--color-neutral-900)]">
              Hệ thống AI đang xử lý{dots}
            </h3>
            <p key={activeStep} className="font-mono text-xs text-[var(--color-neutral-500)] animate-fade-slide-up">
              {LOADING_STEPS[activeStep].label}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex gap-2">
            {LOADING_STEPS.map((_, i) => (
              <div key={i} className={`rounded-[var(--radius-full)] transition-all duration-500 ${
                i === activeStep ? 'w-6 h-2 bg-[var(--color-primary-500)]'
                : i < activeStep ? 'w-2 h-2 bg-[var(--color-primary-200)]'
                : 'w-2 h-2 bg-[var(--color-neutral-200)]'
              }`} />
            ))}
          </div>

          <button
            onClick={onCancel}
            className="font-body text-xs text-[var(--color-neutral-500)] hover:text-[var(--color-semantic-error)] transition-colors flex items-center gap-1 font-mono mt-2"
          >
            <X className="w-3.5 h-3.5" />
            Hủy xử lý
          </button>
        </>
      )}
    </div>
  )
}
