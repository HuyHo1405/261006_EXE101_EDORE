"use client";

import React, { useState, useEffect } from "react";
import {
  School,
  BrainCircuit,
  Check,
  ArrowLeft,
  ArrowRight,
  FileText,
  Layers,
  Target,
  X,
  BookOpen,
  Bookmark,
} from "lucide-react";
import type { LessonSummaryDTO } from "@edore/types";
import type { ClassroomCtx } from "@/features/playground/components/ClassroomConfigModal";

const templateOptions = [
  {
    value: "1",
    label: "Khung 3 phần",
    description: "Khởi động → Hình thành kiến thức → Luyện tập/Vận dụng",
    tags: ["Phổ biến", "45 phút"],
    Icon: School,
  },
  {
    value: "2",
    label: "Khung 4 phần",
    description: "Khởi động → Hình thành kiến thức → Luyện tập → Vận dụng",
    tags: ["Chuyên sâu", "90 phút+"],
    Icon: BrainCircuit,
  },
];

interface LessonStartModalProps {
  lesson: LessonSummaryDTO;
  ctx: ClassroomCtx;
  onConfirm: (config: {
    templateId: string;
    scriptTitle: string;
    learningOutcome: string;
    updatedCtx: ClassroomCtx;
  }) => void;
  onCancel: () => void;
}

