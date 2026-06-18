import { useEffect, useState } from 'react'

const LOADING_STEPS = [
  { icon: 'description',   label: 'Đang trích xuất nội dung tài liệu...' },
  { icon: 'auto_fix_high', label: 'Đang phân tích và chunk ngữ nghĩa...' },
  { icon: 'psychology',    label: 'AI đang tạo kịch bản bài học...' },
  { icon: 'check_circle',  label: 'Hoàn thiện và sắp xếp kết quả...' },
]

/**
 * ProcessingLoader — Stage: 'processing'
 * Simple animated loader while the pipeline runs.
 *
 * Props:
 *   hasError       boolean
 *   errorMessage   string
 *   onCancel()     abort callback
 */
export default function ProcessingLoader({ hasError = false, errorMessage = '', onCancel }) {
  const [activeStep, setActiveStep] = useState(0)
  const [dots, setDots] = useState('')

  // Cycle through fake step labels every ~2.2s
  useEffect(() => {
    if (hasError) return
    const id = setInterval(() => {
      setActiveStep((s) => (s + 1) % LOADING_STEPS.length)
    }, 2200)
    return () => clearInterval(id)
  }, [hasError])

  // Animated dots
  useEffect(() => {
    if (hasError) return
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'))
    }, 400)
    return () => clearInterval(id)
  }, [hasError])

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-10">

      {hasError ? (
        /* ── Error state ── */
        <div className="flex flex-col items-center gap-5 max-w-md text-center stage-enter">
          <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-4xl text-[#ba1a1a]">error_outline</span>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-[#151b2d]">Đã xảy ra lỗi</h3>
            <p className="text-xs text-[#ba1a1a] leading-relaxed font-mono bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {errorMessage || 'Không thể xử lý tài liệu. Vui lòng thử lại.'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-[#0058be] text-white rounded-xl text-xs font-bold hover:bg-[#2170e4] transition-all shadow-md active:scale-95"
          >
            ← Quay lại
          </button>
        </div>
      ) : (
        /* ── Loading state ── */
        <>
          {/* Orbital spinner */}
          <div className="relative flex items-center justify-center w-32 h-32">
            {/* Outer slow ring */}
            <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="58" fill="none" stroke="#eaedff" strokeWidth="4" />
              <circle
                cx="64" cy="64" r="58"
                fill="none"
                stroke="url(#grad1)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="80 284"
              />
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0058be" />
                  <stop offset="100%" stopColor="#6b38d4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner fast ring */}
            <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '1.2s', animationDirection: 'reverse' }} viewBox="0 0 128 128">
              <circle
                cx="64" cy="64" r="42"
                fill="none"
                stroke="#eaedff"
                strokeWidth="3"
              />
              <circle
                cx="64" cy="64" r="42"
                fill="none"
                stroke="#6b38d4"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="40 224"
                strokeOpacity="0.5"
              />
            </svg>

            {/* Center icon */}
            <div className="relative z-10 w-14 h-14 rounded-full bg-white shadow-lg border border-[#e2e8f0] flex items-center justify-center">
              <span
                key={activeStep}
                className="material-symbols-outlined text-[28px] text-[#0058be] animate-fade-in"
              >
                {LOADING_STEPS[activeStep].icon}
              </span>
            </div>
          </div>

          {/* Text */}
          <div className="text-center space-y-3">
            <h3 className="text-xl font-extrabold text-[#151b2d]">
              Hệ thống AI đang xử lý{dots}
            </h3>
            <p
              key={activeStep}
              className="text-xs text-[#727785] font-mono animate-fade-slide-up"
            >
              {LOADING_STEPS[activeStep].label}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex gap-2">
            {LOADING_STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  i === activeStep
                    ? 'w-6 h-2 bg-[#0058be]'
                    : i < activeStep
                      ? 'w-2 h-2 bg-[#6b38d4]/40'
                      : 'w-2 h-2 bg-[#e2e8f0]'
                }`}
              />
            ))}
          </div>

          {/* Cancel */}
          <button
            onClick={onCancel}
            className="text-xs text-[#727785] hover:text-[#ba1a1a] transition-colors flex items-center gap-1 font-mono mt-2"
          >
            <span className="material-symbols-outlined text-[14px]">cancel</span>
            Hủy xử lý
          </button>
        </>
      )}
    </div>
  )
}
