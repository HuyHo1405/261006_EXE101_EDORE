import { ApiResponse } from "@edore/types";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export class FetchError extends Error {
  code: number;
  errors?: Record<string, string>;
  path?: string;

  constructor(code: number, message: string, errors?: Record<string, string>, path?: string) {
    super(message);
    this.name = "FetchError";
    this.code = code;
    this.errors = errors;
    this.path = path;
  }
}

export interface ApiOptions extends RequestInit {
  _isRetry?: boolean;
}

export async function apiClient<T = void>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const token = useAuthStore.getState().accessToken;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json().catch(() => ({
    code: response.status,
    message: response.statusText || "Lỗi kết nối máy chủ",
  }));

  // ── AUTO REFRESH TOKEN INTERCEPTOR ──
  const isUnauthorized = response.status === 401 || (data.message && data.message.includes("expired"));
  if (isUnauthorized && !options._isRetry) {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        const refreshData = await refreshRes.json();
        if (refreshRes.ok && refreshData.result?.accessToken) {
          const newAccessToken = refreshData.result.accessToken;
          useAuthStore.getState().setAccessToken(newAccessToken);

          // Retry original API request with new token
          return apiClient<T>(endpoint, { ...options, _isRetry: true });
        }
      } catch {
        useAuthStore.getState().logout();
      }
    }
    useAuthStore.getState().logout();
  }

  if (!response.ok || (data.code && data.code >= 2000)) {
    const message =
      data.errors && Object.keys(data.errors).length > 0
        ? Object.values(data.errors).join(", ")
        : data.message || "Đã xảy ra lỗi";

    throw new FetchError(
      data.code || response.status,
      message,
      data.errors,
      data.path
    );
  }

  return data;
}

