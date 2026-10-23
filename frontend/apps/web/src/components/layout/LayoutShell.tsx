"use client";

import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/layout/Header";
import { AppFooter } from "@/components/layout/Footer";
import { analyticsTracker } from "@/lib/analyticsTracker";

// Các đường dẫn thuộc luồng xác thực (auth) — Ẩn hoàn toàn Header & Footer toàn cục
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some((route) => pathname?.startsWith(route));

  // Ghi nhận lượt xem trang tự động cho hệ thống Web Analytics nội bộ
  useEffect(() => {
    if (pathname) {
      analyticsTracker.trackPageView(pathname);
    }
  }, [pathname]);

  if (isAuthPage) {
    return <main className="flex-1 w-full min-h-screen">{children}</main>;
  }

  return (
    <>
      <Suspense fallback={null}>
        <AppHeader user={null} />
      </Suspense>
      <main className="flex-1">{children}</main>
      <AppFooter />
    </>
  );
}
