'use client'

import React from 'react'
import {
  Sparkles, Compass, Presentation, Quote, ArrowRight, ChevronLeft, ChevronRight,
  Gamepad2, Zap, ArrowDown, ClipboardList, Award, MessageCircle, Target, PackageCheck
} from 'lucide-react'
import type { TimelineStep } from '@/lib/services/pipelineService'
import { MaterialList } from '../payload/NodeViews'

interface TimelineDetailSidebarProps {
  currentStep: TimelineStep
  activeIdx: number
  totalSteps: number
  activeUnitIdx: number | null
  focusedSectionId: string | null
  onNavigateToHinhThanh: (uIdx: number, stepNum?: number) => void
  onNavigateToNode: (idx: number) => void
  onFocusAndScrollTo: (elementId: string) => void
  parsedMaterials: any[]
  subSteps?: Array<{ label: string; title: string }>
}

export function TimelineDetailSidebar({
  currentStep: cur,
  activeIdx,
  totalSteps,
  activeUnitIdx,
  focusedSectionId,
  onNavigateToHinhThanh,
  onNavigateToNode,
  onFocusAndScrollTo: focusAndScrollTo,
  parsedMaterials,
  subSteps = [],
}: TimelineDetailSidebarProps) {
  const knowledgeUnits: any[] = Array.isArray(cur.nodePayload?.knowledge_units)
    ? cur.nodePayload.knowledge_units
    : []

  return (
    <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4 sticky top-6 self-start">
      <div className="bg-[var(--color-neutral-200)] border border-[var(--color-neutral-300)] p-4 sm:p-5 rounded-[var(--radius-xl)] shadow-sm flex flex-col gap-3">

        {/* Header: Solid Brand Blue Banner at top */}
        <div className="bg-[var(--color-primary-500)] text-white p-3.5 rounded-[var(--radius-lg)] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-primary-100)]" />
            <span className="font-header text-xs font-bold uppercase tracking-wider">
              {cur.type === 'Khởi động' ? 'CHIẾN LƯỢC KHỞI ĐỘNG' : 'GỢI Ý HOẠT ĐỘNG'}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 font-bold backdrop-blur-xs">
            {cur.duration || "05'"}
          </span>
        </div>

        {/* Card 1: MENU ĐIỀU HƯỚNG TIẾN TRÌNH */}
        <div className="bg-white border-[3px] border-[var(--color-primary-500)] p-3.5 rounded-[var(--radius-lg)] shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-[var(--color-neutral-200)] pb-1.5">
            <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary-700)] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[var(--color-primary-600)]" />
              Điều hướng tiến trình
            </label>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-primary-50)] text-[var(--color-primary-700)] border border-[var(--color-primary-200)]">
              {knowledgeUnits.length > 0
                ? `Trang ${(activeUnitIdx ?? 0) + 1}/${knowledgeUnits.length}`
                : (cur.type || 'Tiến trình')}
            </span>
          </div>

          {/* 1. Nếu là Hình thành kiến thức: CHỈ HIỂN THỊ 1 TRANG ĐANG CHỌN */}
          {knowledgeUnits.length > 0 && (() => {
            const curUIdx = activeUnitIdx ?? 0
            const currentUnit = knowledgeUnits[curUIdx] || knowledgeUnits[0] || {}
            return (
              <div className="space-y-2 pt-0.5">
                {/* Card lớn (Đơn vị kiến thức hiện tại) */}
                <button
                  type="button"
                  onClick={() => onNavigateToHinhThanh(curUIdx)}
                  title="Nhấn để cuộn đến đầu đơn vị kiến thức này"
                  className="text-left w-full group flex items-center justify-between px-2.5 py-2 text-xs transition-all rounded-[var(--radius-md)] cursor-pointer border bg-[var(--color-primary-50)] text-[var(--color-primary-900)] font-bold border-[var(--color-primary-300)] shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center font-bold shrink-0 bg-[var(--color-primary-600)] text-white">
                      {curUIdx + 1}
                    </span>
                    <span className="truncate font-body font-bold">
                      {currentUnit.unit_title || `Đơn vị kiến thức ${curUIdx + 1}`}
                    </span>
                  </div>
                </button>

                {/* 3 Thẻ con (Small cards) của trang hiện tại */}
                <div className="ml-3 pl-2.5 border-l-2 border-[var(--color-primary-200)] space-y-1.5 py-1 animate-in fade-in duration-200">
                  <button
                    type="button"
                    onClick={() => onNavigateToHinhThanh(curUIdx, 1)}
                    className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                      focusedSectionId === `unit-${curUIdx}-step-1`
                        ? 'bg-indigo-100 text-indigo-900 font-bold ring-1 ring-indigo-300 shadow-2xs'
                        : 'text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-800'
                    }`}
                  >
                    <Presentation className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate flex-1 font-medium">Bước 1: Trực quan &amp; Ngữ liệu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateToHinhThanh(curUIdx, 2)}
                    className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                      focusedSectionId === `unit-${curUIdx}-step-2`
                        ? 'bg-amber-100 text-amber-900 font-bold ring-1 ring-amber-300 shadow-2xs'
                        : 'text-slate-700 hover:bg-amber-50/70 hover:text-amber-800'
                    }`}
                  >
                    <Quote className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate flex-1 font-medium">Bước 2: Hỏi cả lớp (Vấn đáp tư duy)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateToHinhThanh(curUIdx, 3)}
                    className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                      focusedSectionId === `unit-${curUIdx}-step-3`
                        ? 'bg-emerald-100 text-emerald-900 font-bold ring-1 ring-emerald-300 shadow-2xs'
                        : 'text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-800'
                    }`}
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate flex-1 font-medium">Bước 3: Giảng giải &amp; Chuẩn hóa vào vở</span>
                  </button>
                </div>

              </div>
            )
          })()}

          {/* 2. Nếu là Khởi động */}
          {knowledgeUnits.length === 0 && cur.type === 'Khởi động' && (
            <div className="space-y-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => focusAndScrollTo('khoidong-card')}
                className={`text-left w-full group flex items-center justify-between px-2.5 py-2 text-xs rounded-[var(--radius-md)] cursor-pointer font-bold border transition-all ${
                  focusedSectionId === 'khoidong-card'
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-900)] border-[var(--color-primary-300)]'
                    : 'bg-white text-[var(--color-neutral-800)] border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center font-bold bg-[var(--color-primary-600)] text-white">
                    1
                  </span>
                  <span className="truncate font-body">Tiến trình Khởi động (3 bước)</span>
                </div>
              </button>

              <div className="ml-3 pl-2.5 border-l-2 border-[var(--color-primary-200)] space-y-1 py-1">
                <button
                  type="button"
                  onClick={() => focusAndScrollTo('khoidong-step-1')}
                  className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-all cursor-pointer ${
                    focusedSectionId === 'khoidong-step-1'
                      ? 'bg-indigo-100 text-indigo-900 font-bold ring-1 ring-indigo-300 shadow-2xs'
                      : 'text-slate-600 hover:bg-indigo-50/60 hover:text-indigo-800'
                  }`}
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">Bước 1: Thao tác GV &amp; Luật chơi</span>
                </button>

                <button
                  type="button"
                  onClick={() => focusAndScrollTo('khoidong-step-2')}
                  className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-all cursor-pointer ${
                    focusedSectionId === 'khoidong-step-2'
                      ? 'bg-indigo-100 text-indigo-900 font-bold ring-1 ring-indigo-300 shadow-2xs'
                      : 'text-slate-600 hover:bg-indigo-50/60 hover:text-indigo-800'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">Bước 2: Phản xạ nhanh &amp; Kết nối</span>
                </button>

                <button
                  type="button"
                  onClick={() => focusAndScrollTo('khoidong-step-3')}
                  className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-all cursor-pointer ${
                    focusedSectionId === 'khoidong-step-3'
                      ? 'bg-emerald-100 text-emerald-900 font-bold ring-1 ring-emerald-300 shadow-2xs'
                      : 'text-slate-600 hover:bg-emerald-50/60 hover:text-emerald-800'
                  }`}
                >
                  <ArrowDown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Bước 3: Chốt nhanh &amp; Dẫn nhập</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Nếu là Luyện tập */}
          {knowledgeUnits.length === 0 && cur.type === 'Luyện tập' && (
            <div className="space-y-1.5 pt-0.5">
              <div className="text-left w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-[var(--radius-md)] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                  <span className="truncate">Hệ thống câu hỏi ôn tập</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                  {(cur.nodePayload?.exercises || []).length} câu
                </span>
              </div>

              <div className="ml-3 pl-2.5 border-l-2 border-blue-200 space-y-1 py-1 max-h-48 overflow-y-auto no-scrollbar">
                {(cur.nodePayload?.exercises || []).map((ex: any, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => focusAndScrollTo(`luyentap-exercise-${i}`)}
                    className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-all cursor-pointer ${
                      focusedSectionId === `luyentap-exercise-${i}`
                        ? 'bg-blue-100 text-blue-900 font-bold ring-1 ring-blue-300 shadow-2xs'
                        : 'text-slate-600 hover:bg-blue-50/60 hover:text-blue-800'
                    }`}
                  >
                    <span className="font-mono text-[10px] font-bold px-1 rounded bg-slate-100 text-slate-700 shrink-0">
                      C{i + 1}
                    </span>
                    <span className="truncate flex-1">{ex.question || `Câu hỏi ${i + 1}`}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Nếu là Vận dụng */}
          {knowledgeUnits.length === 0 && cur.type === 'Vận dụng' && (
            <div className="space-y-1.5 pt-0.5">
              <div className="text-left w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-[var(--radius-md)] font-bold bg-purple-50 text-purple-900 border border-purple-200">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="truncate">Nhiệm vụ &amp; Tiêu chí dự án</span>
                </div>
              </div>

              <div className="ml-3 pl-2.5 border-l-2 border-purple-200 space-y-1 py-1">
                {[
                  { n: 1, label: '1. Tình huống thực tế', icon: <MessageCircle className="w-3.5 h-3.5 text-purple-600" /> },
                  { n: 2, label: '2. Nhiệm vụ học sinh', icon: <Target className="w-3.5 h-3.5 text-indigo-600" /> },
                  { n: 3, label: '3. Sản phẩm đầu ra', icon: <PackageCheck className="w-3.5 h-3.5 text-sky-600" /> },
                  { n: 4, label: '4. Tiêu chí đánh giá', icon: <Award className="w-3.5 h-3.5 text-emerald-600" /> },
                ].map((b) => (
                  <button
                    key={b.n}
                    type="button"
                    onClick={() => focusAndScrollTo(`vandung-block-${b.n}`)}
                    className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-all cursor-pointer ${
                      focusedSectionId === `vandung-block-${b.n}`
                        ? 'bg-purple-100 text-purple-900 font-bold ring-1 ring-purple-300 shadow-2xs'
                        : 'text-slate-600 hover:bg-purple-50/60 hover:text-purple-800'
                    }`}
                  >
                    {b.icon}
                    <span className="truncate">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Fallback cho các node tự do */}
          {knowledgeUnits.length === 0 && !['Khởi động', 'Luyện tập', 'Vận dụng'].includes(cur.type || '') && (
            <div className="space-y-1 pt-0.5">
              {subSteps.map((step, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => focusAndScrollTo('node-title-area')}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span className="font-mono text-[10px] font-bold text-slate-500">{step.label}</span>
                  <span className="truncate flex-1">{step.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Unified Navigation (Unit/Node Hybrid) */}
          <div className="pt-2 mt-2 border-t border-[var(--color-neutral-200)] flex items-center justify-between gap-1.5 text-xs">
            {/* LEFT BUTTON */}
            {(() => {
              const curUIdx = activeUnitIdx ?? 0;
              if (knowledgeUnits.length > 0 && curUIdx > 0) {
                return (
                  <button
                    type="button"
                    onClick={() => onNavigateToHinhThanh(curUIdx - 1)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[var(--color-primary-700)] py-1 px-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Đơn vị {curUIdx}</span>
                  </button>
                )
              }
              if (activeIdx > 0) {
                return (
                  <button
                    type="button"
                    onClick={() => onNavigateToNode(activeIdx - 1)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[var(--color-primary-700)] py-1 px-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Phần trước</span>
                  </button>
                )
              }
              return <span />
            })()}

            {/* RIGHT BUTTON */}
            {(() => {
              const curUIdx = activeUnitIdx ?? 0;
              if (knowledgeUnits.length > 0 && curUIdx < knowledgeUnits.length - 1) {
                return (
                  <button
                    type="button"
                    onClick={() => onNavigateToHinhThanh(curUIdx + 1)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] py-1.5 px-3 rounded-[var(--radius-md)] shadow-2xs transition-all cursor-pointer ml-auto"
                  >
                    <span>Phần kế: Đơn vị {curUIdx + 2}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )
              }
              if (activeIdx < totalSteps - 1) {
                return (
                  <button
                    type="button"
                    onClick={() => onNavigateToNode(activeIdx + 1)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 py-1.5 px-3 rounded-[var(--radius-md)] shadow-2xs transition-all cursor-pointer ml-auto"
                  >
                    <span>Phần tiếp</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )
              }
              return <span />
            })()}
          </div>
        </div>

        {/* Card 2: TÊN HOẠT ĐỘNG */}
        <div
          onClick={() => focusAndScrollTo('node-title-area')}
          className="bg-white border-[3px] border-[var(--color-primary-500)] p-3 rounded-[var(--radius-lg)] shadow-xs cursor-pointer hover:border-[var(--color-primary-600)] transition-all group"
          title="Nhấn để di chuyển đến tiêu đề hoạt động"
        >
          <div className="flex items-center justify-between mb-0.5">
            <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary-700)] cursor-pointer">
              Tên hoạt động
            </label>
            <ArrowDown className="w-3 h-3 text-[var(--color-primary-500)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {cur.isLoading ? (
            <div className="h-6 bg-[var(--color-neutral-100)] rounded animate-pulse" />
          ) : (
            <div className="font-body text-xs font-bold text-[var(--color-neutral-900)] group-hover:text-[var(--color-primary-700)] transition-colors">
              {cur.appliedActivity || '—'}
            </div>
          )}
        </div>

        {/* Card 3: VẬT TƯ & THIẾT BỊ (read-only) */}
        <div
          onClick={() => focusAndScrollTo('materials-section')}
          className="bg-white border-[3px] border-[var(--color-primary-500)] p-3.5 rounded-[var(--radius-lg)] shadow-xs space-y-2.5 cursor-pointer hover:border-[var(--color-primary-600)] transition-all group"
          title="Nhấn để di chuyển đến mục học liệu chuẩn bị"
        >
          <div className="flex items-center justify-between border-b border-[var(--color-neutral-200)] pb-1.5">
            <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary-700)] flex items-center gap-1.5 cursor-pointer">
              <PackageCheck className="w-3.5 h-3.5" />Vật tư &amp; Thiết bị chuẩn bị
            </label>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-primary-50)] text-[var(--color-primary-700)] border border-[var(--color-primary-200)]">
              {parsedMaterials.length}
            </span>
          </div>

          {cur.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-[var(--color-neutral-100)] rounded-[var(--radius-lg)] animate-pulse" />)}
            </div>
          ) : (
            <MaterialList materials={parsedMaterials} />
          )}
        </div>

      </div>
    </aside>
  )
}
