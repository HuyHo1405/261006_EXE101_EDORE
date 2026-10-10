'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, BookOpen } from 'lucide-react'
import type { TimelineStep } from '@/lib/services/pipelineService'
import { DashboardBreadcrumb } from '@/features/course/components/DashboardBreadcrumb'
import { NodeBody } from './payload/NodeViews'
import { parseTeachingTools } from './LessonOverviewPanel'
import { parseMaterials } from '../utils/stepText'
import { EMPTY_LESSON_META } from '../types/lessonMeta'
import type { LessonMeta } from '../types/lessonMeta'

import { InlineEditor } from './timeline/InlineEditor'
import { ToolWarningModal } from './timeline/ToolWarningModal'
import { TimelineDockBar } from './timeline/TimelineDockBar'
import { TimelineDetailSidebar } from './timeline/TimelineDetailSidebar'
import { TimelineOverviewView } from './timeline/TimelineOverviewView'
import { parseActivitySubSteps } from './timeline/timelineUtils'

export interface TimelineEditorProps {
  steps: TimelineStep[]
  onStepsChange: (steps: TimelineStep[]) => void
  onRestart?: () => void
  contentSummary?: string
  courseId?: string
  courseTitle?: string
  scriptTitle?: string
  lessonMeta?: LessonMeta
  onOpenMenu?: () => void
}

