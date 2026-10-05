import { apiClient } from "@/lib/fetcher";
import { UserProfileResponse, UserSettingsResponse, UserSettingsUpdateRequest, UserUpdateRequest } from "@edore/types";

export const userService = {
  // Get current user profile
  getOwnProfile: async (): Promise<UserProfileResponse> => {
    const res = await apiClient<UserProfileResponse>("/api/v1/users/me");
    if (!res.result) {
      throw new Error(res.message || "Không thể tải thông tin cá nhân");
    }
    return res.result;
  },

  // Update own profile
  updateOwnProfile: async (request: UserUpdateRequest): Promise<void> => {
    await apiClient<void>("/api/v1/users/me", {
      method: "PUT",
      body: JSON.stringify(request),
    });
  },

  // Get user settings
  getUserSettings: async (): Promise<UserSettingsResponse> => {
    const res = await apiClient<UserSettingsResponse>("/api/v1/users/me/settings");
    if (!res.result) {
      throw new Error(res.message || "Không thể tải cài đặt người dùng");
    }
    return res.result;
  },

  // Update user settings
  updateUserSettings: async (request: UserSettingsUpdateRequest): Promise<UserSettingsResponse> => {
    const res = await apiClient<UserSettingsResponse>("/api/v1/users/me/settings", {
      method: "PATCH",
      body: JSON.stringify(request),
    });
    if (!res.result) {
      throw new Error(res.message || "Cập nhật cài đặt thất bại");
    }
    return res.result;
  },
};
