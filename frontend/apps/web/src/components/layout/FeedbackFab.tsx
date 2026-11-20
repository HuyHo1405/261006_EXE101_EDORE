"use client";

import { MessageSquarePlus } from "lucide-react";

export const FEEDBACK_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScMUgEI2gQMmfgT3CoNCu__kf6o-SdapYA7Xq2c7G9i551F6Q/viewform?usp=dialog";

/**
 * Nút Floating Action Button (FAB) cố định góc dưới bên phải màn hình,
 * mở biểu mẫu Google Form để giáo viên gửi góp ý & phản hồi cho Edore.
 */
export function FeedbackFab() {
  return (
    <a
      href={FEEDBACK_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="Gửi góp ý & phản hồi cho Edore"
      aria-label="Gửi góp ý & phản hồi cho Edore"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 h-11 px-4 rounded-[var(--radius-full)] bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-[#fafafa] border-2 border-white dark:border-slate-200 font-body text-sm font-bold shadow-[0_8px_24px_rgba(1,22,78,0.45)] hover:shadow-[0_12px_28px_rgba(1,22,78,0.55)] hover:-translate-y-0.5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-300)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 transition-all duration-200 select-none"
    >
      <MessageSquarePlus className="w-5 h-5 shrink-0" aria-hidden="true" />
      <span>Feedback</span>
    </a>
  );
}
