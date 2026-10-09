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

// ─── Khởi động (Biến đổi thích ứng theo Nguyên tắc bù trừ sư phạm) ───────────────
export function KhoiDongView({
  payload,
  onChange,
  steps,
  renderNote,
  appliedActivity,
  intent,
  onGoToNextNode,
  nextStepTitle,
  teachingTools,
  pedagogNote,
  hinhThanhApproach = 'INDUCTIVE',
}: {
  payload: any
  onChange: (p: any) => void
  steps?: string[]
  renderNote?: (i: number) => ReactNode
  appliedActivity?: string
  intent?: string
  onGoToNextNode?: () => void
  nextStepTitle?: string
  teachingTools?: any[]
  pedagogNote?: any
  hinhThanhApproach?: string
}) {
  const p = payload || {}
  const [openNote, setOpenNote] = useState(false)

  const activityName = p.activity_name || p.game_name || 'Trò chơi phản xạ: "Xưa hay Nay? (Tìm đồ vật thời ông bà)"'
  const visualAction =
    p.visual_action ||
    '• Giáo viên chiếu lướt nhanh 4 cặp hình ảnh đồ vật quen thuộc: Quạt nan vs Máy lạnh, Bếp củi vs Bếp từ, Đèn dầu vs Đèn điện.\n• Học sinh quan sát nhanh trong 5 giây mỗi hình và đồng thanh hô "Xưa" hay "Nay"!'
  const quickConnection =
    p.quick_connection ||
    'Thử thách kết nối 60 giây: "Em hãy kể tên 1 đồ vật trong nhà mình được giữ lại từ thời ông bà?" (Học sinh kể nhanh: chiếc quạt cũ, cuốn gia phả, bức ảnh ố vàng... GV chỉ lắng nghe và tạo không khí vui tươi, không phân tích mổ xẻ).'
  const conclusion =
    p.conclusion ||
    'Không khí lớp học rất sôi nổi! Mỗi đồ vật từ thời ông bà đều là một chứng tích sống động kể lại câu chuyện của quá khứ.'
  const bridgeQuestion =
    p.bridge_question ||
    '"Thầy/cô mời các em cùng quan sát các tư liệu lịch sử sau đây để tự tìm ra câu trả lời!"'

  const updateField = (field: string, val: string) => {
    onChange({ ...p, [field]: val })
  }

  const mappedTools = (() => {
    if (pedagogNote) {
      const arr = Array.isArray(pedagogNote) ? pedagogNote : String(pedagogNote).split(',').map(s => s.trim()).filter(Boolean)
      if (arr.length > 0) {
        return parseTeachingTools(arr)
      }
    }
    if (Array.isArray(teachingTools) && teachingTools.length > 0) {
      const parsed = parseTeachingTools(teachingTools)
      const matched = parsed.filter(t => /slide|ảnh|đồ vật|phản xạ|trò chơi|chiếu/i.test(t.name + ' ' + (t.purpose || '')))
      if (matched.length > 0) return matched
      return [parsed[0]]
    }
    return [
      {
        name: 'Slide 4 cặp hình ảnh đồ vật đời sống Xưa - Nay',
        purpose: 'Chiếu lướt 5 giây mỗi hình cho học sinh phản xạ',
      },
      {
        name: 'Đồng hồ đếm ngược 60 giây',
        purpose: 'Tạo nhịp điệu nhanh và không khí hào hứng đầu giờ',
      },
    ]
  })()

  return (
    <div className="space-y-5">

      <div
        id="khoidong-card"
        className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden transition-all duration-300"
      >
        {/* Header */}
        <div className="bg-slate-50/80 border-b border-slate-200/90 px-5 sm:px-6 py-4 flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-full bg-indigo-900 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
            1
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 mb-0.5">
              KHỞI ĐỘNG: TRÒ CHƠI PHẢN XẠ &amp; KẾT NỐI THỰC TẾ (3 PHÚT)
            </div>
            <div className="font-header font-black text-sm sm:text-base text-slate-800">
              KHÔNG HỎI GỢI MỞ • TẠO KHÔNG KHÍ HÀO HỨNG &amp; GỢI NHU CẦU TÒ MÒ
            </div>
          </div>
        </div>

        {/* Timeline nối dọc 3 bước */}
        <div className="p-5 sm:p-6 space-y-0">
          {/* Bước 1: THAO TÁC CỦA GIÁO VIÊN & LUẬT CHƠI (KHUẤY ĐỘNG 2 PHÚT) */}
          <div className="flex items-stretch gap-4 relative">
            <div className="w-10 flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-white border border-indigo-300 flex items-center justify-center shrink-0 z-10 shadow-2xs">
                <Gamepad2 className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              <div className="w-[2px] flex-1 bg-slate-200 my-1" />
            </div>
            <div className="flex-1 min-w-0 pb-5">
              <div
                id="khoidong-step-1"
                className="rounded-xl border border-slate-200/90 bg-[#F8FAFC] p-4 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-2xs space-y-2.5 transition-all duration-300"
              >
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  THAO TÁC CỦA GIÁO VIÊN &amp; LUẬT CHƠI NHANH (PHẢN XẠ 2 PHÚT)
                </div>

                {/* Dòng dụng cụ */}
                {mappedTools.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Package className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>Dụng cụ trò chơi:</span>
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

                {/* Tên trò chơi */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-600">
                    Tên trò chơi / Thử thách:
                  </div>
                  <input
                    value={activityName}
                    onChange={e => updateField('activity_name', e.target.value)}
                    placeholder="Nhập tên hoạt động..."
                    className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none shadow-2xs"
                  />
                </div>

                {/* Mô tả thao tác GV & Luật chơi */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-600">
                    Cách tổ chức &amp; Luật hô phản xạ (nhanh gọn):
                  </div>
                  <AutoResizeTextarea
                    value={visualAction}
                    minRows={2}
                    placeholder="Mô tả cách chiếu ảnh, thời gian phản xạ..."
                    onChange={v => updateField('visual_action', v)}
                    className="w-full text-xs sm:text-sm text-slate-800 bg-transparent border-0 p-0 outline-none focus:outline-none focus:ring-0 leading-relaxed resize-none font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bước 2: HỌC SINH PHẢN XẠ & KẾT NỐI GẦN GŨI (1 PHÚT - KHÔNG HỎI PHÂN TÍCH) */}
          <div className="flex items-stretch gap-4 relative">
            <div className="w-10 flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-indigo-400 flex items-center justify-center shrink-0 z-10 shadow-2xs">
                <Zap className="w-4.5 h-4.5 text-indigo-500 fill-indigo-500" />
              </div>
              <div className="w-[2px] flex-1 bg-slate-200 my-1" />
            </div>
            <div className="flex-1 min-w-0 pb-5">
              <div
                id="khoidong-step-2"
                className="rounded-2xl border-2 border-indigo-300 bg-[#F5F3FF] p-4.5 sm:p-5 shadow-xs space-y-3 transition-all duration-300"
              >
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900 flex items-center justify-between">
                  <span>HỌC SINH PHẢN XẠ NHANH &amp; KẾT NỐI THỰC TẾ (1 PHÚT)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-200 text-indigo-900 font-bold lowercase">
                    không hỏi phân tích
                  </span>
                </div>

                <AutoResizeTextarea
                  value={quickConnection}
                  minRows={2}
                  placeholder="Thử thách kết nối ngắn gọn, chỉ cần học sinh kể tên theo phản xạ tự nhiên..."
                  onChange={v => updateField('quick_connection', v)}
                  className="w-full font-bold text-sm sm:text-base text-indigo-950 leading-relaxed bg-transparent border-0 p-0 outline-none focus:outline-none focus:ring-0 resize-none"
                />

                <p className="text-[11px] text-indigo-800/80 italic leading-snug pt-1 border-t border-indigo-200/60">
                  💡 <strong>Lưu ý sư phạm:</strong> Học sinh chia sẻ nhanh 1 câu (1-2 em trong 30 giây), GV lắng nghe và ghi nhận tạo tâm thế vui vẻ. Tuyệt đối không dừng lại mổ xẻ phân tích nguyên lý vì sẽ để dành cho học sinh tự khám phá ở phần Hình thành kiến thức phía sau!
                </p>
              </div>
            </div>
          </div>

          {/* Bước 3: BẮC CẦU TÂM THẾ VÀO BÀI HỌC (CHUYỂN TIẾP MƯỢT MÀ) */}
          <div className="flex items-start gap-4 relative">
            <div className="w-10 flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shrink-0 z-10 shadow-2xs">
                <ArrowRight className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div
                id="khoidong-step-3"
                className="rounded-xl border border-slate-300 bg-slate-100/90 p-4 sm:p-4.5 text-xs sm:text-sm text-slate-950 leading-relaxed shadow-2xs space-y-3 transition-all duration-300"
              >
                {/* Lời khen ngợi & đúc kết cảm xúc */}
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                    LỜI KHEN NGỢI &amp; ĐÚC KẾT CẢM XÚC (TẠO HỨNG THÚ)
                  </div>
                  <AutoResizeTextarea
                    value={conclusion}
                    minRows={1}
                    placeholder="Lời động viên tạo hứng thú..."
                    onChange={v => updateField('conclusion', v)}
                    className="w-full font-bold text-xs sm:text-sm text-slate-950 bg-transparent border-0 p-0 outline-none focus:outline-none focus:ring-0 leading-relaxed resize-none"
                  />
                </div>

                {/* Mũi tên dẫn vào bài mới */}
                <div className="pt-3 border-t border-slate-200/90 flex items-start gap-2.5">
                  <div className="w-5.5 h-5.5 rounded-md bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-emerald-700 shadow-2xs">
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <AutoResizeTextarea
                      value={bridgeQuestion}
                      minRows={1}
                      placeholder="Lời dẫn chuyển tiếp mời học sinh vào quan sát các tư liệu lịch sử..."
                      onChange={v => updateField('bridge_question', v)}
                      className="w-full font-black text-xs sm:text-sm text-[#044E36] bg-transparent border-0 p-0 outline-none focus:outline-none focus:ring-0 leading-relaxed resize-none"
                    />

                    {/* Nút bấm chuyển qua Hình thành kiến thức */}
                    <div className="pt-1.5 flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Bắt đầu tiến trình Quy nạp tư liệu:
                      </span>
                      <button
                        type="button"
                        onClick={onGoToNextNode}
                        className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all cursor-pointer select-none"
                        title="Bấm để chuyển ngay sang node tiếp theo"
                      >
                        <span>{nextStepTitle ? `Vào: ${nextStepTitle}` : 'Bài 1: Lịch sử là gì?'}</span>
                        <ArrowRight className="w-4 h-4 text-emerald-100 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
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
              <Pencil className="w-3 h-3" /> {openNote ? 'Ẩn ghi chú sư phạm' : 'Ghi chú thêm cho trò chơi khởi động'}
            </button>
            {openNote && <div className="mt-2">{renderNote(0)}</div>}
          </div>
        )}
      </div>
    </div>
  )
}