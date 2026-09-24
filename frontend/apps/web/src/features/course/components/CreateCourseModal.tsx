"use client";
// Updated design tokens for CreateCourseModal

import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Sparkles,
  Loader2,
  Layers,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CourseResponseDTO, CourseDetailResponseDTO } from "@edore/types";
import { useCategories, useCreateCourseMutation, useUpdateCourseMutation } from "../queries/courseQueries";
import { courseService } from "../api/courseService";
import { ClassConfigEditor, type ClassConfigData } from "./ClassConfigEditor";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  courseToEdit?: CourseResponseDTO | CourseDetailResponseDTO | null;
  initialStage?: 1 | 2 | 3;
}

export function CreateCourseModal({
  isOpen,
  onClose,
  onSuccess,
  courseToEdit,
  initialStage = 1,
}: CreateCourseModalProps) {
  const isEditMode = Boolean(courseToEdit);
  const [stage, setStage] = useState<1 | 2 | 3>(initialStage);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [classConfigData, setClassConfigData] = useState<ClassConfigData>({
    id: "",
    name: "",
    duration: "MIN_45",
    classSize: "MEDIUM",
    space: "STANDARD",
    seatingLayout: "ROWS",
  });

  const [selectedCategoryMap, setSelectedCategoryMap] = useState<Record<string, number>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createCourseMutation = useCreateCourseMutation();
  const updateCourseMutation = useUpdateCourseMutation();
  const { data: categories = [] } = useCategories();

  const groupedCategories = React.useMemo(() => {
    const map = new Map<string, typeof categories>();
    const order = ["SUBJECT", "GRADE", "PURPOSE", "OTHER"];

    for (const key of order) {
      const items = categories.filter((c) => c && c.type === key);
      if (items.length > 0) {
        map.set(key, items);
      }
    }

    for (const cat of categories) {
      if (!cat || !cat.type || map.has(cat.type)) continue;
      map.set(cat.type, categories.filter((c) => c.type === cat.type));
    }
    return map;
  }, [categories]);

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      hasInitializedRef.current = false;
      return;
    }

    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    setStage(initialStage || 1);
    setErrorMessage(null);

    if (courseToEdit) {
      setTitle(courseToEdit.title || "");
      setDescription(courseToEdit.description || "");

      const initialCatMap: Record<string, number> = {};
      if (courseToEdit.categories && categories.length > 0) {
        for (const catSum of courseToEdit.categories) {
          const foundFull = categories.find((c) => c.id === catSum.id);
          if (foundFull?.type) {
            initialCatMap[foundFull.type] = foundFull.id;
          }
        }
      }
      setSelectedCategoryMap(initialCatMap);

      courseService
        .getCourseById(courseToEdit.id)
        .then((detail) => {
          if (detail.classConfig) {
            const cfg = detail.classConfig as any;
            setClassConfigData({
              id: cfg.id ? String(cfg.id) : "",
              name: cfg.name || "",
              duration: cfg.duration || "MIN_45",
              classSize: cfg.classSize || "MEDIUM",
              space: cfg.space || "STANDARD",
              seatingLayout: cfg.seatingLayout || "ROWS",
            });
          }
        })
        .catch(() => {});
    } else {
      setTitle("");
      setDescription("");
      setClassConfigData({
        id: "",
        name: "",
        duration: "MIN_45",
        classSize: "MEDIUM",
        space: "STANDARD",
        seatingLayout: "ROWS",
      });
      setSelectedCategoryMap({});
    }
  }, [isOpen, courseToEdit, categories, initialStage]);

  useEffect(() => {
    if (isOpen && courseToEdit && courseToEdit.categories && categories.length > 0) {
      setSelectedCategoryMap((prevMap) => {
        if (Object.keys(prevMap).length > 0) return prevMap;
        const initialCatMap: Record<string, number> = {};
        for (const catSum of courseToEdit.categories) {
          const foundFull = categories.find((c) => c.id === catSum.id);
          if (foundFull?.type) {
            initialCatMap[foundFull.type] = foundFull.id;
          }
        }
        return initialCatMap;
      });
    }
  }, [isOpen, courseToEdit, categories]);

  if (!isOpen) return null;

  const selectedCategoryIds = Object.values(selectedCategoryMap).filter(Boolean);
  const selectedCategories = categories.filter((c) => selectedCategoryIds.includes(c.id));

  const handleStepClick = (targetStage: 1 | 2 | 3) => {
    if (isEditMode) {
      setStage(targetStage);
      return;
    }
    if (targetStage === 3 && !title.trim()) {
      setStage(2);
      setErrorMessage("Vui lòng nhập tên khóa học trước.");
      return;
    }
    setStage(targetStage);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setStage(2);
      setErrorMessage("Vui lòng nhập tên khóa học.");
      return;
    }
    setErrorMessage(null);

    const payload: any = {
      title: title.trim(),
      description: description.trim() || undefined,
      categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      status: courseToEdit?.status || "DRAFT",
    };

    if (classConfigData.id) {
      payload.classConfigId = classConfigData.id;
    } else {
      payload.classConfigRequest = {
        name: classConfigData.name?.trim() || `Cấu hình phòng học - ${title.trim()}`,
        duration: classConfigData.duration || "MIN_45",
        classSize: classConfigData.classSize || "MEDIUM",
        space: classConfigData.space || "STANDARD",
        seatingLayout: classConfigData.seatingLayout || "ROWS",
      };
    }

    if (courseToEdit) {
      updateCourseMutation.mutate(
        { id: courseToEdit.id, payload },
        {
          onSuccess: () => {
            onClose();
            onSuccess?.();
          },
          onError: (err: any) => {
            setErrorMessage(err.message || "Cập nhật khóa học thất bại. Vui lòng thử lại.");
          },
        }
      );
    } else {
      createCourseMutation.mutate(payload, {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
        onError: (err: any) => {
          setErrorMessage(err.message || "Tạo khóa học thất bại. Vui lòng thử lại.");
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-6 md:p-8 animate-in fade-in duration-200 font-body">
      <div className="relative w-full max-w-5xl h-full max-h-[92vh] rounded-[var(--radius-xl)] border border-[var(--color-neutral-200)] bg-white shadow-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* ── LEFT COLUMN: VERTICAL STEPS NAVIGATION SIDEBAR (SURFACE CARD COLORED --color-neutral-100 PER DESIGN TOKENS) ── */}
        <div className="w-full md:w-64 bg-[var(--color-neutral-100)] text-[var(--color-neutral-900)] p-5 md:p-6 flex flex-col justify-between shrink-0 border-b md:border-b-0 md:border-r border-[var(--color-neutral-200)]">
          <div>
            <div className="mb-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-neutral-500)] font-bold">
                {isEditMode ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
              </span>
              <h2 className="text-base font-bold font-header uppercase tracking-tight text-[var(--color-neutral-900)] truncate mt-0.5">
                {isEditMode ? title || "Khóa học" : "Tạo khóa học"}
              </h2>
            </div>

            {/* VERTICAL STEPPERS TIMELINE WITH CONNECTOR LINES */}
            <div className="relative pt-2 space-y-7">
              {/* STEP 1 ITEM */}
              <div className="relative flex items-start">
                <div
                  className={`absolute left-4 top-8 w-0.5 h-9 -ml-[1px] transition-colors duration-300 ${
                    stage > 1 && selectedCategoryIds.length > 0
                      ? "bg-[var(--color-primary-500)]"
                      : "bg-[var(--color-neutral-300)]"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => handleStepClick(1)}
                  className="w-full text-left flex items-start gap-3.5 group cursor-pointer z-10"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] font-bold text-xs transition-all duration-200 ${
                      stage === 1
                        ? "bg-[var(--color-primary-500)] text-white shadow-sm ring-2 ring-[var(--color-primary-200)] scale-105"
                        : selectedCategoryIds.length > 0
                        ? "bg-[var(--color-primary-500)] text-white shadow-xs"
                        : "bg-white text-[var(--color-neutral-600)] border border-[var(--color-neutral-300)] shadow-2xs group-hover:border-[var(--color-neutral-400)] group-hover:text-[var(--color-neutral-900)]"
                    }`}
                  >
                    {selectedCategoryIds.length > 0 ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      "1"
                    )}
                  </div>
                  <div className="pt-0.5">
                    <span
                      className={`font-header uppercase text-xs transition-colors ${
                        stage === 1 ? "text-[var(--color-primary-600)] font-extrabold" : "text-[var(--color-neutral-700)] font-bold group-hover:text-[var(--color-neutral-900)]"
                      }`}
                    >
                      Phân loại danh mục
                    </span>
                    <p className="font-body text-[11px] text-[var(--color-neutral-500)] mt-0.5 leading-snug">
                      Môn học, khối lớp, mục đích
                    </p>
                  </div>
                </button>
              </div>

              {/* STEP 2 ITEM */}
              <div className="relative flex items-start">
                <div
                  className={`absolute left-4 top-8 w-0.5 h-9 -ml-[1px] transition-colors duration-300 ${
                    stage > 2 && title.trim()
                      ? "bg-[var(--color-primary-500)]"
                      : "bg-[var(--color-neutral-300)]"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => handleStepClick(2)}
                  className="w-full text-left flex items-start gap-3.5 group cursor-pointer z-10"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] font-bold text-xs transition-all duration-200 ${
                      stage === 2
                        ? "bg-[var(--color-primary-500)] text-white shadow-sm ring-2 ring-[var(--color-primary-200)] scale-105"
                        : title.trim()
                        ? "bg-[var(--color-primary-500)] text-white shadow-xs"
                        : "bg-white text-[var(--color-neutral-600)] border border-[var(--color-neutral-300)] shadow-2xs group-hover:border-[var(--color-neutral-400)] group-hover:text-[var(--color-neutral-900)]"
                    }`}
                  >
                    {title.trim() ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      "2"
                    )}
                  </div>
                  <div className="pt-0.5">
                    <span
                      className={`font-header uppercase text-xs transition-colors ${
                        stage === 2 ? "text-[var(--color-primary-600)] font-extrabold" : "text-[var(--color-neutral-700)] font-bold group-hover:text-[var(--color-neutral-900)]"
                      }`}
                    >
                      Thông tin khóa học
                    </span>
                    <p className="font-body text-[11px] text-[var(--color-neutral-500)] mt-0.5 leading-snug">
                      Tên khóa học & mô tả
                    </p>
                  </div>
                </button>
              </div>

              {/* STEP 3 ITEM */}
              <div className="relative flex items-start">
                <button
                  type="button"
                  onClick={() => handleStepClick(3)}
                  className="w-full text-left flex items-start gap-3.5 group cursor-pointer z-10"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] font-bold text-xs transition-all duration-200 ${
                      stage === 3
                        ? "bg-[var(--color-primary-500)] text-white shadow-sm ring-2 ring-[var(--color-primary-200)] scale-105"
                        : classConfigData.name || classConfigData.id
                        ? "bg-[var(--color-primary-500)] text-white shadow-xs"
                        : "bg-white text-[var(--color-neutral-600)] border border-[var(--color-neutral-300)] shadow-2xs group-hover:border-[var(--color-neutral-400)] group-hover:text-[var(--color-neutral-900)]"
                    }`}
                  >
                    {classConfigData.name || classConfigData.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      "3"
                    )}
                  </div>
                  <div className="pt-0.5">
                    <span
                      className={`font-header uppercase text-xs transition-colors ${
                        stage === 3 ? "text-[var(--color-primary-600)] font-extrabold" : "text-[var(--color-neutral-700)] font-bold group-hover:text-[var(--color-neutral-900)]"
                      }`}
                    >
                      Cấu hình phòng học
                    </span>
                    <p className="font-body text-[11px] text-[var(--color-neutral-500)] mt-0.5 leading-snug">
                      Chọn mẫu hoặc tự tạo
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* SIDEBAR FOOTER */}
          <div className="pt-5 border-t border-[var(--color-neutral-200)] flex items-center justify-between">
            <div className="font-body text-[11px] text-[var(--color-neutral-500)] font-medium">
              {isEditMode ? "Chế độ sửa riêng từng phần" : `Tiến độ: Bước ${stage}/3`}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-900)] transition-colors cursor-pointer font-bold"
            >
              <X className="h-4 w-4" />
              <span>Thoát</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: MAIN STEP CONTENT AREA ── */}
        <div className="flex-1 bg-white flex flex-col justify-between overflow-y-auto relative">
          
          {/* CLOSE BUTTON AT TOP RIGHT */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-800)] transition-colors cursor-pointer z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* STEP CONTENT BODY CONTAINER */}
          <div className="p-6 md:p-8 space-y-5">

            {/* ── STAGE 1: CATEGORY SELECTION ── */}
            {stage === 1 && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-[var(--color-neutral-200)] pb-4">
                  <h3 className="font-header font-bold text-xl uppercase tracking-tight text-[var(--color-neutral-900)]">
                    Phân loại danh mục
                  </h3>
                  <p className="font-body text-xs text-[var(--color-neutral-500)] mt-1">
                    Chọn các thẻ môn học, khối lớp để định hình bài giảng chuẩn xác
                  </p>
                </div>

                {/* CATEGORY PINS GROUPS */}
                <div className="space-y-5">
                  {/* MAIN CATEGORY: SUBJECT (Môn học) */}
                  {groupedCategories.has("SUBJECT") && (
                    <div className="space-y-2.5">
                      <label className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-600)] flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-[var(--color-primary-500)]" />
                        <span>Môn học</span>
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {groupedCategories.get("SUBJECT")?.map((cat) => {
                          const isSelected = selectedCategoryMap["SUBJECT"] === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setSelectedCategoryMap((prev) => {
                                  const next = { ...prev };
                                  delete next.OTHER;
                                  if (isSelected) {
                                    delete next["SUBJECT"];
                                  } else {
                                    next["SUBJECT"] = cat.id;
                                  }
                                  return next;
                                });
                              }}
                              className={`px-4 py-2 rounded-[var(--radius-full)] text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer font-body transform active:scale-95 ${
                                isSelected
                                  ? "bg-[var(--color-primary-500)] text-white border border-[var(--color-primary-600)] shadow-sm scale-105"
                                  : "bg-white text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] border border-[var(--color-neutral-200)]"
                              }`}
                            >
                              {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                              <span>{cat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SECONDARY CATEGORIES: 2-COLUMN GRID (Khối lớp & Mục đích) */}
                  {(groupedCategories.has("GRADE") || groupedCategories.has("PURPOSE")) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* KHỐI LỚP (GRADE) */}
                      {groupedCategories.has("GRADE") && (
                        <div className="space-y-2.5">
                          <label className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-600)] flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-[var(--color-primary-500)]" />
                            <span>Khối lớp</span>
                          </label>
                          <div className="flex flex-wrap gap-2.5">
                            {groupedCategories.get("GRADE")?.map((cat) => {
                              const isSelected = selectedCategoryMap["GRADE"] === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCategoryMap((prev) => {
                                      const next = { ...prev };
                                      delete next.OTHER;
                                      if (isSelected) {
                                        delete next["GRADE"];
                                      } else {
                                        next["GRADE"] = cat.id;
                                      }
                                      return next;
                                    });
                                  }}
                                  className={`px-4 py-2 rounded-[var(--radius-full)] text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer font-body transform active:scale-95 ${
                                    isSelected
                                      ? "bg-[var(--color-primary-500)] text-white border border-[var(--color-primary-600)] shadow-sm scale-105"
                                      : "bg-white text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] border border-[var(--color-neutral-200)]"
                                  }`}
                                >
                                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                                  <span>{cat.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* MỤC ĐÍCH (PURPOSE) */}
                      {groupedCategories.has("PURPOSE") && (
                        <div className="space-y-2.5">
                          <label className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-600)] flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-[var(--color-primary-500)]" />
                            <span>Mục đích</span>
                          </label>
                          <div className="flex flex-wrap gap-2.5">
                            {groupedCategories.get("PURPOSE")?.map((cat) => {
                              const isSelected = selectedCategoryMap["PURPOSE"] === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCategoryMap((prev) => {
                                      const next = { ...prev };
                                      delete next.OTHER;
                                      if (isSelected) {
                                        delete next["PURPOSE"];
                                      } else {
                                        next["PURPOSE"] = cat.id;
                                      }
                                      return next;
                                    });
                                  }}
                                  className={`px-4 py-2 rounded-[var(--radius-full)] text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer font-body transform active:scale-95 ${
                                    isSelected
                                      ? "bg-[var(--color-primary-500)] text-white border border-[var(--color-primary-600)] shadow-sm scale-105"
                                      : "bg-white text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] border border-[var(--color-neutral-200)]"
                                  }`}
                                >
                                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                                  <span>{cat.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* KHÁC (OTHER) */}
                  {groupedCategories.has("OTHER") && (
                    <div className="space-y-2.5">
                      <label className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-600)] flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-[var(--color-primary-500)]" />
                        <span>Khác</span>
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {groupedCategories.get("OTHER")?.map((cat) => {
                          const isSelected = selectedCategoryMap["OTHER"] === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setSelectedCategoryMap(isSelected ? {} : { OTHER: cat.id });
                              }}
                              className={`px-4 py-2 rounded-[var(--radius-full)] text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer font-body transform active:scale-95 ${
                                isSelected
                                  ? "bg-[var(--color-primary-500)] text-white border border-[var(--color-primary-600)] shadow-sm scale-105"
                                  : "bg-white text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] border border-[var(--color-neutral-200)]"
                              }`}
                            >
                              {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                              <span>{cat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STAGE 2: COURSE DETAILS ── */}
            {stage === 2 && (
              <div className="space-y-6 animate-in fade-in duration-150 font-body">
                <div className="border-b border-[var(--color-neutral-200)] pb-4">
                  <h3 className="font-header font-bold text-xl uppercase tracking-tight text-[var(--color-neutral-900)]">
                    Thông tin khóa học
                  </h3>
                  <p className="font-body text-xs text-[var(--color-neutral-500)] mt-1">
                    Nhập tên khóa học và mô tả tổng quan
                  </p>
                </div>

                {/* SELECTED CATEGORY PINS SUMMARY */}
                {selectedCategories.length > 0 && (
                  <div className="flex items-center justify-between rounded-[var(--radius-lg)] bg-[var(--color-neutral-100)] border border-[var(--color-neutral-200)] p-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[var(--color-neutral-500)] font-mono">Danh mục:</span>
                      {selectedCategories.map((cat) => (
                        <span
                          key={cat.id}
                          className="px-3 py-1 rounded-[var(--radius-full)] text-xs font-bold bg-[var(--color-primary-50)] text-[var(--color-primary-700)] border border-[var(--color-primary-200)] flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-primary-600)]" />
                          <span>{cat.name}</span>
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setStage(1)}
                      className="text-xs font-bold text-[var(--color-primary-600)] hover:underline shrink-0 cursor-pointer ml-2"
                    >
                      Sửa danh mục
                    </button>
                  </div>
                )}

                {errorMessage && (
                  <div className="rounded-[var(--radius-md)] border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-600 flex items-center justify-between">
                    <span>{errorMessage}</span>
                    <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs font-bold font-mono text-[var(--color-neutral-700)] uppercase tracking-wider">
                    Tên khóa học / Môn học <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="VD: Toán 10 - Đại số & Giải tích"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    required
                    autoFocus
                    className="h-10 border-[var(--color-neutral-200)] bg-white text-xs font-semibold text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] rounded-[var(--radius-sm)]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold font-mono text-[var(--color-neutral-700)] uppercase tracking-wider">
                    Mô tả ngắn
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Nhập thông tin tổng quan về môn học, mục tiêu giảng dạy..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-[var(--radius-sm)] border border-[var(--color-neutral-200)] bg-white p-3 text-xs font-medium text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-primary-500)] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* ── STAGE 3: CLASS CONFIG (REUSABLE CLASSCONFIG EDITOR) ── */}
            {stage === 3 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {errorMessage && (
                  <div className="rounded-[var(--radius-md)] border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-600 flex items-center justify-between mb-2">
                    <span>{errorMessage}</span>
                    <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <ClassConfigEditor
                  value={classConfigData}
                  onChange={(newVal) => setClassConfigData(newVal)}
                  title="Cấu hình phòng học"
                  subtitle="Chọn mẫu cấu hình sẵn để điền nhanh hoặc tự điều chỉnh các thông số bên dưới"
                  showHeadings={true}
                />
              </div>
            )}
          </div>

          {/* BOTTOM ACTION NAVIGATION BAR */}
          <div className="border-t border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-6 md:px-10 py-4 flex items-center justify-between gap-3 font-body">
            {stage === 1 && (
              <>
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="border-[var(--color-neutral-200)] text-xs font-bold text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] rounded-[var(--radius-md)] cursor-pointer"
                >
                  Hủy
                </Button>
                <div className="flex items-center gap-2">
                  {isEditMode && (
                    <Button
                      type="button"
                      onClick={() => handleSubmit()}
                      disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
                      className="gap-2 bg-[var(--color-tertiary-500)] hover:bg-[var(--color-tertiary-600)] px-5 text-xs font-bold text-white shadow-md rounded-[var(--radius-md)] cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>Lưu thay đổi</span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => setStage(2)}
                    className="gap-2 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] px-6 text-xs font-bold text-white shadow-md rounded-[var(--radius-md)] cursor-pointer"
                  >
                    <span>Sang Bước 2: Thông tin khóa học</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {stage === 2 && (
              <>
                <Button
                  type="button"
                  onClick={() => setStage(1)}
                  variant="outline"
                  className="gap-2 border-[var(--color-neutral-200)] text-xs font-bold text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] rounded-[var(--radius-md)] cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Quay lại Bước 1</span>
                </Button>
                <div className="flex items-center gap-2">
                  {isEditMode && (
                    <Button
                      type="button"
                      onClick={() => handleSubmit()}
                      disabled={!title.trim() || createCourseMutation.isPending || updateCourseMutation.isPending}
                      className="gap-2 bg-[var(--color-tertiary-500)] hover:bg-[var(--color-tertiary-600)] px-5 text-xs font-bold text-white shadow-md rounded-[var(--radius-md)] cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>Lưu thay đổi</span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => {
                      if (!title.trim()) {
                        setErrorMessage("Vui lòng nhập tên khóa học.");
                        return;
                      }
                      setErrorMessage(null);
                      setStage(3);
                    }}
                    className="gap-2 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] px-6 text-xs font-bold text-white shadow-md rounded-[var(--radius-md)] cursor-pointer"
                  >
                    <span>Sang Bước 3: Cấu hình phòng</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {stage === 3 && (
              <>
                <Button
                  type="button"
                  onClick={() => setStage(2)}
                  variant="outline"
                  className="gap-2 border-[var(--color-neutral-200)] text-xs font-bold text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] rounded-[var(--radius-md)] cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Quay lại Bước 2</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={!title.trim() || createCourseMutation.isPending || updateCourseMutation.isPending}
                  className="gap-2 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] px-7 text-xs font-bold text-white shadow-md rounded-[var(--radius-md)] cursor-pointer"
                >
                  {createCourseMutation.isPending || updateCourseMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isEditMode ? "Đang lưu thay đổi..." : "Đang tạo khóa học..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>{isEditMode ? "Lưu thay đổi khóa học" : "Hoàn tất & Tạo khóa học"}</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
