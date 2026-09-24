"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu, X, Plus, Folder, LogOut } from "@/components/ui/icons";
import { EdoreLogo } from "./EdoreLogo";
import { UserAvatar } from "./UserAvatar";
import { MegaMenu, Subject, Classroom } from "./MegaMenu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

const MOCK_SUBJECTS: Subject[] = [
  { id: "1", name: "Toán học",     href: "/subjects/toan-hoc" },
  { id: "2", name: "Vật lý",       href: "/subjects/vat-ly" },
  { id: "3", name: "Hóa học",      href: "/subjects/hoa-hoc" },
  { id: "4", name: "Sinh học",     href: "/subjects/sinh-hoc" },
  { id: "5", name: "Ngữ văn",      href: "/subjects/ngu-van" },
  { id: "6", name: "Tiếng Anh",    href: "/subjects/tieng-anh" },
  { id: "7", name: "Lịch sử",      href: "/subjects/lich-su" },
  { id: "8", name: "Địa lý",       href: "/subjects/dia-ly" },
  { id: "9", name: "Tin học",      href: "/subjects/tin-hoc" },
  { id: "10", name: "Khoa học",    href: "/subjects/khoa-hoc" },
];

const MOCK_CLASSROOMS: Classroom[] = [
  { id: "1", name: "Lớp 10A1", href: "/classrooms/10a1" },
  { id: "2", name: "Lớp 11B2", href: "/classrooms/11b2" },
];

interface User {
  name: string;
  email?: string;
  plan: "free" | "pro";
}

export interface AppHeaderProps {
  user?: User | null;
}

