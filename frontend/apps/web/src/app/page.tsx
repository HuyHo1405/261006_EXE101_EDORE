"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { CreativeFlowIllustration } from "@/components/illustrations/CreativeFlowIllustration";
import { JoinIllustration } from "@/components/illustrations/JoinIllustration";
import { ArticlesIllustration } from "@/components/illustrations/ArticlesIllustration";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";
import { subscriptionService } from "@/features/subscription/api/subscriptionService";
import { SubscriptionPlanDTO } from "@edore/types";
import {
  Sparkles,
  BookOpen,
  Users,
  BarChart3,
  ArrowRight,
  PlayCircle,
  Check,
  CornerDownRight,
} from "@/components/ui/icons";

const DEFAULT_STARTER_FEATURES = [
  "Khởi tạo tối đa 3 Khóa học & Lớp học",
  "AI phân tích theo bộ dữ liệu nội bộ chuẩn hóa (không cần tải file)",
  "Biên soạn tiến trình kịch bản bài giảng cơ bản",
  "Xuất kịch bản bài học dạng văn bản",
  "Hỗ trợ kỹ thuật qua Email",
];

const DEFAULT_PRO_FEATURES = [
  "Không giới hạn số lượng Khóa học & Lớp học",
  "Khai thác toàn bộ kho dữ liệu nội bộ chuyên sâu đa môn học",
  "Dòng thời gian tương tác & chuyển bước bài giảng đầy đủ",
  "Trả bài sôi nổi: Vòng quay may mắn (Lucky Wheel)",
  "Xuất file câu hỏi trắc nghiệm, doc bài giảng & mẫu Kahoot",
  "Lưu trữ và tái sử dụng ngân hàng kịch bản không giới hạn",
];



const formatFeatureText = (text: string): string => {
  return text
    .replace(/Studio Timeline/gi, "Dòng thời gian kịch bản")
    .replace(/Timeline/gi, "Tiến trình kịch bản")
    .replace(/Sidebar Gợi ý Hoạt động Sư phạm cá nhân hóa/gi, "Bảng gợi ý hoạt động sư phạm cá nhân hóa")
    .replace(/Sidebar Gợi ý/gi, "Bảng gợi ý")
    .replace(/Sidebar/gi, "Bảng điều khiển")
    .replace(/AI Phân tích tài liệu PDF\/Word \(tối đa 10 trang\)/gi, "AI phân tích theo bộ dữ liệu nội bộ chuẩn hóa")
    .replace(/AI Phân tích tài liệu & bài trình chiếu nâng cao/gi, "Khai thác kho dữ liệu nội bộ chuyên sâu đa môn học")
    .replace(/AI Phân tích tài liệu & Slide giảng dạy nâng cao/gi, "Khai thác kho dữ liệu nội bộ chuyên sâu đa môn học")
    .replace(/\(Text\)/gi, "")
    .replace(/Slide giảng dạy/gi, "Trang trình chiếu")
    .replace(/Slide/gi, "Trang trình chiếu")
    .trim();
};

