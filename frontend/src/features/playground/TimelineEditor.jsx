import { useState, useRef, useEffect } from 'react'

// Helper to render bold markdown (**text** -> <strong>text</strong>)
function formatInlineMarkdown(text, isDark = false) {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-[#151b2d]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// Helper to parse markdown to HTML for rich editing
function mdToHtml(md) {
  if (!md) return '';
  const lines = md.trim().replace(/\r\n/g, '\n').split('\n');
  let html = '';
  let inList = false;
  let listType = null;

  const closeList = () => {
    if (inList) {
      html += `</${listType}>`;
      inList = false;
      listType = null;
    }
  };

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      html += '<p><br></p>';
      return;
    }

    // Header (strip bold formatting inside headers)
    const headerMatch = trimmed.match(/^(#{1,6})\s*(.*)$/);
    if (headerMatch) {
      closeList();
      const content = headerMatch[2].replace(/\*\*/g, '');
      html += `<h3>${content}</h3>`;
      return;
    }

    // Bullet list
    const bulletMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (bulletMatch) {
      if (!inList || listType !== 'ul') {
        closeList();
        html += '<ul>';
        inList = true;
        listType = 'ul';
      }
      const content = bulletMatch[1].replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      html += `<li>${content}</li>`;
      return;
    }

    // Numbered list
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      if (!inList || listType !== 'ol') {
        closeList();
        html += '<ol>';
        inList = true;
        listType = 'ol';
      }
      const content = numMatch[2].replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      html += `<li>${content}</li>`;
      return;
    }

    // Normal paragraph
    closeList();
    const content = trimmed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html += `<p>${content}</p>`;
  });

  closeList();
  return html;
}

// Helper to convert HTML back to markdown
function htmlToMd(html) {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      let childrenContent = Array.from(node.childNodes).map(traverse).join('');

      if (tag === 'strong' || tag === 'b') {
        return `**${childrenContent}**`;
      }
      if (tag === 'p') {
        return `\n${childrenContent}\n`;
      }
      if (tag === 'br') {
        return '\n';
      }
      if (tag === 'li') {
        const cleanContent = childrenContent.replace(/^([-*+]\s*|\d+\.\s*)/, '');
        return `\n- ${cleanContent}\n`;
      }
      if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
        // Strip bold markdown markers in case any children were bold
        const cleanContent = childrenContent.replace(/\*\*/g, '').replace(/^(#{1,6})\s*/, '');
        return `\n### ${cleanContent}\n`;
      }
      return childrenContent;
    }
    return '';
  }

  const rawMd = Array.from(tempDiv.childNodes).map(traverse).join('');
  return rawMd
    .split('\n')
    .map(line => line.trim())
    .filter((line, i, arr) => line !== '' || arr[i - 1] !== '')
    .join('\n')
    .trim();
}

