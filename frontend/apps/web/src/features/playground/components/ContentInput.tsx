'use client'

import { useState, useRef } from 'react'
import {
  Upload,
  FolderOpen,
  Users,
  FileText,
  Brain,
  Pencil,
  BookOpen,
  ChevronRight,
} from 'lucide-react'

const FEATURES = [
  {
    Icon: Users,
    title: 'Cấu hình lớp học',
    desc: 'Thiết lập mục tiêu, đối tượng học sinh và trình độ để AI cá nhân hóa nội dung phù hợp nhất.',
  },
  {
    Icon: FileText,
    title: 'Thiết lập bài giảng',
    desc: 'Tải tài liệu hoặc chọn bài từ SGK, AI sẽ nắm bắt cấu trúc và yêu cầu cốt lõi của bạn.',
  },
  {
    Icon: Brain,
    title: 'Hệ thống AI xử lý',
    desc: 'Công nghệ phân tích ngữ nghĩa tự động trích xuất kiến thức và soạn thảo kịch bản giảng dạy logic.',
  },
  {
    Icon: Pencil,
    title: 'Tùy ý chỉnh sửa',
    desc: 'Dễ dàng tinh chỉnh, thay đổi hoặc bổ sung chi tiết vào kịch bản trước khi đưa vào giảng dạy.',
  },
]

// SGK Data Structure
const SGK_DATA = {
  'Kết nối tri thức': {
    'Lịch sử & Địa lí 6': {
      subject: 'HISTORY',
      grade: 'GRADE_6',
      chapters: [
        {
          title: 'Chương 1: Vì sao phải học Lịch sử?',
          lessons: [
            'Bài 1: Lịch sử và cuộc sống',
            'Bài 2: Dựa vào đâu để biết và phục dựng lại lịch sử?',
            'Bài 3: Thời gian trong lịch sử',
          ],
        },
        {
          title: 'Chương 2: Xã hội nguyên thủy',
          lessons: [
            'Bài 4: Nguồn gốc loài người',
            'Bài 5: Xã hội nguyên thủy',
            'Bài 6: Sự chuyển biến và phân hoá của xã hội nguyên thủy',
          ],
        },
        {
          title: 'Chương 3: Xã hội cổ đại',
          lessons: [
            'Bài 7: Ai Cập và Lưỡng Hà cổ đại',
            'Bài 8: Ấn Độ cổ đại',
            'Bài 9: Trung Quốc từ thời cổ đại đến thế kỉ VII',
            'Bài 10: Hy Lạp và La Mã cổ đại',
          ],
        },
        {
          title: 'Chương 4: Đông Nam Á',
          lessons: [
            'Bài 11: Các quốc gia sơ kì ở Đông Nam Á',
            'Bài 12: Sự hình thành và bước đầu phát triển của các vương quốc phong kiến ở Đông Nam Á',
            'Bài 13: Giao lưu văn hoá ở Đông Nam Á',
          ],
        },
        {
          title: 'Chương 5: Việt Nam từ khoảng thế kỉ VII TCN đến đầu thế kỉ X',
          lessons: [
            'Bài 14: Nhà nước Văn Lang – Âu Lạc',
            'Bài 15: Chính sách cai trị của các triều đại phong kiến phương Bắc',
            'Bài 16: Các cuộc khởi nghĩa tiêu biểu giành độc lập',
            'Bài 17: Cuộc đấu tranh bảo tồn và phát triển văn hoá dân tộc của người Việt',
            'Bài 18: Bước ngoặt lịch sử đầu thế kỉ X',
          ],
        },
      ],
    },
  },
}

interface ClassroomCtx {
  duration?: number | string
  studentCount?: string
  learningSpace?: string
  [key: string]: unknown
}

interface ContentInputProps {
  onFileSelected: (file: File) => void
  onManualSubmit?: (text: string) => void
  classroomCtx: ClassroomCtx
  onConfigChange?: (ctx: ClassroomCtx) => void
  onOpenConfig?: () => void
  onViewDemo?: () => void
}

