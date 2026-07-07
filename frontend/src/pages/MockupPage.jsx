import { useState, useEffect } from 'react'
import LoginPage from './auth/LoginPage'
import Dashboard from './Dashboard'
import PricingPage from './PricingPage'
import Playground from './Playground'
import Header from '../components/Header'
import Footer from '../components/Footer'

const GALLERY_ITEMS = [
  {
    id: 'script-1',
    title: 'Trung Quốc từ thời cổ đại đến thế kỉ VII',
    subject: 'Lịch sử - Lớp 6',
    bloomLevel: 'Hiểu & Vận dụng',
    duration: '45 phút',
    nodesCount: 3,
    createdAt: '2026-07-06',
    summary: 'Bài giảng giúp học sinh nắm được điều kiện tự nhiên, quá trình thống nhất Trung Quốc dưới thời Tần Thuỷ Hoàng và các thành tựu văn minh tiêu biểu trước thế kỉ VII.',
    color: 'from-red-500 to-amber-600',
    favorite: true,
    steps: [
      {
        time: "00:00",
        title: "Khởi động & Dẫn nhập",
        duration: "10'",
        type: "Khởi động",
        intent: "Kích hoạt kiến thức nền về các nền văn minh sông nước và tạo hứng thú tìm hiểu Trung Quốc cổ đại.",
        appliedActivity: "\"Thám tử lược đồ\" - Tô màu và ghép lược đồ Hoàng Hà - Trường Giang",
        pedagogNote: "Lược đồ câm (khổ A4) phát cho mỗi nhóm.\nBút chì màu cho mỗi học sinh.\nHình ảnh in Hoàng Hà, Trường Giang thực tế (phù sa, đồng bằng châu thổ).\nMáy chiếu để trình chiếu hình 9.1 và lược đồ 9.2 gốc.",
        details: "Bước 1: Giáo viên chia lớp thành 4 nhóm.\nBước 2: Chiếu hình 9.1 và lược đồ 9.2, yêu cầu học sinh xác định vùng cư trú chủ yếu của cư dân Trung Quốc cổ đại (trung và hạ lưu Hoàng Hà).\nBước 3: Đặt câu hỏi dẫn nhập: \"Vì sao các nền văn minh cổ đại thường hình thành bên các dòng sông lớn?\"",
        originalContent: "### Điều kiện tự nhiên\nVào thời cổ đại, lãnh thổ Trung Quốc nhỏ hơn ngày nay rất nhiều. Cư dân cư trú chủ yếu ở trung và hạ lưu Hoàng Hà. Về sau, họ mở rộng dần địa bàn cư trú xuống lưu vực Trường Giang.\nHoàng Hà là con sông lớn thứ hai ở Trung Quốc, được người dân trìu mến gọi là \"sông Mẹ\". Mặc dù thường xuyên gây ra lũ lụt, nhưng phù sa màu mỡ của nó đã tạo nên một vùng đồng bằng châu thổ phì nhiêu, thuận lợi cho việc trồng trọt khi công cụ sản xuất còn tương đối thô sơ. Chính vì vậy, nơi đây đã trở thành cái nôi của văn minh Trung Quốc.\nXuôi về phía nam, vùng đồng bằng rộng lớn ở lưu vực Trường Giang đất đai phì nhiêu, khí hậu ấm áp, thuận lợi cho nhiều loại cây trồng phát triển."
      },
      {
        time: "00:10",
        title: "Lý thuyết cốt lõi",
        duration: "20'",
        type: "Lý thuyết cốt lõi",
        intent: "Học sinh mô tả được quá trình thống nhất Trung Quốc dưới thời Tần Thuỷ Hoàng và các chính sách thống nhất đất nước.",
        appliedActivity: "\"Hội đồng cố vấn Hoàng đế\" - Đóng vai thuyết trình 4 chính sách thống nhất",
        pedagogNote: "Thẻ vai trò in sẵn (4 nhóm: lãnh thổ, đo lường, tiền tệ, chữ viết).\nSơ đồ 9.5 về sự phân hoá xã hội thời Tần phóng to.\nGiấy A3 và bút dạ cho mỗi nhóm trình bày.\nHình ảnh/mô hình minh hoạ tiền Ngũ thù, chữ triện (nếu có).\nTrục thời gian các triều đại (Hán - Tam quốc - Tấn - Nam Bắc triều - Tuỳ) vẽ sẵn trên bảng phụ.",
        details: "Bước 1: Giáo viên giới thiệu bối cảnh: thời cổ đại Trung Quốc trải qua ba triều đại Hạ, Thương, Chu; cuối thời Chu có hàng trăm tiểu quốc giao tranh.\nBước 2: Trình bày sự kiện năm 221 TCN, Doanh Chính lên ngôi lấy hiệu Tần Thuỷ Hoàng, thống nhất Trung Quốc.\nBước 3: Yêu cầu học sinh quan sát hình 9.4, thảo luận nhóm liệt kê 4 chính sách thống nhất: lãnh thổ, đo lường, tiền tệ, chữ viết.\nBước 4: Dùng sơ đồ 9.5 phân tích sự phân hoá giai cấp: địa chủ và nông dân lĩnh canh (tá điền), xác lập chế độ phong kiến.\nBước 5: Giới thiệu nhanh trục thời gian từ nhà Hán (206 TCN - 220) đến nhà Tuỳ (581 - 618).",
        originalContent: "### Quá trình thống nhất và xác lập chế độ phong kiến dưới thời Tần Thuỷ Hoàng\nThời cổ đại ở Trung Quốc kéo dài khoảng 2000 năm, gắn liền với ba triều đại kế tiếp nhau là nhà Hạ, nhà Thương và nhà Chu.\nĐến cuối thời nhà Chu, nước Tần dần mạnh lên. Tần Doanh Chính đã lần lượt đánh chiếm các nước, thống nhất Trung Quốc. Năm 221 TCN, Doanh Chính lên ngôi hoàng đế, lấy hiệu là Tần Thuỷ Hoàng. Ông đã thực hiện nhiều chính sách: (1) Thống nhất lãnh thổ; (2) Thống nhất hệ thống đo lường; (3) Thống nhất tiền tệ; (4) Thống nhất chữ viết.\nXã hội Trung Quốc phân hoá sâu sắc: Địa chủ (quý tộc, quan lại và nông dân giàu có) trở thành giai cấp thống trị; Nông dân lĩnh canh (tá điền) nhận ruộng của địa chủ để canh tác và nộp tô. Chế độ phong kiến chính thức được xác lập.\nNhà Tần sụp đổ sau 15 năm (221 TCN - 206 TCN). Kế tiếp là nhà Hán (206 TCN - 220), Tam quốc (220 - 280), Tấn (280 - 420), Nam - Bắc triều (420 - 581), và nhà Tuỳ tái thống nhất đất nước (581 - 618)."
      },
      {
        time: "00:30",
        title: "Thực hành & Vận dụng",
        duration: "15'",
        type: "Thực hành & Vận dụng",
        intent: "Học sinh nêu được các thành tựu văn minh Trung Quốc cổ đại và liên hệ giá trị của các phát minh đến ngày nay.",
        appliedActivity: "\"Bảo tàng mini\" - Trưng bày và tham quan luân phiên 5 trạm thành tựu",
        pedagogNote: "Giấy A1 cho mỗi trạm (5 trạm: Tư tưởng, Chữ viết, Văn học - Sử học, Y học, Kĩ thuật - Kiến trúc).\nẢnh tư liệu in màu (Vạn Lý Trường Thành, giáp cốt văn, trang Sử kí).\nPhiếu thu hoạch tham quan phát cho mỗi học sinh.\nMẫu giấy dó/tre thật (nếu chuẩn bị được) để học sinh trải nghiệm kĩ thuật làm giấy.",
        details: "Bước 1: Giáo viên chia lớp thành 5 trạm, mỗi trạm phụ trách một lĩnh vực: Tư tưởng, Chữ viết, Văn học - Sử học, Y học, Kĩ thuật - Kiến trúc.\nBước 2: Mỗi nhóm đọc tư liệu và ghi lại thành tựu tiêu biểu cùng ý nghĩa của nó.\nBước 3: Đại diện nhóm trình bày ngắn gọn trước lớp, các nhóm khác đặt câu hỏi phản biện.\nBước 4: Giáo viên dẫn dắt thảo luận câu hỏi mở: \"Em có đồng ý với quan điểm 'Tiên học lễ, hậu học văn' không?\" và tổng kết bài học.",
        originalContent: "### Thành tựu tiêu biểu của nền văn minh Trung Quốc cổ đại\n- Tư tưởng: Nho gia với đại diện tiêu biểu là Khổng Tử, nhấn mạnh tôn ti trật tự.\n- Chữ viết: Chữ tượng hình xuất hiện từ thời nhà Thương (giáp cốt văn, kim văn, chữ viết trên thẻ tre trúc).\n- Văn học và Sử học: Kinh Thi là tác phẩm văn học cổ nhất; Sử kí của Tư Mã Thiên là công trình sử học đồ sộ.\n- Y học: Phát triển sớm với thảo dược, bấm huyệt, châm cứu.\n- Kĩ thuật: Địa động nghi (đo động đất), kĩ thuật dệt tơ lụa, đặc biệt là kĩ thuật làm giấy.\n- Kiến trúc: Vạn Lý Trường Thành, bắt đầu xây từ thế kỉ V TCN, nối dài từ thời Tần Thuỷ Hoàng."
      }
    ]
  },
  {
    id: 'script-2',
    title: 'La Mã cổ đại',
    subject: 'Lịch sử - Lớp 6',
    bloomLevel: 'Phân tích',
    duration: '45 phút',
    nodesCount: 3,
    createdAt: '2026-07-06',
    summary: 'Bài giảng giúp học sinh phân tích tác động của điều kiện tự nhiên, tổ chức nhà nước đế chế và các thành tựu văn hoá tiêu biểu của La Mã cổ đại.',
    color: 'from-purple-500 to-slate-700',
    favorite: false,
    steps: [
      {
        time: "00:00",
        title: "Khởi động & Trải nghiệm",
        duration: "10'",
        type: "Khởi động",
        intent: "Kích hoạt hiểu biết về vị trí địa lí Địa Trung Hải và tạo hứng thú tìm hiểu La Mã cổ đại.",
        appliedActivity: "\"Nhà thám hiểm Địa Trung Hải\" - Đánh dấu vị trí và tuyến hàng hải trên bản đồ trống",
        pedagogNote: "Bản đồ Địa Trung Hải khổ lớn (dạng bản đồ trống) cho mỗi nhóm.\nBút màu để đánh dấu vị trí và tuyến hàng hải.\nTranh 11.1 (cảng biển gần Pôm-pây) in màu, kèm nam châm gắn bảng.\nMáy chiếu để trình chiếu bản đồ gốc 11.2.",
        details: "Bước 1: Giáo viên chiếu bản đồ bán đảo I-ta-li-a và đặt câu hỏi: \"Vị trí của bán đảo này có gì đặc biệt so với các nền văn minh đã học?\"\nBước 2: Học sinh quan sát tranh 11.1, mô tả hoạt động cảng biển của người La Mã.\nBước 3: Giáo viên dẫn nhập vào nội dung điều kiện tự nhiên La Mã cổ đại.",
        originalContent: "### Điều kiện tự nhiên\nNơi phát sinh ban đầu của La Mã cổ đại là bán đảo I-ta-li-a (Italia). Vùng đồng bằng màu mỡ ở thung lũng sông Pô (Po) và sông Ti-bơ thuận lợi cho việc trồng trọt. Miền Nam và đảo Xi-xin (Sicily) có những đồng cỏ thuận tiện cho việc chăn nuôi. Trong lòng đất chứa nhiều đồng, chì, sắt,... nên các ngành thủ công nghiệp cũng rất phát triển.\nĐặc biệt, bán đảo I-ta-li-a có hàng nghìn km đường bờ biển, lại nằm ở vị trí trung tâm Địa Trung Hải, rất thuận lợi cho giao thương và các hoạt động hàng hải."
      },
      {
        time: "00:10",
        title: "Lý thuyết cốt lõi",
        duration: "20'",
        type: "Lý thuyết cốt lõi",
        intent: "Học sinh trình bày được tổ chức nhà nước đế chế La Mã và phân biệt với thời kì Cộng hoà.",
        appliedActivity: "\"Phiên toà lịch sử\" - Tranh luận Cộng hoà vs Đế chế",
        pedagogNote: "Bảng so sánh 2 cột (Cộng hoà - Đế chế) in sẵn cho mỗi nhóm.\nThẻ lập luận gợi ý (vai trò Viện Nguyên lão, quyền lực hoàng đế).\nTư liệu về nhân vật Ốc-ta-vi-út phát cho học sinh tham khảo.\nĐồng hồ bấm giờ để quản lý thời gian tranh luận.\nLược đồ 11.2 (lãnh thổ La Mã thời đế chế) phóng to.",
        details: "Bước 1: Giáo viên giới thiệu quá trình La Mã mở rộng từ một thành bang nhỏ ở miền Trung bán đảo I-ta-li-a thành đế chế rộng lớn quanh Địa Trung Hải.\nBước 2: Học sinh thảo luận nhóm hoàn thành bảng so sánh: Thời Cộng hoà (không vua, Viện Nguyên lão nắm quyền lực thực chất - đề xuất luật, quyết định chiến tranh, đề cử quan chấp chính) và Thời Đế chế (từ năm 27 TCN, Ốc-ta-vi-út, hoàng đế thâu tóm quyền lực, Viện Nguyên lão chỉ còn hình thức).\nBước 3: Giáo viên đọc câu nói của Ốc-ta-vi-út: \"Ta đã nhận một Rô-ma bằng gạch và để lại một Rô-ma bằng cẩm thạch\" và cho học sinh nêu cảm nhận.\nBước 4: Đại diện nhóm trình bày kết quả so sánh trước lớp.",
        originalContent: "### Tổ chức nhà nước La Mã cổ đại\nKhi mới thành lập, La Mã chỉ là một thành bang nhỏ bé ở miền Trung bán đảo I-ta-li-a. Dần dần, thông qua chiến tranh, lãnh thổ La Mã không ngừng được mở rộng và trở thành một đế chế rộng lớn.\n- Thời kì Cộng hoà: La Mã thiết lập hình thức nhà nước cộng hoà không có vua, cai trị dựa trên luật pháp và mọi chức vụ phải được bầu ra. Tuy nhiên, thực chất quyền lực nằm trong tay 300 thành viên của Viện Nguyên lão (quyền đề xuất luật; quyết định hoà bình hay chiến tranh; đề cử quan chấp chính).\n- Thời kì Đế chế: Từ năm 27 TCN, dưới thời của Ốc-ta-vi-út (Octavius), La Mã chuyển sang hình thức nhà nước đế chế. Hoàng đế thâu tóm tất cả quyền lực, Viện Nguyên lão chỉ còn là hình thức."
      },
      {
        time: "00:30",
        title: "Thực hành & Vận dụng",
        duration: "15'",
        type: "Thực hành & Vận dụng",
        intent: "Học sinh nêu được thành tựu văn hoá La Mã và vận dụng chữ số La Mã vào tính toán thực tế.",
        appliedActivity: "\"Thử làm nhà toán học La Mã\" - Đổi số Ả Rập sang chữ số La Mã và tính toán",
        pedagogNote: "Bảng chữ số La Mã (I, V, X, L, C, D, M) in lớn.\nPhiếu bài tập đổi số và phép tính 350 + 270 bằng chữ số La Mã cho mỗi nhóm.\nHình ảnh đấu trường Cô-li-dê, đền Pan-tê-ông in màu.",
        details: "Bước 1: Giáo viên giới thiệu hệ chữ La-tinh (26 chữ cái) và hệ chữ số La Mã (7 kí tự cơ bản: I, V, X, L, C, D, M).\nBước 2: Học sinh làm việc nhóm thực hiện phép tính 350 + 270 bằng chữ số La Mã, sau đó thảo luận nhận xét về tính bất tiện khi tính toán bằng hệ chữ số này so với hệ số Ả Rập.\nBước 3: Giáo viên giới thiệu nhanh về luật La Mã và các công trình kiến trúc tiêu biểu (đấu trường Cô-li-dê, đền Pan-tê-ông, hệ thống cầu cống, đường sá).\nBước 4: Kết thúc bằng câu hỏi vận dụng: \"Kể tên một số thành tựu văn hoá La Mã cổ đại vẫn được ứng dụng trong thời kì hiện đại.\"",
        originalContent: "### Thành tựu văn hoá tiêu biểu của La Mã\n- Chữ viết và chữ số: Hệ thống chữ La-tinh gồm 26 chữ cái, là nền tảng cho hơn 200 ngôn ngữ và chữ viết hiện nay. Hệ thống chữ số La Mã gồm 7 kí tự cơ bản: I (1), V (5), X (10), L (50), C (100), D (500), M (1000).\n- Luật pháp: Hệ thống luật La Mã được coi là tiến bộ nhất thời cổ đại, là nền tảng cho luật pháp các nước Âu - Mỹ sau này.\n- Kiến trúc và điêu khắc: Nhờ phát minh ra bê tông, người La Mã xây dựng được đấu trường Cô-li-dê, đền Pan-tê-ông, Khải hoàn môn, hệ thống cầu cống, đường sá."
      }
    ]
  }
]

