"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Quote,
  X,
} from "lucide-react";
import {
  TeacherFeedbackItem,
  getTeacherInitials,
} from "./teacherFeedbackData";

const emptySubscribe = () => () => {};

interface TeacherFeedbackModalProps {
  isOpen: boolean;
  selectedTeacherId: string;
  items: TeacherFeedbackItem[];
  onSelectTeacher: (teacherId: string) => void;
  onClose: () => void;
}

/**
 * Modal chi tiết phản hồi giáo viên — tinh gọn, ưu tiên lời đánh giá lên đầu.
 * Render qua createPortal ra document.body theo quy chuẩn Design System.
 */
export function TeacherFeedbackModal({
  isOpen,
  selectedTeacherId,
  items,
  onSelectTeacher,
  onClose,
}: TeacherFeedbackModalProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || items.length === 0) return null;

  const currentIndex = Math.max(
    0,
    items.findIndex((item) => item.id === selectedTeacherId)
  );
  const selectedTeacher = items[currentIndex] ?? items[0];

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    onSelectTeacher(items[prevIndex].id);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % items.length;
    onSelectTeacher(items[nextIndex].id);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-teacher-name"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 border border-[var(--color-neutral-300)] dark:border-slate-800 rounded-[var(--radius-xl)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 font-body"
      >
        {/* ── Header: Thông tin giáo viên + nút Đóng ─────────────────── */}
        <div className="px-5 py-4 border-b border-[var(--color-neutral-200)] dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-[var(--radius-full)] bg-[var(--color-primary-500)] text-white font-header font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
              {getTeacherInitials(selectedTeacher.teacherName)}
            </div>
            <div className="min-w-0">
              <h2
                id="feedback-modal-teacher-name"
                className="font-bold text-base text-slate-900 dark:text-slate-100 truncate"
              >
                {selectedTeacher.teacherName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {selectedTeacher.gradeLevel} · Môn {selectedTeacher.subject}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại phản hồi"
            className="w-8 h-8 rounded-[var(--radius-md)] border border-[var(--color-neutral-300)] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[var(--color-neutral-100)] dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-300)] flex items-center justify-center shrink-0 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Nội dung: Lời đánh giá trước -> Điểm nhấn & Góp ý ─────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Phần 1: Lời đánh giá (đặt ngay đầu tiên) */}
          <div className="bg-[var(--color-primary-50)]/70 dark:bg-blue-950/30 border border-[var(--color-primary-200)] dark:border-blue-900/60 rounded-[var(--radius-lg)] p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--color-primary-600)] dark:text-blue-400">
              <Quote className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Lời đánh giá</span>
            </div>
            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed italic">
              &ldquo;{selectedTeacher.quote}&rdquo;
            </p>
          </div>

          {/* Phần 2: Điểm nhấn & Góp ý thực tế */}
          <div className="space-y-4">
            {/* 1 hàng 3 badge tóm tắt nhanh */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--radius-xs)] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                Tiết kiệm {selectedTeacher.timeSaved} thời gian
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--radius-xs)] bg-[var(--color-neutral-100)] dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-[var(--color-neutral-300)] dark:border-slate-700 text-xs font-semibold">
                Chỉnh sửa {selectedTeacher.editRatio}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--radius-xs)] bg-[var(--color-primary-50)] dark:bg-blue-950/60 text-[var(--color-primary-600)] dark:text-blue-300 border border-[var(--color-primary-200)] dark:border-blue-800 text-xs font-semibold">
                Sẵn lòng giới thiệu: {selectedTeacher.nps}/10
              </span>
            </div>

            {/* Phần tâm đắc nhất */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Phần tâm đắc nhất
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedTeacher.usefulFeatures.map((feat) => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-xs)] bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-[var(--color-neutral-300)] dark:border-slate-700 text-xs font-medium"
                  >
                    <CheckCircle2
                      className="w-3 h-3 text-[var(--color-tertiary-500)] shrink-0"
                      aria-hidden="true"
                    />
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Góp ý cải thiện thực tế */}
            <div className="bg-[var(--color-neutral-50)] dark:bg-slate-950/60 border border-[var(--color-neutral-200)] dark:border-slate-800 rounded-[var(--radius-lg)] p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Lightbulb className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Góp ý cải thiện thực tế</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedTeacher.details.priorityProposal}
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer: Chuyển nhanh giữa các giáo viên + Đóng ─────────── */}
        <div className="px-5 py-3.5 border-t border-[var(--color-neutral-200)] dark:border-slate-800 bg-[var(--color-neutral-50)] dark:bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Phản hồi giáo viên trước"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-neutral-300)] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-[var(--color-neutral-100)] dark:hover:bg-slate-700 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-300)] transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Trước</span>
            </button>

            <span className="font-mono text-xs text-slate-500 dark:text-slate-400 px-1">
              {currentIndex + 1}/{items.length}
            </span>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Phản hồi giáo viên tiếp theo"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-neutral-300)] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-[var(--color-neutral-100)] dark:hover:bg-slate-700 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-300)] transition-all cursor-pointer"
            >
              <span>Tiếp</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-300)] transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
