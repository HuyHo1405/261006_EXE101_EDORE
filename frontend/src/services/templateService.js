/**
 * templateService.js
 *
 * API Client to fetch and manage pedagogical lesson templates.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

/**
 * Fetch lesson templates from the backend.
 * @param {object} params - optional filters: { duration, bloom, student_count }
 * @returns {Promise<Array>}
 */
export async function getTemplates(params = {}) {
  const query = new URLSearchParams()
  if (params.duration !== undefined && params.duration !== null) {
    query.append('duration', params.duration)
  }
  if (params.bloom) {
    query.append('bloom', params.bloom)
  }
  if (params.student_count !== undefined && params.student_count !== null) {
    query.append('student_count', params.student_count)
  }

  const url = `${BASE_URL}/api/templates?${query.toString()}`
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch templates: HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Fetch template detail by ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getTemplateById(id) {
  const response = await fetch(`${BASE_URL}/api/templates/${id}`, {
    headers: {
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch template ${id}: HTTP ${response.status}`)
  }

  return response.json()
}
