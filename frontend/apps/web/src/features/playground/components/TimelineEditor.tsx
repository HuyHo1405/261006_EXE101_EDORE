'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  LayoutList, Plus, RotateCcw, ChevronRight, ChevronLeft, Eye, Pencil,
  ArrowRight, ListOrdered, Lightbulb, Target, FileText, Home, FolderOpen,
  BookOpen, Layers, CheckCircle2, Sparkles, PackageCheck, Presentation, Tv
} from 'lucide-react'
import type { TimelineStep } from '@/lib/services/pipelineService'
import { DashboardBreadcrumb } from '@/features/course/components/DashboardBreadcrumb'
import { mergeStepsWithPayload } from '../utils/stepEnrichment'
import { StepEnrichmentRender } from './payload/StepEnrichmentRender'

// ─── Inline markdown ──────────────────────────────────────────────────────────
function formatInlineMarkdown(text: string): React.ReactNode {
  if (!text) return ''
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-bold text-[var(--color-neutral-900)]">{part.slice(2, -2)}</strong>
      : part
  )
}

// ─── MD → HTML ────────────────────────────────────────────────────────────────
function mdToHtml(md: string): string {
  if (!md) return '<p><br></p>'
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  let html = '', inList = false, listType: 'ul' | 'ol' | null = null
  const closeList = () => { if (inList) { html += `</${listType}>`; inList = false; listType = null } }

  lines.forEach((line) => {
    const t = line.trim()
    if (!t) { closeList(); html += '<p><br></p>'; return }

    const h = t.match(/^(#{1,6})\s*(.*)$/)
    if (h) {
      closeList()
      html += `<h3>${h[2].replace(/\*\*/g, '')}</h3>`
      return
    }

    const b = t.match(/^[-*+]\s+(.*)$/)
    if (b) {
      if (!inList || listType !== 'ul') { closeList(); html += '<ul>'; inList = true; listType = 'ul' }
      html += `<li>${b[1].replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</li>`
      return
    }

    const n = t.match(/^(\d+)\.\s+(.*)$/)
    if (n) {
      if (!inList || listType !== 'ol') { closeList(); html += '<ol>'; inList = true; listType = 'ol' }
      html += `<li>${n[2].replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</li>`
      return
    }

    closeList()
    html += `<p>${t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</p>`
  })

  closeList()
  return html
}

// ─── HTML → MD ────────────────────────────────────────────────────────────────
function htmlToMd(html: string): string {
  if (!html) return ''
  const div = document.createElement('div')
  div.innerHTML = html

  function traverse(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || ''
    if (node.nodeType !== Node.ELEMENT_NODE) return ''

    const el = node as Element
    const tag = el.tagName.toLowerCase()
    const childrenText = Array.from(node.childNodes).map(traverse).join('')

    if (tag === 'strong' || tag === 'b') return childrenText ? `**${childrenText}**` : ''
    if (tag === 'em' || tag === 'i') return childrenText ? `*${childrenText}*` : ''
    if (tag === 'br') return '\n'
    if (tag === 'p' || tag === 'div') {
      const trimmed = childrenText.trim()
      if (!trimmed) return '\n'
      return `${childrenText}\n`
    }
    if (/^h[1-6]$/.test(tag)) {
      const trimmed = childrenText.replace(/^\s*#{1,6}\s*/, '').trim()
      return `\n### ${trimmed}\n`
    }
    if (tag === 'li') {
      const trimmed = childrenText.replace(/^([-*+]\s*|\d+\.\s*)/, '').trim()
      return `- ${trimmed}\n`
    }
    if (tag === 'ul' || tag === 'ol') return `\n${childrenText}\n`
    return childrenText
  }

  const rawMd = traverse(div)
  return rawMd.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

// ─── Inline Notion-style Editor ───────────────────────────────────────────────
function InlineEditor({
  value,
  onChange,
  readOnly = false,
  placeholder = 'Nhập nội dung giảng dạy chi tiết cho bước này (không bắt buộc nếu bước nhỏ)...',
}: {
  value: string
  onChange: (md: string) => void
  readOnly?: boolean
  placeholder?: string
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isFocusedRef = useRef(false)
  const [isFocused, setIsFocused] = useState(false)
  const [toolbarStyle, setToolbarStyle] = useState<React.CSSProperties>({ position: 'fixed', opacity: 0, pointerEvents: 'none', top: '-9999px', left: '-9999px' })

  // Sync external value -> innerHTML only when NOT focused by user
  useEffect(() => {
    if (editorRef.current && !isFocusedRef.current) {
      const html = mdToHtml(value)
      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html
      }
    }
  }, [value])

  // Initial sync on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = mdToHtml(value)
    }
  }, [])

  const handleInput = () => {
    if (!editorRef.current) return
    const md = htmlToMd(editorRef.current.innerHTML)
    onChange(md)
  }

  const handleFocus = () => {
    isFocusedRef.current = true
    setIsFocused(true)
  }

  const handleBlur = () => {
    isFocusedRef.current = false
    setIsFocused(false)
    setToolbarStyle({ position: 'fixed', opacity: 0, pointerEvents: 'none', top: '-9999px', left: '-9999px' })
    if (editorRef.current) {
      const md = htmlToMd(editorRef.current.innerHTML)
      onChange(md)
    }
  }

  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val)
    handleInput()
  }

  const updateToolbar = () => {
    if (!isFocusedRef.current) {
      setToolbarStyle({ position: 'fixed', opacity: 0, pointerEvents: 'none', top: '-9999px', left: '-9999px' })
      return
    }
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setToolbarStyle({ position: 'fixed', opacity: 0, pointerEvents: 'none', top: '-9999px', left: '-9999px' })
      return
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return
    setToolbarStyle({
      position: 'fixed',
      top: `${Math.max(10, rect.top - 44)}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translateX(-50%)',
      opacity: 1, pointerEvents: 'auto',
      transition: 'opacity 0.1s ease',
      zIndex: 9999,
    })
  }

  useEffect(() => {
    const h = () => setTimeout(updateToolbar, 10)
    document.addEventListener('selectionchange', h)
    return () => document.removeEventListener('selectionchange', h)
  }, [])

  return (
    <div className="relative group">
      <style>{`
        .inline-editor h3 { font-size: 0.95rem !important; font-weight: 700 !important; color: var(--color-neutral-900); margin: 0.75rem 0 0.35rem; }
        .inline-editor ul { list-style-type: disc !important; padding-left: 1.25rem !important; margin: 0.35rem 0 0.5rem; }
        .inline-editor ol { list-style-type: decimal !important; padding-left: 1.25rem !important; margin: 0.35rem 0 0.5rem; }
        .inline-editor li { margin: 0.2rem 0; }
        .inline-editor p { margin: 0.35rem 0; min-height: 1.25em; }
        .inline-editor[contenteditable="true"] { cursor: text; }
        .inline-editor[contenteditable="true"]:focus { outline: none; }
        .inline-editor:empty:before { content: attr(data-placeholder); color: var(--color-neutral-400); font-style: italic; pointer-events: none; }
      `}</style>

      {/* Floating selection toolbar */}
      {isFocused && (
        <div style={toolbarStyle} className="bg-[var(--color-neutral-900)] text-white rounded-[var(--radius-md)] shadow-xl px-2 py-1 flex items-center gap-1 z-50 select-none">
          <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('bold') }} className="px-2 py-1 hover:bg-white/20 rounded text-xs font-bold transition-colors">B</button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('italic') }} className="px-2 py-1 hover:bg-white/20 rounded text-xs italic transition-colors">I</button>
          <div className="w-px h-4 bg-white/20" />
          <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList') }} className="px-2 py-1 hover:bg-white/20 rounded text-xs transition-colors">• Danh sách</button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', '<h3>') }} className="px-2 py-1 hover:bg-white/20 rounded text-xs font-bold transition-colors">H3</button>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        data-placeholder={placeholder}
        className={`inline-editor prose max-w-none text-sm leading-relaxed text-[var(--color-neutral-900)] font-body rounded-[var(--radius-md)] transition-all duration-150 p-3 ${
          !readOnly && isFocused
            ? 'bg-white ring-2 ring-[var(--color-primary-400)] shadow-xs'
            : !readOnly
            ? 'hover:bg-[var(--color-neutral-50)] cursor-text border border-transparent hover:border-[var(--color-neutral-200)]'
            : ''
        }`}
        suppressContentEditableWarning
      />
    </div>
  )
}

// ─── Rich Text Editor ─────────────────────────────────────────────────────────
function RichTextEditor({ value, onChange, placeholder }: { value: string; onChange: (md: string) => void; placeholder?: string }) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [toolbarStyle, setToolbarStyle] = useState<React.CSSProperties>({ position: 'absolute', opacity: 0, pointerEvents: 'none', top: '-9999px', left: '-9999px' })

  useEffect(() => {
    if (editorRef.current) {
      const cur = editorRef.current.innerHTML
      const next = mdToHtml(value)
      if (htmlToMd(cur) !== htmlToMd(next)) editorRef.current.innerHTML = next
    }
  }, [value])

  const handleInput = () => { if (editorRef.current) onChange(htmlToMd(editorRef.current.innerHTML)) }

  const execCmd = (cmd: string, val: string | null = null) => { document.execCommand(cmd, false, val ?? undefined); handleInput() }

  const updateToolbar = () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setToolbarStyle({ position: 'absolute', opacity: 0, pointerEvents: 'none', top: '-9999px', left: '-9999px' }); return
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect()
    if (editorRef.current) {
      const cr = (editorRef.current.parentNode as Element).getBoundingClientRect()
      setToolbarStyle({
        position: 'absolute', top: `${rect.top - cr.top - 48}px`,
        left: `${rect.left - cr.left + rect.width / 2}px`, transform: 'translateX(-50%)',
        opacity: 1, pointerEvents: 'auto', transition: 'opacity 0.15s ease',
      })
    }
  }

  useEffect(() => {
    const h = () => setTimeout(updateToolbar, 10)
    document.addEventListener('selectionchange', h)
    return () => document.removeEventListener('selectionchange', h)
  }, [])

  return (
    <div className="relative border border-[var(--color-neutral-300)] rounded-[var(--radius-lg)] bg-white transition-all duration-200 hover:border-[var(--color-primary-300)] focus-within:border-[var(--color-primary-500)] focus-within:ring-2 focus-within:ring-[var(--color-primary-200)]">
      <style>{`
        .rich-editor-content ul { list-style-type: disc !important; padding-left: 1.25rem !important; margin: 0 0 0.5rem !important; }
        .rich-editor-content ol { list-style-type: decimal !important; padding-left: 1.25rem !important; margin: 0 0 0.5rem !important; }
        .rich-editor-content h3 { font-size: 1rem !important; font-weight: 700 !important; color: var(--color-neutral-900) !important; margin: 0.75rem 0 0.5rem; }
      `}</style>

      {/* Floating toolbar */}
      <div style={toolbarStyle} className="bg-white border border-[var(--color-neutral-300)] rounded-[var(--radius-md)] shadow-lg px-2 py-1 flex items-center gap-1 z-30">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('bold') }} className="p-1.5 hover:bg-[var(--color-neutral-100)] rounded-[var(--radius-sm)] text-[var(--color-neutral-700)] transition-colors">
          <span className="text-xs font-bold font-body">B</span>
        </button>
        <div className="w-px h-4 bg-[var(--color-neutral-200)]" />
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList') }} className="p-1.5 hover:bg-[var(--color-neutral-100)] rounded-[var(--radius-sm)] text-[var(--color-neutral-700)] transition-colors">
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-[var(--color-neutral-200)]" />
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', '<h3>') }} className="p-1.5 hover:bg-[var(--color-neutral-100)] rounded-[var(--radius-sm)] text-[var(--color-neutral-700)] text-[10px] font-bold transition-colors font-body">
          H
        </button>
      </div>

      <div ref={editorRef} contentEditable onInput={handleInput}
        className="w-full min-h-[140px] text-sm text-[var(--color-neutral-800)] p-4 focus:outline-none leading-relaxed rich-editor-content font-body"
        data-placeholder={placeholder} style={{ outline: 'none' }} />
    </div>
  )
}

// ─── Sidebar text formatter ───────────────────────────────────────────────────
function formatSidebarText(text: string) {
  if (!text) return <p className="font-body text-xs italic text-[var(--color-neutral-500)]">Không có nội dung.</p>
  return (
    <ul className="space-y-2">
      {text.split('\n').map((line, idx) => {
        const t = line.trim()
        if (!t) return null
        const m = t.match(/^(Bước\s+\d+|[0-9]+\.|-|\*)\s*[:.-]?\s*(.*)$/i)
        if (m) return (
          <li key={idx} className="flex gap-2 text-xs leading-relaxed text-[var(--color-neutral-800)] font-body">
            <span className="font-mono font-bold shrink-0 px-1.5 py-0.5 rounded-[var(--radius-xs)] text-[10px] h-fit bg-[var(--color-primary-100)] text-[var(--color-primary-700)] border border-[var(--color-primary-200)]">{m[1]}</span>
            <span className="flex-1 font-body text-xs text-[var(--color-neutral-800)]">{formatInlineMarkdown(m[2])}</span>
          </li>
        )
        return (
          <li key={idx} className="font-body text-xs leading-relaxed text-[var(--color-neutral-800)]">
            {formatInlineMarkdown(t)}
          </li>
        )
      })}
    </ul>
  )
}

// ─── Teaching content formatter ───────────────────────────────────────────────
function formatTeachingContent(text: string) {
  if (!text) return <p className="font-body text-sm italic text-[var(--color-neutral-500)]">Không có nội dung giảng dạy.</p>

  return (
    <div className="space-y-3 text-sm text-[var(--color-neutral-800)] leading-relaxed font-body">
      {text.split('\n').map((line, idx) => {
        const t = line.trim()
        if (!t) return <div key={idx} className="h-2" />

        const h = t.match(/^(#{1,6})\s+(.*)$/)
        if (h) {
          const l = h[1].length
          const cls = l === 1 ? 'text-base font-extrabold text-[var(--color-primary-700)]' : 'text-sm font-bold text-[var(--color-neutral-900)]'
          return <div key={idx} className={`font-body tracking-tight pt-2 pb-1 border-b border-[var(--color-neutral-200)] ${cls}`}>{formatInlineMarkdown(h[2])}</div>
        }

        const b = t.match(/^[-*+]\s+(.*)$/)
        if (b) return (
          <div key={idx} className="flex gap-2 pl-3 font-body text-sm text-[var(--color-neutral-800)]">
            <span className="text-[var(--color-primary-500)] font-bold select-none">•</span>
            <span className="flex-1">{formatInlineMarkdown(b[1])}</span>
          </div>
        )

        const n = t.match(/^(\d+)\.\s+(.*)$/)
        if (n) return (
          <div key={idx} className="flex gap-2 pl-3 font-body text-sm text-[var(--color-neutral-800)]">
            <span className="text-[var(--color-primary-600)] font-bold font-mono select-none">{n[1]}.</span>
            <span className="flex-1">{formatInlineMarkdown(n[2])}</span>
          </div>
        )

        return <p key={idx} className="font-body text-sm text-[var(--color-neutral-800)]">{formatInlineMarkdown(t)}</p>
      })}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getShortNodeName(step: TimelineStep, idx: number): string {
  const l = (step.type || '').toLowerCase()
  if (l.includes('khởi động') || l.includes('warm')) return 'Khởi động'
  if (l.includes('lý thuyết') || l.includes('core')) return 'Lý thuyết'
  if (l.includes('thực hành') || l.includes('practice')) return 'Thực hành'
  return step.type || `Phần ${idx + 1}`
}

// ─── Sub-step Parser ──────────────────────────────────────────────────────────
interface ActivitySubStep {
  idx: number
  label: string
  title: string
  raw: string
}

function parseActivitySubSteps(detailsRaw: string[] | string): ActivitySubStep[] {
  const lines = Array.isArray(detailsRaw)
    ? detailsRaw
    : (detailsRaw || '').split('\n')

  const validLines = lines.map(l => l.trim()).filter(Boolean)

  if (validLines.length === 0) {
    return [
      { idx: 0, label: '1.', title: 'Giáo viên chia lớp & Dẫn nhập bài học', raw: '1. Giáo viên chia lớp & Dẫn nhập bài học' },
      { idx: 1, label: '2.', title: 'Học sinh thực hiện nội dung & thảo luận', raw: '2. Học sinh thực hiện nội dung & thảo luận' },
      { idx: 2, label: '3.', title: 'Tổng kết & Đánh giá kết quả', raw: '3. Tổng kết & Đánh giá kết quả' },
    ]
  }

  return validLines.map((line, idx) => {
    const m = line.match(/^(Bước\s+\d+|[0-9]+\.|-|\*)\s*[:.-]?\s*(.*)$/i)
    if (m) {
      return {
        idx,
        label: `${idx + 1}.`,
        title: m[2] || line,
        raw: line,
      }
    }
    return {
      idx,
      label: `${idx + 1}.`,
      title: line,
      raw: `${idx + 1}. ${line}`,
    }
  })
}

// ─── Main component ───────────────────────────────────────────────────────────
interface TimelineEditorProps {
  steps: TimelineStep[]
  onStepsChange: (steps: TimelineStep[]) => void
  onRestart?: () => void
  contentSummary?: string
  courseId?: string
  courseTitle?: string
  scriptTitle?: string
}

export default function TimelineEditor({
  steps = [],
  onStepsChange,
  onRestart,
  contentSummary = '',
  courseId = '',
  courseTitle = '',
  scriptTitle = '',
}: TimelineEditorProps) {
  const [activeIdx, setActiveIdx] = useState(-1)
  const [expandedMaterialIdx, setExpandedMaterialIdx] = useState<number | null>(0)
  const [expandedStepIdx, setExpandedStepIdx] = useState<number | null>(0)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    setExpandedMaterialIdx(0)
    setExpandedStepIdx(0)
  }, [activeIdx])

  const current = steps[activeIdx] ?? ({} as Partial<TimelineStep>)
  const updateStep = (patch: Partial<TimelineStep>) => onStepsChange(steps.map((s, i) => (i === activeIdx ? { ...s, ...patch } : s)))

  const scrollToStep = (idx: number) => {
    setExpandedStepIdx(idx < 0 ? null : idx)
    if (idx < 0) return
    setTimeout(() => {
      const el = stepRefs.current[idx]
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - 160
      window.scrollTo({ top, behavior: 'smooth' })
    }, 50)
  }

  const totalDuration = steps.reduce((acc, s) => acc + (parseInt((s.duration || '10').replace(/[^0-9]/g, '')) || 10), 0)

  const cur = current as TimelineStep
  const activeType = cur.type || 'Hoạt động dạy học'

  const subSteps = parseActivitySubSteps(cur.details || [])

  const rawMaterials = Array.isArray(cur.pedagogNote) ? cur.pedagogNote.join('\n') : ((cur.pedagogNote as string) || '')
  const materialsList = rawMaterials.split('\n').map(l => l.replace(/^([-*+]\s*|\d+\.\s*|Chuẩn bị:\s*)/i, '').trim()).filter(Boolean)

  const enrichedSteps = mergeStepsWithPayload(
    cur.nodeTypeCode,
    cur.details || [],
    cur.activityStepRoles,
    materialsList,
    cur.nodePayload
  )

  const updateStepNote = (stepIdx: number, newText: string) => {
    const currentNotes = Array.isArray(cur.customStepNotes) ? [...cur.customStepNotes] : []
    currentNotes[stepIdx] = newText
    updateStep({ customStepNotes: currentNotes })
  }

  // Parse materials into Title + Description pairs for accordion expand items
  const parsedMaterials = (() => {
    const raw = Array.isArray(cur.pedagogNote) ? cur.pedagogNote.join('\n') : ((cur.pedagogNote as string) || '')
    const lines = raw.split('\n').map(l => l.replace(/^([-*+]\s*|\d+\.\s*|Chuẩn bị:\s*)/i, '').trim()).filter(Boolean)
    
    if (lines.length === 0) {
      return [
        { title: 'Giấy A1 & Bút màu', desc: 'Chia cho các nhóm học sinh vẽ sơ đồ tư duy và trình bày kết quả thảo luận.' },
        { title: 'Máy chiếu & Slide bài giảng', desc: 'Trình chiếu tình huống thực tế và bài tập mẫu định lý lượng giác.' },
        { title: 'Thước đo & Thước góc', desc: 'Học sinh dùng để đo chiều cao mô phỏng và tính toán các tỉ số lượng giác.' },
        { title: 'Phiếu bài tập cá nhân', desc: 'Phát cho mỗi học sinh để làm bài thực hành tự luyện tại lớp.' },
      ]
    }

    return lines.map(line => {
      const parts = line.split(/[:–-]\s*(.*)/)
      if (parts.length >= 2 && parts[1].trim()) {
        return { title: parts[0].trim(), desc: parts[1].trim() }
      }
      return { title: line, desc: 'Chi tiết vật tư & thiết bị hỗ trợ cho hoạt động giảng dạy này.' }
    })
  })()

  return (
    <div className="flex flex-col justify-between min-h-full font-body">
      
      {/* ─── Top Breadcrumb Bar (dashboard > course > script) ─── */}
      <DashboardBreadcrumb
        courseTitle={courseTitle || "Khóa học của tôi"}
        courseHref={courseId ? `/dashboard?courseId=${courseId}` : "/dashboard"}
        scriptTitle={
          activeIdx === -1
            ? (scriptTitle || "Tổng quan kịch bản")
            : (cur.title || `Phần ${activeIdx + 1}`)
        }
        badgeLabel={activeIdx === -1 ? "Kịch bản bài giảng" : (cur.type || "Chi tiết phần dạy")}
      />

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-12 gap-6 flex-1 items-start">
        {activeIdx === -1 ? (
          /* ── OVERVIEW ── */
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
                {contentSummary && (
                  <div className="p-5 bg-[var(--color-neutral-50)] border-l-4 border-l-[var(--color-primary-500)] border border-[var(--color-neutral-200)] rounded-[var(--radius-lg)] shadow-xs">
                    <h3 className="font-body font-bold text-xs text-[var(--color-primary-700)] mb-1 uppercase tracking-wide flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[var(--color-primary-500)]" />Tóm tắt nội dung bài học
                    </h3>
                    <p className="font-body text-sm text-[var(--color-neutral-700)] leading-relaxed italic">
                      {formatInlineMarkdown(contentSummary)}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="font-body font-bold text-xs text-[var(--color-neutral-800)] uppercase tracking-wide flex items-center gap-2">
                    <LayoutList className="w-4 h-4 text-[var(--color-primary-500)]" />Danh sách các phần dạy học ({steps.length})
                  </h3>
                  <div className="divide-y divide-[var(--color-neutral-200)] border border-[var(--color-neutral-200)] rounded-[var(--radius-lg)] overflow-hidden shadow-xs bg-white">
                    {steps.map((step, idx) => (
                      <div key={idx} onClick={() => setActiveIdx(idx)}
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
            <aside className="col-span-12 lg:col-span-4 space-y-4">
              <div className="border-2 border-[var(--color-neutral-200)] rounded-[var(--radius-xl)] bg-white overflow-hidden shadow-sm">
                <div className="p-4 bg-[var(--color-neutral-100)] border-b border-[var(--color-neutral-200)]">
                  <h4 className="font-body text-xs font-bold uppercase tracking-wide text-[var(--color-neutral-800)]">
                    Thông tin kịch bản
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
                  </div>

                  {steps.length > 0 && (
                    <button onClick={() => setActiveIdx(0)}
                      className="font-body w-full py-2.5 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-400)] text-white rounded-[var(--radius-md)] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 mt-2"
                    >
                      Bắt đầu xem & chỉnh sửa<ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </aside>
          </>
        ) : (
          /* ── NODE DETAIL ── */
          <>
            {/* Main Content Area (Implementation - Step Accordions with Embedded Slides) */}
            <main className="col-span-12 lg:col-span-8 border-2 border-[var(--color-neutral-200)] rounded-[var(--radius-xl)] flex flex-col bg-white overflow-hidden shadow-sm p-6 space-y-5">
              
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

              {/* NODE TITLE Header */}
              <div>
                <input
                  type="text"
                  value={cur.title ?? ''}
                  onChange={(e) => updateStep({ title: e.target.value })}
                  className="font-header font-extrabold text-2xl uppercase tracking-tight text-[var(--color-neutral-900)] bg-transparent border-b border-transparent hover:border-[var(--color-neutral-300)] focus:border-[var(--color-primary-500)] focus:outline-none w-full pb-1 transition-all placeholder:text-[var(--color-neutral-400)]"
                  placeholder="NODE TITLE..."
                />
              </div>



              {/* 📌 NỘI DUNG THEO TỪNG BƯỚC */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-center px-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4.5 h-4.5 text-[var(--color-primary-600)]" />
                    <h3 className="font-header text-sm uppercase tracking-wider font-extrabold text-[var(--color-neutral-900)]">
                      NỘI DUNG BÀI GIẢNG
                    </h3>
                  </div>
                </div>

                {cur.isLoading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-12 bg-[var(--color-neutral-100)] rounded-[var(--radius-xl)] animate-pulse border-2 border-[var(--color-neutral-200)]" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subSteps.map((step, idx) => {
                      const isExpanded = expandedStepIdx === idx
                      const enrichment = enrichedSteps[idx]?.enrichment ?? null
                      return (
                        <div
                          key={idx}
                          ref={el => { stepRefs.current[idx] = el }}
                          className={`border-2 rounded-[var(--radius-xl)] overflow-hidden transition-all duration-200 ${
                            isExpanded
                              ? 'border-[var(--color-primary-500)] ring-2 ring-[var(--color-primary-100)]'
                              : 'border-[var(--color-neutral-200)] hover:border-[var(--color-primary-300)]'
                          }`}
                        >
                          {/* Header */}
                          <div
                            onClick={() => setExpandedStepIdx(isExpanded ? null : idx)}
                            className="px-4 py-3 bg-[var(--color-neutral-50)] hover:bg-[var(--color-primary-50)]/60 cursor-pointer flex items-center justify-between gap-3 select-none"
                          >
                            <p className="font-body text-sm font-semibold text-[var(--color-neutral-800)] leading-snug">
                              {step.raw}
                            </p>
                            <ChevronRight
                              className={`w-4.5 h-4.5 text-[var(--color-neutral-400)] transition-transform duration-200 shrink-0 ${
                                isExpanded ? 'rotate-90 text-[var(--color-primary-600)]' : ''
                              }`}
                            />
                          </div>

                          {/* Body */}
                          {isExpanded && (
                            <div className="px-5 py-4 border-t border-[var(--color-neutral-200)] bg-white animate-fade-in space-y-4">
                              {enrichment && (
                                <StepEnrichmentRender
                                  enrichment={enrichment}
                                  payload={cur.nodePayload}
                                  onPayloadChange={(newPayload) => updateStep({ nodePayload: newPayload })}
                                />
                              )}
                              
                              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Ghi chú & Tùy chỉnh của giáo viên</span>
                                </div>
                                <InlineEditor
                                  value={(cur.customStepNotes && cur.customStepNotes[idx]) || ''}
                                  onChange={(md) => updateStepNote(idx, md)}
                                  placeholder="Ghi chú thêm hoặc tùy chỉnh hướng dẫn cho bước này..."
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </main>

            {/* Right Sidebar: Interface Blueprint Specification */}
            <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4 sticky top-6 self-start">
              <div className="bg-[var(--color-neutral-200)] border border-[var(--color-neutral-300)] p-4 sm:p-5 rounded-[var(--radius-xl)] shadow-sm flex flex-col gap-3">
                
                {/* Header: Solid Brand Blue Banner at top */}
                <div className="bg-[var(--color-primary-500)] text-white p-3.5 rounded-[var(--radius-lg)] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-white" />
                    <h4 className="font-header font-extrabold text-base uppercase tracking-wider text-white">
                      GỢI Ý HOẠT ĐỘNG
                    </h4>
                  </div>
                </div>

                {/* Card 1: 1. TÊN HOẠT ĐỘNG */}
                <div className="bg-white border-[3px] border-[var(--color-primary-500)] p-3 rounded-[var(--radius-lg)] shadow-xs">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary-700)] block mb-0.5">Tên hoạt động</label>
                  {cur.isLoading ? (
                    <div className="h-6 bg-[var(--color-neutral-100)] rounded animate-pulse" />
                  ) : (
                    <div className="font-body text-xs font-bold text-[var(--color-neutral-900)]">
                      {cur.appliedActivity || '—'}
                    </div>
                  )}
                </div>

                {/* Card 2: ĐIỀU HƯỚNG BƯỚC (Quick View / Navigation Index) */}
                <div className="bg-white border-[3px] border-[var(--color-primary-500)] p-3.5 rounded-[var(--radius-lg)] shadow-xs">
                  <div className="border-b border-[var(--color-neutral-200)] pb-1.5 mb-2">
                    <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary-700)]">
                      Điều hướng các bước ({subSteps.length} bước)
                    </label>
                  </div>

                  <div>
                    {cur.isLoading ? (
                      <div className="space-y-2 py-1">
                        <div className="h-3 bg-[var(--color-neutral-100)] rounded w-full animate-pulse" />
                        <div className="h-3 bg-[var(--color-neutral-100)] rounded w-11/12 animate-pulse" />
                        <div className="h-3 bg-[var(--color-neutral-100)] rounded w-4/5 animate-pulse" />
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                        {subSteps.map((step, idx) => {
                          const isExpanded = expandedStepIdx === idx
                          const titleText = step.title || step.raw.replace(/^(Bước\s+\d+|[0-9]+\.)\s*/i, '').trim()
                          return (
                            <div
                              key={idx}
                              onClick={() => scrollToStep(isExpanded ? -1 : idx)}
                              title={step.raw}
                              className={`px-2.5 py-1.5 rounded-[var(--radius-md)] text-xs cursor-pointer transition-all flex items-center gap-2 select-none ${
                                isExpanded
                                  ? 'bg-[var(--color-primary-50)] border border-[var(--color-primary-300)] text-[var(--color-primary-900)] font-bold shadow-2xs'
                                  : 'bg-white border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] hover:border-[var(--color-primary-200)] hover:bg-slate-50'
                              }`}
                            >
                              <span className="font-mono text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                B{idx + 1}
                              </span>
                              <span className="truncate flex-1 font-body text-xs">{titleText}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 3: VẬT TƯ & THIẾT BỊ (read-only) */}
                <div className="space-y-2 pt-1">
                  <div className="px-1">
                    <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-neutral-700)]">Vật tư &amp; Thiết bị</label>
                  </div>

                  {cur.isLoading ? (
                    <div className="space-y-2">
                      {[1,2,3,4].map(i => <div key={i} className="h-10 bg-white rounded-[var(--radius-lg)] animate-pulse border-[3px] border-[var(--color-primary-500)]" />)}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {parsedMaterials.slice(0, 4).map((mat, idx) => {
                        const isExpanded = expandedMaterialIdx === idx
                        return (
                          <div
                            key={idx}
                            onClick={() => setExpandedMaterialIdx(isExpanded ? null : idx)}
                            className="bg-white border-[3px] border-[var(--color-primary-500)] p-3 rounded-[var(--radius-lg)] shadow-xs transition-all duration-200 cursor-pointer hover:bg-[var(--color-primary-50)]/30"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className="w-2 h-2 rounded-full bg-[var(--color-primary-500)] shrink-0" />
                                <span className="font-body text-xs text-[var(--color-neutral-900)] font-bold truncate">
                                  {mat.title}
                                </span>
                              </div>
                              <ChevronRight className={`w-4 h-4 text-[var(--color-primary-600)] transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                            </div>

                            {isExpanded && (
                              <div className="pt-2 mt-2 border-t border-[var(--color-neutral-200)] font-body text-xs text-[var(--color-neutral-700)] leading-relaxed bg-[var(--color-neutral-50)] p-2.5 rounded-[var(--radius-md)] animate-fade-in">
                                {mat.desc}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

              </div>
            </aside>
          </>
        )}
      </div>

      {/* ─── Full-width Sticky Bottom Dock Bar ─── */}
      <div className="sticky bottom-0 z-30 w-full mt-6 pt-5 pb-2 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-md">
        <nav className="w-full p-2.5 bg-white border-2 border-[var(--color-neutral-200)] rounded-[var(--radius-xl)] shadow-xl flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Overview + Steps Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 max-w-[70vw] sm:max-w-none">
            {/* Overview Button */}
            <button
              onClick={() => setActiveIdx(-1)}
              className={`font-body px-4 py-2 rounded-[var(--radius-lg)] flex items-center gap-2 transition-all font-bold text-xs shadow-xs shrink-0 ${
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
                  onClick={() => setActiveIdx(idx)}
                  className={`font-body px-4 py-2 rounded-[var(--radius-lg)] flex items-center gap-2 transition-all font-bold text-xs shadow-xs border shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-[var(--color-primary-500)] text-white border-[var(--color-primary-500)] shadow-md'
                      : 'bg-white hover:bg-[var(--color-neutral-100)] text-[var(--color-neutral-800)] border border-[var(--color-neutral-300)]'
                  }`}
                >
                  {step.isLoading ? (
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <span className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-[var(--radius-xs)] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]'
                    }`}>
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
              onClick={() => setActiveIdx(Math.max(-1, activeIdx - 1))}
              disabled={activeIdx <= -1}
              className="w-9 h-9 flex items-center justify-center bg-white hover:bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] border border-[var(--color-neutral-300)] rounded-[var(--radius-lg)] transition-colors shadow-xs disabled:opacity-40"
              title="Phần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveIdx(Math.min(steps.length - 1, activeIdx + 1))}
              disabled={activeIdx >= steps.length - 1}
              className="w-9 h-9 flex items-center justify-center bg-white hover:bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] border border-[var(--color-neutral-300)] rounded-[var(--radius-lg)] transition-colors shadow-xs disabled:opacity-40"
              title="Phần tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </div>

    </div>
  )
}
