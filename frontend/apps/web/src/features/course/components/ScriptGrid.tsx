"use client";

import React from "react";
import { FileCode, Plus } from "lucide-react";
import type { ScriptResponseDTO } from "@edore/types";
import { createScriptCardViewModel } from "../viewmodels/courseViewModel";
import { ScriptCard } from "./ScriptCard";
import { Button } from "@/components/ui/button";

interface ScriptGridProps {
  scripts: ScriptResponseDTO[];
  isLoading: boolean;
  onDeleteScript: (id: string) => void;
  onRenameScript?: (id: string, newTitle: string) => void;
  onCreateScript: () => void;
  isCreatingScript?: boolean;
  courseId?: string;
  displayColor?: string;
}

export function ScriptGrid({
  scripts,
  isLoading,
  onDeleteScript,
  onRenameScript,
  onCreateScript,
  isCreatingScript = false,
  courseId,
  displayColor,
}: ScriptGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 min-h-[440px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[210px] rounded-2xl border border-slate-200/80 bg-white p-6 animate-pulse flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-6 w-3/4 rounded bg-slate-200" />
            </div>
            <div className="h-3 w-1/3 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (scripts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--color-neutral-300)] bg-white/70 py-12 text-center min-h-[440px]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-xs">
          <FileCode className="h-8 w-8" />
        </div>
        <h3 className="mt-4 font-header font-bold text-2xl uppercase tracking-tight text-slate-900">
          Chưa có kịch bản nào
        </h3>
        <p className="mt-1 max-w-sm text-xs font-body text-slate-600 leading-relaxed">
          Khóa học này chưa có kịch bản bài giảng. Hãy tạo kịch bản mới để bắt đầu soạn bài bằng AI.
        </p>
        <Button
          onClick={onCreateScript}
          disabled={isCreatingScript}
          className="mt-6 gap-2 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-xs font-bold text-white shadow-md rounded-xl px-5 py-2.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo kịch bản mới</span>
        </Button>
      </div>
    );
  }

  const viewModels = scripts.map(createScriptCardViewModel);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 min-h-[440px] content-start">
      {viewModels.map((script) => (
        <ScriptCard
          key={script.id}
          script={script}
          onDelete={onDeleteScript}
          onRename={onRenameScript}
          courseId={courseId}
          displayColor={displayColor}
        />
      ))}
    </div>
  );
}
