import { Link } from 'react-router-dom';
import Container from './Container';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 bg-white mt-auto py-12">

      {/* Main grid — căn chỉnh nhờ Container đọc --layout-px / --layout-max */}
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand & Mission */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 w-fit">
              <span className="material-symbols-outlined text-2xl text-blue-600 font-bold">
                school
              </span>
              <span className="font-extrabold text-lg tracking-wider text-gray-900">
                EDORE AI
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              Giải pháp Trí tuệ Nhân tạo toàn diện giúp giáo viên thiết kế bài giảng, giáo án và học liệu một cách nhanh chóng, hiệu quả.
            </p>
          </div>

          {/* Sản phẩm */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Sản phẩm
            </h3>
            <div className="flex flex-col gap-3 text-sm text-gray-500">
              <Link to="/studio" className="hover:text-blue-600 transition-colors">Studio AI</Link>
              <Link to="/dashboard"  className="hover:text-blue-600 transition-colors">Dashboard</Link>
              <Link to="/pricing"    className="hover:text-blue-600 transition-colors">Bảng giá</Link>
            </div>
          </div>

          {/* Hỗ trợ */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Hỗ trợ
            </h3>
            <div className="flex flex-col gap-3 text-sm text-gray-500">
              <Link to="/docs"    className="hover:text-blue-600 transition-colors">Tài liệu hướng dẫn</Link>
              <Link to="/faq"     className="hover:text-blue-600 transition-colors">Câu hỏi thường gặp</Link>
              <Link to="/contact" className="hover:text-blue-600 transition-colors">Liên hệ</Link>
            </div>
          </div>

        </div>

        {/* Legal & Copyright — cùng Container nên tự căn theo --layout-px */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} EDORE AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/terms"   className="hover:text-blue-600 transition-colors">Điều khoản dịch vụ</Link>
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Chính sách bảo mật</Link>
          </div>
        </div>
      </Container>

    </footer>
  );
}