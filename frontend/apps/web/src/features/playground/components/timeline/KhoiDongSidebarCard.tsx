'use client'

import React from 'react'
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'

interface KhoiDongSidebarCardProps {
  onOpenOralQuiz?: () => void
}

export function KhoiDongSidebarCard({ onOpenOralQuiz }: KhoiDongSidebarCardProps) {
  return (
    <div className="bg-white border-[3px] border-[var(--color-primary-500)] p-4 rounded-[var(--radius-xl)] shadow-xs flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
            <Sparkles className="w-4 h-4 text-[var(--color-primary-600)]" />
          </div>
          <span className="font-header text-xs font-extrabold uppercase tracking-wider text-slate-800">
            HOẠT ĐỘNG ĐẦU GIỜ
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          5 - 7 phút
        </span>
      </div>

      {/* Description & Features */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-900 leading-snug">
          Kiểm tra bài cũ & Khởi động tiết học
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Gọi ngẫu nhiên học sinh lên bảng bằng Vòng quay may mắn, trả lời câu hỏi trắc nghiệm ôn tập trước khi vào bài mới.
        </p>

        <div className="space-y-1 pt-1 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Quay số theo sĩ số lớp học (STT 1 → N)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Tự động loại trừ học sinh đã được gọi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Ngân hàng câu hỏi theo bài / theo chương</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onOpenOralQuiz}
          className="w-full flex items-center justify-between p-2.5 rounded-xl border-2 border-amber-200 hover:border-amber-300 bg-amber-50 text-amber-800 font-body text-xs font-bold transition-all active:scale-[0.98] cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="text-left">
              <div className="leading-tight">Vòng quay may mắn (Lucky Wheel)</div>
              <div className="text-[10px] text-amber-700/80 font-normal mt-0.5">
                Bắt đầu quay chọn học sinh &amp; hiện câu hỏi
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>
      </div>
    </div>
  )
}
