"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Sparkles, Loader2, ChevronDown, Layers, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/fetcher";
import type { PageResponseDTO } from "@edore/types";

export interface ClassConfigSummary {
  id: string | number;
  name: string;
  duration?: string;
  classSize?: string;
  space?: string;
  seatingLayout?: string;
}

export interface ClassConfigData {
  id?: string;
  name?: string;
  duration?: string;
  classSize?: string;
  space?: string;
  seatingLayout?: string;
}

interface ClassConfigEditorProps {
  value: ClassConfigData;
  onChange: (value: ClassConfigData) => void;
  title?: string;
  subtitle?: string;
  showHeadings?: boolean;
}

export function ClassConfigEditor({
  value,
  onChange,
  title = "Cấu hình phòng học",
  subtitle = "Chọn mẫu cấu hình sẵn để điền nhanh hoặc tự điều chỉnh các thông số bên dưới",
  showHeadings = true,
}: ClassConfigEditorProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(value.id || "");
  const [configSearchQuery, setConfigSearchQuery] = useState("");
  const [isConfigDropdownOpen, setIsConfigDropdownOpen] = useState(false);
  const configDropdownRef = useRef<HTMLDivElement>(null);

  const [classConfigs, setClassConfigs] = useState<ClassConfigSummary[]>([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);

  // Local copy of custom fields
  const customName = value.name || "";
  const customDuration = value.duration || "MIN_45";
  const customClassSize = value.classSize || "MEDIUM";
  const customSpace = value.space || "STANDARD";
  const customSeatingLayout = value.seatingLayout || "ROWS";

  // Filtered preset list
  const filteredConfigs = useMemo(() => {
    if (!configSearchQuery.trim()) return classConfigs;
    const q = configSearchQuery.toLowerCase().trim();
    return classConfigs.filter((cfg) => cfg.name.toLowerCase().includes(q));
  }, [classConfigs, configSearchQuery]);

  // Click outside listener for preset dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (configDropdownRef.current && !configDropdownRef.current.contains(event.target as Node)) {
        setIsConfigDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch presets on mount
  useEffect(() => {
    setIsLoadingConfigs(true);
    apiClient<PageResponseDTO<ClassConfigSummary>>("/api/class-configs?pageSize=50")
      .then((res) => {
        if (res.result?.content) {
          setClassConfigs(res.result.content);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingConfigs(false));
  }, []);

  // Update selected preset search query if value.id matches a preset
  useEffect(() => {
    if (value.id) {
      setSelectedPresetId(value.id);
      const found = classConfigs.find((c) => String(c.id) === String(value.id));
      if (found) setConfigSearchQuery(found.name);
    }
  }, [value.id, classConfigs]);

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    setIsConfigDropdownOpen(false);

    if (!presetId) {
      setConfigSearchQuery("");
      onChange({
        ...value,
        id: "",
      });
      return;
    }

    const found = classConfigs.find((c) => String(c.id) === String(presetId));
    if (found) {
      setConfigSearchQuery(found.name);
      onChange({
        id: String(found.id),
        name: found.name || customName,
        duration: found.duration || customDuration,
        classSize: found.classSize || customClassSize,
        space: found.space || customSpace,
        seatingLayout: found.seatingLayout || customSeatingLayout,
      });
    }
  };

  const updateField = (updates: Partial<ClassConfigData>) => {
    const nextName = updates.name !== undefined ? updates.name : customName;
    const nextDuration = updates.duration !== undefined ? updates.duration : customDuration;
    const nextClassSize = updates.classSize !== undefined ? updates.classSize : customClassSize;
    const nextSpace = updates.space !== undefined ? updates.space : customSpace;
    const nextSeatingLayout = updates.seatingLayout !== undefined ? updates.seatingLayout : customSeatingLayout;

    // Smart Preset Matching
    const matched = classConfigs.find((cfg) => {
      const matchName = !cfg.name || cfg.name.trim().toLowerCase() === nextName.trim().toLowerCase();
      const matchDuration = !cfg.duration || cfg.duration === nextDuration;
      const matchSize = !cfg.classSize || cfg.classSize === nextClassSize;
      const matchSpace = !cfg.space || cfg.space === nextSpace;
      const matchLayout = !cfg.seatingLayout || cfg.seatingLayout === nextSeatingLayout;
      return matchName && matchDuration && matchSize && matchSpace && matchLayout;
    });

    const newId = matched ? String(matched.id) : "";
    setSelectedPresetId(newId);
    if (matched) {
      setConfigSearchQuery(matched.name);
    } else if (updates.name !== undefined && !matched) {
      setConfigSearchQuery("");
    }

    onChange({
      id: newId,
      name: nextName,
      duration: nextDuration,
      classSize: nextClassSize,
      space: nextSpace,
      seatingLayout: nextSeatingLayout,
    });
  };

  return (
    <div className="space-y-4 font-sans">
      {showHeadings && (
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-header font-bold text-lg uppercase tracking-tight text-slate-900">
            {title}
          </h3>
          <p className="text-xs font-body text-slate-500 mt-0.5">
            {subtitle}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-1">
        {/* ── LEFT COLUMN: PRESET SELECTOR & AUTO-FILL BANNER ── */}
        <div className="md:col-span-4 space-y-4 pr-0 md:pr-5 md:border-r border-slate-100">
          <div className="space-y-1.5 relative" ref={configDropdownRef}>
            <label className="block text-xs font-bold text-slate-700">
              Mẫu có sẵn
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 z-10">
                <Layers className="h-4 w-4" />
              </div>

              <input
                type="text"
                placeholder="Chọn mẫu phòng..."
                value={
                  isConfigDropdownOpen
                    ? configSearchQuery
                    : selectedPresetId
                    ? classConfigs.find((c) => String(c.id) === String(selectedPresetId))?.name || configSearchQuery
                    : configSearchQuery
                }
                onFocus={() => setIsConfigDropdownOpen(true)}
                onChange={(e) => {
                  setConfigSearchQuery(e.target.value);
                  if (!isConfigDropdownOpen) setIsConfigDropdownOpen(true);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-14 h-10 text-xs font-medium text-slate-900 focus:border-slate-400 focus:outline-none shadow-xs truncate"
              />

              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                {(configSearchQuery || selectedPresetId) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPresetId("");
                      setConfigSearchQuery("");
                      setIsConfigDropdownOpen(false);
                      onChange({ ...value, id: "" });
                    }}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Xóa lựa chọn"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsConfigDropdownOpen(!isConfigDropdownOpen)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isConfigDropdownOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-medium leading-normal mt-1.5">
              * Hệ thống sẽ tự áp dụng thông số từ mẫu được chọn.
            </p>

            {/* SEARCHABLE DROPDOWN MENU */}
            {isConfigDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-52 overflow-y-auto rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  type="button"
                  onClick={() => handlePresetSelect("")}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    !selectedPresetId
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>-- Tự nhập / Cấu hình tùy chỉnh --</span>
                  {!selectedPresetId && <Check className="h-3.5 w-3.5 text-slate-900" />}
                </button>

                <div className="my-1 border-t border-slate-100" />

                {isLoadingConfigs ? (
                  <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang tải...</span>
                  </div>
                ) : filteredConfigs.length === 0 ? (
                  <div className="p-2.5 text-center text-xs text-slate-400 font-medium">
                    Không tìm thấy mẫu phù hợp
                  </div>
                ) : (
                  filteredConfigs.map((cfg) => {
                    const isSelected = String(cfg.id) === String(selectedPresetId);
                    return (
                      <button
                        key={cfg.id}
                        type="button"
                        onClick={() => handlePresetSelect(String(cfg.id))}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer group ${
                          isSelected
                            ? "bg-slate-100 text-slate-900 font-bold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-semibold truncate">{cfg.name}</p>
                          {(cfg.duration || cfg.classSize || cfg.space) && (
                            <p className="text-[10px] text-slate-400 group-hover:text-slate-500 mt-0.5 truncate">
                              {[
                                cfg.duration === "MIN_45" ? "45 phút" : cfg.duration === "MIN_90" ? "90 phút" : cfg.duration,
                                cfg.space === "COMPUTER_LAB" ? "Phòng máy" : cfg.space === "STANDARD" ? "Phòng tiêu chuẩn" : cfg.space,
                                cfg.classSize === "MEDIUM" ? "15-35 HS" : cfg.classSize,
                              ]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          )}
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-slate-900" />}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* AUTO-FILL SPARKLE CARD ON LEFT */}
          {selectedPresetId && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-xs text-indigo-900/90 leading-relaxed flex items-start gap-3 animate-in fade-in duration-200">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mt-0.5">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-indigo-800/90">
                Đã nạp tự động các thông số từ mẫu. Bạn có thể tinh chỉnh chi tiết ở cột bên phải.
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: CONFIG INPUT FIELDS ── */}
        <div className="md:col-span-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Tên cấu hình <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="VD: Cấu hình phòng máy tính"
              value={customName}
              onChange={(e) => updateField({ name: e.target.value })}
              className="h-10 border-slate-200 bg-white text-xs font-medium text-slate-900 rounded-xl focus:border-[var(--color-primary-400)] shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Thời lượng tiết học
              </label>
              <div className="relative">
                <select
                  value={customDuration}
                  onChange={(e) => updateField({ duration: e.target.value })}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 h-10 text-xs font-medium text-slate-900 focus:border-[var(--color-primary-400)] focus:outline-none cursor-pointer shadow-xs"
                >
                  <option value="MIN_45">45 phút (1 tiết)</option>
                  <option value="MIN_60">60 phút</option>
                  <option value="MIN_90">90 phút (2 tiết)</option>
                  <option value="MIN_120">120 phút</option>
                  <option value="MIN_135">135 phút (3 tiết)</option>
                  <option value="MIN_180">180 phút (4 tiết)</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <ChevronDown className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Sĩ số dự kiến
              </label>
              <div className="relative">
                <select
                  value={customClassSize}
                  onChange={(e) => updateField({ classSize: e.target.value })}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 h-10 text-xs font-medium text-slate-900 focus:border-[var(--color-primary-400)] focus:outline-none cursor-pointer shadow-xs"
                >
                  <option value="SMALL">Dưới 15 HS (Lớp nhỏ)</option>
                  <option value="MEDIUM">15 - 35 HS (Tiêu chuẩn)</option>
                  <option value="LARGE">36 - 60 HS (Lớp đông)</option>
                  <option value="VERY_LARGE">Trên 60 HS (Hội trường)</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <ChevronDown className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Loại phòng học
              </label>
              <div className="relative">
                <select
                  value={customSpace}
                  onChange={(e) => updateField({ space: e.target.value })}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 h-10 text-xs font-medium text-slate-900 focus:border-[var(--color-primary-400)] focus:outline-none cursor-pointer shadow-xs"
                >
                  <option value="STANDARD">Phòng học tiêu chuẩn</option>
                  <option value="COMPUTER_LAB">Phòng máy tính</option>
                  <option value="AUDITORIUM">Hội trường</option>
                  <option value="OUTDOOR">Sân trường / Ngoài trời</option>
                  <option value="ONLINE">Phòng học trực tuyến</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <ChevronDown className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Sắp xếp chỗ ngồi
              </label>
              <div className="relative">
                <select
                  value={customSeatingLayout}
                  onChange={(e) => updateField({ seatingLayout: e.target.value })}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 h-10 text-xs font-medium text-slate-900 focus:border-[var(--color-primary-400)] focus:outline-none cursor-pointer shadow-xs"
                >
                  <option value="ROWS">Hàng ngang truyền thống</option>
                  <option value="U_SHAPE">Hình chữ U</option>
                  <option value="GROUPS">Theo nhóm / Cụm bàn</option>
                  <option value="CIRCLE">Vòng tròn</option>
                  <option value="INDIVIDUAL_DESKS">Bàn cá nhân độc lập</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <ChevronDown className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
