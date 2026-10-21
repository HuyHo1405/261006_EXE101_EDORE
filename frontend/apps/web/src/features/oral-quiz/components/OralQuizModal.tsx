'use client'

import React from 'react'
import { OralQuizStage } from './OralQuizStage'
import type { LessonQuestionDTO } from '../types/oralQuiz'

interface OralQuizModalProps {
  isOpen: boolean
  onClose: () => void
  lessonId?: string
  lessonTitle?: string
  questions?: LessonQuestionDTO[]
}

export function OralQuizModal({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  questions,
}: OralQuizModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6">
      <div className="w-full max-w-5xl max-h-[96vh] flex flex-col rounded-[var(--radius-xl)] overflow-hidden shadow-xl bg-white border border-[var(--color-neutral-200)]">
        <OralQuizStage
          initialLessonId={lessonId}
          initialLessonTitle={lessonTitle}
          initialQuestions={questions}
          onClose={onClose}
        />
      </div>
    </div>
  )
}
