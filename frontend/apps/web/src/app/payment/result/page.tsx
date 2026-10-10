"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight, RefreshCw, ShieldCheck, Sparkles, LayoutDashboard, CreditCard } from "lucide-react";
import { subscriptionService } from "@/features/subscription/api/subscriptionService";
import { OrderResponseDTO } from "@edore/types";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderCode = searchParams.get("orderCode") || searchParams.get("orderId") || searchParams.get("id");
  const urlStatus = searchParams.get("status") || searchParams.get("cancel");

  const [loading, setLoading] = useState<boolean>(true);
  const [order, setOrder] = useState<OrderResponseDTO | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // ── MOCK DATA FOR UI TESTING ──
    const isMock = searchParams.get("mock") === "true";
    if (isMock) {
      setLoading(false);
      setOrder({
        id: "mock-order-id-12345",
        userId: "user-abc",
        subscriptionPlanId: 2,
        subscriptionPlanName: "GÓI PRO (1 THÁNG)",
        amount: 149000,
        status: "CANCELLED",
        gatewayOrderCode: 987654321,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    if (!orderCode) {
      setLoading(false);
      setErrorMsg("Không tìm thấy mã đơn hàng trong liên kết (Missing orderCode). Vui lòng kiểm tra lại đường dẫn.");
      return;
    }

    let isMounted = true;
    async function verify() {
      try {
        setLoading(true);
        const res = await subscriptionService.verifyPayment(orderCode as string);
        if (isMounted) {
          setOrder(res);
          setLoading(false);
          // Sync new plan state to Zustand header
          try {
            const subStatus = await subscriptionService.getMySubscriptionStatus();
            const isPro = (
              subStatus?.planName?.toLowerCase().includes("pro") || 
              (subStatus?.maxCourses && subStatus.maxCourses > 5)
            ) && subStatus?.status === "ACTIVE";
            useAuthStore.getState().updatePlan(isPro ? "pro" : "free");
          } catch {}
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || "Xác minh đơn hàng không thành công");
          setLoading(false);
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [orderCode, searchParams]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const isSuccess = order?.status === "PAID" || urlStatus === "PAID";
  const isCancelled = order?.status === "CANCELLED" || urlStatus === "CANCELLED" || urlStatus === "true";
  const isPending = order?.status === "PENDING";

  return (
    <div className="w-full bg-[var(--color-neutral-50,#fafafa)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white rounded-[var(--radius-lg,12px)] border border-[var(--color-neutral-200,#d9d9d9)] p-6 sm:p-10 shadow-lg relative overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="w-12 h-12 border-4 border-[var(--color-primary-300,#6e96ef)] border-t-[var(--color-primary-500,#034ce4)] rounded-full animate-spin" />
              <p className="text-base font-medium text-[var(--color-neutral-700,#404040)] font-sans">
                Đang đối soát dữ liệu với ngân hàng / cổng thanh toán...
              </p>
            </div>
          ) : errorMsg ? (
            <div className="flex flex-col w-full max-w-md mx-auto">
              {/* Error Header */}
              <div className="flex flex-col items-center pb-10 text-center mt-6">
                <div className="w-24 h-24 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)] mb-8 animate-elastic-pop relative">
                   <div className="absolute inset-0 rounded-full bg-[#F59E0B]/20 scale-125" />
                   <AlertTriangle className="w-12 h-12 relative z-10" strokeWidth={3} />
                </div>
                <h3 className="text-3xl font-bold text-[#1E293B] font-sans tracking-tight mb-3">Lỗi truy cập</h3>
                <p className="text-[#64748B] text-[15px] font-medium leading-relaxed px-4">
                  {errorMsg}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 mt-4">
                <Link
                  href="/dashboard"
                  className="w-full py-3.5 rounded-[var(--radius-md,8px)] bg-[var(--color-primary-500,#034ce4)] hover:bg-[var(--color-primary-600,#0240c0)] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 opacity-80" /> Về trang chủ
                </Link>
                <Link
                  href="/dashboard/profile?tab=transactions"
                  className="w-full py-3.5 rounded-[var(--radius-md,8px)] bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-gray-600" /> Xem lịch sử giao dịch
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="flex flex-col w-full max-w-md mx-auto">
              {/* Top part: Glowing Green Icon and Title */}
              <div className="flex flex-col items-center pb-10 text-center mt-6">
                <div className="w-24 h-24 rounded-full bg-[#1CD036] text-white flex items-center justify-center shadow-[0_0_40px_rgba(28,208,54,0.4)] mb-8 animate-elastic-pop relative">
                  <div className="absolute inset-0 rounded-full bg-[#1CD036]/20 scale-125" />
                  <Check className="w-12 h-12 relative z-10" strokeWidth={5} />
                </div>
                <h3 className="text-3xl font-bold text-[#1E293B] font-sans tracking-tight mb-3">Thanh toán thành công</h3>
                <p className="text-[#64748B] text-base font-medium">
                  Bạn đã đăng ký thành công gói <strong>{order?.subscriptionPlanName || "Pro"}</strong>
                </p>
              </div>

              {/* Main Details Box */}
              <div className="bg-[#F8FAFC] rounded-[1.5rem] border border-gray-100 w-full p-6 sm:p-8 space-y-6">

                {/* Top Plan Badge */}
                <div 
                  className="rounded-[1.25rem] p-5 flex flex-col relative overflow-hidden shadow-sm"
                  style={{
                    backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.18) 1.5px, transparent 1.5px), linear-gradient(135deg, var(--color-primary-300,#6e96ef), var(--color-primary-500,#034ce4) 55%, var(--color-primary-800,#012474))`,
                    backgroundSize: '18px 18px, 100% 100%'
                  }}
                >
                  <div className="relative z-10 mb-3">
                    <p className="text-white/80 text-[11px] uppercase tracking-widest font-bold mb-1">Tổng tiền thanh toán</p>
                    <div className="flex justify-between items-center">
                      <p className="font-black text-white text-3xl sm:text-4xl font-sans tracking-tight leading-none">
                        {formatCurrency(order?.amount || 0)}
                      </p>
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[var(--color-primary-500,#034ce4)] shrink-0 shadow-md">
                        <Check className="w-5 h-5" strokeWidth={4} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative z-10 border-t border-white/20 pt-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white font-bold text-base">Gói: {order?.subscriptionPlanName || "Gói Pro"}</span>
                    </div>
                    <p className="text-white/80 text-xs font-medium">Hiệu lực từ {formatDate(order?.createdAt)}</p>
                  </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-2">
                  <div>
                    <p className="text-[#94A3B8] text-[10px] uppercase tracking-wider font-bold mb-1">Mã tham chiếu</p>
                    <p className="font-bold text-[#1E293B] text-sm font-mono">{(order?.gatewayOrderCode || orderCode) + "REF"}</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8] text-[10px] uppercase tracking-wider font-bold mb-1">Mã giao dịch</p>
                    <p className="font-bold text-[#1E293B] text-sm font-mono">{order?.gatewayOrderCode || orderCode}</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8] text-[10px] uppercase tracking-wider font-bold mb-1">Phương thức</p>
                    <p className="font-bold text-[#1E293B] text-sm">Chuyển khoản (QR)</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8] text-[10px] uppercase tracking-wider font-bold mb-1">Thời gian</p>
                    <p className="font-bold text-[#1E293B] text-sm">{formatDate(order?.createdAt)}</p>
                  </div>
                </div>


              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 mt-8">
                <Link
                  href="/dashboard/profile?tab=transactions"
                  className="w-full py-3.5 rounded-[var(--radius-md,8px)] bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-gray-600" /> Xem chi tiết
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full py-3.5 rounded-[var(--radius-md,8px)] bg-[var(--color-primary-500,#034ce4)] hover:bg-[var(--color-primary-600,#0240c0)] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 opacity-80" /> Về trang chủ
                </Link>
              </div>
            </div>
          ) : isCancelled ? (
            <div className="flex flex-col w-full max-w-md mx-auto">
              {/* Top part: Glowing Red Icon and Title */}
              <div className="flex flex-col items-center pb-10 text-center mt-6">
                <div className="w-24 h-24 rounded-full bg-[#EF4444] text-white flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.4)] mb-8 animate-elastic-pop relative">
                   <div className="absolute inset-0 rounded-full bg-[#EF4444]/20 scale-125" />
                   <XCircle className="w-12 h-12 relative z-10" strokeWidth={3} />
                </div>
                <h3 className="text-3xl font-bold text-[#1E293B] font-sans tracking-tight mb-3">Thanh toán thất bại</h3>
                <p className="text-[#64748B] text-base font-medium">
                  Giao dịch của bạn đã bị huỷ hoặc có lỗi xảy ra.
                </p>
              </div>


              {/* Actions */}
              <div className="flex flex-col gap-3 mt-8">
                <Link
                  href="/dashboard"
                  className="w-full py-3.5 rounded-[var(--radius-md,8px)] bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 opacity-80" /> Thử lại thanh toán
                </Link>
                <Link
                  href="/dashboard/profile?tab=transactions"
                  className="w-full py-3.5 rounded-[var(--radius-md,8px)] bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-gray-600" /> Xem lịch sử đơn hàng
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-[var(--radius-md,8px)] bg-blue-50 border border-blue-200">
                <Clock className="w-7 h-7 text-[var(--color-primary-500,#034ce4)] shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-blue-950 font-sans">Đang xử lý đơn hàng</h4>
                  <p className="text-xs text-blue-800 mt-0.5">
                    Đơn hàng <strong>#{order?.gatewayOrderCode || orderCode}</strong> đang ở trạng thái chờ phản hồi từ cổng thanh toán.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 rounded-[var(--radius-md,8px)] bg-[var(--color-primary-500,#034ce4)] text-white font-bold text-sm flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Kiểm tra lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
