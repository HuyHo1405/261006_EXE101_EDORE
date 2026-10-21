'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { OralQuizStage } from '@/features/oral-quiz/components/OralQuizStage'

function TraBaiContent() {
  const searchParams = useSearchParams()
  const lessonId = searchParams.get('lessonId') || undefined
  const lessonTitle = searchParams.get('lessonTitle') || undefined

  return (
    <div className="w-full min-h-screen bg-[var(--color-neutral-50)] p-3 sm:p-6 md:p-8 flex flex-col justify-center items-center font-body text-[var(--color-neutral-900)]">
      <div className="w-full max-w-5xl">
        <OralQuizStage
          initialLessonId={lessonId}
          initialLessonTitle={lessonTitle}
        />
      </div>
    </div>
  )
}

export default function TraBaiPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="p-10 text-center text-[var(--color-neutral-500)] text-sm">Đang tải Vòng quay Trả bài...</div>}>
        <TraBaiContent />
      </Suspense>
    </AuthGuard>
  )
}
