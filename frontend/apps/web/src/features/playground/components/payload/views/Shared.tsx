'use client'

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  HelpCircle, MessageCircle, Flag, ChevronRight, Lightbulb, Plus, Trash2,
  Eye, EyeOff, Award, Target, ClipboardList, Pencil, ListChecks,
  Monitor, Ruler, FileText, Package, PackageCheck, Presentation,
  Compass, Sparkles, Check, ArrowDown, Quote, Wand2, ArrowRight,
  Image as ImageIcon, BookOpen, Gamepad2, Zap, Play, X, Loader2,
} from 'lucide-react'
import { createPortal } from 'react-dom'
import { AutoResizeTextarea } from '../StepEnrichmentRender'
import { classifyMaterial, splitStepText } from '../../../utils/stepText'
import type { MaterialKind, ParsedMaterial } from '../../../utils/stepText'
import { normalizeNodeType } from '../../../utils/stepEnrichment'
import { parseTeachingTools } from '../../LessonOverviewPanel'


// ─── Shared bits ──────────────────────────────────────────────────────────────
export const TONE_TEXT: Record<string, string> = {
  slate: 'text-slate-700', amber: 'text-amber-700', sky: 'text-sky-700', emerald: 'text-emerald-700',
  indigo: 'text-indigo-700', blue: 'text-blue-700', purple: 'text-purple-700',
}
export const TONE_BG: Record<string, string> = {
  purple: 'bg-purple-500', indigo: 'bg-indigo-500', sky: 'bg-sky-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500',
}

