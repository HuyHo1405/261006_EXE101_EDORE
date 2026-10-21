'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-3 md:p-4 overflow-y-auto no-scrollbar font-body">
      <OralQuizStage
        initialLessonId={lessonId}
        initialLessonTitle={lessonTitle}
        initialQuestions={questions}
        onClose={onClose}
      />
    </div>,
    document.body
  )
}

