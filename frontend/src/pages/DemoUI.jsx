import { useState } from 'react'
import TimelineEditor from '../features/playground/TimelineEditor'

const MOCK_STEPS = [
  {
    time: "00:00 - 00:10",
    title: "Khởi động và Dẫn nhập",
    duration: "10'",
    type: "Khởi động",
    intent: "Kích hoạt kiến thức nền và tạo hứng thú cho học sinh",
    details: [
      "Bước 1: Giáo viên chia lớp thành các nhóm 4 người.",
      "Bước 2: Trình chiếu câu hỏi tình huống: 'Làm thế nào để đo chiều cao của một tòa nhà không cần leo lên đỉnh?'",
      "Bước 3: Học sinh thảo luận nhanh trong 2 phút và ghi câu trả lời lên bảng nhóm."
    ],
    originalContent: "### Khởi động & Dẫn nhập\n\n- Giáo viên đặt vấn đề thông qua một câu hỏi thực tế.\n- Học sinh thảo luận nhóm ngắn.\n- Nhận diện mục tiêu bài học: **Ứng dụng hệ thức lượng để đo khoảng cách**.\n\n*Lưu ý*: Giữ nguyên các thuật ngữ toán học chính xác.",
    pedagogNote: "Chuẩn bị:\n- Bảng phụ hoặc giấy A1 cho các nhóm.\n- Máy chiếu hiển thị hình ảnh minh họa.",
    warningContext: ""
  },
  {
    time: "00:10 - 00:30",
    title: "Lý thuyết cốt lõi",
    duration: "20'",
    type: "Lý thuyết cốt lõi",
    intent: "Xây dựng công thức lượng giác cơ bản trong tam giác vuông",
    details: [
      "Bước 1: Giáo viên phát biểu định lý và vẽ hình minh họa lên bảng.",
      "Bước 2: Học sinh ghi chép các hệ thức lượng quan trọng: sin, cos, tan, cot.",
      "Bước 3: Làm ví dụ mẫu áp dụng trực tiếp công thức."
    ],
    originalContent: "### Định lý Hệ thức lượng\n\nTrong tam giác vuông, các cạnh hệ thức liên quan mật thiết thông qua tỉ số lượng giác:\n\n1. **sin α** = đối / huyền\n2. **cos α** = kề / huyền\n3. **tan α** = đối / kề\n4. **cot α** = kề / đối\n\n### Ví dụ minh họa:\nCho tam giác ABC vuông tại A, cạnh AB = 3cm, AC = 4cm. Tính sin B.",
    pedagogNote: "Chuẩn bị slide chứa sẵn hình vẽ tam giác để tiết kiệm thời gian vẽ bảng.",
    warningContext: ""
  },
  {
    time: "00:30 - 00:45",
    title: "Thực hành & Vận dụng",
    duration: "15'",
    type: "Thực hành & Vận dụng",
    intent: "Học sinh tự giải quyết bài toán tính khoảng cách thực tế",
    details: [
      "Bước 1: Phát phiếu bài tập thực hành cá nhân.",
      "Bước 2: Học sinh áp dụng hệ thức lượng tính chiều cao cột cờ dựa trên bóng nắng.",
      "Bước 3: Đại diện 2 học sinh lên bảng trình bày lời giải."
    ],
    originalContent: "### Bài toán thực tế: Đo chiều cao cột cờ\n\n- Bóng của cột cờ trên mặt đất dài **5m**.\n- Góc tạo bởi tia nắng mặt trời với mặt đất là **60 độ**.\n- Tính chiều cao của cột cờ (làm tròn đến chữ số thập phân thứ hai).",
    pedagogNote: "Chuẩn bị thước đo góc di động nếu có điều kiện cho học sinh đo thực tế.",
    warningContext: ""
  }
];

export default function DemoUI() {
  const [timelineSteps, setTimelineSteps] = useState(MOCK_STEPS)

  const handleRestart = () => {
    setTimelineSteps(MOCK_STEPS)
  }

  return (
    <div className="w-full bg-[#faf8ff] min-h-[85vh] text-[#151b2d] font-sans antialiased relative rounded-2xl border border-[#c2c6d6] shadow-sm p-8">
      {/* ── Page header ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-extrabold text-2xl text-[#151b2d]">Demo UI Playground</h1>
            <p className="text-xs text-[#727785] font-mono mt-0.5">
              Trang demo giao diện với dữ liệu giả lập để kiểm tra định dạng hiển thị
            </p>
          </div>
        </div>
      </div>

      <TimelineEditor
        steps={timelineSteps}
        onStepsChange={setTimelineSteps}
        contentSummary="Đây là kịch bản demo giảng dạy mẫu để kiểm tra tính năng hiển thị nội dung học liệu phong phú và định dạng markdown trực quan mới."
        onRestart={handleRestart}
      />
    </div>
  )
}
