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





function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TiktokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.32-6.33V9.66a8.16 8.16 0 0 0 4.88 1.6V7.8a4.85 4.85 0 0 1-1-.11z" />
    </svg>
  );
}

export function AppFooter() {
  return (
    <footer className="w-full bg-white border-t border-[var(--color-neutral-200)] py-8 px-4 md:px-8 font-body">
      {/* ── FOOTER CONTAINER CARD VỚI ĐỔ BÓNG NỔI BẬT RÕ NÉT NỀN TRẮNG ──────────────────────── */}
      <div className="max-w-[1400px] mx-auto bg-white border border-[var(--color-neutral-200)] shadow-[0_12px_40px_-5px_rgba(0,0,0,0.12)] rounded-2xl md:rounded-3xl p-6 md:p-10 relative overflow-hidden">

        {/* ── 3 CỘT NỘI DUNG ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[var(--color-neutral-200)]">
          
          {/* Cột 1: Thương hiệu, Phone/Email + Các Nền tảng MXH (Span 7) */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center gap-3">
              <EdoreLogo size={42} />
              <span className="font-header font-bold text-3xl tracking-tight text-[var(--color-primary-500)]">
                EDORE
              </span>
            </div>

            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-body max-w-xl">
              Nền tảng công nghệ giáo dục (Ed-Tech) giúp tự động hóa soạn thảo kịch bản giảng dạy, quản lý lớp học và cá nhân hóa trải nghiệm học tập.
            </p>

            {/* Thông tin liên hệ */}
            <div className="space-y-2 pt-1 text-xs text-slate-700">
              <div className="flex items-center gap-2.5">
                <MailIcon className="w-4 h-4 text-[var(--color-primary-500)] shrink-0" />
                <span className="text-slate-600">
                  Email: <a href="mailto:support.edore@gmail.com" className="text-slate-900 font-semibold hover:underline">support.edore@gmail.com</a>
                </span>
              </div>
            </div>

            {/* Các Nền tảng Mạng xã hội (Chỉ Facebook & TikTok) */}
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
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Edore"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white transition-all text-slate-600"
              >
                <TiktokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Cột 2: Trang hệ thống (Span 5) */}
          <div className="md:col-span-5 md:flex md:flex-col md:items-end space-y-3">
            <div className="space-y-3">
              <h4 className="font-header font-bold text-sm uppercase tracking-wider text-slate-900">
                Trang hệ thống
              </h4>
              <ul className="space-y-2.5 text-xs list-none p-0 m-0 text-slate-600">
                <li>
                  <Link href="/" className="hover:text-[var(--color-primary-600)] transition-colors block font-medium">
                    Landing Page
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[var(--color-primary-600)] transition-colors block font-medium">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/guide" className="hover:text-[var(--color-primary-600)] transition-colors block font-medium">
                    User Guide
                  </Link>
                </li>
              </ul>
            </div>
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
