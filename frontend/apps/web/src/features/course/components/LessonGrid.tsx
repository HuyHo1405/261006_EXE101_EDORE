"use client";

/**
 * LessonGrid — Selected Tab Interface (2-Column Layout)
 *
 * Select chọn Khối lớp (cạnh bộ chuyển Học kỳ I / II)
 * Cột 1: Phân cấp theo: Học kỳ > Chương > Bài
 * Cột 2: Preview chi tiết của bài đã chọn (hoặc Empty state chờ click bài)
 */

import React, { useState, useMemo, useEffect } from "react";
import { GraduationCap, ChevronDown } from "lucide-react";
import type { LessonSummaryDTO, CurriculumSemesterDTO } from "@edore/types";
import { useCategories } from "@/features/course/queries/courseQueries";
import { getSemesterForChapter } from "@/features/course/data/standardLessons";
import { cn } from "@/lib/utils";
import { SemesterDropdownItem } from "./SemesterDropdownItem";
import { LessonPreviewPanel } from "./LessonPreviewPanel";
import { LessonSearchResults } from "./LessonSearchResults";

export interface LessonGridProps {
  lessons?: LessonSummaryDTO[];
  curriculum?: CurriculumSemesterDTO[];
  isLoading?: boolean;
  onSelectLesson: (lesson: LessonSummaryDTO) => void;
  selectedGrade?: string;
  onSelectGrade?: (grade: string) => void;
  selectedTextbook?: string;
  onSelectTextbook?: (tb: string) => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export function LessonGrid({
  lessons = [],
  curriculum,
  isLoading,
  onSelectLesson,
  selectedGrade = "",
  onSelectGrade,
  selectedTextbook = "",
  onSelectTextbook,
  searchTerm = "",
  onSearchChange,
}: LessonGridProps) {
  const { data: gradeCategories } = useCategories("GRADE");

  // Dynamic Grade categories ordered by grade number (6, 7, 8, 9)
  const grades = useMemo(() => {
    const list: Array<{ label: string; value: string; shortLabel: string }> = [];
    if (gradeCategories && gradeCategories.length > 0) {
      const sorted = [...gradeCategories].sort((a, b) => {
        const numA = parseInt(a.code, 10);
        const numB = parseInt(b.code, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.code.localeCompare(b.code);
      });
      sorted.forEach((c) => {
        list.push({
          label: c.name || `Lớp ${c.code}`,
          value: c.code,
          shortLabel: `Lớp ${c.code}`,
        });
      });
    } else {
      list.push(
        { label: "Lớp 6", value: "6", shortLabel: "Lớp 6" },
        { label: "Lớp 7", value: "7", shortLabel: "Lớp 7" },
        { label: "Lớp 8", value: "8", shortLabel: "Lớp 8" },
        { label: "Lớp 9", value: "9", shortLabel: "Lớp 9" }
      );
    }
    return list;
  }, [gradeCategories]);

  // Selected tab state: defaults to selectedGrade if set, otherwise first grade "6"
  const [internalTabGrade, setInternalTabGrade] = useState<string>("6");

  const activeGrade = selectedGrade || internalTabGrade || "6";
  const activeGradeObj = grades.find((g) => g.value === activeGrade);
  const activeGradeLabel = activeGradeObj?.label || `Lớp ${activeGrade}`;

  // Active accordion dropdown semester: only 1 semester open at a time (1 or 2)
  const [openSemester, setOpenSemester] = useState<1 | 2>(1);

  // Preview lesson state for column 2
  const [previewLesson, setPreviewLesson] = useState<LessonSummaryDTO | null>(null);

  // Reset preview and default to semester 1 when active tab changes
  useEffect(() => {
    setPreviewLesson(null);
    setOpenSemester(1);
  }, [activeGrade]);

  const handleTabChange = (gradeValue: string) => {
    setInternalTabGrade(gradeValue);
    if (onSelectGrade) {
      onSelectGrade(gradeValue);
    }
  };

  // Filter lessons for current grade tab
  const tabLessons = useMemo(() => {
    return lessons.filter((l) => {
      const gradeNum = (l.gradeCode || "").replace(/\D+/g, "");
      return gradeNum === activeGrade;
    });
  }, [lessons, activeGrade]);

  // Compute semester 1 & 2 chapter hierarchies
  const semesterData = useMemo(() => {
    if (curriculum && curriculum.length > 0) {
      const sem1 = curriculum.find((s) => s.semesterCode === "1");
      const sem2 = curriculum.find((s) => s.semesterCode === "2");

      const mapSemester = (sem?: CurriculumSemesterDTO) => {
        if (!sem || !sem.chapters) return [];
        return sem.chapters.map((ch) => ({
          title: ch.title || "Chương",
          order: ch.order,
          lessons: (ch.lessons || []).map((l) => ({
            id: l.id,
            code: l.code,
            title: l.title,
            gradeCode: l.gradeCode,
            subjectCode: l.subjectCode,
            textbookCode: l.textbookCode,
            chapterTitle: ch.title,
            chapterOrder: ch.order,
            orderInChapter: l.orderInChapter,
            semesterCode: sem.semesterCode || undefined,
            learningObjectives: l.learningObjectives,
          } as LessonSummaryDTO)),
        }));
      };

      return {
        sem1: mapSemester(sem1),
        sem2: mapSemester(sem2),
      };
    }

    // Fallback: Group lessons by chapter
    const chapterMap = new Map<
      string,
      { title: string; order: number; semester: 1 | 2; lessons: LessonSummaryDTO[] }
    >();

    tabLessons.forEach((lesson) => {
      const chapterKey = lesson.chapterTitle || "Chương khác";
      if (!chapterMap.has(chapterKey)) {
        const sem: 1 | 2 =
          lesson.semesterCode === "1"
            ? 1
            : lesson.semesterCode === "2"
              ? 2
              : getSemesterForChapter(lesson.gradeCode || activeGrade, chapterKey);
        const matchNum = chapterKey.match(/chương\s*(\d+)/i);
        const orderNum = lesson.chapterOrder || (matchNum ? parseInt(matchNum[1], 10) : 1);

        chapterMap.set(chapterKey, {
          title: chapterKey,
          order: orderNum,
          semester: sem,
          lessons: [],
        });
      }
      chapterMap.get(chapterKey)!.lessons.push(lesson);
    });

    const sem1Chapters: Array<{ title: string; order?: number; lessons: LessonSummaryDTO[] }> = [];
    const sem2Chapters: Array<{ title: string; order?: number; lessons: LessonSummaryDTO[] }> = [];

    Array.from(chapterMap.values())
      .sort((a, b) => a.order - b.order)
      .forEach((ch) => {
        ch.lessons.sort((a, b) => (a.orderInChapter || 0) - (b.orderInChapter || 0));
        if (ch.semester === 1) {
          sem1Chapters.push({ title: ch.title, order: ch.order, lessons: ch.lessons });
        } else {
          sem2Chapters.push({ title: ch.title, order: ch.order, lessons: ch.lessons });
        }
      });

    return {
      sem1: sem1Chapters,
      sem2: sem2Chapters,
    };
  }, [curriculum, tabLessons, activeGrade]);

  // Search results if search term is active
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.trim().toLowerCase();
    return lessons.filter((l) => {
      const matchTitle = (l.title || "").toLowerCase().includes(q);
      const matchCode = (l.code || "").toLowerCase().includes(q);
      const matchChapter = (l.chapterTitle || "").toLowerCase().includes(q);
      const matchOrder = l.orderInChapter
        ? `bài ${l.orderInChapter}`.includes(q) || String(l.orderInChapter) === q
        : false;
      return matchTitle || matchCode || matchChapter || matchOrder;
    });
  }, [lessons, searchTerm]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[460px]">
          <div className="md:col-span-7 bg-slate-100 rounded-xl" />
          <div className="md:col-span-5 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  // ── CASE 1: SEARCH RESULTS ──
  if (searchTerm.trim()) {
    return (
      <LessonSearchResults
        searchTerm={searchTerm}
        results={searchResults}
        onSelectLesson={onSelectLesson}
      />
    );
  }

  // ── CASE 2: SELECTED TAB INTERFACE (2-COLUMN LAYOUT) ──
  return (
    <div className="w-full min-w-0 space-y-4 overflow-visible">
      {/* ── 2. MAIN 2-COLUMN VIEW CONTAINER ── */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-xs grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[500px] overflow-visible">
        {/* ══════════════════════════════════════════════════════════════
            CỘT 1: PHÂN CẤP HỌC KỲ > CHƯƠNG > BÀI (~58% width)
           ══════════════════════════════════════════════════════════════ */}
        <div className="md:col-span-7 flex flex-col min-w-0 overflow-visible">
          {/* Subheader: Lọc theo Học kỳ */}
          <div className="border-b border-slate-100 px-4 md:px-6 py-3 bg-slate-50/50 flex items-center justify-between text-xs font-bold gap-3 flex-wrap min-w-0">
            <div className="relative inline-flex items-center min-w-0">
              <GraduationCap className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-primary-500)] pointer-events-none" />
              <select
                value={activeGrade}
                onChange={(e) => handleTabChange(e.target.value)}
                title="Chọn khối lớp"
                aria-label="Chọn khối lớp"
                className="h-8 pl-8 pr-8 rounded-xl text-sm font-header font-bold text-slate-900 bg-white border border-slate-200 shadow-2xs appearance-none cursor-pointer hover:border-[var(--color-primary-400)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)] transition-colors"
              >
                {grades.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Quick semester switcher */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setOpenSemester(1)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                  openSemester === 1
                    ? "bg-[var(--color-primary-500)] text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <span>Học kỳ I</span>
              </button>
              <button
                type="button"
                onClick={() => setOpenSemester(2)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                  openSemester === 2
                    ? "bg-[var(--color-primary-500)] text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <span>Học kỳ II</span>
              </button>
            </div>
          </div>

          {/* Danh sách phân cấp dạng Accordion Dropdown: Chỉ 1 học kỳ mở lên tại một thời điểm */}
          <div className="flex-1 px-5 md:px-6 py-5 space-y-4 overflow-visible">
            {tabLessons.length === 0 ? (
              <div className="py-14 text-center text-sm text-slate-400">
                Chưa có dữ liệu bài học cho khối {activeGradeLabel}.
              </div>
            ) : (
              [
                {
                  number: 1 as const,
                  title: "Học kỳ I",
                  chapters: semesterData.sem1,
                  theme: "primary" as const,
                },
                {
                  number: 2 as const,
                  title: "Học kỳ II",
                  chapters: semesterData.sem2,
                  theme: "indigo" as const,
                },
              ].map((sem) => (
                <SemesterDropdownItem
                  key={sem.number}
                  title={sem.title}
                  isOpen={openSemester === sem.number}
                  onToggle={() => setOpenSemester(sem.number)}
                  chapters={sem.chapters}
                  previewLessonId={previewLesson?.id}
                  onSelectLesson={setPreviewLesson}
                  theme={sem.theme}
                />
              ))
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            CỘT 2: PREVIEW BÀI HỌC HOẶC EMPTY CHỜ CLICK BÀI (~42% width)
           ══════════════════════════════════════════════════════════════ */}
        <LessonPreviewPanel
          lesson={previewLesson}
          onConfirmLesson={onSelectLesson}
        />
      </div>
    </div>
  );
}
