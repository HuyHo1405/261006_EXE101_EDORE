"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AUTH_ERROR_MESSAGES } from "@edore/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EdoreLogo } from "@/components/layout/Header/EdoreLogo";
import { Eye, EyeOff } from "@/components/ui/icons";
import { useResetPasswordMutation } from "../hooks/useAuthMutations";
import { useFormValidation, EMAIL_REGEX } from "../hooks/useFormValidation";
import { FetchError } from "@/lib/fetcher";
import { toast } from "@/components/ui/toast";

type ResetFields = "newPassword" | "confirmPassword";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const resetToken = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const resetPasswordMutation = useResetPasswordMutation();

  const rules = {
    length: newPassword.length >= 8 && newPassword.length <= 50,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
  };

  const isPasswordValid = Object.values(rules).every(Boolean);

  const { validateAll, clearError, getFieldError, getInputClassName } = useFormValidation<ResetFields>({
    newPassword: [
      { validate: (val) => val.length > 0, message: "Vui lòng nhập mật khẩu mới." },
      { validate: (val) => isPasswordValid, message: "Mật khẩu chưa đủ 5 điều kiện an toàn." },
    ],
    confirmPassword: [
      { validate: (val) => val.length > 0, message: "Vui lòng xác nhận mật khẩu mới." },
      { validate: (val, all) => val === all?.newPassword, message: "Mật khẩu xác nhận không trùng khớp." },
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      toast.error("Email không hợp lệ hoặc thiếu thông tin.");
      return;
    }

    const isValid = validateAll({ newPassword, confirmPassword });
    if (!isValid) return;

    try {
      await resetPasswordMutation.mutateAsync({
        email: trimmedEmail,
        resetToken: resetToken.trim(),
        newPassword,
        confirmPassword,
      });

      router.push("/login?reset=true");
    } catch (err) {
      if (err instanceof FetchError) {
        toast.error(AUTH_ERROR_MESSAGES[err.code] || err.message || "Đặt lại mật khẩu thất bại. Token có thể đã hết hạn.");
      } else {
        toast.error("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-transparent border-none shadow-none p-0">
      {/* Form Header */}
      <div className="text-center mb-3">
        <Link href="/" className="inline-flex items-center gap-2 group justify-center mb-2">
          <EdoreLogo size={34} />
          <span className="font-header font-bold text-2xl tracking-tight text-[var(--color-primary-500)] group-hover:text-[var(--color-primary-600)] transition-colors">
            EDORE
          </span>
        </Link>
        <div className="space-y-1">
          <h2 className="text-sm md:text-base font-bold uppercase tracking-wide text-slate-800">
            Đặt lại mật khẩu
          </h2>
          <p className="text-xs font-body text-slate-500 leading-snug max-w-xs mx-auto truncate">
            Tạo mật khẩu mới cho <strong className="text-slate-700">{email || "tài khoản"}</strong>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
        <div className="space-y-1 text-left">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-700 shrink-0">Mật khẩu mới</Label>
            {getFieldError("newPassword") && (
              <span className="text-[11px] text-red-500 font-semibold animate-in fade-in truncate text-right">
                {getFieldError("newPassword")}
              </span>
            )}
          </div>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                clearError("newPassword");
              }}
              disabled={resetPasswordMutation.isPending}
              className={getInputClassName(
                "newPassword",
                "w-full bg-slate-50/90 hover:bg-slate-100/70 focus:bg-white border-slate-200 focus:border-[var(--color-primary-500)] rounded-[var(--radius-sm)] py-1.5 px-3.5 pr-9 text-sm transition-all"
              )}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer select-none"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {newPassword.length > 0 && (
          <div className="bg-slate-50 p-2 rounded-[var(--radius-sm)] text-[11px] font-body flex flex-col gap-0.5 border border-slate-200 text-left">
            <span className={rules.length ? "text-emerald-600 font-semibold" : "text-slate-400"}>
              {rules.length ? "✓" : "○"} Chiều dài 8 đến 50 ký tự
            </span>
            <span className={rules.uppercase && rules.lowercase ? "text-emerald-600 font-semibold" : "text-slate-400"}>
              {rules.uppercase && rules.lowercase ? "✓" : "○"} Chữ hoa (A-Z) & chữ thường (a-z)
            </span>
            <span className={rules.number && rules.special ? "text-emerald-600 font-semibold" : "text-slate-400"}>
              {rules.number && rules.special ? "✓" : "○"} Chữ số (0-9) & ký tự đặc biệt (!@#$...)
            </span>
          </div>
        )}

        <div className="space-y-1 text-left">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700 shrink-0">Xác nhận mật khẩu mới</Label>
            {getFieldError("confirmPassword") && (
              <span className="text-[11px] text-red-500 font-semibold animate-in fade-in truncate text-right">
                {getFieldError("confirmPassword")}
              </span>
            )}
          </div>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearError("confirmPassword");
            }}
            disabled={resetPasswordMutation.isPending}
            className={getInputClassName(
              "confirmPassword",
              "w-full bg-slate-50/90 hover:bg-slate-100/70 focus:bg-white border-slate-200 focus:border-[var(--color-primary-500)] rounded-[var(--radius-sm)] py-1.5 px-3.5 text-sm transition-all"
            )}
            required
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full mt-1.5 py-2.5 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-bold rounded-[var(--radius-md)] shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          disabled={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? "Đang xử lý..." : "ĐẶT LẠI MẬT KHẨU"}
        </Button>

        <div className="text-center pt-1.5">
          <p className="text-xs md:text-sm font-body text-slate-500">
            Nhớ ra mật khẩu?{" "}
            <Link href="/login" className="font-bold text-[var(--color-primary-600)] hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}


