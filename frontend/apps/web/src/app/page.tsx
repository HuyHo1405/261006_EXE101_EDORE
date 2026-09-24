"use client";

import Link from "next/link";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { CreativeFlowIllustration } from "@/components/illustrations/CreativeFlowIllustration";
import { JoinIllustration } from "@/components/illustrations/JoinIllustration";
import { ArticlesIllustration } from "@/components/illustrations/ArticlesIllustration";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";
import {
  Sparkles,
  BookOpen,
  Users,
  BarChart3,
  ArrowRight,
  Crown,
  HelpCircle,
  PlayCircle,
  Check,
  CornerDownRight,
} from "@/components/ui/icons";

export default function Home() {
  const { user, isAuthenticated, togglePlan } = useAuthStore();

  return (
    /* ── BASE PRIMARY BLUE BACKGROUND CANVAS (MÀU XANH PRIMARY BASE #034ce4) ────── */
    <div className="w-full bg-[var(--color-primary-500)] min-h-screen py-4 md:py-6 px-2.5 sm:px-4 md:px-6 font-body">
      
      {/* ── WHITE CONTAINER CARD VỚI BO GÓC BÊN TRONG (OVERFLOW VISIBLE CHO HÌNH VỜN QUA KHUNG) ───── */}
      <div className="max-w-[1400px] mx-auto bg-white border border-white/20 shadow-2xl rounded-2xl md:rounded-3xl p-2.5 sm:p-3 md:p-4 space-y-8 md:space-y-12 relative">
        
        {/* ── SECTION 1: HERO (DOT-GRID MONO-PRIMARY + ILLUSTRATION OVERLAY) ─────── */}
        <section className="banner banner--hero shadow-md">
          <div className="banner-inner">
            <h2>Ý tưởng thành hành động</h2>
            
            <p className="sub">
              Biến quy trình soạn kịch bản giảng dạy rời rạc thành một luồng làm việc liền mạch, thông minh cho cả đội ngũ giáo viên và học sinh.
            </p>

            <div className="cta-group flex flex-wrap items-center gap-3 md:gap-4 pt-1">
              {isAuthenticated ? (
                <Button asChild size="lg" className="bg-white text-[var(--color-primary-600)] hover:bg-slate-100 font-bold shadow-md hover:scale-105 transition-all shrink-0 whitespace-nowrap">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    Vào Thư viện bài giảng <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-white text-[var(--color-primary-600)] hover:bg-slate-100 font-bold shadow-md hover:scale-105 transition-all shrink-0 whitespace-nowrap">
                  <Link href="/register" className="flex items-center gap-2">
                    Bắt đầu ngay miễn phí <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              )}

              {/* Các Link Button chuyển hướng nhanh */}
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="#features"
                  className="text-xs md:text-sm font-bold text-white/95 hover:text-white hover:underline flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all backdrop-blur-xs whitespace-nowrap"
                >
                  <CornerDownRight className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                  Các tính năng
                </Link>

                <Link
                  href="#how-to-use"
                  className="text-xs md:text-sm font-bold text-white/95 hover:text-white hover:underline flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all backdrop-blur-xs whitespace-nowrap"
                >
                  <CornerDownRight className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                  Cách sử dụng
                </Link>

                <Link
                  href="#pricing"
                  className="text-xs md:text-sm font-bold text-white/95 hover:text-white hover:underline flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all backdrop-blur-xs whitespace-nowrap"
                >
                  <CornerDownRight className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                  Giá dịch vụ
                </Link>
              </div>
            </div>
          </div>

          <div className="illustration">
            <CreativeFlowIllustration />
          </div>
        </section>


        {/* ── SECTION 2: FEATURES (CÁC TÍNH NĂNG NỔI BẬT) ─────────────────────────── */}
        <section id="features" className="space-y-8 pt-2 scroll-mt-20 md:scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-header font-bold text-3xl md:text-4xl uppercase tracking-tight text-slate-900">
              Công cụ soạn bài giảng & quản lý lớp học toàn diện
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-body">
              Edore cung cấp đầy đủ giải pháp tự động hóa kịch bản, lưu trữ kho giáo án và theo dõi tiến trình học sinh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <AnimateOnScroll className="h-full">
              <div className="group bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[var(--color-primary-300)] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border border-[var(--color-primary-200)] flex items-center justify-center group-hover:bg-[var(--color-primary-500)] group-hover:text-white transition-colors">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-header font-bold text-xl uppercase tracking-tight text-slate-900">
                    Soạn kịch bản AI
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    Tự động gợi ý nội dung bài giảng, kịch bản tương tác và câu hỏi thảo luận theo chuẩn chương trình chỉ trong vài giây.
                  </p>
                </div>
                <div className="pt-4 flex items-center text-xs font-bold text-[var(--color-primary-600)] group-hover:translate-x-1 transition-transform">
                  Tìm hiểu thêm <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </AnimateOnScroll>

            {/* Feature 2 */}
            <AnimateOnScroll className="h-full">
              <div className="group bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[var(--color-primary-300)] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-[var(--color-secondary-600)] border border-amber-200 flex items-center justify-center group-hover:bg-[var(--color-secondary-500)] group-hover:text-white transition-colors">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-header font-bold text-xl uppercase tracking-tight text-slate-900">
                    Ngân hàng kịch bản
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    Kho mẫu kịch bản chuẩn hóa phong phú theo từng khối lớp và môn học, hỗ trợ tái sử dụng và tùy biến nhanh chóng.
                  </p>
                </div>
                <div className="pt-4 flex items-center text-xs font-bold text-[var(--color-secondary-600)] group-hover:translate-x-1 transition-transform">
                  Khám phá bài giảng <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </AnimateOnScroll>

            {/* Feature 3 */}
            <AnimateOnScroll className="h-full">
              <div className="group bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[var(--color-primary-300)] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-header font-bold text-xl uppercase tracking-tight text-slate-900">
                    Lớp học tương tác
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    Tổ chức nhóm học tập, giao nhiệm vụ và theo dõi tương tác học sinh theo thời gian thực trực quan.
                  </p>
                </div>
                <div className="pt-4 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                  Quản lý lớp học <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </AnimateOnScroll>

            {/* Feature 4 */}
            <AnimateOnScroll className="h-full">
              <div className="group bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[var(--color-primary-300)] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h3 className="font-header font-bold text-xl uppercase tracking-tight text-slate-900">
                    Cá nhân hóa lộ trình
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    Báo cáo tiến trình chi tiết, đề xuất bài tập phân hóa phù hợp với năng lực của từng học sinh.
                  </p>
                </div>
                <div className="pt-4 flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                  Xem báo cáo tiến trình <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>


        {/* ── SECTION 3: HOW IT WORKS (CÁCH HOẠT ĐỘNG + VIDEO PLACEHOLDER + 4 BƯỚC DẠNG DẸP TĨNH) ── */}
        <section id="how-to-use" className="space-y-10 pt-4 scroll-mt-20 md:scroll-mt-24">
          
          {/* Layout Header 2 Cột chuẩn như hình mẫu đính kèm */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-end">
            {/* Cột Trái: Tiêu đề */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-header font-bold text-3xl md:text-5xl uppercase tracking-tight text-slate-900 leading-tight">
                Cách Edore giúp bạn soạn bài giảng thông minh
              </h2>
            </div>

            {/* Cột Phải: Mô tả ngắn & Nút bấm CTA (Màu Primary Brand Blue) */}
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-body">
                Xem kịch bản giảng dạy tự động, quản lý lớp học và cá nhân hóa lộ trình cho từng học sinh được thực thi trực quan như thế nào trên nền tảng Edore.
              </p>
              
              <div className="flex items-center gap-3 flex-wrap">
                {isAuthenticated ? (
                  <Button asChild className="bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-bold shadow-md hover-elastic-button">
                    <Link href="/studio">Bắt đầu soạn bài</Link>
                  </Button>
                ) : (
                  <Button asChild className="bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-bold shadow-md hover-elastic-button">
                    <Link href="/register">Trải nghiệm ngay</Link>
                  </Button>
                )}

                <Button asChild variant="outline" className="border-slate-300 text-slate-800 hover:bg-slate-100 font-bold">
                  <Link href="#features" className="flex items-center gap-1.5">
                    Khám phá bài giảng mẫu <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>


          {/* ── VIDEO PLAYER CONTAINER PLACEHOLDER ────────────────────────────── */}
          <AnimateOnScroll>
            <div className="relative w-full min-h-[380px] md:min-h-[480px] bg-gradient-to-br from-[var(--color-primary-900)] via-[var(--color-primary-800)] to-slate-900 rounded-2xl md:rounded-3xl border border-blue-900/40 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 text-center group">
              
              {/* Lớp trang trí UI mockups đằng sau */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-mono text-slate-200 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                VIDEO HƯỚNG DẪN PLATFORM (PLACEHOLDER)
              </div>

              {/* Nút Play tương tác ở chính giữa */}
              <div className="relative z-10 flex flex-col items-center gap-4">
                <button
                  type="button"
                  aria-label="Phát video hướng dẫn"
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white text-[var(--color-primary-600)] flex items-center justify-center shadow-2xl group-hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border-4 border-white/20 hover-elastic-button"
                >
                  <PlayCircle className="w-10 h-10 md:w-12 md:h-12 fill-[var(--color-primary-600)] stroke-white" />
                </button>
                
                <div className="space-y-1">
                  <span className="text-sm md:text-base font-bold text-white tracking-wide block">
                    Xem Video Hướng Dẫn Soạn Kịch Bản 1-Click
                  </span>
                  <span className="text-xs text-blue-200/80 font-mono block">
                    Thời lượng: 1 phút 45 giây • Độ phân giải 4K HD
                  </span>
                </div>
              </div>
            </div>
          </AnimateOnScroll>


          {/* ── 4 BƯỚC CHÍNH MÔ TẢ LUỒNG CHẠY (DẠNG DẸP TĨNH / PHẲNG / KHÔNG ACTIVE STATE) ──────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {[
              {
                step: 1,
                title: "1. Chọn môn & Chủ đề",
                subtitle: "Lựa chọn khối lớp & nội dung",
                badgeColor: "bg-[var(--color-primary-500)] text-white",
              },
              {
                step: 2,
                title: "2. AI tạo kịch bản",
                subtitle: "Tự động đề xuất bài giảng 15s",
                badgeColor: "bg-[var(--color-secondary-500)] text-white",
              },
              {
                step: 3,
                title: "3. Tùy chỉnh & Xuất file",
                subtitle: "Giáo án chuẩn Bộ GD&ĐT",
                badgeColor: "bg-purple-600 text-white",
              },
              {
                step: 4,
                title: "4. Giảng dạy & Đánh giá",
                subtitle: "Trình chiếu & tương tác realtime",
                badgeColor: "bg-emerald-600 text-white",
              },
            ].map((item) => (
              <AnimateOnScroll key={item.step}>
                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex items-center gap-3 shadow-2xs hover-elastic">
                  <span className={`w-7 h-7 rounded-lg font-header font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${item.badgeColor}`}>
                    {item.step}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-header font-bold text-xs md:text-sm uppercase text-slate-800 truncate">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </section>


        {/* ── SECTION 4: PRICING (SỬA THEO DESIGN TOKENS: MÀU PRIMARY BRAND BLUE & CARD ALIGNMENT ĐỀU NHAU) ────── */}
        <section id="pricing" className="space-y-8 pt-4 scroll-mt-20 md:scroll-mt-24">
          
          {/* Header ở giữa */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-header font-bold text-3xl md:text-5xl tracking-tight text-slate-900">
              Bắt đầu trải nghiệm miễn phí
            </h2>
          </div>

          {/* Wrapper nền xám nhạt bo góc lớn */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-4 sm:p-6 md:p-8 space-y-6">
            
            {/* 1. HÀNG 3 THẺ TRẮNG Ở TRÊN (CĂN BẰNG NHAU 100% NHỜ GRID ITEMS-STRETCH & H-FULL) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch max-w-6xl mx-auto">
              
              {/* TOP WHITE CARD 1: STARTER */}
              <AnimateOnScroll className="h-full">
                <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200/80 flex flex-col justify-between h-full space-y-4 relative transition-elastic hover-elastic">
                  {isAuthenticated && user?.plan === "free" && (
                    <span className="absolute -top-3 left-6 px-3 py-0.5 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs flex items-center gap-1">
                      <Check className="w-3 h-3" /> Gói hiện tại
                    </span>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-header font-bold text-2xl tracking-tight text-slate-900">
                      Starter
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-body">
                      Công cụ đồng hành soạn giảng. Trải nghiệm kịch bản AI thế hệ mới miễn phí hàng tháng.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="font-header font-bold text-3xl md:text-4xl tracking-tight text-slate-900">
                      Free Plan
                    </div>

                    {isAuthenticated ? (
                      user?.plan === "free" ? (
                        <button disabled className="w-full bg-slate-100 text-slate-500 font-bold py-3 px-4 rounded-full text-xs md:text-sm cursor-not-allowed">
                          Đang sử dụng gói này
                        </button>
                      ) : (
                        <button onClick={togglePlan} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 px-4 rounded-full text-xs md:text-sm transition-all hover-elastic-button cursor-pointer">
                          Chuyển về Starter
                        </button>
                      )
                    ) : (
                      <Link href="/register" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 px-4 rounded-full text-xs md:text-sm transition-all hover-elastic-button flex items-center justify-center gap-2">
                        Trải nghiệm Miễn phí
                      </Link>
                    )}
                  </div>
                </div>
              </AnimateOnScroll>

              {/* TOP WHITE CARD 2: PRO PLAN (FEATURED FOCUS CARD VỚI ELASTIC POP EFFECT) */}
              <AnimateOnScroll className="h-full">
                <div className="bg-white rounded-3xl p-6 md:p-7 shadow-md border-2 border-[var(--color-primary-300)] flex flex-col justify-between h-full space-y-4 relative transition-elastic hover-elastic">
                  {isAuthenticated && user?.plan === "pro" && (
                    <span className="absolute -top-3 left-6 px-3 py-0.5 bg-[var(--color-primary-600)] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs flex items-center gap-1">
                      <Check className="w-3 h-3" /> Gói hiện tại
                    </span>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-header font-bold text-2xl tracking-tight text-slate-900">
                      Pro Plan
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-body">
                      Giải pháp toàn diện cho giáo viên chuyên nghiệp. Mở khóa toàn bộ sức mạnh AI kịch bản.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-baseline gap-1 font-header font-bold text-3xl md:text-4xl tracking-tight text-slate-900">
                      199.000đ <span className="text-sm font-normal text-slate-500 font-body">/Tháng</span>
                    </div>

                    {isAuthenticated ? (
                      user?.plan === "pro" ? (
                        <button disabled className="w-full bg-[var(--color-primary-600)] text-white font-bold py-3 px-4 rounded-full text-xs md:text-sm opacity-90 cursor-not-allowed">
                          Đang sử dụng gói PRO
                        </button>
                      ) : (
                        <button onClick={togglePlan} className="w-full bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-bold py-3 px-4 rounded-full text-xs md:text-sm shadow-md hover-elastic-button cursor-pointer">
                          Nâng cấp Pro Plan
                        </button>
                      )
                    ) : (
                      <Link href="/register" className="w-full bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-bold py-3 px-4 rounded-full text-xs md:text-sm shadow-md hover-elastic-button flex items-center justify-center gap-2">
                        Nâng cấp Pro Plan
                      </Link>
                    )}
                  </div>
                </div>
              </AnimateOnScroll>

              {/* TOP WHITE CARD 3: TEAM PLAN */}
              <AnimateOnScroll className="h-full">
                <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200/80 flex flex-col justify-between h-full space-y-4 relative transition-elastic hover-elastic">
                  <div className="space-y-2">
                    <h3 className="font-header font-bold text-2xl tracking-tight text-slate-900">
                      Team Plan
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-body">
                      Giải pháp dành cho tổ bộ môn & nhà trường. Quản lý tập trung, chia sẻ tài nguyên bài giảng.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-baseline gap-1 font-header font-bold text-3xl md:text-4xl tracking-tight text-slate-900">
                      499.000đ <span className="text-sm font-normal text-slate-500 font-body">/Tháng</span>
                    </div>

                    <Link href="/register" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 px-4 rounded-full text-xs md:text-sm transition-all hover-elastic-button flex items-center justify-center gap-2">
                      Đăng ký gói Team <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </AnimateOnScroll>

            </div>

            {/* 2. HÀNG BẢNG TÍNH NĂNG Ở DƯỚI (MỖI CỘT NẰM NGAY DƯỚI THẺ TRẮNG TƯƠNG ỨNG) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start max-w-6xl mx-auto pt-2">
              
              {/* TÍNH NĂNG CỘT 1 */}
              <div className="px-2 space-y-4">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block">
                  BẮT ĐẦU VỚI
                </span>

                <ul className="space-y-3">
                  {["(placeholder)", "(placeholder)", "(placeholder)", "(placeholder)", "(placeholder)"].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs md:text-sm font-medium text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border border-[var(--color-primary-200)] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* TÍNH NĂNG CỘT 2 */}
              <div className="px-2 space-y-4">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block">
                  BAO GỒM TẤT CẢ CỦA STARTER
                </span>

                <ul className="space-y-3">
                  {["(placeholder)", "(placeholder)", "(placeholder)", "(placeholder)", "(placeholder)"].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs md:text-sm font-medium text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border border-[var(--color-primary-200)] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* TÍNH NĂNG CỘT 3 */}
              <div className="px-2 space-y-4">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block">
                  BAO GỒM TẤT CẢ CỦA PRO
                </span>

                <ul className="space-y-3">
                  {["(placeholder)", "(placeholder)", "(placeholder)", "(placeholder)", "(placeholder)"].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs md:text-sm font-medium text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border border-[var(--color-primary-200)] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>


        {/* ── SECTION 5: REGISTER CTA BANNER (TEXT CĂN GIỮA + 2 SVG OVERLAY KÍCH THƯỚC LỚN HƠN NẰM SÁT ĐÁY) ── */}
        <section className="banner banner--hero shadow-md relative overflow-hidden rounded-2xl md:rounded-3xl p-6 sm:p-10 md:p-12 min-h-[340px] md:min-h-[380px] flex items-center justify-center">
          
          {/* SVG Overlay Trái: JoinIllustration */}
          <AnimateOnScroll className="absolute left-2 sm:left-4 md:left-6 lg:left-8 bottom-0 w-40 sm:w-56 md:w-72 lg:w-80 max-w-[320px] z-1 pointer-events-none hidden sm:block">
            <JoinIllustration className="w-full h-auto drop-shadow-xl" />
          </AnimateOnScroll>

          {/* Nội dung chữ ở giữa */}
          <AnimateOnScroll className="max-w-[500px] mx-auto text-center space-y-4 relative z-10 py-4 px-2">
            <h3 className="font-header font-bold text-2xl md:text-4xl uppercase tracking-tight text-white leading-tight">
              {isAuthenticated ? "Trải nghiệm Edore ngay" : "Tạo tài khoản Edore ngay"}
            </h3>

            <p className="text-xs md:text-sm text-blue-100/90 leading-relaxed font-body">
              {isAuthenticated
                ? "Bắt đầu soạn kịch bản bài giảng và khám phá các công cụ hỗ trợ trực quan ngay hôm nay."
                : "Đăng ký tài khoản miễn phí để bắt đầu soạn kịch bản bài giảng và nhận tư vấn hỗ trợ trực tiếp khi cần."}
            </p>

            <div className="pt-1 flex justify-center">
              {isAuthenticated ? (
                <Button asChild size="lg" className="bg-white text-[var(--color-primary-600)] hover:bg-slate-100 font-bold shadow-lg hover-elastic-button whitespace-nowrap">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    Trải nghiệm ngay <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-white text-[var(--color-primary-600)] hover:bg-slate-100 font-bold shadow-lg hover-elastic-button whitespace-nowrap">
                  <Link href="/register" className="flex items-center gap-2">
                    Đăng ký ngay <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>
          </AnimateOnScroll>

          {/* SVG Overlay Phải: ArticlesIllustration */}
          <AnimateOnScroll className="absolute right-2 sm:right-4 md:right-6 lg:right-8 bottom-0 w-40 sm:w-56 md:w-72 lg:w-80 max-w-[320px] z-1 pointer-events-none hidden sm:block">
            <ArticlesIllustration className="w-full h-auto drop-shadow-xl" />
          </AnimateOnScroll>

        </section>

      </div>
    </div>
  );
}

