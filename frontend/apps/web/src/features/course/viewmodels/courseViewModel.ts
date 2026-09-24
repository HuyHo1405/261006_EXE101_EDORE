import type {
  CourseCardViewModel,
  CourseResponseDTO,
  ScriptCardViewModel,
  ScriptResponseDTO,
} from "@edore/types";

const CARD_COLORS = [
  "#7C3AED", // Violet
  "#0284C7", // Sky Blue
  "#059669", // Emerald Green
  "#92400E", // Warm Brown
  "#2563EB", // Royal Blue
  "#6366F1", // Indigo
  "#0D9488", // Cyan Teal
  "#D97706", // Amber
  "#9333EA", // Bright Purple
  "#0891B2", // Deep Cyan
];

export function getDisplayColor(seed: string = "course"): string {
  if (!seed) seed = "course";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CARD_COLORS.length;
  return CARD_COLORS[index];
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "Mới đây";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Mới đây";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatStatusLabel(status: string): string {
  switch (status?.toUpperCase()) {
    case "DRAFT":
      return "Bản nháp";
    case "PUBLISHED":
      return "Đã xuất bản";
    case "ARCHIVED":
      return "Lưu trữ";
    default:
      return status || "Bản nháp";
  }
}

// ── ViewModel Factories ──────────────────────────────────────────────────────

export function createCourseCardViewModel(dto: CourseResponseDTO): CourseCardViewModel {
  const safeDto = dto || ({} as CourseResponseDTO);
  const idStr = safeDto.id || safeDto.title || "course";

  return {
    id: safeDto.id || "",
    title: safeDto.title || "Khóa học chưa đặt tên",
    description: safeDto.description || "Chưa có mô tả",
    status: safeDto.status || "DRAFT",
    statusLabel: formatStatusLabel(safeDto.status),
    categoryNames: Array.isArray(safeDto.categories)
      ? safeDto.categories.map((c) => c?.name || "").filter(Boolean)
      : [],
    scriptCount: safeDto.scriptCount || 0,
    updatedText: formatRelativeTime(safeDto.updatedAt || safeDto.createdAt),
    displayColor: getDisplayColor(idStr),
    raw: safeDto,
  };
}

export function createScriptCardViewModel(dto: ScriptResponseDTO): ScriptCardViewModel {
  return {
    id: dto.id,
    courseId: dto.courseId,
    courseTitle: dto.courseTitle || "Khóa học",
    title: dto.title || "Kịch bản bài giảng",
    status: dto.status || "DRAFT",
    statusLabel: formatStatusLabel(dto.status),
    updatedText: formatRelativeTime(dto.updatedAt || dto.createdAt),
    raw: dto,
  };
}
