import { useState, useRef, useCallback } from 'react'
import FilterModal from '../features/playground/FilterModal'
import ContentInput from '../features/playground/ContentInput'
import ProcessingLoader from '../features/playground/ProcessingLoader'
import TimelineEditor from '../features/playground/TimelineEditor'
import { streamPipeline, mapNodeToTimelineStep } from '../services/pipelineService'

/**
 * Playground
 *
 * Workflow stages:
 *   filters → input → processing → results
 *
 * State owned here; features are pure UI components.
 */
export default function Playground() {
  // ── Stage machine ──────────────────────────────────────────────────────────
  const [stage, setStage] = useState('filters')

  // ── Context (from FilterModal) ─────────────────────────────────────────────
  const [classroomCtx, setClassroomCtx] = useState(null)

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

  // ── Results ────────────────────────────────────────────────────────────────
  const [timelineSteps, setTimelineSteps] = useState([])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const resetPipelineState = () => {
    setProgressEvents([])
    setMetadata(null)
    setContentSummary('')
    setSectionsDone(0)
    setHasError(false)
    setErrorMessage('')
    setTimelineSteps([])
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFilterConfirm = (ctx) => {
    setClassroomCtx(ctx)
    setStage('input')
  }

  const startPipeline = useCallback((formData) => {
    resetPipelineState()
    setStage('processing')

    const abort = streamPipeline(formData, {
      onProgress(data) {
        setProgressEvents((prev) => [...prev, data])
      },
      onContentSummary(data) {
        setContentSummary(data.summary)
      },
      onMetadata(data) {
        setMetadata(data)
      },
      onSection(data) {
        // data = { index, node, timestamp }
        setSectionsDone((n) => n + 1)
        const step = mapNodeToTimelineStep(data.node, data.index)
        setTimelineSteps((prev) => {
          const next = [...prev]
          next[data.index] = step
          return next
        })
      },
      onNodeError(data) {
        console.warn('Node error:', data)
      },
      onDone(data) {
        if (data?.content_summary) {
          setContentSummary(data.content_summary)
        }
        // If the pipeline returned final_pedagogical_script, use it as the canonical steps
        if (
          data?.final_pedagogical_script &&
          Array.isArray(data.final_pedagogical_script) &&
          data.final_pedagogical_script.length > 0
        ) {
          const steps = data.final_pedagogical_script.map((node, i) =>
            mapNodeToTimelineStep(node, i)
          )
          setTimelineSteps(steps)
        }
        // Short pause then show results
        setTimeout(() => setStage('results'), 500)
      },
      onError(data) {
        setHasError(true)
        setErrorMessage(data?.message ?? 'Unknown error')
      },
      onComplete() {
        // If we got an error but no done event, stay on processing so user sees it
        // Otherwise transitions are handled in onDone
      },
    })

    abortRef.current = abort
  }, [])

  const handleFileSelected = (file) => {
    setInputFile(file)
    const fd = new FormData()
    fd.append('file', file)
    if (classroomCtx) {
      Object.entries(classroomCtx).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          fd.append(key, val)
        }
      })
    }
    startPipeline(fd)
  }

  const handleManualSubmit = (text) => {
    setInputText(text)
    // Wrap as a Blob so the server receives a real file upload
    const blob = new Blob([text], { type: 'text/plain' })
    const fd = new FormData()
    fd.append('file', blob, 'manual_input.txt')
    if (classroomCtx) {
      Object.entries(classroomCtx).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          fd.append(key, val)
        }
      })
    }
    startPipeline(fd)
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
    setStage('filters')
  }

  // ── Stage header label map ─────────────────────────────────────────────────
  const stageLabels = {
    filters: { step: 1, label: 'Cấu hình ngữ cảnh' },
    input: { step: 2, label: 'Nạp tài liệu' },
    processing: { step: 3, label: 'AI đang xử lý' },
    results: { step: 4, label: 'Kịch bản giảng dạy' },
  }
  const { step: currentStep, label: currentLabel } = stageLabels[stage] ?? {}

  return (
    <div className="w-full bg-[#faf8ff] min-h-[85vh] text-[#151b2d] font-sans antialiased relative rounded-2xl border border-[#c2c6d6] shadow-sm p-8">
      {/* ── Page header with step indicator ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-extrabold text-2xl text-[#151b2d]">Playground AI</h1>
            <p className="text-xs text-[#727785] font-mono mt-0.5">
              Tạo kịch bản giảng dạy từ tài liệu của bạn
            </p>
          </div>

          {/* Step breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] font-mono">
            {Object.entries(stageLabels).map(([key, { step, label }], i) => {
              const isActive = stage === key
              const isDone = Object.keys(stageLabels).indexOf(stage) > i
              return (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
                      isActive
                        ? 'bg-[#0058be] text-white border-[#0058be] font-bold'
                        : isDone
                          ? 'bg-[#eaedff] text-[#0058be] border-[#0058be]/30'
                          : 'bg-white text-[#727785] border-[#e2e8f0]'
                    }`}
                  >
                    <span>{isDone ? '✓' : step}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </div>
                  {i < 3 && <span className="text-[#c2c6d6]">›</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Stage renderers ── */}
      {stage === 'filters' && (
        <FilterModal
          fileName={fileName}
          onBack={() => {}}      // No back from first step
          onConfirm={handleFilterConfirm}
        />
      )}

      {stage === 'input' && (
        <ContentInput
          onFileSelected={handleFileSelected}
          onManualSubmit={handleManualSubmit}
        />
      )}

      {stage === 'processing' && (
        <ProcessingLoader
          progressEvents={progressEvents}
          metadata={metadata}
          contentSummary={contentSummary}
          sectionsDone={sectionsDone}
          totalSections={metadata?.sections?.length ?? 0}
          hasError={hasError}
          errorMessage={errorMessage}
          onCancel={handleCancel}
        />
      )}

      {stage === 'results' && (
        <TimelineEditor
          steps={timelineSteps}
          onStepsChange={setTimelineSteps}
          contentSummary={contentSummary}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}
