'use client'

import React from 'react'
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'

interface KhoiDongSidebarCardProps {
  onOpenOralQuiz?: () => void
}

export function KhoiDongSidebarCard({ onOpenOralQuiz }: KhoiDongSidebarCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border-[3px] border-[var(--color-primary-500)] dark:border-blue-600 p-4 rounded-[var(--radius-xl)] shadow-xs flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[var(--color-primary-50)] dark:bg-blue-950/60 text-[var(--color-primary-600)] dark:text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-header text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            HOẠT ĐỘNG ĐẦU GIỜ
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          5 - 7 phút
        </span>
      </div>

      {/* Description & Features */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
          Kiểm tra bài cũ & Khởi động tiết học
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Gọi ngẫu nhiên học sinh lên bảng bằng Vòng quay may mắn, trả lời câu hỏi trắc nghiệm ôn tập trước khi vào bài mới.
        </p>

        <div className="space-y-1 pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
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
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onOpenOralQuiz}
          className="w-full flex items-center justify-between p-2.5 rounded-xl border-2 border-amber-200 dark:border-amber-800 hover:border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/50 font-body text-xs font-bold transition-all active:scale-[0.98] cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="text-left">
              <div className="leading-tight">Vòng quay gọi tên trả bài</div>
              <div className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-normal mt-0.5">
                Bắt đầu quay chọn học sinh &amp; hiện câu hỏi
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>
      </div>
    </div>
  )
}
