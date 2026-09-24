"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  FolderOpen,
  BookOpen,
  Plus,
  Search,
  Layers,
  Pencil,
  Users,
  Trash2,
  ChevronDown,
  ArrowLeft,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CategoryResponseDTO, CourseCardViewModel, CourseResponseDTO } from "@edore/types";
import { CategoryOptionBuilder } from "../builders/categoryOptionBuilder";
import { DashboardBreadcrumb } from "./DashboardBreadcrumb";

interface DashboardHeaderProps {
  currentCourse: CourseCardViewModel | null;
  onBackToCourses: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  categories?: CategoryResponseDTO[];
  totalCount?: number;
  onActionClick: () => void;
  onEditCourse?: (course: CourseResponseDTO, targetStage?: 1 | 2 | 3) => void;
  onDeleteCourse?: (id: string) => void;
  isCreatingScript?: boolean;
}

export function DashboardHeader({
  currentCourse,
  onBackToCourses,
  totalCount = 0,
}: {
  currentCourse: CourseCardViewModel | null;
  onBackToCourses: () => void;
  totalCount?: number;
}) {
  return (
    <div className="w-full font-sans space-y-3">
      {/* ── 1. TOP BREADCRUMB BAR (GIỮ NGUYÊN VỊ TRÍ CŨ TRÊN CÙNG) ── */}
      <DashboardBreadcrumb
        currentCourse={currentCourse}
        onBackToCourses={onBackToCourses}
        totalCount={totalCount}
      />

      {/* ── 2. MAIN HEADER TEXT SECTION (BADGES -> TITLE -> SUBTITLE WITH ACCENT BAR) ── */}
      <div className="flex items-stretch gap-3.5 pt-1">
        {/* Left vertical accent line matching course displayColor */}
        <div
          className="w-1.5 rounded-full shrink-0 self-stretch my-0.5"
          style={{
            backgroundColor: currentCourse?.displayColor || "var(--color-primary-500)",
          }}
        />

        {/* Text stack: Badges -> H1 Title -> Subtitle */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Top: Category Badges */}
          {currentCourse && Array.isArray(currentCourse.categoryNames) && currentCourse.categoryNames.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pb-0.5">
              {currentCourse.categoryNames.map((cat, i) => {
                const color = currentCourse.displayColor || "#034ce4";
                return (
                  <span
                    key={i}
                    className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all duration-200"
                    style={{
                      backgroundColor: `${color}10`,
                      color: color,
                      border: `1px solid ${color}35`,
                    }}
                  >
                    {cat}
                  </span>
                );
              })}
            </div>
          )}

          {/* H1 Title */}
          <h1 className="font-header font-bold text-2xl sm:text-3xl md:text-[32px] uppercase tracking-tight text-slate-900 leading-tight w-full">
            {currentCourse ? currentCourse.title : `Khóa học của tôi (${totalCount})`}
          </h1>

          {/* Subtitle / Description */}
          <p className="text-xs sm:text-sm text-slate-600 font-body leading-relaxed w-full">
            {currentCourse
              ? currentCourse.description
              : "Quản lý các workspace giảng dạy và kịch bản bài giảng theo từng môn học"}
          </p>
        </div>
      </div>
    </div>
  );
}

