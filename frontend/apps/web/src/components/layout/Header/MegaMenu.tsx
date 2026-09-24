"use client";

/**
 * MegaMenu — Builder.io Style Smooth Slide-Down & Slide-Up Transformation
 *
 * Hiệu ứng chuyển động (Transformation):
 * - Hover mở: Slide down từ trên xuống mượt mà (translate-y-0 opacity-100).
 * - Hết hover (Close): Slide up ngược lên trên ( -translate-y-6 opacity-0 ) trước khi unmount.
 * - Sử dụng CSS Cubic-Bezier Spring curve `cubic-bezier(0.16, 1, 0.3, 1)` cho trải nghiệm tự nhiên.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, LogOut } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface Subject {
  id: string;
  name: string;
  href: string;
}

export interface Classroom {
  id: string;
  name: string;
  href: string;
}

export interface MegaMenuProps {
  isOpen: boolean;
  subjects: Subject[];
  classrooms: Classroom[];
  isLoadingSubjects?: boolean;
  isLoadingClassrooms?: boolean;
  isAuthenticated?: boolean;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onLogout?: () => void;
}

const accountLinks = [
  { label: "Thông tin cá nhân", href: "/profile" },
  { label: "Bảng giá dịch vụ",  href: "/pricing" },
  { label: "Môn học của tôi",   href: "/my-subjects" },
  { label: "Soạn bài giảng",    href: "/dashboard/scripts/new" },
];

export function MegaMenu({
  isOpen,
  subjects,
  classrooms,
  isLoadingSubjects = false,
  isLoadingClassrooms = false,
  isAuthenticated = false,
  onClose,
  onMouseEnter,
  onMouseLeave,
  onLogout,
}: MegaMenuProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  useEffect(() => {
    let animTimer: NodeJS.Timeout;
    let unmountTimer: NodeJS.Timeout;

    if (isOpen) {
      setShouldRender(true);
      // Đợi element render vào DOM trước khi kích hoạt transition trượt xuống
      animTimer = setTimeout(() => {
        setIsAnimatingIn(true);
      }, 20);
    } else {
      // Kích hoạt transition trượt ngược lên trên
      setIsAnimatingIn(false);
      // Đợi hiệu ứng trượt lên kết thúc (300ms) rồi mới unmount khỏi DOM
      unmountTimer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
    }

    return () => {
      clearTimeout(animTimer);
      clearTimeout(unmountTimer);
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop mờ fade-in khi trượt xuống & fade-out khi trượt lên */}
      <div
        className={cn(
          "fixed inset-0 top-[84px] z-40 bg-slate-900/10 backdrop-blur-[2px] transition-opacity duration-300 ease-out",
          isAnimatingIn ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Panel Container — Slide Down khi Hover & Slide Up khi Unhover */}
      <div
        className={cn(
          "absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 max-w-[1400px] w-[calc(100%-48px)] z-50 bg-white/98 backdrop-blur-xl border border-[var(--color-neutral-200)] rounded-2xl shadow-2xl overflow-hidden origin-top transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[transform,opacity]",
          isAnimatingIn
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 -translate-y-6 scale-95 pointer-events-none"
        )}
        role="dialog"
        aria-label="Menu điều hướng"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-6 flex flex-col md:flex-row gap-6 md:gap-0">
          {/* ── Cột 1: Môn học (Dạng 2 cột) ─────────────────────────────── */}
          <div className="flex-[1.4] min-w-0 px-0 md:px-6 first:pl-0 border-b md:border-b-0 md:border-r border-[var(--color-neutral-200)] pb-4 md:pb-0">
            <p className="font-body text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-500)] mb-3">
              Môn học
            </p>
            {isLoadingSubjects ? (
              <SkeletonList count={4} />
            ) : subjects.length === 0 ? (
              <EmptyState
                message="Bạn chưa có môn học nào"
                cta={{ label: "Khám phá môn học", href: "/subjects" }}
                onClose={onClose}
              />
            ) : (
              <ul className="grid grid-cols-2 gap-x-2 gap-y-1 list-none p-0 m-0" role="list">
                {subjects.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={s.href}
                      className="block w-full text-left px-3 py-2 text-sm font-body text-[var(--color-neutral-800)] rounded-[var(--radius-sm)] transition-all duration-200 ease-out hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)] hover:pl-4"
                      onClick={onClose}
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Cột 2: Lớp học (Dạng 2 cột) ─────────────────────────────── */}
          <div className="flex-[1.4] min-w-0 px-0 md:px-6 border-b md:border-b-0 md:border-r border-[var(--color-neutral-200)] pb-4 md:pb-0">
            <p className="font-body text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-500)] mb-3">
              Lớp học
            </p>
            {isLoadingClassrooms ? (
              <SkeletonList count={4} />
            ) : classrooms.length === 0 ? (
              <EmptyState
                message="Bạn chưa có lớp học nào"
                cta={{ label: "Tham gia lớp học", href: "/classrooms" }}
                onClose={onClose}
              />
            ) : (
              <ul className="grid grid-cols-2 gap-x-2 gap-y-1 list-none p-0 m-0" role="list">
                {classrooms.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={c.href}
                      className="block w-full text-left px-3 py-2 text-sm font-body text-[var(--color-neutral-800)] rounded-[var(--radius-sm)] transition-all duration-200 ease-out hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)] hover:pl-4"
                      onClick={onClose}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Cột 3: Tài khoản ───────────────────────────── */}
          <div className="flex-1 min-w-0 px-0 md:px-6 last:pr-0">
            <p className="font-body text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-500)] mb-3">
              Tài khoản
            </p>
            <ul className="flex flex-col gap-1 list-none p-0 m-0" role="list">
              {isAuthenticated
                ? accountLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block w-full text-left px-3 py-2 text-sm font-body text-[var(--color-neutral-800)] rounded-[var(--radius-sm)] transition-all duration-200 ease-out hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)] hover:pl-4"
                        onClick={onClose}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))
                : (
                  <li>
                    <Link
                      href="/login"
                      className="block w-full text-left px-3 py-2 text-sm font-header font-bold uppercase tracking-[-0.01em] text-[var(--color-primary-500)] rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-50)] transition-all duration-200"
                      onClick={onClose}
                    >
                      Đăng nhập
                    </Link>
                  </li>
                )}
              {isAuthenticated && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout?.();
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-body text-red-500 rounded-[var(--radius-sm)] transition-all duration-200 ease-out hover:bg-red-50 hover:text-red-600 hover:pl-4 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Helper components ─────────────────────────────────────────────────────── */

function SkeletonList({ count }: { count: number }) {
  return (
    <ul className="flex flex-col gap-2 list-none p-0 m-0" role="list">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <div className="h-3.5 animate-shimmer rounded-[var(--radius-xs)] my-2 w-[70%]" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState({
  message,
  cta,
  onClose,
}: {
  message: string;
  cta: { label: string; href: string };
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 py-2">
      <p className="text-sm font-body text-[var(--color-neutral-500)]">{message}</p>
      <Link
        href={cta.href}
        onClick={onClose}
        className="inline-flex items-center gap-1 text-sm font-body font-semibold text-[var(--color-primary-500)] hover:underline"
      >
        <span>{cta.label}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