export default function TimelineEditor({
  steps = [],
  onStepsChange,
  onRestart,
  contentSummary = '',
  courseId = '',
  courseTitle = '',
  scriptTitle = '',
  lessonMeta = EMPTY_LESSON_META,
  onOpenMenu,
}: TimelineEditorProps) {
  const [activeIdx, setActiveIdx] = useState(-1)
  const [activeUnitIdx, setActiveUnitIdx] = useState<number | null>(0)
  const [focusedSectionId, setFocusedSectionId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const focusAndScrollTo = (elementId: string, highlightId?: string) => {
    setFocusedSectionId(highlightId || elementId)
    
    const tryScroll = (attempts: number) => {
      const el = document.getElementById(elementId)
      if (!el) {
        if (attempts > 0) setTimeout(() => tryScroll(attempts - 1), 100)
        return
      }

      // Chờ DOM ổn định layout (thêm delay 100-150ms ở giữa) rồi mới scroll
      setTimeout(() => {
        const navOffset = 140
        const elementPosition = el.getBoundingClientRect().top + window.scrollY
        window.scrollTo({
          top: elementPosition - navOffset,
          behavior: 'smooth',
        })

        el.classList.remove('ring-4', 'ring-sky-500', 'ring-offset-4', 'ring-offset-white', 'shadow-2xl')
        void el.offsetWidth
        el.classList.add('ring-4', 'ring-sky-500', 'ring-offset-4', 'ring-offset-white', 'shadow-2xl')

        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-sky-500', 'ring-offset-4', 'ring-offset-white', 'shadow-2xl')
        }, 2200)
      }, 150)
    }

    setTimeout(() => tryScroll(10), 60)
  }

  const handleNavigateToHinhThanh = (uIdx: number, stepNum?: number) => {
    setActiveUnitIdx(uIdx)
    const effectiveStepNum = stepNum || 1
    const targetId = `hinhthanh-step-${effectiveStepNum}`
    const highlightId = `unit-${uIdx}-step-${effectiveStepNum}`

    window.dispatchEvent(new CustomEvent('expand-knowledge-unit', { detail: { uIdx, shouldScroll: false } }))

    setTimeout(() => {
      focusAndScrollTo(targetId, highlightId)
    }, 100)
  }

  const handleGoNext = () => {
    const curStep = steps[activeIdx]
    const units = curStep?.nodePayload?.knowledge_units
    if (Array.isArray(units) && units.length > 0 && (activeUnitIdx ?? 0) < units.length - 1) {
      handleNavigateToHinhThanh((activeUnitIdx ?? 0) + 1)
      return
    }
    if (activeIdx < steps.length - 1) {
      handleNavigateToNode(activeIdx + 1)
    }
  }

  const handleGoPrev = () => {
    const curStep = steps[activeIdx]
    const units = curStep?.nodePayload?.knowledge_units
    if (Array.isArray(units) && units.length > 0 && (activeUnitIdx ?? 0) > 0) {
      handleNavigateToHinhThanh((activeUnitIdx ?? 0) - 1)
      return
    }
    if (activeIdx > -1) {
      setActiveIdx(activeIdx - 1)
    }
  }

  const [checkedTools, setCheckedTools] = useState<Record<number, boolean>>({})
  const [hasDismissedToolWarning, setHasDismissedToolWarning] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [pendingTargetIdx, setPendingTargetIdx] = useState<number | null>(null)

  const parsedLessonTools = parseTeachingTools(lessonMeta?.teachingTools || [])
  const totalToolsCount = parsedLessonTools.length
  const unpreparedTools = parsedLessonTools.filter((_, idx) => !checkedTools[idx])
  const preparedToolsCount = totalToolsCount - unpreparedTools.length
  const isToolsIncomplete = preparedToolsCount < totalToolsCount

  const handleNavigateToNode = (targetIdx: number) => {
    // Nếu đang ở màn hình Tổng quan (-1) và chuyển sang các node bài dạy (targetIdx >= 0)
    if (activeIdx === -1 && targetIdx >= 0) {
      if (unpreparedTools.length > 0 && !hasDismissedToolWarning) {
        setPendingTargetIdx(targetIdx)
        setShowWarningModal(true)
        return
      }
    }
    setActiveIdx(targetIdx)
  }

  const handleModalPrepare = () => {
    setShowWarningModal(false)
    setPendingTargetIdx(null)
    setActiveIdx(-1)
    setTimeout(() => {
      const el = document.getElementById('teaching-tools-section')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('ring-2', 'ring-amber-400')
        setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400'), 1500)
      }
    }, 50)
  }

  const handleModalSkip = () => {
    setShowWarningModal(false)
    setHasDismissedToolWarning(true)
    if (pendingTargetIdx !== null) {
      setActiveIdx(pendingTargetIdx)
      setPendingTargetIdx(null)
    }
  }

  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setActiveUnitIdx(0)
    
    // Tự động chọn phần đầu tiên khi qua trang
    const curType = steps[activeIdx]?.type
    let targetId = 'node-title-area'
    let highlightId = 'node-title-area'
    
    if (curType === 'Khởi động') { targetId = 'khoidong-step-1'; highlightId = 'khoidong-step-1' }
    else if (curType === 'Hình thành kiến thức') { targetId = 'hinhthanh-step-1'; highlightId = 'unit-0-step-1' }
    else if (curType === 'Luyện tập') { targetId = 'luyentap-exercise-0'; highlightId = 'luyentap-exercise-0' }
    else if (curType === 'Vận dụng') { targetId = 'vandung-block-1'; highlightId = 'vandung-block-1' }
    
    if (activeIdx === -1) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      focusAndScrollTo(targetId, highlightId)
    }
  }, [activeIdx]) // intentionally excluded steps to avoid over-triggering

  useEffect(() => {
    if (activeIdx !== -1 && steps[activeIdx]?.type === 'Hình thành kiến thức') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      focusAndScrollTo('hinhthanh-step-1', `unit-${activeUnitIdx ?? 0}-step-1`)
    }
  }, [activeUnitIdx])

  useEffect(() => {
    setIsNavigating(true)
    const t = setTimeout(() => setIsNavigating(false), 500)
    return () => clearTimeout(t)
  }, [activeIdx, activeUnitIdx])

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail !== undefined && typeof e.detail.uIdx === 'number') {
        setActiveUnitIdx(e.detail.uIdx)
      }
    }
    window.addEventListener('knowledge-unit-expanded', handler)
    return () => window.removeEventListener('knowledge-unit-expanded', handler)
  }, [])

  const current = steps[activeIdx] ?? ({} as Partial<TimelineStep>)
  const updateStep = (patch: Partial<TimelineStep>) =>
    onStepsChange(steps.map((s, i) => (i === activeIdx ? { ...s, ...patch } : s)))

  const lessonHeading = [
    lessonMeta?.lessonNumber
      ? (/^\d+$/.test(lessonMeta.lessonNumber.trim()) ? `Bài ${lessonMeta.lessonNumber}` : lessonMeta.lessonNumber)
      : '',
    lessonMeta?.lessonTitle,
  ].filter(Boolean).join(': ') || contentSummary || scriptTitle || 'Bài học'

  const totalDuration = steps.reduce(
    (acc, s) => acc + (parseInt((s.duration || '10').replace(/[^0-9]/g, '')) || 10),
    0
  )

  const cur = current as TimelineStep
  const activeType = cur.type || 'Hoạt động dạy học'
  const subSteps = parseActivitySubSteps(cur.details || [])

  const updateStepNote = (stepIdx: number, newText: string) => {
    const currentNotes = Array.isArray(cur.customStepNotes) ? [...cur.customStepNotes] : []
    currentNotes[stepIdx] = newText
    updateStep({ customStepNotes: currentNotes })
  }

  const parsedMaterials = parseMaterials(cur.pedagogNote)
  const knowledgeUnits: any[] = Array.isArray(cur.nodePayload?.knowledge_units)
    ? cur.nodePayload.knowledge_units
    : []

  return (
    <div className="flex flex-col justify-between min-h-full font-body">
      {/* ─── Top Breadcrumb Bar ─── */}
      <DashboardBreadcrumb
        courseTitle={courseTitle || "Khóa học của tôi"}
        courseHref={courseId ? `/dashboard?courseId=${courseId}` : "/dashboard"}
        scriptTitle={
          activeIdx === -1
            ? (scriptTitle || "Tổng quan kịch bản")
            : (cur.title || `Phần ${activeIdx + 1}`)
        }
        badgeLabel={activeIdx === -1 ? "Kịch bản bài giảng" : (cur.type || "Chi tiết phần dạy")}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        onOpenMenu={onOpenMenu}
      />

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-12 gap-6 flex-1 items-start relative min-h-[500px]">
        {isNavigating && activeIdx === -1 ? (
          <div className="col-span-12 border-2 border-[var(--color-neutral-200)] rounded-[var(--radius-xl)] flex flex-col bg-white overflow-hidden shadow-sm p-6 sm:p-8 space-y-8 min-h-[600px]">
            <div className="h-10 w-1/3 bg-slate-200 rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
            </div>
            <div className="h-6 w-1/4 bg-slate-200 rounded-lg animate-pulse mt-4" />
            <div className="space-y-4">
              <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          </div>
        ) : isNavigating && activeIdx !== -1 ? (
          <>
            <main className={`col-span-12 ${isSidebarOpen ? 'lg:col-span-8' : ''} border-2 border-[var(--color-neutral-200)] rounded-[var(--radius-xl)] flex flex-col bg-white overflow-hidden shadow-sm p-6 space-y-5 min-h-[600px] transition-all`}>
              <div className="flex gap-2">
                <div className="h-6 w-32 bg-slate-200 rounded-full animate-pulse" />
                <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
              </div>
              <div className="h-10 w-3/4 bg-slate-200 rounded-lg animate-pulse mt-2" />
              
              <div className="flex-1 space-y-4 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-slate-200 rounded-full animate-pulse" />
                  <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="space-y-4 pt-2">
                  <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
                </div>
              </div>
            </main>
            
            {isSidebarOpen && (
              <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                <div className="bg-slate-100 border border-slate-200 p-4 sm:p-5 rounded-[var(--radius-xl)] shadow-sm flex flex-col gap-3 min-h-[600px]">
                  <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
                  <div className="h-48 bg-white border border-slate-200 rounded-lg animate-pulse" />
                  <div className="h-24 bg-white border border-slate-200 rounded-lg animate-pulse" />
                  <div className="h-48 bg-white border border-slate-200 rounded-lg animate-pulse" />
                </div>
              </aside>
            )}
          </>
        ) : activeIdx === -1 ? (
          <TimelineOverviewView
            lessonMeta={lessonMeta}
            contentSummary={contentSummary}
            steps={steps}
            lessonHeading={lessonHeading}
            totalDuration={totalDuration}
            totalToolsCount={totalToolsCount}
            preparedToolsCount={preparedToolsCount}
            isToolsIncomplete={isToolsIncomplete}
            checkedTools={checkedTools}
            onToggleTool={(idx) => setCheckedTools(prev => ({ ...prev, [idx]: !prev[idx] }))}
            onNavigateToNode={handleNavigateToNode}
          />
        ) : (
          <>
            <main className={`col-span-12 ${isSidebarOpen ? 'lg:col-span-8' : ''} border-2 border-[var(--color-neutral-200)] rounded-[var(--radius-xl)] flex flex-col bg-white overflow-hidden shadow-sm p-6 space-y-5 transition-all`}>
              {/* Top Chips Bar */}
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-[var(--radius-full)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-body text-xs font-bold border border-[var(--color-primary-200)]">
                    {activeType}
                  </span>

                  <input
                    type="text"
                    value={cur.duration ?? ''}
                    onChange={(e) => updateStep({ duration: e.target.value })}
                    className="font-mono text-xs font-bold bg-[var(--color-neutral-100)] text-[var(--color-neutral-800)] px-3 py-1 rounded-[var(--radius-full)] border border-[var(--color-neutral-300)] w-16 text-center outline-none focus:border-[var(--color-primary-500)]"
                    placeholder="10'"
                  />
                </div>
              </div>

              {/* Node Title */}
              <div id="node-title-area" className="transition-all duration-300 rounded-lg">
                <input
                  type="text"
                  value={cur.title ?? ''}
                  onChange={(e) => updateStep({ title: e.target.value })}
                  className="font-header font-extrabold text-2xl uppercase tracking-tight text-[var(--color-neutral-900)] bg-transparent border-b border-transparent hover:border-[var(--color-neutral-300)] focus:border-[var(--color-primary-500)] focus:outline-none w-full pb-1 transition-all placeholder:text-[var(--color-neutral-400)]"
                  placeholder="NODE TITLE..."
                />
              </div>

              {/* Nội dung bài giảng */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-2 px-1">
                  <BookOpen className="w-4.5 h-4.5 text-[var(--color-primary-600)]" />
                  <h3 className="font-header text-sm uppercase tracking-wider font-extrabold text-[var(--color-neutral-900)]">
                    NỘI DUNG BÀI GIẢNG
                  </h3>
                </div>

                {cur.isLoading ? (
                  <div className="p-8 flex flex-col items-center justify-center gap-3 bg-[var(--color-neutral-50)] rounded-[var(--radius-lg)] border border-[var(--color-neutral-200)]">
                    <span className="w-6 h-6 border-3 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin" />
                    <span className="font-body text-xs font-semibold text-[var(--color-neutral-600)]">
                      Đang phân rã dữ liệu kịch bản bài giảng...
                    </span>
                  </div>
                ) : (
                  <NodeBody
                    activeUnitIdx={activeUnitIdx}
                    nodeTypeCode={cur.nodeTypeCode}
                    nodeType={cur.type}
                    payload={cur.nodePayload}
                    onPayloadChange={(newPayload) => updateStep({ nodePayload: newPayload })}
                    teachingMethod={cur.teachingMethod}
                    onTeachingMethodChange={(m) => updateStep({ teachingMethod: m })}
                    steps={(cur.details || []).map(String).filter(s => s.trim())}
                    renderNote={(idx) => (
                      <InlineEditor
                        value={(cur.customStepNotes && cur.customStepNotes[idx]) || ''}
                        onChange={(md) => updateStepNote(idx, md)}
                        placeholder="Ghi chú thêm hoặc tùy chỉnh hướng dẫn cho bước này..."
                      />
                    )}
                    appliedActivity={cur.appliedActivity}
                    intent={cur.intent}
                    onGoToNextNode={() => {
                      if (activeIdx < steps.length - 1) {
                        setActiveIdx(activeIdx + 1)
                      }
                    }}
                    onIntentChange={(v) => updateStep({ intent: v })}
                    nextStepTitle={activeIdx === 0 ? lessonHeading : (activeIdx < steps.length - 1 ? steps[activeIdx + 1]?.title : undefined)}
                    teachingTools={lessonMeta?.teachingTools}
                    images={lessonMeta?.images}
                    pedagogNote={cur.pedagogNote}
                    hinhThanhApproach={steps.find(s => s.type === 'Hình thành kiến thức' || s.nodeTypeCode === '4-node_hinh_thanh')?.nodePayload?.pedagogical_approach || 'INDUCTIVE'}
                  />
                )}
              </div>

              {/* Nút điều hướng qua phần khác (dạng Link) */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-neutral-200)] mt-4">
                <button
                  onClick={handleGoPrev}
                  disabled={activeIdx <= -1}
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary-600)] hover:text-[var(--color-primary-800)] hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed transition-colors cursor-pointer py-1 px-2 rounded-[var(--radius-md)] hover:bg-[var(--color-primary-50)]"
                  title="Phần trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Phần trước
                </button>
                <button
                  onClick={handleGoNext}
                  disabled={activeIdx >= steps.length - 1 && (!knowledgeUnits.length || (activeUnitIdx ?? 0) >= knowledgeUnits.length - 1)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary-600)] hover:text-[var(--color-primary-800)] hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed transition-colors cursor-pointer py-1 px-2 rounded-[var(--radius-md)] hover:bg-[var(--color-primary-50)]"
                  title="Phần tiếp theo"
                >
                  Phần tiếp
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </main>

            {/* Right Sidebar */}
            {isSidebarOpen && (
              <TimelineDetailSidebar
                currentStep={cur}
                activeIdx={activeIdx}
                totalSteps={steps.length}
                activeUnitIdx={activeUnitIdx}
                focusedSectionId={focusedSectionId}
                onNavigateToHinhThanh={handleNavigateToHinhThanh}
                onNavigateToNode={handleNavigateToNode}
                onFocusAndScrollTo={focusAndScrollTo}
                parsedMaterials={parsedMaterials}
                subSteps={subSteps}
                steps={(cur.details || []).map(String).filter(s => s.trim())}
                renderNote={(idx) => (
                  <InlineEditor
                    value={(cur.customStepNotes && cur.customStepNotes[idx]) || ''}
                    onChange={(md) => updateStepNote(idx, md)}
                    placeholder="Ghi chú thêm hoặc tùy chỉnh hướng dẫn cho bước này..."
                  />
                )}
                images={lessonMeta?.images}
              />
            )}
          </>
        )}
      </div>

      {/* Sticky Bottom Dock Bar */}
      <TimelineDockBar
        steps={steps}
        activeIdx={activeIdx}
        activeUnitIdx={activeUnitIdx}
        knowledgeUnits={knowledgeUnits}
        onSelectOverview={() => setActiveIdx(-1)}
        onSelectNode={handleNavigateToNode}
        onSelectUnit={(uIdx) => {
          setActiveUnitIdx(uIdx)
          window.dispatchEvent(new CustomEvent('expand-knowledge-unit', { detail: { uIdx, shouldScroll: true } }))
        }}
        onGoPrev={handleGoPrev}
        onGoNext={handleGoNext}
      />

      {/* Popup cảnh báo học liệu chưa chuẩn bị */}
      <ToolWarningModal
        isOpen={showWarningModal}
        preparedToolsCount={preparedToolsCount}
        totalToolsCount={totalToolsCount}
        unpreparedTools={unpreparedTools}
        onSkip={handleModalSkip}
        onPrepare={handleModalPrepare}
      />
    </div>
  )
}
