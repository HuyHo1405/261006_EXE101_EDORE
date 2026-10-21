'use client'

import { useContext, useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { FileText, ArrowRight, Download, Loader2, Sparkles } from 'lucide-react'
import { apiClient } from '@/lib/fetcher'
import { downloadQuiz, prepareKahootQuestions, type KahootQuestion } from '../../utils/kahootExport'
import { KahootReviewPanel } from '../payload/views/KahootReviewPanel'
import { LessonDocumentContext } from '../LessonDocumentContext'
import { OralQuizModal } from '@/features/oral-quiz/components/OralQuizModal'

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

  const [exportingDocx, setExportingDocx] = useState<'questions/student' | 'questions/teacher' | null>(null)
  const [exportError, setExportError] = useState('')
  const [reviewSource, setReviewSource] = useState<KahootQuestion[] | null>(null)
  const [isOralQuizOpen, setIsOralQuizOpen] = useState(false)

  const formattedQuestions = useMemo(() => {
    return exercises.map((ex: any, idx: number) => ({
      id: ex.question_id || String(idx + 1),
      questionText: ex.question || '',
      options: Array.isArray(ex.options) ? ex.options : [],
      correctAnswer: ex.correct_answer || 1,
      timeLimit: ex.time_limit || 30,
      difficulty: ex.level || 'Trắc nghiệm',
      explanation: ex.explanation || '',
    }))
  }, [exercises])

  let sourceSignature = ''
  try {
    sourceSignature = JSON.stringify(prepareKahootQuestions(exercises, false))
  } catch {
    /* Invalid originals cannot be exported yet */
  }

  // Count exercises by level
  const counts = LEVELS.map(l => ({ ...l, n: exercises.filter(e => e.level === l.key).length })).filter(l => l.n > 0)

  const [activeExerciseIdx, setActiveExerciseIdx] = useState<number | null>(null)

  const scrollToExercise = (idx: number) => {
    setActiveExerciseIdx(idx)
    const el = document.getElementById(`luyentap-exercise-${idx}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2')
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2')
      }, 1500)
    }
  }

  const exportQuiz = () => {
    setExportError('')
    try {
      const questions = prepareKahootQuestions(exercises, false)
      setReviewSource(questions)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Không thể xuất câu hỏi. Vui lòng kiểm tra lại nội dung.')
    }
  }

  const exportDocument = async (part: 'questions/student' | 'questions/teacher') => {
    if (!lessonDocument || exportingDocx) return
    setExportError('')
    setExportingDocx(part)
    try {
      const response = await apiClient<{ base64: string }>(`/api/v1/lessons/export-docx/${part}`, {
        method: 'POST',
        body: JSON.stringify({ ...lessonDocument,
          sections: [],
          questions: lessonDocument.questions,
        }),
      })
      const bytes = Uint8Array.from(atob(response.result!.base64), c => c.charCodeAt(0))
      const filename = (lessonDocument.title.replace(/[<>:"/\\|?*\x00-\x1F]/g, '-').trim().slice(0, 100) || 'bai-hoc')
        + (part === 'questions/student' ? '-cau-hoi-hoc-sinh.docx' : '-cau-hoi-giao-vien.docx')
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

        {/* Nhóm 1: Nền tảng ngoài (Kahoot) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              Nền tảng tương tác ngoài
            </span>
            <span className="text-[10px] font-medium text-slate-400">Trò chơi trắc nghiệm</span>
          </div>
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
                  Tải mẫu Spreadsheet để nhập vào Kahoot
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-blue-200 group-hover:text-white group-hover:translate-y-0.5 transition-all" />
          </button>
        </div>

        {/* Nhóm 2: Tài liệu Word giảng dạy */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              Tài liệu in ấn &amp; Giảng dạy (.docx)
            </span>
            <span className="text-[10px] font-medium text-slate-400">Giáo viên sử dụng</span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              disabled={exportingDocx !== null || !lessonDocument?.questions.length}
              onClick={() => exportDocument('questions/student')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border-2 border-emerald-200 hover:border-emerald-300 bg-emerald-50 text-emerald-800 font-body text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <div className="text-left">
                  <div>{exportingDocx === 'questions/student' ? 'Đang xuất phiếu học sinh…' : 'Phiếu câu hỏi — Học sinh'}</div>
                  <div className="text-[10px] font-normal mt-0.5">Không đáp án, có dòng kẻ để làm bài</div>
                </div>
              </div>
              {exportingDocx === 'questions/student' ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <Download className="w-4 h-4 text-emerald-600 group-hover:translate-y-0.5 transition-transform" />
              )}
            </button>
            <button
              type="button"
              disabled={exportingDocx !== null || !lessonDocument?.questions.length}
              onClick={() => exportDocument('questions/teacher')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border-2 border-purple-200 hover:border-purple-300 bg-purple-50 text-purple-800 font-body text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <div className="text-left">
                  <div>{exportingDocx === 'questions/teacher' ? 'Đang xuất bản giáo viên…' : 'Đáp án chi tiết — Giáo viên'}</div>
                  <div className="text-[10px] font-normal mt-0.5">Kèm đáp án đúng và hướng dẫn giải</div>
                </div>
              </div>
              {exportingDocx === 'questions/teacher' ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              ) : (
                <Download className="w-4 h-4 text-purple-600 group-hover:translate-y-0.5 transition-transform" />
              )}
            </button>
          </div>
        </div>

        {/* Nhóm 3: Tương tác lớp học — Vòng quay trả bài */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Tương tác lớp học
            </span>
            <span className="text-[10px] font-medium text-slate-400">Gọi tên ngẫu nhiên</span>
          </div>

          <button
            type="button"
            disabled={!exercises.length}
            onClick={() => setIsOralQuizOpen(true)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border-2 border-amber-200 hover:border-amber-300 bg-amber-50 text-amber-800 font-body text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="text-left">
                <div className="leading-tight">Vòng quay trả bài (Lucky Wheel)</div>
                <div className="text-[10px] text-amber-700/80 font-normal mt-0.5">
                  Quay chọn học sinh theo STT &amp; hiện câu hỏi
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>

        {/* Cảnh báo lỗi nếu có */}
        {exportError && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
            {exportError}
          </div>
        )}
      </div>

      {/* Card 2: Điều hướng câu hỏi nhanh (Grid N câu) & Thống kê */}
      <div className="bg-white border border-slate-200 p-4 rounded-[var(--radius-xl)] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="font-header text-xs font-bold uppercase tracking-wider text-slate-700">
            Điều hướng câu hỏi
          </span>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {exercises.length} câu
          </span>
        </div>

        {/* Grid bấm nhanh các câu hỏi */}
        <div className="space-y-2">
          <div className="text-xs text-slate-600 font-medium">
            Bấm để nhảy nhanh:
          </div>

          {exercises.length > 0 ? (
            <div className="grid grid-cols-5 gap-2 p-1.5 bg-slate-50/80 rounded-xl border border-slate-200">
              {exercises.map((ex, i) => {
                const isFilled = !!ex.question?.trim()
                const lv = LEVELS.find(l => l.key === ex.level)
                const isActive = activeExerciseIdx === i

                let btnCls = 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-2xs'
                if (!isFilled) {
                  btnCls = 'bg-slate-100 text-slate-400 border-dashed border-slate-300'
                }

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollToExercise(i)}
                    title={`Câu ${i + 1} (${lv?.label || 'Chưa chọn'}): ${ex.question ? ex.question.slice(0, 50) + '...' : '(Chưa có nội dung)'}`}
                    className={`relative h-10 rounded-lg text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${btnCls} ${
                      isActive ? 'ring-2 ring-blue-600 ring-offset-1 font-extrabold scale-105' : ''
                    }`}
                  >
                    <span>{i + 1}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-2 text-center">Chưa có câu hỏi nào</p>
          )}
        </div>

        {/* Phân bố mức độ nhận thức */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
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

      {/* Modal Vòng quay trả bài */}
      <OralQuizModal
        isOpen={isOralQuizOpen}
        onClose={() => setIsOralQuizOpen(false)}
        lessonId={p.lesson_code || undefined}
        lessonTitle={lessonDocument?.title || 'Bài học'}
        questions={formattedQuestions}
      />
    </div>
  )
}
