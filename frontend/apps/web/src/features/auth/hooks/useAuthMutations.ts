import { useMutation } from "@tanstack/react-query";
import {
  LoginRequestDTO,
  RegisterRequestDTO,
  VerifyOtpRequestDTO,
  ResetPasswordRequestDTO,
} from "@edore/types";
import { authService } from "../api/authService";
import { useAuthStore } from "../stores/useAuthStore";
import { toast } from "@/components/ui/toast";

export function useLoginMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequestDTO) => authService.login(data),
    onSuccess: (res) => {
      if (res.result) {
        setAuth(res.result);
      }
      if (res.message) {
        toast.success(res.message);
      }
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (data: RegisterRequestDTO) => authService.register(data),
    onSuccess: (res) => {
      if (res.message) {
        toast.success(res.message);
      }
    },
  });
}

export function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: (data: VerifyOtpRequestDTO) => authService.verifyOtp(data),
    onSuccess: (res) => {
      if (res.message) {
        toast.success(res.message);
      }
    },
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequestDTO) => authService.resetPassword(data),
    onSuccess: (res) => {
      if (res.message) {
        toast.success(res.message);
      }
    },
  });
}

export function useLogoutMutation() {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: (res) => {
      if (res.message) {
        toast.info(res.message);
      }
    },
    onSettled: () => {
      logout();
    },
  });
}
