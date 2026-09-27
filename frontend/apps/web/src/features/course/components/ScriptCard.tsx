"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FileText, MoreVertical, Trash2, Clock, Pencil, Check, X } from "lucide-react";
import type { ScriptCardViewModel } from "@edore/types";
import { useRouter } from "next/navigation";

interface ScriptCardProps {
  script: ScriptCardViewModel;
  onDelete: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  courseId?: string;
  displayColor?: string;
}

export function ScriptCard({ script, onDelete, onRename, courseId, displayColor }: ScriptCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(script.title);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleOpenEditor = () => {
    if (isEditing) return;
    const queryStr = courseId ? `?courseId=${courseId}` : "";
    router.push(`/dashboard/scripts/${script.id}${queryStr}`);
  };

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setEditTitle(script.title);
    setIsEditing(true);
  };

  const handleSaveRename = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== script.title && onRename) {
      onRename(script.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setEditTitle(script.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveRename();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelRename();
    }
  };

  const accentColor = displayColor || "#034ce4";

  return (
    <div
      onClick={handleOpenEditor}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between rounded-2xl bg-white p-5 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer h-full min-h-[200px]"
      style={{
        borderTop: `4px solid ${accentColor}`,
        borderRight: `1.5px solid ${isHovered ? accentColor : `${accentColor}35`}`,
        borderBottom: `1.5px solid ${isHovered ? accentColor : `${accentColor}35`}`,
        borderLeft: `1.5px solid ${isHovered ? accentColor : `${accentColor}35`}`,
        boxShadow: isHovered
          ? `0 20px 25px -5px ${accentColor}25, 0 8px 10px -6px ${accentColor}15`
          : `0 2px 8px ${accentColor}08`,
      }}
    >
      <div className="flex flex-col flex-1 justify-between space-y-4">
        {/* Main Content: Paper Icon + Title */}
        <div className="flex items-start gap-3 pt-1">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-xs transition-transform duration-200 group-hover:scale-110 mt-0.5"
            style={{
              backgroundColor: accentColor,
              boxShadow: isHovered ? `0 4px 12px ${accentColor}50` : "none",
            }}
          >
            <FileText className="h-4.5 w-4.5" />
          </div>

          <h3
            className="line-clamp-2 font-header font-bold text-base uppercase tracking-tight transition-colors duration-200 leading-snug flex-1"
            style={{ color: isHovered ? accentColor : "#0f172a" }}
          >
            {script.title || "Kịch bản bài giảng"}
          </h3>
        </div>

        {/* Footer Info: Clock + Updated Time on Left, Action Menu on Right */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs shrink-0">
          {/* Left: Clock Icon + Updated Time */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{script.updatedText}</span>
          </div>

          {/* Right: Context Menu (Three dots) */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800"
              title="Tùy chọn"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20 cursor-default"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 bottom-8 z-30 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl space-y-0.5 font-sans">
                  {onRename && (
                    <button
                      type="button"
                      onClick={handleStartRename}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Đổi tên</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete(script.id);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Xóa kịch bản</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Form Popup Modal for Renaming Script (Portal to Body) ── */}
      {isEditing && mounted && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200 font-body cursor-default"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div
            className="w-full max-w-md bg-white rounded-[var(--radius-xl)] border border-[var(--color-neutral-200)] shadow-2xl p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-neutral-200)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[var(--radius-lg)] bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-neutral-400)] block tracking-wider">
                    Cập nhật kịch bản
                  </span>
                  <h3 className="font-header font-extrabold text-base uppercase tracking-tight text-[var(--color-neutral-900)]">
                    Đổi tên kịch bản
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelRename}
                className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-800)] transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Form Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--color-neutral-600)] uppercase tracking-wider block">
                Tên kịch bản mới <span className="text-[var(--color-secondary-500)]">*</span>
              </label>
              <div className="relative flex items-center">
                <FileText className="w-4 h-4 absolute left-3.5 text-[var(--color-neutral-400)]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tên kịch bản bài giảng..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-neutral-300)] focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--color-primary-50)] outline-none text-sm font-bold text-[var(--color-neutral-900)] transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-neutral-100)]">
              <button
                type="button"
                onClick={handleCancelRename}
                className="px-4 py-2 rounded-[var(--radius-md)] text-xs font-bold text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)] transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveRename}
                disabled={!editTitle.trim() || editTitle.trim() === script.title}
                className="flex items-center gap-1.5 px-5 py-2 rounded-[var(--radius-md)] text-xs font-bold bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Cập nhật
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
