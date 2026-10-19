'use client'

import { useState } from 'react'
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
        setNotice('Đã tải Excel và giữ bản Kahoot trên trình duyệt này.')
      } catch {
        setNotice('Đã tải Excel. Trình duyệt không cho lưu bản Kahoot; bản này chỉ được giữ đến khi bạn rời trang.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể xuất Excel. Vui lòng thử lại.')
    } finally { setBusy(false) }
  }

  return (
    <section aria-label="Duyệt bản câu hỏi Kahoot" className="rounded-xl border-2 border-blue-200 bg-blue-50/40 p-4 space-y-4">
      <div className="flex justify-between items-start gap-3">
        <div>
          <h3 className="text-sm font-bold text-blue-900">Bản câu hỏi dành cho Kahoot</h3>
          <p className="text-xs text-slate-600 mt-1">{selected.length} câu được chọn · {longIndices.length} câu vượt giới hạn. Bản gốc và CSV được giữ nguyên.</p>
        </div>
        <button type="button" disabled={busy} onClick={onClose} className="text-xs underline disabled:opacity-50">Đóng</button>
      </div>
      <button type="button" disabled={busy || !longIndices.length} onClick={optimize}
        className="rounded-lg bg-blue-600 text-white px-3 py-2 text-xs font-bold disabled:opacity-50">
        {progress || `AI rút gọn ${longIndices.length} câu dài theo quy tắc Kahoot`}
      </button>
      <p className="text-xs text-slate-600">Đối chiếu bản rút gọn với bản gốc, kiểm tra ý nghĩa và đáp án đúng trước khi tải. Có thể chỉnh sửa hoặc bỏ câu khỏi bản xuất.</p>
      <fieldset disabled={busy} className="space-y-3 disabled:opacity-60">
        {draft.questions.map((q, i) => (
          <div key={i} className={`rounded-lg border bg-white p-3 space-y-2 ${draft.included[i] && exceedsKahootLimits(q) ? 'border-amber-400' : 'border-slate-200'}`}>
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={draft.included[i]} onChange={e => {
                const included = e.target.checked
                setReviewed(false)
                setDraft(d => ({ ...d, included: d.included.map((v, j) => j === i ? included : v) }))
              }} /> Câu {i + 1} — đưa vào Kahoot
            </label>
            {draft.included[i] && <>
              <details className="text-xs text-slate-600">
                <summary className="cursor-pointer">Đối chiếu câu hỏi và đáp án gốc</summary>
                <div className="mt-2 space-y-1"><p>{source[i].question}</p>
                  {source[i].options.map((o, j) => o && <p key={j}>{String.fromCharCode(65 + j)}. {o}</p>)}
                </div>
              </details>
              <label className="block">
                <span className={`text-xs ${q.question.length > 120 ? 'text-red-600 font-bold' : 'text-slate-600'}`}>Câu hỏi: {q.question.length}/120 ký tự</span>
                <AutoResizeTextarea value={q.question} minRows={1} onChange={question => update(i, { question })} className={fieldCls} />
              </label>
              {q.options.map((o, j) => (
                <label key={j} className="block">
                  <span className={`text-xs ${o.length > 75 ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                    {String.fromCharCode(65 + j)}{q.correct_answer === j + 1 ? ' — đáp án đúng' : ''}: {o.length}/75 ký tự
                  </span>
                  <AutoResizeTextarea value={o} minRows={1} onChange={value => update(i, { options: q.options.map((v, k) => k === j ? value : v) })} className={fieldCls} />
                </label>
              ))}
            </>}
          </div>
        ))}
      </fieldset>
      {validationError && <p role="status" className="text-xs text-amber-800">Bản xuất: {validationError}</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {notice && <p role="status" className="text-sm text-emerald-700">{notice}</p>}
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" disabled={busy} checked={reviewed} onChange={e => setReviewed(e.target.checked)} className="mt-1" />
        Tôi đã kiểm tra nội dung rút gọn và xác nhận đáp án đúng vẫn giữ nguyên ý nghĩa.
      </label>
      <button type="button" disabled={busy || !reviewed || !!validationError} onClick={download}
        className="rounded-lg bg-blue-600 text-white px-3 py-2 text-xs font-bold disabled:opacity-50">
        {busy && !progress ? 'Đang xuất…' : 'Tải Excel và giữ bản Kahoot'}
      </button>
      <p className="text-xs text-slate-500">Bản đã duyệt được giữ trên trình duyệt này cho giáo án hiện tại. Nếu sửa bản gốc, bạn cần duyệt lại bản Kahoot.</p>
    </section>
  )
}
