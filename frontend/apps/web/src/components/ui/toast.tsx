"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "./icons";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  createdAt: number;
}

type Listener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  show(message: string, type: ToastType = "info", duration = 4000): string {
    const id = Math.random().toString(36).substring(2, 9);
    const newItem: ToastItem = {
      id,
      type,
      message,
      duration: type === "loading" ? 0 : duration,
      createdAt: Date.now(),
    };
    this.toasts = [newItem, ...this.toasts].slice(0, 5); // Tối đa 5 toast cùng lúc
    this.notify();
    return id;
  }

  success(message: string, duration = 4000): string {
    return this.show(message, "success", duration);
  }

  error(message: string, duration = 4000): string {
    return this.show(message, "error", duration);
  }

  warning(message: string, duration = 4000): string {
    return this.show(message, "warning", duration);
  }

  info(message: string, duration = 4000): string {
    return this.show(message, "info", duration);
  }

  loading(message: string): string {
    return this.show(message, "loading", 0);
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }
}

export const toast = new ToastManager();

function ToastIcon({ type }: { type: ToastType }) {
  switch (type) {
    case "success":
      return (
        <svg className="w-5 h-5 text-[#12ab83] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    case "error":
      return (
        <svg className="w-5 h-5 text-[#ef4444] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "warning":
      return (
        <svg className="w-5 h-5 text-[#f28c0f] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case "loading":
      return (
        <svg className="w-5 h-5 text-[#034ce4] animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      );
    case "info":
    default:
      return (
        <svg className="w-5 h-5 text-[#034ce4] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

function ToastElement({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!item.duration || item.duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / item.duration!) * 100);
      setProgress(remaining);

      if (elapsed >= item.duration!) {
        clearInterval(interval);
        onDismiss();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [item, onDismiss]);

  const progressBg =
    item.type === "success"
      ? "bg-[#12ab83]"
      : item.type === "error"
      ? "bg-[#ef4444]"
      : item.type === "warning"
      ? "bg-[#f28c0f]"
      : "bg-[#034ce4]";

  return (
    <div
      className="relative pointer-events-auto w-full max-w-sm bg-white border border-[var(--color-neutral-200)] rounded-[var(--radius-lg)] shadow-xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 md:slide-in-from-right-4"
      role="alert"
    >
      <div className="flex items-start gap-3 p-3.5 pr-8">
        <ToastIcon type={item.type} />
        <div className="flex-1 text-xs md:text-sm font-body text-[var(--color-neutral-800)] font-medium leading-snug break-words">
          {item.message}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-md text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] transition-colors cursor-pointer"
          aria-label="Đóng thông báo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {item.duration && item.duration > 0 ? (
        <div className="w-full bg-gray-100 h-1 overflow-hidden">
          <div
            className={`h-full ${progressBg} transition-all ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = toast.subscribe((items) => setToasts(items));
    return () => unsubscribe();
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-2.5 max-w-sm w-full pointer-events-none px-4 md:px-0"
      aria-live="polite"
    >
      {toasts.map((item) => (
        <ToastElement key={item.id} item={item} onDismiss={() => toast.dismiss(item.id)} />
      ))}
    </div>,
    document.body
  );
}
