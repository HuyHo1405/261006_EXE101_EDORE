'use client'

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  HelpCircle, MessageCircle, Flag, ChevronRight, Lightbulb, Plus, Trash2,
  Eye, EyeOff, Award, Target, ClipboardList, Pencil, ListChecks,
  Monitor, Ruler, FileText, Package, PackageCheck, Presentation,
  Compass, Sparkles, Check, ArrowDown, Quote, Wand2, ArrowRight,
  Image as ImageIcon, BookOpen, Gamepad2, Zap, Play,
} from 'lucide-react'
import { AutoResizeTextarea } from '../StepEnrichmentRender'
import { classifyMaterial, splitStepText } from '../../../utils/stepText'
import type { MaterialKind, ParsedMaterial } from '../../../utils/stepText'
import { normalizeNodeType } from '../../../utils/stepEnrichment'
import { parseTeachingTools } from '../../LessonOverviewPanel'

import { SectionLabel, EditableList, MaterialList, StepList, TONE_BG, TONE_TEXT, fieldCls } from './Shared'

// ─── Vận dụng (nhiệm vụ) ──────────────────────────────────────────────────────
function Block({ n, label, icon, children, tone }: { n: number; label: string; icon: ReactNode; children: ReactNode; tone: string }) {
  return (
    <div id={`vandung-block-${n}`} className="flex gap-3 rounded-xl p-2.5 transition-all duration-300">
      <span className={`w-7 h-7 rounded-full ${TONE_BG[tone] || 'bg-slate-500'} text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5`}>{n}</span>
      <div className="flex-1 min-w-0 space-y-1.5">
        <SectionLabel tone={tone} icon={icon}>{label}</SectionLabel>
        {children}
      </div>
    </div>
  )
}

export function VanDungView({ payload, onChange }: { payload: any; onChange: (p: any) => void }) {
  const p = payload || {}
  const rubric: any[] = Array.isArray(p.rubric) ? p.rubric : []

  return (
    <div className="rounded-xl border-2 border-purple-200 bg-white p-4 space-y-5">
      <Block n={1} label="Tình huống thực tế" tone="purple" icon={<MessageCircle className="w-3.5 h-3.5" />}>
        <AutoResizeTextarea value={p.scenario || ''} minRows={2} placeholder="Mô tả bối cảnh / tình huống thực tế..."
          onChange={v => onChange({ ...p, scenario: v })} className={fieldCls + ' italic'} />
      </Block>
      <Block n={2} label="Nhiệm vụ của học sinh" tone="indigo" icon={<Target className="w-3.5 h-3.5" />}>
        <AutoResizeTextarea value={p.task_requirement || ''} minRows={2} placeholder="Học sinh cần làm gì?"
          onChange={v => onChange({ ...p, task_requirement: v })} className={fieldCls + ' font-semibold'} />
      </Block>
      <Block n={3} label="Sản phẩm đầu ra" tone="sky" icon={<PackageCheck className="w-3.5 h-3.5" />}>
        <AutoResizeTextarea value={p.expected_output_form || ''} minRows={1} placeholder="Hình thức sản phẩm (poster, bài trình bày, bảng tính...)"
          onChange={v => onChange({ ...p, expected_output_form: v })} className={fieldCls} />
      </Block>
      <Block n={4} label="Tiêu chí đánh giá" tone="emerald" icon={<Award className="w-3.5 h-3.5" />}>
        <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
          {rubric.map((r, i) => (
            <div key={i} className="flex gap-2 items-start p-2 group">
              <input value={r.criterion || ''} placeholder="Tiêu chí"
                onChange={e => onChange({ ...p, rubric: rubric.map((x, j) => (j === i ? { ...x, criterion: e.target.value } : x)) })}
                className="w-36 shrink-0 font-bold text-xs text-emerald-900 bg-transparent hover:bg-slate-50 focus:bg-slate-50 rounded p-1 outline-none border border-transparent focus:border-slate-300" />
              <input value={r.description || ''} placeholder="Mô tả mức đạt"
                onChange={e => onChange({ ...p, rubric: rubric.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })}
                className="flex-1 text-xs text-slate-700 bg-transparent hover:bg-slate-50 focus:bg-slate-50 rounded p-1 outline-none border border-transparent focus:border-slate-300" />
              <button type="button" onClick={() => onChange({ ...p, rubric: rubric.filter((_, j) => j !== i) })}
                className="p-1 rounded text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => onChange({ ...p, rubric: [...rubric, { criterion: '', description: '' }] })}
            className="w-full py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center justify-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Thêm tiêu chí
          </button>
        </div>
      </Block>
      <Block n={5} label="Gợi ý hỗ trợ học sinh" tone="amber" icon={<Lightbulb className="w-3.5 h-3.5" />}>
        <AutoResizeTextarea value={p.scaffolding_hint || ''} minRows={2} placeholder="Gợi ý khi học sinh gặp khó khăn..."
          onChange={v => onChange({ ...p, scaffolding_hint: v })} className={fieldCls + ' bg-amber-50/50 border-amber-200'} />
      </Block>
    </div>
  )
}