// Rich Text Editor Component
function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const [toolbarStyle, setToolbarStyle] = useState({ position: 'absolute', opacity: 0, pointerEvents: 'none', top: '-9999px', left: '-9999px' });

  useEffect(() => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      const convertedHtml = mdToHtml(value);
      if (htmlToMd(currentHtml) !== htmlToMd(convertedHtml)) {
        editorRef.current.innerHTML = convertedHtml;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      const md = htmlToMd(currentHtml);
      onChange(md);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const toggleHeader = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let parent = selection.getRangeAt(0).startContainer;
      while (parent && parent !== editorRef.current) {
        if (parent.nodeName === 'H3' || parent.nodeName === 'H2' || parent.nodeName === 'H1') {
          execCommand('formatBlock', '<p>');
          return;
        }
        parent = parent.parentNode;
      }
    }
    execCommand('formatBlock', '<h3>');
    setTimeout(() => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        let node = sel.getRangeAt(0).startContainer;
        while (node && node !== editorRef.current) {
          if (node.nodeName === 'H3' || node.nodeName === 'H2' || node.nodeName === 'H1') {
            const strongs = node.querySelectorAll('strong, b');
            strongs.forEach(s => {
              const textNode = document.createTextNode(s.textContent);
              s.parentNode.replaceChild(textNode, s);
            });
            handleInput();
            break;
          }
          node = node.parentNode;
        }
      }
      updateToolbarPosition();
    }, 0);
  };

  const updateToolbarPosition = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setToolbarStyle({ position: 'absolute', opacity: 0, pointerEvents: 'none', top: '-9999px', left: '-9999px' });
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    if (editorRef.current) {
      const containerRect = editorRef.current.parentNode.getBoundingClientRect();
      const top = rect.top - containerRect.top - 48; // 48px above selected text
      const left = rect.left - containerRect.left + (rect.width / 2);

      setToolbarStyle({
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        transform: 'translateX(-50%)',
        opacity: 1,
        pointerEvents: 'auto',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
      });
    }
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      setTimeout(updateToolbarPosition, 10);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  return (
    <div className="relative border border-[#e2e8f0] rounded-xl bg-white transition-all duration-200 hover:border-[#0058be]/30 focus-within:border-[#0058be] focus-within:ring-2 focus-within:ring-[#0058be]/10">
      <style>{`
        .rich-editor-content ul { list-style-type: disc !important; padding-left: 1.25rem !important; margin-top: 0px !important; margin-bottom: 0.5rem !important; }
        .rich-editor-content ol { list-style-type: decimal !important; padding-left: 1.25rem !important; margin-top: 0px !important; margin-bottom: 0.5rem !important; }
        .rich-editor-content h3 { font-size: 1.125rem !important; font-weight: 700 !important; color: #151b2d !important; margin-top: 0.75rem; margin-bottom: 0.5rem; }
        .rich-editor-content h2 { font-size: 1.25rem !important; font-weight: 700 !important; color: #151b2d !important; margin-top: 0.75rem; margin-bottom: 0.5rem; }
        .rich-editor-content h1 { font-size: 1.5rem !important; font-weight: 800 !important; color: #151b2d !important; margin-top: 0.75rem; margin-bottom: 0.5rem; }
      `}</style>
      
      {/* Selection-based Floating Menu */}
      <div 
        style={toolbarStyle}
        className="bg-white border border-[#e2e8f0] rounded-xl shadow-lg px-2 py-1 flex items-center gap-1 z-30"
      >
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('bold');
          }}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 flex items-center justify-center transition-colors"
          title="In đậm (Ctrl+B)"
        >
          <span className="material-symbols-outlined text-[18px]">format_bold</span>
        </button>
        <div className="w-[1px] h-4 bg-[#e2e8f0]" />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('insertUnorderedList');
          }}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 flex items-center justify-center transition-colors"
          title="Danh sách dấu chấm"
        >
          <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
        </button>
        <div className="w-[1px] h-4 bg-[#e2e8f0]" />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            toggleHeader();
          }}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 flex items-center justify-center font-bold text-xs transition-colors"
          title="Tiêu đề (H3)"
        >
          H
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="w-full min-h-[150px] text-sm text-[#424754] p-4 focus:outline-none leading-relaxed rich-editor-content"
        placeholder={placeholder}
        style={{ outline: 'none' }}
      />
    </div>
  );
}

// Helper to format structured sidebar content
function formatSidebarText(text, isDark = false) {
  if (!text) return <p className="text-xs italic text-[#727785]">Không có nội dung.</p>;
  const lines = text.split('\n');
  return (
    <ul className="space-y-3">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Check for numbered steps or bullet markers
        const stepMatch = trimmed.match(/^(Bước\s+\d+|[0-9]+\.|-|\*)\s*[:.-]?\s*(.*)$/i);
        if (stepMatch) {
          const marker = stepMatch[1];
          const content = stepMatch[2];
          return (
            <li key={idx} className="flex gap-2 text-xs leading-relaxed text-[#334155]">
              <span className="font-bold shrink-0 font-mono px-2 py-0.5 rounded text-[10px] h-fit bg-[#eaedff] text-[#0058be]">
                {marker}
              </span>
              <span className="flex-1">{formatInlineMarkdown(content, isDark)}</span>
            </li>
          );
        }

        return (
          <li key={idx} className="text-xs leading-relaxed list-none pl-2 border-l-2 text-[#334155] border-slate-300">
            {formatInlineMarkdown(trimmed, isDark)}
          </li>
        );
      })}
    </ul>
  );
}

