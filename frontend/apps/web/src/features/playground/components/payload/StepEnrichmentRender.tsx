import { useState, useEffect, useRef } from 'react'
import {
  HelpCircle, CheckCircle2, ChevronRight, PackageCheck, FileText, Target, Award, Sparkles, Layers, Plus, Trash2
} from 'lucide-react'
import type { EnrichedContent } from '../../utils/stepEnrichment'

// ─── Auto Resizing Textarea Helper (Full Height, No Scrollbar) ───────────────
function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  className = '',
  minRows = 2,
}: {
  value: string
  onChange?: (val: string) => void
  placeholder?: string
  className?: string
  minRows?: number
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.max(el.scrollHeight, minRows * 20)}px`
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [value])

  return (
    <textarea
      ref={textareaRef}
      value={value || ''}
      onChange={(e) => {
        onChange?.(e.target.value)
        adjustHeight()
      }}
      placeholder={placeholder}
      className={`overflow-hidden resize-none w-full ${className}`}
      rows={minRows}
    />
  )
}

interface StepEnrichmentRenderProps {
  enrichment: EnrichedContent | null
  payload?: any
  onPayloadChange?: (updatedPayload: any) => void
}

export function StepEnrichmentRender({ enrichment, payload, onPayloadChange }: StepEnrichmentRenderProps) {
  if (!enrichment || !enrichment.data) return null

  const updatePayload = (updater: (prevPayload: any) => any) => {
    if (!onPayloadChange) return
    const current = payload || {}
    const updated = updater({ ...current })
    onPayloadChange(updated)
  }

  switch (enrichment.type) {
    case 'hook':
      return (
        <HookCard
          hook={enrichment.data}
          onChange={(newHook) =>
            updatePayload((p) => ({ ...p, hook: { ...p.hook, ...newHook } }))
          }
        />
      )
    case 'list':
      return (
        <BulletList
          items={enrichment.data}
          onChange={(newList) =>
            updatePayload((p) => ({ ...p, expected_responses: newList }))
          }
        />
      )
    case 'text':
      return (
        <TextBlock
          text={enrichment.data}
          onChange={(newText) =>
            updatePayload((p) => {
              if (p.transition_line !== undefined) return { ...p, transition_line: newText }
              if (p.synthesis !== undefined) return { ...p, synthesis: newText }
              return { ...p, transition_line: newText }
            })
          }
        />
      )
    case 'chips':
      return <ChipGroup items={enrichment.data} />
    case 'units':
      return (
        <KnowledgeUnitsRender
          units={enrichment.data}
          onChange={(newUnits) =>
            updatePayload((p) => ({ ...p, knowledge_units: newUnits }))
          }
        />
      )
    case 'exercises':
      return (
        <ExerciseList
          exercises={enrichment.data}
          onChange={(newExercises) =>
            updatePayload((p) => ({ ...p, exercises: newExercises }))
          }
        />
      )
    case 'scenario':
      return (
        <ScenarioCard
          data={enrichment.data}
          onChange={(patch) =>
            updatePayload((p) => ({ ...p, ...patch }))
          }
        />
      )
    case 'rubric':
      return (
        <RubricTable
          items={enrichment.data}
          onChange={(newRubric) =>
            updatePayload((p) => ({ ...p, rubric: newRubric }))
          }
        />
      )
    default:
      return null
  }
}

// ─── 1. HookCard ─────────────────────────────────────────────────────────────
function HookCard({
  hook,
  onChange,
}: {
  hook: { question_or_situation?: string; presentation_form?: string }
  onChange?: (patch: { question_or_situation?: string }) => void
}) {
  if (!hook || typeof hook !== 'object') return null
  return (
    <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/80 rounded-[var(--radius-lg)] shadow-xs flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wide">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>Tình huống / Câu hỏi mở đầu</span>
        </div>
        {hook.presentation_form && (
          <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
            {hook.presentation_form}
          </span>
        )}
      </div>
      <AutoResizeTextarea
        value={hook.question_or_situation || ''}
        onChange={(val) => onChange?.({ question_or_situation: val })}
        placeholder="Nhập tình huống hoặc câu hỏi mở đầu..."
        className="font-body text-xs text-slate-800 leading-relaxed italic bg-transparent hover:bg-white/80 focus:bg-white border border-transparent focus:border-amber-300 rounded p-1.5 outline-none transition-all"
        minRows={2}
      />
    </div>
  )
}

// ─── 2. BulletList ────────────────────────────────────────────────────────────
function BulletList({ items, onChange }: { items: string[]; onChange?: (newList: string[]) => void }) {
  const listItems = Array.isArray(items) ? items : []
  const textValue = listItems.join('\n')

  return (
    <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-[var(--radius-lg)] space-y-1.5">
      <div className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
        Dự kiến phản hồi của học sinh (xuống dòng mỗi ý)
      </div>
      <AutoResizeTextarea
        value={textValue}
        onChange={(val) => {
          const lines = val.split('\n')
          onChange?.(lines)
        }}
        placeholder="Nhập dự kiến phản hồi của học sinh (mỗi dòng 1 ý)..."
        className="font-body text-xs text-slate-800 leading-relaxed bg-white hover:border-slate-300 focus:border-slate-400 p-2.5 rounded border border-slate-200 outline-none transition-all"
        minRows={3}
      />
    </div>
  )
}

// ─── 3. TextBlock ─────────────────────────────────────────────────────────────
function TextBlock({ text, onChange }: { text: string; onChange?: (newText: string) => void }) {
  return (
    <div className="p-3 bg-blue-50/60 border-l-4 border-l-blue-500 border border-blue-100 rounded-[var(--radius-md)]">
      <AutoResizeTextarea
        value={String(text || '')}
        onChange={(val) => onChange?.(val)}
        placeholder="Nhập nội dung chốt / chuyển giao..."
        className="font-body text-xs text-slate-800 leading-relaxed bg-transparent hover:bg-white/60 focus:bg-white border border-transparent focus:border-blue-300 rounded p-1 outline-none transition-all"
        minRows={2}
      />
    </div>
  )
}

// ─── 4. ChipGroup (Materials) ────────────────────────────────────────────────
function ChipGroup({ items }: { items: string[] }) {
  if (!Array.isArray(items) || items.length === 0) return null
  return (
    <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-[var(--radius-lg)] space-y-2">
      <div className="flex items-center gap-1.5 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
        <PackageCheck className="w-3.5 h-3.5" />
        <span>Vật tư & Thiết bị chuẩn bị</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((chip, idx) => (
          <span
            key={idx}
            className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-indigo-200 text-indigo-900 text-xs font-semibold shadow-2xs"
          >
            {String(chip)}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── 5. KnowledgeUnitsRender ──────────────────────────────────────────────────
function KnowledgeUnitsRender({ units, onChange }: { units: any[]; onChange?: (newUnits: any[]) => void }) {
  const [expandedUnitIdx, setExpandedUnitIdx] = useState<number | null>(0)

  if (!Array.isArray(units) || units.length === 0) return null
  return (
    <div className="space-y-2.5">
      {units.map((unit, idx) => {
        const isExpanded = expandedUnitIdx === idx
        const updateUnit = (patch: Record<string, any>) => {
          const copy = [...units]
          copy[idx] = { ...unit, ...patch }
          onChange?.(copy)
        }

        return (
          <div
            key={idx}
            className={`border-2 rounded-[var(--radius-xl)] overflow-hidden transition-all duration-200 ${
              isExpanded
                ? 'border-sky-500 ring-2 ring-sky-100 bg-white shadow-xs'
                : 'border-slate-200 hover:border-sky-300 bg-white'
            }`}
          >
            {/* Header */}
            <div
              onClick={() => setExpandedUnitIdx(isExpanded ? null : idx)}
              className="px-4 py-3 bg-slate-50/80 hover:bg-sky-50/60 cursor-pointer flex items-center justify-between gap-3 select-none"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-sky-200">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={unit.unit_title || ''}
                  onChange={(e) => updateUnit({ unit_title: e.target.value })}
                  placeholder={`Đơn vị kiến thức ${idx + 1}...`}
                  className="font-body font-bold text-xs text-slate-900 bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-sky-300 rounded px-2 py-1 outline-none flex-1 transition-all"
                />
              </div>
              <ChevronRight
                className={`w-4.5 h-4.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                  isExpanded ? 'rotate-90 text-sky-600' : ''
                }`}
              />
            </div>

            {/* Body */}
            {isExpanded && (
              <div className="p-4 border-t border-slate-100 bg-white space-y-3 font-body text-xs leading-relaxed text-slate-700">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Nội dung cốt lõi:</span>
                  <AutoResizeTextarea
                    value={unit.core_content || ''}
                    onChange={(val) => updateUnit({ core_content: val })}
                    placeholder="Nhập nội dung cốt lõi..."
                    className="bg-slate-50 hover:bg-white focus:bg-white p-2.5 rounded border border-slate-200 focus:border-sky-400 text-slate-800 outline-none transition-all text-xs font-body"
                    minRows={3}
                  />
                </div>

                <div>
                  <span className="font-bold text-slate-900 block mb-1">Hướng dẫn giảng dạy:</span>
                  <AutoResizeTextarea
                    value={unit.teacher_delivery || ''}
                    onChange={(val) => updateUnit({ teacher_delivery: val })}
                    placeholder="Nhập hướng dẫn giảng dạy..."
                    className="italic text-slate-700 bg-slate-50 hover:bg-white focus:bg-white p-2.5 rounded border border-slate-200 focus:border-sky-400 outline-none transition-all text-xs font-body"
                    minRows={2}
                  />
                </div>

                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-[var(--radius-md)] space-y-1.5">
                  <span className="font-bold text-emerald-800 block text-[11px] flex items-center gap-1 uppercase tracking-wider">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-600" /> Câu hỏi kiểm tra:
                  </span>
                  <AutoResizeTextarea
                    value={unit.checkpoint_question || ''}
                    onChange={(val) => updateUnit({ checkpoint_question: val })}
                    placeholder="Nhập câu hỏi kiểm tra..."
                    className="font-semibold text-emerald-950 bg-white/90 hover:bg-white focus:bg-white p-2 rounded border border-emerald-300 focus:border-emerald-500 outline-none transition-all text-xs font-body"
                    minRows={2}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── 6. ExerciseList ─────────────────────────────────────────────────────────
function ExerciseList({ exercises, onChange }: { exercises: any[]; onChange?: (newExercises: any[]) => void }) {
  const [expandedExIdx, setExpandedExIdx] = useState<number | null>(0)

  if (!Array.isArray(exercises) || exercises.length === 0) return null

  const getLevelBadge = (level?: string) => {
    switch (level) {
      case 'nhan_biet': return { label: 'Nhận biết', cls: 'bg-blue-100 text-blue-800 border-blue-200' }
      case 'thong_hieu': return { label: 'Thông hiểu', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
      case 'van_dung_thap': return { label: 'Vận dụng', cls: 'bg-amber-100 text-amber-800 border-amber-200' }
      case 'van_dung_cao': return { label: 'Vận dụng cao', cls: 'bg-purple-100 text-purple-800 border-purple-200' }
      default: return level ? { label: level, cls: 'bg-slate-100 text-slate-700 border-slate-200' } : null
    }
  }

  return (
    <div className="space-y-2.5">
      {exercises.map((ex, idx) => {
        const isExpanded = expandedExIdx === idx
        const badge = getLevelBadge(ex.level)
        const updateEx = (patch: Record<string, any>) => {
          const copy = [...exercises]
          copy[idx] = { ...ex, ...patch }
          onChange?.(copy)
        }

        return (
          <div
            key={idx}
            className={`border-2 rounded-[var(--radius-xl)] overflow-hidden transition-all duration-200 ${
              isExpanded
                ? 'border-blue-500 ring-2 ring-blue-100 bg-white shadow-xs'
                : 'border-slate-200 hover:border-blue-300 bg-white'
            }`}
          >
            {/* Header */}
            <div
              onClick={() => setExpandedExIdx(isExpanded ? null : idx)}
              className="px-4 py-3 bg-slate-50/80 hover:bg-blue-50/60 cursor-pointer flex items-center justify-between gap-3 select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                  {idx + 1}
                </span>
                <span className="font-bold text-xs text-slate-900 truncate">
                  Bài tập {idx + 1}: {ex.question ? ex.question.slice(0, 45) + (ex.question.length > 45 ? '...' : '') : 'Chưa có nội dung'}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {ex.format && (
                  <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {ex.format}
                  </span>
                )}
                {badge && (
                  <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${badge.cls}`}>
                    {badge.label}
                  </span>
                )}
                <ChevronRight
                  className={`w-4.5 h-4.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isExpanded ? 'rotate-90 text-blue-600' : ''
                  }`}
                />
              </div>
            </div>

            {/* Body */}
            {isExpanded && (
              <div className="p-4 border-t border-slate-100 bg-white space-y-3 font-body text-xs">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Câu hỏi bài tập:</span>
                  <AutoResizeTextarea
                    value={ex.question || ''}
                    onChange={(val) => updateEx({ question: val })}
                    placeholder="Nhập câu hỏi bài tập..."
                    className="text-slate-800 font-semibold bg-slate-50 hover:bg-white focus:bg-white p-2 rounded border border-slate-200 focus:border-blue-400 outline-none transition-all text-xs"
                    minRows={2}
                  />
                </div>

                <div className="pt-1 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 font-mono block">Đáp án / Hướng dẫn giải:</span>
                  <AutoResizeTextarea
                    value={ex.answer || ''}
                    onChange={(val) => updateEx({ answer: val })}
                    placeholder="Nhập đáp án hoặc gợi ý giải..."
                    className="text-emerald-950 font-mono text-[11px] bg-emerald-50/60 hover:bg-white focus:bg-white p-2 rounded border border-emerald-200 focus:border-emerald-500 outline-none transition-all"
                    minRows={2}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── 7. ScenarioCard ─────────────────────────────────────────────────────────
function ScenarioCard({
  data,
  onChange,
}: {
  data: { scenario?: string; task_requirement?: string }
  onChange?: (patch: { scenario?: string; task_requirement?: string }) => void
}) {
  if (!data || typeof data !== 'object') return null
  return (
    <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50/40 border border-purple-200 rounded-[var(--radius-lg)] space-y-2.5 text-xs font-body">
      <div>
        <span className="font-bold text-purple-900 uppercase text-[10px] tracking-wider block mb-0.5">Bối cảnh tình huống</span>
        <AutoResizeTextarea
          value={data.scenario || ''}
          onChange={(val) => onChange?.({ scenario: val })}
          placeholder="Nhập bối cảnh tình huống thực tế..."
          className="text-slate-800 italic bg-transparent hover:bg-white focus:bg-white p-1.5 rounded border border-transparent focus:border-purple-300 outline-none transition-all text-xs"
          minRows={2}
        />
      </div>

      <div className="pt-1.5 border-t border-purple-200/60">
        <span className="font-bold text-indigo-900 uppercase text-[10px] tracking-wider block mb-0.5">Yêu cầu nhiệm vụ</span>
        <AutoResizeTextarea
          value={data.task_requirement || ''}
          onChange={(val) => onChange?.({ task_requirement: val })}
          placeholder="Nhập yêu cầu nhiệm vụ..."
          className="text-indigo-950 font-semibold bg-transparent hover:bg-white focus:bg-white p-1.5 rounded border border-transparent focus:border-indigo-300 outline-none transition-all text-xs"
          minRows={2}
        />
      </div>
    </div>
  )
}

// ─── 8. RubricTable ──────────────────────────────────────────────────────────
function RubricTable({ items, onChange }: { items: any[]; onChange?: (newRubric: any[]) => void }) {
  if (!Array.isArray(items) || items.length === 0) return null

  const updateItem = (idx: number, patch: Record<string, any>) => {
    const copy = [...items]
    copy[idx] = { ...copy[idx], ...patch }
    onChange?.(copy)
  }

  return (
    <div className="border border-slate-200 rounded-[var(--radius-lg)] overflow-hidden bg-white text-xs font-body">
      <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider border-b border-slate-200 flex items-center gap-1.5">
        <Award className="w-3.5 h-3.5 text-indigo-600" />
        <span>Tiêu chí đánh giá (Rubric)</span>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((rub, idx) => (
          <div key={idx} className="p-2 flex gap-2 items-start">
            <input
              type="text"
              value={rub.criterion || ''}
              onChange={(e) => updateItem(idx, { criterion: e.target.value })}
              placeholder="Tiêu chí..."
              className="font-bold text-indigo-900 bg-transparent hover:bg-slate-50 focus:bg-slate-50 border border-transparent focus:border-slate-300 rounded p-1 text-xs outline-none min-w-[100px]"
            />
            <input
              type="text"
              value={rub.description || ''}
              onChange={(e) => updateItem(idx, { description: e.target.value })}
              placeholder="Mô tả tiêu chí..."
              className="text-slate-700 flex-1 bg-transparent hover:bg-slate-50 focus:bg-slate-50 border border-transparent focus:border-slate-300 rounded p-1 text-xs outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
