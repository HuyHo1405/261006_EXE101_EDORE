"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AUTH_ERROR_MESSAGES } from "@edore/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EdoreLogo } from "@/components/layout/Header/EdoreLogo";
import { authService } from "../api/authService";
import { useFormValidation, EMAIL_REGEX } from "../hooks/useFormValidation";
import { FetchError } from "@/lib/fetcher";
import { toast } from "@/components/ui/toast";

type ForgotPasswordFields = "email";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { validateAll, clearError, getFieldError, getInputClassName } = useFormValidation<ForgotPasswordFields>({
    email: [
      { validate: (val) => val.trim().length > 0, message: "Vui lòng nhập địa chỉ email." },
      { validate: (val) => EMAIL_REGEX.test(val.trim()), message: "Email không đúng định dạng (VD: nhagiao@edore.vn)." },
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const isValid = validateAll({ email: trimmedEmail });

    if (!isValid) return;

    setIsLoading(true);

    try {
      const res = await authService.forgotPassword({ email: trimmedEmail });
      if (res.message) {
        toast.success(res.message);
      }
      if (typeof window !== "undefined") {
        sessionStorage.setItem("edore_otp_email", trimmedEmail);
        sessionStorage.setItem("edore_otp_type", "RESET_PASSWORD");
      }
      router.push("/verify-otp");
    } catch (err) {
      if (err instanceof FetchError) {
        toast.error(AUTH_ERROR_MESSAGES[err.code] || err.message || "Không thể gửi yêu cầu quên mật khẩu.");
      } else {
        toast.error("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
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
            Quên mật khẩu
          </h2>
          <p className="text-xs font-body text-slate-500 leading-snug max-w-xs mx-auto">
            Nhập email đăng ký tài khoản Edore của bạn để nhận mã OTP khôi phục.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email tài khoản</Label>
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
            disabled={isLoading}
            className={getInputClassName(
              "email",
              "w-full bg-slate-50/90 hover:bg-slate-100/70 focus:bg-white border-slate-200 focus:border-[var(--color-primary-500)] rounded-[var(--radius-sm)] py-1.5 px-3.5 text-sm transition-all"
            )}
            required
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2 py-2.5 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-bold rounded-[var(--radius-md)] shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "Đang xử lý..." : "GỬI MÃ OTP QUÊN MẬT KHẨU"}
        </Button>

        <div className="text-center pt-1.5">
          <Link
            href="/login"
            className="text-xs md:text-sm font-body font-semibold text-[var(--color-primary-600)] hover:underline"
          >
            ← Quay lại đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}


