import type { ExerciseItem } from '../types/nodePayload'

export const KAHOOT_HEADERS = ['Question - 120 max length', 'Answer 1 - 75 max length',
  'Answer 2 - 75 max length', 'Answer 3 - 75 max length', 'Answer 4 - 75 max length',
  'Time limit', 'Correct answer(s)']

export function prepareKahootQuestions(exercises: ExerciseItem[], enforceKahootLimits = true) {
  if (!exercises.length) throw new Error('Chưa có câu hỏi để xuất.')
  if (enforceKahootLimits && exercises.length > 200) throw new Error('Mỗi lần xuất tối đa 200 câu hỏi.')
  return exercises.map((ex, i) => {
    const question = ex.question?.trim() || ''
    const options = ex.options?.map(o => o.trim()) || []
    const correct = ex.correct_answer
    const time = ex.time_limit ?? 20
    const errors: string[] = []
    if (!question) errors.push('chưa nhập câu hỏi')
    if (enforceKahootLimits && [...question].length > 120) errors.push('câu hỏi tối đa 120 ký tự')
    if (options.length < 2 || options.length > 4 || !options[0] || !options[1]) errors.push('cần có 2–4 lựa chọn, A và B bắt buộc')
    if (enforceKahootLimits && options.some(o => [...o].length > 75)) errors.push('mỗi lựa chọn tối đa 75 ký tự')
    if (!Number.isInteger(correct) || !correct || !options[correct - 1]) errors.push('chọn đáp án đúng')
    if (![5, 10, 20, 30, 60, 120].includes(time)) errors.push('thời gian phải là 5, 10, 20, 30, 60 hoặc 120 giây')
    if (errors.length) throw new Error(`Câu ${i + 1}: ${errors.join('; ')}.`)
    return { question, options, correct_answer: correct!, time_limit: time }
  })
}

export function toKahootCsv(questions: ReturnType<typeof prepareKahootQuestions>) {
  const cell = (value: string | number) => {
    const text = String(value)
    // Quoting alone does not protect spreadsheet users from formula execution.
    const safe = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text
    return `"${safe.replace(/"/g, '""')}"`
  }
  return '\uFEFF' + [KAHOOT_HEADERS, ...questions.map(q => [q.question,
    ...Array.from({ length: 4 }, (_, i) => q.options[i] || ''), q.time_limit, q.correct_answer])]
    .map(row => row.map(cell).join(',')).join('\r\n') + '\r\n'
}

export function downloadQuiz(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
