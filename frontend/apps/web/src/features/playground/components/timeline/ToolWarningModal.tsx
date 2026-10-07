'use client'

import React from 'react'
import { AlertTriangle, Check } from 'lucide-react'

interface ToolWarningModalProps {
  isOpen: boolean
  preparedToolsCount: number
  totalToolsCount: number
  unpreparedTools: any[]
  onSkip: () => void
  onPrepare: () => void
}

export function ToolWarningModal({
  isOpen,
  preparedToolsCount,
  totalToolsCount,
  unpreparedTools,
  onSkip,
  onPrepare,
}: ToolWarningModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-header font-bold text-sm text-slate-900 leading-snug">
              Chưa chuẩn bị đủ học liệu ({preparedToolsCount}/{totalToolsCount})
            </h3>
            <p className="font-body text-xs text-slate-600 leading-relaxed">
              Còn {unpreparedTools.length} học liệu chưa được xác nhận. Bạn muốn chuẩn bị trước hay tiếp tục xem?
            </p>
          </div>
        </div>

        {/* 2 Lựa chọn thao tác: Bỏ qua / Chuẩn bị */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onSkip}
            className="font-body px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Bỏ qua
          </button>
          <button
            type="button"
            onClick={onPrepare}
            className="font-body px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Chuẩn bị</span>
          </button>
        </div>
      </div>
    </div>
  )
}