export default function ContentInput({
  onFileSelected,
  onManualSubmit,
  classroomCtx,
  onOpenConfig,
}: ContentInputProps) {
  const [activeTab, setActiveTab] = useState<'sgk' | 'upload'>('sgk')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // SGK picker state
  const [selectedBook, setSelectedBook] = useState<string>('Kết nối tri thức')
  const [selectedSubject, setSelectedSubject] = useState<string>('Lịch sử & Địa lí 6')
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelected(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFileSelected(file)
  }

  const handleGenFromSGK = () => {
    if (!selectedLesson) return
    const topic = selectedLesson
    if (onManualSubmit) onManualSubmit(topic)
  }

  const configSummary = (() => {
    const parts: string[] = []
    if (classroomCtx?.duration) parts.push(`${classroomCtx.duration} phút`)
    if (classroomCtx?.studentCount) {
      parts.push(
        classroomCtx.studentCount === '<=10' ? '≤10 HV'
          : classroomCtx.studentCount === '>30' ? '31+ HV'
          : '11–30 HV'
      )
    }
    if (classroomCtx?.learningSpace) {
      const spaceMap: Record<string, string> = { classroom: 'Lớp học', lab: 'Lab', outdoor: 'Ngoài trời', online: 'Online' }
      parts.push(spaceMap[classroomCtx.learningSpace] || '')
    }
    return parts.filter(Boolean)
  })()

  const hasConfig = configSummary.length > 0

  const bookData = SGK_DATA[selectedBook as keyof typeof SGK_DATA]
  const subjectData = bookData?.[selectedSubject as keyof typeof bookData]
  const chapters = subjectData?.chapters || []

  return (
    <div className="space-y-5">
      {/* ── Tab Switcher ── */}
      <div className="stage-enter delay-0 flex gap-2 p-1 bg-[var(--color-neutral-100)] rounded-[var(--radius-xl)] w-full max-w-sm mx-auto">
        <button
          onClick={() => setActiveTab('sgk')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-[var(--radius-lg)] font-body font-bold text-sm transition-all duration-200
            ${activeTab === 'sgk'
              ? 'bg-white text-[var(--color-primary-600)] shadow-sm'
              : 'text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]'
            }`}
        >
          <BookOpen className="w-4 h-4" />
          Chọn từ SGK
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-[var(--radius-lg)] font-body font-bold text-sm transition-all duration-200
            ${activeTab === 'upload'
              ? 'bg-white text-[var(--color-primary-600)] shadow-sm'
              : 'text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]'
            }`}
        >
          <Upload className="w-4 h-4" />
          Upload file
        </button>
      </div>

      {/* ── Tab: Chọn từ SGK ── */}
      {activeTab === 'sgk' && (
        <div className="stage-enter rounded-[var(--radius-2xl)] border border-[var(--color-neutral-200)] bg-white p-6 space-y-5">
          {/* Step 1: Chọn bộ sách */}
          <div>
            <p className="font-body text-xs font-semibold text-[var(--color-neutral-500)] uppercase tracking-wider mb-2">Bộ sách giáo khoa</p>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(SGK_DATA).map((book) => (
                <button
                  key={book}
                  onClick={() => { setSelectedBook(book); setSelectedSubject(''); setSelectedChapter(null); setSelectedLesson(null) }}
                  className={`px-4 py-2 rounded-[var(--radius-md)] font-body font-semibold text-sm border transition-all duration-150
                    ${selectedBook === book
                      ? 'bg-[var(--color-primary-500)] text-white border-[var(--color-primary-500)]'
                      : 'bg-white text-[var(--color-neutral-700)] border-[var(--color-neutral-300)] hover:border-[var(--color-primary-400)]'
                    }`}
                >
                  {book}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Chọn môn */}
          {selectedBook && (
            <div>
              <p className="font-body text-xs font-semibold text-[var(--color-neutral-500)] uppercase tracking-wider mb-2">Môn học</p>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(SGK_DATA[selectedBook as keyof typeof SGK_DATA] || {}).map((subj) => (
                  <button
                    key={subj}
                    onClick={() => { setSelectedSubject(subj); setSelectedChapter(null); setSelectedLesson(null) }}
                    className={`px-4 py-2 rounded-[var(--radius-md)] font-body font-semibold text-sm border transition-all duration-150
                      ${selectedSubject === subj
                        ? 'bg-[var(--color-primary-500)] text-white border-[var(--color-primary-500)]'
                        : 'bg-white text-[var(--color-neutral-700)] border-[var(--color-neutral-300)] hover:border-[var(--color-primary-400)]'
                      }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Chọn chương */}
          {selectedSubject && chapters.length > 0 && (
            <div>
              <p className="font-body text-xs font-semibold text-[var(--color-neutral-500)] uppercase tracking-wider mb-2">Chương</p>
              <div className="space-y-1.5">
                {chapters.map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedChapter(idx); setSelectedLesson(null) }}
                    className={`w-full text-left px-4 py-2.5 rounded-[var(--radius-md)] font-body text-sm border flex items-center justify-between transition-all duration-150
                      ${selectedChapter === idx
                        ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] border-[var(--color-primary-300)] font-semibold'
                        : 'bg-white text-[var(--color-neutral-700)] border-[var(--color-neutral-200)] hover:border-[var(--color-primary-300)]'
                      }`}
                  >
                    {ch.title}
                    <ChevronRight className="w-4 h-4 opacity-50 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Chọn bài */}
          {selectedChapter !== null && chapters[selectedChapter] && (
            <div>
              <p className="font-body text-xs font-semibold text-[var(--color-neutral-500)] uppercase tracking-wider mb-2">Bài học</p>
              <div className="space-y-1.5">
                {chapters[selectedChapter].lessons.map((lesson, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left px-4 py-2.5 rounded-[var(--radius-md)] font-body text-sm border flex items-center gap-3 transition-all duration-150
                      ${selectedLesson === lesson
                        ? 'bg-[var(--color-secondary-50)] text-[var(--color-secondary-700)] border-[var(--color-secondary-400)] font-semibold'
                        : 'bg-white text-[var(--color-neutral-700)] border-[var(--color-neutral-200)] hover:border-[var(--color-secondary-300)]'
                      }`}
                  >
                    <span className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                      border-[var(--color-secondary-400)]">
                      {selectedLesson === lesson && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-secondary-500)]" />
                      )}
                    </span>
                    {lesson}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onOpenConfig?.()}
              className={`font-body relative px-5 py-2.5 rounded-[var(--radius-md)] font-bold text-sm flex items-center gap-2 transition-all duration-150 active:scale-95
                ${hasConfig
                  ? 'bg-[var(--color-primary-500)] text-white shadow-lg shadow-[var(--color-primary-500)]/30 hover:bg-[var(--color-primary-400)]'
                  : 'bg-[var(--color-secondary-500)] text-white shadow-lg shadow-[var(--color-secondary-500)]/30 hover:bg-[var(--color-secondary-400)]'
                }`}
            >
              {!hasConfig && (
                <span className="absolute inset-0 rounded-[var(--radius-md)] animate-ping bg-[var(--color-secondary-500)]/30 pointer-events-none" />
              )}
              <Users className="w-4 h-4" />
              {hasConfig ? `✓ ${configSummary.join(' · ')}` : 'Cấu hình lớp học'}
            </button>

            <button
              onClick={handleGenFromSGK}
              disabled={!selectedLesson}
              className={`font-body flex-1 px-6 py-2.5 rounded-[var(--radius-md)] font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 active:scale-95
                ${selectedLesson
                  ? 'bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] text-white shadow-lg shadow-[var(--color-primary-500)]/30 hover:opacity-90'
                  : 'bg-[var(--color-neutral-200)] text-[var(--color-neutral-400)] cursor-not-allowed'
                }`}
            >
              <Brain className="w-4 h-4" />
              {selectedLesson ? `Tạo giáo án: ${selectedLesson.split(':')[0]}` : 'Chọn bài để tạo giáo án'}
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Upload file ── */}
      {activeTab === 'upload' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`stage-enter relative overflow-hidden group rounded-[var(--radius-2xl)] border-2 border-dashed transition-all duration-300 p-12 flex flex-col items-center justify-center min-h-[280px] cursor-pointer
            ${isDragging
              ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] scale-[1.005]'
              : 'border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] hover:border-[var(--color-primary-400)] hover:bg-[var(--color-primary-50)]'
            }`}
        >
          <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[var(--color-primary-500)]/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[var(--color-tertiary-500)]/5 blur-3xl" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className={`w-16 h-16 bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] text-white rounded-[var(--radius-xl)] flex items-center justify-center mb-4 shadow-lg shadow-[var(--color-primary-500)]/25 transition-transform duration-300 ${isDragging ? 'scale-110 rotate-3' : 'group-hover:scale-110'}`}>
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="font-header text-xl font-extrabold uppercase tracking-tight text-[var(--color-neutral-900)] mb-1">
              {isDragging ? 'Thả tệp tại đây!' : 'Tải tài liệu lên'}
            </h3>
            <p className="font-body text-[var(--color-neutral-600)] text-xs mb-1 leading-relaxed">
              Kéo và thả tệp vào đây, hoặc nhấn để duyệt từ máy tính của bạn
            </p>
            <div className="flex gap-2 mb-8">
              {['PDF', 'Word', 'TXT', 'MD'].map((fmt) => (
                <span key={fmt} className="px-2.5 py-0.5 bg-white/80 border border-[var(--color-neutral-300)] rounded-[var(--radius-full)] text-[10px] font-mono font-bold text-[var(--color-neutral-700)] shadow-sm">
                  {fmt}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="font-body bg-white text-[var(--color-primary-500)] border-2 border-[var(--color-primary-500)] px-6 py-2.5 rounded-[var(--radius-md)] font-bold text-sm shadow-md shadow-[var(--color-primary-500)]/10 hover:bg-[var(--color-primary-50)] active:scale-95 transition-all duration-150 flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Chọn tệp tin
              </button>
              <button
                onClick={() => onOpenConfig?.()}
                className={`font-body relative px-5 py-2.5 rounded-[var(--radius-md)] font-bold text-sm flex items-center gap-2 transition-all duration-150 active:scale-95
                  ${hasConfig
                    ? 'bg-[var(--color-primary-500)] text-white shadow-lg shadow-[var(--color-primary-500)]/30 hover:bg-[var(--color-primary-400)]'
                    : 'bg-[var(--color-secondary-500)] text-white shadow-lg shadow-[var(--color-secondary-500)]/30 hover:bg-[var(--color-secondary-400)]'
                  }`}
              >
                {!hasConfig && (
                  <span className="absolute inset-0 rounded-[var(--radius-md)] animate-ping bg-[var(--color-secondary-500)]/30 pointer-events-none" />
                )}
                <Users className="w-4 h-4" />
                Cấu hình lớp học
              </button>
            </div>
            <input ref={fileInputRef} accept=".pdf,.doc,.docx,.txt,.md" className="hidden" type="file" onChange={handleFileChange} />
          </div>
          {hasConfig && (
            <div className="absolute top-4 right-4 flex gap-1.5 flex-wrap justify-end max-w-[200px]">
              {configSummary.map((s, i) => (
                <span key={i} className="font-mono px-2 py-0.5 bg-[var(--color-primary-100)] border border-[var(--color-primary-200)] rounded-[var(--radius-full)] text-[10px] font-bold text-[var(--color-primary-700)]">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Feature cols ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stage-enter delay-80">
        {FEATURES.map(({ Icon, title, desc }, i) => (
          <div key={i} className="group p-4 rounded-[var(--radius-lg)] bg-white border border-[var(--color-neutral-200)] shadow-sm hover:border-[var(--color-primary-300)] hover:shadow-md transition-all duration-200 cursor-default">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-primary-100)] flex items-center justify-center mb-3 group-hover:bg-[var(--color-primary-500)] transition-colors duration-200">
              <Icon className="w-4 h-4 text-[var(--color-primary-500)] group-hover:text-white transition-colors duration-200" />
            </div>
            <h4 className="font-body font-bold text-sm text-[var(--color-neutral-900)] mb-1">{title}</h4>
            <p className="font-body text-[11px] text-[var(--color-neutral-500)] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
