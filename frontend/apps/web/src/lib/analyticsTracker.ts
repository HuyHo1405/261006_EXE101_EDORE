"use client";

export interface PageViewRecord {
  path: string;
  referrer: string;
  device: "desktop" | "mobile" | "tablet";
  timestamp: number;
}

const STORAGE_KEY = "edore_internal_analytics_records";

export const analyticsTracker = {
  // Ghi nhận một lượt xem trang (Pageview)
  trackPageView: (path?: string) => {
    if (typeof window === "undefined") return;

    try {
      const currentPath = path || window.location.pathname;
      const ref = typeof document !== "undefined" ? document.referrer : "";
      
      let referrerType = "Truy cập trực tiếp (Direct)";
      if (ref.includes("facebook.com") || ref.includes("fb.com")) {
        referrerType = "Mạng xã hội (Facebook)";
      } else if (ref.includes("tiktok.com")) {
        referrerType = "Mạng xã hội (TikTok)";
      } else if (ref.includes("google.com")) {
        referrerType = "Tìm kiếm tự nhiên (Google)";
      } else if (ref && !ref.includes(window.location.hostname)) {
        referrerType = "Giới thiệu & Liên kết (Referral)";
      }

      const width = window.innerWidth;
      let device: "desktop" | "mobile" | "tablet" = "desktop";
      if (width < 640) device = "mobile";
      else if (width < 1024) device = "tablet";

      const existingData = localStorage.getItem(STORAGE_KEY);
      const records: PageViewRecord[] = existingData ? JSON.parse(existingData) : [];

      records.push({
        path: currentPath,
        referrer: referrerType,
        device,
        timestamp: Date.now(),
      });

      // Giữ tối đa 500 bản ghi gần nhất để tối ưu bộ nhớ
      const trimmed = records.slice(-500);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // Bỏ qua lỗi lưu trữ nếu trình duyệt chặn quota
    }
  },

  // Lấy danh sách lượt truy cập nội bộ đã ghi nhận
  getRecords: (): PageViewRecord[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },
};
