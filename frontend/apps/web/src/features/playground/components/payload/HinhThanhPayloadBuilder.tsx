'use client'

import React, { useState } from 'react'
import { BookOpen, Layers, HelpCircle, CheckCircle, ChevronDown, ChevronRight, Mic } from 'lucide-react'
import type { HinhThanhKienThucPayload, KnowledgeUnit } from '../../types/nodePayload'

interface HinhThanhPayloadBuilderProps {
  payload: HinhThanhKienThucPayload
  onChange?: (updated: HinhThanhKienThucPayload) => void
  readOnly?: boolean
}

export function HinhThanhPayloadBuilder({
  payload = {},
  onChange,
  readOnly = false,
}: HinhThanhPayloadBuilderProps) {
  const units: KnowledgeUnit[] = payload.knowledge_units || []
  const synthesis = payload.synthesis || ''

  const [expandedUnitIdx, setExpandedUnitIdx] = useState<number | null>(0)

  const handleUnitChange = (idx: number, field: keyof KnowledgeUnit, value: string) => {
    if (!onChange) return
    const updatedUnits = [...units]
    updatedUnits[idx] = {
      ...updatedUnits[idx],
      [field]: value,
    }
    onChange({
      ...payload,
      knowledge_units: updatedUnits,
    })
  }

  const handleSynthesisChange = (val: string) => {
    if (!onChange) return
    onChange({
      ...payload,
      synthesis: val,
    })
  }

  return (
    <div className="space-y-4 font-body">
      {/* Header Banner */}
      <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-[var(--radius-lg)] text-indigo-900 shadow-xs">
        <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
        <span className="font-header text-xs font-extrabold uppercase tracking-wider">
          HÌNH THÀNH KIẾN THỨC MỚI ({units.length} ĐỀ MỤC)
        </span>
      </div>

      {/* 1. Knowledge Units List */}
      {units.length === 0 ? (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-[var(--radius-xl)] text-xs text-slate-500 italic">
          Chưa có đơn vị kiến thức nào.
        </div>
      ) : (
        <div className="space-y-3">
          {units.map((unit, idx) => {
            const isExpanded = expandedUnitIdx === idx
            return (
              <div
                key={idx}
                className={`border-2 rounded-[var(--radius-xl)] overflow-hidden transition-all duration-200 bg-white ${
                  isExpanded
                    ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-sm'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setExpandedUnitIdx(isExpanded ? null : idx)}
                  className="px-4 py-3 bg-slate-50 hover:bg-indigo-50/60 cursor-pointer flex items-center justify-between gap-3 select-none border-b border-slate-100"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-200">
                      {idx + 1}
                    </span>
                    <h4 className="font-header text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {unit.unit_title || `Đề mục ${idx + 1}`}
                    </h4>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-indigo-600 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="p-4 space-y-4 animate-fade-in bg-white">
                    {/* Title editor */}
                    {!readOnly && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Tên đề mục:</label>
                        <input
                          type="text"
                          value={unit.unit_title || ''}
                          onChange={(e) => handleUnitChange(idx, 'unit_title', e.target.value)}
                          className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-[var(--radius-md)] px-3 py-1.5 outline-none focus:ring-1 focus:ring-indigo-400 text-slate-900"
                        />
                      </div>
                    )}

                    {/* Core Content */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-indigo-900">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                          Nội dung kiến thức cốt lõi (Markdown)
                        </span>
                      </div>
                      {readOnly ? (
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[var(--radius-lg)] text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-body">
                          {unit.core_content || 'Chưa có nội dung.'}
                        </div>
                      ) : (
                        <textarea
                          value={unit.core_content || ''}
                          onChange={(e) => handleUnitChange(idx, 'core_content', e.target.value)}
                          placeholder="Nhập nội dung giảng dạy cốt lõi (Markdown supported)..."
                          className="w-full h-28 text-xs font-mono bg-slate-50 border border-slate-200 rounded-[var(--radius-lg)] p-3 outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white resize-y text-slate-800 leading-relaxed"
                        />
                      )}
                    </div>

                    {/* Teacher Delivery */}
                    {unit.teacher_delivery && (
                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-[var(--radius-lg)] space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-900">
                          <Mic className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                            Lời giảng / Thao tác Giáo viên
                          </span>
                        </div>
                        {readOnly ? (
                          <p className="text-xs text-amber-950 italic leading-relaxed">
                            "{unit.teacher_delivery}"
                          </p>
                        ) : (
                          <textarea
                            value={unit.teacher_delivery || ''}
                            onChange={(e) => handleUnitChange(idx, 'teacher_delivery', e.target.value)}
                            className="w-full h-16 text-xs bg-white border border-amber-200 rounded p-2 outline-none text-amber-950 italic"
                          />
                        )}
                      </div>
                    )}

                    {/* Checkpoint Question */}
                    {unit.checkpoint_question && (
                      <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-[var(--radius-lg)] space-y-1">
                        <div className="flex items-center gap-1.5 text-sky-900">
                          <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                            Câu hỏi kiểm tra nhanh (Checkpoint Question)
                          </span>
                        </div>
                        {readOnly ? (
                          <p className="text-xs font-semibold text-sky-950 leading-relaxed">
                            ❓ {unit.checkpoint_question}
                          </p>
                        ) : (
                          <input
                            type="text"
                            value={unit.checkpoint_question || ''}
                            onChange={(e) => handleUnitChange(idx, 'checkpoint_question', e.target.value)}
                            className="w-full text-xs font-semibold text-sky-950 bg-white border border-sky-200 rounded p-2 outline-none"
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

      {/* 2. Lesson Synthesis */}
      {synthesis && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-[var(--radius-xl)] space-y-2">
          <div className="flex items-center gap-2 text-indigo-950">
            <CheckCircle className="w-4 h-4 text-indigo-600" />
            <h4 className="font-header text-xs font-extrabold uppercase tracking-wide">
              Tổng kết & Chốt kiến thức bài học
            </h4>
          </div>
          {readOnly ? (
            <p className="text-xs text-indigo-900 leading-relaxed font-body">
              {synthesis}
            </p>
          ) : (
            <textarea
              value={synthesis}
              onChange={(e) => handleSynthesisChange(e.target.value)}
              className="w-full h-20 text-xs bg-white border border-indigo-200 rounded-[var(--radius-lg)] p-2.5 outline-none text-indigo-950 leading-relaxed"
            />
          )}
        </div>
      )}
    </div>
  )
}
