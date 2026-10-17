"use client";

import React from "react";
import { Search, ChevronDown, GraduationCap, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/features/course/queries/courseQueries";

interface LessonToolbarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedGrade: string;
  onSelectGrade: (grade: string) => void;
  selectedTextbook: string;
  onSelectTextbook: (textbook: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
}

export function LessonToolbar({
  searchTerm,
  onSearchChange,
  selectedGrade,
  onSelectGrade,
  selectedTextbook,
  onSelectTextbook,
  sortBy,
  onSortByChange,
}: LessonToolbarProps) {
  const { data: gradeCategories } = useCategories("GRADE");
  const { data: textbookCategories } = useCategories("TEXTBOOK");

  // Dynamic Grade categories ordered by grade number (6, 7, 8, 9)
  const grades = React.useMemo(() => {
    const list = [{ label: "Tất cả lớp", value: "" }];
    if (gradeCategories && gradeCategories.length > 0) {
      const sorted = [...gradeCategories].sort((a, b) => {
        const numA = parseInt(a.code, 10);
        const numB = parseInt(b.code, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.code.localeCompare(b.code);
      });
      sorted.forEach((c) => {
        list.push({ label: c.name || `Lớp ${c.code}`, value: c.code });
      });
    } else {
      list.push(
        { label: "Lớp 6", value: "6" },
        { label: "Lớp 7", value: "7" },
        { label: "Lớp 8", value: "8" },
        { label: "Lớp 9", value: "9" }
      );
    }
    return list;
  }, [gradeCategories]);

  // Dynamic Textbook categories with fallback
  const textbooks = React.useMemo(() => {
    const list = [{ label: "Tất cả bộ sách", value: "" }];
    if (textbookCategories && textbookCategories.length > 0) {
      textbookCategories.forEach((tb) => {
        list.push({ label: `${tb.name} (${tb.code})`, value: tb.code });
      });
    } else {
      list.push(
        { label: "Kết nối tri thức (KNTT)", value: "KNTT" },
        { label: "Chân trời sáng tạo (CTST)", value: "CTST" },
        { label: "Cánh diều (CD)", value: "CD" }
      );
    }
    return list;
  }, [textbookCategories]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[var(--color-neutral-300)] rounded-2xl p-2.5 shadow-xs overflow-visible">
      {/* ── LEFT FILTERS: GRADES & TEXTBOOKS ── */}
      <div className="flex items-center gap-2 flex-wrap py-0.5 overflow-visible">
        {/* Grade selector dropdown */}
        <div className="relative inline-block shrink-0">
          <select
            value={selectedGrade}
            onChange={(e) => onSelectGrade(e.target.value)}
            className={`h-8 px-3 pr-7 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white border border-slate-200/80 appearance-none focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)] ${
              selectedGrade
                ? "border-[var(--color-primary-500)] text-[var(--color-primary-600)] bg-[var(--color-primary-50)] shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            title="Chọn khối lớp"
          >
            {grades.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Textbook selector dropdown */}
        <div className="relative inline-block shrink-0">
          <select
            value={selectedTextbook}
            onChange={(e) => onSelectTextbook(e.target.value)}
            className={`h-8 px-3 pr-7 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white border border-slate-200/80 appearance-none focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)] ${
              selectedTextbook
                ? "border-[var(--color-primary-500)] text-[var(--color-primary-600)] bg-[var(--color-primary-50)] shadow-xs"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            title="Chọn bộ sách"
          >
            {textbooks.map((tb) => (
              <option key={tb.value} value={tb.value}>
                {tb.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* ── RIGHT: SEARCH & SORT ── */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto">
        {/* Search input */}
        <div className="relative flex-1 sm:w-56 md:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Tìm theo tên bài, số bài, mã..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 border-slate-200 bg-white pl-8.5 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[var(--color-primary-400)] focus:ring-1 focus:ring-[var(--color-primary-400)] rounded-xl w-full"
          />
        </div>

        {/* Sort selector */}
        <div className="relative inline-block shrink-0">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="h-8 px-3 pr-7 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-100 appearance-none focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)]"
            title="Sắp xếp theo"
          >
            <option value="gradeCode">Theo khối lớp</option>
            <option value="orderInChapter">Thứ tự bài học</option>
            <option value="title">Theo tên bài (A-Z)</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
