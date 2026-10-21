import type { LessonQuestionDTO } from '../types/oralQuiz'

export interface MockChapter {
  id: string
  title: string
  gradeCode: string
  lessonCount: number
  lessons: Array<{
    id: string
    title: string
    order?: number
  }>
}

export const MOCK_ORAL_CURRICULUM: MockChapter[] = [
  {
    id: 'ch_ls6_01',
    title: 'Chương 1: Tại sao cần học Lịch sử?',
    gradeCode: '6',
    lessonCount: 3,
    lessons: [
      { id: 'les_ls6_01', title: 'Lịch sử là gì?', order: 1 },
      { id: 'les_ls6_02', title: 'Thời gian trong lịch sử', order: 2 },
      { id: 'les_ls6_03', title: 'Nguồn gốc loài người', order: 3 },
    ],
  },
  {
    id: 'ch_ls6_02',
    title: 'Chương 2: Xã hội nguyên thuỷ',
    gradeCode: '6',
    lessonCount: 2,
    lessons: [
      { id: 'les_ls6_04', title: 'Xã hội nguyên thuỷ', order: 4 },
      { id: 'les_ls6_05', title: 'Sự chuyển biến xã hội nguyên thuỷ', order: 5 },
    ],
  },
  {
    id: 'ch_ls7_01',
    title: 'Chương 1: Tây Âu từ thế kỉ V đến nửa đầu thế kỉ XVI',
    gradeCode: '7',
    lessonCount: 2,
    lessons: [
      { id: 'les_ls7_01', title: 'Quá trình hình thành xã hội phong kiến ở Tây Âu', order: 1 },
      { id: 'les_ls7_02', title: 'Các cuộc phát kiến địa lí lớn', order: 2 },
    ],
  },
  {
    id: 'ch_ls8_01',
    title: 'Chương 1: Cách mạng tư sản từ giữa thế kỉ XVI đến đầu thế kỉ XX',
    gradeCode: '8',
    lessonCount: 2,
    lessons: [
      { id: 'les_ls8_01', title: 'Cách mạng tư sản Anh và chiến tranh giành độc lập 13 thuộc địa', order: 1 },
      { id: 'les_ls8_02', title: 'Cách mạng tư sản Pháp cuối thế kỉ XVIII', order: 2 },
    ],
  },
  {
    id: 'ch_ls9_01',
    title: 'Chương 1: Thế giới từ năm 1918 đến năm 1945',
    gradeCode: '9',
    lessonCount: 2,
    lessons: [
      { id: 'les_ls9_01', title: 'Nước Nga và Liên Xô từ năm 1918 đến năm 1945', order: 1 },
      { id: 'les_ls9_02', title: 'Châu Âu và nước Mỹ từ năm 1918 đến năm 1939', order: 2 },
    ],
  },
]

