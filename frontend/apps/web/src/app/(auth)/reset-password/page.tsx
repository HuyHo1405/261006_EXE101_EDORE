import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md p-8 text-center text-slate-500 font-bold">
        Đang tải...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

