"use client";

import React from "react";
import { Search, Bookmark, ArrowRight } from "lucide-react";
import type { LessonSummaryDTO } from "@edore/types";

export interface LessonSearchResultsProps {
  searchTerm: string;
  results: LessonSummaryDTO[];
  onSelectLesson: (lesson: LessonSummaryDTO) => void;
}

export function LessonSearchResults({
  searchTerm,
  results,
  onSelectLesson,
}: LessonSearchResultsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs">
        <span>
          Kết quả tìm kiếm cho <strong className="text-slate-900">"{searchTerm}"</strong>:{" "}
          <span className="text-[var(--color-primary-600)] font-bold">
            {results.length} bài học
          </span>
        </span>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2 shadow-2xs">
          <Search className="h-8 w-8 text-slate-300 mx-auto" />
          <h4 className="font-header font-bold text-sm text-slate-800">
            Không tìm thấy bài học phù hợp
          </h4>
          <p className="text-xs text-slate-500">
            Hãy kiểm tra lại chính tả hoặc thử tìm theo số bài (VD: "bài 1", "bài 2").
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {results.map((lesson) => {
            const displayOrder = lesson.orderInChapter
              ? `Bài ${lesson.orderInChapter}`
              : "Bài học";
            return (
              <div
                key={lesson.id}
                onClick={() => onSelectLesson(lesson)}
                className="group flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 p-4 hover:border-[var(--color-primary-400)] hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="rounded-md bg-[var(--color-primary-50)] text-[var(--color-primary-700)] border border-[var(--color-primary-200)]/60 text-[10px] font-bold px-2 py-0.5">
                      Lớp {lesson.gradeCode || "8"}
                    </span>
                    {lesson.textbookCode && (
                      <span className="rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium px-2 py-0.5">
                        {lesson.textbookCode}
                      </span>
                    )}
                  </div>
                  <h4 className="font-header font-bold text-xs uppercase text-slate-900 group-hover:text-[var(--color-primary-600)] transition-colors line-clamp-2 leading-snug">
                    {displayOrder}: {lesson.title}
                  </h4>
                  {lesson.chapterTitle && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                      <Bookmark className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{lesson.chapterTitle}</span>
                    </p>
                  )}
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[var(--color-primary-600)]">
                  <span>Tạo kịch bản</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
