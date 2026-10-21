import type { TimelineStep } from '@/lib/services/pipelineService'
import type { LessonMeta } from '../types/lessonMeta'

export interface DocumentBlock { label: string; text: string; important: boolean }
export interface LessonDocumentRequest {
  title: string
  subtitle: string
  sections: { title: string; blocks: DocumentBlock[] }[]
  questions: { question: string; options: string[]; correctAnswer: number | null; answer: string; explanation: string }[]
}

const LABELS: Record<string, string> = {
  activity_name: 'Hoạt động', activity_type_label: 'Hình thức', visual_action: 'Tình huống dẫn nhập',
  quick_connection: 'Kết nối kiến thức', conclusion: 'Kết luận', bridge_question: 'Câu hỏi chuyển tiếp',
  question_or_situation: 'Câu hỏi hoặc tình huống', presentation_form: 'Cách trình bày', expected_responses: 'Phản hồi dự kiến',
  transition_line: 'Chuyển tiếp', approach_label: 'Phương pháp', approach_description: 'Tổ chức hoạt động',
  unit_title: 'Đơn vị kiến thức', core_content: 'Kiến thức trọng tâm', teacher_explanation: 'Giải thích của giáo viên',
  teacher_delivery: 'Hướng dẫn giảng dạy', visual_example: 'Ví dụ trực quan', title: 'Tiêu đề', item: 'Tư liệu',
  description: 'Mô tả', guiding_tip: 'Gợi ý dẫn dắt', questions: 'Câu hỏi gợi mở', checkpoint_question: 'Câu hỏi kiểm tra',
  synthesis: 'Chốt kiến thức', scenario: 'Tình huống vận dụng', task_requirement: 'Yêu cầu nhiệm vụ',
  expected_output_form: 'Sản phẩm dự kiến', criterion: 'Tiêu chí đánh giá', scaffolding_hint: 'Gợi ý hỗ trợ',
  label: 'Nội dung', content: 'Diễn giải', rubric: 'Tiêu chí đánh giá', content_navigation: 'Điều hướng nội dung',
}
const INTERNAL = new Set(['source', 'lesson_code', 'question_id', 'kahoot_export', 'activity_type', 'pedagogical_approach', 'used_image_ids', 'exercises'])

export function buildLessonDocument(steps: TimelineStep[], meta: LessonMeta, title = '', courseTitle = ''): LessonDocumentRequest {
  const sections: LessonDocumentRequest['sections'] = []
  const questions: LessonDocumentRequest['questions'] = []
  const intro: DocumentBlock[] = []
  const add = (blocks: DocumentBlock[], label: string, value: unknown, important = false) => {
    if (Array.isArray(value)) { value.forEach(v => add(blocks, label, v, important)); return }
    if (typeof value === 'string' && value.trim()) blocks.push({ label, text: value, important })
  }
  add(intro, 'Bài học', meta.lessonNumber)
  add(intro, 'Chương', meta.chapter)
  add(intro, 'Yêu cầu cần đạt', meta.learningOutcomes, true)
  add(intro, 'Phương pháp dạy học', meta.teachingMethods)
  for (const method of meta.methodDetails || []) {
    add(intro, 'Phương pháp', method.name)
    add(intro, 'Tổ chức phương pháp', method.description)
    add(intro, 'Các bước tổ chức', method.steps)
  }
  for (const tool of meta.teachingTools || []) add(intro, 'Học liệu và phương tiện', typeof tool === 'string' ? tool : `${tool.name}${tool.purpose ? ': ' + tool.purpose : ''}`)
  if (intro.length) sections.push({ title: 'Tổng quan bài học', blocks: intro })

  for (const step of steps) {
    const blocks: DocumentBlock[] = []
    if (step.title !== step.type) add(blocks, 'Hoạt động', step.title)
    add(blocks, 'Mục tiêu hoạt động', step.intent)
    add(blocks, 'Thời lượng', step.duration)
    add(blocks, 'Phương pháp tổ chức', step.teachingMethod || step.appliedActivity)
    add(blocks, 'Nội dung', step.originalContent)
    add(blocks, 'Kiến thức trọng tâm', step.mappedKnowledge, true)
    add(blocks, 'Tiến trình tổ chức', step.details)
    const raw = step._raw || {}
    const settings = raw.settings && typeof raw.settings === 'object' ? raw.settings as Record<string, unknown> : raw
    add(blocks, 'Nội dung chi tiết từng bước', settings.step_content)
    if (JSON.stringify(settings.interaction_flow) !== JSON.stringify(step.details)) add(blocks, 'Hoạt động tương tác', settings.interaction_flow)
    add(blocks, 'Ghi chú của giáo viên', step.customStepNotes)
    add(blocks, 'Học liệu', step.pedagogNote)
    add(blocks, 'Lưu ý tổ chức', step.warningContext)
    const walk = (value: unknown, label = '', depth = 0) => {
      if (depth > 16 || value == null) return
      if (typeof value === 'string') { add(blocks, label, value, label === 'Kiến thức trọng tâm' || label === 'Chốt kiến thức'); return }
      if (typeof value === 'number' && Number.isFinite(value)) { add(blocks, label, String(value)); return }
      if (Array.isArray(value)) { value.forEach(v => walk(v, label, depth + 1)); return }
      if (typeof value === 'object') for (const [key, child] of Object.entries(value)) {
        if (!INTERNAL.has(key)) walk(child, LABELS[key] || label || 'Nội dung bổ sung', depth + 1)
      }
    }
    walk(step.nodePayload)
    sections.push({ title: step.type || step.title || 'Hoạt động bài học', blocks })
    const exercises = step.nodePayload?.exercises
    if (Array.isArray(exercises)) for (const ex of exercises) {
      if (!ex || typeof ex.question !== 'string' || !ex.question.trim()) continue
      const options = Array.isArray(ex.options) ? ex.options.map((o: unknown) => String(o ?? '')) : []
      questions.push({ question: ex.question, options,
        correctAnswer: Number.isInteger(ex.correct_answer) && ex.correct_answer >= 1 && ex.correct_answer <= options.length ? ex.correct_answer : null,
        answer: typeof ex.answer === 'string' ? ex.answer : '', explanation: typeof ex.explanation === 'string' ? ex.explanation : '' })
    }
  }
  if (meta.images?.length) {
    const blocks: DocumentBlock[] = []
    for (const image of meta.images) {
      add(blocks, 'Tư liệu hình ảnh', image.caption || image.title || image.description)
      add(blocks, 'Đường dẫn tư liệu', image.url)
    }
    if (blocks.length) sections.push({ title: 'Tư liệu tham khảo của bài học', blocks })
  }
  return { title: meta.lessonTitle || title || 'Nội dung bài học', subtitle: courseTitle, sections, questions }
}
