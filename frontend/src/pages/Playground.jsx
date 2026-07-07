import { useState, useRef, useEffect, useCallback } from 'react'
import Container from '../components/Container'
import ContentInput from '../features/playground/ContentInput'
import ProcessingLoader from '../features/playground/ProcessingLoader'
import TimelineEditor from '../features/playground/TimelineEditor'
import ClassroomConfigModal from '../features/playground/ClassroomConfigModal'
import FileStartModal from '../features/playground/FileStartModal'
import { streamPipeline, mapNodeToTimelineStep } from '../services/pipelineService'
import { useStageTransition } from '../hooks/useStageTransition'

const DEFAULT_CTX = {
  duration: 45,
  studentCount: '11-30',
  template_id: 'standard-3-node',
  learning_outcome: ''
}

/**
 * Playground
 *
 * Workflow stages:
 *   input → processing → results
 *
 * State owned here; features are pure UI components.
 */
export default function Playground({ isMockup = false, mockScript = null, forcedStage = undefined, onPipelineDone = null }) {
  // ── Stage machine (with fade transition) ───────────────────────────────────
  const { visibleStage: stage, isExiting, goTo: setStage } = useStageTransition(forcedStage || 'input')

  // ── Context (Classroom Context from localStorage or default) ──────────────
  const [classroomCtx, setClassroomCtx] = useState(() => {
    try {
      const saved = localStorage.getItem('edore_classroom_ctx')
      return saved ? JSON.parse(saved) : DEFAULT_CTX
    } catch (e) {
      return DEFAULT_CTX
    }
  })

  // ── Upload / input ─────────────────────────────────────────────────────────
  const [inputFile, setInputFile] = useState(null)   // File | null
  const [inputText, setInputText] = useState('')     // manual text
  const fileName = inputFile?.name ?? (inputText ? 'Manual_Input.txt' : '')

  // ── SSE pipeline state ────────────────────────────────────────────────────
  const [progressEvents, setProgressEvents] = useState([])
  const [metadata, setMetadata] = useState(null)
  const [contentSummary, setContentSummary] = useState('')
  const [sectionsDone, setSectionsDone] = useState(0)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const abortRef = useRef(null)

  // ── Pending file (waiting for FileStartModal confirmation) ────────────────
  const [pendingFile, setPendingFile] = useState(null)  // { file, isText, text }

  // ── Results ────────────────────────────────────────────────────────────────
  const [timelineSteps, setTimelineSteps] = useState(() => {
    if (isMockup && forcedStage === 'results' && mockScript) {
      return mockScript.steps || []
    }
    return []
  })
  const [activeScriptId, setActiveScriptId] = useState(null)

  // ── Load editing script from Library on mount ─────────────────────────────
  useEffect(() => {
    const editingScriptRaw = localStorage.getItem('edore_active_editing_script')
    if (editingScriptRaw) {
      try {
        const editingScript = JSON.parse(editingScriptRaw)
        if (editingScript && editingScript.steps) {
          setTimelineSteps(editingScript.steps)
          setContentSummary(editingScript.summary || '')
          setActiveScriptId(editingScript.id)
          if (editingScript.classroomCtx) {
            setClassroomCtx(editingScript.classroomCtx)
          }
          setStage('results')
        }
      } catch (e) {
        console.error('Error loading editing script', e)
      } finally {
        localStorage.removeItem('edore_active_editing_script')
      }
    }
  }, [setStage])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const resetPipelineState = () => {
    setProgressEvents([])
    setMetadata(null)
    setContentSummary('')
    setSectionsDone(0)
    setHasError(false)
    setErrorMessage('')
    setTimelineSteps([])
    setActiveScriptId(null)
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleConfigChange = (ctx) => {
    setClassroomCtx(ctx)
    localStorage.setItem('edore_classroom_ctx', JSON.stringify(ctx))
  }

  const handleStepsChange = (newSteps) => {
    setTimelineSteps(newSteps)
    if (activeScriptId) {
      try {
        const savedRaw = localStorage.getItem('edore_saved_scripts')
        if (savedRaw) {
          const list = JSON.parse(savedRaw)
          const updated = list.map((s) =>
            s.id === activeScriptId
              ? { ...s, steps: newSteps, nodesCount: newSteps.length }
              : s
          )
          localStorage.setItem('edore_saved_scripts', JSON.stringify(updated))
        }
      } catch (e) {
        console.error('Error updating edited script steps', e)
      }
    }
  }

  const startPipeline = useCallback((formData) => {
    resetPipelineState()
    setStage('processing')

    if (isMockup) {
      const timer = setTimeout(() => {
        const finalSteps = mockScript ? mockScript.steps : []
        setTimelineSteps(finalSteps)
        setStage('results')
        if (onPipelineDone) onPipelineDone()
      }, 1500)
      abortRef.current = () => {
        clearTimeout(timer)
        setStage('input')
      }
      return
    }

    let fakeTimer = null
    let canTransitionToResults = false
    let pendingSteps = null

    // Thiết lập fake delay 2 phút (120 giây) cho loader
    fakeTimer = setTimeout(() => {
      canTransitionToResults = true
      // Nếu đã có dữ liệu sườn từ metadata hoặc section, ta chuyển stage ngay
      if (pendingSteps) {
        setTimelineSteps(pendingSteps)
        setStage('results')
      }
    }, 120000) // 2 phút chờ ở loader

    const abort = streamPipeline(formData, {
      onProgress(data) {
        setProgressEvents((prev) => [...prev, data])
      },
      onContentSummary(data) {
        setContentSummary(data.summary)
      },
      onMetadata(data) {
        setMetadata(data)
        if (data?.sections && Array.isArray(data.sections)) {
          const skeletonSteps = data.sections.map((sectionName, i) => ({
            time: existingTimeForIndex(i, classroomCtx.template_id),
            title: sectionName,
            duration: "15'",
            type: sectionName,
            intent: '',
            details: [],
            originalContent: '',
            pedagogNote: '',
            isLoading: true,
          }))

          if (canTransitionToResults) {
            setTimelineSteps(skeletonSteps)
            setStage('results')
          } else {
            pendingSteps = skeletonSteps
          }
        }
      },
      onSection(data) {
        setSectionsDone((n) => n + 1)
        const step = mapNodeToTimelineStep(data.node, data.index)

        const updateFunc = (prev) => {
          const next = [...prev]
          while (next.length <= data.index) {
            next.push({ isLoading: true })
          }
          next[data.index] = { ...step, isLoading: false }
          return next
        }

        if (canTransitionToResults) {
          setTimelineSteps(updateFunc)
        } else {
          pendingSteps = updateFunc(pendingSteps || [])
        }
      },
      onNodeError(data) {
        console.warn('Node error:', data)
      },
      onDone(data) {
        if (data?.content_summary) {
          setContentSummary(data.content_summary)
        }

        const updateFunc = () => {
          if (
            data?.final_pedagogical_script &&
            Array.isArray(data.final_pedagogical_script) &&
            data.final_pedagogical_script.length > 0
          ) {
            return data.final_pedagogical_script.map((node, i) =>
              mapNodeToTimelineStep(node, i)
            )
          }
          return pendingSteps || []
        }

        const finalSteps = updateFunc()

        // Create script ID
        const newId = `script-${Date.now()}`
        setActiveScriptId(newId)

        // Auto-save script to library on done
        try {
          const savedRaw = localStorage.getItem('edore_saved_scripts')
          let list = savedRaw ? JSON.parse(savedRaw) : []
          const newScript = {
            id: newId,
            title: classroomCtx.learning_outcome || fileName || 'Kịch bản mới từ AI',
            subject: `Giáo án lớp ${classroomCtx.duration}p`,
            bloomLevel: 'Vận dụng',
            duration: `${classroomCtx.duration} phút`,
            nodesCount: finalSteps.length,
            createdAt: new Date().toISOString().split('T')[0],
            summary: data.content_summary || 'Kịch bản giảng dạy tự động được tối ưu bằng EDORE AI.',
            color: 'from-blue-500 to-indigo-600',
            favorite: false,
            steps: finalSteps,
            classroomCtx: classroomCtx
          }
          list = [newScript, ...list]
          localStorage.setItem('edore_saved_scripts', JSON.stringify(list))
        } catch (e) {
          console.error('Error saving new AI script', e)
        }

        if (canTransitionToResults) {
          setTimelineSteps(finalSteps)
          setStage('results')
        } else {
          pendingSteps = finalSteps
        }
      },
      onError(data) {
        clearTimeout(fakeTimer)
        setHasError(true)
        setErrorMessage(data?.message ?? 'Unknown error')
      },
      onComplete() {
        // Hoàn tất pipeline
      },
    })

    // Helper xác định timing cơ bản theo vị trí của node
    function existingTimeForIndex(index, templateId) {
      const times = templateId === 'extended-4-node'
        ? ['00:00', '00:10', '00:35', '01:05']
        : ['00:00', '00:10', '00:30']
      return times[index] || `Node ${index + 1}`
    }

    abortRef.current = () => {
      clearTimeout(fakeTimer)
      abort()
    }
  }, [classroomCtx.template_id, classroomCtx.duration, fileName])

  const handleFileSelected = (file) => {
    setInputFile(file)
    // Intercept: show FileStartModal before starting pipeline
    setPendingFile({ file, isText: false })
  }

  const handleManualSubmit = (text) => {
    setInputText(text)
    const blob = new Blob([text], { type: 'text/plain' })
    // Intercept: show FileStartModal before starting pipeline
    setPendingFile({ file: blob, isText: true, text })
  }

  // Called when FileStartModal confirms — merges template/learning_outcome then starts
  const handleFileStartConfirm = (updatedCtx) => {
    const { file, isText, text } = pendingFile
    setPendingFile(null)
    handleConfigChange(updatedCtx)
    const fd = new FormData()
    fd.append('file', isText ? new Blob([text], { type: 'text/plain' }) : file, isText ? 'manual_input.txt' : file.name)
    Object.entries(updatedCtx).forEach(([key, val]) => {
      if (val !== undefined && val !== null) fd.append(key, val)
    })
    startPipeline(fd)
  }

  const handleFileStartCancel = () => {
    setPendingFile(null)
    setInputFile(null)
    setInputText('')
  }

  const handleCancel = () => {
    abortRef.current?.()
    setStage('input')
    resetPipelineState()
  }

  const handleRestart = () => {
    abortRef.current?.()
    resetPipelineState()
    setInputFile(null)
    setInputText('')
    setStage('input')
  }

  // ── Stage header label map ─────────────────────────────────────────────────
  const stageLabels = {
    input: { step: 1, label: 'Nạp tài liệu' },
    processing: { step: 2, label: 'AI đang xử lý' },
    results: { step: 3, label: 'Kịch bản giảng dạy' },
  }
  const { step: currentStep, label: currentLabel } = stageLabels[stage] ?? {}

  const templateName = classroomCtx.template_id === 'extended-4-node' ? 'Extended (4-node)' : 'Standard (3-node)'
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  return (
    <Container className="flex flex-col gap-6">

      {/* ── Main Container ── */}
      <div className="w-full bg-[#faf8ff] min-h-[85vh] relative rounded-2xl border border-[#c2c6d6] shadow-sm p-8">


        {/* ── Stage renderers — keyed so React remounts on every stage change ── */}
        <div key={stage} className={isExiting ? 'stage-exit' : 'stage-enter'}>
          {stage === 'input' && (
            <ContentInput
              onFileSelected={handleFileSelected}
              onManualSubmit={handleManualSubmit}
              classroomCtx={classroomCtx}
              onConfigChange={handleConfigChange}
              onOpenConfig={() => setIsConfigOpen(true)}
            />
          )}

          {stage === 'processing' && (
            <ProcessingLoader
              hasError={hasError}
              errorMessage={errorMessage}
              onCancel={handleCancel}
            />
          )}

          {stage === 'results' && (
            <TimelineEditor
              steps={timelineSteps}
              onStepsChange={handleStepsChange}
              contentSummary={contentSummary}
              onRestart={handleRestart}
            />
          )}
        </div>
      </div>

      {isConfigOpen && (
        <ClassroomConfigModal
          ctx={classroomCtx}
          onChange={handleConfigChange}
          onClose={() => setIsConfigOpen(false)}
        />
      )}

      {pendingFile && (
        <FileStartModal
          fileName={pendingFile.isText ? 'Nội dung nhập thủ công' : pendingFile.file?.name}
          ctx={classroomCtx}
          onConfirm={handleFileStartConfirm}
          onCancel={handleFileStartCancel}
        />
      )}
    </Container>
  )
}
