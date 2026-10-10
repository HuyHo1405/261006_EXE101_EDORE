'use client'

import React, { useState, useRef, useCallback, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { DashboardAside } from '@/features/course/components/DashboardAside'
import ProcessingLoader from '@/features/playground/components/ProcessingLoader'
import ClassroomConfigModal from '@/features/playground/components/ClassroomConfigModal'
import { LessonGrid } from '@/features/course/components/LessonGrid'
import { LessonToolbar } from '@/features/course/components/LessonToolbar'
import { LessonStartModal } from '@/features/course/components/LessonStartModal'
import { useStageTransition } from '@/lib/hooks/useStageTransition'
import {
  useMyCourses,
  useLessons,
  useGenerateScriptWithAiMutation,
} from '@/features/course/queries/courseQueries'
import { courseService } from '@/features/course/api/courseService'
import type { ClassroomCtx } from '@/features/playground/components/ClassroomConfigModal'
import type { LessonSummaryDTO } from '@edore/types'
import { toast } from '@/components/ui/toast'
import { ArrowLeft, Users, Sparkles, BookOpen, ChevronRight } from 'lucide-react'

const DEFAULT_CTX: ClassroomCtx = {
  duration: 45,
  studentCount: '11-30',
  template_id: 'standard-3-node',
  learning_outcome: '',
}

function NewScriptContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseIdParam = searchParams.get('courseId') || searchParams.get('course') || ''

  // ── Queries & Mutations ────────────────────────────────────────────────────────
  const { data: coursePage } = useMyCourses({
    include: 'scripts',
    pageNumber: 0,
    pageSize: 20,
  })

  const currentCourse = useMemo(() => {
    return coursePage?.content?.find((c) => c?.id === courseIdParam)
  }, [coursePage?.content, courseIdParam])

  const generateAiMutation = useGenerateScriptWithAiMutation()

  // ── Stage machine (input → processing) ───────────────────────────────────────
  const { visibleStage: stage, isExiting, goTo: setStage } = useStageTransition('input')

  // ── Context ───────────────────────────────────────────────────────────────────
  const [classroomCtx, setClassroomCtx] = useState<ClassroomCtx>(() => DEFAULT_CTX)

  // ── Search & Filter State for Lessons ──────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedTextbook, setSelectedTextbook] = useState('')
  const [sortBy, setSortBy] = useState('orderInChapter')
  const [pageNumber, setPageNumber] = useState(0)

  // ── Fetch Lessons via React Query ──────────────────────────────────────────────
  const { data: lessonPage, isLoading: isLoadingLessons } = useLessons({
    keyword: searchTerm.trim() || undefined,
    gradeCode: selectedGrade || undefined,
    textbookCode: selectedTextbook || undefined,
    sortBy: sortBy,
    sortDirection: 'ASC',
    page: pageNumber,
    size: 8,
  })

  // ── Pipeline & Polling state ──────────────────────────────────────────────────
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [progress, setProgress] = useState(0)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // ── Selected lesson waiting for LessonStartModal ──────────────────────────────
  const [selectedLesson, setSelectedLesson] = useState<LessonSummaryDTO | null>(null)

  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleConfigChange = (ctx: ClassroomCtx) => {
    setClassroomCtx(ctx)
  }

  const resetPipelineState = () => {
    setHasError(false)
    setErrorMessage('')
    setProgress(0)
    if (pollingRef.current) clearInterval(pollingRef.current)
  }

  const handleSelectLesson = (lesson: LessonSummaryDTO) => {
    setSelectedLesson(lesson)
  }

  const handleLessonConfirm = ({
    templateId,
    scriptTitle,
    learningOutcome,
    updatedCtx,
  }: {
    templateId: string
    scriptTitle: string
    learningOutcome: string
    updatedCtx: ClassroomCtx
  }) => {
    if (!selectedLesson) return
    const lesson = selectedLesson
    setSelectedLesson(null)
    handleConfigChange(updatedCtx)

    if (!courseIdParam) {
      toast.error('Vui lòng chọn khóa học trước khi sinh kịch bản AI.')
      return
    }

    setStage('processing')
    resetPipelineState()

    toast.info(`Đang gửi yêu cầu sinh kịch bản cho bài "${lesson.title}"...`)

    generateAiMutation.mutate(
      {
        lessonId: lesson.id,
        courseId: courseIdParam,
        templateId: templateId === 'extended-4-node' || templateId === '2' ? 2 : 1,
        scriptTitle: scriptTitle || lesson.title,
        learningOutcome: learningOutcome || undefined,
      },
      {
        onSuccess: (data: any) => {
          const jobId = data?.jobId
          const scriptId = data?.scriptId || data?.id

          if (jobId) {
            toast.success('Đã tiếp nhận yêu cầu, đang xử lý ngầm...')

            if (pollingRef.current) clearInterval(pollingRef.current)
            pollingRef.current = setInterval(async () => {
              try {
                const statusData = await courseService.getAiJobStatus(jobId)

                if (statusData.status === 'COMPLETED') {
                  clearInterval(pollingRef.current!)
                  setProgress(100)
                  toast.success('Sinh kịch bản AI thành công!')
                  const finalScriptId =
                    statusData.scriptId || statusData.result?.scriptId || statusData.result?.id
                  if (finalScriptId) {
                    router.push(`/dashboard/scripts/${finalScriptId}?courseId=${courseIdParam}`)
                  } else {
                    router.push(`/dashboard?courseId=${courseIdParam}`)
                  }
                } else if (statusData.status === 'FAILED') {
                  clearInterval(pollingRef.current!)
                  setHasError(true)
                  const msg = statusData.errorMessage || 'AI gặp lỗi trong quá trình sinh kịch bản.'
                  setErrorMessage(msg)
                  toast.error(msg)
                } else {
                  setProgress(statusData.progress || 0)
                }
              } catch (err) {
                console.warn('Lỗi khi kiểm tra tiến độ:', err)
              }
            }, 3000)
          } else if (scriptId) {
            toast.success('Sinh và lưu kịch bản AI thành công!')
            router.push(`/dashboard/scripts/${scriptId}?courseId=${courseIdParam}`)
          } else {
            toast.success('Kịch bản đã được khởi tạo!')
            router.push(`/dashboard?courseId=${courseIdParam}`)
          }
        },
        onError: (err: any) => {
          setHasError(true)
          const msg = err?.message || 'Có lỗi xảy ra trong quá trình khởi tạo kịch bản AI.'
          setErrorMessage(msg)
          toast.error(msg)
        },
      }
    )
  }

  const handleCancel = () => {
    setStage('input')
    resetPipelineState()
  }

  const totalLessons = lessonPage?.totalElements || 0
  const totalPages = lessonPage?.totalPages || 1

  return (
    <AuthGuard>
      <div className="w-full bg-[var(--color-primary-500)] min-h-screen py-4 md:py-6 px-2.5 sm:px-4 md:px-6 font-body">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-stretch gap-4 md:gap-6 min-h-[580px]">
          {/* Aside Navigation */}
          <DashboardAside
            activeTab="scripts"
            onTabChange={() => router.push('/dashboard')}
            selectedCategoryId={null}
            onSelectCategory={() => {}}
            courses={coursePage?.content || []}
            selectedCourseId={courseIdParam || null}
            isDrawerOnly={true}
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
          />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 w-full bg-white border border-white/20 shadow-2xl rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col justify-between self-stretch min-h-[580px]">
            <div key={stage} className={`flex-1 flex flex-col h-full ${isExiting ? 'stage-exit' : 'stage-enter'}`}>
              {stage === 'input' && (
                <div className="flex flex-col h-full space-y-6">
                  {/* 1. TOP HEADER & BREADCRUMBS */}
                  <div className="w-full font-sans space-y-3">
                    {/* Breadcrumbs */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <button
                          type="button"
                          onClick={() => router.push(courseIdParam ? `/dashboard?courseId=${courseIdParam}` : '/dashboard')}
                          className="hover:text-[var(--color-primary-600)] transition-colors cursor-pointer"
                        >
                          Khóa học
                        </button>
                        {currentCourse && (
                          <>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-slate-700 font-bold max-w-[200px] truncate" title={currentCourse.title}>
                              {currentCourse.title}
                            </span>
                          </>
                        )}
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[var(--color-primary-600)] font-bold">Tạo kịch bản mới</span>
                      </div>
                    </div>

                    {/* Main Title Stack */}
                    <div className="flex items-stretch gap-3.5 pt-1">
                      <div className="w-1.5 rounded-full shrink-0 self-stretch my-0.5 bg-[var(--color-primary-500)]" />
                      <div className="flex-1 min-w-0 space-y-1">
                        <h1 className="font-header font-bold text-2xl sm:text-3xl uppercase tracking-tight text-slate-900 leading-tight">
                          Thư viện bài học nội bộ ({totalLessons})
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 font-body leading-relaxed">
                          Chọn bài học từ chương trình chuẩn để AI phân tích cấu trúc, ngữ liệu và hình ảnh nhằm tự động soạn kịch bản.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. ACTION ROW (BACK BUTTON & CLASSROOM CONFIG) */}
                  <div className="flex items-center justify-between gap-4 pb-0.5 pt-0">
                    <div>
                      <button
                        type="button"
                        onClick={() => router.push(courseIdParam ? `/dashboard?courseId=${courseIdParam}` : '/dashboard')}
                        className="group inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-all duration-200 cursor-pointer py-1"
                      >
                        <ArrowLeft className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-1" />
                        <span className="font-body whitespace-nowrap group-hover:underline">Quay lại khóa học</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsConfigOpen(true)}
                      className="group inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-all duration-200 cursor-pointer py-1"
                    >
                      <Users className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                      <span className="font-body whitespace-nowrap group-hover:underline">Cấu hình lớp học</span>
                    </button>
                  </div>

                  {/* 3. GRAY CONTAINER (TOOLBAR & 8-SLOT MATRIX GRID) */}
                  <div className="bg-[var(--color-neutral-200)] border border-[var(--color-neutral-300)] p-5 sm:p-6 md:p-7 rounded-2xl md:rounded-3xl shadow-sm flex flex-col flex-1 justify-between space-y-6">
                    {/* Toolbar */}
                    <LessonToolbar
                      searchTerm={searchTerm}
                      onSearchChange={(val) => {
                        setSearchTerm(val)
                        setPageNumber(0)
                      }}
                      selectedGrade={selectedGrade}
                      onSelectGrade={(grade) => {
                        setSelectedGrade(grade)
                        setPageNumber(0)
                      }}
                      selectedTextbook={selectedTextbook}
                      onSelectTextbook={(tb) => {
                        setSelectedTextbook(tb)
                        setPageNumber(0)
                      }}
                      sortBy={sortBy}
                      onSortByChange={(s) => setSortBy(s)}
                    />

                    {/* Matrix Grid */}
                    <div className="flex-1">
                      <LessonGrid
                        lessons={lessonPage?.content || []}
                        isLoading={isLoadingLessons}
                        onSelectLesson={handleSelectLesson}
                        pageNumber={pageNumber}
                        totalPages={totalPages}
                        onPageChange={setPageNumber}
                      />
                    </div>
                  </div>
                </div>
              )}

              {stage === 'processing' && (
                <ProcessingLoader
                  hasError={hasError}
                  errorMessage={errorMessage}
                  progress={progress}
                  onCancel={handleCancel}
                />
              )}
            </div>
          </main>
        </div>

        {/* Modals */}
        {isConfigOpen && (
          <ClassroomConfigModal
            ctx={classroomCtx}
            onChange={handleConfigChange}
            onClose={() => setIsConfigOpen(false)}
          />
        )}

        {selectedLesson && (
          <LessonStartModal
            lesson={selectedLesson}
            ctx={classroomCtx}
            onConfirm={handleLessonConfirm}
            onCancel={() => setSelectedLesson(null)}
          />
        )}
      </div>
    </AuthGuard>
  )
}

export default function NewScriptPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-[var(--color-primary-500)] min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <NewScriptContent />
    </Suspense>
  )
}
