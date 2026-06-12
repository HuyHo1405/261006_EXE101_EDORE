/**
 * pipelineService.js
 *
 * Thin wrapper around POST /api/ai/pedagogy/stream
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

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const STREAM_ENDPOINT = `${BASE_URL}/api/ai/pedagogy/stream`

/**
 * Stream the pedagogy pipeline.
 * @param {FormData} formData  — must contain `file` field
 * @param {object}   handlers  — callback handlers
 * @returns {() => void}       — abort function
 */
export function streamPipeline(formData, handlers = {}) {
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

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // SSE events are separated by double newlines
        const parts = buffer.split('\n\n')
        buffer = parts.pop() // keep the last incomplete chunk

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

          let parsed
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
              handlers.onContentSummary?.(parsed)
              break
            case 'metadata':
              handlers.onMetadata?.(parsed)
              break
            case 'section':
              handlers.onSection?.(parsed)
              break
            case 'node_error':
              handlers.onNodeError?.(parsed)
              break
            case 'done':
              handlers.onDone?.(parsed)
              break
            case 'error':
              handlers.onError?.(parsed)
              break
            default:
              break
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return // Intentional cancel
      handlers.onError?.({ message: err.message, details: String(err) })
    } finally {
      handlers.onComplete?.()
    }
  }

  run()

  return () => controller.abort()
}

/**
 * Map a raw section/node from the API to a timelineStep shape
 * that the TimelineEditor expects.
 */
export function mapNodeToTimelineStep(nodeData, index) {
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
    }
  }

  // Handle both enriched and raw node shapes
  const node = nodeData.node ?? nodeData

  const estimatedMin = node.estimated_time_minutes ?? null
  const durationLabel = estimatedMin ? `${estimatedMin}'` : (node.duration ?? '?')

  return {
    time: node.time_range ?? `Node ${index + 1}`,
    title: node.title ?? node.node_name ?? node.applied_activity ?? `Node ${index + 1}`,
    duration: durationLabel,
    type: node.node_type ?? node.type ?? node.node_name ?? 'Activity',
    intent: node.node_intent ?? node.bloom_level ?? node.intent ?? '',
    details: Array.isArray(node.execution_steps)
      ? node.execution_steps
      : Array.isArray(node.phases)
        ? node.phases.map((p) => (typeof p === 'string' ? p : p.description ?? JSON.stringify(p)))
        : Array.isArray(node.details)
          ? node.details
          : node.description
            ? [node.description]
            : [],
    originalContent: node.node_content ?? node.original_content ?? node.knowledge_summary ?? '',
    pedagogNote: Array.isArray(node.materials_needed)
      ? node.materials_needed
      : node.instructor_note ?? node.pedagogNote ?? '',
    warningContext: node.context_adaptation ?? node.warningContext ?? '',
    appliedActivity: node.applied_activity ?? '',
    _raw: node,
  }
}