export default function Home() {
  const { user, isAuthenticated } = useAuthStore();
  const [plans, setPlans] = useState<SubscriptionPlanDTO[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  useEffect(() => {
    subscriptionService
      .getActivePlans()
      .then((data) => {
        setPlans(data || []);
      })
      .catch(() => {
        setPlans([]);
      })
      .finally(() => {
        setIsLoadingPlans(false);
      });
  }, []);

  const isStarterMatch = (name: string) => {
    const n = name.toLowerCase();
    return n.includes("starter") || n.includes("cơ bản") || n.includes("khởi đầu") || n.includes("miễn phí");
  };
  const isProMatch = (name: string) => {
    const n = name.toLowerCase();
    return n.includes("pro") || n.includes("chuyên nghiệp") || n.includes("nâng cao");
  };
  const isTeamMatch = (name: string) => {
    const n = name.toLowerCase();
    return n.includes("team") || n.includes("đội ngũ") || n.includes("đội nhóm") || n.includes("trường học");
  };

  const starterPlan = plans.find((p) => isStarterMatch(p.name) && p.features?.length > 0) || plans.find((p) => isStarterMatch(p.name));
  const proPlan = plans.find((p) => isProMatch(p.name) && p.features?.length > 0) || plans.find((p) => isProMatch(p.name));
  const teamPlan = plans.find((p) => isTeamMatch(p.name) && p.features?.length > 0) || plans.find((p) => isTeamMatch(p.name));

  const starterFeatures = (starterPlan?.features && starterPlan.features.length > 0
    ? starterPlan.features
    : DEFAULT_STARTER_FEATURES
  ).map(formatFeatureText);

  const proFeatures = (proPlan?.features && proPlan.features.length > 0
    ? proPlan.features
    : DEFAULT_PRO_FEATURES
  ).map(formatFeatureText);



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


        {/* ── SECTION 2: FEATURES (CÁC TÍNH NĂNG NỔI BẬT THEO LUỒNG KHÓA HỌC) ─────────────────────────── */}
        <section id="features" className="space-y-8 pt-2 scroll-mt-20 md:scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-header font-bold text-3xl md:text-4xl uppercase tracking-tight text-slate-900">
              Công cụ soạn kịch bản & quản lý khóa học toàn diện
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-body">
              Edore cung cấp giải pháp tự động hóa kịch bản từ bộ dữ liệu nội bộ chuẩn hóa, tùy chỉnh dòng thời gian bài giảng và bộ công cụ đi kèm hỗ trợ lớp học trực quan.
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
                    Cấu hình Khóa học & Lớp
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    Thiết lập thông tin khóa học, chọn tham số thời lượng tiết học, sĩ số và bố trí không gian phòng học vật lý chuẩn hóa.
                  </p>
                </div>
                <Link href="/dashboard" className="pt-4 flex items-center text-xs font-bold text-[var(--color-primary-600)] group-hover:translate-x-1 transition-transform">
                  Vào Quản lý Khóa học <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </AnimateOnScroll>

            {/* Feature 2: PHÂN TÍCH AI TỪ BỘ DỮ LIỆU NỘI BỘ, KHÔNG CẦN TẢI FILE */}
            <AnimateOnScroll className="h-full">
              <div className="group bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[var(--color-primary-300)] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-[var(--color-secondary-600)] border border-amber-200 flex items-center justify-center group-hover:bg-[var(--color-secondary-500)] group-hover:text-white transition-colors">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-header font-bold text-xl uppercase tracking-tight text-slate-900">
                    Phân Tích AI Từ Dữ Liệu Nội Bộ
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    Tận dụng tri thức và chương trình giáo dục tích hợp sẵn trong bộ dữ liệu nội bộ chuẩn hóa của Edore để AI tự động trích xuất và tạo kịch bản bài học mà không cần tải file lên.
                  </p>
                </div>
                <Link href="/dashboard" className="pt-4 flex items-center text-xs font-bold text-[var(--color-secondary-600)] group-hover:translate-x-1 transition-transform">
                  Khám phá kịch bản AI <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </AnimateOnScroll>

            {/* Feature 3: BIÊN SOẠN DÒNG THỜI GIAN BÀI GIẢNG (ĐIỀU HƯỚNG /dashboard) */}
            <AnimateOnScroll className="h-full">
              <div className="group bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[var(--color-primary-300)] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-header font-bold text-xl uppercase tracking-tight text-slate-900">
                    Biên Soạn Dòng Thời Gian Bài Giảng
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    Trình biên soạn kịch bản dạng dòng thời gian trực quan, giúp sắp xếp thứ tự và chuyển bước bài giảng dễ dàng khi đứng lớp.
                  </p>
                </div>
                <Link href="/dashboard" className="pt-4 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                  Mở trình soạn kịch bản <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </AnimateOnScroll>

            {/* Feature 4: TIỆN ÍCH ĐI KÈM & TRẢ BÀI (LUCKY WHEEL, XUẤT CÂU HỎI, DOC, KAHOOT) */}
            <AnimateOnScroll className="h-full">
              <div className="group bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-[var(--color-primary-300)] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h3 className="font-header font-bold text-xl uppercase tracking-tight text-slate-900">
                    Tiện Ích Đi Kèm & Trả Bài
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    Tích hợp vòng quay may mắn (Lucky Wheel) trả bài tương tác sôi nổi; xuất dữ liệu câu hỏi trắc nghiệm, tài liệu bài giảng (Docx/PDF) và mẫu Kahoot dễ dàng.
                  </p>
                </div>
                <Link href="/dashboard/tra-bai" className="pt-4 flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                  Trải nghiệm trả bài tương tác <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
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
                    <Link href="/dashboard">Bắt đầu soạn bài</Link>
                  </Button>
                ) : (
                  <Button asChild className="bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-bold shadow-md hover-elastic-button">
                    <Link href="/register">Trải nghiệm ngay</Link>
                  </Button>
                )}

                <Button asChild variant="outline" className="border-slate-300 text-slate-800 hover:bg-slate-100 font-bold">
                  <Link href="/guide" className="flex items-center gap-1.5">
                    Tài liệu hướng dẫn <ArrowRight className="w-4 h-4" />
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
                VIDEO HƯỚNG DẪN NỀN TẢNG (MINH HỌA)
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
                    Xem Video Hướng Dẫn Soạn Kịch Bản Nhanh Chóng
                  </span>
                  <span className="text-xs text-blue-200/80 font-mono block">
                    Thời lượng: 1 phút 45 giây • Độ phân giải 4K HD
                  </span>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </section>


        {/* ── SECTION 4: PRICING (BẢNG GIÁ DỊCH VỤ VỚI CỘT TÍNH NĂNG CHI TIẾT BÊN DƯỚI) ────────────────────────── */}
        <section id="pricing" className="space-y-8 pt-4 scroll-mt-20 md:scroll-mt-24">

          {/* Header ở giữa */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-header font-bold text-3xl md:text-5xl tracking-tight text-slate-900">
              Bắt đầu trải nghiệm miễn phí
            </h2>
          </div>

          {/* Wrapper nền xám nhạt bo góc lớn */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-4 sm:p-6 md:p-8 space-y-6">

            {/* 1. HÀNG 3 THẺ TRẮNG Ở TRÊN (STARTER, PRO PLAN, TEAM PLAN) */}
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
                      Gói Cơ Bản
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-body">
                      {starterPlan?.description || "Công cụ đồng hành soạn giảng. Trải nghiệm kịch bản AI thế hệ mới miễn phí hàng tháng."}
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="font-header font-bold text-3xl md:text-4xl tracking-tight text-slate-900">
                      Miễn phí
                    </div>

                    {isAuthenticated ? (
                      user?.plan === "free" ? (
                        <button disabled className="w-full bg-slate-100 text-slate-500 font-bold py-3 px-4 rounded-full text-xs md:text-sm cursor-not-allowed">
                          Đang sử dụng gói này
                        </button>
                      ) : (
                        <button disabled className="w-full bg-slate-100 text-slate-500 font-bold py-3 px-4 rounded-full text-xs md:text-sm cursor-not-allowed">
                          Đang sử dụng gói Chuyên nghiệp
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
                      Gói Chuyên Nghiệp
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-body">
                      {proPlan?.description || "Giải pháp toàn diện cho giáo viên chuyên nghiệp. Mở khóa toàn bộ sức mạnh AI kịch bản."}
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-baseline gap-1 font-header font-bold text-3xl md:text-4xl tracking-tight text-slate-900">
                      {proPlan?.price ? `${proPlan.price.toLocaleString("vi-VN")}đ` : "199.000đ"} <span className="text-sm font-normal text-slate-500 font-body">/Tháng</span>
                    </div>

                    {isAuthenticated ? (
                      user?.plan === "pro" ? (
                        <button disabled className="w-full bg-[var(--color-primary-600)] text-white font-bold py-3 px-4 rounded-full text-xs md:text-sm opacity-90 cursor-not-allowed">
                          Đang sử dụng gói Chuyên nghiệp
                        </button>
                      ) : (
                        <Link href="/dashboard/profile?tab=subscription" className="w-full bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-bold py-3 px-4 rounded-full text-xs md:text-sm shadow-md hover-elastic-button flex items-center justify-center gap-2">
                          Nâng cấp gói Chuyên nghiệp
                        </Link>
                      )
                    ) : (
                      <Link href="/register" className="w-full bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-bold py-3 px-4 rounded-full text-xs md:text-sm shadow-md hover-elastic-button flex items-center justify-center gap-2">
                        Nâng cấp gói Chuyên nghiệp
                      </Link>
                    )}
                  </div>
                </div>
              </AnimateOnScroll>

              {/* TOP WHITE CARD 3: TEAM PLAN (ĐANG PHÁT TRIỂN) */}
              <AnimateOnScroll className="h-full">
                <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200/80 flex flex-col justify-between h-full space-y-4 relative transition-elastic hover-elastic opacity-85">
                  <span className="absolute -top-3 right-6 px-3 py-0.5 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs">
                    Đang phát triển
                  </span>

                  <div className="space-y-2">
                    <h3 className="font-header font-bold text-2xl tracking-tight text-slate-900">
                      Gói Đội Ngũ
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-body">
                      {teamPlan?.description || "Giải pháp dành cho tổ bộ môn & nhà trường. Quản lý tập trung, chia sẻ tài nguyên bài giảng."}
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-baseline gap-1 font-header font-bold text-3xl md:text-4xl tracking-tight text-slate-400">
                      499.000đ <span className="text-sm font-normal text-slate-400 font-body">/Tháng</span>
                    </div>

                    <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-3 px-4 rounded-full text-xs md:text-sm cursor-not-allowed flex items-center justify-center gap-2">
                      Đang phát triển
                    </button>
                  </div>
                </div>
              </AnimateOnScroll>

            </div>

            {/* 2. HÀNG BẢNG TÍNH NĂNG CHI TIẾT Ở DƯỚI (MỖI CỘT NẰM NGAY DƯỚI THẺ TRẮNG TƯƠNG ỨNG) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start max-w-6xl mx-auto pt-2">

              {/* TÍNH NĂNG CỘT 1: STARTER */}
              <div className="px-2 space-y-4">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block">
                  GÓI CƠ BẢN BAO GỒM
                </span>

                {isLoadingPlans ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-body py-2">
                    <div className="w-3.5 h-3.5 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin" />
                    <span>Đang kết nối dữ liệu gói dịch vụ...</span>
                  </div>
                ) : starterFeatures.length > 0 ? (
                  <ul className="space-y-3">
                    {starterFeatures.map((feat: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 text-xs md:text-sm font-medium text-slate-600">
                        <span className="w-5 h-5 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border border-[var(--color-primary-200)] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2 font-body">
                    Hệ thống đang cập nhật tính năng...
                  </p>
                )}
              </div>

              {/* TÍNH NĂNG CỘT 2: PRO PLAN */}
              <div className="px-2 space-y-4">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block">
                  BAO GỒM TOÀN BỘ GÓI CƠ BẢN VÀ:
                </span>

                {isLoadingPlans ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-body py-2">
                    <div className="w-3.5 h-3.5 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin" />
                    <span>Đang kết nối dữ liệu gói dịch vụ...</span>
                  </div>
                ) : proFeatures.length > 0 ? (
                  <ul className="space-y-3">
                    {proFeatures.map((feat: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 text-xs md:text-sm font-medium text-slate-600">
                        <span className="w-5 h-5 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border border-[var(--color-primary-200)] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2 font-body">
                    Hệ thống đang cập nhật tính năng...
                  </p>
                )}
              </div>

              {/* TÍNH NĂNG CỘT 3: TEAM PLAN (ĐANG PHÁT TRIỂN) */}
              <div className="px-2 space-y-3">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block">
                  THÔNG TIN GÓI ĐỘI NGŨ
                </span>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-dashed border-slate-200 text-slate-600 space-y-2">
                  <p className="text-xs md:text-sm font-medium leading-relaxed font-body text-slate-700">
                    Tính năng đang trong lộ trình phát triển &amp; thử nghiệm cùng các nhà trường.
                  </p>
                  <p className="text-[11px] text-slate-500 font-body leading-relaxed">
                    Dự kiến hỗ trợ quản lý tập trung cho tổ bộ môn, chia sẻ kho học liệu dùng chung và phân quyền chuyên môn giữa các giáo viên.
                  </p>
                </div>
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

