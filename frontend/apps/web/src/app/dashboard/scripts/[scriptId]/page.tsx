'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { DashboardAside } from '@/features/course/components/DashboardAside'
import TimelineEditor from '@/features/playground/components/TimelineEditor'
import { useMyCourses, useScriptDetail, useCourseDetail, useScriptNodes, useUpdateScriptMutation } from '@/features/course/queries/courseQueries'
import type { TimelineStep } from '@/lib/services/pipelineService'
import { toast } from '@/components/ui/toast'
import type { ScriptNodeResponseDTO } from '@edore/types'

function mapNodeDtoToTimelineStep(node: ScriptNodeResponseDTO, index: number): TimelineStep {
  const settings = node.settings || {}

  // 1. Overall Node Content
  const rawNodeContent = settings.node_content ?? settings.original_content ?? settings.knowledge_summary ?? ''
  const originalContent = Array.isArray(rawNodeContent)
    ? rawNodeContent.map(String).join('\n\n')
    : String(rawNodeContent)

  // 2. Execution Steps (Details): Priority: execution_steps -> activityStepTemplate -> details
  let detailsArr: string[] = []
  if (Array.isArray(settings.execution_steps) && settings.execution_steps.length > 0) {
    detailsArr = settings.execution_steps.map(String)
  } else if (Array.isArray(node.activityStepTemplate) && node.activityStepTemplate.length > 0) {
    detailsArr = node.activityStepTemplate.map(String)
  } else if (Array.isArray(settings.details)) {
    detailsArr = settings.details.map(String)
  } else if (typeof settings.details === 'string') {
    detailsArr = [settings.details]
  }

  // 3. Duration
  const estMin = settings.estimated_time_minutes ?? settings.duration
  const durationLabel = estMin ? `${estMin}'` : "10'"

  // 4. Pedagog Note / Materials Needed
  const pedagogNote = settings.materials_needed ?? node.activityMaterials ?? settings.instructor_note ?? settings.pedagog_note ?? ''

  return {
    time: `Phần ${node.orderIndex != null ? node.orderIndex + 1 : index + 1}`,
    title: (settings.title as string) || (settings.node_title as string) || node.nodeTypeName || `Phần ${index + 1}`,
    duration: durationLabel,
    type: node.nodeTypeName || node.nodeTypeCode || 'Hoạt động',
    intent: (settings.node_intent as string) || (settings.intent as string) || '',
    details: detailsArr,
    activityStepRoles: node.activityStepRoles ?? (settings.activity_step_roles as string[] | undefined),
    nodeTypeCode: node.nodeTypeCode,
    originalContent,
    pedagogNote: Array.isArray(pedagogNote) ? pedagogNote.join(', ') : String(pedagogNote),
    warningContext: (settings.warning_context as string) || '',
    appliedActivity: node.activityTitle || (settings.applied_activity as string) || node.appliedActivityCode || '',
    nodePayload: settings.node_payload ?? settings.nodePayload ?? null,
    _raw: node as unknown as Record<string, unknown>,
  }
}


export default function ScriptEditPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const scriptId = (params.scriptId as string) || ''
  const courseIdParam = searchParams.get('courseId') || searchParams.get('course') || ''

  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([])
  const [contentSummary, setContentSummary] = useState('')
  const [scriptTitle, setScriptTitle] = useState('')
  const [courseId, setCourseId] = useState<string | null>(courseIdParam || null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Query real script detail & nodes from API
  const { data: realScript, isError: isErrorScript } = useScriptDetail(scriptId !== 'demo' ? scriptId : '')
  const { data: realNodes, isError: isErrorNodes } = useScriptNodes(scriptId !== 'demo' ? scriptId : '')

  // Query user's courses for Aside sidebar & breadcrumb matching
  const { data: coursePage } = useMyCourses({
    include: 'scripts',
    pageNumber: 0,
    pageSize: 20,
  })

  // Query real course detail from API
  const effectiveCourseId = courseIdParam || realScript?.courseId || courseId || ''
  const { data: realCourse } = useCourseDetail(effectiveCourseId)

  // Handle errors via Toast
  useEffect(() => {
    if (isErrorScript) {
      toast.error('Không thể tải thông tin kịch bản từ máy chủ.')
    }
    if (isErrorNodes) {
      toast.error('Không thể tải danh sách nội dung bài giảng từ máy chủ.')
    }
  }, [isErrorScript, isErrorNodes])

  // Sync real API script data when available
  useEffect(() => {
    if (realScript) {
      if (realScript.title) setScriptTitle(realScript.title)
      if (realScript.courseId) setCourseId(realScript.courseId)
    }
  }, [realScript])

  // Sync real script nodes when loaded
  useEffect(() => {
    if (realNodes && realNodes.length > 0) {
      const steps = realNodes.map((node, i) => mapNodeDtoToTimelineStep(node, i))
      setTimelineSteps(steps)
      setIsLoaded(true)
      toast.success(`Đã tải thành công ${realNodes.length} phần bài giảng.`)
    } else if (realNodes && realNodes.length === 0) {
      setTimelineSteps([])
      setIsLoaded(true)
      toast.info('Kịch bản chưa có nội dung bài giảng.')
    }
  }, [realNodes])

  // Remove fallback from localStorage - pure API mode
  useEffect(() => {
    if (!scriptId || scriptId === 'demo') {
      setIsLoaded(true)
    }
  }, [scriptId])

  const updateScriptMutation = useUpdateScriptMutation(effectiveCourseId)

  const handleStepsChange = (newSteps: TimelineStep[]) => {
    setTimelineSteps(newSteps)
    toast.success('Đã cập nhật tiến trình kịch bản!')
  }

  const handleRestart = () => {
    const activeCourseId = courseIdParam || courseId
    const url = activeCourseId ? `/dashboard/scripts/new?courseId=${activeCourseId}` : '/dashboard/scripts/new'
    router.push(url)
  }

  // Derive course title dynamically for breadcrumbs:
  const matchedCourse = coursePage?.content.find(c => c.id === effectiveCourseId)
  const courseTitle = realCourse?.title || realScript?.courseTitle || matchedCourse?.title || (effectiveCourseId ? 'Khóa học' : 'Khóa học của tôi')

  return (
    <AuthGuard>
      <div className="w-full bg-[var(--color-primary-500)] min-h-screen py-4 md:py-6 px-2.5 sm:px-4 md:px-6 font-body">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-stretch gap-4 md:gap-6 min-h-[580px]">
          {/* Aside Navigation with real backend courses */}
          <DashboardAside
            activeTab="scripts"
            onTabChange={() => router.push('/dashboard')}
            selectedCategoryId={null}
            onSelectCategory={() => {}}
            courses={coursePage?.content || []}
            selectedCourseId={effectiveCourseId}
          />

          {/* Main Content Area: Timeline Editor */}
          <main className="flex-1 min-w-0 w-full bg-white border border-white/20 shadow-2xl rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 flex flex-col self-stretch min-h-[580px]">
            {isLoaded ? (
              <TimelineEditor
                steps={timelineSteps}
                onStepsChange={handleStepsChange}
                contentSummary={contentSummary}
                onRestart={handleRestart}
                courseId={effectiveCourseId || undefined}
                courseTitle={courseTitle}
                scriptTitle={scriptTitle}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="w-5 h-5 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold font-body">Đang tải kịch bản...</span>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