export const MOCK_ORAL_QUESTIONS: Record<string, LessonQuestionDTO[]> = {
  // Câu hỏi mẫu cho Bài 1 Lịch sử 6 (gồm câu 4 lựa chọn, câu 3 lựa chọn, câu 2 lựa chọn Đúng/Sai)
  les_ls6_01: [
    {
      id: 'q_ls6_01_1',
      questionText: 'Lịch sử là gì?',
      options: [
        'Những gì đã diễn ra trong quá khứ gắn liền với con người và xã hội',
        'Những câu chuyện truyền thuyết do người xưa tưởng tượng ra',
        'Những dự đoán về tương lai của nhân loại',
        'Toàn bộ các quy luật tự nhiên và vũ trụ',
      ],
      correctAnswer: 1,
      timeLimit: 30,
      difficulty: 'Nhận biết',
      stageTag: 'Khởi động / Bài cũ',
      explanation: 'Lịch sử là tất cả những gì đã xảy ra trong quá khứ, đặc biệt là quá khứ của loài người và xã hội loài người.',
    },
    {
      id: 'q_ls6_01_2',
      questionText: 'Tư liệu nào sau đây được xem là "Tư liệu gốc" có giá trị lịch sử xác thực nhất?',
      options: [
        'Bản thảo viết tay Lời kêu gọi Toàn quốc kháng chiến (1946)',
        'Truyền thuyết Thánh Gióng đánh giặc Ân',
        'Tiểu thuyết dã sử được viết lại sau 500 năm',
      ],
      correctAnswer: 1,
      timeLimit: 30,
      difficulty: 'Thông hiểu',
      stageTag: 'Kiểm tra miệng',
      explanation: 'Tư liệu gốc là tư liệu ra đời trực tiếp tại thời điểm diễn ra sự kiện, mang tính xác thực cao nhất.',
    },
    {
      id: 'q_ls6_01_3',
      questionText: 'Ý kiến sau đây là Đúng hay Sai: "Truyền thuyết và ca dao dân gian thuộc nguồn tư liệu hiện vật"?',
      options: [
        'Đúng (Tư liệu hiện vật)',
        'Sai (Thuộc tư liệu truyền miệng)',
      ],
      correctAnswer: 2,
      timeLimit: 20,
      difficulty: 'Nhận biết',
      stageTag: 'Kiểm tra nhanh',
      explanation: 'Truyền thuyết, cổ tích, ca dao thuộc nguồn tư liệu truyền miệng, không phải tư liệu hiện vật.',
    },
    {
      id: 'q_ls6_01_4',
      questionText: 'Vì sao chúng ta cần phải học môn Lịch sử?',
      options: [
        'Để biết cội nguồn tổ tiên, quê hương đất nước và đúc rút bài học kinh nghiệm',
        'Để học thuộc lòng các con số ngày tháng máy móc',
        'Để ghi nhớ tên các triều đại mà không cần hiểu bản chất',
        'Chỉ để phục vụ cho các kì thi',
      ],
      correctAnswer: 1,
      timeLimit: 30,
      difficulty: 'Vận dụng',
      stageTag: 'Trả bài',
      explanation: 'Học lịch sử giúp hiểu về cội nguồn dân tộc, sự tiến hóa của nhân loại và rút ra bài học cho hiện tại.',
    },
  ],

  // Câu hỏi mẫu cho Bài 2
  les_ls6_02: [
    {
      id: 'q_ls6_02_1',
      questionText: 'Âm lịch là hệ lịch được tính dựa theo chu kì chuyển động của vật thể nào?',
      options: [
        'Mặt Trăng quay quanh Trái Đất',
        'Trái Đất quay quanh Mặt Trời',
        'Mặt Trời quay quanh dải Ngân Hà',
      ],
      correctAnswer: 1,
      timeLimit: 30,
      difficulty: 'Thông hiểu',
      stageTag: 'Bài cũ',
      explanation: 'Âm lịch dựa trên chu kì chuyển động của Mặt Trăng quanh Trái Đất (tuần trăng).',
    },
    {
      id: 'q_ls6_02_2',
      questionText: 'Dương lịch (Công lịch) lấy năm được cho là chúa Giê-su ra đời làm năm số mấy?',
      options: ['Năm 0', 'Năm 1', 'Năm 100', 'Năm 1000'],
      correctAnswer: 2,
      timeLimit: 25,
      difficulty: 'Nhận biết',
      stageTag: 'Kiểm tra miệng',
      explanation: 'Công lịch lấy năm Chúa Giê-su ra đời làm năm thứ nhất (năm 1 Công nguyên), không có năm 0.',
    },
    {
      id: 'q_ls6_02_3',
      questionText: 'Một thế kỉ bằng bao nhiêu năm?',
      options: ['10 năm', '100 năm', '1000 năm'],
      correctAnswer: 2,
      timeLimit: 15,
      difficulty: 'Nhận biết',
      stageTag: 'Khởi động',
      explanation: '1 thập kỉ = 10 năm, 1 thế kỉ = 100 năm, 1 thiên niên kỉ = 1000 năm.',
    },
  ],

  // Mặc định câu hỏi chung cho các bài khác
  default: [
    {
      id: 'q_default_1',
      questionText: 'Khẳng định sau đây là Đúng hay Sai: "Học Lịch sử giúp hiểu rõ quá khứ để xây dựng hiện tại"?',
      options: ['Đúng', 'Sai'],
      correctAnswer: 1,
      timeLimit: 20,
      difficulty: 'Thông hiểu',
      stageTag: 'Trả bài miệng',
      explanation: 'Khẳng định hoàn toàn chính xác theo mục tiêu giáo dục môn Lịch sử.',
    },
    {
      id: 'q_default_2',
      questionText: 'Nguồn tư liệu nào sau đây bao gồm các di tích khảo cổ, đồ trang sức và vũ khí cổ?',
      options: [
        'Tư liệu chữ viết',
        'Tư liệu truyền miệng',
        'Tư liệu hiện vật',
      ],
      correctAnswer: 3,
      timeLimit: 30,
      difficulty: 'Thông hiểu',
      stageTag: 'Kiểm tra bài cũ',
      explanation: 'Di tích, đồ trang sức, đồ gốm, vũ khí... là những đồ vật cụ thể của người xưa để lại, thuộc tư liệu hiện vật.',
    },
    {
      id: 'q_default_3',
      questionText: 'Đặc điểm quan trọng nhất của tư liệu hiện vật là gì?',
      options: [
        'Luôn phản ánh cụ thể, khách quan đời sống của con người thời kì đó',
        'Được lưu truyền qua thơ ca truyền miệng',
        'Không bao giờ bị hư hỏng hay bào mòn theo thời gian',
        'Chỉ có ở các nước phương Tây',
      ],
      correctAnswer: 1,
      timeLimit: 30,
      difficulty: 'Vận dụng',
      stageTag: 'Trả bài',
      explanation: 'Tư liệu hiện vật là vật chứng khách quan giúp chúng ta hình dung sinh động đời sống vật chất và tinh thần của người xưa.',
    },
  ],
}

export function getMockQuestions(lessonId?: string, chapterId?: string): LessonQuestionDTO[] {
  if (lessonId && MOCK_ORAL_QUESTIONS[lessonId]) {
    return MOCK_ORAL_QUESTIONS[lessonId]
  }

  if (chapterId) {
    // Gộp câu hỏi của các bài trong chương
    const ch = MOCK_ORAL_CURRICULUM.find(c => c.id === chapterId)
    if (ch) {
      const all: LessonQuestionDTO[] = []
      ch.lessons.forEach(l => {
        if (MOCK_ORAL_QUESTIONS[l.id]) {
          all.push(...MOCK_ORAL_QUESTIONS[l.id])
        }
      })
      if (all.length > 0) return all
    }
  }

  // Fallback to default questions
  return MOCK_ORAL_QUESTIONS.default
}
