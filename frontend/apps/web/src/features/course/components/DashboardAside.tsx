"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  BookOpen,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { CourseResponseDTO } from "@edore/types";

interface DashboardAsideProps {
  activeTab: "courses" | "scripts" | "classConfigs";
  onTabChange: (tab: "courses" | "scripts" | "classConfigs") => void;
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  courses?: CourseResponseDTO[];
  selectedCourseId?: string | null;
  onSelectCourse?: (course: CourseResponseDTO) => void;
  onCreateCourse?: () => void;
  onCreateScriptForCourse?: (courseId: string) => void;
}

export function DashboardAside({
  activeTab,
  onTabChange,
  selectedCategoryId,
  onSelectCategory,
  courses = [],
  selectedCourseId,
  onSelectCourse,
  onCreateCourse,
  onCreateScriptForCourse,
}: DashboardAsideProps) {
  const router = useRouter();
  // State to control full Aside overlay drawer visibility
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // State to collapse/expand tree sections inside the full Aside
  const [isCoursesExpanded, setIsCoursesExpanded] = useState(true);

  // State to collapse/expand individual course script sub-trees
  const [expandedCourseIds, setExpandedCourseIds] = useState<Record<string, boolean>>({});

  const toggleCourseExpand = (courseId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedCourseIds((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  // Auto expand section and course tree when active tab or selected course changes
  React.useEffect(() => {
    if (activeTab === "courses") {
      setIsCoursesExpanded(true);
    }
    if (selectedCourseId) {
      setExpandedCourseIds((prev) => ({
        ...prev,
        [selectedCourseId]: true,
      }));
    }
  }, [activeTab, selectedCourseId]);

  const handleGeneralCoursesSelect = () => {
    onTabChange("courses");
    onSelectCategory(null);
    setIsCoursesExpanded(true);
    setIsOverlayOpen(false);
  };

  const handleCreateCourseClick = () => {
    setIsOverlayOpen(false);
    if (onCreateCourse) {
      onCreateCourse();
    }
  };

  return (
    <aside className="relative w-16 shrink-0 bg-white border border-white/20 shadow-2xl rounded-2xl md:rounded-3xl px-2.5 py-3 sm:py-4 md:py-6 flex flex-col items-center justify-between self-stretch min-h-[580px] font-sans z-30">
      {/* ── COMPACT SIDEBAR ICONS (DEFAULT MINIMIZED STATE - 0% LAYOUT REFLOW) ── */}
      <div className="w-full flex flex-col items-center space-y-4">
        {/* Maximize / Expand Toggle Button with Hover Transform & Scale Bouncing */}
        <button
          type="button"
          onClick={() => setIsOverlayOpen(true)}
          title="Mở toàn bộ Aside Overlay"
          className="h-11 w-11 flex items-center justify-center rounded-2xl bg-[var(--color-primary-500)] text-white shadow-md shadow-[var(--color-primary-500)]/30 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer mb-1 group shrink-0"
        >
          <PanelLeftOpen className="h-5 w-5 transform group-hover:rotate-12 transition-transform duration-300" />
        </button>

        <div className="w-8 h-[1px] bg-slate-200/80 my-1" />

        {/* Courses Icon Button */}
        <button
          type="button"
          onClick={() => {
            onTabChange("courses");
            setIsCoursesExpanded(true);
            setIsOverlayOpen(true);
          }}
          title="Khóa học của tôi (Mở Aside)"
          className={`p-3 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-center transform hover:scale-105 active:scale-95 ${
            activeTab === "courses"
              ? "bg-[var(--color-primary-500)] text-white shadow-md shadow-[var(--color-primary-500)]/25"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <FolderOpen className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom helper icon with hover slide animation */}
      <div className="pt-4 border-t border-slate-100 w-full flex justify-center">
        <button
          type="button"
          onClick={() => setIsOverlayOpen(true)}
          title="Mở rộng Sidebar"
          className="text-slate-400 hover:text-slate-900 p-2 cursor-pointer transform hover:translate-x-1 transition-all duration-200"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ── SMOOTH BACKDROP OVERLAY (GPU-ACCELERATED FADE) ── */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out ${
          isOverlayOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOverlayOpen(false)}
      />

      {/* ── FULL ASIDE OVERLAY DRAWER (GPU-ACCELERATED FULL HORIZONTAL SLIDE DRAWER) ── */}
      <div
        className={`absolute top-0 left-0 z-50 w-68 h-full bg-white border border-slate-200/80 shadow-2xl rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 flex flex-col justify-between transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) transform font-sans ${
          isOverlayOpen
            ? "translate-x-0 opacity-100 pointer-events-auto shadow-slate-900/15"
            : "-translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div>
          {/* Header Bar: Minimalist Minimize Button */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <span className="text-base font-bold font-header uppercase tracking-wide text-slate-900">
              Mục lục
            </span>
            <button
              type="button"
              onClick={() => setIsOverlayOpen(false)}
              title="Thu nhỏ Aside"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:scale-95 px-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer border border-slate-200/60 shadow-xs"
            >
              <PanelLeftClose className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" />
              <span>Thu nhỏ</span>
            </button>
          </div>

          {/* IDE Tree View Menu */}
          <div className="space-y-3">
            {/* ── SECTION 1: KHÓA HỌC CỦA TÔI ── */}
            <div className="space-y-1">
              {/* Top Level Item */}
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={handleGeneralCoursesSelect}
                  className={`flex-1 flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer transform hover:translate-x-0.5 ${
                    activeTab === "courses" && selectedCategoryId === null
                      ? "bg-[var(--color-primary-500)] text-white shadow-md shadow-[var(--color-primary-500)]/25"
                      : "text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FolderOpen className={`h-4 w-4 transition-colors ${activeTab === "courses" ? "text-white" : "text-[var(--color-primary-600)]"}`} />
                    <span className="font-header uppercase tracking-wide text-xs font-bold">
                      Khóa học của tôi
                    </span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsCoursesExpanded(!isCoursesExpanded)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 active:scale-90 transition-all cursor-pointer"
                  title="Mở rộng / Thu gọn cây thư mục"
                >
                  <ChevronDown
                    className={`h-3.5 w-3.5 transform transition-transform duration-300 ${
                      isCoursesExpanded ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </button>
              </div>

              {/* IDE Tree View Branch Accordion */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  isCoursesExpanded ? "opacity-100" : "hidden opacity-0"
                }`}
              >
                <div className="overflow-visible">
                  <div className="ml-4 pl-3 border-l-2 border-slate-200 space-y-1 pt-1.5 pb-1 max-h-[260px] overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={handleGeneralCoursesSelect}
                      className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer transform hover:translate-x-1 ${
                        activeTab === "courses" && selectedCategoryId === null && !selectedCourseId
                          ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-bold border border-[var(--color-primary-200)] shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-3.5 w-3.5 text-[var(--color-primary-600)] shrink-0" />
                        <span>Tổng quan khóa học</span>
                      </div>
                    </button>

                    {/* DYNAMIC LIST OF COURSES FROM BACKEND */}
                    {courses && courses.length > 0 ? (
                      courses.map((course) => {
                        const isSelected = activeTab === "courses" && selectedCourseId === course.id;
                        const isExpanded = expandedCourseIds[course.id] ?? isSelected;

                        return (
                          <div key={course.id} className="group/course space-y-0.5">
                            {/* Course Item Row */}
                            <div
                              onClick={() => {
                                onTabChange("courses");
                                setIsCoursesExpanded(true);
                                if (onSelectCourse) {
                                  onSelectCourse(course);
                                }
                                setExpandedCourseIds((prev) => ({
                                  ...prev,
                                  [course.id]: true,
                                }));
                              }}
                              className={`group flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer transform hover:translate-x-0.5 ${
                                isSelected
                                  ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-bold border border-[var(--color-primary-200)] shadow-xs"
                                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                              }`}
                              title={course.title}
                            >
                              {/* Left side: Icon that turns into Chevron on hover or when expanded */}
                              <div className="flex items-center gap-1.5 min-w-0 pr-1 flex-1">
                                <button
                                  type="button"
                                  onClick={(e) => toggleCourseExpand(course.id, e)}
                                  className="p-0.5 rounded text-slate-400 hover:text-[var(--color-primary-600)] transition-colors cursor-pointer shrink-0"
                                  title={isExpanded ? "Thu gọn kịch bản" : "Mở rộng kịch bản"}
                                >
                                  <div className="relative h-3.5 w-3.5 flex items-center justify-center">
                                    {/* BookOpen icon: visible ONLY when NOT expanded and NOT hovering */}
                                    <BookOpen
                                      className={`h-3.5 w-3.5 transition-opacity duration-200 ${
                                        isExpanded
                                          ? "opacity-0 absolute"
                                          : "group-hover/course:opacity-0 opacity-100"
                                      } ${isSelected ? "text-[var(--color-primary-600)]" : "text-slate-400"}`}
                                    />
                                    {/* Chevron icon: visible when EXPANDED OR when HOVERING */}
                                    <ChevronDown
                                      className={`h-3.5 w-3.5 transition-all duration-200 ${
                                        isExpanded
                                          ? "rotate-0 opacity-100 text-[var(--color-primary-600)]"
                                          : "-rotate-90 opacity-0 group-hover/course:opacity-100 absolute text-slate-500"
                                      }`}
                                    />
                                  </div>
                                </button>

                                <span className="truncate text-left font-medium">{course.title}</span>
                              </div>

                              {/* Right side: Action Plus (+) Button on Hover */}
                              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/course:opacity-100 transition-opacity duration-200">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onCreateScriptForCourse) {
                                      onCreateScriptForCourse(course.id);
                                    } else if (onSelectCourse) {
                                      onSelectCourse(course);
                                    }
                                    setIsOverlayOpen(false);
                                  }}
                                  className="p-1 rounded-md text-slate-500 hover:text-[var(--color-primary-600)] hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                                  title="Thêm kịch bản cho khóa học này"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            {/* NESTED SCRIPTS SUB-TREE LEVEL */}
                            {isExpanded && (
                              <div className="ml-4 pl-2.5 border-l border-slate-200 my-0.5 space-y-0.5 animate-in fade-in duration-150">
                                {course.scripts && course.scripts.length > 0 ? (
                                  course.scripts.map((script) => (
                                    <button
                                      key={script.id}
                                      type="button"
                                      onClick={() => {
                                        onTabChange("courses");
                                        if (onSelectCourse) {
                                          onSelectCourse(course);
                                        }
                                        setIsOverlayOpen(false);
                                        router.push(`/dashboard/scripts/${script.id}?courseId=${course.id}`);
                                      }}
                                      className="group/item flex w-full items-center gap-1.5 py-1 px-2 text-[11px] font-medium text-slate-500 hover:text-[var(--color-primary-700)] hover:bg-slate-100/80 rounded-md cursor-pointer transition-all duration-150 transform hover:translate-x-0.5"
                                      title={script.title}
                                    >
                                      <FileText className="h-3 w-3 shrink-0 text-slate-400 group-hover/item:text-[var(--color-primary-600)] transition-colors" />
                                      <span className="truncate text-left">{script.title}</span>
                                    </button>
                                  ))
                                ) : (
                                  <div className="py-0.5 px-2 text-[10px] italic text-slate-400">
                                    Chưa có kịch bản
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-2.5 py-1 text-[11px] italic text-slate-400">
                        Chưa có khóa học nào
                      </div>
                    )}

                    {/* Action Item: Thêm khóa học */}
                    <button
                      type="button"
                      onClick={handleCreateCourseClick}
                      className="group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 cursor-pointer transform hover:translate-x-1"
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="h-3.5 w-3.5 text-slate-500 group-hover:text-[var(--color-primary-600)] transition-colors shrink-0" />
                        <span>Thêm khóa học</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Edore Workspace</span>
          <button
            type="button"
            onClick={() => setIsOverlayOpen(false)}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer transform hover:translate-x-0.5 transition-transform"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
            <span>Thu nhỏ</span>
          </button>
        </div>
      </div>
    </aside>
  );
}



