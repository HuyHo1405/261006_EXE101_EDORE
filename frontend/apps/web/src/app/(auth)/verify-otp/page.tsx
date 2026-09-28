import { Suspense } from "react";
import { VerifyOtpForm } from "@/features/auth/components/VerifyOtpForm";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md p-8 text-center text-slate-500 font-bold">
        Đang tải...
      </div>
    }>
      <VerifyOtpForm />
    </Suspense>
  );
}

