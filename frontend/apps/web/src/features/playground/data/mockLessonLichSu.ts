import type { TimelineStep } from '@/lib/services/pipelineService'
import type { LessonMeta } from '../types/lessonMeta'

export const MOCK_LESSON_META_LICHSU: LessonMeta = {
  lessonNumber: 'Bài 1',
  lessonTitle: 'Lịch sử là gì?',
  chapter: 'Chương I: Tại sao cần học Lịch sử? (SGK Lịch sử và Địa lí 6)',
  learningOutcomes: [
    'Nêu được khái niệm lịch sử và môn Lịch sử.',
    'Hiểu được lịch sử là những gì đã diễn ra trong quá khứ.',
    'Giải thích được vì sao cần thiết phải học môn Lịch sử.',
    'Phân biệt được các nguồn sử liệu cơ bản, ý nghĩa và giá trị của các nguồn sử liệu.',
  ],
  teachingMethods: [
    'Dạy học trực quan kết hợp Vấn đáp gợi mở & Giảng giải',
  ],
  methodDetails: [
    {
      name: 'Dạy học trực quan qua tư liệu và hiện vật thực tế',
      type: 'INQUIRY_BASED',
      description:
        'Sử dụng các ví dụ trực quan đời thực, tranh ảnh đối chiếu và hiện vật lịch sử cụ thể (ảnh phố cổ xưa - nay, lễ hội Đền Hùng, bia tiến sĩ, bản thảo gốc) làm điểm tựa nhận thức mở đầu cho từng đơn vị kiến thức.',
      steps: [
        'Bước 1: Trình chiếu hoặc giới thiệu tư liệu hình ảnh và hiện vật trực quan.',
        'Bước 2: Hướng dẫn học sinh quan sát các chi tiết nổi bật và sự khác biệt.',
      ],
    },
    {
      name: 'Vấn đáp gợi mở & Giảng giải chi tiết',
      type: 'GENERAL_FLOW',
      description:
        'Điều hướng nội dung bằng chuỗi câu hỏi dẫn dắt từ trực quan đến bản chất; sau đó giáo viên giảng giải cặn kẽ, tháo gỡ điểm học sinh hay nhầm lẫn và chuẩn hóa kiến thức cốt lõi vào vở.',
      steps: [
        'Bước 1: Đặt câu hỏi bản lề gợi mở để học sinh tự suy nghĩ và đối thoại.',
        'Bước 2: Giáo viên phân tích sâu, giải thích rõ ràng và chuẩn hóa kiến thức.',
      ],
    },
  ],
  teachingTools: [
    {
      name: 'Slide 4 cặp hình ảnh đồ vật đời sống xưa & nay (Trò chơi phản xạ Xưa - Nay)',
      purpose: 'Chiếu lướt nhanh cho học sinh phản xạ phân biệt Xưa - Nay trong 3 phút, khuấy động không khí đầu giờ mà không bắt phân tích mổ xẻ.',
    },
    {
      name: 'Máy chiếu & Slide tư liệu trực quan (Ảnh phố cổ, Văn Miếu, Bản thảo 1946...)',
      purpose: 'Chiếu hình ảnh hiện vật, tư liệu lịch sử phóng to rõ nét phục vụ quan sát và vấn đáp tương tác.',
    },
    {
      name: 'SGK Lịch sử và Địa lí 6 (Bài 1)',
      purpose: 'Học sinh đối chiếu các đoạn tư liệu trích dẫn và quan sát hình ảnh in trong bài học.',
    },
    {
      name: 'Vở ghi bài & Bảng lớp chuẩn hóa kiến thức',
      purpose: 'Ghi lại các ý đúc kết cốt lõi sau mỗi phần giảng giải chi tiết của giáo viên.',
    },
  ],
}

