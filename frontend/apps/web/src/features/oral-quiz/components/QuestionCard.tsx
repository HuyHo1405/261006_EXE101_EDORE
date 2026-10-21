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

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

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
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(question.timeLimit || 30)
  const [isTimerRunning, setIsTimerRunning] = useState(true)

  // Reset timer, answer view, and selected option when question changes
  useEffect(() => {
    setTimeLeft(question.timeLimit || 30)
    setShowAnswer(false)
    setSelectedOption(null)
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

  // Filter valid non-empty options (supports 2, 3, 4+ options dynamically)
  const validOptions = (question.options || []).filter(
    (opt): opt is string => typeof opt === 'string' && opt.trim().length > 0
  )

  const handleOptionClick = (optionNumber: number) => {
    if (selectedOption === optionNumber) {
      setSelectedOption(null)
    } else {
      setSelectedOption(optionNumber)
    }
  }

  return (
    <div className="w-full max-w-2xl lg:max-w-3xl mx-auto flex flex-col gap-2 font-body">
      {/* ── TOP BANNER: STT HỌC SINH & TIMER (Brand Blue - Compact) ── */}
      <div className="flex items-center justify-between gap-2 bg-[var(--color-primary-500)] text-white rounded-[var(--radius-lg)] px-3 py-1.5 sm:px-4 sm:py-2 shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-[var(--radius-md)] bg-white text-[var(--color-primary-500)] font-mono font-bold text-sm sm:text-base shadow-xs shrink-0">
            {studentNumber}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-blue-100 font-bold font-mono">
                Lượt trả bài
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-[var(--radius-xs)] bg-white/20 font-mono text-white">
                Câu {questionIndex + 1}/{totalQuestions}
              </span>
            </div>
            <h2 className="text-xs sm:text-sm font-header font-bold text-white uppercase tracking-tight">
              Học sinh số {studentNumber}
            </h2>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1.5 bg-white/15 px-2 py-0.5 rounded-[var(--radius-md)] border border-white/20">
          <Clock className={`w-3.5 h-3.5 ${isTimeCritical ? 'text-amber-300 animate-pulse' : 'text-white'}`} />
          <span
            className={`text-sm sm:text-base font-mono font-bold ${
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
            className="text-[10px] px-1.5 py-0.5 rounded-[var(--radius-xs)] bg-white/20 hover:bg-white/30 text-white font-medium cursor-pointer transition-colors"
          >
            {isTimerRunning ? 'Dừng' : 'Tiếp'}
          </button>
        </div>
      </div>

      {/* ── QUESTION CARD BODY (Compact 2x2 grid to prevent scroll) ── */}
      <div className="bg-white rounded-[var(--radius-lg)] p-3 sm:p-3.5 border border-[var(--color-neutral-200)] shadow-xs flex flex-col gap-2 sm:gap-2.5">
        {/* Difficulty badge & question text */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-[var(--radius-xs)] text-[10px] sm:text-[11px] font-mono font-bold uppercase bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] border border-[var(--color-neutral-200)]">
              {question.difficulty || 'Trắc nghiệm'}
            </span>
            {question.stageTag && (
              <span className="px-1.5 py-0.5 rounded-[var(--radius-xs)] text-[10px] font-mono text-[var(--color-neutral-500)]">
                {question.stageTag}
              </span>
            )}
          </div>

          <h3 className="text-sm sm:text-base font-header font-bold text-[var(--color-neutral-900)] leading-snug">
            {question.questionText}
          </h3>
        </div>

        {/* Options List: Bố trí 2 cột (2x2 grid) khi có từ 2 options trở lên để cực kỳ gọn gàng */}
        {validOptions.length > 0 && (
          <div
            className={`grid gap-2 ${
              validOptions.length >= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {validOptions.map((opt, idx) => {
              const optionNumber = idx + 1
              const isSelected = selectedOption === optionNumber
              const isCorrectAnswer = optionNumber === question.correctAnswer
              const isLastOdd = validOptions.length % 2 === 1 && idx === validOptions.length - 1

              // Determine styling state based on selection & reveal
              let itemStyle =
                'bg-[var(--color-neutral-50)] hover:bg-blue-50/60 border-[var(--color-neutral-200)] hover:border-[var(--color-primary-400)] text-[var(--color-neutral-800)]'
              let badgeStyle =
                'bg-white text-[var(--color-primary-600)] border border-[var(--color-neutral-200)]'
              let statusIndicator = null

              if (selectedOption !== null) {
                if (isSelected) {
                  if (isCorrectAnswer) {
                    itemStyle =
                      'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500 shadow-xs'
                    badgeStyle = 'bg-emerald-600 text-white'
                    statusIndicator = (
                      <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Đúng</span>
                      </div>
                    )
                  } else {
                    itemStyle =
                      'bg-rose-50 border-rose-400 text-rose-950 ring-1 ring-rose-400 shadow-xs'
                    badgeStyle = 'bg-rose-500 text-white'
                    statusIndicator = (
                      <div className="flex items-center gap-1 text-rose-600 font-bold text-xs shrink-0">
                        <XCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Sai</span>
                      </div>
                    )
                  }
                } else if (isCorrectAnswer) {
                  itemStyle =
                    'bg-emerald-50/70 border-dashed border-emerald-500 text-emerald-900'
                  badgeStyle = 'bg-emerald-600 text-white'
                  statusIndicator = (
                    <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Đáp án</span>
                    </div>
                  )
                } else {
                  itemStyle =
                    'opacity-40 bg-[var(--color-neutral-50)] border-[var(--color-neutral-200)] text-[var(--color-neutral-500)]'
                  badgeStyle =
                    'bg-white text-[var(--color-neutral-400)] border border-[var(--color-neutral-200)]'
                }
              } else if (showAnswer && isCorrectAnswer) {
                itemStyle =
                  'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-400'
                badgeStyle = 'bg-[var(--color-tertiary-500)] text-white'
                statusIndicator = (
                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Đáp án</span>
                  </div>
                )
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleOptionClick(optionNumber)}
                  className={`w-full text-left py-2 px-3 rounded-[var(--radius-md)] border transition-all flex items-center justify-between gap-2 cursor-pointer active:scale-[0.995] ${
                    isLastOdd ? 'sm:col-span-2' : ''
                  } ${itemStyle}`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`w-6 h-6 rounded-[var(--radius-xs)] flex items-center justify-center font-header font-bold text-xs shrink-0 transition-colors ${badgeStyle}`}
                    >
                      {OPTION_LABELS[idx] || idx + 1}
                    </span>
                    <div className="text-xs sm:text-sm font-medium leading-snug break-words flex-1">
                      {opt}
                    </div>
                  </div>

                  {statusIndicator}
                </button>
              )
            })}
          </div>
        )}

        {/* Answer & Explanation Box (Compact) */}
        {showAnswer && (
          <div className="rounded-[var(--radius-md)] p-2 sm:p-2.5 bg-emerald-50/90 border border-emerald-200 space-y-0.5 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                Đáp án đúng: Phương án{' '}
                {OPTION_LABELS[question.correctAnswer - 1] || question.correctAnswer}
                {validOptions[question.correctAnswer - 1]
                  ? ` - ${validOptions[question.correctAnswer - 1]}`
                  : ''}
              </span>
            </div>
            {question.explanation && (
              <p className="text-emerald-800 leading-normal pl-5 text-[11px]">
                <strong>Giải thích:</strong> {question.explanation}
              </p>
            )}
          </div>
        )}

        {/* Bottom Actions for Teacher (Compact) */}
        <div className="pt-2 border-t border-[var(--color-neutral-200)] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowAnswer(!showAnswer)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] font-bold text-xs border transition-all cursor-pointer ${
                showAnswer
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-[var(--color-neutral-700)] border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]'
              }`}
            >
              {showAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án'}
            </button>

            <button
              type="button"
              onClick={onChangeQuestion}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] font-medium text-xs text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)] hover:bg-[var(--color-neutral-100)] transition-colors cursor-pointer"
              title="Đổi câu hỏi khác cho học sinh này"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Đổi câu khác
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onMarkResult(false)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-md)] font-bold text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border transition-all cursor-pointer ${
                selectedOption !== null && selectedOption !== question.correctAnswer
                  ? 'border-rose-400 ring-1 ring-rose-300'
                  : 'border-rose-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Chưa đạt
            </button>
            <button
              type="button"
              onClick={() => onMarkResult(true)}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-[var(--radius-md)] font-bold text-xs bg-[var(--color-tertiary-500)] hover:bg-[#0e906e] text-white shadow-xs transition-all cursor-pointer ${
                selectedOption === question.correctAnswer
                  ? 'ring-2 ring-emerald-300 scale-[1.02]'
                  : ''
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đạt
            </button>
            <button
              type="button"
              onClick={onNextStudent}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-[var(--radius-md)] font-bold text-xs bg-[var(--color-primary-500)] hover:bg-[#023ec0] text-white shadow-xs transition-all cursor-pointer"
            >
              <span>Quay tiếp</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
