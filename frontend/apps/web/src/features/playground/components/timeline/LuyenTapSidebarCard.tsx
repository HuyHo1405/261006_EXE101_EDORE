'use client'

import { useContext, useState } from 'react'
import { usePathname } from 'next/navigation'
import { FileText, Sparkles, AlertTriangle, CheckCircle2, Download, HelpCircle, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/fetcher'
import { downloadQuiz, prepareKahootQuestions, exceedsKahootLimits, type KahootQuestion, type KahootDraft } from '../../utils/kahootExport'
import { KahootReviewPanel } from '../payload/views/KahootReviewPanel'
import { LessonDocumentContext } from '../LessonDocumentContext'

const LEVELS: { key: string; label: string; cls: string }[] = [
  { key: 'nhan_biet', label: 'Nhận biết', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  { key: 'thong_hieu', label: 'Thông hiểu', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { key: 'van_dung_thap', label: 'Vận dụng', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  { key: 'van_dung_cao', label: 'Vận dụng cao', cls: 'bg-purple-100 text-purple-800 border-purple-200' },
]

interface LuyenTapSidebarCardProps {
  payload?: any
  onChange?: (p: any) => void
}

export function LuyenTapSidebarCard({ payload, onChange }: LuyenTapSidebarCardProps) {
  const p = payload || {}
  const exercises: any[] = Array.isArray(p.exercises) ? p.exercises : []
  const pathname = usePathname()
  const lessonDocument = useContext(LessonDocumentContext)

  const [exportingDocx, setExportingDocx] = useState<'lesson' | 'questions' | null>(null)
  const [exportError, setExportError] = useState('')
  const [reviewSource, setReviewSource] = useState<KahootQuestion[] | null>(null)

  let sourceSignature = ''
  try {
    sourceSignature = JSON.stringify(prepareKahootQuestions(exercises, false))
  } catch {
    /* Invalid originals cannot be exported yet */
  }

  // Count exercises by level
  const counts = LEVELS.map(l => ({ ...l, n: exercises.filter(e => e.level === l.key).length })).filter(l => l.n > 0)

  // Check how many questions exceed Kahoot limits
  const longCount = exercises.reduce((acc, ex) => {
    const qLen = (ex.question || '').trim().length
    const optOver = Array.isArray(ex.options) && ex.options.some((o: string) => (o || '').trim().length > 75)
    return acc + (qLen > 120 || optOver ? 1 : 0)
  }, 0)

  const exportQuiz = () => {
    setExportError('')
    try {
      const questions = prepareKahootQuestions(exercises, false)
      setReviewSource(questions)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Không thể xuất câu hỏi. Vui lòng kiểm tra lại nội dung.')
    }
  }

  const exportDocument = async (part: 'lesson' | 'questions') => {
    if (!lessonDocument || exportingDocx) return
    setExportError('')
    setExportingDocx(part)
    try {
      const response = await apiClient<{ base64: string }>(`/api/v1/lessons/export-docx/${part}`, {
        method: 'POST',
        body: JSON.stringify({ ...lessonDocument,
          sections: part === 'lesson' ? lessonDocument.sections : [],
          questions: part === 'questions' ? lessonDocument.questions : [],
        }),
      })
      const bytes = Uint8Array.from(atob(response.result!.base64), c => c.charCodeAt(0))
      const filename = (lessonDocument.title.replace(/[<>:"/\\|?*\x00-\x1F]/g, '-').trim().slice(0, 100) || 'bai-hoc')
        + (part === 'lesson' ? '-bai-giang.docx' : '-bo-cau-hoi.docx')
      downloadQuiz(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), filename)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Không thể xuất Word. Vui lòng thử lại.')
    } finally {
      setExportingDocx(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Card 1: Xuất bản & Tích hợp */}
      <div className="bg-white border-[3px] border-[var(--color-primary-500)] p-4 rounded-[var(--radius-xl)] shadow-xs flex flex-col gap-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
              <Download className="w-4 h-4" />
            </div>
            <span className="font-header text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Xuất bản & Tích hợp
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {exercises.length} câu hỏi
          </span>
        </div>

        {/* Nút Xuất Kahoot */}
        <div className="space-y-1.5">
          <button
            type="button"
            disabled={!exercises.length}
            onClick={exportQuiz}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-body text-xs font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-extrabold text-sm select-none">
                K!
              </div>
              <div className="text-left">
                <div className="leading-tight">Xuất Excel cho Kahoot</div>
                <div className="text-[10px] text-blue-100 font-normal mt-0.5">
                  Tương thích mẫu Spreadsheet Kahoot
                </div>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-blue-200 group-hover:rotate-12 transition-transform" />
          </button>
        </div>

        {/* Nút Xuất Word */}
        <div className="space-y-2">
          <button
            type="button"
            disabled={exportingDocx !== null || !lessonDocument}
            onClick={() => exportDocument('lesson')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border-2 border-blue-200 hover:border-blue-300 bg-blue-50 text-blue-800 font-body text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>{exportingDocx === 'lesson' ? 'Đang xuất bài giảng…' : 'Xuất Word bài giảng'}</span>
            </div>
            {exportingDocx === 'lesson' && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />}
          </button>
          <button
            type="button"
            disabled={exportingDocx !== null || !lessonDocument?.questions.length}
            onClick={() => exportDocument('questions')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border-2 border-purple-200 hover:border-purple-300 bg-purple-50 text-purple-800 font-body text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>{exportingDocx === 'questions' ? 'Đang xuất bộ câu hỏi…' : 'Xuất Word bộ câu hỏi'}</span>
            </div>
            {exportingDocx === 'questions' && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />}
          </button>
        </div>

        {/* Cảnh báo lỗi nếu có */}
        {exportError && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
            {exportError}
          </div>
        )}

        {/* Mẹo nhỏ */}
        <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-800 space-y-1">
          <div className="font-bold flex items-center gap-1 text-blue-900">
            <HelpCircle className="w-3.5 h-3.5" />
            Cách đưa vào Kahoot:
          </div>
          <p className="text-slate-600 text-[10.5px] leading-relaxed">
            Trong Kahoot Quiz Creator: chọn <strong>Add question</strong> → <strong>Import</strong> → <strong>Import spreadsheet</strong> và tải file Excel lên.
          </p>
        </div>
      </div>

      {/* Card 2: Thống kê & Kiểm tra tính tương thích Kahoot */}
      <div className="bg-white border border-slate-200 p-4 rounded-[var(--radius-xl)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-header text-xs font-bold uppercase tracking-wider text-slate-700">
            Trạng thái câu hỏi
          </span>
          {longCount > 0 ? (
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              {longCount} câu dài
            </span>
          ) : (
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Đạt chuẩn ký tự
            </span>
          )}
        </div>

        {/* Phân bố mức độ nhận thức */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-semibold text-slate-500">Mức độ nhận thức:</div>
          <div className="flex flex-wrap gap-1.5">
            {counts.length > 0 ? (
              counts.map(c => (
                <span key={c.key} className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${c.cls}`}>
                  {c.label}: {c.n}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">Chưa có câu hỏi</span>
            )}
          </div>
        </div>

        {longCount > 0 && (
          <p className="text-[11px] text-slate-500 leading-normal border-t border-slate-100 pt-2">
            💡 Có {longCount} câu có câu hỏi &gt;120 ký tự hoặc đáp án &gt;75 ký tự. Khi bấm <strong>Xuất Excel cho Kahoot</strong>, AI sẽ hỗ trợ bạn rút gọn chỉ bằng 1 cú click.
          </p>
        )}
      </div>

      {/* Modal Duyệt câu hỏi Kahoot */}
      {reviewSource && JSON.stringify(reviewSource) === sourceSignature && (
        <KahootReviewPanel
          key={sourceSignature}
          source={reviewSource}
          saved={p.kahoot_export}
          cacheKey={`edore:kahoot-export:v1:${pathname}`}
          onClose={() => setReviewSource(null)}
          onSave={draft => onChange?.({ ...p, kahoot_export: draft })}
        />
      )}
    </div>
  )
}
