"use client";

import React from "react";
import { FolderPlus, BookOpen } from "lucide-react";
import type { LessonSummaryDTO } from "@edore/types";
import { LessonCard } from "./LessonCard";
import { Button } from "@/components/ui/button";

interface LessonGridProps {
  lessons: LessonSummaryDTO[];
  isLoading: boolean;
  onSelectLesson: (lesson: LessonSummaryDTO) => void;
  pageNumber?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function LessonGrid({
  lessons,
  isLoading,
  onSelectLesson,
  pageNumber = 0,
  totalPages = 1,
  onPageChange,
}: LessonGridProps) {
  const validLessons = Array.isArray(lessons)
    ? lessons.filter((l): l is LessonSummaryDTO => Boolean(l))
    : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 min-h-[465px] content-start">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-full min-h-[220px] rounded-2xl border border-slate-200/80 bg-white p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-6 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-200" />
              </div>
              <div className="h-3 w-1/3 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const TOTAL_SLOTS = 8;
  const emptySlotsCount = Math.max(0, TOTAL_SLOTS - validLessons.length);

  return (
    <div className="space-y-4 flex-1 flex flex-col justify-between">
      {/* ── 8-SLOT 4-COLUMN RESERVED MATRIX GRID ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 min-h-[465px] content-start">
        {/* Rendered Existing Lesson Cards */}
        {validLessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            onSelect={onSelectLesson}
          />
        ))}

        {/* Empty reserved slots */}
        {Array.from({ length: emptySlotsCount }).map((_, idx) => (
          <div
            key={`reserved-slot-${idx}`}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-neutral-300)] bg-white/70 p-5 h-full min-h-[220px] text-center"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-300">
              <FolderPlus className="h-4 w-4" />
            </div>
            <span className="mt-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Ô trống
            </span>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between border-t border-[var(--color-neutral-300)] pt-3 text-xs font-semibold text-slate-700 bg-white/80 px-4 py-2.5 rounded-xl shadow-2xs">
          <span>
            Trang <strong className="text-slate-900">{pageNumber + 1}</strong> / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pageNumber === 0}
              onClick={() => onPageChange(pageNumber - 1)}
              className="h-8 px-3 text-xs rounded-xl border-slate-300 bg-white hover:bg-slate-100 cursor-pointer"
            >
              Trang trước
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pageNumber >= totalPages - 1}
              onClick={() => onPageChange(pageNumber + 1)}
              className="h-8 px-3 text-xs rounded-xl border-slate-300 bg-white hover:bg-slate-100 cursor-pointer"
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
