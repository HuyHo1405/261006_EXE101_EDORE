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
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-3 md:p-4 overflow-y-auto font-body">
      <OralQuizStage
        initialLessonId={lessonId}
        initialLessonTitle={lessonTitle}
        initialQuestions={questions}
        onClose={onClose}
      />
    </div>
  )
}
