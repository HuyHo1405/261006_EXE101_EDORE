'use client'

import React from 'react'
import { Sparkles, MessageSquare, ArrowRight, Tv, CheckCircle2 } from 'lucide-react'
import type { KhoiDongPayload } from '../../types/nodePayload'

interface KhoiDongPayloadBuilderProps {
  payload: KhoiDongPayload
  onChange?: (updated: KhoiDongPayload) => void
  readOnly?: boolean
}

export function KhoiDongPayloadBuilder({
  payload = {},
  onChange,
  readOnly = false,
}: KhoiDongPayloadBuilderProps) {
  const hook = payload.hook || {}
  const expectedResponses = payload.expected_responses || []
  const transitionLine = payload.transition_line || ''

  const handleHookChange = (field: 'question_or_situation' | 'presentation_form', value: string) => {
    if (!onChange) return
    onChange({
      ...payload,
      hook: {
        ...hook,
        [field]: value,
      },
    })
  }

  const handleTransitionChange = (val: string) => {
    if (!onChange) return
    onChange({
      ...payload,
      transition_line: val,
    })
  }

  const handleResponseChange = (idx: number, val: string) => {
    if (!onChange) return
    const updated = [...expectedResponses]
    updated[idx] = val
    onChange({
      ...payload,
      expected_responses: updated,
    })
  }

  return (
    <div className="space-y-4 font-body">
      {/* Header Banner */}
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-[var(--radius-lg)] text-amber-900 shadow-xs">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="font-header text-xs font-extrabold uppercase tracking-wider">
          HOẠT ĐỘNG KHỞI ĐỘNG (WARM-UP HOOK)
        </span>
      </div>

      {/* 1. Hook Card: Tình huống / Câu hỏi mở đầu */}
      <div className="bg-white border-2 border-amber-200 rounded-[var(--radius-xl)] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-amber-100 pb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <h4 className="font-header text-xs font-extrabold uppercase tracking-wide text-amber-950">
              1. Tình huống / Câu hỏi gợi mở (Hook)
            </h4>
          </div>
          {hook.presentation_form && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-[var(--radius-full)] border border-amber-300">
              <Tv className="w-3 h-3 text-amber-700" />
              <span>{hook.presentation_form}</span>
            </div>
          )}
        </div>

        {readOnly ? (
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-body bg-amber-50/50 p-3 rounded-[var(--radius-lg)] border border-amber-100 italic">
            "{hook.question_or_situation || 'Chưa nhập tình huống mở đầu.'}"
          </p>
        ) : (
          <div className="space-y-2">
            <textarea
              value={hook.question_or_situation || ''}
              onChange={(e) => handleHookChange('question_or_situation', e.target.value)}
              placeholder="Nhập tình huống mở đầu hoặc câu hỏi gợi mở..."
              className="w-full h-20 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-[var(--radius-lg)] p-3 outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white resize-none leading-relaxed text-slate-800"
            />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-600 shrink-0">Hình thức trình chiếu:</span>
              <input
                type="text"
                value={hook.presentation_form || ''}
                onChange={(e) => handleHookChange('presentation_form', e.target.value)}
                placeholder="Ví dụ: Giáo viên chiếu tranh ảnh / Lược đồ 8.1..."
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-[var(--radius-md)] px-2.5 py-1 outline-none focus:ring-1 focus:ring-amber-400 focus:bg-white text-slate-800"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Expected Responses: Dự kiến câu trả lời của HS */}
      <div className="bg-white border-2 border-slate-200 rounded-[var(--radius-xl)] p-4 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <h4 className="font-header text-xs font-extrabold uppercase tracking-wide text-slate-900">
            2. Phản hồi dự kiến của Học sinh ({expectedResponses.length})
          </h4>
        </div>

        {expectedResponses.length === 0 ? (
          <p className="text-xs italic text-slate-600">Chưa có gợi ý phản hồi.</p>
        ) : (
          <div className="space-y-2">
            {expectedResponses.map((res, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-[var(--radius-md)] border border-slate-200">
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                  HS {idx + 1}
                </span>
                {readOnly ? (
                  <span className="flex-1 leading-relaxed text-slate-800">{res}</span>
                ) : (
                  <input
                    type="text"
                    value={res}
                    onChange={(e) => handleResponseChange(idx, e.target.value)}
                    className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 outline-none text-xs text-slate-800"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Transition Line: Lời dẫn dắt sang bài mới */}
      {transitionLine && (
        <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-l-4 border-l-amber-500 border border-amber-200 rounded-[var(--radius-lg)] flex items-start gap-3">
          <ArrowRight className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <span className="font-mono text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              LỜI DẪN CHUYỂN BÀI (TRANSITION LINE)
            </span>
            {readOnly ? (
              <p className="text-xs font-semibold text-amber-950 italic leading-relaxed">
                "{transitionLine}"
              </p>
            ) : (
              <input
                type="text"
                value={transitionLine}
                onChange={(e) => handleTransitionChange(e.target.value)}
                className="w-full text-xs font-semibold text-amber-950 bg-transparent border-b border-amber-300 outline-none focus:border-amber-600"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
