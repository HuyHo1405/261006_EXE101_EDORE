"use client";

import React, { useMemo } from "react";
import { BookOpen, ArrowRight, Check } from "lucide-react";
import type { LessonSummaryDTO } from "@edore/types";

export interface LessonPreviewPanelProps {
  lesson: LessonSummaryDTO | null;
  onConfirmLesson: (lesson: LessonSummaryDTO) => void;
}

export function LessonPreviewPanel({
  lesson,
  onConfirmLesson,
}: LessonPreviewPanelProps) {
  // Learning outcomes parsed from lesson data (JSON array or newline string)
  const outcomes = useMemo(() => {
    if (!lesson) return [];
    if (lesson.learningObjectives) {
      try {
        const parsed = JSON.parse(lesson.learningObjectives);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) =>
            typeof item === "string" ? item : JSON.stringify(item)
          );
        }
      } catch {
        const lines = lesson.learningObjectives
          .split("\n")
          .map((s) => s.trim().replace(/^[-*•\d.]+\s*/, ""))
          .filter(Boolean);
        if (lines.length > 0) return lines;
      }
    }
    return [
      `Nắm vững kiến thức trọng tâm và nội dung cốt lõi của bài học "${lesson.title}".`,
      "Vận dụng kiến thức để trả lời câu hỏi và thực hiện các hoạt động học tập liên quan.",
    ];
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="md:col-span-5 bg-slate-50/60 flex flex-col min-h-[500px] md:sticky md:top-4 self-start rounded-b-2xl md:rounded-b-none md:rounded-r-3xl">
        <div className="flex flex-col items-center justify-center h-full text-center p-6 py-14 space-y-3 flex-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200/90 text-slate-300 shadow-2xs">
            <BookOpen className="h-7 w-7 text-slate-400" />
          </div>
          <div className="space-y-1 max-w-xs">
            <h4 className="font-header font-bold text-sm text-slate-700">
              Chưa chọn bài học
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-body">
              Vui lòng bấm vào một bài học ở danh sách bên trái để xem trước thông tin bài giảng và bắt đầu soạn kịch bản.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="md:col-span-5 bg-slate-50/60 flex flex-col min-h-[500px] md:sticky md:top-4 self-start rounded-b-2xl md:rounded-b-none md:rounded-r-3xl">
      <div className="flex flex-col h-full flex-1 min-h-0">
        {/* Nội dung preview */}
        <div className="p-6 space-y-4 flex-1">
          {/* Tiêu đề: Chương ở trên (với badge số chương), Bài học ở dưới */}
          <div className="space-y-2">
            {lesson.chapterTitle && (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[var(--color-primary-100)] border border-[var(--color-primary-200)] text-[var(--color-primary-800)] text-xs font-header font-bold uppercase tracking-wider max-w-full">
                <span className="truncate">
                  {lesson.chapterOrder && !/^chương\s*\d+/i.test(lesson.chapterTitle)
                    ? `Chương ${lesson.chapterOrder}: ${lesson.chapterTitle}`
                    : lesson.chapterTitle}
                </span>
              </div>
            )}
            <h2 className="font-header font-bold text-base md:text-lg text-slate-900 leading-snug">
              {lesson.orderInChapter
                ? `Bài ${lesson.orderInChapter}: ${lesson.title}`
                : lesson.title}
            </h2>
          </div>

          {/* YÊU CẦU CẦN ĐẠT (MÀU XANH NGỌC - EMERALD CHUẨN SCRIPT OUTCOME UI) */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 space-y-3 shadow-2xs">
            <h3 className="font-header font-extrabold text-xs uppercase tracking-wider text-emerald-950">
              Yêu cầu cần đạt (Learning outcomes)
            </h3>

            <ul className="space-y-2.5 list-none p-0 m-0">
              {outcomes.map((outcome, idx) => (
                <li
                  key={idx}
                  className="flex gap-2.5 font-body text-xs sm:text-sm text-slate-800 leading-relaxed items-start"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-3 h-3 text-white stroke-[2.5]" />
                  </span>
                  <span className="font-medium text-slate-900">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Nút Action luôn nằm cố định ở DƯỚI CÙNG (Pinned Bottom Footer) */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 mt-auto shrink-0 shadow-xs">
          <button
            type="button"
            onClick={() => onConfirmLesson(lesson)}
            className="w-full flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-bold text-sm shadow-md transition-all cursor-pointer active:scale-98"
          >
            <span>Chọn bài này & Bắt đầu sinh kịch bản</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
