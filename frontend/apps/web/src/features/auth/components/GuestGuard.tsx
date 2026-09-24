"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/useAuthStore";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && _hasHydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [mounted, _hasHydrated, isAuthenticated, router]);

  if (!mounted || !_hasHydrated) {
    return null; // Giữ nguyên màn hình chờ hydration
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-neutral-50)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-500)]" />
      </div>
    );
  }

  return <>{children}</>;
}
