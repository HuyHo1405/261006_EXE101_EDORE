"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Menu, X, Plus, Folder, LogOut } from "@/components/ui/icons";
import { EdoreLogo } from "./EdoreLogo";
import { UserAvatar } from "./UserAvatar";
import { MegaMenu, CourseMenuItem } from "./MegaMenu";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useMyCourses } from "@/features/course/queries/courseQueries";

interface User {
  name: string;
  email?: string;
  plan: "free" | "pro";
}

export interface AppHeaderProps {
  user?: User | null;
}

function AppHeaderContent({ user: initialUser = null }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const courseId = searchParams ? (searchParams.get("courseId") || searchParams.get("course")) : null;

  const isInsideCourse = Boolean(
    courseId || (pathname && (pathname.includes("/dashboard/course/") || pathname.includes("/dashboard/scripts/")))
  );

  const plusActionHref = isInsideCourse
    ? (courseId ? `/dashboard/scripts/new?courseId=${courseId}` : `/dashboard`)
    : `/dashboard?action=create-course`;

  const plusActionTitle = isInsideCourse ? "Tạo kịch bản mới" : "Tạo bộ bài giảng mới";

  const [mounted, setMounted] = useState(false);
  const storeUser = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = (mounted && _hasHydrated) ? storeUser : initialUser;
  const isAdmin = Boolean(storeUser?.roles?.some((r) => r.includes("ADMIN")));

  // Fetch courses dynamically for MegaMenu column 1
  const { data: coursesPage, isLoading: isLoadingCourses } = useMyCourses(
    { pageSize: 8, sortBy: "updatedAt", ascending: false },
    { enabled: Boolean(user) }
  );

  const courseMenuItems: CourseMenuItem[] = (coursesPage?.content || []).map((c) => ({
    id: c.id,
    name: c.title,
    title: c.title,
    href: `/dashboard?courseId=${c.id}`,
    scriptCount: c.scriptCount,
  }));

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
        setMobileMenuOpen(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
    <header className="sticky top-0 z-20 w-full bg-white dark:bg-slate-900/95 backdrop-blur-md border-b border-[var(--color-neutral-200)] dark:border-slate-800 shadow-xs px-2.5 sm:px-4 md:px-6 transition-colors duration-200">
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
          className="absolute left-1/2 -translate-x-1/2 font-header font-bold text-[30px] md:text-[43px] text-[var(--color-primary-500)] dark:text-[var(--color-primary-400)] uppercase tracking-[-0.01em] select-none hover:text-[var(--color-primary-400)] dark:hover:text-[var(--color-primary-300)] transition-colors"
          aria-label="Edore — trang chủ"
          {...triggerProps}
        >
          EDORE
        </Link>

        {/* ── Auth zone Desktop (góc phải) ─────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Cụm công cụ dạng "Viên thuốc" xếp khít nhau (Pill Shape) */}
              <div className="flex items-center p-1 gap-1 bg-[#F0F2F8] dark:bg-slate-800/90 border border-[var(--color-neutral-300)]/60 dark:border-slate-700/80 rounded-xl shadow-inner overflow-hidden shrink-0">
                {/* Nút Thư viện */}
                <Link
                  href="/dashboard"
                  title="Thư viện của tôi"
                  aria-label="Thư viện của tôi"
                  className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-[var(--color-primary-500)] dark:text-[var(--color-primary-400)] hover:bg-white dark:hover:bg-slate-700 hover:text-[var(--color-primary-600)] dark:hover:text-[var(--color-primary-300)] hover:shadow-xs transition-all duration-200 shrink-0"
                >
                  <Folder className="w-5 h-5" />
                </Link>

                {/* Nút Tạo mới có chữ chuẩn như Dashboard */}
                <Link
                  href={plusActionHref}
                  title={plusActionTitle}
                  aria-label={plusActionTitle}
                  className="h-[38px] px-3 gap-1.5 rounded-lg bg-[var(--color-primary-500)] text-white flex items-center justify-center hover:bg-[var(--color-primary-600)] hover:shadow-sm active:scale-95 transition-all duration-200 shrink-0 font-bold text-xs whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 font-bold" />
                  <span>{isInsideCourse ? "Tạo kịch bản" : "Tạo bộ bài giảng"}</span>
                </Link>
              </div>

              {/* Gộp User Avatar + Nút Mũi tên */}
              <div
                className="relative shrink-0"
                ref={userDropdownRef}
                onMouseEnter={openUserDropdown}
                onMouseLeave={scheduleCloseUserDropdown}
              >
                <button
                  type="button"
                  className="group flex items-center h-[48px] p-0.5 pr-2.5 gap-1.5 rounded-xl hover:bg-[#E4E8F7] dark:hover:bg-slate-800 hover:shadow-xs outline-none cursor-pointer active:scale-95 transition-all shrink-0"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  aria-label={`Tài khoản của ${user.name}`}
                  aria-haspopup="true"
                  aria-expanded={userDropdownOpen}
                >
                  <UserAvatar name={user.name} variant={user.plan} size={47} />
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--color-neutral-600)] dark:text-slate-400 group-hover:text-[var(--color-primary-600)] dark:group-hover:text-[var(--color-primary-400)] transition-all duration-200 ${userDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Account Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-[var(--color-neutral-200)] dark:border-slate-800 shadow-2xl rounded-2xl p-2.5 z-30 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
                    onMouseEnter={cancelCloseUserDropdown}
                    onMouseLeave={scheduleCloseUserDropdown}
                  >
                    <Link
                      href="/dashboard/profile"
                      onClick={closeUserDropdown}
                      className="block px-3 py-2.5 border-b border-[var(--color-neutral-100)] dark:border-slate-800 mb-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors group"
                    >
                      <p className="text-sm font-bold text-[var(--color-neutral-900)] dark:text-slate-100 truncate group-hover:text-[var(--color-primary-600)] dark:group-hover:text-[var(--color-primary-400)] transition-colors">
                        {user.name}
                      </p>
                      {user.email && (
                        <p className="text-xs text-[var(--color-neutral-500)] dark:text-slate-400 truncate mt-0.5">
                          {user.email}
                        </p>
                      )}
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-950)] text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] border border-[var(--color-primary-200)] dark:border-[var(--color-primary-800)]">
                        {user.plan === "pro" ? "Gói PRO" : "Gói Miễn phí"}
                      </span>
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={closeUserDropdown}
                      className="w-full px-3 py-2 text-xs font-bold text-[var(--color-neutral-700)] dark:text-slate-300 hover:bg-[#EAEFFD] dark:hover:bg-slate-800 hover:text-[var(--color-primary-700)] dark:hover:text-[var(--color-primary-400)] rounded-lg flex items-center gap-2.5 transition-all"
                    >
                      <Folder className="w-4 h-4 text-[var(--color-primary-500)] dark:text-[var(--color-primary-400)]" />
                      Thư viện của tôi
                    </Link>

                    <Link
                      href={plusActionHref}
                      onClick={closeUserDropdown}
                      className="w-full px-3 py-2 text-xs font-bold text-[var(--color-neutral-700)] dark:text-slate-300 hover:bg-[#EAEFFD] dark:hover:bg-slate-800 hover:text-[var(--color-primary-700)] dark:hover:text-[var(--color-primary-400)] rounded-lg flex items-center gap-2.5 transition-all"
                    >
                      <Plus className="w-4 h-4 text-[var(--color-primary-500)] dark:text-[var(--color-primary-400)]" />
                      {plusActionTitle}
                    </Link>

                    {/* Lựa chọn theme bên trong User Profile dropdown */}
                    <div className="p-2 my-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Chế độ giao diện
                        </span>
                      </div>
                      <ThemeToggle variant="segmented" className="w-full flex" />
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center gap-2.5 transition-all mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Guest — Nút ĐĂNG NHẬP dùng shadcn Button */
            <div className="flex items-center gap-2">
              <Button asChild size="header">
                <Link href="/login" id="header-login-btn">
                  Đăng nhập
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* ── Mobile zone (Nút Hamburger) ─────────────────────────── */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            className="flex items-center justify-center w-10 h-10 p-2 rounded-[var(--radius-sm)] text-[var(--color-neutral-700)] dark:text-slate-300 hover:bg-[var(--color-neutral-100)] dark:hover:bg-slate-800 cursor-pointer transition-colors"
            aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu Drawer ──────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--color-neutral-200)] dark:border-slate-800 py-4 px-4 bg-white dark:bg-slate-900 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-neutral-200)] dark:border-slate-800">
                  <UserAvatar name={user.name} variant={user.plan} size={42} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email || "Giáo viên Edore"}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Folder className="w-4 h-4 text-[var(--color-primary-500)]" />
                    Thư viện bài giảng
                  </Link>

                  <Link
                    href={plusActionHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[var(--color-primary-500)]" />
                    {plusActionTitle}
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Thông tin tài khoản & Cài đặt
                  </Link>
                </div>

                <div className="pt-2 border-t border-[var(--color-neutral-200)] dark:border-slate-800">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Chế độ giao diện:</span>
                    <ThemeToggle variant="segmented" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full mt-2 text-left px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <Button asChild size="default" className="w-full">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Đăng nhập
                  </Link>
                </Button>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-neutral-200)] dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Giao diện:</span>
                  <ThemeToggle variant="segmented" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mega Menu (kích hoạt khi hover vào Logo / Chữ EDORE) ── */}
      <MegaMenu
        isOpen={!!user && megaMenuOpen}
        courses={courseMenuItems}
        isLoadingCourses={isLoadingCourses}
        isAuthenticated={!!user}
        isAdmin={isAdmin}
        onClose={closeMegaMenu}
        onMouseEnter={cancelCloseMegaMenu}
        onMouseLeave={scheduleCloseMegaMenu}
        onLogout={handleLogout}
      />
    </header>
  );
}

function HeaderFallbackShell() {
  return (
    <header className="sticky top-0 z-20 w-full bg-white dark:bg-slate-900 border-b border-[var(--color-neutral-200)] dark:border-slate-800 shadow-xs px-2.5 sm:px-4 md:px-6">
      <div className="relative flex items-center justify-between h-[84px] max-w-[1400px] mx-auto w-full">
        <div className="w-16 flex items-center justify-center shrink-0">
          <Link href="/" className="flex items-center shrink-0">
            <EdoreLogo size={56} />
          </Link>
        </div>
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-header font-bold text-[30px] md:text-[43px] text-[var(--color-primary-500)] dark:text-[var(--color-primary-400)] uppercase tracking-[-0.01em]">
          EDORE
        </Link>
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Button asChild size="header">
            <Link href="/login" id="header-login-btn">
              Đăng nhập
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function AppHeader(props: AppHeaderProps) {
  return (
    <Suspense fallback={<HeaderFallbackShell />}>
      <AppHeaderContent {...props} />
    </Suspense>
  );
}
