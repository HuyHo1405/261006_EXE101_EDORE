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

// ─── Hình thành kiến thức ─────────────────────────────────────────────────────
export function HinhThanhView({
  payload,
  onChange,
  steps,
  renderNote,
  teachingMethod,
  onTeachingMethodChange,
  appliedActivity,
  teachingTools,
  pedagogNote,
  onGoToNextNode,
  nextStepTitle,
}: {
  payload: any
  onChange: (p: any) => void
  steps: string[]
  renderNote?: (i: number) => ReactNode
  teachingMethod?: string
  onTeachingMethodChange?: (m: string) => void
  appliedActivity?: string
  teachingTools?: any[]
  pedagogNote?: any
  onGoToNextNode?: () => void
  nextStepTitle?: string
}) {
  const p = payload || {}
  const units: any[] = Array.isArray(p.knowledge_units) ? p.knowledge_units : []
  const [activeUnit, setActiveUnit] = useState<number>(0)
  const [showFollowUps, setShowFollowUps] = useState<boolean>(false)
  const [openNote, setOpenNote] = useState<boolean>(false)

  // Đồng bộ sự kiện chọn đơn vị kiến thức từ Sidebar
  useEffect(() => {
    const h = (e: any) => {
      if (typeof e.detail?.uIdx === 'number' && e.detail.uIdx >= 0 && e.detail.uIdx < units.length) {
        setActiveUnit(e.detail.uIdx)
        if (e.detail.shouldScroll) {
          setTimeout(() => {
            const el = document.getElementById(`timeline-unit-${e.detail.uIdx}`)
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 160, behavior: 'smooth' })
          }, 150)
        }
      }
    }
    window.addEventListener('expand-knowledge-unit', h)
    return () => window.removeEventListener('expand-knowledge-unit', h)
  }, [units.length])

  // Lấy danh sách dụng cụ thiết bị trực quan
  const mappedTools = (() => {
    if (Array.isArray(pedagogNote) && pedagogNote.length > 0) {
      return parseTeachingTools(pedagogNote)
    }
    if (Array.isArray(teachingTools) && teachingTools.length > 0) {
      return parseTeachingTools(teachingTools)
    }
    return []
  })()

  const curUnit = units[activeUnit] || units[0] || {}

  const updateUnit = (i: number, patch: Record<string, any>) =>
    onChange({ ...p, knowledge_units: units.map((u, j) => (j === i ? { ...u, ...patch } : u)) })

  const updateUnitVisual = (i: number, patch: Record<string, any>) => {
    const curVisual = typeof units[i]?.visual_example === 'object' && units[i]?.visual_example !== null
      ? units[i].visual_example
      : { item: '', description: typeof units[i]?.visual_example === 'string' ? units[i].visual_example : '' }
    updateUnit(i, { visual_example: { ...curVisual, ...patch } })
  }

  const updateUnitNav = (i: number, patch: Record<string, any>) => {
    const curNav = typeof units[i]?.content_navigation === 'object' && units[i]?.content_navigation !== null
      ? units[i].content_navigation
      : { guiding_tip: '', questions: units[i]?.checkpoint_question ? [units[i].checkpoint_question] : [] }
    updateUnit(i, { content_navigation: { ...curNav, ...patch } })
  }

  // Dữ liệu chi tiết của Đơn vị đang chọn
  const visualObj = typeof curUnit.visual_example === 'object' && curUnit.visual_example !== null ? curUnit.visual_example : {}
  const visualItem = visualObj.item || ''
  const visualDesc = visualObj.description || (typeof curUnit.visual_example === 'string' ? curUnit.visual_example : '')

  const navObj = typeof curUnit.content_navigation === 'object' && curUnit.content_navigation !== null ? curUnit.content_navigation : {}
  const guidingTip = navObj.guiding_tip || ''
  const questionsList: string[] = Array.isArray(navObj.questions) && navObj.questions.length > 0
    ? navObj.questions
    : (curUnit.checkpoint_question ? [curUnit.checkpoint_question] : [])

  const mainQuestion = questionsList[0] || curUnit.checkpoint_question || ''
  const subQuestions = questionsList.slice(1)

  const updateMainQuestion = (i: number, val: string) => {
    const newQs = [val, ...(questionsList.slice(1))]
    updateUnitNav(i, { questions: newQs })
  }

  const updateSubQuestions = (i: number, newSubs: string[]) => {
    const newQs = [mainQuestion, ...newSubs]
    updateUnitNav(i, { questions: newQs })
  }

  const explanation = curUnit.teacher_explanation || curUnit.teacher_delivery || ''

  return (
    <div className="space-y-6">

      {/* ─── THẺ DUY NHẤT: TIMELINE DỌC LIỀN MẠCH XUYÊN SUỐT (GIỐNG KHỞI ĐỘNG) ─── */}
      <div
        id={`timeline-unit-${activeUnit}`}
        className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden"
      >
        {/* Header thẻ gộp thống nhất */}
        <div className="bg-slate-50/80 border-b border-slate-200/90 px-5 sm:px-6 py-4 flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-full bg-slate-800 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
            {activeUnit + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">
              ĐƠN VỊ KIẾN THỨC {activeUnit + 1} • TIẾN TRÌNH KHÁM PHÁ &amp; CHUẨN HÓA
            </div>
            <input
              value={curUnit.unit_title || ''}
              onChange={e => updateUnit(activeUnit, { unit_title: e.target.value })}
              className="w-full font-header font-black text-base sm:text-lg text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-600 outline-none pb-0.5 tracking-tight"
              placeholder={`Nhập tiêu đề đơn vị kiến thức ${activeUnit + 1}...`}
            />
          </div>
        </div>

        {/* Body Timeline nối dọc liền mạch xuyên suốt (Line tự căn giữa icon 100%) */}
        <div className="p-5 sm:p-6 space-y-0">
          {/* Bước 1: THAO TÁC CỦA GIÁO VIÊN (TRỰC QUAN HÓA & NGỮ LIỆU) */}
          <div className="flex items-stretch gap-4 relative">
            <div className="w-10 flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-300 flex items-center justify-center shrink-0 z-10 shadow-2xs">
                <Presentation className="w-4.5 h-4.5 text-slate-600" />
              </div>
              <div className="w-[2px] flex-1 bg-slate-200 my-1" />
            </div>
            <div className="flex-1 min-w-0 pb-5">
              <div
                id="hinhthanh-step-1"
                className="rounded-xl border border-slate-200/90 bg-[#F8FAFC] p-4 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-2xs space-y-2.5 transition-all duration-300"
              >
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  THAO TÁC CỦA GIÁO VIÊN (TRỰC QUAN HÓA &amp; NGỮ LIỆU)
                </div>

                {/* Dòng dụng cụ / học liệu chuẩn bị */}
                {mappedTools.length > 0 && (
                  <div id="materials-section" className="flex items-center gap-2 flex-wrap transition-all duration-300">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Package className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>Dụng cụ &amp; Tư liệu:</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {mappedTools.map((tool, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200/80 text-slate-800 border border-slate-300 shadow-2xs"
                          title={tool.purpose || tool.name}
                        >
                          {tool.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tên tư liệu ảnh / hiện vật đối chiếu */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-600">
                    Ngữ liệu / Hiện vật đối chiếu:
                  </div>
                  <input
                    value={visualItem}
                    onChange={e => updateUnitVisual(activeUnit, { item: e.target.value })}
                    placeholder="Tên tư liệu ảnh, hiện vật thật hoặc ví dụ đối chiếu cụ thể..."
                    className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none shadow-2xs"
                  />
                </div>

                {/* Mô tả cách trình chiếu / quan sát */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-600">
                    Mô tả thao tác của giáo viên:
                  </div>
                  <AutoResizeTextarea
                    value={visualDesc}
                    minRows={2}
                    placeholder="Mô tả chi tiết: Giáo viên chiếu tranh ảnh / cho học sinh quan sát điểm khác biệt..."
                    onChange={v => updateUnitVisual(activeUnit, { description: v })}
                    className="w-full text-xs sm:text-sm text-slate-800 bg-transparent border-0 p-0 outline-none focus:outline-none focus:ring-0 leading-relaxed resize-none font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bước 2: HỎI CẢ LỚP (ĐIỀU HƯỚNG VẤN ĐÁP - TÔNG VÀNG CAM GIỐNG KHỞI ĐỘNG) */}
          <div className="flex items-stretch gap-4 relative">
            <div className="w-10 flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-amber-400 flex items-center justify-center shrink-0 z-10 shadow-2xs">
                <Quote className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
              </div>
              <div className="w-[2px] flex-1 bg-slate-200 my-1" />
            </div>
            <div className="flex-1 min-w-0 pb-5">
              <div
                id="hinhthanh-step-2"
                className="rounded-2xl border-2 border-amber-300 bg-[#FFFDF7] p-4.5 sm:p-5 shadow-xs space-y-3 transition-all duration-300"
              >
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
                  HỎI CẢ LỚP (ĐIỀU HƯỚNG VẤN ĐÁP - DẪN DẮT TƯ DUY)
                </div>

                {/* Câu hỏi gợi mở chính */}
                <AutoResizeTextarea
                  value={mainQuestion}
                  minRows={2}
                  placeholder='Nhập câu hỏi gợi mở trung tâm đặt trong ngoặc kép "..."'
                  onChange={v => updateMainQuestion(activeUnit, v)}
                  className="w-full font-black text-base sm:text-lg text-amber-950 leading-snug bg-transparent border-0 p-0 outline-none focus:outline-none focus:ring-0 resize-none"
                />

                {/* Phần gợi ý mở rộng khi học sinh chưa trả lời được */}
                <div className="pt-2.5 border-t border-amber-200/70">
                  <button
                    type="button"
                    onClick={() => setShowFollowUps(!showFollowUps)}
                    className="flex items-center justify-between w-full py-1 text-xs font-semibold text-amber-900 hover:text-amber-950 transition-colors cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>Nếu học sinh chưa nhận ra bản chất? (Mẹo dẫn dắt &amp; Câu hỏi đào sâu)</span>
                    </span>
                    <span className="text-[11px] font-semibold text-amber-700">
                      {showFollowUps ? 'Thu gọn ▲' : `Mở gợi ý (${subQuestions.length}) ▼`}
                    </span>
                  </button>

                  {showFollowUps && (
                    <div className="pt-2.5 pb-1 space-y-3 animate-in fade-in duration-150">
                      {/* Mẹo điều hướng của GV */}
                      <div className="p-2.5 rounded-lg bg-amber-100/60 border border-amber-200/80 space-y-1">
                        <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                          <Compass className="w-3 h-3 text-amber-700" />
                          <span>Mẹo điều hướng của giáo viên:</span>
                        </div>
                        <AutoResizeTextarea
                          value={guidingTip}
                          minRows={1}
                          placeholder="Gợi ý cách dẫn dắt học sinh từ quan sát trực quan đi vào bản chất..."
                          onChange={v => updateUnitNav(activeUnit, { guiding_tip: v })}
                          className="w-full text-xs text-amber-950 bg-transparent border-0 p-0 outline-none leading-relaxed resize-none italic"
                        />
                      </div>

                      {/* Danh sách câu hỏi đào sâu */}
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-slate-500 italic leading-snug">
                          Chuỗi câu hỏi gợi mở đào sâu từng bước:
                        </p>
                        <EditableList
                          items={subQuestions}
                          onChange={newSubs => updateSubQuestions(activeUnit, newSubs)}
                          placeholder="Nhập câu hỏi gợi mở đào sâu..."
                          addLabel="Thêm câu hỏi đào sâu"
                          marker="bg-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bước 3: GIẢNG GIẢI CẶN KẼ & CHUẨN HÓA KIẾN THỨC VÀO VỞ */}
          <div className="flex items-start gap-4 relative">
            <div className="w-10 flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shrink-0 z-10 shadow-2xs">
                <ArrowRight className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div
                id="hinhthanh-step-3"
                className="rounded-xl border border-slate-300 bg-slate-100/90 p-4 sm:p-4.5 text-xs sm:text-sm text-slate-950 leading-relaxed shadow-2xs space-y-3 transition-all duration-300"
              >
                {/* 1. Lời giáo viên giảng giải cặn kẽ */}
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                    GIÁO VIÊN GIẢNG GIẢI CẶN KẼ (PHÂN TÍCH RÕ BẢN CHẤT, THÁO GỠ ĐIỂM DỄ NHẦM)
                  </div>
                  <AutoResizeTextarea
                    value={explanation}
                    minRows={2}
                    placeholder="Nội dung giáo viên giải thích chi tiết, gỡ rối điểm học sinh dễ nhầm lẫn..."
                    onChange={v => updateUnit(activeUnit, { teacher_explanation: v, teacher_delivery: v })}
                    className="w-full font-medium text-xs sm:text-sm text-slate-900 bg-transparent border-0 p-0 outline-none focus:outline-none focus:ring-0 leading-relaxed resize-none font-medium"
                  />
                </div>

                {/* 2. Mũi tên -> Chuẩn hóa kiến thức cốt lõi ghi vở */}
                <div className="pt-3 border-t border-slate-200/90 flex items-start gap-2.5">
                  <div className="w-5.5 h-5.5 rounded-md bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-emerald-700 shadow-2xs">
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                      KIẾN THỨC CỐT LÕI (HỌC SINH GHI NHỚ &amp; VÀO VỞ)
                    </div>
                    <AutoResizeTextarea
                      value={curUnit.core_content || ''}
                      minRows={2}
                      placeholder="Nội dung chuẩn hóa để học sinh chép vào vở ghi..."
                      onChange={v => updateUnit(activeUnit, { core_content: v })}
                      className="w-full font-bold text-xs sm:text-sm text-slate-900 bg-transparent border-0 p-0 outline-none focus:outline-none focus:ring-0 leading-relaxed resize-none"
                    />
                  </div>
                </div>

                {/* 3. Nút chuyển tiếp mượt mà */}
                <div className="pt-3 border-t border-slate-200/90 flex items-center justify-between flex-wrap gap-2">
                  {activeUnit < units.length - 1 ? (
                    <>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Hoàn thành mục {activeUnit + 1}, bước sang:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextIdx = activeUnit + 1
                          setActiveUnit(nextIdx)
                          window.dispatchEvent(new CustomEvent('knowledge-unit-expanded', { detail: { uIdx: nextIdx } }))
                          window.dispatchEvent(new CustomEvent('expand-knowledge-unit', { detail: { uIdx: nextIdx, shouldScroll: true } }))
                        }}
                        className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer select-none"
                      >
                        <span>Sang: {units[activeUnit + 1]?.unit_title || `Đơn vị ${activeUnit + 2}`}</span>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Đã hoàn thành toàn bộ nội dung lý thuyết:
                      </span>
                      <button
                        type="button"
                        onClick={onGoToNextNode}
                        className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all cursor-pointer select-none"
                        title="Bấm để chuyển ngay sang phần Luyện tập"
                      >
                        <span>{nextStepTitle ? `Vào: ${nextStepTitle}` : 'Vào: Luyện tập củng cố'}</span>
                        <ArrowRight className="w-4 h-4 text-emerald-100 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer ghi chú thêm */}
        {renderNote && (
          <div className="border-t border-slate-100 p-3 bg-slate-50/60">
            <button
              type="button"
              onClick={() => setOpenNote(!openNote)}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Pencil className="w-3 h-3" /> {openNote ? 'Ẩn ghi chú sư phạm' : 'Ghi chú thêm cho đơn vị kiến thức này'}
            </button>
            {openNote && <div className="mt-2">{renderNote(activeUnit)}</div>}
          </div>
        )}
      </div>

      {/* ─── KHỐI CHỐT KIẾN THỨC TOÀN BÀI (SYNTHESIS) ─── */}
      {p.synthesis !== undefined && (
        <div className="rounded-2xl border border-slate-300 bg-slate-100/80 p-4 sm:p-5 shadow-2xs space-y-2.5">
          <SectionLabel tone="slate" icon={<Flag className="w-4 h-4 text-slate-700" />}>
            Chốt kiến thức toàn bài (Đúc kết sau khi hoàn thành các phần)
          </SectionLabel>
          <AutoResizeTextarea
            value={p.synthesis || ''}
            minRows={2}
            placeholder="Nhập nội dung đúc kết, kết luận bản chất toàn bài..."
            onChange={v => onChange({ ...p, synthesis: v })}
            className="w-full font-bold text-xs sm:text-sm text-slate-950 bg-white border border-slate-300 focus:border-slate-500 rounded-xl p-3 outline-none leading-relaxed shadow-2xs resize-none"
          />
        </div>
      )}
    </div>
  )
}