const STEPS_META = [
  { id: 'auth', label: 'Đăng nhập' },
  { id: 'pricing', label: 'Bảng giá' },
  { id: 'gallery', label: 'Thư viện' },
  { id: 'input', label: 'Tải tệp' },
  { id: 'output', label: 'Kịch bản' },
  { id: 'end', label: 'Kết thúc' }
]

export default function MockupPage() {
  const [currentStep, setCurrentStep] = useState('auth')
  const [selectedScript, setSelectedScript] = useState(GALLERY_ITEMS[1])
  const currentStepIdx = STEPS_META.findIndex(s => s.id === currentStep)

  // Configure playground and local storage state before rendering step components
  useEffect(() => {
    if (currentStep === 'output') {
      localStorage.setItem('edore_active_editing_script', JSON.stringify(selectedScript))
    } else {
      localStorage.removeItem('edore_active_editing_script')
    }
  }, [currentStep, selectedScript])

  const handleNext = () => {
    if (currentStepIdx < STEPS_META.length - 1) {
      setCurrentStep(STEPS_META[currentStepIdx + 1].id)
    }
  }

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStep(STEPS_META[currentStepIdx - 1].id)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-[#faf8ff] text-[#151b2d] font-sans antialiased"
      style={{
        '--layout-px': '1.5rem',
        '--layout-max': '80rem',
      }}
    >
      {/* Thanh đầu trang */}
      <Header />

      {/* Nội dung trang (Outlet area) */}
      <main className="flex-1 pt-20 pb-10 flex flex-col bg-[#0058be]">
        {currentStep === 'auth' && (
          <LoginPage isMockup={true} onMockupNext={() => setCurrentStep('pricing')} />
        )}

        {currentStep === 'pricing' && (
          <PricingPage isMockup={true} onMockupSelect={() => setCurrentStep('gallery')} />
        )}

        {currentStep === 'gallery' && (
          <Dashboard
            isMockup={true}
            onMockupCreate={() => setCurrentStep('input')}
            onMockupEdit={(script) => {
              setSelectedScript(script)
              setCurrentStep('input')
            }}
          />
        )}

        {(currentStep === 'input' || currentStep === 'output') && (
          <Playground
            key={currentStep}
            isMockup={true}
            mockScript={selectedScript}
            forcedStage={currentStep === 'output' ? 'results' : 'input'}
            onPipelineDone={() => setCurrentStep('output')}
          />
        )}

        {currentStep === 'end' && (
          <div className="max-w-xl mx-auto text-center space-y-6 py-16 px-6">
            <div className="h-14 w-14 bg-white/10 text-white rounded-full flex items-center justify-center mx-auto border border-white/20">
              <span className="material-symbols-outlined text-3xl">celebrate</span>
            </div>
            <h1 className="text-2xl font-black text-white">Hoàn Thành Tour Mô Phỏng!</h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Bạn đã hoàn thành việc khám phá tất cả các trang chính bằng dữ liệu thực tế và mô phỏng của hệ thống.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => setCurrentStep('auth')}
                className="px-5 py-2.5 bg-white/10 text-white font-bold text-xs rounded-xl hover:bg-white/20 transition-all cursor-pointer border border-white/20"
              >
                Xem lại từ đầu
              </button>
              <button
                onClick={() => { window.location.href = '/playground' }}
                className="px-5 py-2.5 bg-white text-[#0058be] font-bold text-xs rounded-xl shadow-md hover:bg-white/90 transition-all cursor-pointer"
              >
                Vào Playground thực tế
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Chân trang */}
      <Footer />

      {/* ── Statically positioned simulator control bar (Under Footer, no fixed bottom positioning) ── */}
      <div className="w-full bg-[#0d1829] border-t border-white/10 text-white py-4">
        <div
          className="w-full mx-auto px-4 flex flex-wrap items-center justify-between gap-3"
          style={{ maxWidth: 'var(--layout-max, 80rem)' }}
        >
          {/* Brand label */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-[#6cf8bb] text-[18px]">explore</span>
            <span className="font-bold text-xs text-white">EDORE Simulator Panel (Dưới Footer)</span>
          </div>

          {/* Stepper steps */}
          <div className="flex items-center gap-1 overflow-x-auto flex-1 mx-2">
            {STEPS_META.map((step, idx) => {
              const isCompleted = idx < currentStepIdx
              const isActive = idx === currentStepIdx
              return (
                <div key={step.id} className="flex items-center shrink-0">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all duration-200 whitespace-nowrap ${isActive
                      ? 'bg-[#6cf8bb] text-[#0d1829] shadow'
                      : isCompleted
                        ? 'bg-white/15 text-[#6cf8bb] hover:bg-white/25'
                        : 'text-white/35 hover:text-white/60'
                      }`}
                  >
                    {idx + 1}. {step.label}
                  </button>
                  {idx < STEPS_META.length - 1 && (
                    <span className="material-symbols-outlined text-white/15 text-[12px] mx-0.5">chevron_right</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCurrentStep('auth')}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              title="Khởi động lại"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            </button>
            <div className="flex items-center gap-0.5 bg-white/10 p-0.5 rounded-lg">
              <button
                onClick={handleBack}
                disabled={currentStepIdx === 0}
                className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              </button>
              <span className="text-[11px] font-bold px-1.5 text-white/70 tabular-nums">
                {currentStepIdx + 1}/{STEPS_META.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentStepIdx === STEPS_META.length - 1}
                className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
