'use client'

import React, { useState, useRef, useEffect } from 'react'

// ─── Inline markdown ──────────────────────────────────────────────────────────
export function formatInlineMarkdown(text: string): React.ReactNode {
  if (!text) return ''
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-bold text-[var(--color-neutral-900)]">{part.slice(2, -2)}</strong>
      : part
  )
}

// ─── MD → HTML ────────────────────────────────────────────────────────────────
export function mdToHtml(md: string): string {
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
export function htmlToMd(html: string): string {
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
export function InlineEditor({
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
  const [toolbarStyle, setToolbarStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    opacity: 0,
    pointerEvents: 'none',
    top: '-9999px',
    left: '-9999px',
  })

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
      opacity: 1,
      pointerEvents: 'auto',
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
        className={`inline-editor prose max-w-none text-sm leading-relaxed text-[var(--color-neutral-900)] font-body rounded-[var(--radius-md)] transition-all duration-150 p-3 ${!readOnly && isFocused
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
