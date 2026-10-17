"use client";

/**
 * LessonGrid — Selected Tab Interface (2-Column Layout)
 *
 * Tab bar chọn Khối lớp: Lớp 6, Lớp 7, Lớp 8, Lớp 9
 * Cột 1: Phân cấp theo: Học kỳ > Chương > Bài
 * Cột 2: Preview chi tiết của bài đã chọn (hoặc Empty state chờ click bài)
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  Calendar,
  Layers,
  Search,
  Bookmark,
  CheckCircle2,
  Sparkles,
  FileText,
  ChevronDown,
  Check,
} from "lucide-react";
import type { LessonSummaryDTO, CurriculumSemesterDTO } from "@edore/types";
import { useCategories } from "@/features/course/queries/courseQueries";
import { getSemesterForChapter } from "@/features/course/data/standardLessons";
import { cn } from "@/lib/utils";

// ── SUBCOMPONENT: DISPLAY SEMESTER DROPDOWN ───────────────────────────────────
interface SemesterDropdownItemProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  chapters: Array<{ title: string; order?: number; lessons: LessonSummaryDTO[] }>;
  previewLessonId?: string;
  onSelectLesson: (lesson: LessonSummaryDTO) => void;
  theme?: "primary" | "indigo";
}

function SemesterDropdownItem({
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
        "rounded-2xl border transition-all duration-200 overflow-hidden",
        isOpen
          ? isIndigo
            ? "border-indigo-300 bg-white shadow-xs"
            : "border-[var(--color-primary-300)] bg-white shadow-xs"
          : "border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300"
      )}
    >
      {/* Dropdown Header: Nhấn để mở (tự động đóng học kỳ còn lại) */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "p-2 rounded-xl transition-colors",
              isOpen
                ? isIndigo
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-[var(--color-primary-500)] text-white shadow-xs"
                : "bg-white text-slate-500 border border-slate-200"
            )}
          >
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <span className="font-header font-bold text-sm text-slate-900">
              {title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
            {isOpen ? "Đang mở" : "Nhấn để mở"}
          </span>
          <div
            className={cn(
              "p-1.5 rounded-lg transition-transform duration-200",
              isOpen
                ? isIndigo
                  ? "rotate-180 text-indigo-600"
                  : "rotate-180 text-[var(--color-primary-600)]"
                : "text-slate-400"
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </button>

      {/* Dropdown Content: Chỉ hiển thị khi isOpen */}
      {isOpen && (
        <div className="border-t border-slate-100 p-4 space-y-5 bg-white">
          {chapters.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 italic">
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
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider shrink-0",
                        isIndigo
                          ? "bg-indigo-100 text-indigo-750"
                          : "bg-[var(--color-primary-100)] text-[var(--color-primary-800)]"
                      )}
                    >
                      {chapter.order ? `Chương ${chapter.order}` : "Chương"}
                    </span>
                    <p
                      className="font-header text-xs font-bold text-slate-800 line-clamp-1 flex-1 uppercase"
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
                                ? "bg-indigo-50 text-indigo-700 font-bold pl-4 shadow-2xs border border-indigo-200"
                                : "bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-bold pl-4 shadow-2xs border border-[var(--color-primary-200)]"
                              : isIndigo
                                ? "text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:pl-4"
                                : "text-slate-700 hover:bg-slate-50 hover:text-[var(--color-primary-600)] hover:pl-4"
                          )}
                          title={lesson.title}
                        >
                          <span className="line-clamp-1 leading-snug flex-1">
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

interface LessonGridProps {
  lessons?: LessonSummaryDTO[];
  curriculum?: CurriculumSemesterDTO[];
  isLoading: boolean;
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

  // Learning outcomes parsed from lesson data (JSON array or newline string)
  const previewOutcomes = useMemo(() => {
    if (!previewLesson) return [];
    if (previewLesson.learningObjectives) {
      try {
        const parsed = JSON.parse(previewLesson.learningObjectives);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => (typeof item === "string" ? item : JSON.stringify(item)));
        }
      } catch {
        const lines = previewLesson.learningObjectives
          .split("\n")
          .map((s) => s.trim().replace(/^[-*•\d.]+\s*/, ""))
          .filter(Boolean);
        if (lines.length > 0) return lines;
      }
    }
    return [
      `Nắm vững kiến thức trọng tâm và nội dung cốt lõi của bài học "${previewLesson.title}".`,
      "Vận dụng kiến thức để trả lời câu hỏi và thực hiện các hoạt động học tập liên quan.",
    ];
  }, [previewLesson]);

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

  // Filter lessons for the active tab grade & textbook
  const tabLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      // 1. Grade filter
      if (activeGrade) {
        const cleanGrade = (lesson.gradeCode || "").replace(/\D+/g, "");
        const targetGrade = activeGrade.replace(/\D+/g, "");
        if (cleanGrade && targetGrade && cleanGrade !== targetGrade) {
          return false;
        }
      }
      // 2. Textbook filter
      if (selectedTextbook && lesson.textbookCode) {
        if (lesson.textbookCode.toLowerCase() !== selectedTextbook.toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  }, [lessons, activeGrade, selectedTextbook]);

  // Group lessons by Semester > Chapter > Lesson
  const semesterData = useMemo(() => {
    // 1. If backend curriculum tree is provided directly
    if (curriculum && curriculum.length > 0) {
      const sem1Item = curriculum.find((c) => c.semesterCode === "1");
      const sem2Item = curriculum.find((c) => c.semesterCode === "2");

      const mapChapters = (chapters?: CurriculumSemesterDTO["chapters"]) => {
        if (!chapters) return [];
        return chapters.map((ch) => ({
          title: ch.title,
          order: ch.order,
          lessons: ch.lessons.map((l) => ({
            id: l.id,
            code: l.code,
            title: l.title,
            orderInChapter: l.orderInChapter,
            gradeCode: l.gradeCode,
            subjectCode: l.subjectCode,
            textbookCode: l.textbookCode,
            chapterTitle: ch.order && !/^chương\s*\d+/i.test(ch.title)
              ? `Chương ${ch.order}: ${ch.title}`
              : ch.title,
            chapterId: ch.id,
            chapterOrder: ch.order,
          }) as LessonSummaryDTO),
        }));
      };

      return {
        sem1: mapChapters(sem1Item?.chapters),
        sem2: mapChapters(sem2Item?.chapters),
      };
    }

    // 2. Fallback: group from tabLessons (e.g. STANDARD_LESSONS or flat lessons)
    const chapterMap = new Map<
      string,
      {
        id: string;
        title: string;
        order: number;
        semester: 1 | 2;
        lessons: LessonSummaryDTO[];
      }
    >();

    tabLessons.forEach((lesson) => {
      const chapterKey = lesson.chapterTitle || lesson.chapterId || "Chương khác";
      if (!chapterMap.has(chapterKey)) {
        const sem: 1 | 2 =
          lesson.semesterCode === "1" ? 1
          : lesson.semesterCode === "2" ? 2
          : getSemesterForChapter(lesson.gradeCode || activeGrade, chapterKey);
        const matchNum = chapterKey.match(/chương\s*(\d+)/i);
        const orderNum = lesson.chapterOrder || (matchNum ? parseInt(matchNum[1], 10) : 1);

        chapterMap.set(chapterKey, {
          id: lesson.chapterId || chapterKey,
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
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-28 rounded-xl bg-slate-200" />
          ))}
        </div>
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
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span>
            Kết quả tìm kiếm cho <strong className="text-slate-900">"{searchTerm}"</strong>:{" "}
            <span className="text-[var(--color-primary-600)] font-bold">
              {searchResults.length} bài học
            </span>
          </span>
        </div>

        {searchResults.length === 0 ? (
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
            {searchResults.map((lesson) => {
              const displayOrder = lesson.orderInChapter ? `Bài ${lesson.orderInChapter}` : "Bài học";
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

  // ── CASE 2: SELECTED TAB INTERFACE (2-COLUMN LAYOUT) ──
  return (
    <div className="space-y-4">
      {/* ── 1. SELECTED GRADE TABS & FILTERS BAR (Replacing old LessonToolbar) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-2xs">
        {/* Grade tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {grades.map((g) => {
            const isActive = activeGrade === g.value;
            const gradeLessons = lessons.filter(
              (l) => (l.gradeCode || "").replace(/\D+/g, "") === g.value
            );

            return (
              <button
                key={g.value}
                type="button"
                onClick={() => handleTabChange(g.value)}
                className={cn(
                  "group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer select-none outline-none whitespace-nowrap",
                  isActive
                    ? "bg-[var(--color-primary-500)] text-white shadow-sm -translate-y-0.5"
                    : "bg-slate-50 text-slate-700 hover:text-[var(--color-primary-600)] hover:bg-slate-100 border border-slate-200/80"
                )}
              >
                <GraduationCap
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-white" : "text-[var(--color-primary-500)]"
                  )}
                />
                <span>{g.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white text-slate-600 group-hover:bg-[var(--color-primary-50)] group-hover:text-[var(--color-primary-700)] border border-slate-200"
                  )}
                >
                  {gradeLessons.length} bài
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* ── 2. MAIN 2-COLUMN VIEW CONTAINER ── */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[500px]">
        {/* ══════════════════════════════════════════════════════════════
            CỘT 1: PHÂN CẤP HỌC KỲ > CHƯƠNG > BÀI (~58% width)
           ══════════════════════════════════════════════════════════════ */}
        <div className="md:col-span-7 flex flex-col min-w-0">
          {/* Subheader: Lọc theo Học kỳ */}
          <div className="border-b border-slate-100 px-5 md:px-6 py-3.5 bg-slate-50/50 flex items-center justify-between text-xs font-bold gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-header font-bold text-slate-900 text-sm">
                {activeGradeLabel}
              </span>
            </div>

            {/* Quick semester switcher */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
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
          <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5 space-y-4 max-h-[580px] custom-scrollbar">
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
        <div className="md:col-span-5 bg-slate-50/60 flex flex-col min-h-[500px] max-h-[580px]">
          {previewLesson ? (
            /* Đã chọn bài: Hiển thị Preview chi tiết với nút Action luôn ghim ở dưới cùng */
            <div className="flex flex-col h-full flex-1 min-h-0">
              {/* Nội dung preview cuộn được */}
              <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                {/* Tiêu đề: Chương ở trên (với badge số chương), Bài học ở dưới */}
                <div className="space-y-2">
                  {previewLesson.chapterTitle && (
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[var(--color-primary-100)] border border-[var(--color-primary-200)] text-[var(--color-primary-800)] text-xs font-header font-bold uppercase tracking-wider max-w-full">
                      <span className="truncate">
                        {previewLesson.chapterOrder && !/^chương\s*\d+/i.test(previewLesson.chapterTitle)
                          ? `Chương ${previewLesson.chapterOrder}: ${previewLesson.chapterTitle}`
                          : previewLesson.chapterTitle}
                      </span>
                    </div>
                  )}
                  <h2 className="font-header font-bold text-base md:text-lg text-slate-900 leading-snug">
                    {previewLesson.orderInChapter
                      ? `Bài ${previewLesson.orderInChapter}: ${previewLesson.title}`
                      : previewLesson.title}
                  </h2>
                </div>

                {/* YÊU CẦU CẦN ĐẠT (MÀU XANH NGỌC - EMERALD CHUẨN SCRIPT OUTCOME UI) */}
                <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 space-y-3 shadow-2xs">
                  <h3 className="font-header font-extrabold text-xs uppercase tracking-wider text-emerald-950">
                    Yêu cầu cần đạt (Learning outcomes)
                  </h3>

                  <ul className="space-y-2.5 list-none p-0 m-0">
                    {previewOutcomes.map((outcome, idx) => (
                      <li key={idx} className="flex gap-2.5 font-body text-xs sm:text-sm text-slate-800 leading-relaxed items-start">
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
                  onClick={() => onSelectLesson(previewLesson)}
                  className="w-full flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-bold text-sm shadow-md transition-all cursor-pointer active:scale-98"
                >
                  <span>Chọn bài này & Bắt đầu sinh kịch bản</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Chưa chọn bài: Empty state chờ click bài */
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
          )}
        </div>
      </div>
    </div>
  );
}
