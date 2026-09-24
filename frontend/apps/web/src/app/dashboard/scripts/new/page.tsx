'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { DashboardAside } from '@/features/course/components/DashboardAside'
import ContentInput from '@/features/playground/components/ContentInput'
import ProcessingLoader from '@/features/playground/components/ProcessingLoader'
import ClassroomConfigModal from '@/features/playground/components/ClassroomConfigModal'
import FileStartModal from '@/features/playground/components/FileStartModal'
import { useStageTransition } from '@/lib/hooks/useStageTransition'
import { useMyCourses, useGenerateScriptWithAiMutation } from '@/features/course/queries/courseQueries'
import type { ClassroomCtx } from '@/features/playground/components/ClassroomConfigModal'
import { toast } from '@/components/ui/toast'

const DEFAULT_CTX: ClassroomCtx = {
  duration: 45,
  studentCount: '11-30',
  template_id: 'standard-3-node',
  learning_outcome: '',
}

export default function NewScriptPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseIdParam = searchParams.get('courseId') || searchParams.get('course') || ''

  // ── Queries & Mutations ────────────────────────────────────────────────────────
  const { data: coursePage } = useMyCourses({
    include: 'scripts',
    pageNumber: 0,
    pageSize: 20,
  })

  const generateAiMutation = useGenerateScriptWithAiMutation()

  // ── Stage machine (input → processing) ───────────────────────────────────────
  const { visibleStage: stage, isExiting, goTo: setStage } = useStageTransition('input')

  // ── Context ───────────────────────────────────────────────────────────────────
  const [classroomCtx, setClassroomCtx] = useState<ClassroomCtx>(() => DEFAULT_CTX)

  // ── Upload / input ────────────────────────────────────────────────────────────
  const [inputFile, setInputFile] = useState<File | null>(null)
  const [inputText, setInputText] = useState('')
  const fileName = inputFile?.name ?? (inputText ? 'Manual_Input.txt' : '')

  // ── SSE pipeline state ────────────────────────────────────────────────────────
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // ── Pending file (waiting for FileStartModal) ─────────────────────────────────
  const [pendingFile, setPendingFile] = useState<{ file: Blob; isText: boolean; text?: string } | null>(null)

  // ── Modal state ────────────────────────────────────────────────────────────────
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  const handleViewDemo = useCallback(() => {
    router.push('/dashboard/scripts/demo')
  }, [router])

  const handleConfigChange = (ctx: ClassroomCtx) => {
    setClassroomCtx(ctx)
  }

  const resetPipelineState = () => {
    setHasError(false)
    setErrorMessage('')
  }

  const handleFileSelected = (file: File) => {
    const MAX_SIZE = 150 * 1024
    if (file.size > MAX_SIZE) {
      toast.error('Kích thước file vượt quá giới hạn cho phép (tối đa 150KB).')
      return
    }
    setInputFile(file)
    setPendingFile({ file, isText: false })
  }

  const handleFileStartConfirm = (updatedCtx: ClassroomCtx) => {
    if (!pendingFile) return
    const { file, isText, text } = pendingFile
    setPendingFile(null)
    handleConfigChange(updatedCtx)

    if (!courseIdParam) {
      toast.error('Vui lòng chọn khóa học trước khi sinh kịch bản AI.')
      return
    }

    setStage('processing')
    resetPipelineState()

    const fd = new FormData()
    const fileBlob = isText ? new Blob([text || ''], { type: 'text/plain' }) : file
    const uploadFileName = isText ? 'manual_input.txt' : (file as File).name || 'input.txt'
    fd.append('file', fileBlob, uploadFileName)
    fd.append('templateId', updatedCtx.template_id === 'standard-4-node' ? '2' : '1')
    fd.append('courseId', courseIdParam)
    if (updatedCtx.learning_outcome) {
      fd.append('learningOutcome', updatedCtx.learning_outcome)
    }

    toast.info('Đang gửi dữ liệu tới AI server để sinh kịch bản...')

    generateAiMutation.mutate(fd, {
      onSuccess: (data) => {
        const scriptId = data?.scriptId || data?.id
        if (scriptId) {
          toast.success('Sinh và lưu kịch bản AI thành công!')
          router.push(`/dashboard/scripts/${scriptId}?courseId=${courseIdParam}`)
        } else {
          toast.success('Kịch bản đã được khởi tạo!')
          router.push(`/dashboard?courseId=${courseIdParam}`)
        }
      },
      onError: (err: any) => {
        setHasError(true)
        const msg = err?.message || 'Có lỗi xảy ra trong quá trình sinh kịch bản AI.'
        setErrorMessage(msg)
        toast.error(msg)
      },
    })
  }

  const handleFileStartCancel = () => {
    setPendingFile(null)
    setInputFile(null)
    setInputText('')
  }

  const handleCancel = () => {
    setStage('input')
    resetPipelineState()
  }

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
          />

          {/* Main Content Area: Upload file & processing */}
          <main className="flex-1 min-w-0 w-full bg-white border border-white/20 shadow-2xl rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 flex flex-col self-stretch min-h-[580px]">
            <div key={stage} className={`flex-1 ${isExiting ? 'stage-exit' : 'stage-enter'}`}>
              {stage === 'input' && (
                <ContentInput
                  onFileSelected={handleFileSelected}
                  classroomCtx={classroomCtx}
                  onConfigChange={handleConfigChange}
                  onOpenConfig={() => setIsConfigOpen(true)}
                  onViewDemo={handleViewDemo}
                />
              )}

              {stage === 'processing' && (
                <ProcessingLoader
                  hasError={hasError}
                  errorMessage={errorMessage}
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

        {pendingFile && (
          <FileStartModal
            fileName={pendingFile.isText ? 'Nội dung nhập thủ công' : (pendingFile.file as File)?.name || ''}
            ctx={classroomCtx}
            onConfirm={handleFileStartConfirm}
            onCancel={handleFileStartCancel}
          />
        )}
      </div>
    </AuthGuard>
  )
}
