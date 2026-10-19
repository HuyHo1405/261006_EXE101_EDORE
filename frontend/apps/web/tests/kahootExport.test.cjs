const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
// Run pure TypeScript utilities with the workspace compiler; no browser or test dependency.
const source = fs.readFileSync(path.join(__dirname, '../src/features/playground/utils/kahootExport.ts'), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
const target = { exports: {} }
new Function('exports', 'module', compiled)(target.exports, target)
const { prepareKahootQuestions, toKahootCsv, restoreKahootDraft, applyKahootSuggestions } = target.exports
const question = { question: 'Lịch sử, "quá khứ"?\nChọn đáp án', options: ['Đúng', 'Sai', '', ''], correct_answer: 1, time_limit: 20 }

test('CSV preserves Vietnamese, quotes, commas, newlines and answer positions', () => {
  const csv = toKahootCsv(prepareKahootQuestions([question]))
  assert.ok(csv.startsWith('\uFEFF'))
  assert.ok(csv.includes('"Lịch sử, ""quá khứ""?\nChọn đáp án"'))
  assert.ok(csv.endsWith('"Đúng","Sai","","","20","1"\r\n'))
})

test('rejects unsupported legacy exercises and blank correct options', () => {
  assert.throws(() => prepareKahootQuestions([{ question: 'Tự luận', answer: 'Đáp án' }]), /Câu 1/)
  assert.throws(() => prepareKahootQuestions([{ ...question, correct_answer: 3 }]), /đáp án đúng/)
  assert.throws(() => prepareKahootQuestions([{ ...question, correct_answer: 1.5 }]), /đáp án đúng/)
  assert.throws(() => prepareKahootQuestions([{ ...question, time_limit: 45 }]), /thời gian/)
})

test('validates exact Kahoot length boundaries without truncating source text', () => {
  assert.doesNotThrow(() => prepareKahootQuestions([{ ...question, question: 'ế'.repeat(120), options: ['a'.repeat(75), 'b'] }]))
  assert.throws(() => prepareKahootQuestions([{ ...question, question: 'ế'.repeat(121) }]), /120/)
  assert.throws(() => prepareKahootQuestions([{ ...question, options: ['a'.repeat(76), 'b'] }]), /75/)
  assert.throws(() => prepareKahootQuestions([]), /Chưa có/)
})

test('CSV neutralizes formula prefixes in user-edited question text', () => {
  const csv = toKahootCsv(prepareKahootQuestions([{ ...question, question: '=1+1', options: ['+SUM(1)', 'B'] }]))
  assert.ok(csv.includes('"\'=1+1"'))
  assert.ok(csv.includes('"\'+SUM(1)"'))
})

test('CSV can preserve long bank questions while Kahoot Excel requires shortening', () => {
  const long = { ...question, question: 'ế'.repeat(150), options: ['a'.repeat(90), 'b'] }
  const csv = toKahootCsv(prepareKahootQuestions([long], false))
  assert.ok(csv.includes(long.question))
  assert.ok(csv.includes(long.options[0]))
  assert.throws(() => prepareKahootQuestions([long]), /120/)
})

test('AI suggestions preserve source, existing short fields, answer key and time', () => {
  const source = prepareKahootQuestions([{ ...question, options: ['a'.repeat(90), 'B', '', ''] }], false)
  const suggestion = { question: 'AI changed question', options: ['A ngắn', 'AI changed B', 'new C', 'new D'], correct_answer: 2, time_limit: 60 }
  const result = applyKahootSuggestions(source, [0], [suggestion])
  assert.equal(source[0].options[0].length, 90)
  assert.equal(result[0].question, source[0].question)
  assert.deepEqual(result[0].options, ['A ngắn', 'B', '', ''])
  assert.equal(result[0].correct_answer, 1)
  assert.equal(result[0].time_limit, 20)
})

test('rejects invalid AI output without truncating it', () => {
  const source = prepareKahootQuestions([{ ...question, options: ['a'.repeat(90), 'B', '', ''] }], false)
  assert.throws(() => applyKahootSuggestions(source, [0], []), /thiếu/)
  assert.throws(() => applyKahootSuggestions(source, [0], [{ ...source[0], options: ['a'.repeat(76), 'B', '', ''] }]), /75/)
  assert.throws(() => applyKahootSuggestions(source, [0], [{ ...source[0], options: ['B', 'B', '', ''] }]), /trùng/)
  assert.equal(source[0].options[0].length, 90)
})

test('restores saved export copy but discards it when originals or answer key change', () => {
  const source = prepareKahootQuestions([question])
  const saved = restoreKahootDraft(source)
  saved.questions[0].question = 'Bản rút gọn'
  assert.equal(restoreKahootDraft(source, saved).questions[0].question, 'Bản rút gọn')
  const changed = [{ ...source[0], correct_answer: 2 }]
  assert.equal(restoreKahootDraft(changed, saved).questions[0].question, source[0].question)
  const broken = { ...saved, questions: [{ ...saved.questions[0], correct_answer: 2 }] }
  assert.equal(restoreKahootDraft(source, broken).questions[0].correct_answer, 1)
})
