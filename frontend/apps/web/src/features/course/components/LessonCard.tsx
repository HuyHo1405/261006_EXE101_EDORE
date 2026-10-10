"use client";

import React, { useState, useMemo } from "react";
import { BookOpen, ArrowRight, Bookmark } from "lucide-react";
import type { LessonSummaryDTO } from "@edore/types";

interface LessonCardProps {
  lesson: LessonSummaryDTO;
  onSelect: (lesson: LessonSummaryDTO) => void;
}

export function LessonCard({ lesson, onSelect }: LessonCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!lesson) return null;

  const displayColor = "#034ce4"; // Brand primary color
  const gradeLabel = lesson.gradeCode ? `Lớp ${lesson.gradeCode}` : "Lớp 8";
  const textbookLabel = lesson.textbookCode ? (
    lesson.textbookCode === "KNTT" ? "Kết nối tri thức" :
    lesson.textbookCode === "CTST" ? "Chân trời sáng tạo" :
    lesson.textbookCode === "CD" ? "Cánh diều" : lesson.textbookCode
  ) : "Sách giáo khoa";

  // Hiển thị trực tiếp "Bài X: [Tiêu đề]" để không bị sượng ở phần category
  const displayTitle = useMemo(() => {
    const raw = lesson.title || "Bài học";
    if (/^bài\s*\d+/i.test(raw)) {
      return raw;
    }
    if (lesson.orderInChapter) {
      return `Bài ${lesson.orderInChapter}: ${raw}`;
    }
    return raw;
  }, [lesson.title, lesson.orderInChapter]);

  return (
    <div
      onClick={() => onSelect(lesson)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between rounded-2xl bg-white p-5 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer h-full min-h-[220px]"
      style={{
        borderTop: `4px solid ${displayColor}`,
        borderRight: `1.5px solid ${isHovered ? displayColor : `${displayColor}35`}`,
        borderBottom: `1.5px solid ${isHovered ? displayColor : `${displayColor}35`}`,
        borderLeft: `1.5px solid ${isHovered ? displayColor : `${displayColor}35`}`,
        boxShadow: isHovered
          ? `0 20px 25px -5px ${displayColor}25, 0 8px 10px -6px ${displayColor}15`
          : `0 2px 8px ${displayColor}08`,
      }}
    >
      <div className="flex flex-col flex-1 justify-between">
        {/* Top Badges (Category / Khối / Bộ sách) */}
        <div>
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex flex-wrap gap-1 min-h-[22px]">
              {/* Grade badge */}
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200"
                style={{
                  backgroundColor: isHovered ? displayColor : `${displayColor}15`,
                  color: isHovered ? "#ffffff" : displayColor,
                  border: `1px solid ${isHovered ? displayColor : `${displayColor}40`}`,
                  boxShadow: isHovered ? `0 2px 8px ${displayColor}40` : "none",
                }}
              >
                {gradeLabel}
              </span>

              {/* Textbook badge */}
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[140px]" title={textbookLabel}>
                {textbookLabel}
              </span>

              {/* Subject code badge if available */}
              {lesson.subjectCode && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  {lesson.subjectCode === "LS" ? "Lịch sử" : lesson.subjectCode}
                </span>
              )}
            </div>
          </div>

          {/* Title ("Bài X: [Title]") & Chapter */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-start gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-xs transition-transform duration-200 group-hover:scale-110 mt-0.5"
                style={{
                  backgroundColor: displayColor,
                  boxShadow: isHovered ? `0 4px 12px ${displayColor}50` : "none",
                }}
              >
                <BookOpen className="h-4 w-4" />
              </div>
              <h3
                className="line-clamp-2 font-header font-bold text-sm uppercase tracking-tight transition-colors duration-200 leading-snug min-h-[40px]"
                style={{ color: isHovered ? displayColor : "#0f172a" }}
              >
                {displayTitle}
              </h3>
            </div>

            {lesson.chapterTitle && (
              <p className="line-clamp-2 text-[11px] text-slate-500 leading-relaxed font-body pt-0.5 min-h-[32px] flex items-center gap-1">
                <Bookmark className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="truncate">{lesson.chapterTitle}</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] font-bold shrink-0">
          <div className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
            <span>{lesson.code || "LESSON"}</span>
          </div>
          <div
            className="flex items-center gap-1.5 font-bold transition-all duration-200 group-hover:translate-x-1"
            style={{ color: displayColor }}
          >
            <span>Tạo kịch bản</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