// Helper to format teaching content with headers, lists, bold text, etc.
function formatTeachingContent(text) {
  if (!text) return <p className="text-sm italic text-[#727785]">Không có nội dung giảng dạy.</p>;

  const lines = text.split('\n');
  return (
    <div className="space-y-3 text-sm text-[#424754] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        // Headers: ### Header, ## Header, # Header
        const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const content = headerMatch[2];
          const sizeClass =
            level === 1 ? 'text-lg font-extrabold text-[#151b2d]' :
              level === 2 ? 'text-base font-bold text-[#151b2d]' :
                'text-sm font-bold text-[#151b2d]';
          return (
            <div key={idx} className={`pt-3 pb-1 border-b border-[#e2e8f0]/40 ${sizeClass}`}>
              {formatInlineMarkdown(content)}
            </div>
          );
        }

        // Check for bullet list (-, *, +)
        const bulletMatch = trimmed.match(/^[-*+]\s+(.*)$/);
        if (bulletMatch) {
          const content = bulletMatch[1];
          return (
            <div key={idx} className="flex gap-2 pl-4 list-none text-[#424754]">
              <span className="text-[#0058be] font-bold select-none">•</span>
              <span className="flex-1">{formatInlineMarkdown(content)}</span>
            </div>
          );
        }

        // Check for numbered list (1., 2., etc.)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          const num = numMatch[1];
          const content = numMatch[2];
          return (
            <div key={idx} className="flex gap-2 pl-4 list-none text-[#424754]">
              <span className="text-[#0058be] font-semibold font-mono select-none">{num}.</span>
              <span className="flex-1">{formatInlineMarkdown(content)}</span>
            </div>
          );
        }

        // Default paragraph
        return (
          <p key={idx} className="text-[#424754]">
            {formatInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Auto-expanding textarea component
function AutoExpandingTextarea({ value, onChange, placeholder, className, rows = 3 }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${className} overflow-hidden resize-none`}
      rows={rows}
    />
  );
}

// Helper for clean, short node name in Top Nav
function getShortNodeName(step, idx) {
  const stepType = step.type || step.node_name || '';
  const lower = stepType.toLowerCase();

  if (lower.includes('khởi động') || lower.includes('warm')) return 'Khởi động';
  if (lower.includes('lý thuyết') || lower.includes('core')) return 'Lý thuyết';
  if (lower.includes('thực hành') || lower.includes('practice')) return 'Thực hành';

  // Đã sửa: Trả về trực tiếp loại node (stepType) thay vì title
  return stepType || `Phần ${idx + 1}`;
}

export default function TimelineEditor({ steps = [], onStepsChange, onRestart, contentSummary = '' }) {
  const [activeIdx, setActiveIdx] = useState(-1) // -1 is Overview & TOC
  const [isContentExpanded, setIsContentExpanded] = useState(true)

  // Edit mode toggles for sidebar panels and main content
  const [editingSuggestions, setEditingSuggestions] = useState(false)
  const [editingInstructions, setEditingInstructions] = useState(false)
  const [editingContent, setEditingContent] = useState(false)

  // Reset all edit modes when active index changes
  useEffect(() => {
    setEditingSuggestions(false)
    setEditingInstructions(false)
    setEditingContent(false)
  }, [activeIdx])

  const current = steps[activeIdx] ?? {}

  const updateStep = (patch) => {
    const next = steps.map((s, i) => (i === activeIdx ? { ...s, ...patch } : s))
    onStepsChange(next)
  }

  const addActivity = () => {
    const newStep = {
      time: '—',
      title: 'Hoạt động bổ sung',
      duration: "10'",
      type: 'Hoạt động',
      intent: 'VD - Vận dụng',
      details: ['Bước 1: ...', 'Bước 2: ...'],
      originalContent: 'Nội dung kiến thức...',
      pedagogNote: 'Vật liệu cần chuẩn bị...',
    }
    const next = [...steps, newStep]
    onStepsChange(next)
    setActiveIdx(next.length - 1)
  }

  const removeStep = (idx) => {
    if (steps.length <= 1) return
    const next = steps.filter((_, i) => i !== idx)
    onStepsChange(next)
    setActiveIdx(Math.max(-1, idx - 1))
  }

  const typeColors = {
    // New short enum keys (from updated AI schema)
    'Khởi động': 'bg-[#fff3cd] text-[#856404] border-[#ffc107]/40',
    'Lý thuyết cốt lõi': 'bg-[#d1e7ff] text-[#0058be] border-[#0058be]/30',
    'Thực hành & Vận dụng': 'bg-[#d1f7e6] text-[#006c49] border-[#198754]/30',
    // Legacy fallback keys
    'Khởi động (Warm-up)': 'bg-[#fff3cd] text-[#856404] border-[#ffc107]/40',
    'Lý thuyết cốt lõi (Core Theory)': 'bg-[#d1e7ff] text-[#0058be] border-[#0058be]/30',
    'Thực hành & Vận dụng (Practice)': 'bg-[#d1f7e6] text-[#006c49] border-[#198754]/30',
  }

  const activeTitle = current.title || current.applied_activity || ''
  const activeType = current.type || current.node_name || 'Chưa phân loại'
  const activeIntent = current.intent || current.node_intent || ''
  const activeDuration = current.duration || (current.estimated_time_minutes ? `${current.estimated_time_minutes}'` : "10'")
  const activeAppliedActivity = current.appliedActivity || current.applied_activity || '—'

  // Calculate total time
  const totalDuration = steps.reduce((acc, s) => {
    const dStr = s.duration || (s.estimated_time_minutes ? `${s.estimated_time_minutes}` : '10')
    const num = parseInt(dStr.replace(/[^0-9]/g, '')) || 10
    return acc + num
  }, 0)

  // Navigate to next node
  const handleNext = () => {
    if (activeIdx < steps.length - 1) {
      setActiveIdx(activeIdx + 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── Top Navigation Bar (wrapping, no scroll) ─── */}
      <nav className="flex flex-wrap items-center gap-2 p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl shadow-sm stage-enter delay-0">
        {/* Section 0: Overview & TOC */}
        <button
          onClick={() => setActiveIdx(-1)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-semibold text-xs shadow-sm ${activeIdx === -1
            ? 'bg-[#0058be] text-white'
            : 'bg-white hover:bg-[#eaedff]/50 text-[#424754] border border-[#e2e8f0]'
            }`}
        >
          <span className="material-symbols-outlined text-[15px]">overview</span>
          <span>Tổng quan</span>
        </button>

        {/* Divider dot */}
        <span className="text-[#c2c6d6] text-xs select-none">·</span>

        {/* Teaching Nodes */}
        {/* Teaching Nodes */}
        {steps.map((step, idx) => {
          const stepTitle = getShortNodeName(step, idx)
          const stepDuration = step.duration || (step.estimated_time_minutes ? `${step.estimated_time_minutes}'` : "10'")
          const isActive = activeIdx === idx
          const isLoading = step.isLoading === true

          return (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all font-semibold text-xs shadow-sm border ${isActive
                ? 'bg-[#0058be] text-white border-[#0058be]'
                : 'bg-white hover:bg-[#eaedff]/30 text-[#424754] border-[#e2e8f0]'
                }`}
            >
              {isLoading ? (
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20' : 'bg-[#f1f5f9]'}`}>
                  {stepDuration.endsWith("'") ? stepDuration : `${stepDuration}'`}
                </span>
              )}
              <span>{stepTitle}</span>
            </button>
          )
        })}

        {/* Global Toolbar — pushed to far right */}
        <div className="ml-auto flex items-center gap-1.5 pl-2 border-l border-[#e2e8f0]">
          <button
            onClick={addActivity}
            className="p-1.5 hover:bg-[#eaedff] text-[#0058be] rounded-lg transition-colors flex items-center justify-center"
            title="Thêm hoạt động mới"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
          </button>
          <button
            onClick={onRestart}
            className="p-1.5 hover:bg-[#ffdad6] text-[#ba1a1a] rounded-lg transition-colors flex items-center justify-center"
            title="Tạo lại từ đầu"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          </button>
        </div>
      </nav>

      {/* ─── Main Content Area ─── */}
      <div className="grid grid-cols-12 gap-6">
        {activeIdx === -1 ? (
          <>
            <main className="col-span-12 lg:col-span-8 border border-[#e2e8f0] rounded-2xl flex flex-col bg-white overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[#e2e8f0] bg-slate-50/50">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#eaedff] text-[#0058be] text-[10px] font-mono font-bold border border-[#0058be]/20">
                  TỔNG QUAN
                </span>
                <h1 className="font-extrabold text-2xl text-[#151b2d] mt-2">
                  Cấu trúc tiến trình giảng dạy đề xuất
                </h1>
              </div>

              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                {contentSummary && (
                  <div className="p-5 bg-[#f8fafc] border border-[#0058be]/10 rounded-2xl">
                    <h3 className="font-bold text-sm text-[#0058be] mb-2 uppercase flex items-center gap-1.5 font-mono">
                      <span className="material-symbols-outlined text-[16px]">summarize</span>
                      Tóm tắt kịch bản giảng dạy
                    </h3>
                    <p className="text-sm text-[#424754] leading-relaxed italic">
                      {formatInlineMarkdown(contentSummary)}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#151b2d] uppercase tracking-wide flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                    Mục lục các phần dạy học
                  </h3>

                  <div className="divide-y divide-[#e2e8f0] border border-[#e2e8f0] rounded-xl overflow-hidden shadow-inner bg-white">
                    {steps.map((step, idx) => {
                      const stepTitle = step.isLoading ? `Đang khởi tạo phần ${idx + 1}...` : (step.title || step.applied_activity || `Node ${idx + 1}`)
                      const stepType = step.type || step.node_name || 'Hoạt động'
                      const stepDuration = step.isLoading ? '--' : (step.duration || (step.estimated_time_minutes ? `${step.estimated_time_minutes}'` : '--'))

                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveIdx(idx)}
                          className="p-4 hover:bg-[#eaedff]/30 cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#0058be]/10 text-[#0058be] font-bold text-xs flex items-center justify-center font-mono">
                              {idx + 1}
                            </span>
                            <div>
                              <h4 className="font-bold text-sm text-[#151b2d] group-hover:text-[#0058be] transition-colors">
                                {stepTitle}
                              </h4>
                              <span className="text-[10px] text-[#727785] bg-[#f1f5f9] px-2 py-0.5 rounded border">
                                {stepType}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {step.isLoading ? (
                              <span className="w-4 h-4 border-2 border-[#0058be] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <span className="text-xs font-mono bg-[#eaedff] text-[#0058be] px-2.5 py-0.5 rounded-full font-semibold">
                                {stepDuration}
                              </span>
                            )}
                            <span className="material-symbols-outlined text-[#c2c6d6] group-hover:text-[#0058be] transition-colors">
                              chevron_right
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </main>

            {/* ASIDE 1: THÔNG TIN KỊCH BẢN (GIAO DIỆN TỔNG QUAN) */}
            <aside className="col-span-12 lg:col-span-4 space-y-4">
              <div className="border border-blue-100 rounded-2xl bg-slate-50 p-5 space-y-4 shadow-sm h-fit">
                <h4 className="text-xs font-bold uppercase text-blue-700 font-mono border-b border-blue-100 pb-2">
                  Thông tin kịch bản
                </h4>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Số lượng phần (Nodes)</span>
                    <span className="font-bold font-mono text-slate-900">{steps.length} phần</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Tổng thời lượng ước tính</span>
                    <span className="font-bold font-mono text-slate-900">{totalDuration}' phút</span>
                  </div>
                </div>

                {steps.length > 0 && (
                  <button
                    onClick={() => setActiveIdx(0)}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-1 shadow-md shadow-blue-500/20 active:scale-95 mt-2"
                  >
                    Bắt đầu xem kịch bản
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                )}
              </div>
            </aside>
          </>
        ) : (
          <>
            <main className="col-span-12 lg:col-span-8 border border-[#e2e8f0] rounded-2xl flex flex-col bg-white overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[#e2e8f0] bg-slate-50/50 space-y-3">
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border ${typeColors[activeType] ?? 'bg-[#eaedff] text-[#424754] border-[#c2c6d6]'}`}>
                      {activeType}
                    </span>

                    {activeAppliedActivity && activeAppliedActivity !== '—' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#d1f7e6] text-[#006c49] text-[10px] font-bold border border-[#198754]/20">
                        {activeAppliedActivity}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={current.time ?? ''}
                      onChange={(e) => updateStep({ time: e.target.value })}
                      className="font-mono text-[10px] bg-[#0058be]/10 text-[#0058be] px-2.5 py-0.5 rounded-full outline-none hover:bg-[#0058be]/20 w-16 text-center"
                      placeholder="Timing"
                      title="Timing (vd: 00:00)"
                    />
                    <span className="text-[#c2c6d6]">•</span>
                    <input
                      type="text"
                      value={activeDuration}
                      onChange={(e) => updateStep({ duration: e.target.value })}
                      className="font-mono text-[10px] bg-[#eaedff] text-[#424754] px-2.5 py-0.5 rounded-full outline-none hover:bg-[#d1e7ff] w-16 text-center font-bold"
                      placeholder="Duration"
                      title="Thời lượng"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <input
                    type="text"
                    value={activeTitle}
                    onChange={(e) => updateStep({ title: e.target.value })}
                    className="font-extrabold text-xl sm:text-2xl text-[#151b2d] bg-transparent border-b border-transparent hover:border-[#c2c6d6] focus:border-[#0058be] focus:outline-none w-full pb-1 transition-all"
                    placeholder="Tên nội dung dạy..."
                  />

                  <button
                    onClick={() => removeStep(activeIdx)}
                    className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors flex items-center justify-center shrink-0"
                    title="Xóa node này"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
                  <div
                    onClick={() => setIsContentExpanded(!isContentExpanded)}
                    className="p-4 bg-[#fafafa] border-b border-[#e2e8f0] flex items-center justify-between cursor-pointer hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#727785]">
                        {isContentExpanded ? 'expand_more' : 'chevron_right'}
                      </span>
                      <h3 className="font-bold text-xs text-[#151b2d] uppercase tracking-wider font-mono">
                        Nội dung giảng dạy tương ứng
                      </h3>
                    </div>
                    {isContentExpanded && !current.isLoading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingContent(!editingContent);
                        }}
                        className="p-1 text-[#727785] hover:text-[#0058be] hover:bg-[#eaedff] rounded-md transition-colors flex items-center justify-center"
                        title={editingContent ? 'Lưu / Xem trước' : 'Chỉnh sửa'}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {editingContent ? 'preview' : 'edit'}
                        </span>
                      </button>
                    )}
                  </div>

                  {isContentExpanded && (
                    <div className="p-6 bg-white border-t border-[#e2e8f0]">
                      {current.isLoading ? (
                        <div className="animate-pulse space-y-3 py-2">
                          <div className="h-4 bg-slate-100 rounded w-full"></div>
                          <div className="h-4 bg-slate-100 rounded w-11/12"></div>
                          <div className="h-4 bg-slate-100 rounded w-4/5"></div>
                        </div>
                      ) : editingContent ? (
                        <RichTextEditor
                          value={
                            Array.isArray(current.originalContent)
                              ? current.originalContent.join('\n')
                              : typeof current.originalContent === 'object'
                                ? JSON.stringify(current.originalContent)
                                : (current.originalContent ?? '')
                          }
                          onChange={(md) => {
                            if (Array.isArray(current.originalContent)) {
                              updateStep({ originalContent: md.split('\n') });
                            } else {
                              updateStep({ originalContent: md });
                            }
                          }}
                          placeholder="Ý chính nội dung dạy..."
                        />
                      ) : (
                        <div className="prose max-w-none">
                          {formatTeachingContent(
                            Array.isArray(current.originalContent)
                              ? current.originalContent.join('\n')
                              : typeof current.originalContent === 'object'
                                ? JSON.stringify(current.originalContent, null, 2)
                                : current.originalContent
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {activeIntent && (
                  <div className="p-4 bg-[#f8fafc] border border-[#eaedff] rounded-xl flex gap-3 items-start shadow-sm">
                    <span className="material-symbols-outlined text-[#6b38d4] shrink-0 text-[20px]">target</span>
                    <div className="w-full">
                      <h5 className="font-bold text-xs uppercase text-[#6b38d4] tracking-wider mb-0.5">Mục tiêu sư phạm</h5>
                      <input
                        type="text"
                        value={activeIntent}
                        onChange={(e) => updateStep({ intent: e.target.value })}
                        className="text-sm font-semibold text-[#424754] bg-transparent border-b border-transparent hover:border-[#c2c6d6] focus:border-[#0058be] focus:outline-none w-full pb-0.5"
                        placeholder="Mục tiêu sư phạm cho node..."
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  {activeIdx < steps.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className="px-5 py-2.5 bg-[#0058be] hover:bg-[#2170e4] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 active:scale-95"
                    >
                      <span>Hoạt động tiếp theo</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveIdx(-1)}
                      className="px-5 py-2.5 border border-[#c2c6d6] hover:bg-[#faf8ff] text-[#424754] rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">keyboard_return</span>
                      <span>Quay lại Mục lục</span>
                    </button>
                  )}
                </div>
              </div>
            </main>

            {/* ASIDE 2: CHI TIẾT HOẠT ĐỘNG */}
            <aside className="col-span-12 lg:col-span-4 space-y-4">

              {/* Suggestion Panel - Dark Header & Light Body */}
              <div className="border border-[#0058be] rounded-xl overflow-hidden flex flex-col shadow-sm bg-[#f4f8fd] transition-shadow hover:shadow-md">

                {/* Header màu đậm, chữ trắng */}
                <div className="px-4 py-3 bg-[#0058be] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-white text-[18px]">wb_incandescent</span>
                    <h4 className="text-xs font-bold uppercase text-white font-mono">Gợi ý hoạt động / Chuẩn bị</h4>
                  </div>

                  {!current.isLoading && (
                    <button
                      onClick={() => setEditingSuggestions(!editingSuggestions)}
                      className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-colors flex items-center justify-center"
                      title={editingSuggestions ? 'Lưu / Xem trước' : 'Chỉnh sửa'}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {editingSuggestions ? 'preview' : 'edit'}
                      </span>
                    </button>
                  )}
                </div>

                {/* Body màu nhạt, chữ tối màu dễ đọc */}
                <div className="p-4 space-y-4">
                  {/* Hoạt động áp dụng */}
                  <div className="">
                    {current.isLoading ? (
                      <div className="h-6 bg-slate-200/50 rounded animate-pulse w-2/3"></div>
                    ) : editingSuggestions ? (
                      <input
                        type="text"
                        value={current.appliedActivity || current.applied_activity || ''}
                        onChange={(e) => updateStep({ appliedActivity: e.target.value, applied_activity: e.target.value })}
                        className="w-full text-xs text-[#151b2d] bg-white border border-[#0058be]/30 focus:border-[#0058be] focus:outline-none px-3 py-2 rounded-lg leading-relaxed shadow-inner font-semibold"
                        placeholder="Tên hoạt động..."
                      />
                    ) : (
                      <p className="text-xs font-bold text-[#151b2d] bg-[#f4f8fd] border border-[#0058be]/10 px-3 py-2 rounded-lg shadow-sm">
                        {activeAppliedActivity}
                      </p>
                    )}
                  </div>

                  {/* Dụng cụ & Học liệu cần chuẩn bị */}
                  <div>
                    {current.isLoading ? (
                      <div className="animate-pulse space-y-2 py-1">
                        <div className="h-3 bg-slate-200/50 rounded w-full"></div>
                        <div className="h-3 bg-slate-200/50 rounded w-5/6"></div>
                      </div>
                    ) : editingSuggestions ? (
                      <RichTextEditor
                        value={Array.isArray(current.pedagogNote) ? current.pedagogNote.join('\n') : (current.pedagogNote ?? '')}
                        onChange={(md) => {
                          if (Array.isArray(current.pedagogNote)) {
                            updateStep({ pedagogNote: md.split('\n') });
                          } else {
                            updateStep({ pedagogNote: md });
                          }
                        }}
                        placeholder="Nhập vật tư cần chuẩn bị..."
                      />
                    ) : (
                      <div className="prose max-w-none text-[#424754] text-xs leading-relaxed bg-[#f4f8fd] border border-[#0058be]/10 p-3 rounded-lg shadow-sm">
                        {formatSidebarText(Array.isArray(current.pedagogNote) ? current.pedagogNote.join('\n') : current.pedagogNote, true)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Instructions Panel - Clean White (Nền trắng tinh, thanh tiêu đề xám siêu nhạt) */}
              <div className="border border-[#0058be] rounded-xl overflow-hidden flex flex-col shadow-sm bg-[#f0f7ff] transition-shadow hover:shadow-md">
                <div className="px-4 py-3 bg-[#e0efff]/60 border-b border-[#0058be] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {/* Chỉ giữ lại màu xanh ở Icon để đồng bộ */}
                    <span className="material-symbols-outlined text-[#0058be] text-[18px]">list_alt</span>
                    <h4 className="text-xs font-bold uppercase text-[#151b2d] font-mono">Hướng dẫn thực hiện</h4>
                  </div>

                  {!current.isLoading && (
                    <button
                      onClick={() => setEditingInstructions(!editingInstructions)}
                      className="p-1 text-[#727785] hover:text-[#0058be] hover:bg-[#eaedff] rounded-md transition-colors flex items-center justify-center"
                      title={editingInstructions ? 'Lưu / Xem trước' : 'Chỉnh sửa'}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {editingInstructions ? 'preview' : 'edit'}
                      </span>
                    </button>
                  )}
                </div>

                <div className="p-4 bg-white">
                  {current.isLoading ? (
                    <div className="animate-pulse space-y-2 py-1">
                      <div className="h-3 bg-slate-200/50 rounded w-full"></div>
                      <div className="h-3 bg-slate-200/50 rounded w-11/12"></div>
                      <div className="h-3 bg-slate-200/50 rounded w-4/5"></div>
                    </div>
                  ) : editingInstructions ? (
                    <RichTextEditor
                      value={Array.isArray(current.details) ? current.details.join('\n') : (current.details ?? '')}
                      onChange={(md) => {
                        if (Array.isArray(current.details)) {
                          updateStep({ details: md.split('\n') });
                        } else {
                          updateStep({ details: md });
                        }
                      }}
                      placeholder="Nhập các bước hướng dẫn cụ thể..."
                    />
                  ) : (
                    <div className="prose max-w-none text-[#424754] text-sm leading-relaxed">
                      {formatSidebarText(Array.isArray(current.details) ? current.details.join('\n') : current.details, false)}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  )
}