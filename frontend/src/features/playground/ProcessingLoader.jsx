import { useEffect, useRef } from 'react'

/**
 * ProcessingLoader — Stage: 'processing'
 * Shows real-time SSE progress events as the pipeline runs.
 *
 * Props:
 *   progressEvents  Array<{ message, step, total_steps }>   — accumulated progress
 *   metadata        object | null                           — metadata event payload
 *   sectionsDone    number                                  — how many section events received
 *   totalSections   number                                  — expected total (from metadata)
 *   hasError        boolean
 *   errorMessage    string
 *   onCancel()      — abort the stream
 */
export default function ProcessingLoader({
  progressEvents = [],
  metadata = null,
  contentSummary = '',
  sectionsDone = 0,
  totalSections = 0,
  hasError = false,
  errorMessage = '',
  onCancel,
}) {
  const logRef = useRef(null)

  // Auto-scroll the log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [progressEvents, sectionsDone])

  // Derive overall progress (0-100) from step / total_steps
  const latest = progressEvents[progressEvents.length - 1]
  const rawPct = latest
    ? Math.round((latest.step / latest.total_steps) * 100)
    : sectionsDone > 0 && totalSections > 0
      ? Math.round((sectionsDone / totalSections) * 100)
      : 0
  const pct = Math.min(rawPct, 99) // cap at 99 until 'done' event

  const statusIcon = hasError ? '❌' : rawPct >= 100 ? '✅' : '⚡'

  return (
    <div className="max-w-xl mx-auto py-10 space-y-8 animate-fade-slide-up">
      {/* Spinner ring */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative inline-flex items-center justify-center">
          {/* Background track */}
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle
              cx="48" cy="48" r="40"
              fill="none" stroke="#eaedff" strokeWidth="8"
            />
            <circle
              cx="48" cy="48" r="40"
              fill="none"
              stroke={hasError ? '#ba1a1a' : '#0058be'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute text-sm font-bold text-[#0058be] font-mono">
            {hasError ? '!' : `${pct}%`}
          </span>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-[#151b2d]">
            {hasError ? 'Đã xảy ra lỗi' : 'Hệ thống AI đang xử lý kịch bản'}
          </h3>
          {latest && !hasError && (
            <p className="text-xs text-[#727785] font-mono">{latest.message}</p>
          )}
          {hasError && (
            <p className="text-xs text-[#ba1a1a] font-mono">{errorMessage}</p>
          )}
        </div>
      </div>

      {/* Metadata chip row */}
      {metadata && (
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { icon: 'description', label: `${metadata.total_chars?.toLocaleString()} ký tự` },
            { icon: 'layers', label: `${metadata.total_chunks} chunks` },
            { icon: 'account_tree', label: `${metadata.sections?.length ?? 0} nodes` },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1 text-[10px] font-mono bg-[#eaedff] text-[#0058be] px-3 py-1 rounded-full border border-[#0058be]/20"
            >
              <span className="material-symbols-outlined text-[12px]">{icon}</span>
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Content Summary Card */}
      {contentSummary && (
        <div className="bg-[#f2f3ff] border border-[#0058be]/20 rounded-2xl p-5 space-y-2.5 animate-fade-slide-up text-left shadow-sm">
          <h4 className="font-bold text-xs text-[#0058be] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <span className="material-symbols-outlined text-[16px] text-[#0058be]">summarize</span>
            Tóm tắt cấu trúc kịch bản bài học
          </h4>
          <p className="text-sm text-[#424754] leading-relaxed italic">
            "{contentSummary}"
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="w-full bg-[#eaedff] h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              hasError
                ? 'bg-[#ba1a1a]'
                : 'bg-gradient-to-r from-[#0058be] to-[#6b38d4]'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {totalSections > 0 && (
          <p className="text-center text-[10px] text-[#727785] font-mono">
            Hoàn thành {sectionsDone}/{totalSections} sections
          </p>
        )}
      </div>

      {/* Event log */}
      {progressEvents.length > 0 && (
        <div
          ref={logRef}
          className="bg-[#151b2d] rounded-xl p-4 max-h-40 overflow-y-auto space-y-1 text-[10px] font-mono"
        >
          {progressEvents.map((ev, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[#6b38d4] shrink-0">[{ev.step}/{ev.total_steps}]</span>
              <span className="text-[#a8c0e8]">{ev.message}</span>
            </div>
          ))}
          {sectionsDone > 0 && (
            <div className="flex items-start gap-2 text-[#6cf8bb]">
              <span className="shrink-0">[section]</span>
              <span>✓ {sectionsDone} node(s) hoàn thành và đã stream về</span>
            </div>
          )}
        </div>
      )}

      {/* Cancel */}
      {!hasError && (
        <div className="flex justify-center">
          <button
            onClick={onCancel}
            className="text-xs text-[#727785] hover:text-[#ba1a1a] transition-colors flex items-center gap-1 font-mono"
          >
            <span className="material-symbols-outlined text-[14px]">cancel</span>
            Hủy xử lý
          </button>
        </div>
      )}
    </div>
  )
}
