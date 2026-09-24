"use client";

import React, { useState } from "react";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { DashboardAside } from "@/features/course/components/DashboardAside";
import { DashboardHeader, DashboardToolbar, DashboardCourseActions } from "@/features/course/components/DashboardHeader";
import { CourseGrid } from "@/features/course/components/CourseGrid";
import { ScriptGrid } from "@/features/course/components/ScriptGrid";
import { CreateCourseModal } from "@/features/course/components/CreateCourseModal";
import { useQueryClient } from "@tanstack/react-query";
import {
  useMyCourses,
  useCourseDetail,
  useCourseScripts,
  useCategories,
  useDeleteCourseMutation,
  useDeleteScriptMutation,
  useCreateScriptMutation,
  useUpdateScriptMutation,
  courseKeys,
} from "@/features/course/queries/courseQueries";
import { courseService } from "@/features/course/api/courseService";
import { createCourseCardViewModel } from "@/features/course/viewmodels/courseViewModel";
import type { CourseCardViewModel, CourseResponseDTO } from "@edore/types";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<"courses" | "scripts" | "classConfigs">("courses");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(0);
  const [sortBy, setSortBy] = useState<"updatedAt" | "title">("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Drill-down State (null = Course view; non-null = Script view inside course)
  const [selectedCourse, setSelectedCourse] = useState<CourseCardViewModel | null>(null);

  // Modal State
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<CourseResponseDTO | null>(null);
  const [editInitialStage, setEditInitialStage] = useState<1 | 2 | 3>(1);

  // Queries
  const { data: categories = [] } = useCategories();

  const { data: coursePage, isLoading: isLoadingCourses } = useMyCourses({
    searchTitle: searchTerm || undefined,
    categoryId: selectedCategoryId ?? undefined,
    include: "scripts",
    pageNumber: pageNumber,
    pageSize: 8,
    sortBy: sortBy,
    ascending: sortOrder === "asc",
  });

  const { data: detailCourseDto } = useCourseDetail(selectedCourse?.id || "");

  // Real-time active selected course computation (updates UI instantly upon edit mutation)
  const activeSelectedCourse = React.useMemo(() => {
    if (!selectedCourse) return null;
    if (detailCourseDto) {
      return createCourseCardViewModel(detailCourseDto);
    }
    const updatedDto = coursePage?.content?.find((c) => c?.id === selectedCourse.id);
    if (updatedDto) {
      return createCourseCardViewModel(updatedDto);
    }
    return selectedCourse;
  }, [selectedCourse, detailCourseDto, coursePage?.content]);

  const { data: scripts = [], isLoading: isLoadingScripts } = useCourseScripts(
    activeSelectedCourse?.id || ""
  );

  // Mutations
  const deleteCourseMutation = useDeleteCourseMutation();
  const deleteScriptMutation = useDeleteScriptMutation(activeSelectedCourse?.id || "");
  const updateScriptMutation = useUpdateScriptMutation(activeSelectedCourse?.id || "");
  const createScriptMutation = useCreateScriptMutation(activeSelectedCourse?.id || "", {
    onCreated: (script) => {
      router.push(`/dashboard/scripts/${script.id}?courseId=${script.courseId}`);
    },
  });

  // Handlers
  const queryClient = useQueryClient();

  const handleOpenCreateCourse = () => {
    setCourseToEdit(null);
    setEditInitialStage(1);
    setIsCreateCourseOpen(true);
  };

  const handleOpenEditCourse = (courseDto: CourseResponseDTO, targetStage: 1 | 2 | 3 = 1) => {
    setCourseToEdit(courseDto);
    setEditInitialStage(targetStage);
    setIsCreateCourseOpen(true);
  };

  const handleCreateScriptForCourse = (courseId: string) => {
    courseService.createScript(courseId).then((newScript) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.scripts(courseId) });
      router.push(`/dashboard/scripts/${newScript.id}?courseId=${courseId}`);
    });
  };

  const handleSelectCourse = (course: CourseCardViewModel) => {
    setSelectedCourse(course);
    setSearchTerm("");
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSearchTerm("");
  };

  const handleActionClick = () => {
    if (activeSelectedCourse) {
      createScriptMutation.mutate();
    } else {
      // Root level -> Open Create Course Modal
      handleOpenCreateCourse();
    }
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa khóa học này và tất cả kịch bản bên trong?")) {
      deleteCourseMutation.mutate(id, {
        onSuccess: () => {
          if (activeSelectedCourse?.id === id) {
            setSelectedCourse(null);
          }
        },
      });
    }
  };

  const handleDeleteScript = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa kịch bản này?")) {
      deleteScriptMutation.mutate(id);
    }
  };

  const handleRenameScript = (scriptId: string, newTitle: string) => {
    updateScriptMutation.mutate({ scriptId, payload: { title: newTitle } });
  };

  const filteredScripts = React.useMemo(() => {
    let result = scripts.filter((s) =>
      searchTerm ? s.title.toLowerCase().includes(searchTerm.toLowerCase()) : true
    );
    result = [...result].sort((a, b) => {
      if (sortBy === "title") {
        const cmp = (a.title || "").localeCompare(b.title || "");
        return sortOrder === "asc" ? cmp : -cmp;
      } else {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        const cmp = dateA - dateB;
        return sortOrder === "asc" ? cmp : -cmp;
      }
    });
    return result;
  }, [scripts, searchTerm, sortBy, sortOrder]);

  return (
    <AuthGuard>
      {/* ── BASE PRIMARY BLUE BACKGROUND CANVAS (MÀU XANH PRIMARY BASE #034ce4) ────── */}
      <div className="w-full bg-[var(--color-primary-500)] min-h-screen py-4 md:py-6 px-2.5 sm:px-4 md:px-6 font-body">
        
        {/* ── LAYOUT 2 CONTAINER SONG SONG KHÔNG GIẬT LAYOUT KHI LOAD (UNIFIED MIN-H = 6 ITEMS) ───── */}
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-stretch gap-4 md:gap-6 min-h-[580px]">
          
          {/* CONTAINER 1: ASIDE SIDEBAR */}
          <DashboardAside
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setSelectedCourse(null);
              setPageNumber(0);
            }}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(catId) => {
              setSelectedCategoryId(catId);
              setSelectedCourse(null);
              setPageNumber(0);
            }}
            courses={coursePage?.content || []}
            selectedCourseId={activeSelectedCourse?.id}
            onSelectCourse={(courseDto) => {
              setSelectedCourse(createCourseCardViewModel(courseDto));
            }}
            onCreateCourse={handleOpenCreateCourse}
            onCreateScriptForCourse={handleCreateScriptForCourse}
          />

          {/* CONTAINER 2: MAIN SECTION */}
          <main className="flex-1 min-w-0 w-full bg-white border border-white/20 shadow-2xl rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col justify-between self-stretch min-h-[580px]">
            <div className="flex flex-col h-full space-y-6">
              
              {/* 1. TOP TITLE & BREADCRUMBS (OUTSIDE GRAY CONTAINER) */}
              <DashboardHeader
                currentCourse={activeSelectedCourse}
                onBackToCourses={handleBackToCourses}
                totalCount={coursePage?.totalElements || 0}
              />

              {/* 2. MAIN CONTENT WRAPPER (ACTION ROW SITS RIGHT ON TOP OF GRAY CONTAINER) */}
              <div className="flex flex-col flex-1 space-y-1.5">
                <DashboardCourseActions
                  currentCourse={activeSelectedCourse}
                  onBackToCourses={handleBackToCourses}
                  onEditCourse={handleOpenEditCourse}
                  onDeleteCourse={handleDeleteCourse}
                />

                {/* TIMELINE-EDITOR STYLE GRAY CONTAINER WRAPPING FROM FILTER DOWN TO GRID & PAGING */}
                <div className="bg-[var(--color-neutral-200)] border border-[var(--color-neutral-300)] p-5 sm:p-6 md:p-7 rounded-2xl md:rounded-3xl shadow-sm flex flex-col flex-1 justify-between space-y-6">
                  
                  {/* SUB-HEADER TOOLBAR (FILTER SEARCH, SORT & ACTIONS) */}
                  <DashboardToolbar
                    currentCourse={activeSelectedCourse}
                    searchTerm={searchTerm}
                    onSearchChange={(val) => {
                      setSearchTerm(val);
                      setPageNumber(0);
                    }}
                    selectedCategoryId={selectedCategoryId}
                    onSelectCategory={(catId) => {
                      setSelectedCategoryId(catId);
                      setPageNumber(0);
                    }}
                    categories={categories}
                    onActionClick={handleActionClick}
                    isCreatingScript={createScriptMutation.isPending}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    sortOrder={sortOrder}
                    onSortOrderChange={setSortOrder}
                  />

                  {/* Main Section Content Items (4-column Grid & Paging inside Gray Container) */}
                  <div className="flex-1">
                    {activeSelectedCourse ? (
                      /* Level 2: Script View inside Course */
                      <div className="space-y-4">
                        <ScriptGrid
                          scripts={filteredScripts}
                          isLoading={isLoadingScripts}
                          onDeleteScript={handleDeleteScript}
                          onRenameScript={handleRenameScript}
                          onCreateScript={handleActionClick}
                          isCreatingScript={createScriptMutation.isPending}
                          courseId={activeSelectedCourse?.id}
                          displayColor={activeSelectedCourse?.displayColor}
                        />
                      </div>
                    ) : (
                      /* Level 1: Course View */
                      <div className="space-y-4">
                        <CourseGrid
                          courses={coursePage?.content || []}
                          isLoading={isLoadingCourses}
                          onSelectCourse={handleSelectCourse}
                          onDeleteCourse={handleDeleteCourse}
                          onEditCourse={handleOpenEditCourse}
                          onCreateCourse={handleOpenCreateCourse}
                          pageNumber={pageNumber}
                          totalPages={coursePage?.totalPages || 1}
                          onPageChange={setPageNumber}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Create & Edit Course Overlay Modal */}
          <CreateCourseModal
            isOpen={isCreateCourseOpen}
            courseToEdit={courseToEdit}
            initialStage={editInitialStage}
            onClose={() => {
              setIsCreateCourseOpen(false);
              setCourseToEdit(null);
            }}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
