export interface KhoiDongHook {
  question_or_situation?: string
  presentation_form?: string
}

export interface KhoiDongPayload {
  hook?: KhoiDongHook
  expected_responses?: string[]
  transition_line?: string
}

export interface KnowledgeUnit {
  unit_title?: string
  core_content?: string
  teacher_delivery?: string
  checkpoint_question?: string
}

export interface HinhThanhKienThucPayload {
  knowledge_units?: KnowledgeUnit[]
  synthesis?: string
}

export interface ExerciseItem {
  question?: string
  level?: 'nhan_biet' | 'thong_hieu' | 'van_dung_thap' | 'van_dung_cao' | string
  answer?: string
  format?: string
}

export interface LuyenTapPayload {
  exercises?: ExerciseItem[]
}

export interface RubricItem {
  criterion?: string
  description?: string
}

export interface VanDungPayload {
  scenario?: string
  task_requirement?: string
  expected_output_form?: string
  rubric?: RubricItem[]
  scaffolding_hint?: string
}

export type NodePayload =
  | KhoiDongPayload
  | HinhThanhKienThucPayload
  | LuyenTapPayload
  | VanDungPayload
  | Record<string, any>

export type NormalizedNodeType =
  | 'KHOI_DONG'
  | 'HINH_THANH_KIEN_THUC'
  | 'LUYEN_TAP'
  | 'VAN_DUNG'
  | 'UNKNOWN'

export function normalizeNodeType(nodeTypeStr?: string): NormalizedNodeType {
  if (!nodeTypeStr) return 'UNKNOWN'
  const s = nodeTypeStr.toLowerCase()
  if (s.includes('khởi động') || s.includes('khoi_dong') || s.includes('warmup') || s.includes('hook')) {
    return 'KHOI_DONG'
  }
  if (s.includes('hình thành') || s.includes('hinh_thanh') || s.includes('lý thuyết') || s.includes('core')) {
    return 'HINH_THANH_KIEN_THUC'
  }
  if (s.includes('luyện tập') || s.includes('luyen_tap') || s.includes('thực hành') || s.includes('practice')) {
    return 'LUYEN_TAP'
  }
  if (s.includes('vận dụng') || s.includes('van_dung') || s.includes('dự án') || s.includes('apply')) {
    return 'VAN_DUNG'
  }
  return 'UNKNOWN'
}