export function SectionLabel({ icon, children, tone = 'slate' }: { icon: ReactNode; children: ReactNode; tone?: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${TONE_TEXT[tone] || TONE_TEXT.slate}`}>
      {icon}
      <span>{children}</span>
    </div>
  )
}

export const fieldCls =
  'font-body text-sm leading-relaxed text-slate-800 bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-sky-400 rounded-lg p-2.5 outline-none transition-all'

/** Danh sách chuỗi có thể sửa / thêm / xóa */
export function EditableList({
  items, onChange, placeholder, addLabel, marker = 'bg-sky-500',
}: {
  items: string[]
  onChange: (v: string[]) => void
  placeholder: string
  addLabel: string
  marker?: string
}) {
  const list = Array.isArray(items) ? items : []
  return (
    <div className="space-y-1.5">
      {list.map((it, i) => (
        <div key={i} className="flex items-start gap-2 group">
          <span className={`mt-3 w-1.5 h-1.5 rounded-full shrink-0 ${marker}`} />
          <AutoResizeTextarea
            value={it}
            minRows={1}
            placeholder={placeholder}
            onChange={v => onChange(list.map((x, j) => (j === i ? v : x)))}
            className={fieldCls + ' flex-1 py-1.5'}
          />
          <button
            type="button"
            onClick={() => onChange(list.filter((_, j) => j !== i))}
            className="mt-1.5 p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            title="Xóa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...list, ''])}
        className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800 px-1 py-1 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" /> {addLabel}
      </button>
    </div>
  )
}

// ─── Materials ────────────────────────────────────────────────────────────────
const KIND_STYLE: Record<MaterialKind, { icon: ReactNode; tile: string; tag: string }> = {
  device: { icon: <Monitor className="w-4 h-4" />, tile: 'bg-sky-100 text-sky-700 border-sky-200', tag: 'bg-sky-50 text-sky-700 border-sky-200' },
  tool: { icon: <Ruler className="w-4 h-4" />, tile: 'bg-amber-100 text-amber-700 border-amber-200', tag: 'bg-amber-50 text-amber-700 border-amber-200' },
  document: { icon: <FileText className="w-4 h-4" />, tile: 'bg-emerald-100 text-emerald-700 border-emerald-200', tag: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  other: { icon: <Package className="w-4 h-4" />, tile: 'bg-slate-100 text-slate-600 border-slate-200', tag: 'bg-slate-50 text-slate-600 border-slate-200' },
}

export function MaterialList({
  materials, emptyText = 'Chưa có vật tư / thiết bị.',
}: {
  materials: ParsedMaterial[]
  compact?: boolean
  emptyText?: string
}) {
  if (!materials.length) return <p className="text-xs italic text-slate-500">{emptyText}</p>
  return (
    <ul className="flex flex-col gap-1.5">
      {materials.map((m, i) => {
        const info = classifyMaterial(m.title)
        const st = KIND_STYLE[info.kind]
        return (
          <li
            key={i}
            className="flex items-center gap-2.5 bg-white border border-slate-200/90 rounded-lg p-2 hover:border-slate-300 transition-colors shadow-2xs"
            title={m.desc || m.title}
          >
            <span className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${st.tile}`}>
              {st.icon}
            </span>
            <span className="font-body text-xs font-bold text-slate-900 min-w-0 flex-1 leading-snug break-words">
              {m.title}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

// ─── Step list (title + description) ──────────────────────────────────────────
export function StepList({
  steps, renderNote, title = 'Tiến trình thực hiện',
}: {
  steps: string[]
  renderNote?: (idx: number) => ReactNode
  title?: string
}) {
  const [openNote, setOpenNote] = useState<number | null>(null)
  if (!steps.length) return null
  return (
    <div className="space-y-2">
      <SectionLabel icon={<ListChecks className="w-3.5 h-3.5" />}>{title} ({steps.length} bước)</SectionLabel>
      <ol className="relative space-y-2 pl-1">
        {steps.map((raw, idx) => {
          const { title: t, desc } = splitStepText(raw)
          const noteOpen = openNote === idx
          return (
            <li key={idx} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 border border-sky-200 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                {idx < steps.length - 1 && <span className="flex-1 w-px bg-slate-200 mt-1" />}
              </div>
              <div className="flex-1 pb-2 min-w-0">
                <p className="font-body text-sm font-bold text-slate-900 leading-snug">{t}</p>
                {desc && <p className="font-body text-xs text-slate-600 leading-relaxed mt-0.5">{desc}</p>}
                {renderNote && (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenNote(noteOpen ? null : idx)}
                      className="mt-1 flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-sky-600 transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> {noteOpen ? 'Ẩn ghi chú' : 'Ghi chú'}
                    </button>
                    {noteOpen && <div className="mt-1.5">{renderNote(idx)}</div>}
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// ─── Image Gallery ─────────────────────────────────────────────────────────────
export function ImageGallery({
  usedImageIds,
  images,
  layout = 'grid'
}: {
  usedImageIds?: string[]
  images?: any[]
  layout?: 'grid' | 'stack'
}) {
  const [selectedImage, setSelectedImage] = useState<any | null>(null)
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})

  if (!usedImageIds || !usedImageIds.length) return null

  // Tìm các ảnh có id trong usedImageIds
  const displayImages = usedImageIds.map(id => {
    return images?.find(img => img.id === id) || { id, title: 'Ảnh không xác định', url: '' }
  })

  const gridClass = layout === 'stack' ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'

  return (
    <>
      <div className={`grid ${gridClass} gap-3 mt-3`}>
        {displayImages.map((img, idx) => (
          <div 
            key={idx} 
            onClick={() => { if (img.url) setSelectedImage(img) }}
            className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex flex-col items-center justify-center cursor-pointer shadow-xs hover:shadow-md transition-shadow"
          >
            {img.url ? (
              <>
                {loadingMap[img.id] !== false && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100 animate-pulse">
                    <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                  </div>
                )}
                <img 
                  src={img.url} 
                  alt={img.title || img.name || 'Ảnh trực quan'} 
                  onLoad={() => setLoadingMap(prev => ({ ...prev, [img.id]: false }))}
                  className={`w-full h-full object-contain bg-white transition-all duration-300 ${loadingMap[img.id] !== false ? 'opacity-0 scale-95' : 'opacity-100 scale-100 group-hover:scale-105'}`} 
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-2 text-slate-400">
                <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                <span className="text-[10px] font-mono text-center break-all px-2 line-clamp-2">{img.id}</span>
              </div>
            )}
            {img.title && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-8">
                <p className="text-white text-[11px] font-bold truncate drop-shadow-sm">{img.title}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox / Modal */}
      {selectedImage && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer z-50"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedImage(null)
            }}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center z-40"
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={selectedImage.url} 
              alt={selectedImage.title || 'Phóng to'} 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10 select-none" 
            />
            {selectedImage.title && (
              <div className="mt-4 text-center">
                <h3 className="text-white font-header font-bold text-lg">{selectedImage.title}</h3>
                {selectedImage.caption && selectedImage.caption !== selectedImage.title && (
                  <p className="text-slate-300 text-sm mt-1">{selectedImage.caption}</p>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
