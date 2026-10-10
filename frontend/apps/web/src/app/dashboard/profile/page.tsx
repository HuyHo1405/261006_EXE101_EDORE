"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Shield,
  CreditCard,
  Settings,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Save,
  RefreshCw,
  BookOpen,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Lock,
  Moon,
  Globe,
  Sliders,
  Edit2,
  X,
} from "lucide-react";
import { UserAvatar } from "@/components/layout/Header/UserAvatar";
import { userService } from "@/features/user/api/userService";
import { subscriptionService } from "@/features/subscription/api/subscriptionService";
import {
  UserProfileResponse,
  UserSettingsResponse,
  SubscriptionStatusResponseDTO,
  SubscriptionPlanDTO,
  OrderResponseDTO,
  PaymentResponseDTO,
  PageResponseDTO,
} from "@edore/types";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

type TabKey = "profile" | "transactions" | "settings";

function UserProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authUser = useAuthStore((s) => s.user);

  const initialTab = (searchParams?.get("tab") as TabKey) || "profile";
  const [activeTab, setActiveTab] = useState<TabKey>(
    ["profile", "transactions", "settings"].includes(initialTab) ? initialTab : "profile"
  );

  // State
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [settings, setSettings] = useState<UserSettingsResponse | null>(null);
  const [subStatus, setSubStatus] = useState<SubscriptionStatusResponseDTO | null>(null);
  const [ordersPage, setOrdersPage] = useState<PageResponseDTO<OrderResponseDTO> | null>(null);
  const [paymentsPage, setPaymentsPage] = useState<PageResponseDTO<PaymentResponseDTO> | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlanDTO[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

  // Loaders & Sub-states
  const [loading, setLoading] = useState<boolean>(true);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDTO | null>(null);

  // Form state
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profData, setDataSettings, statusData, myOrders, myPayments, activePlans] = await Promise.all([
          userService.getOwnProfile().catch(() => null),
          userService.getUserSettings().catch(() => null),
          subscriptionService.getMySubscriptionStatus().catch(() => null),
          subscriptionService.getMyOrders(0, 20).catch(() => null),
          subscriptionService.getMyPayments(0, 20).catch(() => null),
          subscriptionService.getActivePlans().catch(() => []),
        ]);

        if (profData) {
          setProfile(profData);
          setFullName(profData.fullName || "");
          setPhone(profData.phone || "");
        } else if (authUser) {
          setFullName(authUser.name || "");
        }

        if (setDataSettings) setSettings(setDataSettings);
        if (statusData) setSubStatus(statusData);
        if (myOrders) setOrdersPage(myOrders);
        if (myPayments) setPaymentsPage(myPayments);
        if (activePlans) setPlans(activePlans);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authUser]);

  const handleUpgradeToPro = async () => {
    const proPlan = plans.find((p) => 
      p.name?.toLowerCase().includes("pro") || 
      (p.maxCourses && p.maxCourses > 5)
    );
    if (!proPlan) {
      alert("Không tìm thấy gói Pro. Vui lòng thử lại sau.");
      return;
    }
    try {
      setIsCheckingOut(true);
      const order = await subscriptionService.createOrder(proPlan.id);
      const payment = await subscriptionService.checkoutOrder(order.id);
      if (payment?.paymentLinkUrl) {
        window.location.href = payment.paymentLinkUrl;
      } else {
        alert("Không lấy được link thanh toán. Vui lòng thử lại.");
      }
    } catch (err: any) {
      alert(err?.message || "Đã xảy ra lỗi khi tạo đơn hàng.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setMsg(null);
      await userService.updateOwnProfile({ fullName, phone });
      setMsg({ type: "success", text: "Đã cập nhật thông tin cá nhân thành công!" });
      setIsEditingProfile(false);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Cập nhật thông tin thất bại" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleFactCheck = async (enabled: boolean) => {
    if (!settings) return;
    try {
      setSavingSettings(true);
      const updated = await userService.updateUserSettings({ enableFactCheckVerification: enabled });
      setSettings(updated);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter orders
  const filteredOrders = (ordersPage?.content || []).filter((item) => {
    if (statusFilter === "ALL") return true;
    return item.status === statusFilter;
  });

  const isPro = Boolean(
    subStatus?.planName?.toLowerCase().includes("pro") || 
    (subStatus?.maxCourses && subStatus.maxCourses > 5)
  );

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50,#fafafa)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Unified Header & Tab Navigation */}
        <div className="bg-white rounded-[var(--radius-lg,12px)] border border-gray-200 shadow-sm overflow-hidden">
          {/* Compact Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <UserAvatar
                name={profile?.fullName || authUser?.name || "E"}
                variant={isPro ? "pro" : "free"}
                size={64}
                className="shadow-sm border-2 border-white ring-2 ring-gray-50"
              />
              <div>
                <h1 className="text-2xl font-extrabold font-header text-gray-900 tracking-tight uppercase">
                  {profile?.fullName || authUser?.name || "HỒ SƠ NGƯỜI DÙNG"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-bold text-gray-500 uppercase">
                    {profile?.email || authUser?.email || "Chưa cập nhật email"}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {subStatus?.planName || "MIỄN PHÍ"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action / Vai trò */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-xs font-mono font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[var(--color-secondary-500,#f28c0f)]" />
                {profile?.role || authUser?.roles?.[0] || "USER"}
              </span>
            </div>
          </div>

          {/* Tab Navigation Menu Section */}
          <div className="bg-[var(--color-neutral-100,#f5f5f5)] p-2 flex flex-wrap gap-2 border-t border-[var(--color-neutral-200,#d9d9d9)]">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md,8px)] text-sm font-bold transition-all ${activeTab === "profile"
                ? "bg-[var(--color-primary-500,#034ce4)] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-200/60"
                }`}
            >
              <User className="w-4 h-4" /> Tổng quan tài khoản
            </button>

            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md,8px)] text-sm font-bold transition-all ${activeTab === "transactions"
                ? "bg-[var(--color-primary-500,#034ce4)] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-200/60"
                }`}
            >
              <CreditCard className="w-4 h-4" /> Lịch sử giao dịch
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md,8px)] text-sm font-bold transition-all ${activeTab === "settings"
                ? "bg-[var(--color-primary-500,#034ce4)] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-200/60"
                }`}
            >
              <Settings className="w-4 h-4" /> Cài đặt hệ thống
            </button>
          </div>

          {/* Tab Content Container */}
          <div className="p-6 sm:p-8 min-h-[600px]">
            {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-600">Đang tải thông tin tài khoản...</p>
            </div>
          ) : (
            <>
              {/* ── TAB 1: TỔNG QUAN TÀI KHOẢN (Thông tin + Hạn ngạch) ── */}
              {activeTab === "profile" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                  {/* Left Column: Personal Info (col-span-5) */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="border-b border-gray-100 pb-4 flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold font-header uppercase tracking-wide text-gray-900">
                          THÔNG TIN TÀI KHOẢN
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Cập nhật họ tên và số điện thoại liên hệ cá nhân.</p>
                      </div>
                      {!isEditingProfile && (
                        <button 
                          onClick={() => setIsEditingProfile(true)}
                          className="p-2 -mr-2 text-gray-400 hover:text-[var(--color-primary-500,#034ce4)] hover:bg-gray-100 rounded-full transition-colors"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {msg && (
                      <div
                        className={`p-4 rounded-[var(--radius-md,8px)] text-sm font-medium flex items-center gap-2 ${msg.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
                          }`}
                      >
                        {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                        {msg.text}
                      </div>
                    )}

                    {!isEditingProfile ? (
                      <div className="space-y-6 pt-2">
                        <div>
                          <label className="block text-[11px] font-mono uppercase font-bold text-gray-500 mb-1">
                            Họ và tên
                          </label>
                          <p className="text-sm font-semibold text-gray-900">
                            {fullName || "Chưa cập nhật"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono uppercase font-bold text-gray-500 mb-1">
                            Email
                          </label>
                          <p className="text-sm font-semibold text-gray-900">
                            {profile?.email || authUser?.email || "Chưa cập nhật"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono uppercase font-bold text-gray-500 mb-1">
                            Số điện thoại
                          </label>
                          <p className="text-sm font-semibold text-gray-900">
                            {phone || "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
                        <div>
                          <label className="block text-xs font-mono uppercase font-bold text-gray-600 mb-1">
                            Họ và tên
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Nhập họ và tên..."
                            className="w-full px-4 py-2.5 rounded-[var(--radius-sm,6px)] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500,#034ce4)] text-sm font-sans"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase font-bold text-gray-600 mb-1">
                            Email (Không thể thay đổi)
                          </label>
                          <input
                            type="email"
                            value={profile?.email || authUser?.email || ""}
                            disabled
                            className="w-full px-4 py-2.5 rounded-[var(--radius-sm,6px)] border border-gray-200 bg-gray-50 text-gray-500 text-sm font-sans cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase font-bold text-gray-600 mb-1">
                            Số điện thoại
                          </label>
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0912..."
                            className="w-full px-4 py-2.5 rounded-[var(--radius-sm,6px)] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500,#034ce4)] text-sm font-sans"
                          />
                        </div>

                        <div className="pt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingProfile(false);
                              setFullName(profile?.fullName || authUser?.name || "");
                              setPhone(profile?.phone || "");
                              setMsg(null);
                            }}
                            className="px-4 py-2.5 justify-center rounded-[var(--radius-md,8px)] border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-sm transition-all flex items-center gap-2 shadow-sm"
                          >
                            <X className="w-4 h-4" />
                            Hủy
                          </button>
                          <button
                            type="submit"
                            disabled={savingProfile}
                            className="flex-1 px-4 py-2.5 justify-center rounded-[var(--radius-md,8px)] bg-[var(--color-primary-500,#034ce4)] hover:bg-[var(--color-primary-600,#0240c0)] text-white font-bold text-sm transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                          >
                            {savingProfile ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            Lưu
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Right Column: Quotas & Limits (col-span-7) */}
                  <div className="lg:col-span-7 space-y-6 lg:pl-8 lg:border-l border-gray-100">
                    <div className="border-b border-gray-100 pb-4 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold font-header uppercase tracking-wide text-gray-900">
                          GÓI CƯỚC & HẠN NGẠCH DỊCH VỤ
                        </h3>
                        <p className="text-xs text-gray-500">
                          Chi tiết gói dịch vụ đang hoạt động và số lượng tài nguyên đã sử dụng.
                        </p>
                      </div>

                    </div>

                    {/* Active Plan Card */}
                    {isPro ? (
                      <div
                        className="shadow-md overflow-hidden rounded-[var(--radius-lg,12px)] p-5 flex flex-col justify-center relative"
                        style={{
                          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.18) 1.5px, transparent 1.5px), linear-gradient(135deg, var(--color-primary-400,#3b82f6), var(--color-primary-600,#2563eb) 55%, var(--color-primary-900,#1e3a8a))`,
                          backgroundSize: '18px 18px, 100% 100%'
                        }}
                      >
                        <h2 className="text-xl font-extrabold font-header uppercase text-white tracking-wide mb-1 relative z-10">
                          {subStatus?.planName}
                        </h2>
                        <p className="text-xs text-white/90 mb-3 max-w-sm relative z-10">
                          {subStatus?.planDescription || "Gói chuyên nghiệp với đầy đủ tính năng AI."}
                        </p>

                        <div className="flex items-center gap-4 text-xs font-mono text-white/80 border-t border-white/20 pt-2.5 relative z-10">
                          <span>Bắt đầu: {formatDate(subStatus?.startDate)}</span>
                          <span>Hạn: {subStatus?.endDate ? formatDate(subStatus.endDate) : "Vĩnh viễn"}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="shadow-sm border border-gray-200 bg-white rounded-[var(--radius-lg,12px)] p-5 flex flex-col justify-center relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-xl font-extrabold font-header uppercase text-gray-900 tracking-wide mb-1">
                              {subStatus?.planName || "GÓI MIỄN PHÍ"}
                            </h2>
                            <p className="text-xs text-gray-500 mb-3 max-w-sm">
                              {subStatus?.planDescription || "Gói cơ bản trải nghiệm tạo khóa học AI."}
                            </p>
                          </div>
                          <button 
                            onClick={handleUpgradeToPro}
                            disabled={isCheckingOut}
                            className="px-3 py-1.5 text-xs font-bold bg-[var(--color-primary-50,#eff4ff)] text-[var(--color-primary-600,#0240c0)] rounded flex items-center gap-1 hover:bg-[var(--color-primary-100,#dbeafe)] transition-colors border border-[var(--color-primary-100,#dbeafe)] disabled:opacity-50 cursor-pointer"
                          >
                            {isCheckingOut ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              "Nâng cấp"
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono text-gray-500 border-t border-gray-100 pt-2.5">
                          <span>Bắt đầu: {formatDate(subStatus?.startDate)}</span>
                          <span>Hạn: {subStatus?.endDate ? formatDate(subStatus.endDate) : "Vĩnh viễn"}</span>
                        </div>
                      </div>
                    )}

                    {/* Quotas & Limits Progress (Shortened) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Course Quota */}
                      <div className="p-4 rounded-[var(--radius-md,8px)] border border-gray-200 bg-gray-50 flex flex-col justify-center gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                            <BookOpen className="w-3.5 h-3.5 text-[var(--color-primary-500,#034ce4)]" />
                            <span>Khóa học</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[var(--color-primary-600)]">
                            {subStatus?.currentCourseCount ?? 0} / {subStatus?.maxCourses ?? "∞"}
                          </span>
                        </div>
                        {subStatus?.maxCourses && (
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[var(--color-primary-500,#034ce4)] h-full transition-all duration-500"
                              style={{ width: `${Math.min(100, ((subStatus.currentCourseCount || 0) / subStatus.maxCourses) * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Scripts per course limit */}
                      <div className="p-4 rounded-[var(--radius-md,8px)] border border-gray-200 bg-gray-50 flex flex-col justify-center gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                            <FileText className="w-3.5 h-3.5 text-[var(--color-primary-500,#034ce4)]" />
                            <span>Bài viết AI / Khóa</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[var(--color-primary-600)]">
                            {subStatus?.maxScriptsPerCourse ?? "∞"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: LỊCH SỬ GIAO DỊCH ── */}
              {activeTab === "transactions" && (
                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold font-header uppercase tracking-wide text-gray-900">
                        LỊCH SỬ GIAO DỊCH & ĐƠN HÀNG
                      </h3>
                      <p className="text-xs text-gray-500">
                        Danh sách các đơn hàng nâng cấp dịch vụ và lịch sử nạp tiền thực tế.
                      </p>
                    </div>

                    {/* Status Filter Buttons */}
                    <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-[var(--radius-md,8px)] text-xs font-semibold">
                      {["ALL", "PAID", "PENDING", "CANCELLED"].map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-[var(--radius-sm,6px)] transition-all ${statusFilter === st ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                          {st === "ALL" ? "Tất cả" : st === "PAID" ? "Thành công" : st === "PENDING" ? "Chờ xử lý" : "Đã hủy"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transactions Table */}
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 space-y-2">
                      <CreditCard className="w-10 h-10 text-gray-300 mx-auto" />
                      <p className="text-sm">Chưa ghi nhận giao dịch nào phù hợp với bộ lọc.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-[var(--radius-md,8px)] border border-gray-200">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-mono uppercase text-gray-500">
                            <th className="py-3 px-4">Mã đơn hàng</th>
                            <th className="py-3 px-4">Gói cước</th>
                            <th className="py-3 px-4">Số tiền</th>
                            <th className="py-3 px-4">Ngày tạo</th>
                            <th className="py-3 px-4">Trạng thái</th>
                            <th className="py-3 px-4 text-right">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                          {filteredOrders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-blue-50/30 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                                #{ord.gatewayOrderCode || ord.id.substring(0, 8)}
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-gray-800">
                                {ord.subscriptionPlanName}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-[var(--color-primary-500,#034ce4)]">
                                {formatCurrency(ord.amount)}
                              </td>
                              <td className="py-3.5 px-4 text-xs text-gray-600 font-sans">
                                {formatDate(ord.createdAt)}
                              </td>
                              <td className="py-3.5 px-4">
                                {ord.status === "PAID" ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> THÀNH CÔNG
                                  </span>
                                ) : ord.status === "PENDING" ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    <Clock className="w-3 h-3 text-amber-600" /> CHỜ XỬ LÝ
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                    <XCircle className="w-3 h-3 text-gray-500" /> {ord.status}
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => setSelectedOrder(ord)}
                                  className="text-xs text-[var(--color-primary-500,#034ce4)] font-bold hover:underline"
                                >
                                  Chi tiết
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 4: CÀI ĐẶT HỆ THỐNG ── */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold font-header uppercase tracking-wide text-gray-900">
                      CÀI ĐẶT & CẤU HÌNH TÙY CHỌN
                    </h3>
                    <p className="text-xs text-gray-500">Tùy chỉnh các tính năng hỗ trợ học thuật và giao diện người dùng.</p>
                  </div>

                  <div className="space-y-4 max-w-2xl">
                    {/* Toggle Fact Check */}
                    <div className="p-4 rounded-[var(--radius-md,8px)] border border-gray-200 flex items-center justify-between bg-gray-50/50">
                      <div className="space-y-0.5 pr-4">
                        <label className="text-sm font-bold text-gray-900 font-sans block">
                          Tự động Xác minh Fact-check (Fact-check Verification)
                        </label>
                        <p className="text-xs text-gray-500">
                          Tự động kiểm tra tính chính xác và tham chiếu tri thức cho bài viết được tạo từ AI.
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={savingSettings}
                        onClick={() => handleToggleFactCheck(!settings?.enableFactCheckVerification)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings?.enableFactCheckVerification ? "bg-[var(--color-primary-500,#034ce4)]" : "bg-gray-300"
                          }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings?.enableFactCheckVerification ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                      </button>
                    </div>

                    {/* Theme option */}
                    <div className="p-4 rounded-[var(--radius-md,8px)] border border-gray-200 flex items-center justify-between bg-gray-50/50">
                      <div className="space-y-0.5">
                        <label className="text-sm font-bold text-gray-900 font-sans block">
                          Giao diện nền (Theme)
                        </label>
                        <p className="text-xs text-gray-500">Mặc định theo hệ thống Edore Light/Dark mode.</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-700 bg-white px-3 py-1.5 rounded-md border border-gray-200">
                        {settings?.theme || "LIGHT (SÁNG)"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>

    {/* Modal View Order Detail */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[var(--radius-xl,16px)] max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="text-lg font-bold font-header uppercase text-gray-900">
                CHI TIẾT ĐƠN HÀNG #{selectedOrder.gatewayOrderCode || selectedOrder.id.substring(0, 8)}
              </h4>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-mono text-xs">Gói cước:</span>
                <span className="font-bold text-gray-900">{selectedOrder.subscriptionPlanName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-mono text-xs">Số tiền:</span>
                <span className="font-mono font-bold text-[var(--color-primary-500,#034ce4)]">
                  {formatCurrency(selectedOrder.amount)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-mono text-xs">Trạng thái:</span>
                <span className="font-bold text-emerald-600">{selectedOrder.status}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-mono text-xs">Ngày khởi tạo:</span>
                <span className="text-gray-700">{formatDate(selectedOrder.createdAt)}</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-[var(--radius-md,8px)] bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500 font-mono text-sm">Đang tải cấu hình người dùng...</div>}>
      <UserProfileContent />
    </Suspense>
  );
}
