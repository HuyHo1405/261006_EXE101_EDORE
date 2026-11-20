"use client";

import { useState } from "react";
import { ArrowRight, Quote } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";
import {
  TEACHER_FEEDBACK_ALL_LIST,
  TEACHER_FEEDBACK_LIST,
  getTeacherInitials,
} from "./teacherFeedbackData";
import { TeacherFeedbackModal } from "./TeacherFeedbackModal";

export function TeacherFeedbackSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    TEACHER_FEEDBACK_LIST[0]?.id ?? TEACHER_FEEDBACK_ALL_LIST[0]?.id ?? ""
  );

  const openTeacherModal = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setModalOpen(true);
  };

  return (
    <section
      id="feedback"
      className="space-y-8 pt-4 scroll-mt-20 md:scroll-mt-24"
    >
      {/* ── Tiêu đề Section ngắn gọn ──────────────────────────────── */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="font-header font-bold text-3xl md:text-5xl uppercase tracking-tight text-slate-900 dark:text-slate-100">
          Phản hồi từ Giáo viên
        </h2>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 font-body">
          Chia sẻ thực tế từ thầy cô khi ứng dụng Edore vào chuẩn bị bài giảng và
          tổ chức lớp học.
        </p>
      </div>

      {/* ── Lưới 3 thẻ Quote tối giản ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {TEACHER_FEEDBACK_LIST.map((item) => (
          <AnimateOnScroll key={item.id} className="h-full">
            <article
              onClick={() => openTeacherModal(item.id)}
              className="group h-full bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-[var(--color-primary-300)] dark:hover:border-[var(--color-primary-500)] rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between gap-6 cursor-pointer"
            >
              <div className="space-y-3">
                <Quote
                  className="w-6 h-6 text-[var(--color-primary-300)] dark:text-blue-700"
                  aria-hidden="true"
                />
                <p className="text-sm md:text-base text-slate-700 dark:text-slate-200 leading-relaxed italic font-body">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-[var(--color-neutral-200)] dark:border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-[var(--radius-full)] bg-[var(--color-primary-500)] text-white font-header font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                    {getTeacherInitials(item.teacherName)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {item.teacherName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {item.gradeLevel} · Môn {item.subject}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openTeacherModal(item.id);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary-600)] dark:text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0 rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-300)] cursor-pointer"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </article>
          </AnimateOnScroll>
        ))}
      </div>

      <TeacherFeedbackModal
        isOpen={modalOpen}
        selectedTeacherId={selectedTeacherId}
        items={TEACHER_FEEDBACK_ALL_LIST}
        onSelectTeacher={setSelectedTeacherId}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
