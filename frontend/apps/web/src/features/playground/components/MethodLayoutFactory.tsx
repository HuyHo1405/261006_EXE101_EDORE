'use client'

import React from 'react'
import type { TeachingMethodDetail, ActivityMethodType } from '../types/lessonMeta'

/**
 * Tự động phân loại phương pháp / kĩ thuật dạy học dựa trên từ khóa tiếng Việt / chuẩn sư phạm.
 */
export function detectMethodType(
  name?: string,
  explicitType?: ActivityMethodType,
): ActivityMethodType {
  if (explicitType) return explicitType
  const s = (name || '').toLowerCase()
  if (s.includes('trạm') || s.includes('station')) return 'STATION_ROTATION'
  if (
    s.includes('khám phá') ||
    s.includes('vấn đề') ||
    s.includes('inquiry') ||
    s.includes('5e') ||
    s.includes('nặn bột')
  ) {
    return 'INQUIRY_BASED'
  }
  if (
    s.includes('mảnh ghép') ||
    s.includes('chuyên gia') ||
    s.includes('jigsaw') ||
    s.includes('khăn trải bàn')
  ) {
    return 'JIGSAW_GROUP'
  }
  if (
    s.includes('đóng vai') ||
    s.includes('tình huống') ||
    s.includes('mô phỏng') ||
    s.includes('roleplay')
  ) {
    return 'ROLEPLAY'
  }
  if (s.includes('dự án') || s.includes('project')) return 'PROJECT_BASED'
  return 'GENERAL_FLOW'
}

export interface ParsedActivityStep {
  tag: string
  title: string
  desc: string
}

/**
 * Tách chuỗi bước hoạt động thành tag, tiêu đề và nội dung chi tiết.
 * Hỗ trợ các định dạng:
 * - "Trạm 1 (Khái niệm): Mô tả..." -> tag: "Trạm 1", title: "Khái niệm", desc: "Mô tả..."
 * - "Bước 1: Nêu vấn đề..." -> tag: "Bước 1", title: "", desc: "Nêu vấn đề..."
 * - "Giai đoạn 1 (Lập kế hoạch): ..." -> tag: "GĐ 1", title: "Lập kế hoạch", desc: "..."
 */
export function parseActivityStep(rawStep: string, defaultIdx: number): ParsedActivityStep {
  const step = rawStep.trim()
  if (!step) {
    return { tag: `Bước ${defaultIdx + 1}`, title: '', desc: '' }
  }

  // Khớp định dạng: "Tên tiền tố (Tiêu đề con): Nội dung"
  const matchWithParen = step.match(/^([^(:]+)\s*\(([^)]+)\)\s*:\s*(.+)$/)
  if (matchWithParen) {
    return {
      tag: matchWithParen[1].trim(),
      title: matchWithParen[2].trim(),
      desc: matchWithParen[3].trim(),
    }
  }

  // Khớp định dạng: "Tiêu đề: Nội dung"
  if (step.includes(':')) {
    const colonIdx = step.indexOf(':')
    const tagOrTitle = step.slice(0, colonIdx).trim()
    const desc = step.slice(colonIdx + 1).trim()
    return {
      tag: tagOrTitle,
      title: '',
      desc,
    }
  }

  return {
    tag: `Bước ${defaultIdx + 1}`,
    title: '',
    desc: step,
  }
}

