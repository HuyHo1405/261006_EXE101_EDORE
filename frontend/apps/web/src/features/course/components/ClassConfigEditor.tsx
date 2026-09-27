"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Sparkles, Loader2, ChevronDown, Layers, X, Check, Clock, Users, Monitor, Grid } from "lucide-react";
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
    apiClient<PageResponseDTO<ClassConfigSummary>>("/api/v1/class-configs?pageSize=50")
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
    <div className="space-y-5 font-sans">
      {showHeadings && (
        <div className="border-b border-[var(--color-neutral-200)] pb-4">
          <h3 className="font-header font-extrabold text-xl text-[var(--color-primary-600)] uppercase tracking-tight">
            {title}
          </h3>
          <p className="text-xs font-medium text-[var(--color-neutral-500)] mt-1">
            {subtitle}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        {/* ── LEFT COLUMN: PRESET SELECTOR & AUTO-FILL BANNER ── */}
        <div className="lg:col-span-5 flex flex-col gap-5 lg:pr-6 lg:border-r border-[var(--color-neutral-200)]">
          <div className="space-y-2 relative" ref={configDropdownRef}>
            <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-neutral-700)] uppercase tracking-wider">
              <div className="p-1 rounded bg-[var(--color-primary-50)] text-[var(--color-primary-500)]">
                <Layers className="w-3.5 h-3.5" />
              </div>
              Thư viện mẫu
            </label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Tìm / Chọn mẫu phòng học..."
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
                className="w-full rounded-[var(--radius-lg)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] pl-4 pr-12 h-12 text-sm font-semibold text-[var(--color-neutral-800)] transition-all focus:border-[var(--color-primary-400)] focus:bg-white focus:ring-4 focus:ring-[var(--color-primary-50)] hover:border-[var(--color-neutral-300)] shadow-sm"
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
                {(configSearchQuery || selectedPresetId) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPresetId("");
                      setConfigSearchQuery("");
                      setIsConfigDropdownOpen(false);
                      onChange({ ...value, id: "" });
                    }}
                    className="p-1 rounded-full text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-200)] hover:text-[var(--color-neutral-700)] transition-colors cursor-pointer"
                    title="Xóa lựa chọn"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsConfigDropdownOpen(!isConfigDropdownOpen)}
                  className="p-1 rounded-full text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-200)] hover:text-[var(--color-neutral-700)] transition-colors cursor-pointer"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isConfigDropdownOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[var(--color-neutral-500)] font-medium leading-relaxed italic px-1">
              Mẹo: Chọn một mẫu có sẵn để AI tự động điền các thông số kỹ thuật tối ưu nhất.
            </p>

            {/* SEARCHABLE DROPDOWN MENU */}
            {isConfigDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 max-h-64 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-neutral-100)] bg-white p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  type="button"
                  onClick={() => handlePresetSelect("")}
                  className={`w-full text-left px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    !selectedPresetId
                      ? "bg-[var(--color-primary-50)] text-[var(--color-primary-500)]"
                      : "text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)] hover:text-[var(--color-neutral-900)]"
                  }`}
                >
                  <span>Mẫu tuỳ chỉnh (Tự thiết lập)</span>
                  {!selectedPresetId && <Check className="h-4 w-4 text-[var(--color-primary-500)]" />}
                </button>

                <div className="my-2 mx-2 border-t border-[var(--color-neutral-100)]" />

                {isLoadingConfigs ? (
                  <div className="p-6 text-center text-xs text-[var(--color-neutral-400)] flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary-400)]" />
                    <span>Đang tải thư viện mẫu...</span>
                  </div>
                ) : filteredConfigs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[var(--color-neutral-500)] font-medium bg-[var(--color-neutral-50)] rounded-[var(--radius-md)] mx-2">
                    Không tìm thấy mẫu phù hợp
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConfigs.map((cfg) => {
                      const isSelected = String(cfg.id) === String(selectedPresetId);
                      return (
                        <button
                          key={cfg.id}
                          type="button"
                          onClick={() => handlePresetSelect(String(cfg.id))}
                          className={`w-full text-left px-4 py-3 rounded-[var(--radius-md)] text-xs transition-all flex items-center justify-between cursor-pointer group border ${
                            isSelected
                              ? "bg-[var(--color-primary-50)] border-[var(--color-primary-300)] text-[var(--color-primary-500)]"
                              : "bg-transparent border-transparent hover:bg-[var(--color-neutral-50)] hover:border-[var(--color-neutral-200)] text-[var(--color-neutral-700)]"
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <p className={`font-bold truncate text-sm mb-1 ${isSelected ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-neutral-800)]'}`}>{cfg.name}</p>
                            {(cfg.duration || cfg.classSize || cfg.space) && (
                              <p className={`text-[11px] font-medium truncate ${isSelected ? 'text-[var(--color-primary-400)]' : 'text-[var(--color-neutral-500)]'}`}>
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
                          {isSelected && <Check className="h-4 w-4 shrink-0 text-[var(--color-primary-500)]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AUTO-FILL SPARKLE CARD ON LEFT */}
          {selectedPresetId && (
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-primary-300)] bg-[var(--color-primary-50)] p-4 animate-in fade-in duration-300 shadow-sm">
              <div className="relative flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-primary-500)] shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-primary-600)] mb-1">Mẫu đã được áp dụng!</h4>
                  <p className="text-[11px] font-medium leading-relaxed text-[var(--color-primary-600)] opacity-80">
                    Hệ thống AI sẽ tối ưu kịch bản bài giảng dựa trên các thông số kỹ thuật của phòng học này.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: CONFIG INPUT FIELDS ── */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-[11px] font-bold text-[var(--color-neutral-500)] uppercase tracking-widest">
              Tên cấu hình <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="VD: Lớp học máy tính nâng cao..."
              value={customName}
              onChange={(e) => updateField({ name: e.target.value })}
              className="h-12 border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] text-sm font-bold text-[var(--color-neutral-800)] rounded-[var(--radius-lg)] focus:border-[var(--color-primary-400)] focus:bg-white focus:ring-4 focus:ring-[var(--color-primary-50)] shadow-sm transition-all"
            />
          </div>

          <div className="group">
            <label className="mb-2 flex items-center gap-2 text-[11px] font-bold text-[var(--color-neutral-500)] uppercase tracking-widest">
              <div className="p-1 rounded bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)] group-hover:scale-110 transition-transform"><Clock className="w-3 h-3" /></div>
              Thời lượng
            </label>
            <div className="relative">
              <select
                value={customDuration}
                onChange={(e) => updateField({ duration: e.target.value })}
                className="w-full appearance-none rounded-[var(--radius-lg)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] pl-4 pr-10 h-11 text-xs font-bold text-[var(--color-neutral-700)] focus:border-[var(--color-primary-400)] focus:bg-white focus:ring-4 focus:ring-[var(--color-primary-50)] cursor-pointer shadow-sm transition-all outline-none"
              >
                <option value="MIN_45">45 phút (1 tiết)</option>
                <option value="MIN_60">60 phút</option>
                <option value="MIN_90">90 phút (2 tiết)</option>
                <option value="MIN_120">120 phút</option>
                <option value="MIN_135">135 phút (3 tiết)</option>
                <option value="MIN_180">180 phút (4 tiết)</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="group">
            <label className="mb-2 flex items-center gap-2 text-[11px] font-bold text-[var(--color-neutral-500)] uppercase tracking-widest">
              <div className="p-1 rounded bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)] group-hover:scale-110 transition-transform"><Users className="w-3 h-3" /></div>
              Sĩ số
            </label>
            <div className="relative">
              <select
                value={customClassSize}
                onChange={(e) => updateField({ classSize: e.target.value })}
                className="w-full appearance-none rounded-[var(--radius-lg)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] pl-4 pr-10 h-11 text-xs font-bold text-[var(--color-neutral-700)] focus:border-[var(--color-primary-400)] focus:bg-white focus:ring-4 focus:ring-[var(--color-primary-50)] cursor-pointer shadow-sm transition-all outline-none"
              >
                <option value="SMALL">Dưới 15 HS (Lớp nhỏ)</option>
                <option value="MEDIUM">15 - 35 HS (Tiêu chuẩn)</option>
                <option value="LARGE">36 - 60 HS (Lớp đông)</option>
                <option value="VERY_LARGE">Trên 60 HS (Hội trường)</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="group">
            <label className="mb-2 flex items-center gap-2 text-[11px] font-bold text-[var(--color-neutral-500)] uppercase tracking-widest">
              <div className="p-1 rounded bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)] group-hover:scale-110 transition-transform"><Monitor className="w-3 h-3" /></div>
              Không gian
            </label>
            <div className="relative">
              <select
                value={customSpace}
                onChange={(e) => updateField({ space: e.target.value })}
                className="w-full appearance-none rounded-[var(--radius-lg)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] pl-4 pr-10 h-11 text-xs font-bold text-[var(--color-neutral-700)] focus:border-[var(--color-primary-400)] focus:bg-white focus:ring-4 focus:ring-[var(--color-primary-50)] cursor-pointer shadow-sm transition-all outline-none"
              >
                <option value="STANDARD">Phòng học tiêu chuẩn</option>
                <option value="COMPUTER_LAB">Phòng máy tính</option>
                <option value="AUDITORIUM">Hội trường</option>
                <option value="OUTDOOR">Ngoài trời / Sân trường</option>
                <option value="ONLINE">Lớp học trực tuyến</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="group">
            <label className="mb-2 flex items-center gap-2 text-[11px] font-bold text-[var(--color-neutral-500)] uppercase tracking-widest">
              <div className="p-1 rounded bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)] group-hover:scale-110 transition-transform"><Grid className="w-3 h-3" /></div>
              Bố trí bàn ghế
            </label>
            <div className="relative">
              <select
                value={customSeatingLayout}
                onChange={(e) => updateField({ seatingLayout: e.target.value })}
                className="w-full appearance-none rounded-[var(--radius-lg)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] pl-4 pr-10 h-11 text-xs font-bold text-[var(--color-neutral-700)] focus:border-[var(--color-primary-400)] focus:bg-white focus:ring-4 focus:ring-[var(--color-primary-50)] cursor-pointer shadow-sm transition-all outline-none"
              >
                <option value="ROWS">Hàng ngang truyền thống</option>
                <option value="U_SHAPE">Hình chữ U</option>
                <option value="GROUPS">Cụm bàn / Theo nhóm</option>
                <option value="CIRCLE">Vòng tròn linh hoạt</option>
                <option value="INDIVIDUAL_DESKS">Bàn cá nhân độc lập</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
