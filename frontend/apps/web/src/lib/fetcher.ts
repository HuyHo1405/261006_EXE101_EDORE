import { ApiResponse } from "@edore/types";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

let tokenRefresh: { token: string; promise: Promise<boolean> } | null = null;

function refreshSession(refreshToken: string): Promise<boolean> {
  if (tokenRefresh?.token === refreshToken) return tokenRefresh.promise;
  const promise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await response.json();
      // A logout or a different login must not be undone by an older response.
      if (useAuthStore.getState().refreshToken !== refreshToken) return false;
      if (!response.ok || !data.result?.accessToken || !data.result?.refreshToken) return false;
      useAuthStore.getState().setTokens(data.result.accessToken, data.result.refreshToken);
      return true;
    } catch {
      return false;
    }
  })();
  tokenRefresh = { token: refreshToken, promise };
  void promise.finally(() => {
    if (tokenRefresh?.promise === promise) tokenRefresh = null;
  });
  return promise;
}

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
  const requestSession = useAuthStore.getState();
  const token = requestSession.accessToken;
  const requestUserId = requestSession.user?.userId;

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
  if (isUnauthorized && !options._isRetry && useAuthStore.getState().user?.userId === requestUserId) {
    const current = useAuthStore.getState();
    // Another request may already have refreshed while this response was in flight.
    if (current.accessToken && current.accessToken !== token) {
      return apiClient<T>(endpoint, { ...options, _isRetry: true });
    }
    const refreshToken = current.refreshToken;
    if (refreshToken) {
      if (await refreshSession(refreshToken) && useAuthStore.getState().user?.userId === requestUserId) {
        return apiClient<T>(endpoint, { ...options, _isRetry: true });
      }
      if (useAuthStore.getState().refreshToken === refreshToken) useAuthStore.getState().logout();
    } else {
      useAuthStore.getState().logout();
    }
  }

  if (isUnauthorized && options._isRetry && useAuthStore.getState().accessToken === token
      && useAuthStore.getState().user?.userId === requestUserId) {
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

