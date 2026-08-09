/**
 * templateService.js
 *
 * API Client để fetch và quản lý lesson templates.
 * Trỏ về Java Backend (localhost:8080) — không phải Python AI layer.
 */

// Java business layer — Templates được quản lý ở đây
const JAVA_BASE = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080'

/**
 * Lấy tất cả templates, có thể filter theo duration, bloom, student_count.
 * @param {object} params - { duration?, bloom?, student_count? }
 * @returns {Promise<Array>}
 */
export async function getTemplates(params = {}) {
  const query = new URLSearchParams()
  if (params.duration != null)     query.append('duration', params.duration)
  if (params.bloom)                query.append('bloom', params.bloom)
  if (params.student_count != null) query.append('student_count', params.student_count)

  const res = await fetch(`${JAVA_BASE}/api/templates?${query.toString()}`, {
    headers: { 'Accept': 'application/json' },
  })

  if (!res.ok) throw new Error(`Lấy templates thất bại: HTTP ${res.status}`)

  // Java trả về { success, data: [...] }
  const body = await res.json()
  return body.data ?? body   // fallback nếu server cũ không wrap
}

/**
 * Lấy template theo ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getTemplateById(id) {
  const res = await fetch(`${JAVA_BASE}/api/templates/${id}`, {
    headers: { 'Accept': 'application/json' },
  })

  if (!res.ok) throw new Error(`Lấy template '${id}' thất bại: HTTP ${res.status}`)

  const body = await res.json()
  return body.data ?? body
}
