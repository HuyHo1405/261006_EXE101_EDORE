'use client'

import React from 'react'
import { LayoutList, ChevronLeft, ChevronRight } from 'lucide-react'
import type { TimelineStep } from '@/lib/services/pipelineService'
import { getShortNodeName } from './timelineUtils'

interface TimelineDockBarProps {
  steps: TimelineStep[]
  activeIdx: number
  activeUnitIdx: number | null
  knowledgeUnits: any[]
  onSelectOverview: () => void
  onSelectNode: (idx: number) => void
  onSelectUnit: (uIdx: number) => void
  onGoPrev: () => void
  onGoNext: () => void
}

export function TimelineDockBar({
  steps,
  activeIdx,
  activeUnitIdx,
  knowledgeUnits,
  onSelectOverview,
  onSelectNode,
  onSelectUnit,
  onGoPrev,
  onGoNext,
}: TimelineDockBarProps) {
  const isPrevDisabled = activeIdx <= -1
  const isNextDisabled =
    activeIdx >= steps.length - 1 &&
    (!knowledgeUnits.length || (activeUnitIdx ?? 0) >= knowledgeUnits.length - 1)

  return (
    <div className="sticky bottom-0 z-30 w-full mt-2 pt-3 pb-2 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-md flex flex-col items-start gap-1.5">
      <style>{`
        @keyframes chipPopUp {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .chip-animate {
          animation: chipPopUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      {knowledgeUnits.length > 0 && (
        <div className="flex flex-wrap items-center justify-start gap-1.5 w-full max-w-full px-2 py-0.5">
          {knowledgeUnits.map((u: any, uIdx: number) => {
            const isUnitActive = activeUnitIdx === uIdx
            return (
              <button
                key={`${activeIdx}-${uIdx}`}
                onClick={() => onSelectUnit(uIdx)}
                title={u.unit_title || `Đơn vị ${uIdx + 1}`}
                className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all whitespace-nowrap cursor-pointer shadow-sm border shrink-0 chip-animate opacity-0 ${
                  isUnitActive
                    ? 'bg-sky-50 text-sky-700 border-sky-200 ring-2 ring-sky-400/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                }`}
                style={{ 
                  animationDelay: `${uIdx * 70}ms`
                }}
              >
                <span className="opacity-60 mr-1 font-mono">{uIdx + 1}.</span>
                {u.unit_title || `Đơn vị ${uIdx + 1}`}
              </button>
            )
          })}
        </div>
      )}

      <nav className="w-full p-2.5 bg-white border-2 border-[var(--color-neutral-200)] rounded-[var(--radius-xl)] shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Left: Overview + Steps Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 max-w-[70vw] sm:max-w-none">
          {/* Overview Button */}
          <button
            onClick={onSelectOverview}
            className={`font-body px-4 py-2 rounded-[var(--radius-lg)] flex items-center gap-2 transition-all font-bold text-xs shadow-xs shrink-0 cursor-pointer ${
              activeIdx === -1
                ? 'bg-[var(--color-primary-500)] text-white shadow-md'
                : 'bg-white hover:bg-[var(--color-neutral-100)] text-[var(--color-neutral-800)] border border-[var(--color-neutral-300)]'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>Tổng quan</span>
          </button>

          {/* Steps List */}
          {steps.map((step, idx) => {
            const isActive = activeIdx === idx
            return (
              <button
                key={idx}
                onClick={() => onSelectNode(idx)}
                className={`font-body px-4 py-2 rounded-[var(--radius-lg)] flex items-center gap-2 transition-all font-bold text-xs shadow-xs border shrink-0 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-primary-500)] text-white border-[var(--color-primary-500)] shadow-md'
                    : 'bg-white hover:bg-[var(--color-neutral-100)] text-[var(--color-neutral-800)] border border-[var(--color-neutral-300)]'
                }`}
              >
                {step.isLoading ? (
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <span
                    className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-[var(--radius-xs)] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]'
                    }`}
                  >
                    {(step.duration || '').endsWith("'") ? step.duration : `${step.duration}'`}
                  </span>
                )}
                <span>{getShortNodeName(step, idx)}</span>
              </button>
            )
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 ml-auto shrink-0 border-l border-[var(--color-neutral-300)] pl-3">
          <button
            onClick={onGoPrev}
            disabled={isPrevDisabled}
            className="w-9 h-9 flex items-center justify-center bg-white hover:bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] border border-[var(--color-neutral-300)] rounded-[var(--radius-lg)] transition-colors shadow-xs disabled:opacity-40 cursor-pointer"
            title="Phần trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onGoNext}
            disabled={isNextDisabled}
            className="w-9 h-9 flex items-center justify-center bg-white hover:bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] border border-[var(--color-neutral-300)] rounded-[var(--radius-lg)] transition-colors shadow-xs disabled:opacity-40 cursor-pointer"
            title="Phần tiếp theo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </nav>
    </div>
  )
}