export function LessonStartModal({
  lesson,
  ctx,
  onConfirm,
  onCancel,
}: LessonStartModalProps) {
  const initialTemplateId =
    ctx.template_id === "extended-4-node" || ctx.template_id === "2" ? "2" : "1";

  const displayTitle = React.useMemo(() => {
    const raw = lesson.title || "Bài học";
    if (/^bài\s*\d+/i.test(raw)) {
      return raw;
    }
    if (lesson.orderInChapter) {
      return `Bài ${lesson.orderInChapter}: ${raw}`;
    }
    return raw;
  }, [lesson.title, lesson.orderInChapter]);

  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [learningOutcome, setLearningOutcome] = useState(ctx.learning_outcome || "");
  const [scriptTitle, setScriptTitle] = useState(displayTitle);

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  const handleConfirm = () => {
    let dur = ctx.duration || 45;
    if (templateId === "2" && (dur === 45 || dur === "45")) dur = 90;
    else if (templateId === "1" && (dur === 90 || dur === "90")) dur = 45;

    const updatedCtx: ClassroomCtx = {
      ...ctx,
      template_id: templateId === "2" ? "extended-4-node" : "standard-3-node",
      learning_outcome: learningOutcome,
      duration: dur,
      scriptTitle,
    };

    onConfirm({
      templateId,
      scriptTitle,
      learningOutcome,
      updatedCtx,
    });
  };

  const gradeLabel = lesson.gradeCode ? `Lớp ${lesson.gradeCode}` : "Lớp 8";
  const textbookLabel =
    lesson.textbookCode === "KNTT"
      ? "Kết nối tri thức"
      : lesson.textbookCode === "CTST"
      ? "Chân trời sáng tạo"
      : lesson.textbookCode === "CD"
      ? "Cánh diều"
      : lesson.textbookCode || "SGK";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-6 md:p-8 animate-in fade-in duration-200 font-body">
      <div className="relative w-full max-w-5xl h-full max-h-[92vh] rounded-[var(--radius-xl)] border border-[var(--color-neutral-200)] bg-white shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* ── LEFT COLUMN: LESSON INFO SIDEBAR ── */}
        <div className="w-full md:w-72 bg-[var(--color-neutral-100)] text-[var(--color-neutral-900)] p-5 md:p-6 flex flex-col justify-between shrink-0 border-b md:border-b-0 md:border-r border-[var(--color-neutral-200)]">
          <div>
            <div className="mb-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-neutral-500)] font-bold">
                Tạo kịch bản mới
              </span>
              <h2 className="text-base font-bold font-header uppercase tracking-tight text-[var(--color-neutral-900)] mt-0.5">
                Bài học đã chọn
              </h2>
            </div>

            <p className="font-body text-[11px] text-[var(--color-neutral-500)] mt-0.5 leading-relaxed font-medium">
              AI sẽ sử dụng toàn bộ nội dung giáo khoa và hệ thống tư liệu hình ảnh nội bộ của bài học này để sinh kịch bản.
            </p>

            {/* Lesson summary card */}
            <div className="mt-5 bg-white p-4 rounded-[var(--radius-md)] border border-[var(--color-neutral-200)] shadow-xs flex flex-col gap-3">
              <div className="flex flex-wrap gap-1">
                <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border border-[var(--color-primary-200)]">
                  {gradeLabel}
                </span>
                <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {textbookLabel}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-[var(--color-primary-500)] text-white shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold font-header uppercase tracking-tight text-slate-900 leading-snug">
                    {displayTitle}
                  </h4>
                  {lesson.chapterTitle && (
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 line-clamp-2">
                      <Bookmark className="w-3 h-3 shrink-0 text-slate-400" />
                      <span>{lesson.chapterTitle}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Mã: {lesson.code}</span>
                <span>Bài {lesson.orderInChapter || 1}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="w-full mt-6 md:mt-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-[var(--radius-md)] text-xs font-bold text-[var(--color-neutral-600)] transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Chọn bài học khác
          </button>
        </div>

        {/* ── RIGHT COLUMN: CONFIGURATION ── */}
        <div className="flex-1 bg-white flex flex-col justify-between overflow-y-auto relative">
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-800)] transition-colors cursor-pointer z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-5 md:p-6 flex flex-col gap-4">
            <div className="border-b border-[var(--color-neutral-100)] pb-3">
              <h3 className="font-header font-extrabold text-lg uppercase tracking-tight text-[var(--color-neutral-900)]">
                Thiết lập kịch bản giảng dạy
              </h3>
            </div>

            <div className="bg-[var(--color-neutral-100)] rounded-[var(--radius-xl)] p-4 md:p-5 border border-[var(--color-neutral-200)] space-y-5 shadow-sm">
              {/* Tên kịch bản & Mục tiêu */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-[11px] font-bold text-[var(--color-neutral-500)] uppercase tracking-widest">
                  Thông tin cơ bản <span className="text-[var(--color-secondary-500)]">*</span>
                </label>

                <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral-200)] bg-white shadow-sm focus-within:border-[var(--color-primary-400)] focus-within:ring-4 focus-within:ring-[var(--color-primary-50)] transition-all overflow-hidden group">
                  {/* Tên kịch bản */}
                  <div className="flex items-center px-4 border-b border-[var(--color-neutral-200)] bg-white group-focus-within:bg-white transition-colors">
                    <FileText className="w-4 h-4 text-[var(--color-neutral-400)] shrink-0" />
                    <input
                      type="text"
                      placeholder="Tên kịch bản"
                      value={scriptTitle}
                      onChange={(e) => setScriptTitle(e.target.value)}
                      className="w-full h-11 bg-transparent px-3 text-sm font-bold text-[var(--color-neutral-800)] outline-none placeholder:text-[var(--color-neutral-400)] placeholder:font-medium"
                    />
                  </div>

                  {/* Mục tiêu sư phạm */}
                  <div className="flex items-start px-4 py-3 bg-white group-focus-within:bg-white transition-colors">
                    <Target className="w-4 h-4 text-[var(--color-neutral-400)] shrink-0 mt-0.5" />
                    <textarea
                      value={learningOutcome}
                      onChange={(e) => setLearningOutcome(e.target.value)}
                      placeholder="Ghi chú mục tiêu bài giảng bổ sung cho AI (nếu để trống, AI sẽ dùng mục tiêu chuẩn từ sách giáo khoa)..."
                      className="w-full h-16 bg-transparent px-3 text-xs font-medium text-[var(--color-neutral-700)] outline-none resize-none leading-relaxed placeholder:text-[var(--color-neutral-400)] placeholder:font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Khung bài học */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-[11px] font-bold text-[var(--color-neutral-500)] uppercase tracking-widest">
                  <div className="p-1 rounded bg-[var(--color-neutral-200)] text-[var(--color-neutral-600)]">
                    <Layers className="w-3 h-3" />
                  </div>
                  Khung bài học (Template)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templateOptions.map((opt) => {
                    const Icon = opt.Icon;
                    const isSelected = templateId === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTemplateId(opt.value)}
                        className={`relative w-full p-3.5 rounded-[var(--radius-lg)] border transition-all flex flex-col items-center text-center gap-2 cursor-pointer
                          ${
                            isSelected
                              ? "border-[var(--color-primary-300)] bg-[var(--color-primary-50)] shadow-md ring-4 ring-[var(--color-primary-50)]"
                              : "border-[var(--color-neutral-200)] bg-white hover:border-[var(--color-neutral-300)] hover:bg-[var(--color-neutral-50)]"
                          }`}
                      >
                        <div
                          className={`absolute top-3 right-3 w-4 h-4 rounded-[var(--radius-full)] border-2 flex items-center justify-center shrink-0 transition-all
                            ${
                              isSelected
                                ? "border-[var(--color-primary-500)] bg-[var(--color-primary-500)]"
                                : "border-[var(--color-neutral-300)]"
                            }`}
                        >
                          {isSelected && (
                            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                          )}
                        </div>

                        <div
                          className={`p-2.5 rounded-[var(--radius-full)] transition-colors ${
                            isSelected
                              ? "bg-[var(--color-primary-100)] text-[var(--color-primary-600)]"
                              : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <div>
                          <p
                            className={`font-header text-xs uppercase tracking-tight font-extrabold ${
                              isSelected
                                ? "text-[var(--color-primary-700)]"
                                : "text-[var(--color-neutral-800)]"
                            }`}
                          >
                            {opt.label}
                          </p>
                          <p className="text-[10px] text-[var(--color-neutral-500)] mt-0.5 font-medium leading-tight">
                            {opt.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── FOOTER ACTIONS ── */}
          <div className="border-t border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] px-6 md:px-8 py-5 flex items-center justify-end gap-3">
            <button
              onClick={handleConfirm}
              disabled={!scriptTitle.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary-500)] text-white rounded-[var(--radius-md)] text-xs font-bold hover:bg-[var(--color-primary-600)] transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Phân tích & Xây dựng kịch bản
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
