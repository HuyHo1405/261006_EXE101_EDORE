import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LoginResponseDTO } from "@edore/types";

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  roles: string[];
  plan: "free" | "pro";
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  setHasHydrated: (state: boolean) => void;
  setAuth: (data: LoginResponseDTO) => void;
  setAccessToken: (token: string) => void;
  updatePlan: (plan: "free" | "pro") => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      setAuth: (data: LoginResponseDTO) =>
        set({
          user: {
            userId: data.userId,
            name: data.username || data.email.split("@")[0],
            email: data.email,
            roles: data.roles || ["ROLE_USER"],
            plan: "free", // Plan mặc định; sẽ được cập nhật từ API subscription sau khi login
          },
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        }),

      setAccessToken: (token: string) =>
        set({ accessToken: token }),

      updatePlan: (plan: "free" | "pro") =>
        set((state) => ({
          user: state.user ? { ...state.user, plan } : null,
        })),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "edore-auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