{/* ── 3. ACTION ROW BELOW HEADER (LEFT: LINK-STYLE BACK BUTTON, RIGHT: SPLIT BUTTON) ── */}
export function DashboardCourseActions({
  currentCourse,
  onBackToCourses,
  onEditCourse,
  onDeleteCourse,
}: {
  currentCourse: CourseCardViewModel | null;
  onBackToCourses: () => void;
  onEditCourse?: (course: CourseResponseDTO, targetStage?: 1 | 2 | 3) => void;
  onDeleteCourse?: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  if (!currentCourse) return null;

  return (
    <div className="flex items-center justify-between gap-4 pb-0.5 pt-0">
      {/* Left Column: Link-style Back Button */}
      <div>
        <button
          type="button"
          onClick={onBackToCourses}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-all duration-200 cursor-pointer py-1"
          title="Quay lại danh sách khóa học"
        >
          <ArrowLeft className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="font-body whitespace-nowrap group-hover:underline">Quay lại danh sách</span>
        </button>
      </div>

      {/* Right Column: Split Link-style Button [ Cấu hình lớp học | V ] */}
      {onEditCourse && (
        <div className="relative shrink-0 flex items-center gap-1.5">
          {/* Left Action: Cấu hình lớp học */}
          <button
            type="button"
            onClick={() => onEditCourse(currentCourse.raw, 2)}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-all duration-200 cursor-pointer py-1"
            title="Sửa cấu hình lớp học (Class config)"
          >
            <Users className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span className="font-body whitespace-nowrap group-hover:underline">Cấu hình lớp học</span>
          </button>

          {/* Vertical Divider */}
          <span className="text-[var(--color-primary-300)] text-xs font-light select-none">|</span>

          {/* Right Action: More Options Button */}
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="group inline-flex items-center justify-center text-xs font-bold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors duration-200 cursor-pointer p-1"
            title="Tùy chọn khác"
          >
            <MoreHorizontal className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
          </button>

          {/* Floating Dropdown Context Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xl space-y-0.5 animate-in fade-in zoom-in-95 duration-150 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEditCourse(currentCourse.raw, 1);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Pencil className="h-4 w-4 text-slate-500 shrink-0" />
                  <span>Sửa thông tin khóa học</span>
                </button>

                {onDeleteCourse && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onDeleteCourse(currentCourse.id);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>Xóa khóa học</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function DashboardToolbar({
  currentCourse,
  searchTerm,
  onSearchChange,
  selectedCategoryId,
  onSelectCategory,
  categories = [],
  onActionClick,
  isCreatingScript = false,
  sortBy = "updatedAt",
  onSortByChange,
  sortOrder = "desc",
  onSortOrderChange,
}: {
  currentCourse: CourseCardViewModel | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  categories?: CategoryResponseDTO[];
  onActionClick: () => void;
  isCreatingScript?: boolean;
  sortBy?: "updatedAt" | "title";
  onSortByChange?: (val: "updatedAt" | "title") => void;
  sortOrder?: "asc" | "desc";
  onSortOrderChange?: (val: "asc" | "desc") => void;
}) {
  const filterGroups = React.useMemo(() => {
    return new CategoryOptionBuilder(categories).build();
  }, [categories]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[var(--color-neutral-300)] rounded-2xl p-2.5 shadow-xs overflow-visible">
      {/* START (LEFT): CATEGORY BUILDER SELECTORS (CHỈ HIỂN THỊ KHI Ở OUTSIDE COURSE) */}
      {!currentCourse && (
        <div className="flex items-center gap-2 flex-wrap py-0.5 overflow-visible">
          {filterGroups.map((group) => {
            if (group.kind === "button") {
              const isSelected = selectedCategoryId === group.option.id;
              return (
                <button
                  key={group.type}
                  type="button"
                  onClick={() => onSelectCategory(isSelected ? null : group.option.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap h-8 shrink-0 ${isSelected
                    ? "bg-[var(--color-primary-500)] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100"
                    }`}
                >
                  {group.option.name}
                </button>
              );
            }

            const isGroupActive = group.options.some((o) => o.id === selectedCategoryId);
            return (
              <div key={group.type} className="relative inline-block shrink-0">
                <select
                  value={isGroupActive ? String(selectedCategoryId) : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    onSelectCategory(val ? Number(val) : null);
                  }}
                  className={`h-8 px-3 pr-7 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white border border-slate-200/80 appearance-none focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)] ${isGroupActive
                    ? "border-[var(--color-primary-500)] text-[var(--color-primary-600)] bg-[var(--color-primary-50)] shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  <option value="">{group.typeLabel}</option>
                  {group.options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            );
          })}
        </div>
      )}

      {/* END (RIGHT): SEARCH, SORT & CREATE ACTION */}
      <div className={`flex items-center gap-2 ${currentCourse ? "flex-1 w-full" : "shrink-0 self-end sm:self-auto w-full sm:w-auto"}`}>
        {/* SEARCH INPUT */}
        <div className={`relative ${currentCourse ? "flex-1 w-full" : "flex-1 sm:w-52 md:w-60"}`}>
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder={
              currentCourse ? "Tìm kiếm kịch bản..." : "Tìm kiếm khóa học..."
            }
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 border-slate-200 bg-white pl-8.5 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[var(--color-primary-400)] focus:ring-1 focus:ring-[var(--color-primary-400)] rounded-xl w-full"
          />
        </div>

        {/* SORT BY & DIRECTION CONTROLS (CHỈ HIỂN THỊ KHI Ở TRONG COURSE SCRIPT VIEW) */}
        {currentCourse && (
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative inline-block shrink-0">
              <select
                value={sortBy}
                onChange={(e) => onSortByChange?.(e.target.value as "updatedAt" | "title")}
                className="h-8 px-3 pr-7 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-100 appearance-none focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)]"
                title="Sắp xếp theo"
              >
                <option value="updatedAt">Mới cập nhật</option>
                <option value="title">Theo tên (A-Z)</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => onSortOrderChange?.(sortOrder === "asc" ? "desc" : "asc")}
              className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
              title={sortOrder === "asc" ? "Đang xếp: Tăng dần (ASC)" : "Đang xếp: Giảm dần (DESC)"}
            >
              <ArrowUpDown className={`h-3.5 w-3.5 transition-transform duration-200 ${sortOrder === "asc" ? "rotate-180 text-[var(--color-primary-600)]" : ""}`} />
            </button>
          </div>
        )}

        {/* ACTION BUTTON */}
        <Button
          onClick={onActionClick}
          disabled={isCreatingScript}
          className="h-8 gap-1.5 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] px-3 text-xs font-bold text-white shadow-sm rounded-xl cursor-pointer shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{currentCourse ? "Tạo kịch bản" : "Tạo khóa học"}</span>
        </Button>
      </div>
    </div>
  );
}


