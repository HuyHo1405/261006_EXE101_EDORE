"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Layers, 
  FileText, 
  Edit3, 
  Code, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  GraduationCap, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Heart
} from "lucide-react";

export default function PublicGuidePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "course" | "create-script" | "edit-script" | "dev-note">("overview");

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1c1f] font-sans pb-16">
      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#034ce4]/10 via-[#034ce4]/5 to-transparent pt-12 pb-10 border-b border-[#d9d9d9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#034ce4]/10 border border-[#034ce4]/20 text-[#034ce4] text-xs font-bold uppercase tracking-wider font-mono">
                <Sparkles className="w-3.5 h-3.5" /> Manual Instruction / Sách Hướng Dẫn
              </div>
              <h1 className="font-header text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#034ce4] leading-tight">
                Hướng Dẫn Luồng Hoạt Động Edore
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Tài liệu công khai mô tả chi tiết toàn bộ quy trình vận hành từ Khởi tạo Khóa học, Cấu hình Lớp học, Soạn thảo Kịch bản AI cho đến Chỉnh sửa nâng cao.
              </p>
            </div>

            {/* CTA Test Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#034ce4] text-white font-bold text-sm shadow-md hover:bg-[#023bb3] active:scale-95 transition-all"
              >
                Vào Dashboard Test <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-[#d9d9d9] text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
              >
                Đăng nhập hệ thống
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER ──────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── NAVIGATION SIDEBAR (TAB SYSTEM) ──────────────────── */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="bg-white border border-[#d9d9d9] rounded-xl p-3 shadow-sm sticky top-24">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-2 font-mono">
                Danh mục Hướng dẫn
              </div>
              
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all text-left ${
                    activeTab === "overview"
                      ? "bg-[#034ce4] text-white shadow-xs"
                      : "text-slate-700 hover:bg-[#edf0f2]"
                  }`}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>1. Overview (Tổng quan)</span>
                </button>

                <button
                  onClick={() => setActiveTab("course")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all text-left ${
                    activeTab === "course"
                      ? "bg-[#034ce4] text-white shadow-xs"
                      : "text-slate-700 hover:bg-[#edf0f2]"
                  }`}
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span>2. Course & Class Config</span>
                </button>

                <button
                  onClick={() => setActiveTab("create-script")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all text-left ${
                    activeTab === "create-script"
                      ? "bg-[#034ce4] text-white shadow-xs"
                      : "text-slate-700 hover:bg-[#edf0f2]"
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>3. Tạo Script (Kịch bản)</span>
                </button>

                <button
                  onClick={() => setActiveTab("edit-script")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all text-left ${
                    activeTab === "edit-script"
                      ? "bg-[#034ce4] text-white shadow-xs"
                      : "text-slate-700 hover:bg-[#edf0f2]"
                  }`}
                >
                  <Edit3 className="w-4 h-4 shrink-0" />
                  <span>4. Edit Script (Tùy biến Node)</span>
                </button>

                <button
                  onClick={() => setActiveTab("dev-note")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all text-left ${
                    activeTab === "dev-note"
                      ? "bg-[#034ce4] text-white shadow-xs"
                      : "text-slate-700 hover:bg-[#edf0f2]"
                  }`}
                >
                  <Heart className="w-4 h-4 shrink-0 text-red-400" />
                  <span>5. Dev Note (Lời nhắn)</span>
                </button>
              </nav>

              <div className="mt-4 pt-3 border-t border-[#d9d9d9] text-[11px] text-slate-500 font-mono px-3">
                Status: <span className="text-emerald-600 font-bold">Public Ready</span>
              </div>
            </div>
          </aside>

          {/* ── TAB CONTENT PANEL ────────────────────────────────── */}
          <main className="lg:col-span-9">
            <div className="bg-white border border-[#d9d9d9] rounded-xl p-6 sm:p-8 shadow-sm min-h-[500px]">
              
              {/* SECTION 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-slate-200 pb-4">
                    <span className="text-xs font-bold text-[#034ce4] uppercase font-mono tracking-wider">Phần 1</span>
                    <h2 className="font-header text-3xl font-extrabold uppercase text-slate-900 mt-1">
                      Tổng Quan Luồng Hoạt Động (Overview)
                    </h2>
                  </div>

                  <p className="text-slate-700 leading-relaxed">
                    <strong>Edore</strong> là nền tảng Ed-Tech thông minh giúp giáo viên và nhà quản lý giáo dục tự động hóa quy trình soạn thảo giáo án, xây dựng kịch bản giảng dạy đa phương tiện và quản lý lớp học hiệu quả bằng trí tuệ nhân tạo (AI).
                  </p>

                  <div className="bg-[#edf0f2] border border-[#d9d9d9] rounded-xl p-5 space-y-3">
                    <h3 className="font-bold text-sm text-[#034ce4] uppercase tracking-wider font-mono flex items-center gap-2">
                      <Cpu className="w-4 h-4" /> Luồng Xử Lý 4 Bước Chính (Core Workflow)
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-start gap-3 shadow-xs">
                        <span className="w-6 h-6 rounded-full bg-[#034ce4] text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                        <div>
                          <strong className="block text-slate-900 font-bold">Cấu hình Khóa học / Lớp học</strong>
                          <span className="text-slate-600 text-xs">Khai báo thông tin môn học, thời lượng và tiêu chuẩn đầu ra.</span>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-start gap-3 shadow-xs">
                        <span className="w-6 h-6 rounded-full bg-[#034ce4] text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                        <div>
                          <strong className="block text-slate-900 font-bold">Sinh Kịch bản bằng AI</strong>
                          <span className="text-slate-600 text-xs">Nhập prompt chủ đề, AI tự động dựng cây kịch bản bài giảng.</span>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-start gap-3 shadow-xs">
                        <span className="w-6 h-6 rounded-full bg-[#034ce4] text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                        <div>
                          <strong className="block text-slate-900 font-bold">Chỉnh sửa Visual Node Editor</strong>
                          <span className="text-slate-600 text-xs">Tùy biến các bài học, câu hỏi, hoạt động tương tác.</span>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-start gap-3 shadow-xs">
                        <span className="w-6 h-6 rounded-full bg-[#034ce4] text-white flex items-center justify-center font-bold text-xs shrink-0">4</span>
                        <div>
                          <strong className="block text-slate-900 font-bold">Xuất Kịch bản & Giảng dạy</strong>
                          <span className="text-slate-600 text-xs">Lưu trữ thư viện cá nhân và trình chiếu lớp học.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-sm flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-[#034ce4] shrink-0 mt-0.5" />
                    <div>
                      <strong>Điểm nổi bật:</strong> Hệ thống áp dụng <em>Edore Design Tokens</em> đồng bộ từ giao diện UI cho tới trải nghiệm chỉnh sửa trực quan.
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: COURSE & CLASS CONFIG */}
              {activeTab === "course" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-slate-200 pb-4">
                    <span className="text-xs font-bold text-[#034ce4] uppercase font-mono tracking-wider">Phần 2</span>
                    <h2 className="font-header text-3xl font-extrabold uppercase text-slate-900 mt-1">
                      Tạo Course & Cấu Hình Class Config
                    </h2>
                  </div>

                  <p className="text-slate-700 leading-relaxed">
                    Trước khi sinh kịch bản bài giảng, người dùng cần tạo Khóa học (Course) và cấu hình Lớp học (Class Config) để hệ thống AI hiểu được đối tượng người học và thời lượng phù hợp.
                  </p>

                  <div className="space-y-4">
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                      <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Bước 2.1: Khởi tạo Khóa học (Create Course)
                      </h4>
                      <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1.5 pl-2">
                        <li>Vào trang <strong>Dashboard</strong> ➔ Bấm nút <strong>"Tạo Khóa học mới"</strong>.</li>
                        <li>Điền các thông tin cơ bản: <em>Tên khóa học (vd: Toán 10 Nâng cao)</em>, <em>Khối lớp</em>, <em>Mô tả ngắn</em>.</li>
                        <li>Lựa chọn môn học tương ứng trong hệ thống (Toán, Lý, Hóa, Văn, Anh, v.v.).</li>
                      </ol>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                      <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Bước 2.2: Cấu hình Lớp học (Class Config Editor)
                      </h4>
                      <p className="text-sm text-slate-700">
                        Tại giao diện <code className="font-mono text-xs bg-white border px-1.5 py-0.5 rounded text-[#034ce4]">ClassConfigEditor.tsx</code>, bạn thiết lập các tham số:
                      </p>
                      <ul className="list-disc list-inside text-sm text-slate-700 space-y-1 pl-2 font-body">
                        <li><strong>Số lượng tiết học / buổi:</strong> Xác định nhịp độ phân bổ kịch bản.</li>
                        <li><strong>Mức độ tương tác (Engagement Level):</strong> Cao / Trình bày / Thảo luận nhóm.</li>
                        <li><strong>Mục tiêu đầu ra (Learning Outcomes):</strong> Các chuẩn kiến thức & kỹ năng sinh viên cần đạt.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: CREATE SCRIPT */}
              {activeTab === "create-script" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-slate-200 pb-4">
                    <span className="text-xs font-bold text-[#034ce4] uppercase font-mono tracking-wider">Phần 3</span>
                    <h2 className="font-header text-3xl font-extrabold uppercase text-slate-900 mt-1">
                      Tạo Script (Sinh Kịch Bản AI)
                    </h2>
                  </div>

                  <p className="text-slate-700 leading-relaxed">
                    Tạo Script là tính năng lõi cho phép tạo ra cấu trúc cây bài giảng thông minh dựa trên yêu cầu giáo án của giáo viên.
                  </p>

                  <div className="bg-[#edf0f2] border border-[#d9d9d9] rounded-xl p-5 space-y-4">
                    <h4 className="font-bold text-[#034ce4] text-sm uppercase tracking-wider font-mono">Các bước tạo Script mới:</h4>
                    
                    <div className="space-y-3 text-sm text-slate-800">
                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1">
                        <strong className="text-[#034ce4] font-bold">1. Nhấn nút "Tạo kịch bản mới" (+)</strong>
                        <p className="text-xs text-slate-600">Nút + nằm trên AppHeader hoặc nút Action trong Thư viện Dashboard.</p>
                      </div>

                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1">
                        <strong className="text-[#034ce4] font-bold">2. Nhập Prompt / Nội dung yêu cầu</strong>
                        <p className="text-xs text-slate-600">Ví dụ: <em>"Soạn kịch bản 45 phút dạy bài Định lý Pytago có bài tập thực hành nhóm."</em></p>
                      </div>

                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1">
                        <strong className="text-[#034ce4] font-bold">3. Xử lý AI Generator & Nhận cấu trúc</strong>
                        <p className="text-xs text-slate-600">AI backend sẽ trả về JSON chứa các Node bài học: Khởi động, Khám phá, Luyện tập, Vận dụng.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: EDIT SCRIPT */}
              {activeTab === "edit-script" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-slate-200 pb-4">
                    <span className="text-xs font-bold text-[#034ce4] uppercase font-mono tracking-wider">Phần 4</span>
                    <h2 className="font-header text-3xl font-extrabold uppercase text-slate-900 mt-1">
                      Chỉnh Sửa Script (Edit Script & Node Editor)
                    </h2>
                  </div>

                  <p className="text-slate-700 leading-relaxed">
                    Giao diện Studio Editor tại tuyến đường <code className="font-mono text-xs bg-slate-100 border px-1.5 py-0.5 rounded text-[#034ce4]">/dashboard/scripts/[scriptId]</code> cho phép can thiệp trực tiếp vào từng bước trong kịch bản bài giảng.
                  </p>

                  <div className="space-y-4 text-sm text-slate-700">
                    <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                      <h4 className="font-bold text-slate-900 text-base">Thao tác trên Node Canvas:</h4>
                      <ul className="list-disc list-inside space-y-1 pl-2">
                        <li><strong>Thêm Node mới:</strong> Chọn loại Node (Lý thuyết, Câu hỏi trắc nghiệm, Video, Thảo luận).</li>
                        <li><strong>Chỉnh sửa nội dung Node:</strong> Thay đổi văn bản, thời lượng (phút), tài nguyên đính kèm.</li>
                        <li><strong>Sắp xếp luồng bài giảng:</strong> Kéo thả nối các node theo thứ tự tuyến tính hoặc rẽ nhánh.</li>
                        <li><strong>Xem trước (Preview Mode):</strong> Trình chiếu bài giảng dưới góc nhìn của học sinh.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: DEV NOTE */}
              {activeTab === "dev-note" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-slate-200 pb-4">
                    <span className="text-xs font-bold text-[#034ce4] uppercase font-mono tracking-wider">Phần 5</span>
                    <h2 className="font-header text-3xl font-extrabold uppercase text-slate-900 mt-1">
                      Developer Note (Ghi chú Nhà phát triển)
                    </h2>
                  </div>

                  <div className="bg-gradient-to-br from-[#034ce4]/10 to-[#034ce4]/5 border-2 border-[#034ce4]/30 rounded-xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-[#034ce4] text-white flex items-center justify-center mx-auto shadow-md">
                      <Heart className="w-8 h-8 text-red-300 fill-red-400" />
                    </div>

                    <h3 className="font-header text-3xl font-extrabold uppercase text-[#034ce4]">
                      Thân ái kính chào!
                    </h3>

                    <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                      Cảm ơn bạn đã trải nghiệm nền tảng <strong>Edore</strong>! Đội ngũ phát triển luôn nỗ lực mang lại giải pháp ed-tech tối ưu nhất, tuân thủ nghiêm ngặt các nguyên tắc thiết kế <em>Design Tokens</em> và trải nghiệm người dùng mượt mà nhất.
                    </p>

                    <div className="pt-4 border-t border-[#034ce4]/20 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono text-slate-600">
                      <span>Project: <strong>EDORE Web Monorepo</strong></span>
                      <span className="hidden sm:inline">•</span>
                      <span>Version: <strong>0.1.0-alpha</strong></span>
                      <span className="hidden sm:inline">•</span>
                      <span>Status: <strong>Public Accessible</strong></span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