export function AppHeader({ user: initialUser = null }: AppHeaderProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const storeUser = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = (mounted && _hasHydrated) ? storeUser : initialUser;

  // State & refs cho MegaMenu (Kích hoạt khi hover Logo / Wordmark EDORE)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const megaHoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const megaCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // State & refs cho User Dropdown (Gộp Avatar + Nút Chevron thành 1 nút hover/click)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const userHoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── MegaMenu handlers ───────────────────────────────────────
  const openMegaMenu = () => {
    if (!user) return; // Chưa đăng nhập -> Không mở MegaMenu
    if (megaCloseTimerRef.current) clearTimeout(megaCloseTimerRef.current);
    if (!megaMenuOpen) {
      megaHoverTimerRef.current = setTimeout(() => {
        setMegaMenuOpen(true);
      }, 150);
    }
  };

  const scheduleCloseMegaMenu = () => {
    if (megaHoverTimerRef.current) clearTimeout(megaHoverTimerRef.current);
    megaCloseTimerRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 200);
  };

  const cancelCloseMegaMenu = () => {
    if (megaCloseTimerRef.current) clearTimeout(megaCloseTimerRef.current);
  };

  const closeMegaMenu = () => {
    if (megaHoverTimerRef.current) clearTimeout(megaHoverTimerRef.current);
    if (megaCloseTimerRef.current) clearTimeout(megaCloseTimerRef.current);
    setMegaMenuOpen(false);
  };

  // ── User Dropdown handlers ────────────────────────────────────
  const openUserDropdown = () => {
    if (userCloseTimerRef.current) clearTimeout(userCloseTimerRef.current);
    if (!userDropdownOpen) {
      userHoverTimerRef.current = setTimeout(() => {
        setUserDropdownOpen(true);
      }, 150);
    }
  };

  const scheduleCloseUserDropdown = () => {
    if (userHoverTimerRef.current) clearTimeout(userHoverTimerRef.current);
    userCloseTimerRef.current = setTimeout(() => {
      setUserDropdownOpen(false);
    }, 200);
  };

  const cancelCloseUserDropdown = () => {
    if (userCloseTimerRef.current) clearTimeout(userCloseTimerRef.current);
  };

  const closeUserDropdown = () => {
    if (userHoverTimerRef.current) clearTimeout(userHoverTimerRef.current);
    if (userCloseTimerRef.current) clearTimeout(userCloseTimerRef.current);
    setUserDropdownOpen(false);
  };

  // Click outside to close user dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        closeUserDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMegaMenu();
        closeUserDropdown();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (megaHoverTimerRef.current) clearTimeout(megaHoverTimerRef.current);
      if (megaCloseTimerRef.current) clearTimeout(megaCloseTimerRef.current);
      if (userHoverTimerRef.current) clearTimeout(userHoverTimerRef.current);
      if (userCloseTimerRef.current) clearTimeout(userCloseTimerRef.current);
    };
  }, []);

  const handleLogout = () => {
    logout();
    closeUserDropdown();
    closeMegaMenu();
    setMobileMenuOpen(false);
    router.push("/login");
  };

  // Props mở MegaMenu khi hover vào Logo hoặc Chữ EDORE
  const triggerProps = user
    ? {
        onMouseEnter: openMegaMenu,
        onMouseLeave: scheduleCloseMegaMenu,
        role: "button" as const,
        tabIndex: 0,
        "aria-haspopup": "true" as const,
        "aria-expanded": megaMenuOpen,
      }
    : {};

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[var(--color-neutral-200)] shadow-xs px-2.5 sm:px-4 md:px-6">
      <div className="relative flex items-center justify-between h-[84px] max-w-[1400px] mx-auto w-full">
        {/* ── Logo (góc trái — căn giữa tâm theo cột w-16 của Aside) ── */}
        <div className="w-16 flex items-center justify-center shrink-0">
          <Link
            href="/"
            className="flex items-center shrink-0 text-decoration-none rounded-[var(--radius-sm)] outline-offset-4 transition-all hover:opacity-90 hover:scale-105"
            aria-label="Trang chủ Edore"
            {...triggerProps}
          >
            <EdoreLogo size={56} />
          </Link>
        </div>

        {/* ── Wordmark EDORE (căn giữa — hover mở MegaMenu khi đã đăng nhập) ── */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 font-header font-bold text-[30px] md:text-[43px] text-[var(--color-primary-500)] uppercase tracking-[-0.01em] select-none hover:text-[var(--color-primary-400)] transition-colors"
          aria-label="Edore — trang chủ"
          {...triggerProps}
        >
          EDORE
        </Link>

        {/* ── Auth zone (góc phải — padding p-1, button 38px khớp 48px tổng) ─────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Cụm công cụ dạng "Viên thuốc" xếp khít nhau (Pill Shape) 38px + 8px padding + 2px border = 48px */}
              <div className="flex items-center p-1 gap-1 bg-[#F0F2F8] border border-[var(--color-neutral-300)]/60 rounded-xl shadow-inner overflow-hidden shrink-0">
                {/* Nút Thư viện */}
                <Link
                  href="/dashboard"
                  title="Thư viện của tôi"
                  aria-label="Thư viện của tôi"
                  className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-[var(--color-primary-500)] hover:bg-white hover:text-[var(--color-primary-600)] hover:shadow-xs transition-all duration-200 shrink-0"
                >
                  <Folder className="w-5 h-5" />
                </Link>

                {/* Nút Tạo kịch bản mới (Dấu + nền Xanh Primary) */}
                <Link
                  href="/studio"
                  title="Tạo kịch bản mới"
                  aria-label="Tạo kịch bản mới"
                  className="w-[38px] h-[38px] rounded-lg bg-[var(--color-primary-500)] text-white flex items-center justify-center hover:bg-[var(--color-primary-600)] hover:shadow-sm active:scale-95 transition-all duration-200 shrink-0"
                >
                  <Plus className="w-5 h-5 font-bold" />
                </Link>
              </div>

              {/* Gộp User Avatar + Nút Mũi tên (Giữ nguyên Avatar size 47px) */}
              <div
                className="relative shrink-0"
                ref={userDropdownRef}
                onMouseEnter={openUserDropdown}
                onMouseLeave={scheduleCloseUserDropdown}
              >
                <button
                  type="button"
                  className="group flex items-center h-[48px] p-0.5 pr-2.5 gap-1.5 rounded-xl hover:bg-[#E4E8F7] hover:shadow-xs outline-none cursor-pointer active:scale-95 transition-all shrink-0"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  aria-label={`Tài khoản của ${user.name}`}
                  aria-haspopup="true"
                  aria-expanded={userDropdownOpen}
                >
                  <UserAvatar name={user.name} variant={user.plan} size={47} />
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--color-neutral-600)] group-hover:text-[var(--color-primary-600)] transition-all duration-200 ${
                      userDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Account Dropdown Menu (mt-2 = 8px khớp gap-2 của nút) */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 bg-white border border-[var(--color-neutral-200)] shadow-2xl rounded-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseEnter={cancelCloseUserDropdown}
                    onMouseLeave={scheduleCloseUserDropdown}
                  >
                    <div className="px-3 py-2.5 border-b border-[var(--color-neutral-100)] mb-1.5">
                      <p className="text-sm font-bold text-[var(--color-neutral-900)] truncate">
                        {user.name}
                      </p>
                      {user.email && (
                        <p className="text-xs text-[var(--color-neutral-500)] truncate mt-0.5">
                          {user.email}
                        </p>
                      )}
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border border-[var(--color-primary-200)]">
                        {user.plan === "pro" ? "Gói PRO" : "Gói Miễn phí"}
                      </span>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={closeUserDropdown}
                      className="w-full px-3 py-2 text-xs font-bold text-[var(--color-neutral-700)] hover:bg-[#EAEFFD] hover:text-[var(--color-primary-700)] rounded-lg flex items-center gap-2.5 transition-all"
                    >
                      <Folder className="w-4 h-4 text-[var(--color-primary-500)]" />
                      Thư viện của tôi
                    </Link>

                    <Link
                      href="/studio"
                      onClick={closeUserDropdown}
                      className="w-full px-3 py-2 text-xs font-bold text-[var(--color-neutral-700)] hover:bg-[#EAEFFD] hover:text-[var(--color-primary-700)] rounded-lg flex items-center gap-2.5 transition-all"
                    >
                      <Plus className="w-4 h-4 text-[var(--color-primary-500)]" />
                      Tạo kịch bản mới
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2.5 transition-all mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Guest — Nút ĐĂNG NHẬP dùng shadcn Button */
            <Button asChild size="header">
              <Link href="/login" id="header-login-btn">
                Đăng nhập
              </Link>
            </Button>
          )}
        </div>

        {/* ── Hamburger (mobile only) ──────────────────────────────── */}
        <button
          className="flex md:hidden items-center justify-center w-10 h-10 p-2 rounded-[var(--radius-sm)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] cursor-pointer"
          aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ── Mega Menu (kích hoạt khi hover vào Logo / Chữ EDORE) ── */}
      <MegaMenu
        isOpen={!!user && megaMenuOpen}
        subjects={MOCK_SUBJECTS}
        classrooms={MOCK_CLASSROOMS}
        isAuthenticated={!!user}
        onClose={closeMegaMenu}
        onMouseEnter={cancelCloseMegaMenu}
        onMouseLeave={scheduleCloseMegaMenu}
        onLogout={handleLogout}
      />
    </header>
  );
}
