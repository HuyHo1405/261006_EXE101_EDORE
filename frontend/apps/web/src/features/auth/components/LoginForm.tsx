"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthResponseCode } from "@edore/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EdoreLogo } from "@/components/layout/Header/EdoreLogo";
import { Eye, EyeOff } from "@/components/ui/icons";
import { useLoginMutation } from "../hooks/useAuthMutations";
import { useFormValidation, EMAIL_REGEX } from "../hooks/useFormValidation";
import { FetchError } from "@/lib/fetcher";
import { toast } from "@/components/ui/toast";

export interface LoginFormProps {
  onSuccess?: () => void;
}

type LoginField = "email" | "password";

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLoginMutation();

  const { validateAll, clearError, getFieldError, getInputClassName } = useFormValidation<LoginField>({
    email: [
      { validate: (val) => val.trim().length > 0, message: "Vui lòng nhập email." },
      { validate: (val) => EMAIL_REGEX.test(val.trim()), message: "Email không hợp lệ." },
    ],
    password: [
      { validate: (val) => val.length > 0, message: "Vui lòng nhập mật khẩu." },
      { validate: (val) => val.length >= 6, message: "Mật khẩu từ 6 ký tự trở lên." },
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const isValid = validateAll({ email: trimmedEmail, password });

    if (!isValid) {
      return;
    }

    try {
      await loginMutation.mutateAsync({ email: trimmedEmail, password });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      if (err instanceof FetchError) {
        if (err.code === AuthResponseCode.USER_NOT_ACTIVE || err.message?.includes("chưa được kích hoạt")) {
          toast.info("Tài khoản chưa được kích hoạt. Vui lòng nhập mã OTP để kích hoạt.");
          if (typeof window !== "undefined") {
            sessionStorage.setItem("edore_otp_email", trimmedEmail);
            sessionStorage.setItem("edore_otp_type", "REGISTER");
          }
          router.push("/verify-otp");
          return;
        }
        toast.error(err.message || "Email hoặc mật khẩu không chính xác.");
      } else {
        toast.error("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-transparent border-none shadow-none p-0">
      {/* Form Header: Logo có margin-bottom riêng để tách biệt với Header & Description */}
      <div className="text-center mb-3">
        <Link href="/" className="inline-flex items-center gap-2 group justify-center mb-2">
          <EdoreLogo size={34} />
          <span className="font-header font-bold text-2xl tracking-tight text-[var(--color-primary-500)] group-hover:text-[var(--color-primary-600)] transition-colors">
            EDORE
          </span>
        </Link>
        <div className="space-y-1">
          <h2 className="text-sm md:text-base font-bold uppercase tracking-wide text-slate-800">
            Đăng nhập hệ thống Edore
          </h2>
          <p className="text-xs font-body text-slate-500 leading-snug max-w-xs mx-auto">
            Nhập thông tin tài khoản của bạn để tiếp tục.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email</Label>
            {getFieldError("email") && (
              <span className="text-[11px] text-red-500 font-semibold animate-in fade-in">
                {getFieldError("email")}
              </span>
            )}
          </div>
          <Input
            id="email"
            type="email"
            placeholder="nhagiao@edore.vn"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError("email");
            }}
            disabled={loginMutation.isPending}
            className={getInputClassName(
              "email",
              "w-full bg-slate-50/90 hover:bg-slate-100/70 focus:bg-white border-slate-200 focus:border-[var(--color-primary-500)] rounded-[var(--radius-sm)] py-1.5 px-3.5 text-sm transition-all"
            )}
            required
          />
        </div>

        <div className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Mật khẩu</Label>
            {getFieldError("password") && (
              <span className="text-[11px] text-red-500 font-semibold animate-in fade-in">
                {getFieldError("password")}
              </span>
            )}
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError("password");
              }}
              disabled={loginMutation.isPending}
              className={getInputClassName(
                "password",
                "w-full bg-slate-50/90 hover:bg-slate-100/70 focus:bg-white border-slate-200 focus:border-[var(--color-primary-500)] rounded-[var(--radius-sm)] py-1.5 px-3.5 pr-10 text-sm transition-all"
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
          <div className="flex items-center justify-between pt-0.5">
            <label htmlFor="rememberMe" className="inline-flex items-center gap-1.5 cursor-pointer select-none text-xs font-semibold text-slate-600 hover:text-slate-800">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-[var(--radius-xs)] border-slate-300 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] accent-[var(--color-primary-500)] cursor-pointer"
              />
              <span>Ghi nhớ mật khẩu</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-body font-semibold text-[var(--color-primary-600)] hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2 py-2.5 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-bold rounded-[var(--radius-md)] shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Đang xử lý..." : "ĐĂNG NHẬP"}
        </Button>

        <div className="text-center pt-1.5">
          <p className="text-xs md:text-sm font-body text-slate-500">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="font-bold text-[var(--color-primary-600)] hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}


