"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { OtpType, AuthResponseCode, AUTH_ERROR_MESSAGES } from "@edore/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EdoreLogo } from "@/components/layout/Header/EdoreLogo";
import { useVerifyOtpMutation } from "../hooks/useAuthMutations";
import { authService } from "../api/authService";
import { useFormValidation, EMAIL_REGEX, OTP_REGEX } from "../hooks/useFormValidation";
import { FetchError } from "@/lib/fetcher";
import { toast } from "@/components/ui/toast";

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email || "email";
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `${local[0] || "*"}*@${domain}`;
  }
  const first = local[0];
  const last = local[local.length - 1];
  const maskedMiddle = "*".repeat(Math.min(local.length - 2, 6));
  return `${first}${maskedMiddle}${last}@${domain}`;
}

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

type OtpFields = "email" | "otpCode";

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [type, setType] = useState<OtpType>("REGISTER");
  const [otpCode, setOtpCode] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const triggerErrorState = (msg: string) => {
    setHasError(true);
    setIsShaking(true);
    toast.error(msg);
    setTimeout(() => setIsShaking(false), 450);
  };

  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isOtpFocused, setIsOtpFocused] = useState(false);

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const verifyOtpMutation = useVerifyOtpMutation();

  useEffect(() => {
    const paramEmail = searchParams.get("email");
    const paramType = searchParams.get("type") as OtpType;

    if (typeof window !== "undefined") {
      const storedEmail = sessionStorage.getItem("edore_otp_email");
      const storedType = sessionStorage.getItem("edore_otp_type") as OtpType;

      const activeEmail = paramEmail || storedEmail || "";
      const activeType = paramType || storedType || "REGISTER";

      if (!activeEmail) {
        toast.error("Phiên xác thực OTP không tồn tại. Vui lòng đăng nhập hoặc yêu cầu mã mới.");
        router.push("/login");
        return;
      }

      setEmail(activeEmail);
      setType(activeType);
    }
  }, [searchParams, router]);

  const { validateAll, clearError, getFieldError, getInputClassName } = useFormValidation<OtpFields>({
    email: [
      { validate: (val) => val.trim().length > 0, message: "Vui lòng nhập email." },
      { validate: (val) => EMAIL_REGEX.test(val.trim()), message: "Email không đúng định dạng (VD: nhagiao@edore.vn)." },
    ],
    otpCode: [
      { validate: (val) => val.trim().length > 0, message: "Vui lòng nhập mã OTP 6 chữ số." },
      { validate: (val) => OTP_REGEX.test(val.trim()), message: "Mã OTP phải bao gồm chính xác 6 chữ số." },
    ],
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = async () => {
    const trimmedEmail = email.trim();
    if (!canResend || !trimmedEmail) return;

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      toast.error("Email không hợp lệ.");
      return;
    }

    try {
      setHasError(false);
      const res = await authService.sendOtp({ email: trimmedEmail, type });
      toast.success(res.message || "Đã gửi mã OTP mới tới email của bạn.");
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      if (err instanceof FetchError) {
        toast.error(err.message);
      } else {
        toast.error("Không thể gửi mã OTP. Vui lòng thử lại sau.");
      }
    }
  };

  const isReset = type === "RESET_PASSWORD";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasError(false);

    const trimmedEmail = email.trim();
    const trimmedOtp = otpCode.trim();

    const isValid = validateAll({ email: trimmedEmail, otpCode: trimmedOtp });
    if (!isValid) {
      const otpErr = getFieldError("otpCode") || getFieldError("email") || "Vui lòng nhập mã OTP 6 chữ số.";
      triggerErrorState(otpErr);
      return;
    }

    try {
      const res = await verifyOtpMutation.mutateAsync({
        email: trimmedEmail,
        otpCode: trimmedOtp,
        type,
      });

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("edore_otp_email");
        sessionStorage.removeItem("edore_otp_type");
      }

      if (isReset && res.result?.resetToken) {
        router.push(
          `/reset-password?email=${encodeURIComponent(trimmedEmail)}&token=${encodeURIComponent(res.result.resetToken)}`
        );
      } else {
        toast.success("Kích hoạt tài khoản thành công! Vui lòng đăng nhập.");
        router.push("/login?registered=true");
      }
    } catch (err) {
      if (err instanceof FetchError) {
        const errorMsg =
          AUTH_ERROR_MESSAGES[err.code] ||
          err.message ||
          "Mã OTP không hợp lệ hoặc đã hết hạn.";
        triggerErrorState(errorMsg);
      } else {
        triggerErrorState("Đã xảy ra lỗi xác thực OTP. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-transparent border-none shadow-none p-0">
      {/* Form Header matching reference design */}
      <div className="text-center mb-4">
        <Link href="/" className="inline-flex items-center gap-2 group justify-center mb-2">
          <EdoreLogo size={34} />
          <span className="font-header font-bold text-2xl tracking-tight text-[var(--color-primary-500)] group-hover:text-[var(--color-primary-600)] transition-colors">
            EDORE
          </span>
        </Link>
        <div className="space-y-1">
          <h2 className="text-sm md:text-base font-bold uppercase tracking-wide text-slate-800">
            {isReset ? "Xác thực đặt lại mật khẩu" : "Xác thực mã OTP"}
          </h2>
          <p className="text-xs font-body text-slate-500 leading-snug max-w-xs mx-auto">
            Mã xác thực 6 chữ số đã được gửi đến email
          </p>
          <div className="mt-3 flex justify-center">
            <span className="inline-block px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 font-semibold text-xs tracking-wide shadow-xs">
              {maskEmail(email)}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* 6-box OTP Input driven by Single Overlay Input */}
        <div className="text-center">
          <div
            className={`relative w-full cursor-pointer select-none transition-transform ${
              isShaking ? "animate-shake" : ""
            }`}
            style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "8px" }}
            onClick={() => hiddenInputRef.current?.focus()}
          >
            {/* Hidden Input Layer for native focus & IME typing safety */}
            <input
              ref={hiddenInputRef}
              id="otp-hidden-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              value={otpCode}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtpCode(cleaned);
                clearError("otpCode");
                setHasError(false);
              }}
              onFocus={() => setIsOtpFocused(true)}
              onBlur={() => setIsOtpFocused(false)}
              disabled={verifyOtpMutation.isPending}
              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer text-transparent bg-transparent"
              aria-label="Mã OTP 6 chữ số"
              required
            />

            {/* 6 Visual Box Elements Driven strictly by `otpCode` state */}
            {Array.from({ length: 6 }).map((_, index) => {
              const val = otpCode[index] || "";
              const isCurrentActive = isOtpFocused && (index === otpCode.length || (index === 5 && otpCode.length === 6));

              return (
                <div
                  key={index}
                  style={{ height: "46px" }}
                  className={`w-full text-center font-mono text-lg sm:text-xl font-bold rounded-[var(--radius-sm)] border-2 transition-all flex items-center justify-center ${hasError
                    ? "border-red-500 bg-red-50/30 text-red-600 ring-2 ring-red-100 animate-in fade-in"
                    : isCurrentActive
                      ? "border-blue-600 bg-white ring-4 ring-blue-100 text-slate-900 scale-[1.03]"
                      : val
                        ? "border-[var(--color-primary-500)] bg-white text-slate-900 shadow-xs"
                        : "border-slate-200 bg-slate-50/80 text-slate-400"
                    }`}
                >
                  {val || (isCurrentActive ? <span className="w-0.5 h-5 bg-blue-600 animate-pulse rounded-full" /> : "")}
                </div>
              );
            })}
          </div>
        </div>

        {/* Resend Code Link Section (ABOVE Submit Button) */}
        <div className="text-center py-0.5">
          <p className="text-xs font-body text-slate-500">
            Chưa nhận được mã?{" "}
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="font-bold text-[var(--color-primary-600)] hover:underline cursor-pointer"
              >
                Gửi lại mã
              </button>
            ) : (
              <span>
                Gửi lại sau <strong className="font-mono font-bold text-slate-700">{formatCountdown(countdown)}</strong>
              </span>
            )}
          </p>
        </div>

        {/* Email Input: Dời xuống dưới nếu là luồng Reset Password hoặc người dùng muốn chỉnh sửa */}
        {isReset && (
          <div className="space-y-1 text-left pt-1">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700 shrink-0">Email nhận mã</Label>
              {getFieldError("email") && (
                <span className="text-[11px] text-red-500 font-semibold animate-in fade-in truncate text-right">
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
              disabled={verifyOtpMutation.isPending}
              className={getInputClassName(
                "email",
                "w-full bg-slate-50/90 hover:bg-slate-100/70 focus:bg-white border-slate-200 focus:border-[var(--color-primary-500)] rounded-[var(--radius-sm)] py-1.5 px-3.5 text-sm transition-all"
              )}
              required
            />
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full py-2.5 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-bold rounded-[var(--radius-md)] shadow-md transition-all active:scale-[0.99] cursor-pointer text-sm tracking-wide"
          disabled={verifyOtpMutation.isPending}
        >
          {verifyOtpMutation.isPending
            ? "Đang xác nhận..."
            : isReset
              ? "TIẾP TỤC ĐẶT LẠI MẬT KHẨU"
              : "XÁC NHẬN KÍCH HOẠT"}
        </Button>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-xs font-body font-semibold text-slate-400 hover:text-[var(--color-primary-600)] hover:underline"
          >
            ← Quay lại Đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}


