import { useState } from 'react'
import Container from '../components/Container'

export default function PricingPage({ isMockup = false, onMockupSelect }) {
  const [billingPeriod, setBillingPeriod] = useState('monthly')
  const [expandedFaq, setExpandedFaq] = useState(null)

  const isYearly = billingPeriod === 'yearly'

  const plans = [
    {
      name: 'Starter',
      price: '0',
      description: 'Dành cho giáo viên trải nghiệm nền tảng xây dựng kịch bản sư phạm.',
      features: [
        'Tạo tối đa 5 kịch bản / tháng',
        'Sử dụng template Cơ bản (3-node)',
        'Xuất giáo án dạng văn bản thuần',
        'Phân tích tài liệu dung lượng nhỏ (<5MB)',
        'Hỗ trợ qua cộng đồng'
      ],
      ctaText: 'Bắt đầu miễn phí',
      ctaStyle: 'bg-[#faf8ff] text-[#0058be] border border-[#0058be]/20 hover:bg-[#e4e7f0]/40',
      highlighted: false
    },
    {
      name: 'Pro',
      price: isYearly ? '159.000' : '199.000',
      description: 'Dành cho các giáo viên tích cực mong muốn nâng cao hiệu quả bài dạy chuyên sâu.',
      features: [
        'Không giới hạn số lượng kịch bản',
        'Tất cả templates (Cơ bản, Nâng cao, Tự chọn)',
        'Công cụ phân tích cấu trúc RAG kết hợp SGK',
        'Tốc độ xử lý AI ưu tiên tối đa',
        'Nhập tài liệu dung lượng lớn (<50MB)',
        'Xuất PDF / Markdown định dạng đẹp',
        'Hỗ trợ qua Email trong 24 giờ'
      ],
      ctaText: 'Nâng cấp ngay',
      ctaStyle: 'bg-gradient-to-r from-[#0058be] to-[#8455ef] text-white hover:opacity-95 shadow-md',
      highlighted: true,
      badge: 'Phổ biến nhất'
    }
  ]

  const faqs = [
    {
      question: 'EDORE có thể tạo giáo án cho những môn học nào?',
      answer: 'EDORE hoạt động tốt với hầu hết tất cả các môn học thuộc chương trình Giáo dục Phổ thông hiện hành (Toán, Lý, Hóa, Sinh, Văn, Sử, Địa, Tiếng Anh, Tin học...). AI được tinh chỉnh để đọc hiểu các định dạng SGK và tài liệu chuyên môn của Việt Nam.'
    },
    {
      question: 'Tôi có thể hủy đăng ký gói Pro bất cứ lúc nào không?',
      answer: 'Hoàn toàn được. Bạn có thể hủy gói dịch vụ trả phí bất kỳ lúc nào trực tiếp trong phần quản lý tài khoản. Sau khi hủy, tài khoản của bạn vẫn duy trì quyền lợi Pro cho đến hết chu kỳ thanh toán hiện tại.'
    },
    {
      question: 'Thanh toán bằng hình thức nào được hỗ trợ?',
      answer: 'EDORE hỗ trợ thanh toán qua chuyển khoản ngân hàng tự động (QR Code), Ví MoMo, ZaloPay và thẻ tín dụng Visa/Mastercard một cách nhanh chóng và an toàn.'
    },
    {
      question: 'Có chính sách giảm giá cho trường học hoặc tổ chức giáo dục phi lợi nhuận không?',
      answer: 'Chúng tôi luôn hỗ trợ giáo dục cộng đồng. Vui lòng gửi email thông tin trường học của bạn cho ban quản trị tại contact@edore.edu.vn để nhận được mức chiết khấu và ưu đãi đặc quyền.'
    }
  ]

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <Container className="flex flex-col gap-12 py-6">

      {/* ── Header Intro ── */}
      <div className="text-center space-y-6 max-w-2xl mx-auto px-6">
        {/* Tiêu đề - Tập trung vào kết quả */}
        <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
          Tối Ưu Khung Kịch Bản Trong Tích Tắc
        </h1>

        {/* Mô tả - Ngắn, đi thẳng vào vấn đề */}
        <p className="text-lg text-white/80 leading-relaxed max-w-lg mx-auto">
          Xây dựng khung bài giảng chuyên nghiệp chỉ với vài cú click. Tiết kiệm thời gian, tập trung giảng dạy.
        </p>
      </div>

      {/* ── Plan Cards Grid (Chỉ 2 gói, cân bằng) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto items-stretch">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#e2e8f0] rounded-3xl p-10 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="space-y-6">
              <h3 className="text-2xl font-extrabold text-[#151b2d]">{plan.name}</h3>
              <p className="text-sm text-[#727785] leading-relaxed min-h-[40px]">
                {plan.description}
              </p>

              {/* Price Section - Không còn toggle hàng năm */}
              <div className="flex items-baseline gap-1 py-4">
                <span className="text-5xl font-black text-[#151b2d]">{plan.price}đ</span>
                <span className="text-[#727785] font-semibold">/ tháng</span>
              </div>

              {/* Features */}
              <ul className="space-y-4 pt-4">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3 text-sm text-[#424754]">
                    <span className="material-symbols-outlined text-[#0058be] text-lg mt-0.5">check_circle</span>
                    <span className="leading-normal">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                if (isMockup) {
                  onMockupSelect?.(plan)
                }
              }}
              className={`w-full py-4 rounded-2xl font-bold text-sm mt-10 transition-all ${plan.ctaStyle}`}
            >
              {plan.ctaText}
            </button>
          </div>
        ))}
      </div>

      {/* ── FAQ Section ── */}
      <div className="bg-[#f8fafc] border border-[#c2c6d6]/30 rounded-3xl p-6 sm:p-10 max-w-3xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-[#151b2d]">Câu hỏi thường gặp</h2>
          <p className="text-xs text-[#727785]">Giải đáp những băn khoăn phổ biến của các giáo viên về EDORE</p>
        </div>

        <div className="space-y-4 pt-4">
          {faqs.map((faq, index) => {
            const isOpen = expandedFaq === index
            return (
              <div
                key={index}
                className="bg-white border border-[#c2c6d6]/30 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-sm text-[#151b2d] hover:bg-[#faf8ff] transition-all"
                >
                  <span>{faq.question}</span>
                  <span className="material-symbols-outlined text-[#727785] transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs text-[#727785] leading-relaxed border-t border-[#f0f2f8] bg-[#faf8ff]/30">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </Container>
  )
}
