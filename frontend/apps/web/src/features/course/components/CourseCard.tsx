"use client";

import React, { useState } from "react";
import { BookOpen, FileText, MoreVertical, Trash2, ArrowRight, Pencil } from "lucide-react";
import type { CourseCardViewModel, CourseResponseDTO } from "@edore/types";

interface CourseCardProps {
  course: CourseCardViewModel;
  onSelect: (course: CourseCardViewModel) => void;
  onDelete: (id: string) => void;
  onEdit?: (rawCourse: CourseResponseDTO) => void;
}

export function CourseCard({ course, onSelect, onDelete, onEdit }: CourseCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!course) return null;

  const displayColor = course.displayColor || "#034ce4";
  const categoryNames = Array.isArray(course.categoryNames) ? course.categoryNames : [];
  const title = course.title || "Khóa học chưa đặt tên";
  const description = course.description || "Chưa có mô tả";
  const scriptCount = course.scriptCount ?? 0;

  return (
    <div
      onClick={() => onSelect(course)}
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
        {/* Top bar: Categories & Action menu */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1 min-h-[22px]">
              {categoryNames.slice(0, 2).map((cat, i) => (
                <span
                  key={i}
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200"
                  style={{
                    backgroundColor: isHovered ? displayColor : `${displayColor}15`,
                    color: isHovered ? "#ffffff" : displayColor,
                    border: `1px solid ${isHovered ? displayColor : `${displayColor}40`}`,
                    boxShadow: isHovered ? `0 2px 8px ${displayColor}40` : "none",
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Context Menu */}
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-800 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />
                  <div className="absolute right-0 top-9 z-30 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl space-y-0.5">
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          onEdit(course.raw);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                        <span>Chỉnh sửa</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDelete(course.id);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Xóa khóa học</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div className="mt-2.5 space-y-1">
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
                className="line-clamp-2 font-header font-bold text-base uppercase tracking-tight transition-colors duration-200 leading-snug min-h-[44px]"
                style={{ color: isHovered ? displayColor : "#0f172a" }}
              >
                {title}
              </h3>
            </div>
            <p className="line-clamp-2 text-xs text-slate-600 leading-relaxed font-body pt-1 min-h-[36px]">
              {description}
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] font-bold shrink-0">
          <div className="flex items-center gap-1.5 transition-colors duration-200" style={{ color: displayColor }}>
            <FileText className="h-3.5 w-3.5" />
            <span>{scriptCount} kịch bản</span>
          </div>
          <div className="flex items-center gap-1 group-hover:translate-x-1 transition-all duration-200" style={{ color: displayColor }}>
            <span>Xem chi tiết</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
