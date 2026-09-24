/**
 * pipelineService.ts
 *
 * Thin wrapper around POST /api/ai/pedagogy/pipeline
 * Handles SSE streaming via fetch + ReadableStream (because the endpoint is POST, not GET).
 *
 * Usage:
 *   const abort = streamPipeline(formData, {
 *     onProgress(data)  { ... }
 *     onMetadata(data)  { ... }
 *     onSection(data)   { ... }  // data = { index, node, timestamp }
 *     onNodeError(data) { ... }
 *     onDone(data)      { ... }
 *     onError(data)     { ... }
 *     onComplete()      { ... }  // called after the stream closes (regardless of error)
 *   })
 *   // call abort() to cancel
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
const cleanBaseUrl = BASE_URL.replace(/\/api$/, '')
const STREAM_ENDPOINT = `${cleanBaseUrl}/api/ai/pedagogy/pipeline`

export interface PipelineHandlers {
  onProgress?: (data: Record<string, unknown>) => void
  onContentSummary?: (data: { summary: string }) => void
  onMetadata?: (data: Record<string, unknown>) => void
  onSection?: (data: { index: number; node: Record<string, unknown>; timestamp?: string }) => void
  onNodeError?: (data: Record<string, unknown>) => void
  onDone?: (data: Record<string, unknown>) => void
  onError?: (data: { message: string; details?: string }) => void
  onComplete?: () => void
}

/**
 * Stream the pedagogy pipeline.
 * @param formData  — must contain `file` field
 * @param handlers  — callback handlers
 * @returns abort function
 */
export function streamPipeline(formData: FormData, handlers: PipelineHandlers = {}): () => void {
  const controller = new AbortController()

  async function run() {
    try {
      const res = await fetch(STREAM_ENDPOINT, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      if (!res.ok) {
        handlers.onError?.({
          message: `HTTP ${res.status}: ${res.statusText}`,
          details: await res.text().catch(() => ''),
        })
        handlers.onComplete?.()
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // SSE events are separated by double newlines
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? '' // keep the last incomplete chunk

        for (const part of parts) {
          if (!part.trim()) continue

          let eventType = 'message'
          let dataStr = ''

          for (const line of part.split('\n')) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim()
            } else if (line.startsWith('data: ')) {
              dataStr = line.slice(6).trim()
            }
          }

          if (!dataStr) continue

          let parsed: Record<string, unknown>
          try {
            parsed = JSON.parse(dataStr)
          } catch {
            parsed = { raw: dataStr }
          }

          switch (eventType) {
            case 'progress':
              handlers.onProgress?.(parsed)
              break
            case 'content_summary':
              handlers.onContentSummary?.(parsed as { summary: string })
              break
            case 'metadata':
              handlers.onMetadata?.(parsed)
              break
            case 'section':
              handlers.onSection?.(parsed as { index: number; node: Record<string, unknown> })
              break
            case 'node_error':
              handlers.onNodeError?.(parsed)
              break
            case 'done':
              handlers.onDone?.(parsed)
              break
            case 'error':
              handlers.onError?.(parsed as { message: string })
              break
            default:
              break
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return // Intentional cancel
      handlers.onError?.({ message: err instanceof Error ? err.message : String(err), details: String(err) })
    } finally {
      handlers.onComplete?.()
    }
  }

  run()

  return () => controller.abort()
}

export interface TimelineStep {
  time: string
  title: string
  duration: string
  type: string
  intent: string
  details: string[]        // execution_steps — list of activity steps (Bước 1, Bước 2...)
  activityStepRoles?: string[]
  nodeTypeCode?: string
  customStepNotes?: string[]
  originalContent: string // node_content — overall knowledge summary for the node
  pedagogNote: string | string[]
  warningContext: string
  appliedActivity: string
  nodePayload?: any
  isLoading?: boolean
  _raw?: Record<string, unknown>
}

/**
 * Map a raw section/node from the API to a TimelineStep shape
 * that the TimelineEditor expects.
 */
export function mapNodeToTimelineStep(nodeData: Record<string, unknown>, index: number): TimelineStep {
  if (!nodeData || typeof nodeData !== 'object') {
    return {
      time: `Node ${index + 1}`,
      title: `Node ${index + 1}`,
      duration: '?',
      type: 'Unknown',
      intent: '',
      details: [],
      originalContent: '',
      pedagogNote: '',
      warningContext: '',
      appliedActivity: '',
    }
  }

  // Handle both enriched and raw node shapes
  const raw = nodeData as Record<string, unknown>
  const node = (raw.node ?? raw) as Record<string, unknown>

  const estimatedMin = node.estimated_time_minutes ?? null
  const durationLabel = estimatedMin ? `${estimatedMin}'` : ((node.duration as string) ?? '?')

  let details: string[] = []
  if (Array.isArray(node.execution_steps)) {
    details = node.execution_steps as string[]
  } else if (Array.isArray(node.phases)) {
    details = (node.phases as unknown[]).map((p) =>
      typeof p === 'string' ? p : ((p as Record<string, unknown>).description as string) ?? JSON.stringify(p)
    )
  } else if (Array.isArray(node.details)) {
    details = node.details as string[]
  } else if (node.description) {
    details = [node.description as string]
  }

  const pedagogNote: string | string[] = Array.isArray(node.materials_needed)
    ? (node.materials_needed as string[])
    : ((node.instructor_note as string) ?? (node.pedagogNote as string) ?? '')

  // originalContent: overall node knowledge summary (node_content)
  const rawNodeContent = node.node_content ?? node.original_content ?? node.knowledge_summary ?? ''
  const originalContent = Array.isArray(rawNodeContent)
    ? (rawNodeContent as string[]).join('\n\n')
    : (rawNodeContent as string)

  const activityStepRoles = Array.isArray(node.activityStepRoles)
    ? (node.activityStepRoles as string[])
    : undefined

  const nodeTypeCode = (node.nodeTypeCode ?? node.node_type_code ?? node.type) as string | undefined

  return {
    time: (node.time_range as string) ?? `Node ${index + 1}`,
    title: (node.title ?? node.node_name ?? node.applied_activity ?? `Node ${index + 1}`) as string,
    duration: durationLabel,
    type: (node.node_type ?? node.type ?? node.node_name ?? 'Activity') as string,
    intent: (node.node_intent ?? node.bloom_level ?? node.intent ?? '') as string,
    details,
    activityStepRoles,
    nodeTypeCode,
    originalContent,
    pedagogNote,
    warningContext: (node.context_adaptation ?? node.warningContext ?? '') as string,
    appliedActivity: (node.applied_activity ?? '') as string,
    nodePayload: node.node_payload ?? node.nodePayload ?? null,
    _raw: node,
  }
}
