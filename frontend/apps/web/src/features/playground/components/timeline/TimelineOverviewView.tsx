'use client'

import React from 'react'
import { LayoutList, ChevronRight, ArrowRight } from 'lucide-react'
import type { TimelineStep } from '@/lib/services/pipelineService'
import { EMPTY_LESSON_META } from '../../types/lessonMeta'
import type { LessonMeta } from '../../types/lessonMeta'
import { LessonOverviewPanel } from '../LessonOverviewPanel'

interface TimelineOverviewViewProps {
  lessonMeta?: LessonMeta
  contentSummary?: string
  steps: TimelineStep[]
  lessonHeading: string
  totalDuration: number
  totalToolsCount: number
  preparedToolsCount: number
  isToolsIncomplete: boolean
  checkedTools: Record<number, boolean>
  onToggleTool: (idx: number) => void
  onNavigateToNode: (idx: number) => void
}

export function TimelineOverviewView({
  lessonMeta,
  contentSummary,
  steps,
  lessonHeading,
  totalDuration,
  totalToolsCount,
  preparedToolsCount,
  isToolsIncomplete,
  checkedTools,
  onToggleTool,
  onNavigateToNode,
}: TimelineOverviewViewProps) {
  return (
    <>
      <main className="col-span-12 lg:col-span-8 border-2 border-[var(--color-neutral-200)] rounded-[var(--radius-xl)] flex flex-col bg-white overflow-hidden shadow-sm">
        <div className="p-5 bg-white border-b border-[var(--color-neutral-200)] flex flex-col gap-1">
          <span className="font-mono text-[10px] font-bold text-[var(--color-primary-600)] uppercase tracking-wider">
            TỔNG QUAN KỊCH BẢN
          </span>
          <h1 className="font-header font-extrabold text-2xl uppercase tracking-tight text-[var(--color-neutral-900)]">
            Cấu trúc tiến trình giảng dạy đề xuất
          </h1>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto bg-white">
          <LessonOverviewPanel
            meta={lessonMeta || EMPTY_LESSON_META}
            contentSummary={contentSummary}
            checkedTools={checkedTools}
            onToggleTool={onToggleTool}
          />

          <div className="space-y-3">
            <h3 className="font-header font-extrabold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <LayoutList className="w-4 h-4 text-[var(--color-primary-600)] shrink-0" />
              <span>Danh sách các phần dạy học ({steps.length})</span>
            </h3>
            <div className="divide-y divide-[var(--color-neutral-200)] border border-[var(--color-neutral-200)] rounded-[var(--radius-lg)] overflow-hidden shadow-xs bg-white">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateToNode(idx)}
                  className="p-4 hover:bg-[var(--color-primary-50)] cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-7 h-7 rounded-[var(--radius-full)] bg-[var(--color-primary-100)] text-[var(--color-primary-700)] font-mono font-bold text-xs flex items-center justify-center border border-[var(--color-primary-200)] shadow-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-body font-bold text-sm text-[var(--color-neutral-900)] group-hover:text-[var(--color-primary-600)] transition-colors">
                        {step.isLoading ? `Đang khởi tạo phần ${idx + 1}...` : step.title || `Phần ${idx + 1}`}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-body text-[11px] font-semibold text-[var(--color-primary-700)] bg-[var(--color-primary-50)] px-2.5 py-0.5 rounded-[var(--radius-full)] border border-[var(--color-primary-200)]">
                          {step.type || 'Hoạt động'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {step.isLoading ? (
                      <span className="w-4 h-4 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="font-mono text-xs bg-[var(--color-neutral-100)] text-[var(--color-neutral-800)] px-3 py-1 rounded-[var(--radius-full)] font-bold border border-[var(--color-neutral-300)]">
                        {(step.duration || '').endsWith("'") ? step.duration : `${step.duration}'`}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-[var(--color-neutral-400)] group-hover:text-[var(--color-primary-500)] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Overview Sidebar */}
      <aside className="col-span-12 lg:col-span-4 space-y-4 sticky top-[108px] self-start">
        <div className="border-2 border-[var(--color-neutral-200)] rounded-[var(--radius-xl)] bg-white overflow-hidden shadow-sm">
          <div className="p-4 bg-[var(--color-neutral-100)] border-b border-[var(--color-neutral-200)] space-y-1">
            {lessonMeta?.chapter ? (
              <span
                title={lessonMeta.chapter}
                className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400 block truncate"
              >
                {lessonMeta.chapter}
              </span>
            ) : (
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary-600)] block">
                Thông tin bài học
              </span>
            )}
            <h4 className="font-header text-sm font-extrabold uppercase tracking-wide text-[var(--color-neutral-900)] leading-snug">
              {lessonHeading}
            </h4>
          </div>
          <div className="p-4 space-y-4 bg-white">
            <div className="space-y-3 text-xs font-body text-[var(--color-neutral-700)]">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--color-neutral-200)]">
                <span>Tổng số phần (Nodes)</span>
                <span className="font-mono font-bold text-sm text-[var(--color-neutral-900)]">{steps.length} phần</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[var(--color-neutral-200)]">
                <span>Tổng thời lượng bài học</span>
                <span className="font-mono font-bold text-sm text-[var(--color-primary-600)]">{totalDuration} phút</span>
              </div>
              {totalToolsCount > 0 && (
                <div className="flex justify-between items-center pb-2 border-b border-[var(--color-neutral-200)]">
                  <span>Học liệu đã chuẩn bị</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      isToolsIncomplete ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {preparedToolsCount}/{totalToolsCount}
                  </span>
                </div>
              )}
            </div>

            {steps.length > 0 && (
              <button
                onClick={() => onNavigateToNode(0)}
                className="font-body w-full py-2.5 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-400)] text-white rounded-[var(--radius-md)] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 mt-2 cursor-pointer"
              >
                Bắt đầu xem &amp; chỉnh sửa
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
