"use client";

/**
 * AuthLayout — Layout 2 Cột Fit 100% Viewport (Không cuộn trang / No Scroll):
 * - Cột Trái: Form Đăng nhập / Đăng ký với Logo & nội dung
 * - Cột Phải: Dot-Grid Hero Banner (mono-primary) kết hợp Ideas Flow SVG Illustration
 */

import Link from "next/link";
import { GuestGuard } from "@/features/auth/components/GuestGuard";
import { IdeasFlowIllustration } from "@/components/illustrations/IdeasFlowIllustration";

function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      {/* Khóa vừa khít 100vh viewport, không có thanh cuộn (overflow-hidden) */}
      <div className="h-screen max-h-screen w-full bg-white p-3 sm:p-4 lg:p-5 flex items-center justify-center font-body overflow-hidden">
        <div className="w-full max-w-[1400px] h-full max-h-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch overflow-hidden">
          
          {/* ── CỘT TRÁI (FORM SIDE): NỘI DUNG CĂN TỪ ĐỈNH GIỮ NGUYÊN VỊ TRÍ LOGO Y-AXIS ── */}
          <div className="lg:col-span-6 flex flex-col justify-start items-center p-3 sm:p-6 lg:p-8 h-full overflow-hidden">
            <div className="w-full max-w-md mx-auto flex flex-col justify-start pt-1 sm:pt-3 lg:pt-4">
              {children}
            </div>
          </div>

          {/* ── CỘT PHẢI (HERO BANNER DOT-GRID + ILLUSTRATION - 6 SPAN): FIT VIEWPORT ─────────── */}
          <div 
            className="lg:col-span-6 hidden lg:flex flex-col justify-start p-8 xl:p-12 rounded-[var(--radius-2xl)] text-white relative overflow-hidden isolate shadow-xl h-full max-h-full select-none transform-gpu"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.18) 1.5px, transparent 1.5px), linear-gradient(135deg, var(--color-primary-300), var(--color-primary-500) 55%, var(--color-primary-800))`,
              backgroundSize: "18px 18px, 100% 100%",
            }}
          >
            {/* Top Row: Dòng nhãn trên cùng căn giữa với nút Icon CTA */}
            <div className="relative z-10 w-full flex items-center justify-between gap-4 pt-1 xl:pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-white/80">
                CHÀO MỪNG TRỞ LẠI
              </div>

              <div className="shrink-0">
                <Link
                  href="/register"
                  className="group relative inline-flex items-center gap-2 bg-white text-[var(--color-primary-600)] font-bold text-sm h-10 px-3.5 hover:px-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ease-out hover:scale-105 active:scale-95 transform-gpu"
                  title="Bắt đầu ngay"
                >
                  <ArrowRightIcon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                  <span className="hidden group-hover:inline-block transition-opacity duration-200 ease-out whitespace-nowrap">
                    Bắt đầu ngay
                  </span>
                </Link>
              </div>
            </div>

            {/* Main Text Block: Tiêu đề & Mô tả xếp phía dưới với khoảng cách tiêu chuẩn */}
            <div className="relative z-10 flex flex-col justify-start items-start max-w-[360px] xl:max-w-[440px] pt-4 xl:pt-6 space-y-3 xl:space-y-4">
              <h2 className="font-header font-extrabold text-3xl xl:text-4xl text-white tracking-tight leading-[1.08] uppercase drop-shadow-sm">
                Ý tưởng thành hành động
              </h2>
              <p className="text-sm xl:text-base text-white/85 font-normal leading-relaxed">
                Biến quy trình rời rạc thành một luồng làm việc liền mạch cho cả đội ngũ.
              </p>
            </div>

            {/* Overflow Illustration (Optimized GPU) */}
            <div className="absolute -right-12 -bottom-12 lg:-right-16 lg:-bottom-16 w-[540px] lg:w-[640px] xl:w-[720px] z-1 pointer-events-none opacity-95 transform-gpu">
              <IdeasFlowIllustration className="w-full h-auto block" />
            </div>

          </div>

        </div>
      </div>
    </GuestGuard>
  );
}
