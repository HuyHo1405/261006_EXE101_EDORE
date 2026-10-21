const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
function load(file) {
  const source = fs.readFileSync(path.join(__dirname, '../src/features/playground', file), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  const target = { exports: {} }
  new Function('exports', 'module', compiled)(target.exports, target)
  return target.exports
}
const { buildLessonDocument } = load('utils/lessonDocument.ts')
const mocks = load('data/mockLessonLichSu.ts')

test('exports all lesson stages, detailed payload and full original questions at the end', () => {
  const q = { question: 'Câu hỏi đầy đủ '.repeat(20), options: ['Lựa chọn dài '.repeat(20), 'B', 'C', 'D'], correct_answer: 1, explanation: 'Lời giải gốc' }
  const steps = [...mocks.MOCK_STEPS_LICHSU, { title: 'Test', type: 'Luyện tập', details: [], nodePayload: { exercises: [q], kahoot_export: { questions: [{ question: 'Bản rút gọn không được xuất' }] } } }]
  const doc = buildLessonDocument(steps, mocks.MOCK_LESSON_META_LICHSU)
  for (const step of steps) assert.ok(doc.sections.some(s => s.title === step.type))
  const json = JSON.stringify(doc)
  assert.ok(json.includes('Hình thành kiến thức'))
  assert.ok(json.includes('Lời giải gốc'))
  assert.ok(!json.includes('Bản rút gọn không được xuất'))
  assert.equal(doc.questions.at(-1).question, q.question)
  assert.equal(doc.questions.at(-1).options[0], q.options[0])
  assert.equal(doc.questions.at(-1).correctAnswer, 1)
})

test('reflects local edits and includes teacher notes and legacy free-text exercises', () => {
  const step = { title: 'Tên đã sửa', type: 'Vận dụng', originalContent: 'Nội dung đã sửa', details: ['Bước đã sửa'],
    customStepNotes: ['Ghi chú riêng'], _raw: { settings: { step_content: ['Nội dung chuyên sâu'] } },
    nodePayload: { exercises: [{ question: 'Tự luận', answer: 'Lời giải tự luận' }], scenario: 'Tình huống đã sửa' } }
  const doc = buildLessonDocument([step], { learningOutcomes: [], teachingMethods: [], teachingTools: [] }, 'Tên giáo án')
  const text = JSON.stringify(doc)
  for (const phrase of ['Tên đã sửa', 'Nội dung đã sửa', 'Ghi chú riêng', 'Bước đã sửa', 'Nội dung chuyên sâu', 'Tình huống đã sửa', 'Lời giải tự luận']) assert.ok(text.includes(phrase))
  assert.equal(doc.title, 'Tên giáo án')
  assert.equal(doc.questions[0].correctAnswer, null)
})

if (process.env.LESSON_DOCX_FIXTURE) {
  fs.writeFileSync(process.env.LESSON_DOCX_FIXTURE, JSON.stringify(buildLessonDocument(mocks.MOCK_STEPS_LICHSU, mocks.MOCK_LESSON_META_LICHSU), null, 2))
}
