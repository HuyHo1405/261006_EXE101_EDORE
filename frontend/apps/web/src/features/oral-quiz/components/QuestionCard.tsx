'use client'

import React, { useState, useEffect } from 'react'
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCw,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react'
import type { LessonQuestionDTO } from '../types/oralQuiz'

interface QuestionCardProps {
  studentNumber: number
  question: LessonQuestionDTO
  questionIndex: number
  totalQuestions: number
  onMarkResult: (isCorrect: boolean) => void
  onChangeQuestion: () => void
  onNextStudent: () => void
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export function QuestionCard({
  studentNumber,
  question,
  questionIndex,
  totalQuestions,
  onMarkResult,
  onChangeQuestion,
  onNextStudent,
}: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(question.timeLimit || 30)
  const [isTimerRunning, setIsTimerRunning] = useState(true)

  // Reset timer and answer view when question changes
  useEffect(() => {
    setTimeLeft(question.timeLimit || 30)
    setShowAnswer(false)
    setIsTimerRunning(true)
  }, [question])

  // Countdown timer
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isTimerRunning, timeLeft])

  const isTimeCritical = timeLeft <= 5 && timeLeft > 0

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 font-body">
      {/* ── TOP BANNER: STT HỌC SINH & TIMER (Brand Blue) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--color-primary-500)] text-white rounded-[var(--radius-lg)] p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-12 h-12 rounded-[var(--radius-md)] bg-white text-[var(--color-primary-500)] font-mono font-bold text-2xl shadow-xs">
            {studentNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-blue-100 font-bold font-mono">
                Lượt trả bài
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-[var(--radius-xs)] bg-white/20 font-mono text-white">
                Câu {questionIndex + 1}/{totalQuestions}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-header font-bold text-white uppercase tracking-tight">
              Học sinh số {studentNumber}
            </h2>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2.5 bg-white/15 px-3.5 py-1.5 rounded-[var(--radius-md)] border border-white/20">
          <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-amber-300 animate-pulse' : 'text-white'}`} />
          <span
            className={`text-xl font-mono font-bold ${
              timeLeft === 0
                ? 'text-rose-200'
                : isTimeCritical
                ? 'text-amber-300'
                : 'text-white'
            }`}
          >
            {timeLeft}s
          </span>
          <button
            type="button"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="text-xs px-2 py-1 rounded-[var(--radius-xs)] bg-white/20 hover:bg-white/30 text-white font-medium cursor-pointer transition-colors"
          >
            {isTimerRunning ? 'Dừng' : 'Tiếp'}
          </button>
        </div>
      </div>

      {/* ── QUESTION CARD BODY ── */}
      <div className="bg-white rounded-[var(--radius-lg)] p-6 sm:p-8 border border-[var(--color-neutral-200)] shadow-xs flex flex-col gap-6">
        {/* Difficulty badge & question text */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-[var(--radius-xs)] text-xs font-mono font-bold uppercase bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] border border-[var(--color-neutral-200)]">
              {question.difficulty || 'Trắc nghiệm'}
            </span>
            {question.stageTag && (
              <span className="px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] font-mono text-[var(--color-neutral-500)]">
                {question.stageTag}
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-header font-bold text-[var(--color-neutral-900)] leading-snug uppercase">
            {question.questionText}
          </h3>
        </div>

        {/* Options Grid (4 items) */}
        {question.options && question.options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((opt, idx) => {
              const isCorrectAnswer = idx + 1 === question.correctAnswer
              const isRevealed = showAnswer && isCorrectAnswer

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-[var(--radius-md)] border transition-all flex items-start gap-3 ${
                    isRevealed
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                      : 'bg-[var(--color-neutral-50)] hover:bg-white border-[var(--color-neutral-200)] hover:border-[var(--color-primary-500)] text-[var(--color-neutral-800)]'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-[var(--radius-xs)] flex items-center justify-center font-header font-bold text-xs shrink-0 ${
                      isRevealed
                        ? 'bg-[var(--color-tertiary-500)] text-white'
                        : 'bg-white text-[var(--color-primary-500)] border border-[var(--color-neutral-200)]'
                    }`}
                  >
                    {OPTION_LABELS[idx] || idx + 1}
                  </span>
                  <div className="flex-1 text-sm sm:text-base font-medium pt-0.5">
                    {opt}
                  </div>
                  {isRevealed && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Answer & Explanation Box (if toggled) */}
        {showAnswer && (
          <div className="rounded-[var(--radius-md)] p-4 bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Đáp án đúng: Phương án{' '}
                {OPTION_LABELS[question.correctAnswer - 1] || question.correctAnswer}
              </span>
            </div>
            {question.explanation && (
              <p className="text-emerald-800 leading-relaxed pl-6">
                <strong>Giải thích:</strong> {question.explanation}
              </p>
            )}
          </div>
        )}

        {/* Bottom Actions for Teacher */}
        <div className="pt-4 border-t border-[var(--color-neutral-200)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAnswer(!showAnswer)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-md)] font-bold text-xs sm:text-sm border transition-all cursor-pointer ${
                showAnswer
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-[var(--color-neutral-700)] border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]'
              }`}
            >
              {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án'}
            </button>

            <button
              type="button"
              onClick={onChangeQuestion}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] font-medium text-xs sm:text-sm text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)] hover:bg-[var(--color-neutral-100)] transition-colors cursor-pointer"
              title="Đổi câu hỏi khác cho học sinh này"
            >
              <RotateCw className="w-4 h-4" />
              Đổi câu khác
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onMarkResult(false)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-md)] font-bold text-xs sm:text-sm bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              Chưa đạt
            </button>
            <button
              type="button"
              onClick={() => onMarkResult(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] font-bold text-xs sm:text-sm bg-[var(--color-tertiary-500)] hover:bg-[#0e906e] text-white shadow-xs transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Đạt
            </button>
            <button
              type="button"
              onClick={onNextStudent}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] font-bold text-xs sm:text-sm bg-[var(--color-primary-500)] hover:bg-[#023ec0] text-white shadow-xs transition-all cursor-pointer"
            >
              <span>Quay tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
