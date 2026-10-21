'use client'

import { useState, useEffect } from 'react'
import { X, Wand2, Download, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { apiClient } from '@/lib/fetcher'
import { AutoResizeTextarea } from '../StepEnrichmentRender'
import { fieldCls } from './Shared'
import {
  applyKahootSuggestions, downloadQuiz, exceedsKahootLimits, prepareKahootQuestions, restoreKahootDraft,
  type KahootDraft, type KahootQuestion,
} from '../../../utils/kahootExport'

export function KahootReviewPanel({ source, saved, cacheKey, onSave, onClose }: {
  source: KahootQuestion[]
  saved?: KahootDraft
  cacheKey: string
  onSave: (draft: KahootDraft) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(() => {
    let cached: KahootDraft | undefined
    try {
      if (typeof window !== 'undefined') cached = JSON.parse(localStorage.getItem(cacheKey) || 'null') ?? undefined
    } catch { /* Storage may be unavailable or contain an obsolete draft. */ }
    return restoreKahootDraft(source, saved?.sourceSignature === JSON.stringify(source) ? saved : cached)
  })
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reviewed, setReviewed] = useState(false)
  const selected = draft.questions.filter((_, i) => draft.included[i])
  const longIndices = draft.questions.flatMap((q, i) => draft.included[i] && exceedsKahootLimits(q) ? [i] : [])
  let validationError = ''
  try { prepareKahootQuestions(selected) } catch (e) { validationError = (e as Error).message }

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [busy, onClose])

  const update = (i: number, patch: Partial<KahootQuestion>) => {
    setReviewed(false)
    setDraft(d => ({ ...d, questions: d.questions.map((q, j) => i === j ? { ...q, ...patch } : q) }))
  }

  const optimize = async () => {
    setBusy(true)
    setError('')
    setReviewed(false)
    let working = draft.questions
    try {
      for (let offset = 0; offset < longIndices.length; offset += 5) {
        const indices = longIndices.slice(offset, offset + 5)
        setProgress(`Đang rút gọn ${Math.min(offset + 5, longIndices.length)}/${longIndices.length} câu…`)
        const response = await apiClient<KahootQuestion[]>('/api/v1/lessons/questions/optimize-kahoot', {
          method: 'POST', body: JSON.stringify({ questions: indices.map(i => working[i]) }),
        })
        working = applyKahootSuggestions(working, indices, response.result!)
        setDraft(d => ({ ...d, questions: working }))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể rút gọn. Bạn có thể sửa thủ công hoặc thử lại.')
    } finally {
      setBusy(false)
      setProgress('')
    }
  }

  const download = async () => {
    setBusy(true)
    setError('')
    try {
      const questions = prepareKahootQuestions(selected)
      const response = await apiClient<{ base64: string }>('/api/v1/lessons/questions/export-kahoot', {
        method: 'POST', body: JSON.stringify({ questions }),
      })
      const bytes = Uint8Array.from(atob(response.result!.base64), c => c.charCodeAt(0))
      downloadQuiz(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'kahoot-luyen-tap.xlsx')
      onSave(draft)
      try {
        localStorage.setItem(cacheKey, JSON.stringify(draft))
        setNotice('Đã tải Excel và lưu bản Kahoot trên trình duyệt này.')
      } catch {
        setNotice('Đã tải Excel. Trình duyệt không cho lưu bản Kahoot; bản này chỉ được giữ đến khi bạn rời trang.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể xuất Excel. Vui lòng thử lại.')
    } finally { setBusy(false) }
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-4xl border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md font-extrabold text-lg select-none">
              K!
            </div>
            <div>
              <h3 className="font-header text-base font-extrabold text-blue-950">
                Bản câu hỏi dành cho Kahoot
              </h3>
              <p className="font-body text-xs text-slate-600">
                {selected.length} câu được chọn · {longIndices.length > 0 ? (
                  <span className="text-amber-600 font-semibold">{longIndices.length} câu vượt giới hạn ký tự</span>
                ) : (
                  <span className="text-emerald-600 font-semibold">Tất cả câu hỏi đạt chuẩn ký tự</span>
                )}
                {' · Bản gốc bài học được giữ nguyên'}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {longIndices.length > 0 && (
            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
              <div className="text-xs text-blue-900">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  Có {longIndices.length} câu dài hơn quy định của Kahoot (120 ký tự câu hỏi / 75 ký tự đáp án).
                </p>
                <p className="text-blue-700 text-[11px] mt-0.5 pl-5.5">
                  AI có thể tự động rút gọn súc tích mà vẫn giữ nguyên vị trí và ý nghĩa của đáp án đúng.
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={optimize}
                className="shrink-0 flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-bold disabled:opacity-50 shadow-xs cursor-pointer transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" />
                {progress || `AI rút gọn (${longIndices.length} câu)`}
              </button>
            </div>
          )}

          <fieldset disabled={busy} className="space-y-3.5 disabled:opacity-60">
            {draft.questions.map((q, i) => {
              const isOverLimit = draft.included[i] && exceedsKahootLimits(q)
              return (
                <div
                  key={i}
                  className={`rounded-xl border-2 p-4 space-y-3 transition-all ${
                    !draft.included[i]
                      ? 'bg-slate-50/60 border-slate-200 opacity-60'
                      : isOverLimit
                      ? 'bg-amber-50/30 border-amber-300 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.included[i]}
                        onChange={e => {
                          const included = e.target.checked
                          setReviewed(false)
                          setDraft(d => ({ ...d, included: d.included.map((v, j) => j === i ? included : v) }))
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Câu {i + 1} — đưa vào Kahoot</span>
                    </label>
                    {isOverLimit && (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                        Vượt giới hạn ký tự
                      </span>
                    )}
                  </div>

                  {draft.included[i] && (
                    <>
                      <details className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                        <summary className="cursor-pointer font-semibold text-slate-700 hover:text-blue-700 select-none">
                          Đối chiếu câu hỏi và đáp án gốc
                        </summary>
                        <div className="mt-2 space-y-1 pl-2 border-l-2 border-slate-300 font-sans">
                          <p className="font-medium text-slate-900">{source[i].question}</p>
                          {source[i].options.map((o, j) => o && (
                            <p key={j} className={source[i].correct_answer === j + 1 ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
                              {String.fromCharCode(65 + j)}. {o} {source[i].correct_answer === j + 1 ? '✓ (Đáp án đúng gốc)' : ''}
                            </p>
                          ))}
                        </div>
                      </details>

                      <label className="block space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700">Câu hỏi:</span>
                          <span className={`font-mono text-[11px] font-bold ${q.question.length > 120 ? 'text-red-600' : 'text-slate-500'}`}>
                            {q.question.length}/120 ký tự
                          </span>
                        </div>
                        <AutoResizeTextarea
                          value={q.question}
                          minRows={1}
                          onChange={question => update(i, { question })}
                          className={fieldCls + (q.question.length > 120 ? ' border-red-400 focus:border-red-500' : '')}
                        />
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {q.options.map((o, j) => {
                          const isCorrect = q.correct_answer === j + 1
                          const isOptionOver = o.length > 75
                          return (
                            <label key={j} className="block space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className={`font-bold flex items-center gap-1 ${isCorrect ? 'text-emerald-700' : 'text-slate-700'}`}>
                                  <span>{String.fromCharCode(65 + j)}.</span>
                                  {isCorrect && (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                                      Đáp án đúng
                                    </span>
                                  )}
                                </span>
                                <span className={`font-mono text-[11px] font-bold ${isOptionOver ? 'text-red-600' : 'text-slate-500'}`}>
                                  {o.length}/75
                                </span>
                              </div>
                              <AutoResizeTextarea
                                value={o}
                                minRows={1}
                                onChange={value => update(i, { options: q.options.map((v, k) => k === j ? value : v) })}
                                className={fieldCls + (isCorrect ? ' bg-emerald-50/40 border-emerald-300' : '') + (isOptionOver ? ' border-red-400' : '')}
                              />
                            </label>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </fieldset>

          {validationError && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900">
              <span className="font-bold">Lưu ý bản xuất:</span> {validationError}
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-700">
              {error}
            </div>
          )}
          {notice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notice}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              disabled={busy}
              checked={reviewed}
              onChange={e => setReviewed(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Tôi đã kiểm tra nội dung rút gọn và xác nhận đáp án đúng vẫn giữ nguyên ý nghĩa.</span>
          </label>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={busy || !reviewed || !!validationError}
              onClick={download}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{busy && !progress ? 'Đang xuất…' : 'Tải Excel và giữ bản Kahoot'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
