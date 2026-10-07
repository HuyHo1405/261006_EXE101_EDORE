/**
 * Thông tin tổng quan của bài học (lấy từ file nội bộ / hệ thống gắn vào,
 * không phụ thuộc AI sinh ra). Tất cả field đều tùy chọn.
 */
export type ActivityMethodType =
  | 'STATION_ROTATION'
  | 'INQUIRY_BASED'
  | 'JIGSAW_GROUP'
  | 'ROLEPLAY'
  | 'PROJECT_BASED'
  | 'GENERAL_FLOW'

export interface TeachingMethodDetail {
  name: string
  type?: ActivityMethodType
  description?: string
  steps?: string[]
}

export interface TeachingToolItem {
  name: string
  purpose?: string
}

export type TeachingTool = string | TeachingToolItem

export interface LessonMeta {
  /** Số thứ tự bài, ví dụ "Bài 5" hoặc "5" */
  lessonNumber?: string
  /** Tiêu đề bài học, ví dụ "Hệ thức lượng trong tam giác vuông" */
  lessonTitle?: string
  /** Chương / chủ đề cha (nếu có) */
  chapter?: string
  /** Yêu cầu cần đạt (learning outcomes) */
  learningOutcomes: string[]
  /** Phương pháp dạy học chung của bài */
  teachingMethods: string[]
  /** Mô tả / cách tổ chức cụ thể từng phương pháp */
  methodDetails?: TeachingMethodDetail[]
  /** Phương tiện / công cụ cần chuẩn bị kèm mục đích */
  teachingTools: (string | TeachingToolItem)[]
}

export const EMPTY_LESSON_META: LessonMeta = {
  learningOutcomes: [],
  teachingMethods: [],
  methodDetails: [],
  teachingTools: [],
}

function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(x => String(x ?? '').trim()).filter(Boolean)
  if (typeof v === 'string') {
    return v
      .split(/\r?\n|;/)
      .map(s => s.replace(/^([-*+•]\s*|\d+[.)]\s*)/, '').trim())
      .filter(Boolean)
  }
  return []
}

function pick(obj: Record<string, any> | null | undefined, ...keys: string[]): unknown {
  if (!obj) return undefined
  for (const k of keys) if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k]
  return undefined
}

/** Chuẩn hóa mọi dạng (camelCase / snake_case) về LessonMeta. */
function toToolArray(v: unknown): (string | TeachingToolItem)[] {
  if (Array.isArray(v)) {
    return v
      .map(x => {
        if (typeof x === 'object' && x !== null && 'name' in x) {
          return x as TeachingToolItem
        }
        return String(x ?? '').trim()
      })
      .filter(Boolean)
  }
  return toStringArray(v)
}

export function normalizeLessonMeta(raw: Record<string, any> | null | undefined): LessonMeta {
  const src = (pick(raw, 'lessonMeta', 'lesson_meta') as Record<string, any> | undefined) ?? raw ?? {}
  return {
    lessonNumber: pick(src, 'lessonNumber', 'lesson_number') as string | undefined,
    lessonTitle: pick(src, 'lessonTitle', 'lesson_title') as string | undefined,
    chapter: pick(src, 'chapter', 'chapterTitle', 'chapter_title') as string | undefined,
    learningOutcomes: toStringArray(pick(src, 'learningOutcomes', 'learning_outcomes')),
    teachingMethods: toStringArray(pick(src, 'teachingMethods', 'teaching_methods')),
    methodDetails: (pick(src, 'methodDetails', 'method_details', 'teachingMethodDetails', 'teaching_method_details') as TeachingMethodDetail[] | undefined),
    teachingTools: toToolArray(pick(src, 'teachingTools', 'teaching_tools', 'materials_needed')),
  }
}

/** Gộp phương pháp / vật tư từ các node nếu meta cấp bài chưa có. */
export function mergeLessonMetaWithNodes(
  meta: LessonMeta,
  nodes: { teachingMethod?: string; materials?: string[] }[],
): LessonMeta {
  const uniq = (a: string[]) => Array.from(new Set(a.map(s => s.trim()).filter(Boolean)))
  return {
    ...meta,
    teachingMethods: meta.teachingMethods.length
      ? meta.teachingMethods
      : uniq(nodes.flatMap(n => (n.teachingMethod ? String(n.teachingMethod).split(/[;,\n]/) : []))),
    teachingTools: meta.teachingTools.length
      ? meta.teachingTools
      : uniq(nodes.flatMap(n => n.materials ?? [])),
  }
}
