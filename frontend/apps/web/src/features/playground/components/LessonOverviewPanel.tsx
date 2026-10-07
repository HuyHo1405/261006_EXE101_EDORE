'use client'

import { useState } from 'react'
import { BookOpen, Sparkles, Check, AlertTriangle } from 'lucide-react'
import type { LessonMeta } from '../types/lessonMeta'
import { MethodLayoutFactory } from './MethodLayoutFactory'

export interface ParsedTeachingTool {
  name: string
  purpose?: string
}

export function parseTeachingTools(
  tools: (string | { name?: string; purpose?: string })[] = []
): ParsedTeachingTool[] {
  return tools.map(t => {
    if (typeof t === 'object' && t !== null) {
      return { name: t.name || '', purpose: t.purpose }
    }
    const str = String(t || '').trim()
    if (str.includes(':')) {
      const [n, ...rest] = str.split(':')
      return { name: n.trim(), purpose: rest.join(':').trim() }
    }
    if (str.includes(' - ')) {
      const [n, ...rest] = str.split(' - ')
      return { name: n.trim(), purpose: rest.join(' - ').trim() }
    }
    return { name: str, purpose: undefined }
  })
}

export function LessonOverviewPanel({
  meta,
  contentSummary = '',
  checkedTools: controlledCheckedTools,
  onToggleTool: controlledToggleTool,
}: {
  meta: LessonMeta
  contentSummary?: string
  checkedTools?: Record<number, boolean>
  onToggleTool?: (idx: number) => void
}) {
  const [internalCheckedTools, setInternalCheckedTools] = useState<Record<number, boolean>>({})

  const checkedTools = controlledCheckedTools ?? internalCheckedTools
  const toggleTool =
    controlledToggleTool ??
    ((idx: number) => {
      setInternalCheckedTools(prev => ({ ...prev, [idx]: !prev[idx] }))
    })

  const {
    lessonNumber,
    lessonTitle,
    chapter,
    learningOutcomes,
    teachingMethods,
    methodDetails,
    teachingTools,
  } = meta

  const hasHeader = Boolean(lessonNumber || lessonTitle || chapter || contentSummary || learningOutcomes.length > 0)

  const heading = [
    lessonNumber ? (/^\d+$/.test(lessonNumber.trim()) ? `Bài ${lessonNumber}` : lessonNumber) : '',
    lessonTitle,
  ]
    .filter(Boolean)
    .join(': ')

  const primaryMethod = methodDetails?.[0]
  const secondaryMethod = methodDetails && methodDetails.length > 1 ? methodDetails[1] : undefined

  const methodTitle =
    primaryMethod?.name ||
    teachingMethods[0] ||
    (methodDetails ? methodDetails.map(m => m.name).join(' & ') : 'Dạy học tích cực')

  const parsedTools = parseTeachingTools(teachingTools)

  const hasMethodSection = Boolean(
    teachingMethods.length > 0 || (methodDetails && methodDetails.length > 0) || parsedTools.length > 0
  )

  return (
    <div className="space-y-6">
      {/* ─── 1. CHƯƠNG & BÀI HỌC + YÊU CẦU CẦN ĐẠT ─── */}
      {hasHeader && (
        <div className="space-y-2">
          {chapter && (
            <h3 className="font-header font-extrabold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--color-primary-600)] shrink-0" />
              <span>{chapter}</span>
            </h3>
          )}

          <div className="p-5 rounded-[var(--radius-lg)] bg-white border border-[var(--color-neutral-200)] shadow-xs space-y-4">
            {/* Tiêu đề bài học & Tóm tắt nội dung */}
            <div className="space-y-2">
              <h2 className="font-header font-extrabold text-xl text-slate-900 leading-snug">
                {heading || 'Nội dung bài học'}
              </h2>

              {contentSummary && (
                <p className="font-body text-sm text-[var(--color-neutral-700)] leading-relaxed italic">
                  {contentSummary}
                </p>
              )}
            </div>

            {/* YÊU CẦU CẦN ĐẠT (MÀU XANH NGỌC - EMERALD RÕ RÀNG ĐỂ TẬP TRUNG KIỂM CHỨNG) */}
            {learningOutcomes.length > 0 && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 space-y-3">
                <h3 className="font-header font-extrabold text-sm uppercase tracking-wider text-emerald-950">
                  Yêu cầu cần đạt (Learning outcomes)
                </h3>

                <ul className="space-y-2.5">
                  {learningOutcomes.map((o, i) => (
                    <li key={i} className="flex gap-2.5 font-body text-sm text-slate-800 leading-relaxed items-start">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Check className="w-3 h-3 text-white stroke-[2.5]" />
                      </span>
                      <span className="font-medium text-slate-900">{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 2. ĐỀ XUẤT PHƯƠNG PHÁP & PHƯƠNG TIỆN DẠY HỌC ─── */}
      {hasMethodSection && (
        <div className="space-y-3">
          {/* Tiêu đề bên ngoài card: Giữ icon */}
          <h3 className="font-header font-extrabold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-primary-600)] shrink-0" />
            <span>Đề xuất phương pháp & phương tiện dạy học</span>
          </h3>

          <div className="space-y-4">
            {/* KHỐI 1: PHƯƠNG PHÁP DẠY HỌC (MÀU XANH DƯƠNG - BLUE RÕ RÀNG ĐỂ TẬP TRUNG KIỂM CHỨNG) */}
            <div className="p-5 rounded-[var(--radius-lg)] bg-blue-50 border border-blue-200 shadow-xs space-y-4">
              <div className="space-y-1.5 pb-2.5 border-b border-blue-200/80">
                <h4 className="font-header font-extrabold text-sm uppercase tracking-wider text-blue-950">
                  Phương pháp: {methodTitle}
                </h4>
                <p className="font-body text-sm text-slate-800 leading-relaxed">
                  {primaryMethod?.description ||
                    'Phương pháp sư phạm cốt lõi giúp học sinh chủ động nghiên cứu hồ sơ tư liệu, thảo luận nhóm và khái quát hóa bài học dưới sự dẫn dắt của giáo viên.'}
                </p>
              </div>

              {/* Tiến trình các bước hoạt động qua Factory */}
              <MethodLayoutFactory
                methodDetail={primaryMethod}
                secondaryMethod={secondaryMethod}
                fallbackMethods={teachingMethods}
              />
            </div>

            {/* KHỐI 2: PHƯƠNG TIỆN & HỌC LIỆU (MÀU VÀNG HỔ PHÁCH - AMBER RÕ RÀNG ĐỂ TẬP TRUNG KIỂM CHỨNG) */}
            {parsedTools.length > 0 && (
              <div
                id="teaching-tools-section"
                className="p-5 rounded-[var(--radius-lg)] bg-amber-50 border border-amber-200 shadow-xs space-y-3 scroll-mt-6"
              >
                <h4 className="font-header font-extrabold text-sm uppercase tracking-wider text-amber-950">
                  Phương tiện & học liệu cần chuẩn bị
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {parsedTools.map((tool, idx) => {
                    const isDone = Boolean(checkedTools[idx])
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleTool(idx)}
                        className={`p-3 rounded-lg border transition-all flex items-start gap-2.5 cursor-pointer select-none ${
                          isDone
                            ? 'bg-amber-100/50 border-amber-300/60 opacity-60'
                            : 'bg-white border-amber-200/90 hover:border-amber-400 hover:shadow-2xs'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border transition-all flex items-center justify-center shrink-0 mt-0.5 ${
                            isDone
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'bg-white border-slate-400'
                          }`}
                        >
                          {isDone && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <strong
                            className={`font-bold text-xs block leading-snug break-words ${
                              isDone ? 'text-slate-400 line-through' : 'text-slate-900'
                            }`}
                          >
                            {tool.name}
                          </strong>
                          {tool.purpose && (
                            <p
                              className={`text-[11px] leading-snug break-words transition-colors ${
                                isDone ? 'text-slate-400' : 'text-slate-600'
                              }`}
                            >
                              {tool.purpose}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
