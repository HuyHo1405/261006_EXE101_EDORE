"use client";

import React from "react";
import { Calendar, ChevronDown } from "lucide-react";
import type { LessonSummaryDTO } from "@edore/types";
import { cn } from "@/lib/utils";

export interface SemesterDropdownItemProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  chapters: Array<{ title: string; order?: number; lessons: LessonSummaryDTO[] }>;
  previewLessonId?: string;
  onSelectLesson: (lesson: LessonSummaryDTO) => void;
  theme?: "primary" | "indigo";
}

export function SemesterDropdownItem({
  title,
  isOpen,
  onToggle,
  chapters,
  previewLessonId,
  onSelectLesson,
  theme = "primary",
}: SemesterDropdownItemProps) {
  const isIndigo = theme === "indigo";

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200 overflow-visible",
        isOpen
          ? isIndigo
            ? "border-indigo-400 dark:border-indigo-500 bg-white dark:bg-slate-900 shadow-xs ring-1 ring-indigo-400/20 dark:ring-indigo-500/20"
            : "border-[var(--color-primary-400)] dark:border-blue-500 bg-white dark:bg-slate-900 shadow-xs ring-1 ring-[var(--color-primary-400)]/20 dark:ring-blue-500/20"
          : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
      )}
    >
      {/* Dropdown Header: Nhấn để mở (tự động đóng học kỳ còn lại) */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer select-none transition-colors rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "p-2 rounded-xl transition-colors",
              isOpen
                ? isIndigo
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-[var(--color-primary-500)] text-white shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
            )}
          >
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <span className="font-header font-bold text-sm text-slate-900 dark:text-slate-100">
              {title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
            {isOpen ? "Đang mở" : "Nhấn để mở"}
          </span>
          <div
            className={cn(
              "p-1.5 rounded-lg transition-transform duration-200",
              isOpen
                ? isIndigo
                  ? "rotate-180 text-indigo-600 dark:text-indigo-400"
                  : "rotate-180 text-[var(--color-primary-600)] dark:text-blue-400"
                : "text-slate-400 dark:text-slate-500"
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </button>

      {/* Dropdown Content: Chỉ hiển thị khi isOpen */}
      {isOpen && (
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-5 bg-white dark:bg-slate-900 rounded-b-2xl overflow-visible">
          {chapters.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 italic">
              Chưa có bài học trong {title}
            </div>
          ) : (
            chapters.map((chapter) => {
              const rawTitle = chapter.title || "Chương";
              const isNumbered = /^chương\s*\d+/i.test(rawTitle);
              const chapterLabel = isNumbered
                ? rawTitle
                : chapter.order
                  ? `Chương ${chapter.order}: ${rawTitle}`
                  : rawTitle;

              return (
                <div key={chapter.title} className="space-y-2 pt-1 first:pt-0">
                  {/* Tiêu đề chương nổi bật với badge số chương */}
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider shrink-0",
                        isIndigo
                          ? "bg-indigo-100 dark:bg-indigo-950/70 text-indigo-750 dark:text-indigo-300"
                          : "bg-[var(--color-primary-100)] dark:bg-blue-950/70 text-[var(--color-primary-800)] dark:text-blue-300"
                      )}
                    >
                      {chapter.order ? `Chương ${chapter.order}` : "Chương"}
                    </span>
                    <p
                      className="font-header text-xs font-bold text-slate-800 dark:text-slate-200 flex-1 uppercase"
                      title={chapterLabel}
                    >
                      {isNumbered ? rawTitle.replace(/^chương\s*\d+[:\s-]*/i, "") : rawTitle}
                    </p>
                  </div>

                  {/* Danh sách bài trong chương */}
                  <ul className="flex flex-col gap-1 list-none p-0 m-0" role="list">
                    {chapter.lessons.map((lesson) => {
                      const isSelected = previewLessonId === lesson.id;
                      const rawTitle = lesson.title || "Bài học";
                      const displayTitle = /^bài\s*\d+/i.test(rawTitle)
                        ? rawTitle
                        : lesson.orderInChapter
                          ? `Bài ${lesson.orderInChapter}: ${rawTitle}`
                          : rawTitle;

                      return (
                        <li key={lesson.id}>
                          <button
                            type="button"
                            onClick={() => onSelectLesson(lesson)}
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm font-body rounded-xl transition-all duration-200 ease-out cursor-pointer flex items-center justify-between gap-2",
                              isSelected
                                ? isIndigo
                                  ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold pl-4 shadow-2xs border border-indigo-200 dark:border-indigo-800"
                                  : "bg-[var(--color-primary-50)] dark:bg-blue-950/50 text-[var(--color-primary-700)] dark:text-blue-300 font-bold pl-4 shadow-2xs border border-[var(--color-primary-200)] dark:border-blue-800"
                                : isIndigo
                                  ? "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 hover:pl-4"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-[var(--color-primary-600)] dark:hover:text-blue-400 hover:pl-4"
                            )}
                            title={lesson.title}
                          >
                            <span className="leading-snug flex-1">
                              {displayTitle}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
