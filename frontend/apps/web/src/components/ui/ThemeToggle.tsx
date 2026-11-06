"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
  variant?: "dropdown" | "segmented" | "cycle";
  className?: string;
  size?: "sm" | "md";
}

const THEME_OPTIONS = [
  { value: "light", label: "Sáng", icon: Sun },
  { value: "dark", label: "Tối", icon: Moon },
  { value: "system", label: "Hệ thống", icon: Monitor },
] as const;

export function ThemeToggle({
  variant = "dropdown",
  className,
  size = "md",
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!mounted) {
    if (variant === "segmented") {
      return (
        <div
          className={cn(
            "flex items-center p-1 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-[48px] w-full max-w-[280px] animate-pulse",
            className
          )}
        />
      );
    }
    return (
      <div
        className={cn(
          "w-[38px] h-[38px] rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse",
          className
        )}
      />
    );
  }

  // ── Segmented Control (thích hợp trong trang Settings/Profile và Mobile Menu) ────
  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "inline-flex items-center p-1 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-inner",
          className
        )}
        role="radiogroup"
        aria-label="Chọn chế độ giao diện"
      >
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(opt.value)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all duration-200 select-none cursor-pointer",
                isSelected
                  ? "bg-white dark:bg-slate-900 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap leading-none">{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── Cycle Control (1 click chuyển luân phiên Sáng -> Tối -> Hệ thống) ────
  if (variant === "cycle") {
    const handleCycle = () => {
      if (theme === "light") setTheme("dark");
      else if (theme === "dark") setTheme("system");
      else setTheme("light");
    };

    const CurrentIcon =
      theme === "system"
        ? Monitor
        : resolvedTheme === "dark"
        ? Moon
        : Sun;

    const label =
      theme === "system"
        ? "Giao diện: Hệ thống"
        : resolvedTheme === "dark"
        ? "Giao diện: Tối"
        : "Giao diện: Sáng";

    return (
      <button
        type="button"
        onClick={handleCycle}
        title={label}
        aria-label={label}
        className={cn(
          "w-[38px] h-[38px] rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer active:scale-95",
          className
        )}
      >
        <CurrentIcon className="w-4 h-4" />
      </button>
    );
  }

  // ── Dropdown Control (Mặc định — Icon hiện theo trạng thái, click mở menu 3 lựa chọn) ────
  const DisplayIcon =
    theme === "system"
      ? Monitor
      : resolvedTheme === "dark"
      ? Moon
      : Sun;

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Tùy chọn giao diện Light/Dark/System"
        title="Tùy chọn giao diện (Sáng / Tối / Hệ thống)"
        className={cn(
          "w-[38px] h-[38px] rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-[var(--color-primary-600)] dark:hover:text-[var(--color-primary-400)] transition-all duration-200 cursor-pointer select-none active:scale-95",
          size === "sm" && "w-8 h-8",
          isOpen && "bg-white dark:bg-slate-800 shadow-xs text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]"
        )}
      >
        <DisplayIcon className="w-4 h-4 transition-transform duration-200" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
        >
          <div className="px-2 py-1 mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Giao diện
          </div>
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitem"
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none",
                  isSelected
                    ? "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-950)]/70 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
