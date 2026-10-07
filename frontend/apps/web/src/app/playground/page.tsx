'use client'

import { useState } from 'react'
import TimelineEditor from '@/features/playground/components/TimelineEditor'
import {
  MOCK_STEPS_LICHSU,
  MOCK_LESSON_META_LICHSU,
} from '@/features/playground/data/mockLessonLichSu'
import type { TimelineStep } from '@/lib/services/pipelineService'

export default function PlaygroundPreviewPage() {
  const [steps, setSteps] = useState<TimelineStep[]>(MOCK_STEPS_LICHSU)
  const [lessonMeta] = useState(MOCK_LESSON_META_LICHSU)

  return (
    <div className="w-full bg-[var(--color-primary-500)] min-h-screen py-4 md:py-6 px-2.5 sm:px-4 md:px-6 font-body">
      <div className="max-w-[1400px] mx-auto min-h-[580px]">
        {/* Banner Preview Notification */}
        <div className="mb-4 bg-white/95 backdrop-blur-sm border border-white/40 shadow-lg rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300">
              DEMO PREVIEW
            </span>
            <span className="font-semibold text-slate-800">
              Dữ liệu mẫu từ tài liệu:{' '}
              <strong className="text-[var(--color-primary-700)]">BÀI 1: LỊCH SỬ LÀ GÌ?</strong>
            </span>
          </div>
          <div className="text-slate-500 text-[11px]">
            Xem giao diện các phần: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng
          </div>
        </div>

        {/* Main Editor */}
        <main className="w-full bg-white border border-white/20 shadow-2xl rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 flex flex-col min-h-[580px]">
          <TimelineEditor
            steps={steps}
            onStepsChange={setSteps}
            contentSummary="Bài học truyền cảm hứng về tầm quan trọng của lịch sử và phương pháp nghiên cứu quá khứ. Học sinh làm quen với khái niệm lịch sử, ý nghĩa môn học và phân biệt 4 nguồn sử liệu: tư liệu gốc, tư liệu truyền miệng, tư liệu chữ viết và tư liệu hiện vật."
            courseTitle="Lịch sử và Địa lí 6"
            scriptTitle="Kịch bản dạy học: Bài 1 - Lịch sử là gì?"
            lessonMeta={lessonMeta}
          />
        </main>
      </div>
    </div>
  )
}
