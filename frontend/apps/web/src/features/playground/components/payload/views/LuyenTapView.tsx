'use client'

import { useId, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Plus, Trash2, Eye, EyeOff, ClipboardList } from 'lucide-react'
import { AutoResizeTextarea } from '../StepEnrichmentRender'

import { SectionLabel, fieldCls } from './Shared'
import { downloadQuiz, prepareKahootQuestions, toKahootCsv, type KahootQuestion } from '../../../utils/kahootExport'
import { KahootReviewPanel } from './KahootReviewPanel'

// ─── Luyện tập (ôn tập) ───────────────────────────────────────────────────────
const LEVELS: { key: string; label: string; cls: string }[] = [
  { key: 'nhan_biet', label: 'Nhận biết', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  { key: 'thong_hieu', label: 'Thông hiểu', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { key: 'van_dung_thap', label: 'Vận dụng', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  { key: 'van_dung_cao', label: 'Vận dụng cao', cls: 'bg-purple-100 text-purple-800 border-purple-200' },
]

export function LuyenTapView({ payload, onChange }: { payload: any; onChange: (p: any) => void }) {
  const p = payload || {}
  const exercises: any[] = Array.isArray(p.exercises) ? p.exercises : []
  const [shown, setShown] = useState<Record<number, boolean>>({})
  const [exportError, setExportError] = useState('')
  const [reviewSource, setReviewSource] = useState<KahootQuestion[] | null>(null)
  const radioGroup = useId()
  const pathname = usePathname()
  let sourceSignature = ''
  try { sourceSignature = JSON.stringify(prepareKahootQuestions(exercises, false)) } catch { /* Invalid originals cannot be exported. */ }

  const exportQuiz = (format: 'csv' | 'xlsx') => {
    setExportError('')
    try {
      const questions = prepareKahootQuestions(exercises, false)
      if (format === 'csv') {
        downloadQuiz(new Blob([toKahootCsv(questions)], { type: 'text/csv;charset=utf-8' }), 'luyen-tap.csv')
      } else {
        setReviewSource(questions)
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Không thể xuất câu hỏi. Vui lòng thử lại.')
    }
  }

  const update = (i: number, patch: Record<string, any>) =>
    onChange({ ...p, exercises: exercises.map((e, j) => (j === i ? { ...e, ...patch } : e)) })

  const counts = LEVELS.map(l => ({ ...l, n: exercises.filter(e => e.level === l.key).length })).filter(l => l.n)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <SectionLabel tone="blue" icon={<ClipboardList className="w-4 h-4" />}>
          Bộ câu hỏi ôn tập ({exercises.length} câu)
        </SectionLabel>
        <div className="flex gap-1.5 flex-wrap">
          {counts.map(c => (
            <span key={c.key} className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${c.cls}`}>
              {c.label}: {c.n}
            </span>
          ))}
        </div>
      </div>

      {exercises.map((ex, i) => {
        const lv = LEVELS.find(l => l.key === ex.level)
        const reveal = !!shown[i]
        return (
          <div
            key={i}
            id={`luyentap-exercise-${i}`}
            className="rounded-xl border-2 border-slate-200 hover:border-blue-300 bg-white p-3.5 space-y-2.5 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-header font-extrabold text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-0.5">
                  Câu {i + 1}
                </span>
                <select
                  value={ex.level || ''}
                  onChange={e => update(i, { level: e.target.value })}
                  className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border outline-none cursor-pointer ${lv?.cls || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                >
                  <option value="">Mức độ…</option>
                  {LEVELS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
                </select>
                {ex.format && (
                  <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{ex.format}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onChange({ ...p, exercises: exercises.filter((_, j) => j !== i) })}
                className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                title="Xóa câu hỏi"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <AutoResizeTextarea
              value={ex.question || ''}
              minRows={2}
              placeholder="Nhập câu hỏi..."
              onChange={v => update(i, { question: v })}
              className={fieldCls + ' font-semibold'}
            />
            {Array.isArray(ex.options) && (
              <div className="space-y-2">
                {ex.options.map((option: string, j: number) => (
                  <label key={j} className="flex items-center gap-2">
                    <input type="radio" name={`${radioGroup}-correct-${i}`} checked={ex.correct_answer === j + 1}
                      aria-label={`Đáp án ${String.fromCharCode(65 + j)} đúng cho câu ${i + 1}`}
                      onChange={() => update(i, { correct_answer: j + 1, answer: ex.options[j] })} />
                    <span className="text-xs font-bold">{String.fromCharCode(65 + j)}.</span>
                    <AutoResizeTextarea value={option} minRows={1} placeholder="Nhập lựa chọn…"
                      onChange={value => update(i, {
                        options: ex.options.map((o: string, k: number) => k === j ? value : o),
                        ...(ex.correct_answer === j + 1 ? { answer: value } : {}),
                      })} className={fieldCls} />
                  </label>
                ))}
                <label className="text-xs text-slate-600 flex items-center gap-2">Thời gian trả lời
                  <select value={ex.time_limit ?? 20} onChange={e => update(i, { time_limit: Number(e.target.value) })}
                    className="border rounded p-1">
                    {[5, 10, 20, 30, 60, 120].map(t => <option key={t} value={t}>{t} giây</option>)}
                  </select>
                </label>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShown(s => ({ ...s, [i]: !s[i] }))}
              className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              {reveal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {reveal ? 'Ẩn đáp án' : 'Xem đáp án / hướng dẫn giải'}
            </button>
            {reveal && !Array.isArray(ex.options) && (
              <AutoResizeTextarea
                value={ex.answer || ''}
                minRows={2}
                placeholder="Nhập đáp án hoặc gợi ý giải..."
                onChange={v => update(i, { answer: v })}
                className={fieldCls + ' bg-emerald-50/60 border-emerald-200 focus:border-emerald-500 text-[13px]'}
              />
            )}
            {reveal && Array.isArray(ex.options) && (
              <div className="rounded-lg bg-emerald-50 p-3 space-y-2 text-sm">
                <p>Đáp án đúng: {ex.correct_answer ? `${String.fromCharCode(64 + ex.correct_answer)}. ${ex.options[ex.correct_answer - 1] || ''}` : 'Chưa chọn'}</p>
                <AutoResizeTextarea value={ex.explanation || ''} minRows={1} placeholder="Giải thích đáp án…"
                  onChange={value => update(i, { explanation: value })} className={fieldCls} />
              </div>
            )}
          </div>
        )
      })}

      <button
        type="button"
        onClick={() => onChange({ ...p, exercises: [...exercises, { question: '', level: 'thong_hieu', answer: '', options: ['', '', '', ''], correct_answer: 1, time_limit: 20 }] })}
        className="w-full py-2 rounded-xl border-2 border-dashed border-slate-300 text-xs font-bold text-slate-500 hover:text-blue-600 hover:border-blue-400 transition-colors flex items-center justify-center gap-1"
      >
        <Plus className="w-3.5 h-3.5" /> Thêm câu hỏi
      </button>
      {!exercises.length && <p className="text-sm text-slate-600">Bài học chưa có câu hỏi luyện tập. Thêm câu hỏi để bắt đầu.</p>}
      <div className="border-t pt-3 space-y-2">
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={!exercises.length} onClick={() => exportQuiz('csv')}
            className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-50">Xuất CSV</button>
          <button type="button" disabled={!exercises.length} onClick={() => exportQuiz('xlsx')}
            className="rounded-lg bg-blue-600 text-white px-3 py-2 text-xs font-bold disabled:opacity-50">
            Xuất Excel cho Kahoot
          </button>
        </div>
        <p className="text-xs text-slate-500">Dùng file Excel để nhập vào Kahoot qua Add question → Import → Import spreadsheet. Câu hỏi tối đa 120 ký tự, lựa chọn tối đa 75 ký tự.</p>
        {exportError && <p role="alert" className="text-sm text-red-600">{exportError}</p>}
        {reviewSource && JSON.stringify(reviewSource) === sourceSignature && (
          <KahootReviewPanel key={sourceSignature} source={reviewSource} saved={p.kahoot_export}
            cacheKey={`edore:kahoot-export:v1:${pathname}`}
            onClose={() => setReviewSource(null)} onSave={draft => onChange({ ...p, kahoot_export: draft })} />
        )}
      </div>
    </div>
  )
}