export const MOCK_STEPS_LICHSU: TimelineStep[] = [
  {
    time: 'Phần 1',
    title: 'Khởi động: Trò chơi phản xạ "Xưa hay Nay?" (Gợi mở về Quá khứ)',
    duration: "5'",
    type: 'Khởi động',
    nodeTypeCode: '4-node_khoi_dong',
    intent: 'Tạo không khí sôi nổi, gợi nhu cầu tìm hiểu về quá khứ qua trải nghiệm thực tế ngắn mà không hỏi phân tích (dành khâu phân tích cho học sinh tự quy nạp ở Phần 2)',
    pedagogNote: [
      'Slide trình chiếu 4 cặp hình ảnh đồ vật Xưa - Nay (Quạt nan vs Máy lạnh, Bếp củi vs Bếp từ, Đèn dầu vs Đèn điện...)',
      'Đồng hồ đếm ngược phản xạ 60 giây',
    ],
    details: [
      'Bước 1 (Luật chơi nhanh 2 phút): Giáo viên chiếu lướt 4 cặp hình ảnh đồ vật đời sống xưa - nay, học sinh phản xạ nhanh hô to "Xưa" hay "Nay" trong 5 giây mỗi hình.',
      'Bước 2 (Kết nối thực tế 1 phút): Thử thách nhanh: "Trong nhà em có món đồ nào từ thời ông bà còn giữ lại không?" (1-2 học sinh chia sẻ nhanh 1 câu, không phân tích mổ xẻ).',
      'Bước 3 (Bắc cầu mượt mà vào bài): Giáo viên chuyển tiếp ngắn gọn: "Mỗi đồ vật đều mang theo câu chuyện quá khứ. Vậy làm sao biết chính xác quá khứ đã diễn ra thế nào? Cùng khám phá các nguồn tư liệu sau!"',
    ],
    originalContent: 'Trò chơi phản xạ nhanh 3 phút: Xưa hay Nay? Khơi gợi cảm xúc về quá khứ mà không trùng lặp chức năng hỏi gợi mở với phần sau.',
    warningContext: '',
    appliedActivity: 'Trò chơi phản xạ nhanh (Xưa hay Nay?) — Tạo cảm xúc & gợi nhu cầu, không hỏi phân tích',
    nodePayload: {
      game_name: 'Trò chơi phản xạ: "Xưa hay Nay? (Tìm đồ vật thời ông bà)"',
      visual_action:
        '• Giáo viên chiếu lướt nhanh 4 cặp hình ảnh đồ vật quen thuộc: Quạt nan vs Máy lạnh, Bếp củi vs Bếp từ, Đèn dầu vs Đèn điện.\n• Học sinh quan sát nhanh trong 5 giây mỗi hình và đồng thanh hô "Xưa" hay "Nay"!',
      quick_connection:
        'Thử thách kết nối 60 giây: "Em hãy kể tên 1 đồ vật trong nhà mình được giữ lại từ thời ông bà?" (Học sinh kể nhanh: chiếc quạt cũ, cuốn gia phả, bức ảnh ố vàng... GV chỉ lắng nghe và tạo không khí vui tươi, không phân tích mổ xẻ).',
      conclusion:
        'Không khí lớp học rất sôi nổi! Mỗi đồ vật từ thời ông bà đều là một chứng tích sống động kể lại câu chuyện của quá khứ.',
      bridge_question:
        '"Thầy/cô mời các em cùng quan sát các tư liệu lịch sử sau đây để tự tìm ra câu trả lời!"',
    },
  },
  {
    time: 'Phần 2',
    title: 'Hình thành kiến thức: Khám phá khái niệm & 4 nguồn sử liệu',
    duration: "20'",
    type: 'Hình thành kiến thức',
    nodeTypeCode: '4-node_hinh_thanh',
    intent: 'Học sinh quan sát tư liệu cụ thể, tự đối chiếu phát hiện bản chất và cùng giáo viên quy nạp thành kiến thức chuẩn',
    teachingMethod: 'Dạy học Quy nạp (Inductive) qua Tư liệu trực quan & Vấn đáp gợi mở',
    appliedActivity: 'Quy nạp từ tư liệu cụ thể: Quan sát ngữ liệu ➔ Tự phát hiện quy luật ➔ Khái quát hóa kiến thức',
    pedagogNote: [
      'Máy chiếu & Slide tư liệu: Ảnh phố cổ xưa - nay, Đại lễ Giỗ Tổ Hùng Vương, Bộ 4 nguồn sử liệu (Bia Tiến sĩ, Bản thảo 19-12-1946, Rìu Đông Sơn, Thánh Gióng)',
      'SGK Lịch sử và Địa lí 6 (Bài 1)',
      'Vở ghi học sinh để chuẩn hóa kiến thức cốt lõi',
    ],
    details: [
      'Bước 1 (Ngữ liệu cụ thể): Giáo viên trình chiếu ví dụ/tư liệu thực tế cho học sinh quan sát và đối chiếu trước.',
      'Bước 2 (So sánh & Điều hướng): Đặt chuỗi câu hỏi gợi mở để học sinh tự so sánh, thảo luận và tìm ra điểm chung bản chất.',
      'Bước 3 (Khái quát hóa & Chuẩn hóa): Học sinh tự phát biểu quy luật; Giáo viên giải thích cặn kẽ và chốt kiến thức vào vở.',
    ],
    originalContent: 'Khái niệm Lịch sử, ý nghĩa việc học lịch sử và 4 nguồn sử liệu chính.',
    warningContext: '',
    nodePayload: {
      pedagogical_approach: 'INDUCTIVE',
      approach_label: 'Con đường 2: Quy nạp (Inductive) — Đi từ cụ thể đến khái quát',
      approach_description: 'Học sinh quan sát ngữ liệu thực tế trước ➔ Tự so sánh, đối chiếu và tìm ra điểm chung ➔ Giáo viên giải thích cặn kẽ và chuẩn hóa thành kiến thức cốt lõi.',
      knowledge_units: [
        {
          unit_title: 'Lịch sử và Môn Lịch sử',
          visual_example: {
            title: 'Ví dụ trực quan (Hiện vật / Hình ảnh)',
            item: 'Ảnh đối chiếu: Phố Hàng Đào năm 1900 vs Phố Hàng Đào năm 2024',
            description:
              'Giáo viên chiếu bức ảnh một khu phố cổ Hà Nội thời xưa (thế kỷ XIX) đặt cạnh bức ảnh chính góc phố đó hiện nay (nhà cao tầng, xe máy, ô tô tấp nập) để học sinh đối chiếu sự khác biệt.',
          },
          content_navigation: {
            title: 'Cách điều hướng nội dung (Câu hỏi gợi mở & dẫn dắt)',
            guiding_tip:
              'Dẫn dắt học sinh đi từ sự biến đổi trực quan trước mắt ➔ nhận ra mọi sự vật quanh ta đều có quá khứ ➔ việc tìm hiểu quá khứ đó chính là môn Lịch sử.',
            questions: [
              'Quan sát hai bức ảnh, các em thấy con người, cảnh vật và đường phố đã thay đổi như thế nào sau hơn 100 năm?',
              'Tất cả những sự kiện, biến đổi và hoạt động của con người đã diễn ra trong khoảng thời gian đó được gọi chung là gì?',
              'Nếu không có ai nghiên cứu hay ghi chép lại, liệu hôm nay chúng ta có biết được ông bà tổ tiên từng sống như thế nào không?',
            ],
          },
          teacher_explanation:
            'GV giải thích rất rõ: Lịch sử không phải chuyện xa vời, mà là tất cả những gì đã xảy ra trong quá khứ gắn với con người. GV phân biệt rành mạch hai khái niệm dễ nhầm: (1) "Hiện thực lịch sử" là những gì đã xảy ra hoàn toàn khách quan, không thể thay đổi; (2) "Nhận thức lịch sử / Môn Lịch sử" là sự hiểu biết, phục dựng của con người về quá khứ qua tư liệu.',
          core_content:
            '• Lịch sử: Là toàn bộ những gì đã diễn ra trong quá khứ, bao gồm mọi hoạt động của con người từ khi xuất hiện đến nay.\n• Môn Lịch sử: Là môn khoa học tìm hiểu và phục dựng lại quá trình phát triển của xã hội loài người trong quá khứ.',
          teacher_delivery:
            'GV phân biệt rõ cho HS: "Hiện thực lịch sử" (đã xảy ra khách quan, không thể thay đổi) và "Nhận thức lịch sử" (sự hiểu biết của con người về quá khứ qua học tập, nghiên cứu).',
          checkpoint_question:
            'Một sự kiện xảy ra ngày hôm qua có được coi là lịch sử không? Em hãy nêu một ví dụ cụ thể về lịch sử của bản thân hoặc gia đình.',
        },
        {
          unit_title: 'Vì sao cần phải học Lịch sử?',
          visual_example: {
            title: 'Ví dụ trực quan (Hình ảnh & Lời trích)',
            item: 'Ảnh Đại lễ Giỗ Tổ Hùng Vương & Trích lục thơ Bác Hồ (1942)',
            description:
              'Chiếu hình ảnh Lễ Giỗ Tổ Hùng Vương tại Phú Thọ với hàng vạn đồng bào hành hương, kèm hai câu thơ nổi tiếng của Chủ tịch Hồ Chí Minh: "Dân ta phải biết sử ta / Cho tường gốc tích nước nhà Việt Nam".',
          },
          content_navigation: {
            title: 'Cách điều hướng nội dung (Câu hỏi gợi mở & dẫn dắt)',
            guiding_tip:
              'Điều hướng học sinh từ ngày lễ truyền thống quen thuộc trong đời sống ➔ hiểu được nhu cầu thiêng liêng về cội nguồn ➔ từ đó mở rộng sang bài học kinh nghiệm cho tương lai.',
            questions: [
              'Hằng năm vào ngày mùng 10 tháng 3 âm lịch, vì sao hàng triệu người Việt Nam từ khắp nơi lại cùng hướng về Đền Hùng?',
              'Hai chữ "gốc tích" mà Bác Hồ căn dặn ở đây có nghĩa là gì?',
              'Nếu một người hoàn toàn không biết nguồn gốc tổ tiên hay lịch sử dân tộc mình thì sẽ ra sao?',
            ],
          },
          teacher_explanation:
            'GV giải thích sâu sắc và dễ hiểu: Học lịch sử có 2 ý nghĩa then chốt: (1) Biết cội nguồn tổ tiên, quê hương đất nước, hiểu công lao cha ông đã đổ máu xương dựng xây; (2) Rút ra bài học kinh nghiệm của quá khứ (đoàn kết thì thắng, chia rẽ thì bại...) để vận dụng phục vụ cho hiện tại và xây dựng tương lai ("Lịch sử là thầy dạy của cuộc sống").',
          core_content:
            '• Học Lịch sử giúp ta biết được cội nguồn tổ tiên, quê hương, đất nước; hiểu được quá trình lao động, đấu tranh giữ nước của cha ông.\n• Rút ra những bài học kinh nghiệm quý báu của quá khứ để phục vụ cho hiện tại và tương lai.',
          teacher_delivery:
            'Trích dẫn câu thơ của Chủ tịch Hồ Chí Minh và triết gia Cicero ("Lịch sử là thầy dạy của cuộc sống") để HS thảo luận về từ "gốc tích".',
          checkpoint_question:
            'Có ý kiến cho rằng: "Lịch sử là những gì đã qua, không thể thay đổi nên không cần học". Em có đồng ý không? Vì sao?',
        },
        {
          unit_title: 'Khám phá quá khứ từ 4 nguồn sử liệu',
          visual_example: {
            title: 'Ví dụ trực quan (Bộ 4 tư liệu thực tế đại diện)',
            item: 'Bộ 4 hình ảnh tư liệu cụ thể đại diện cho 4 loại sử liệu',
            description:
              'Chiếu đồng thời 4 tư liệu tiêu biểu lên màn hình: (1) Tranh vẽ truyền thuyết Thánh Gióng; (2) Bia Tiến sĩ tại Văn Miếu - Quốc Tử Giám; (3) Rìu gót vuông bằng đồng thời Đông Sơn; (4) Bản thảo viết tay Lời kêu gọi Toàn quốc kháng chiến của Bác Hồ (19-12-1946).',
          },
          content_navigation: {
            title: 'Cách điều hướng nội dung (Câu hỏi gợi mở & dẫn dắt)',
            guiding_tip:
              'Điều hướng học sinh quan sát từ hình thức bên ngoài của từng hiện vật ➔ tự sắp xếp vào 4 nhóm ➔ tự rút ra nhận xét về độ tin cậy vượt trội của tư liệu gốc.',
            questions: [
              'Quá khứ không còn lặp lại, vậy nhà sử học dựa vào đâu để biết chính xác những gì đã xảy ra?',
              'Quan sát 4 hình ảnh trên: Hình nào là chuyện kể dân gian truyền miệng? Hình nào là chữ viết khắc trên đá? Hình nào là hiện vật đào được dưới đất? Và hình nào do chính Bác Hồ viết ngay tại ngày diễn ra sự kiện?',
              'Nếu có hai thông tin trái ngược nhau về ngày 19-12-1946, em sẽ tin vào lời kể truyền miệng hay tin vào bản thảo viết tay của Bác Hồ? Vì sao?',
            ],
          },
          teacher_explanation:
            'GV giải thích cặn kẽ đặc điểm của từng nguồn:\n1. Tư liệu truyền miệng (thần thoại, truyền thuyết: phản ánh ước mơ nhưng có yếu tố hoang đường)\n2. Tư liệu hiện vật (vũ khí, đồ gốm: dấu tích vật chất khách quan không biết nói dối, nhưng cần thẩm định)\n3. Tư liệu chữ viết (sách sử, bia đá: ghi chép rõ ràng nhưng có thể mang ý chí chủ quan của người viết)\n4. Tư liệu gốc (ra đời đúng thời điểm sự kiện: có giá trị lịch sử chân thực và xác thực cao nhất)',
          core_content:
            'Có 4 nguồn sử liệu cơ bản để tìm hiểu lịch sử:\n1. Tư liệu truyền miệng: Truyền thuyết, ca dao, thần thoại...\n2. Tư liệu hiện vật: Di tích, di vật, đồ đồng, vũ khí cổ...\n3. Tư liệu chữ viết: Bản khắc đá, sách cổ, văn kiện...\n4. Tư liệu gốc: Ra đời ngay tại thời điểm diễn ra sự kiện, có giá trị xác thực cao nhất.\n\n* Lời kết: Lịch sử là tấm gương phản chiếu quá khứ để soi đường cho tương lai. Để dựng lại lịch sử một cách trung thực và khách quan nhất, chúng ta phải luôn dựa vào các nguồn sử liệu đáng tin cậy, đặc biệt là tư liệu gốc.',
          teacher_delivery:
            'Tổ chức thử thách ghép đôi: Chiếu các hiện vật thực tế lên bảng và yêu cầu học sinh phân loại đúng vào 4 nhóm sử liệu.',
          checkpoint_question:
            'Tại sao tư liệu gốc lại có giá trị lịch sử xác thực và đáng tin cậy nhất so với các nguồn tư liệu khác?',
        },
      ],
    },
  },
  {
    time: 'Phần 3',
    title: 'Luyện tập: Bộ câu hỏi củng cố & Đánh giá năng lực',
    duration: "12'",
    type: 'Luyện tập',
    nodeTypeCode: '4-node_luyen_tap',
    intent: 'Củng cố kiến thức đã học, rèn luyện tư duy phân biệt và đánh giá sử liệu',
    teachingMethod: 'Vấn đáp, Trắc nghiệm đánh giá nhanh & Giải thích',
    pedagogNote: [
      'Phiếu bài tập cá nhân / Bảng trả lời A-B-C-D',
      'Đồng hồ đếm ngược 60 giây cho mỗi câu hỏi',
    ],
    details: [
      'Bước 1: Giáo viên lần lượt đưa ra các câu hỏi luyện tập phân theo 4 mức độ nhận thức.',
      'Bước 2: Học sinh suy nghĩ cá nhân, chọn đáp án và ghi ngắn gọn lý do giải thích.',
      'Bước 3: GV giải thích chi tiết, đối chiếu với kiến thức bài học và biểu dương học sinh trả lời đúng.',
    ],
    originalContent: 'Hệ thống câu hỏi ôn tập theo chuẩn ma trận nhận thức.',
    warningContext: '',
    appliedActivity: 'Đố vui lịch sử & Thử tài thẩm định',
    nodePayload: {
      exercises: [
        {
          question: 'Lịch sử là gì? Môn Lịch sử tìm hiểu về điều gì?',
          level: 'nhan_biet',
          format: 'Tự luận ngắn',
          answer:
            'Lịch sử là những gì đã xảy ra trong quá khứ, bao gồm mọi hoạt động của con người từ khi xuất hiện đến nay. Môn Lịch sử là môn khoa học tìm hiểu về lịch sử loài người.',
        },
        {
          question:
            'Truyền thuyết Thánh Gióng hay sự tích Bánh chưng bánh giầy thuộc nguồn sử liệu nào sau đây?',
          level: 'thong_hieu',
          format: 'Trắc nghiệm / Phân loại',
          answer:
            'Thuộc nguồn tư liệu truyền miệng (được kể lại và lưu truyền qua nhiều thế hệ trước khi có chữ viết ghi chép lại).',
        },
        {
          question:
            'Bản thảo viết tay "Lời kêu gọi Toàn quốc kháng chiến" của Bác Hồ (19-12-1946) thuộc loại sử liệu nào? Vì sao nó có giá trị lịch sử đặc biệt quan trọng?',
          level: 'van_dung_thap',
          format: 'Giải thích',
          answer:
            'Là tư liệu gốc, vì nó ra đời ngay tại thời điểm diễn ra sự kiện lịch sử và phản ánh trực tiếp, chân thực nhất sự kiện đó mà không bị sai lệch qua lời kể.',
        },
        {
          question:
            'Nếu một cuốn sách lịch sử xuất bản năm 2020 và một văn bia khắc từ thời vua Lê Thánh Tông (thế kỉ XV) có nội dung mâu thuẫn về cùng một trận đánh, nhà nghiên cứu cần ưu tiên kiểm chứng nguồn nào? Vì sao?',
          level: 'van_dung_cao',
          format: 'Tư duy phản biện',
          answer:
            'Cần ưu tiên xem xét văn bia thế kỉ XV vì đó là tư liệu gần với thời điểm diễn ra sự kiện (hoặc là tư liệu gốc). Tuy nhiên, nhà nghiên cứu vẫn cần đối chiếu thêm với các nguồn sử liệu độc lập khác để tránh tính chủ quan của người soạn văn bia thời đó.',
        },
      ],
    },
  },
  {
    time: 'Phần 4',
    title: 'Vận dụng: Dự án bảo tồn di tích Cửa Bắc (1882)',
    duration: "8'",
    type: 'Vận dụng',
    nodeTypeCode: '4-node_van_dung',
    intent: 'Vận dụng ý nghĩa của việc học lịch sử và giá trị nguồn sử liệu vào tình huống bảo tồn thực tiễn',
    teachingMethod: 'Dự án đóng vai & Xử lý tình huống tranh biện',
    pedagogNote: [
      'Hình ảnh tư liệu vết đạn pháo trên tường thành Cửa Bắc (Hà Nội, 1882)',
      'Phiếu đóng vai "Nhà bảo tồn di sản"',
    ],
    details: [
      'Bước 1: Giáo viên nêu tình huống thực tế về việc trùng tu mặt thành Cửa Bắc.',
      'Bước 2: Học sinh đóng vai nhà bảo tồn di sản, thảo luận và viết đoạn văn trình bày quan điểm.',
      'Bước 3: GV tổng kết bài học, khơi gợi lòng tự hào và giao bài tập tìm hiểu di tích địa phương về nhà.',
    ],
    originalContent: 'Nhiệm vụ vận dụng thực tế về bảo tồn dấu tích lịch sử.',
    warningContext: '',
    appliedActivity: 'Đóng vai nhà bảo tồn di sản',
    nodePayload: {
      scenario:
        'Cửa Bắc là một công trình kiến trúc cổ nằm trên phố Phan Đình Phùng (Hà Nội). Trên tường thành hiện vẫn còn nguyên dấu vết lõm của viên đạn pháo do thực dân Pháp bắn khi đánh chiếm thành Hà Nội năm 1882. Có ý kiến cho rằng nên trát phẳng lại tường thành cho mới đẹp khi trùng tu.',
      task_requirement:
        'Em có đồng ý với ý kiến xoá đi vết đạn pháo đó không? Hãy viết một đoạn văn ngắn (5 - 7 câu) nêu rõ quan điểm của em và vận dụng bài học về "nguồn sử liệu", "ý nghĩa lịch sử" để bảo vệ quan điểm đó.',
      expected_output_form:
        'Đoạn văn ngắn trình bày trên phiếu bài tập hoặc phát biểu tranh biện trước lớp trong 2 phút.',
      rubric: [
        {
          criterion: 'Xác định quan điểm rõ ràng',
          description:
            'Thể hiện rõ lập trường (đồng ý hoặc không đồng ý việc xóa vết đạn pháo) ngay từ câu mở đoạn.',
        },
        {
          criterion: 'Vận dụng kiến thức sử liệu',
          description:
            'Giải thích được vết đạn pháo là tư liệu hiện vật quý báu, là minh chứng lịch sử chân thực về tội ác xâm lược của thực dân và tinh thần chiến đấu kiên cường của quân dân Hà Nội.',
        },
        {
          criterion: 'Ý thức bảo tồn di sản',
          description:
            'Nhận thức được việc giữ gìn dấu tích lịch sử để nhắc nhở thế hệ mai sau về bài học quá khứ ("Dân ta phải biết sử ta").',
        },
      ],
      scaffolding_hint:
        'Gợi ý: Vết đạn pháo thuộc loại sử liệu nào? Nếu xóa vết đạn đi, người đời sau nhìn vào bức tường thành có còn cảm nhận được sự khốc liệt và tinh thần chiến đấu của cha ông năm 1882 không?',
    },
  },
]
