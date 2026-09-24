'use client'

import React, { useState } from 'react'
import { Target, HelpCircle, CheckCircle2, ChevronDown, ChevronRight, Award } from 'lucide-react'
import type { LuyenTapPayload, ExerciseItem } from '../../types/nodePayload'

interface LuyenTapPayloadBuilderProps {
  payload: LuyenTapPayload
  onChange?: (updated: LuyenTapPayload) => void
  readOnly?: boolean
}

export function LuyenTapPayloadBuilder({
  payload = {},
  onChange,
  readOnly = false,
}: LuyenTapPayloadBuilderProps) {
  const exercises: ExerciseItem[] = payload.exercises || []
  const [showAnswerIdx, setShowAnswerIdx] = useState<number | null>(null)

  const handleExerciseChange = (idx: number, field: keyof ExerciseItem, value: string) => {
    if (!onChange) return
    const updated = [...exercises]
    updated[idx] = {
      ...updated[idx],
      [field]: value,
    }
    onChange({
      ...payload,
      exercises: updated,
    })
  }

  const renderLevelBadge = (level?: string) => {
    const l = (level || '').toLowerCase()
    if (l.includes('nhan_biet') || l.includes('nhận biết')) {
      return <span className="font-mono text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-[var(--radius-full)] border border-blue-300">Nhận biết</span>
    }
    if (l.includes('thong_hieu') || l.includes('thông hiểu')) {
      return <span className="font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-[var(--radius-full)] border border-emerald-300">Thông hiểu</span>
    }
    if (l.includes('van_dung_thap') || l.includes('vận dụng thấp')) {
      return <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-[var(--radius-full)] border border-amber-300">Vận dụng thấp</span>
    }
    if (l.includes('van_dung_cao') || l.includes('vận dụng cao')) {
      return <span className="font-mono text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-[var(--radius-full)] border border-purple-300">Vận dụng cao</span>
    }
    return <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-[var(--radius-full)] border border-slate-300">{level || 'Luyện tập'}</span>
  }

  return (
    <div className="space-y-4 font-body">
      {/* Header Banner */}
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-[var(--radius-lg)] text-emerald-900 shadow-xs">
        <Target className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-header text-xs font-extrabold uppercase tracking-wider">
          HOẠT ĐỘNG LUYỆN TẬP ({exercises.length} CÂU HỎI / BÀI TẬP)
        </span>
      </div>

      {/* Exercises List */}
      {exercises.length === 0 ? (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-[var(--radius-xl)] text-xs text-slate-500 italic">
          Chưa có bài tập luyện tập nào.
        </div>
      ) : (
        <div className="space-y-3">
          {exercises.map((ex, idx) => {
            const isShowingAnswer = showAnswerIdx === idx
            return (
              <div
                key={idx}
                className="bg-white border-2 border-emerald-200 rounded-[var(--radius-xl)] p-4 shadow-xs space-y-3 hover:border-emerald-300 transition-all"
              >
                {/* Header row: Question index & Level badge */}
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                      Q{idx + 1}
                    </span>
                    <h4 className="font-header text-xs font-extrabold uppercase text-slate-900">
                      Câu hỏi {idx + 1}
                    </h4>
                  </div>
                  {renderLevelBadge(ex.level)}
                </div>

                {/* Question body */}
                {readOnly ? (
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-body font-semibold">
                    {ex.question || 'Chưa nhập nội dung câu hỏi.'}
                  </p>
                ) : (
                  <textarea
                    value={ex.question || ''}
                    onChange={(e) => handleExerciseChange(idx, 'question', e.target.value)}
                    placeholder="Nhập đề bài câu hỏi..."
                    className="w-full h-16 text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-[var(--radius-lg)] p-2.5 outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white resize-none"
                  />
                )}

                {/* Answer key toggle / section */}
                {ex.answer && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAnswerIdx(isShowingAnswer ? null : idx)}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-[var(--radius-md)] border border-emerald-200 w-fit"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isShowingAnswer ? 'Ẩn đáp án & hướng dẫn' : 'Xem đáp án & hướng dẫn giải'}</span>
                      {isShowingAnswer ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>

                    {isShowingAnswer && (
                      <div className="mt-2.5 p-3 bg-emerald-50/70 border border-emerald-200 rounded-[var(--radius-lg)] text-xs text-emerald-950 font-body leading-relaxed animate-fade-in">
                        <span className="font-mono text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                          ĐÁP ÁN / LỜI GIẢI CHUẨN:
                        </span>
                        {readOnly ? (
                          <p>{ex.answer}</p>
                        ) : (
                          <textarea
                            value={ex.answer || ''}
                            onChange={(e) => handleExerciseChange(idx, 'answer', e.target.value)}
                            className="w-full h-16 text-xs bg-white border border-emerald-200 rounded p-2 outline-none text-emerald-950"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
