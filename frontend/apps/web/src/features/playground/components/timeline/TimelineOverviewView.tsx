import React, { useContext, useState } from 'react'
import { LayoutList, ChevronRight, ArrowRight, FileText, Loader2, Sparkles } from 'lucide-react'
import type { TimelineStep } from '@/lib/services/pipelineService'
import { EMPTY_LESSON_META } from '../../types/lessonMeta'
import type { LessonMeta } from '../../types/lessonMeta'
import { LessonOverviewPanel } from '../LessonOverviewPanel'
import { LessonDocumentContext } from '../LessonDocumentContext'
import { apiClient } from '@/lib/fetcher'
import { downloadQuiz } from '../../utils/kahootExport'

interface TimelineOverviewViewProps {
  lessonMeta?: LessonMeta
  contentSummary?: string
  steps: TimelineStep[]
  lessonHeading: string
  totalDuration: number
  totalToolsCount: number
  preparedToolsCount: number
  isToolsIncomplete: boolean
  checkedTools: Record<number, boolean>
  onToggleTool: (idx: number) => void
  onNavigateToNode: (idx: number) => void
  onOpenOralQuiz?: () => void
}

export function TimelineOverviewView({
  lessonMeta,
  contentSummary,
  steps,
  lessonHeading,
  totalDuration,
  totalToolsCount,
  preparedToolsCount,
  isToolsIncomplete,
  checkedTools,
  onToggleTool,
  onNavigateToNode,
  onOpenOralQuiz,
}: TimelineOverviewViewProps) {
  const lessonDocument = useContext(LessonDocumentContext)
  const [exportingDocx, setExportingDocx] = useState(false)
  const [exportError, setExportError] = useState('')

  const exportLessonDocx = async () => {
    if (!lessonDocument || exportingDocx) return
    setExportError('')
    setExportingDocx(true)
    try {
      const response = await apiClient<{ base64: string }>('/api/v1/lessons/export-docx/lesson', {
        method: 'POST',
        body: JSON.stringify({
          ...lessonDocument,
          sections: lessonDocument.sections,
          questions: [],
        }),
      })
      const bytes = Uint8Array.from(atob(response.result!.base64), c => c.charCodeAt(0))
      const filename = (lessonDocument.title.replace(/[<>:"/\\|?*\x00-\x1F]/g, '-').trim().slice(0, 100) || 'bai-hoc') + '-bai-giang.docx'
      downloadQuiz(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), filename)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Không thể xuất Word bài giảng. Vui lòng thử lại.')
    } finally {
      setExportingDocx(false)
    }
  }

  return (
    <>
      <main className="col-span-12 lg:col-span-8 border-2 border-[var(--color-neutral-200)] rounded-[var(--radius-xl)] flex flex-col bg-white overflow-hidden shadow-sm">
        <div className="p-5 bg-white border-b border-[var(--color-neutral-200)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] font-bold text-[var(--color-primary-600)] uppercase tracking-wider">
              TỔNG QUAN KỊCH BẢN
            </span>
            <h1 className="font-header font-extrabold text-2xl uppercase tracking-tight text-[var(--color-neutral-900)]">
              Cấu trúc tiến trình giảng dạy đề xuất
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenOralQuiz && (
              <button
                type="button"
                onClick={onOpenOralQuiz}
                className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-amber-300 hover:border-amber-400 bg-amber-50 hover:bg-amber-100/90 text-amber-900 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Mở Vòng quay may mắn để kiểm tra bài cũ / trả bài học sinh"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Vòng quay trả bài</span>
              </button>
            )}

            <button
              type="button"
              disabled={exportingDocx || !lessonDocument}
              onClick={exportLessonDocx}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-blue-200 hover:border-blue-300 bg-blue-50 text-blue-800 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
              title="Tải bài giảng đầy đủ định dạng Word (.docx)"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>{exportingDocx ? 'Đang xuất Word…' : 'Tải bài giảng (.docx)'}</span>
              {exportingDocx && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto bg-white">
          <LessonOverviewPanel
            meta={lessonMeta || EMPTY_LESSON_META}
            contentSummary={contentSummary}
            checkedTools={checkedTools}
            onToggleTool={onToggleTool}
          />

          <div className="space-y-3">
            <h3 className="font-header font-extrabold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <LayoutList className="w-4 h-4 text-[var(--color-primary-600)] shrink-0" />
              <span>Danh sách các phần dạy học ({steps.length})</span>
            </h3>
            <div className="divide-y divide-[var(--color-neutral-200)] border border-[var(--color-neutral-200)] rounded-[var(--radius-lg)] overflow-hidden shadow-xs bg-white">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateToNode(idx)}
                  className="p-4 hover:bg-[var(--color-primary-50)] cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-7 h-7 rounded-[var(--radius-full)] bg-[var(--color-primary-100)] text-[var(--color-primary-700)] font-mono font-bold text-xs flex items-center justify-center border border-[var(--color-primary-200)] shadow-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-body font-bold text-sm text-[var(--color-neutral-900)] group-hover:text-[var(--color-primary-600)] transition-colors">
                        {step.isLoading ? `Đang khởi tạo phần ${idx + 1}...` : step.title || `Phần ${idx + 1}`}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-body text-[11px] font-semibold text-[var(--color-primary-700)] bg-[var(--color-primary-50)] px-2.5 py-0.5 rounded-[var(--radius-full)] border border-[var(--color-primary-200)]">
                          {step.type || 'Hoạt động'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {step.isLoading ? (
                      <span className="w-4 h-4 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="font-mono text-xs bg-[var(--color-neutral-100)] text-[var(--color-neutral-800)] px-3 py-1 rounded-[var(--radius-full)] font-bold border border-[var(--color-neutral-300)]">
                        {(step.duration || '').endsWith("'") ? step.duration : `${step.duration}'`}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-[var(--color-neutral-400)] group-hover:text-[var(--color-primary-500)] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Overview Sidebar */}
      <aside className="col-span-12 lg:col-span-4 space-y-4 sticky top-[108px] self-start">
        <div className="border-2 border-[var(--color-neutral-200)] rounded-[var(--radius-xl)] bg-white overflow-hidden shadow-sm">
          <div className="p-4 bg-[var(--color-neutral-100)] border-b border-[var(--color-neutral-200)] space-y-1">
            {lessonMeta?.chapter ? (
              <span
                title={lessonMeta.chapter}
                className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400 block truncate"
              >
                {lessonMeta.chapter}
              </span>
            ) : (
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary-600)] block">
                Thông tin bài học
              </span>
            )}
            <h4 className="font-header text-sm font-extrabold uppercase tracking-wide text-[var(--color-neutral-900)] leading-snug">
              {lessonHeading}
            </h4>
          </div>
          <div className="p-4 space-y-4 bg-white">
            <div className="space-y-3 text-xs font-body text-[var(--color-neutral-700)]">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--color-neutral-200)]">
                <span>Tổng số phần (Nodes)</span>
                <span className="font-mono font-bold text-sm text-[var(--color-neutral-900)]">{steps.length} phần</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[var(--color-neutral-200)]">
                <span>Tổng thời lượng bài học</span>
                <span className="font-mono font-bold text-sm text-[var(--color-primary-600)]">{totalDuration} phút</span>
              </div>
              {totalToolsCount > 0 && (
                <div className="flex justify-between items-center pb-2 border-b border-[var(--color-neutral-200)]">
                  <span>Học liệu đã chuẩn bị</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      isToolsIncomplete ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {preparedToolsCount}/{totalToolsCount}
                  </span>
                </div>
              )}
            </div>

            {steps.length > 0 && (
              <button
                onClick={() => onNavigateToNode(0)}
                className="font-body w-full py-2.5 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-400)] text-white rounded-[var(--radius-md)] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 mt-2 cursor-pointer"
              >
                Bắt đầu xem &amp; chỉnh sửa
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {onOpenOralQuiz && (
              <div className="pt-2 border-t border-[var(--color-neutral-200)]">
                <button
                  type="button"
                  onClick={onOpenOralQuiz}
                  className="w-full py-2.5 px-3 rounded-[var(--radius-md)] border-2 border-amber-200 hover:border-amber-300 bg-amber-50/90 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 cursor-pointer"
                  title="Mở Vòng quay trả bài đầu giờ"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Vòng quay trả bài (Lucky Wheel)</span>
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-[var(--color-neutral-200)] space-y-1.5">
              <button
                type="button"
                disabled={exportingDocx || !lessonDocument}
                onClick={exportLessonDocx}
                className="w-full py-2.5 px-3 rounded-[var(--radius-md)] border-2 border-blue-200 hover:border-blue-300 bg-blue-50/80 hover:bg-blue-100/80 text-blue-800 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{exportingDocx ? 'Đang xuất bài giảng…' : 'Tải bài giảng (Word .docx)'}</span>
                {exportingDocx && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />}
              </button>
              {exportError && (
                <p className="text-[11px] text-red-600 text-center font-medium">{exportError}</p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
