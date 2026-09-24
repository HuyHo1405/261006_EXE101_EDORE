"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, FolderOpen, BookOpen, FileText, Pencil } from "lucide-react";
import type { CourseCardViewModel } from "@edore/types";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  isCurrent?: boolean;
  icon?: "folder" | "book" | "file";
}

export interface DashboardBreadcrumbProps {
  items?: BreadcrumbItem[];
  // Shortcut props for Dashboard page & Script pages
  currentCourse?: CourseCardViewModel | null;
  onBackToCourses?: () => void;
  courseTitle?: string;
  courseHref?: string;
  scriptTitle?: string;
  badgeLabel?: string;
  totalCount?: number;
}

export function DashboardBreadcrumb({
  items,
  currentCourse,
  onBackToCourses,
  courseTitle,
  courseHref,
  scriptTitle,
  badgeLabel,
  totalCount,
}: DashboardBreadcrumbProps) {
  // 1. If explicit items array is provided, render items
  if (items && items.length > 0) {
    return (
      <header className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 mb-1 font-sans">
        <div className="flex items-center gap-2 text-sm font-semibold flex-wrap">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1 || item.isCurrent;

            const iconElement =
              item.icon === "folder" ? (
                <FolderOpen className="h-4 w-4 shrink-0 text-slate-500" />
              ) : item.icon === "book" ? (
                <BookOpen className="h-4 w-4 shrink-0 text-slate-500" />
              ) : item.icon === "file" ? (
                <FileText className="h-4 w-4 shrink-0 text-[var(--color-primary-600)]" />
              ) : null;

            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}

                {isLast ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] text-[var(--color-primary-700)] shadow-2xs">
                    {iconElement || <FileText className="h-4 w-4 shrink-0 text-[var(--color-primary-600)]" />}
                    <span className="max-w-[200px] sm:max-w-[350px] truncate font-bold text-xs font-header uppercase tracking-wide">
                      {item.label}
                    </span>
                  </div>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/80 shadow-2xs active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    {iconElement || <FolderOpen className="h-4 w-4 shrink-0 text-slate-500" />}
                    <span className="font-header uppercase tracking-wide text-xs font-bold whitespace-nowrap">
                      {item.label}
                    </span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/80 shadow-2xs active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    {iconElement || <FolderOpen className="h-4 w-4 shrink-0 text-slate-500" />}
                    <span className="font-header uppercase tracking-wide text-xs font-bold whitespace-nowrap">
                      {item.label}
                    </span>
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </header>
    );
  }

  // 2. Default render with currentCourse or courseTitle / scriptTitle
  const activeCourseTitle = currentCourse ? currentCourse.title : courseTitle;

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200/60 pb-3.5 mb-5 font-sans">
      <div className="flex items-center gap-2 text-sm font-semibold flex-wrap">
        {/* If no course selected (Root level) */}
        {!activeCourseTitle && !scriptTitle ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-700)] border border-[var(--color-primary-200)] shadow-2xs font-bold">
            <FolderOpen className="h-4 w-4 shrink-0 text-[var(--color-primary-600)]" />
            <span className="font-header uppercase tracking-wide text-xs font-bold whitespace-nowrap">
              Khóa học của tôi {totalCount !== undefined ? `(${totalCount})` : ""}
            </span>
          </div>
        ) : (
          <>
            {/* Level 1: Back to Courses Button */}
            {onBackToCourses ? (
              <button
                type="button"
                onClick={onBackToCourses}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/80 shadow-2xs active:scale-95 transition-all duration-200 cursor-pointer"
                title="Quay lại danh sách khóa học của tôi"
              >
                <FolderOpen className="h-4 w-4 shrink-0 text-slate-500" />
                <span className="font-header uppercase tracking-wide text-xs font-bold whitespace-nowrap">
                  Khóa học của tôi
                </span>
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/80 shadow-2xs active:scale-95 transition-all duration-200 cursor-pointer"
                title="Về Dashboard"
              >
                <FolderOpen className="h-4 w-4 shrink-0 text-slate-500" />
                <span className="font-header uppercase tracking-wide text-xs font-bold whitespace-nowrap">
                  Khóa học của tôi
                </span>
              </Link>
            )}

            {/* Level 2: Selected Course */}
            {activeCourseTitle && (
              <>
                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                {scriptTitle ? (
                  <Link
                    href={courseHref || "/dashboard"}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/80 shadow-2xs active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4 shrink-0 text-slate-500" />
                    <span className="max-w-[150px] sm:max-w-[250px] truncate font-bold text-xs font-header uppercase tracking-wide">
                      {activeCourseTitle}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] text-[var(--color-primary-700)] shadow-2xs">
                    <BookOpen className="h-4 w-4 shrink-0 text-[var(--color-primary-600)]" />
                    <span className="max-w-[200px] sm:max-w-[350px] truncate font-bold text-xs font-header uppercase tracking-wide">
                      {activeCourseTitle}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Level 3: Script Level */}
            {scriptTitle && (
              <>
                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] text-[var(--color-primary-700)] shadow-2xs">
                  <FileText className="h-4 w-4 shrink-0 text-[var(--color-primary-600)]" />
                  <span className="max-w-[180px] sm:max-w-[320px] truncate font-bold text-xs font-header uppercase tracking-wide">
                    {scriptTitle}
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </header>
  );
}
