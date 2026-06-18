import { useState, useRef, useCallback } from 'react'
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
export default function Playground() {
  // ── Stage machine (with fade transition) ───────────────────────────────────
  const { visibleStage: stage, isExiting, goTo: setStage } = useStageTransition('input')

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
  const handleConfigChange = (ctx) => {
    setClassroomCtx(ctx)
    localStorage.setItem('edore_classroom_ctx', JSON.stringify(ctx))
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
    <div className="w-full flex flex-col gap-6 font-sans antialiased text-[#151b2d]">
      {/* ── Stepper outside the large container ── */}
      <div className="flex justify-center mt-2 stage-enter">
        <div className="flex items-center gap-2 text-[10px] font-mono bg-white border border-[#c2c6d6] px-4 py-2 rounded-full shadow-sm">
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
                  <span>{label}</span>
                </div>
                {i < 2 && <span className="text-[#c2c6d6] font-bold">›</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Main Container ── */}
      <div className="w-full bg-[#faf8ff] min-h-[85vh] relative rounded-2xl border border-[#c2c6d6] shadow-sm p-8">
        {/* Title area - Left-aligned with Config Button on the right (old stepper position) */}
        <div className="mb-8 border-b border-[#e2e8f0] pb-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-extrabold text-2xl text-[#151b2d]">Playground AI</h1>
            <p className="text-xs text-[#727785] font-mono mt-0.5">
              Tạo kịch bản giảng dạy từ tài liệu của bạn
            </p>
          </div>

          {/* Config Button in the header (only in 'input' stage) */}
          {stage === 'input' && (
            <button
              onClick={() => setIsConfigOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl hover:border-[#c2c6d6] hover:bg-[#f8fafc] text-xs font-semibold shadow-sm transition-all active:scale-95 text-[#424754]"
            >
              <span className="material-symbols-outlined text-base text-[#0058be]">settings</span>
              <span>Cấu hình lớp học:</span>
              <span className="bg-[#eaedff] text-[#0058be] font-bold px-2 py-0.5 rounded text-[10px]">
                {classroomCtx.duration}p · {classroomCtx.studentCount} HS · {templateName}
              </span>
              <span className="material-symbols-outlined text-xs text-[#727785]">edit</span>
            </button>
          )}
        </div>

        {/* ── Stage renderers — keyed so React remounts on every stage change ── */}
        <div key={stage} className={isExiting ? 'stage-exit' : 'stage-enter'}>
          {stage === 'input' && (
            <ContentInput
              onFileSelected={handleFileSelected}
              onManualSubmit={handleManualSubmit}
              classroomCtx={classroomCtx}
              onConfigChange={handleConfigChange}
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
              onStepsChange={setTimelineSteps}
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
    </div>
  )
}
