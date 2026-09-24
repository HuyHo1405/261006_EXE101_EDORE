"use client";

/**
 * AppFooter — Footer dạng Container Card với Placeholders & Căn giữa Bản quyền
 *
 * Cấu trúc theo yêu cầu:
 * - Cột 1: Placeholder Phone, Email, Địa chỉ + Icon Các Nền tảng Mạng xã hội (dời lên trên)
 * - Cột 2: FEAT A / B / C / D (Danh sách tính năng placeholder)
 * - Cột 3: Đã bỏ
 * - Cột 4: Giữ lại với nhãn [Chưa làm] để xác định trang chưa phát triển
 * - Thanh dưới: Bỏ hệ thống hoạt động 99%, căn giữa dòng Bản quyền.
 */

import React from "react";
import Link from "next/link";
import { EdoreLogo } from "../Header/EdoreLogo";

// ── SVG Icons ────────────────────────────────────────────────────────────────

function MailIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function PhoneIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.826-1.47-5.11-3.754-6.58-6.58l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function MapPinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export function AppFooter() {
  return (
    <footer className="w-full bg-white border-t border-[var(--color-neutral-200)] py-8 px-4 md:px-8 font-body">
      {/* ── FOOTER CONTAINER CARD VỚI ĐỔ BÓNG NỔI BẬT RÕ NÉT NỀN TRẮNG ──────────────────────── */}
      <div className="max-w-[1400px] mx-auto bg-white border border-[var(--color-neutral-200)] shadow-[0_12px_40px_-5px_rgba(0,0,0,0.12)] rounded-2xl md:rounded-3xl p-6 md:p-10 relative overflow-hidden">

        {/* ── 3 CỘT NỘI DUNG (CỘT 3 ĐÃ BỎ HẲN) ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[var(--color-neutral-200)]">
          
          {/* Cột 1: Thương hiệu, Placeholders Phone/Email/Địa chỉ + Các Nền tảng MXH (Span 5) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <EdoreLogo size={42} />
              <span className="font-header font-bold text-3xl tracking-tight text-[var(--color-primary-500)]">
                EDORE
              </span>
            </div>

            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-body">
              Nền tảng công nghệ giáo dục (Ed-Tech) giúp tự động hóa soạn thảo kịch bản giảng dạy, quản lý lớp học và cá nhân hóa trải nghiệm học tập.
            </p>

            {/* Placeholders cho thông tin liên hệ */}
            <div className="space-y-2 pt-1 text-xs text-slate-700">
              <div className="flex items-center gap-2.5">
                <PhoneIcon className="w-4 h-4 text-[var(--color-primary-500)] shrink-0" />
                <span className="text-slate-500 font-mono">
                  Phone: <strong className="text-slate-900 font-sans">[Phone Placeholder: 0123 456 789]</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <MailIcon className="w-4 h-4 text-[var(--color-primary-500)] shrink-0" />
                <span className="text-slate-500 font-mono">
                  Email: <strong className="text-slate-900 font-sans">[Email Placeholder: contact@example.com]</strong>
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPinIcon className="w-4 h-4 text-[var(--color-primary-500)] shrink-0 mt-0.5" />
                <span className="text-slate-500 font-mono">
                  Địa chỉ: <strong className="text-slate-900 font-sans">[Địa chỉ công ty Placeholder: Đang cập nhật]</strong>
                </span>
              </div>
            </div>

            {/* Các Nền tảng Mạng xã hội đưa lên Cột 1 */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Edore"
                className="p-2 rounded-xl bg-slate-100 hover:bg-[var(--color-primary-500)] hover:text-white transition-all text-slate-600"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Edore"
                className="p-2 rounded-xl bg-slate-100 hover:bg-red-600 hover:text-white transition-all text-slate-600"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Edore"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-800 hover:text-white transition-all text-slate-600"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Cột 2: Tính năng dạng Placeholder FEAT A, B, C, D (Span 4) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-header font-bold text-sm uppercase tracking-wider text-slate-900">
              Tính năng & Sản phẩm (FEAT)
            </h4>
            <ul className="space-y-2.5 text-xs list-none p-0 m-0 text-slate-600">
              <li>
                <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-[var(--color-primary-700)] rounded border border-blue-200">
                    FEAT A
                  </span>
                  [FEAT A Placeholder: Tính năng A]
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-[var(--color-primary-700)] rounded border border-blue-200">
                    FEAT B
                  </span>
                  [FEAT B Placeholder: Tính năng B]
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-[var(--color-primary-700)] rounded border border-blue-200">
                    FEAT C
                  </span>
                  [FEAT C Placeholder: Tính năng C]
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-[var(--color-primary-700)] rounded border border-blue-200">
                    FEAT D
                  </span>
                  [FEAT D Placeholder: Tính năng D]
                </span>
              </li>
            </ul>
          </div>

          {/* Cột 4: Trang hệ thống & Nhãn [Chưa làm] (Span 3) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-header font-bold text-sm uppercase tracking-wider text-slate-900">
              Trang hệ thống
            </h4>
            <ul className="space-y-2 text-xs list-none p-0 m-0 text-slate-600">
              <li className="flex items-center justify-between gap-2">
                <Link href="/help" className="hover:text-[var(--color-primary-500)] transition-colors">
                  Trung tâm trợ giúp
                </Link>
                <span className="px-1.5 py-0.5 text-[9px] font-bold text-amber-700 bg-amber-100/90 rounded border border-amber-300 shrink-0">
                  Chưa làm
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <Link href="/guide" className="hover:text-[var(--color-primary-500)] transition-colors">
                  Hướng dẫn sử dụng
                </Link>
                <span className="px-1.5 py-0.5 text-[9px] font-bold text-amber-700 bg-amber-100/90 rounded border border-amber-300 shrink-0">
                  Chưa làm
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <Link href="/about" className="hover:text-[var(--color-primary-500)] transition-colors">
                  Về Edore Platform
                </Link>
                <span className="px-1.5 py-0.5 text-[9px] font-bold text-amber-700 bg-amber-100/90 rounded border border-amber-300 shrink-0">
                  Chưa làm
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <Link href="/privacy" className="hover:text-[var(--color-primary-500)] transition-colors">
                  Chính sách bảo mật
                </Link>
                <span className="px-1.5 py-0.5 text-[9px] font-bold text-amber-700 bg-amber-100/90 rounded border border-amber-300 shrink-0">
                  Chưa làm
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <Link href="/terms" className="hover:text-[var(--color-primary-500)] transition-colors">
                  Điều khoản dịch vụ
                </Link>
                <span className="px-1.5 py-0.5 text-[9px] font-bold text-amber-700 bg-amber-100/90 rounded border border-amber-300 shrink-0">
                  Chưa làm
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* ── THANH BẢN QUYỀN CĂN GIỮA ───────────────────────── */}
        <div className="pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} <strong className="text-slate-800 font-semibold">EDORE PLATFORM INC</strong>. Tất cả quyền được bảo lưu.
        </div>

      </div>
    </footer>
  );
}
