'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  BookOpen,
  Layers,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Play,
  Plus,
  ArrowRight,
  ArrowLeft,
  Users,
  X,
} from 'lucide-react'
import {
  useCurriculum,
  useLessonQuestions,
  useChapterQuestions,
  useCategories,
} from '@/features/course/queries/courseQueries'
import type { LessonQuestionDTO } from '../types/oralQuiz'

interface SetupViewProps {
  onStart: (config: {
    lessonId: string
    lessonTitle: string
    totalStudents: number
    excludeCalled: boolean
    questions: LessonQuestionDTO[]
  }) => void
  initialLessonId?: string
  initialLessonTitle?: string
  initialQuestions?: LessonQuestionDTO[]
  onClose?: () => void
}

const DEFAULT_GRADES = [
  { value: '6', label: 'Khối 6' },
  { value: '7', label: 'Khối 7' },
  { value: '8', label: 'Khối 8' },
  { value: '9', label: 'Khối 9' },
]

export function SetupView({
  onStart,
  initialLessonId,
  initialLessonTitle,
  initialQuestions,
  onClose,
}: SetupViewProps) {
  // ── Flow Steps: 1. Nhập số học sinh -> 2. Chọn câu hỏi trả bài -> Bắt đầu ──
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)

  // ── Step 1 States: Sĩ số học sinh & Cài đặt ──
  const [totalStudents, setTotalStudents] = useState<number>(38)
  const [excludeCalled, setExcludeCalled] = useState<boolean>(true)

  // ── Step 2 States: Hình thức & Nội dung kiểm tra ──
  const [mode, setMode] = useState<'lesson' | 'chapter'>('lesson')
  const [selectedGrade, setSelectedGrade] = useState<string>('6')
  const [selectedLessonId, setSelectedLessonId] = useState<string>(initialLessonId || '')
  const [selectedChapterId, setSelectedChapterId] = useState<string>('')

  // ── Câu hỏi tự thêm (nếu DB rỗng) ──
  const [customQuestions, setCustomQuestions] = useState<LessonQuestionDTO[]>([])
  const [showAddCustomModal, setShowAddCustomModal] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState('')
  const [newOpt1, setNewOpt1] = useState('')
  const [newOpt2, setNewOpt2] = useState('')
  const [newOpt3, setNewOpt3] = useState('')
  const [newOpt4, setNewOpt4] = useState('')
  const [newCorrect, setNewCorrect] = useState(1)

  // Danh sách Khối lớp từ DB (hoặc mặc định 6-9)
  const { data: gradeCategories } = useCategories('GRADE')
  const gradeOptions = useMemo(() => {
    if (gradeCategories && gradeCategories.length > 0) {
      return [...gradeCategories]
        .sort((a, b) => parseInt(a.code, 10) - parseInt(b.code, 10))
        .map(c => ({ value: c.code, label: c.name || `Khối ${c.code}` }))
    }
    return DEFAULT_GRADES
  }, [gradeCategories])

  // Lấy toàn bộ cây học liệu của khối lớp đã chọn
  const { data: semesters = [], isLoading: isLoadingCurriculum } = useCurriculum({
    gradeCode: selectedGrade || undefined,
  })

  // Danh sách toàn bộ bài học thuộc khối lớp (Grade -> Bài trực tiếp, không cần chương)
  const allLessonsOfGrade = useMemo(() => {
    const list: Array<{ id: string; title: string; order?: number; chapterTitle?: string }> = []
    semesters.forEach(sem => {
      sem.chapters?.forEach(ch => {
        ch.lessons?.forEach(les => {
          list.push({
            id: les.id,
            title: les.title,
            order: les.orderInChapter,
            chapterTitle: ch.title,
          })
        })
      })
    })
    return list
  }, [semesters])

  // Danh sách toàn bộ chương thuộc khối lớp (Grade -> Select chương trực tiếp)
  const allChaptersOfGrade = useMemo(() => {
    const list: Array<{ id: string; title: string; order?: number; lessonCount: number }> = []
    semesters.forEach(sem => {
      sem.chapters?.forEach(ch => {
        list.push({
          id: ch.id,
          title: ch.title,
          order: ch.order,
          lessonCount: ch.lessons?.length || 0,
        })
      })
    })
    return list
  }, [semesters])

  // Tự động chọn bài đầu tiên khi đổi lớp hoặc chuyển sang mode bài
  useEffect(() => {
    if (mode === 'lesson' && allLessonsOfGrade.length > 0) {
      const exists = allLessonsOfGrade.some(l => l.id === selectedLessonId)
      if (!exists) {
        setSelectedLessonId(allLessonsOfGrade[0].id)
      }
    }
  }, [mode, allLessonsOfGrade, selectedLessonId])

  // Tự động chọn chương đầu tiên khi đổi lớp hoặc chuyển sang mode chương
  useEffect(() => {
    if (mode === 'chapter' && allChaptersOfGrade.length > 0) {
      const exists = allChaptersOfGrade.some(c => c.id === selectedChapterId)
      if (!exists) {
        setSelectedChapterId(allChaptersOfGrade[0].id)
      }
    }
  }, [mode, allChaptersOfGrade, selectedChapterId])

  // Query câu hỏi cho bài học (Mode bài)
  const { data: dbLessonQuestions = [], isLoading: isLoadingLessonQuestions } = useLessonQuestions(
    mode === 'lesson' ? selectedLessonId : undefined,
    'PRACTICE'
  )

  // Query câu hỏi cho chương (Mode chương)
  const { data: dbChapterQuestions = [], isLoading: isLoadingChapterQuestions } = useChapterQuestions(
    mode === 'chapter' ? selectedChapterId : undefined,
    'PRACTICE'
  )

  const isLoadingQuestions = mode === 'lesson' ? isLoadingLessonQuestions : isLoadingChapterQuestions

  // Tổng hợp câu hỏi có hiệu lực
  const effectiveQuestions = useMemo(() => {
    if (initialQuestions && initialQuestions.length > 0 && selectedLessonId === initialLessonId && mode === 'lesson') {
      return [...initialQuestions, ...customQuestions]
    }
    const base = mode === 'lesson' ? dbLessonQuestions : dbChapterQuestions
    return [...base, ...customQuestions]
  }, [
    mode,
    initialQuestions,
    initialLessonId,
    selectedLessonId,
    dbLessonQuestions,
    dbChapterQuestions,
    customQuestions,
  ])

  // Tiêu đề hiển thị cho buổi trả bài
  const activeTitle = useMemo(() => {
    if (mode === 'chapter') {
      const ch = allChaptersOfGrade.find(c => c.id === selectedChapterId)
      return ch ? `Ôn tập ${ch.title}` : 'Ôn tập theo chương'
    }
    const les = allLessonsOfGrade.find(l => l.id === selectedLessonId)
    return les ? les.title : initialLessonTitle || 'Trả bài miệng'
  }, [mode, allChaptersOfGrade, selectedChapterId, allLessonsOfGrade, selectedLessonId, initialLessonTitle])

  const handleAddCustomQuestion = () => {
    if (!newQuestionText.trim()) return
    const q: LessonQuestionDTO = {
      id: `custom_${Date.now()}`,
      questionText: newQuestionText.trim(),
      options: [newOpt1.trim(), newOpt2.trim(), newOpt3.trim(), newOpt4.trim()].filter(Boolean),
      correctAnswer: newCorrect,
      timeLimit: 30,
      difficulty: 'Tự thêm',
    }
    setCustomQuestions(prev => [...prev, q])
    setNewQuestionText('')
    setNewOpt1('')
    setNewOpt2('')
    setNewOpt3('')
    setNewOpt4('')
    setShowAddCustomModal(false)
  }

  const handleStart = () => {
    if (effectiveQuestions.length === 0) return

    onStart({
      lessonId: mode === 'chapter' ? selectedChapterId : selectedLessonId,
      lessonTitle: activeTitle,
      totalStudents: Math.max(5, Math.min(100, totalStudents)),
      excludeCalled,
      questions: effectiveQuestions,
    })
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-[var(--radius-xl)] border border-[var(--color-neutral-200)] p-5 sm:p-7 shadow-sm flex flex-col gap-5 sm:gap-6 font-body text-[var(--color-neutral-900)] my-auto">
      {/* ── HEADER ── */}
      <div className="border-b border-[var(--color-neutral-200)] pb-4 space-y-1 relative pr-8">
        <h1 className="font-header font-bold text-xl sm:text-2xl uppercase tracking-tight text-[var(--color-neutral-900)]">
          CÀI ĐẶT TRẢ BÀI
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-neutral-500)]">
          Thiết lập sĩ số học sinh và câu hỏi trước khi bắt đầu vòng quay.
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-0 right-0 p-1.5 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)] rounded-[var(--radius-xs)] hover:bg-[var(--color-neutral-100)] transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── STEPPER TABS / INDICATOR ── */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-[var(--color-neutral-100)] rounded-[var(--radius-md)]">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`py-2.5 px-3 rounded-[var(--radius-sm)] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${currentStep === 1
            ? 'bg-white text-[var(--color-primary-500)] shadow-xs'
            : 'text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)]'
            }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-colors ${currentStep === 1
              ? 'bg-[var(--color-primary-500)] text-white'
              : 'bg-[var(--color-neutral-200)] text-[var(--color-neutral-700)]'
              }`}
          >
            1
          </span>
          <span>Nhập số học sinh</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className={`py-2.5 px-3 rounded-[var(--radius-sm)] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${currentStep === 2
            ? 'bg-white text-[var(--color-primary-500)] shadow-xs'
            : 'text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)]'
            }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-colors ${currentStep === 2
              ? 'bg-[var(--color-primary-500)] text-white'
              : 'bg-[var(--color-neutral-200)] text-[var(--color-neutral-700)]'
              }`}
          >
            2
          </span>
          <span>Chọn câu hỏi trả bài</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BƯỚC 1: NHẬP SỐ HỌC SINH
      ══════════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="space-y-5 sm:space-y-6 animate-fadeIn">
          {/* Sĩ số học sinh */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-neutral-700)] flex flex-wrap items-center justify-between gap-1">
              <span>Sĩ số học sinh lớp (STT 1 → N)</span>
              <span className="text-[var(--color-primary-500)] font-bold">{totalStudents} học sinh</span>
            </label>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <input
                type="number"
                min={5}
                max={80}
                value={totalStudents}
                onChange={e => setTotalStudents(Number(e.target.value) || 35)}
                className="w-24 sm:w-28 h-10 px-3 rounded-[var(--radius-md)] border border-[var(--color-neutral-200)] font-mono font-bold text-center text-sm sm:text-base focus:outline-none focus:border-[var(--color-primary-500)]"
              />

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {[30, 35, 40, 45].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setTotalStudents(cnt)}
                    className={`h-10 px-3 rounded-[var(--radius-md)] text-xs font-mono font-bold border transition-all cursor-pointer ${totalStudents === cnt
                      ? 'bg-[var(--color-primary-500)] text-white border-[var(--color-primary-500)] shadow-xs'
                      : 'bg-white text-[var(--color-neutral-700)] border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-50)]'
                      }`}
                  >
                    {cnt} HS
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-[var(--color-neutral-500)]">
              Vòng quay may mắn sẽ được tạo với các ô số tương ứng từ <strong>1 đến {totalStudents}</strong>.
            </p>
          </div>

          {/* Cài đặt không gọi lại */}
          <div className="p-3.5 sm:p-4 rounded-[var(--radius-md)] bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] space-y-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-neutral-800)] select-none">
              <input
                type="checkbox"
                checked={excludeCalled}
                onChange={e => setExcludeCalled(e.target.checked)}
                className="w-4 h-4 rounded-[var(--radius-xs)] text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] border-[var(--color-neutral-300)] cursor-pointer"
              />
              <span>Không gọi lại học sinh đã trả bài trong buổi</span>
            </label>
            <p className="text-[11px] text-[var(--color-neutral-500)] pl-6.5">
              Học sinh đã được quay trúng sẽ được loại ra khỏi vòng quay ở các lượt tiếp theo.
            </p>
          </div>

          {/* Nút sang bước 2 */}
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="w-full py-3 rounded-[var(--radius-md)] font-bold text-sm bg-[var(--color-primary-500)] hover:bg-[#023ec0] text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
          >
            <span>Tiếp tục: Chọn câu hỏi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          BƯỚC 2: CHỌN CÂU HỎI TRẢ BÀI
      ══════════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="space-y-5 sm:space-y-6 animate-fadeIn">
          {/* Badge tóm tắt bước 1 */}
          <div className="flex items-center justify-between text-xs px-4 py-2.5 bg-[var(--color-neutral-50)] rounded-[var(--radius-md)] border border-[var(--color-neutral-200)]">
            <div className="flex items-center gap-2 text-[var(--color-neutral-600)]">
              <Users className="w-4 h-4 text-[var(--color-primary-500)]" />
              <span>Sĩ số lớp: <strong className="text-[var(--color-neutral-900)] font-mono">{totalStudents} học sinh</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-[var(--color-primary-500)] hover:underline font-bold text-[11px] cursor-pointer"
            >
              Đổi sĩ số
            </button>
          </div>

          {/* 1. Hình thức kiểm tra (Radio) */}
          <div className="space-y-2.5 pt-1 sm:pt-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-neutral-700)]">
              Hình thức kiểm tra
            </label>
            <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-0.5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-semibold text-[var(--color-neutral-800)] select-none">
                <input
                  type="radio"
                  name="quizMode"
                  value="lesson"
                  checked={mode === 'lesson'}
                  onChange={() => setMode('lesson')}
                  className="w-4 h-4 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] border-[var(--color-neutral-300)] cursor-pointer"
                />
                <span>Kiểm tra theo bài</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-semibold text-[var(--color-neutral-800)] select-none">
                <input
                  type="radio"
                  name="quizMode"
                  value="chapter"
                  checked={mode === 'chapter'}
                  onChange={() => setMode('chapter')}
                  className="w-4 h-4 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] border-[var(--color-neutral-300)] cursor-pointer"
                />
                <span>Kiểm tra theo chương</span>
              </label>
            </div>
          </div>

          {/* 2. Nội dung kiểm tra (2 selects cạnh nhau) */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-neutral-700)]">
              Nội dung kiểm tra
            </label>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-end">
              {/* Select 1: Khối lớp */}
              <div className="w-full sm:w-36 shrink-0">
                <div className="relative">
                  <select
                    value={selectedGrade}
                    onChange={e => {
                      setSelectedGrade(e.target.value)
                      setCustomQuestions([])
                    }}
                    className="w-full h-11 appearance-none rounded-[var(--radius-md)] border border-[var(--color-neutral-200)] bg-white pl-3.5 pr-8 text-xs sm:text-sm font-medium text-[var(--color-neutral-900)] hover:border-[var(--color-neutral-300)] focus:border-[var(--color-primary-500)] focus:outline-none cursor-pointer"
                  >
                    {gradeOptions.map(g => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[var(--color-neutral-500)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Select 2: Bài học HOẶC Chương */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  {mode === 'lesson' ? (
                    /* Select Bài học trực tiếp */
                    <select
                      value={selectedLessonId}
                      onChange={e => {
                        setSelectedLessonId(e.target.value)
                        setCustomQuestions([])
                      }}
                      disabled={isLoadingCurriculum}
                      className="w-full h-11 appearance-none rounded-[var(--radius-md)] border border-[var(--color-neutral-200)] bg-white pl-3.5 pr-8 text-xs sm:text-sm font-medium text-[var(--color-neutral-900)] hover:border-[var(--color-neutral-300)] focus:border-[var(--color-primary-500)] focus:outline-none cursor-pointer disabled:bg-[var(--color-neutral-50)] truncate"
                    >
                      {isLoadingCurriculum ? (
                        <option value="">Đang tải danh sách bài học...</option>
                      ) : allLessonsOfGrade.length === 0 ? (
                        <option value="">Không có bài học nào trong khối này</option>
                      ) : (
                        allLessonsOfGrade.map(les => (
                          <option key={les.id} value={les.id}>
                            {les.order ? `Bài ${les.order}: ` : ''}{les.title}
                          </option>
                        ))
                      )}
                    </select>
                  ) : (
                    /* Select Chương trực tiếp */
                    <select
                      value={selectedChapterId}
                      onChange={e => {
                        setSelectedChapterId(e.target.value)
                        setCustomQuestions([])
                      }}
                      disabled={isLoadingCurriculum}
                      className="w-full h-11 appearance-none rounded-[var(--radius-md)] border border-[var(--color-neutral-200)] bg-white pl-3.5 pr-8 text-xs sm:text-sm font-medium text-[var(--color-neutral-900)] hover:border-[var(--color-neutral-300)] focus:border-[var(--color-primary-500)] focus:outline-none cursor-pointer disabled:bg-[var(--color-neutral-50)] truncate"
                    >
                      {isLoadingCurriculum ? (
                        <option value="">Đang tải danh sách chương...</option>
                      ) : allChaptersOfGrade.length === 0 ? (
                        <option value="">Không có chương nào trong khối này</option>
                      ) : (
                        allChaptersOfGrade.map(ch => (
                          <option key={ch.id} value={ch.id}>
                            {ch.title} ({ch.lessonCount} bài)
                          </option>
                        ))
                      )}
                    </select>
                  )}
                  <ChevronDown className="w-4 h-4 text-[var(--color-neutral-500)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {mode === 'chapter' && (
              <p className="text-[11px] text-[var(--color-neutral-500)] pt-1">
                Hệ thống tự động gộp tất cả câu hỏi của các bài trong chương đã chọn.
              </p>
            )}
          </div>

          {/* 3. Ngân hàng câu hỏi status */}
          <div className="space-y-3 pt-4 border-t border-[var(--color-neutral-200)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-neutral-700)]">
                Ngân hàng câu hỏi
              </span>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(true)}
                className="text-xs font-bold text-[var(--color-primary-500)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm câu hỏi
              </button>
            </div>

            {isLoadingQuestions ? (
              <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)] text-xs text-center">
                Đang tải câu hỏi...
              </div>
            ) : effectiveQuestions.length === 0 ? (
              <div className="p-4 rounded-[var(--radius-md)] bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Chưa có câu hỏi trong ngân hàng dữ liệu cho mục này.</p>
                  <p className="text-[11px] text-amber-700">
                    Bấm <strong>"Thêm câu hỏi"</strong> để tự nhập câu hỏi, hoặc chọn mục khác.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-[var(--radius-md)] bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Sẵn sàng <strong>{effectiveQuestions.length} câu hỏi</strong> cho phiên trả bài.
                  </span>
                </div>
                {customQuestions.length > 0 && (
                  <span className="font-bold text-emerald-700">({customQuestions.length} tự thêm)</span>
                )}
              </div>
            )}
          </div>

          {/* Action buttons: Quay lại & Bắt đầu */}
          <div className="flex items-center gap-3.5 pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-3.5 rounded-[var(--radius-md)] font-bold text-xs sm:text-sm border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>

            <button
              type="button"
              onClick={handleStart}
              disabled={effectiveQuestions.length === 0}
              className={`flex-1 py-3.5 rounded-[var(--radius-md)] font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${effectiveQuestions.length === 0
                ? 'bg-[var(--color-neutral-200)] text-[var(--color-neutral-500)] cursor-not-allowed'
                : 'bg-[var(--color-primary-500)] hover:bg-[#023ec0] text-white shadow-xs active:scale-[0.98]'
                }`}
            >
              <Play className="w-4 h-4 fill-current" />
              BẮT ĐẦU TRẢ BÀI
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL THÊM CÂU HỎI ── */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-neutral-200)] p-6 w-full max-w-md shadow-lg space-y-4">
            <h3 className="font-header font-bold text-lg uppercase text-[var(--color-neutral-900)]">
              Thêm câu hỏi trắc nghiệm
            </h3>
            <textarea
              placeholder="Nội dung câu hỏi..."
              value={newQuestionText}
              onChange={e => setNewQuestionText(e.target.value)}
              rows={3}
              className="w-full p-2.5 rounded-[var(--radius-sm)] border border-[var(--color-neutral-200)] text-xs focus:outline-none focus:border-[var(--color-primary-500)]"
            />
            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Phương án A"
                value={newOpt1}
                onChange={e => setNewOpt1(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-neutral-200)] text-xs"
              />
              <input
                type="text"
                placeholder="Phương án B"
                value={newOpt2}
                onChange={e => setNewOpt2(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-neutral-200)] text-xs"
              />
              <input
                type="text"
                placeholder="Phương án C"
                value={newOpt3}
                onChange={e => setNewOpt3(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-neutral-200)] text-xs"
              />
              <input
                type="text"
                placeholder="Phương án D"
                value={newOpt4}
                onChange={e => setNewOpt4(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-neutral-200)] text-xs"
              />
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-[var(--color-neutral-700)]">
              <span>Đáp án đúng:</span>
              <div className="relative">
                <select
                  value={newCorrect}
                  onChange={e => setNewCorrect(Number(e.target.value))}
                  className="appearance-none pl-3 pr-7 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-neutral-200)] text-xs cursor-pointer outline-none focus:border-[var(--color-primary-500)]"
                >
                  <option value={1}>A</option>
                  <option value={2}>B</option>
                  <option value={3}>C</option>
                  <option value={4}>D</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--color-neutral-500)] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddCustomQuestion}
                className="px-3.5 py-1.5 rounded-[var(--radius-md)] text-xs font-bold bg-[var(--color-primary-500)] text-white hover:bg-[#023ec0] cursor-pointer"
              >
                Lưu câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
