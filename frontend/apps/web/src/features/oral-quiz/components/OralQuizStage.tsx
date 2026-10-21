'use client'

import React, { useState, useMemo } from 'react'
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Users,
  History,
  X,
  ChevronLeft,
} from 'lucide-react'
import { LuckyWheel } from './LuckyWheel'
import { QuestionCard } from './QuestionCard'
import { SetupView } from './SetupView'
import type { LessonQuestionDTO, StudentRecord } from '../types/oralQuiz'

interface OralQuizStageProps {
  initialLessonId?: string
  initialLessonTitle?: string
  initialQuestions?: LessonQuestionDTO[]
  onClose?: () => void
}

export function OralQuizStage({
  initialLessonId,
  initialLessonTitle,
  initialQuestions,
  onClose,
}: OralQuizStageProps) {
  // Session states
  const [isConfigured, setIsConfigured] = useState<boolean>(false)
  const [lessonId, setLessonId] = useState<string>(initialLessonId || '')
  const [lessonTitle, setLessonTitle] = useState<string>(initialLessonTitle || '')
  const [totalStudents, setTotalStudents] = useState<number>(38)
  const [excludeCalled, setExcludeCalled] = useState<boolean>(true)
  const [questions, setQuestions] = useState<LessonQuestionDTO[]>(initialQuestions || [])

  // Gameplay states
  const [stage, setStage] = useState<'wheel' | 'question'>('wheel')
  const [isSpinning, setIsSpinning] = useState<boolean>(false)
  const [currentStudent, setCurrentStudent] = useState<number | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<LessonQuestionDTO | null>(null)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0)
  const [history, setHistory] = useState<StudentRecord[]>([])
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  // Auto-configure if initialQuestions are passed
  React.useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0 && initialLessonId) {
      setQuestions(initialQuestions)
      setLessonId(initialLessonId)
      setLessonTitle(initialLessonTitle || 'Bài học')
      setIsConfigured(true)
    }
  }, [initialQuestions, initialLessonId, initialLessonTitle])

  // Excluded numbers list
  const excludedNumbers = useMemo(() => {
    if (!excludeCalled) return []
    return history.map(h => h.stt)
  }, [excludeCalled, history])

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  // Handle configuration from SetupView
  const handleSetupStart = (config: {
    lessonId: string
    lessonTitle: string
    totalStudents: number
    excludeCalled: boolean
    questions: LessonQuestionDTO[]
  }) => {
    setLessonId(config.lessonId)
    setLessonTitle(config.lessonTitle)
    setTotalStudents(config.totalStudents)
    setExcludeCalled(config.excludeCalled)
    setQuestions(config.questions)
    setHistory([])
    setCurrentStudent(null)
    setCurrentQuestion(null)
    setStage('wheel')
    setIsConfigured(true)
  }

  // Spin start
  const handleSpinStart = () => {
    if (isSpinning) return
    setIsSpinning(true)
  }

  // Spin finish: pick random question for selected student
  const handleSpinFinish = (selectedStt: number) => {
    setIsSpinning(false)
    setCurrentStudent(selectedStt)

    // Pick random question
    if (questions.length > 0) {
      const randomIdx = Math.floor(Math.random() * questions.length)
      setCurrentQuestion(questions[randomIdx])
      setCurrentQuestionIdx(randomIdx)
    }

    // Switch to question view after a short victory pause
    setTimeout(() => {
      setStage('question')
    }, 800)
  }

  // Pick another question for current student
  const handleChangeQuestion = () => {
    if (questions.length <= 1) return
    let nextIdx = Math.floor(Math.random() * questions.length)
    if (nextIdx === currentQuestionIdx) {
      nextIdx = (nextIdx + 1) % questions.length
    }
    setCurrentQuestion(questions[nextIdx])
    setCurrentQuestionIdx(nextIdx)
  }

  // Mark student result (correct / incorrect)
  const handleMarkResult = (isCorrect: boolean) => {
    if (currentStudent === null) return

    setHistory(prev => [
      {
        stt: currentStudent,
        calledCount: 1,
        lastResult: isCorrect ? 'correct' : 'incorrect',
      },
      ...prev.filter(p => p.stt !== currentStudent),
    ])

    // Return to wheel
    setStage('wheel')
    setCurrentStudent(null)
  }

  // Next student without recording score
  const handleNextStudent = () => {
    if (currentStudent !== null) {
      setHistory(prev => [
        {
          stt: currentStudent,
          calledCount: 1,
          lastResult: 'skipped',
        },
        ...prev.filter(p => p.stt !== currentStudent),
      ])
    }
    setStage('wheel')
    setCurrentStudent(null)
  }

  // Reset entire session
  const handleResetSession = () => {
    if (confirm('Bạn có muốn đặt lại danh sách học sinh đã gọi không?')) {
      setHistory([])
      setCurrentStudent(null)
      setCurrentQuestion(null)
      setStage('wheel')
    }
  }

  // If not configured, show SetupView
  if (!isConfigured) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center p-4">
        <SetupView
          onStart={handleSetupStart}
          initialLessonId={lessonId}
          initialLessonTitle={lessonTitle}
          initialQuestions={questions}
        />
      </div>
    )
  }

  return (
    <div className="w-full min-h-[85vh] flex flex-col bg-white border border-[var(--color-neutral-200)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden relative select-none font-body text-[var(--color-neutral-900)]">
      {/* ── TOP CLASSROOM BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-[var(--color-neutral-50)] border-b border-[var(--color-neutral-200)] shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsConfigured(false)}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-neutral-700)] hover:text-[var(--color-neutral-900)] bg-white border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-100)] px-3 py-1.5 rounded-[var(--radius-md)] transition-colors cursor-pointer"
            title="Đổi bài học hoặc cài đặt"
          >
            <ChevronLeft className="w-4 h-4" /> Đổi bài học
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-tertiary-500)]" />
            <h1 className="font-header font-bold text-base text-[var(--color-neutral-900)] uppercase truncate max-w-[280px] sm:max-w-md">
              {lessonTitle || 'Trả bài miệng'}
            </h1>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] bg-white border border-[var(--color-neutral-200)] text-xs font-mono font-bold text-[var(--color-neutral-700)]">
            <Users className="w-3.5 h-3.5 text-[var(--color-primary-500)]" />
            <span>
              Đã gọi: {history.length}/{totalStudents}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-neutral-700)] hover:text-[var(--color-neutral-900)] bg-white border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-100)] px-3 py-1.5 rounded-[var(--radius-md)] transition-colors cursor-pointer"
            title="Lịch sử gọi học sinh"
          >
            <History className="w-4 h-4 text-[var(--color-primary-500)]" />
            <span className="hidden sm:inline">Lịch sử</span>
          </button>

          <button
            type="button"
            onClick={handleResetSession}
            className="p-1.5 text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)] bg-white border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-100)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
            title="Đặt lại lượt quay"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)] bg-white border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-100)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
            title="Bật/Tắt Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[var(--color-neutral-600)] hover:text-rose-600 bg-white border border-[var(--color-neutral-200)] hover:bg-rose-50 rounded-[var(--radius-md)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN SCREEN BODY ── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-white">
        {stage === 'wheel' ? (
          <div className="flex flex-col items-center justify-center">
            {/* Stage Title */}
            <div className="text-center mb-2 space-y-1">
              <span className="text-xs uppercase tracking-wider font-mono font-bold text-[var(--color-primary-500)]">
                VÒNG QUAY MAY MẮN
              </span>
              <p className="text-xs sm:text-sm text-[var(--color-neutral-500)]">
                Bấm <strong>QUAY</strong> để chọn ngẫu nhiên học sinh lên bảng trả lời
              </p>
            </div>

            <LuckyWheel
              totalStudents={totalStudents}
              excludedNumbers={excludedNumbers}
              isSpinning={isSpinning}
              onSpinStart={handleSpinStart}
              onFinish={handleSpinFinish}
              selectedNumber={currentStudent}
            />
          </div>
        ) : (
          currentQuestion &&
          currentStudent !== null && (
            <div className="w-full">
              <QuestionCard
                studentNumber={currentStudent}
                question={currentQuestion}
                questionIndex={currentQuestionIdx}
                totalQuestions={questions.length}
                onMarkResult={handleMarkResult}
                onChangeQuestion={handleChangeQuestion}
                onNextStudent={handleNextStudent}
              />
            </div>
          )
        )}
      </div>

      {/* ── HISTORY DRAWER ── */}
      {showHistory && (
        <div className="absolute inset-y-0 right-0 w-80 bg-white border-l border-[var(--color-neutral-200)] p-5 shadow-lg z-40 flex flex-col gap-4 font-body">
          <div className="flex items-center justify-between border-b border-[var(--color-neutral-200)] pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-[var(--color-neutral-900)]">
              <History className="w-4 h-4 text-[var(--color-primary-500)]" />
              <span>Học sinh đã trả bài ({history.length})</span>
            </div>
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="p-1 text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-900)] rounded-[var(--radius-xs)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {history.length === 0 ? (
              <div className="text-xs text-[var(--color-neutral-500)] text-center py-8">
                Chưa có học sinh nào được gọi.
              </div>
            ) : (
              history.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)] bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-[var(--radius-xs)] bg-[var(--color-primary-500)] text-white flex items-center justify-center font-mono font-bold">
                      {rec.stt}
                    </span>
                    <span className="font-medium text-[var(--color-neutral-800)]">Học sinh số {rec.stt}</span>
                  </div>
                  <div>
                    {rec.lastResult === 'correct' && (
                      <span className="px-2 py-0.5 rounded-[var(--radius-xs)] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        Đạt
                      </span>
                    )}
                    {rec.lastResult === 'incorrect' && (
                      <span className="px-2 py-0.5 rounded-[var(--radius-xs)] bg-rose-50 text-rose-700 font-bold border border-rose-200">
                        Chưa đạt
                      </span>
                    )}
                    {rec.lastResult === 'skipped' && (
                      <span className="px-2 py-0.5 rounded-[var(--radius-xs)] bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)] font-medium">
                        Đã gọi
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
