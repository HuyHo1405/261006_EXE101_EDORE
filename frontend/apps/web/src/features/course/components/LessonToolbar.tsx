"use client";

import React from "react";
import { Search, ChevronDown, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const grades = [
    { label: "Tất cả lớp", value: "" },
    { label: "Lớp 6", value: "6" },
    { label: "Lớp 7", value: "7" },
    { label: "Lớp 8", value: "8" },
  ];

  const textbooks = [
    { label: "Tất cả bộ sách", value: "" },
    { label: "Kết nối tri thức (KNTT)", value: "KNTT" },
    { label: "Chân trời sáng tạo (CTST)", value: "CTST" },
    { label: "Cánh diều (CD)", value: "CD" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[var(--color-neutral-300)] rounded-2xl p-2.5 shadow-xs overflow-visible">
      {/* ── LEFT FILTERS: GRADES & TEXTBOOKS ── */}
      <div className="flex items-center gap-2 flex-wrap py-0.5 overflow-visible">
        {/* Grade quick pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {grades.map((g) => {
            const isSelected = selectedGrade === g.value;
            return (
              <button
                key={g.value}
                type="button"
                onClick={() => onSelectGrade(g.value)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap h-8 shrink-0 ${
                  isSelected
                    ? "bg-[var(--color-primary-500)] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100"
                }`}
              >
                {g.label}
              </button>
            );
          })}
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
            <option value="orderInChapter">Thứ tự bài học</option>
            <option value="title">Theo tên bài (A-Z)</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
