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

// ─── Luyện tập (ôn tập) ───────────────────────────────────────────────────────
const LEVELS: { key: string; label: string; cls: string }[] = [
  { key: 'nhan_biet', label: 'Nhận biết', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  { key: 'thong_hieu', label: 'Thông hiểu', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { key: 'van_dung_thap', label: 'Vận dụng', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  { key: 'van_dung_cao', label: 'Vận dụng cao', cls: 'bg-purple-100 text-purple-800 border-purple-200' },
]

export function LuyenTapView({ payload, onChange }: { payload: any; onChange: (p: any) => void }) {
  const p = payload || {}
  const exercises: any[] = Array.isArray(p.exercises) ? p.exercises : []
  const [shown, setShown] = useState<Record<number, boolean>>({})

  const update = (i: number, patch: Record<string, any>) =>
    onChange({ ...p, exercises: exercises.map((e, j) => (j === i ? { ...e, ...patch } : e)) })

  const counts = LEVELS.map(l => ({ ...l, n: exercises.filter(e => e.level === l.key).length })).filter(l => l.n)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <SectionLabel tone="blue" icon={<ClipboardList className="w-4 h-4" />}>
          Bộ câu hỏi ôn tập ({exercises.length} câu)
        </SectionLabel>
        <div className="flex gap-1.5 flex-wrap">
          {counts.map(c => (
            <span key={c.key} className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${c.cls}`}>
              {c.label}: {c.n}
            </span>
          ))}
        </div>
      </div>

      {exercises.map((ex, i) => {
        const lv = LEVELS.find(l => l.key === ex.level)
        const reveal = !!shown[i]
        return (
          <div
            key={i}
            id={`luyentap-exercise-${i}`}
            className="rounded-xl border-2 border-slate-200 hover:border-blue-300 bg-white p-3.5 space-y-2.5 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-header font-extrabold text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-0.5">
                  Câu {i + 1}
                </span>
                <select
                  value={ex.level || ''}
                  onChange={e => update(i, { level: e.target.value })}
                  className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border outline-none cursor-pointer ${lv?.cls || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                >
                  <option value="">Mức độ…</option>
                  {LEVELS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
                </select>
                {ex.format && (
                  <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{ex.format}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onChange({ ...p, exercises: exercises.filter((_, j) => j !== i) })}
                className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                title="Xóa câu hỏi"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <AutoResizeTextarea
              value={ex.question || ''}
              minRows={2}
              placeholder="Nhập câu hỏi..."
              onChange={v => update(i, { question: v })}
              className={fieldCls + ' font-semibold'}
            />
            <button
              type="button"
              onClick={() => setShown(s => ({ ...s, [i]: !s[i] }))}
              className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              {reveal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {reveal ? 'Ẩn đáp án' : 'Xem đáp án / hướng dẫn giải'}
            </button>
            {reveal && (
              <AutoResizeTextarea
                value={ex.answer || ''}
                minRows={2}
                placeholder="Nhập đáp án hoặc gợi ý giải..."
                onChange={v => update(i, { answer: v })}
                className={fieldCls + ' bg-emerald-50/60 border-emerald-200 focus:border-emerald-500 text-[13px]'}
              />
            )}
          </div>
        )
      })}

      <button
        type="button"
        onClick={() => onChange({ ...p, exercises: [...exercises, { question: '', level: 'thong_hieu', answer: '' }] })}
        className="w-full py-2 rounded-xl border-2 border-dashed border-slate-300 text-xs font-bold text-slate-500 hover:text-blue-600 hover:border-blue-400 transition-colors flex items-center justify-center gap-1"
      >
        <Plus className="w-3.5 h-3.5" /> Thêm câu hỏi
      </button>
    </div>
  )
}
