"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthResponseCode, AUTH_ERROR_MESSAGES } from "@edore/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EdoreLogo } from "@/components/layout/Header/EdoreLogo";
import { Eye, EyeOff } from "@/components/ui/icons";
import { useRegisterMutation } from "../hooks/useAuthMutations";
import { useFormValidation, EMAIL_REGEX, PHONE_REGEX } from "../hooks/useFormValidation";
import { FetchError } from "@/lib/fetcher";
import { toast } from "@/components/ui/toast";

type RegisterField = "email" | "phone" | "password" | "confirmPassword";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const registerMutation = useRegisterMutation();

  // Password rules validation helper
  const rules = {
    length: password.length >= 8 && password.length <= 50,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const isPasswordValid = Object.values(rules).every(Boolean);

  const { validateAll, clearError, getFieldError, getInputClassName } = useFormValidation<RegisterField>({
    email: [
      { validate: (val) => val.trim().length > 0, message: "Nhập email." },
      { validate: (val) => EMAIL_REGEX.test(val.trim()), message: "Email không hợp lệ." },
    ],
    phone: [
      { validate: (val) => val.trim().length > 0, message: "Nhập số điện thoại." },
      { validate: (val) => PHONE_REGEX.test(val.trim()), message: "Số ĐT không hợp lệ." },
    ],
    password: [
      { validate: (val) => val.length > 0, message: "Nhập mật khẩu." },
      { validate: (val) => isPasswordValid, message: "Mật khẩu chưa đúng quy định." },
    ],
    confirmPassword: [
      { validate: (val) => val.length > 0, message: "Nhập lại mật khẩu." },
      { validate: (val, all) => val === all?.password, message: "Mật khẩu không khớp." },
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    const isValid = validateAll({
      email: trimmedEmail,
      phone: trimmedPhone,
      password,
      confirmPassword,
    });

    if (!isValid) return;

    try {
      await registerMutation.mutateAsync({
        fullName: trimmedEmail.split("@")[0] || "User",
        email: trimmedEmail,
        phone: trimmedPhone,
        password,
        confirmPassword,
      });

      if (typeof window !== "undefined") {
        sessionStorage.setItem("edore_otp_email", trimmedEmail);
        sessionStorage.setItem("edore_otp_type", "REGISTER");
      }
      router.push("/verify-otp");
    } catch (err) {
      if (err instanceof FetchError) {
        toast.error(AUTH_ERROR_MESSAGES[err.code] || err.message || "Đăng ký thất bại. Vui lòng kiểm tra lại.");
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
            Đăng ký tài khoản Edore
          </h2>
          <p className="text-xs font-body text-slate-500 leading-snug max-w-xs mx-auto">
            Tạo tài khoản mới để trải nghiệm nền tảng.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-7 space-y-1 text-left">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email</Label>
              {getFieldError("email") && (
                <span className="text-[11px] text-red-500 font-semibold animate-in fade-in truncate max-w-[60%] text-right">
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
              disabled={registerMutation.isPending}
              className={getInputClassName(
                "email",
                "w-full bg-slate-50/90 hover:bg-slate-100/70 focus:bg-white border-slate-200 focus:border-[var(--color-primary-500)] rounded-[var(--radius-sm)] py-1.5 px-3.5 text-sm transition-all"
              )}
              required
            />
          </div>

          <div className="sm:col-span-5 space-y-1 text-left">
            <div className="flex items-center justify-between">
              <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">Số điện thoại</Label>
              {getFieldError("phone") && (
                <span className="text-[11px] text-red-500 font-semibold animate-in fade-in truncate max-w-[60%] text-right">
                  {getFieldError("phone")}
                </span>
              )}
            </div>
            <Input
              id="phone"
              type="tel"
              placeholder="0912345678"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                clearError("phone");
              }}
              disabled={registerMutation.isPending}
              className={getInputClassName(
                "phone",
                "w-full bg-slate-50/90 hover:bg-slate-100/70 focus:bg-white border-slate-200 focus:border-[var(--color-primary-500)] rounded-[var(--radius-sm)] py-1.5 px-3.5 text-sm transition-all"
              )}
              required
            />
          </div>
        </div>

        {/* Hàng 1 Mật khẩu */}
        <div className="space-y-1 text-left">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700 shrink-0">Mật khẩu</Label>
            {getFieldError("password") && (
              <span className="text-[11px] text-red-500 font-semibold animate-in fade-in truncate text-right">
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
              disabled={registerMutation.isPending}
              className={getInputClassName(
                "password",
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
          <div className="flex justify-end w-full">
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 text-right">
              (8-50 ký tự, gồm chữ hoa, thường, số & ký tự đặc biệt)
            </p>
          </div>
        </div>

        {/* Hàng 2 Xác nhận mật khẩu */}
        <div className="space-y-1 text-left">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700 shrink-0">Xác nhận mật khẩu</Label>
            {getFieldError("confirmPassword") && (
              <span className="text-[11px] text-red-500 font-semibold animate-in fade-in truncate text-right">
                {getFieldError("confirmPassword")}
              </span>
            )}
          </div>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearError("confirmPassword");
            }}
            disabled={registerMutation.isPending}
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
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? "Đang xử lý..." : "ĐĂNG KÝ NGAY"}
        </Button>

        <div className="text-center pt-1.5">
          <p className="text-xs md:text-sm font-body text-slate-500">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-bold text-[var(--color-primary-600)] hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}