// ─── 1. RENDERER CHO DẠY HỌC THEO TRẠM (STATION ROTATION) ───────────────────
function StationRotationView({
  steps,
  secondaryMethod,
}: {
  steps: ParsedActivityStep[]
  secondaryMethod?: TeachingMethodDetail
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1.5 border-b border-blue-200/70">
        <span className="font-header font-bold text-xs uppercase tracking-wider text-blue-950">
          Tiến trình các trạm học tập
        </span>
        <span className="text-xs text-blue-800 font-medium">
          Luân chuyển 5 - 7 phút / trạm
        </span>
      </div>

      {/* Grid các trạm độc lập */}
      <div
        className={`grid ${
          steps.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : steps.length === 1
              ? 'grid-cols-1'
              : 'grid-cols-1 md:grid-cols-3'
        } gap-2.5`}
      >
        {steps.map((st, i) => (
          <div
            key={i}
            className="bg-white p-3.5 rounded-lg border border-blue-200/80 shadow-2xs space-y-1.5 flex flex-col justify-between hover:border-blue-400 transition-colors"
          >
            <span className="font-header font-bold text-xs uppercase tracking-wide text-blue-900">
              {st.tag}{st.title ? ` • ${st.title}` : ''}
            </span>
            <p className="font-body text-xs text-slate-700 leading-relaxed">
              {st.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Khâu tổng kết / Sơ đồ tư duy */}
      {secondaryMethod && (
        <div className="bg-white/90 p-3 rounded-lg border border-blue-200/80 flex items-start gap-2 text-xs text-slate-700">
          <strong className="font-bold text-blue-950 shrink-0">
            {secondaryMethod.name}:
          </strong>
          <span className="leading-relaxed">
            {secondaryMethod.description}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── 2. RENDERER CHO DẠY HỌC KHÁM PHÁ / GIẢI QUYẾT VẤN ĐỀ (INQUIRY / 5E) ───
function InquiryWorkflowView({
  steps,
  secondaryMethod,
}: {
  steps: ParsedActivityStep[]
  secondaryMethod?: TeachingMethodDetail
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1.5 border-b border-blue-200/70">
        <span className="font-header font-bold text-xs uppercase tracking-wider text-blue-950">
          Tiến trình khám phá & giải quyết vấn đề
        </span>
        <span className="text-xs text-blue-800 font-medium">
          {steps.length} giai đoạn khoa học
        </span>
      </div>

      <div
        className={`grid ${
          steps.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : steps.length === 3
              ? 'grid-cols-1 md:grid-cols-3'
              : steps.length === 1
                ? 'grid-cols-1'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        } gap-2.5`}
      >
        {steps.map((st, i) => (
          <div
            key={i}
            className="bg-white p-3.5 rounded-lg border border-blue-200/80 shadow-2xs space-y-1"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="font-header font-bold text-xs uppercase text-blue-950 truncate">
                {st.title || st.tag}
              </span>
            </div>
            <p className="font-body text-xs text-slate-700 leading-relaxed pt-0.5">
              {st.desc}
            </p>
          </div>
        ))}
      </div>

      {secondaryMethod && (
        <div className="bg-white/90 p-3 rounded-lg border border-blue-200/80 text-xs text-slate-700 flex items-start gap-2">
          <strong className="font-bold text-blue-950 shrink-0">{secondaryMethod.name}:</strong>
          <span className="leading-relaxed">{secondaryMethod.description}</span>
        </div>
      )}
    </div>
  )
}

// ─── 3. RENDERER CHO MẢNH GHÉP / THẢO LUẬN NHÓM (JIGSAW / KHĂN TRẢI BÀN) ────
function JigsawWorkflowView({
  steps,
  secondaryMethod,
}: {
  steps: ParsedActivityStep[]
  secondaryMethod?: TeachingMethodDetail
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1.5 border-b border-blue-200/70">
        <span className="font-header font-bold text-xs uppercase tracking-wider text-blue-950">
          Quy trình thảo luận tương tác (Kĩ thuật Mảnh ghép)
        </span>
        <span className="text-xs text-blue-800 font-medium">
          2 vòng hoạt động
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {steps.map((st, i) => (
          <div key={i} className="bg-white p-3.5 rounded-lg border border-blue-200/80 shadow-2xs space-y-1.5">
            <span className="font-header font-bold text-xs uppercase tracking-wide text-blue-900 block">
              {st.tag}{st.title ? ` • ${st.title}` : ''}
            </span>
            <p className="font-body text-xs text-slate-700 leading-relaxed">
              {st.desc}
            </p>
          </div>
        ))}
      </div>

      {secondaryMethod && (
        <div className="bg-white/90 p-3 rounded-lg border border-blue-200/80 text-xs text-slate-700 flex items-start gap-2">
          <strong className="font-bold text-blue-950 shrink-0">{secondaryMethod.name}:</strong>
          <span className="leading-relaxed">{secondaryMethod.description}</span>
        </div>
      )}
    </div>
  )
}

// ─── 4. RENDERER TIẾN TRÌNH TỔNG QUÁT (GENERAL WORKFLOW FALLBACK) ────────────
function GeneralWorkflowView({
  steps,
  secondaryMethod,
}: {
  steps: ParsedActivityStep[]
  secondaryMethod?: TeachingMethodDetail
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1.5 border-b border-blue-200/70">
        <span className="font-header font-bold text-xs uppercase tracking-wider text-blue-950">
          Tiến trình các bước hoạt động
        </span>
        <span className="text-xs text-blue-800 font-medium">
          {steps.length} bước triển khai
        </span>
      </div>

      <div
        className={`grid ${
          steps.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : steps.length === 1
              ? 'grid-cols-1'
              : steps.length === 4
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
        } gap-2.5`}
      >
        {steps.map((st, i) => (
          <div key={i} className="bg-white p-3.5 rounded-lg border border-blue-200/80 shadow-2xs space-y-1">
            <span className="font-header font-bold text-xs uppercase tracking-wide text-blue-900 block">
              {st.tag}{st.title ? ` • ${st.title}` : ''}
            </span>
            <p className="font-body text-xs text-slate-700 leading-relaxed">
              {st.desc}
            </p>
          </div>
        ))}
      </div>

      {secondaryMethod && (
        <div className="bg-white/90 p-3 rounded-lg border border-blue-200/80 text-xs text-slate-700 flex items-start gap-2">
          <strong className="font-bold text-blue-950 shrink-0">{secondaryMethod.name}:</strong>
          <span className="leading-relaxed">{secondaryMethod.description}</span>
        </div>
      )}
    </div>
  )
}

// ─── 5. FACTORY CONTAINER: TỰ ĐỘNG CHỌN LAYOUT STRATEGY PHÙ HỢP ────────────
export interface MethodLayoutFactoryProps {
  methodDetail?: TeachingMethodDetail
  secondaryMethod?: TeachingMethodDetail
  fallbackMethods?: string[]
}

export function MethodLayoutFactory({
  methodDetail,
  secondaryMethod,
  fallbackMethods = [],
}: MethodLayoutFactoryProps) {
  const methodName = methodDetail?.name || fallbackMethods[0] || ''
  const methodType = detectMethodType(methodName, methodDetail?.type)

  const rawSteps = methodDetail?.steps || []
  const parsedSteps = rawSteps.map((st, idx) => parseActivityStep(st, idx))

  if (parsedSteps.length === 0) {
    return null
  }

  switch (methodType) {
    case 'STATION_ROTATION':
      return <StationRotationView steps={parsedSteps} secondaryMethod={secondaryMethod} />

    case 'INQUIRY_BASED':
      return <InquiryWorkflowView steps={parsedSteps} secondaryMethod={secondaryMethod} />

    case 'JIGSAW_GROUP':
      return <JigsawWorkflowView steps={parsedSteps} secondaryMethod={secondaryMethod} />

    case 'ROLEPLAY':
    case 'PROJECT_BASED':
    case 'GENERAL_FLOW':
    default:
      return <GeneralWorkflowView steps={parsedSteps} secondaryMethod={secondaryMethod} />
  }
}
